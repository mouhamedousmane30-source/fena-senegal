const express = require('express');
const auth = require('../config/auth');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const SiteStats = require('../models/SiteStats');
const Notification = require('../models/Notification');
const router = express.Router();

// Middleware d'authentification et vérification admin
const adminAuth = (req, res, next) => {
 if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Droits administratifs requis.'
    });
  }
  next();
};

// GET /api/admin/stats - Statistiques générales
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ isActive: true });
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt');
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status location createdAt user')
      .populate('user', 'username email');

    // Statistiques de vues du site
    const siteStatsTotals = await SiteStats.getTotals();
    const todayStats = await SiteStats.getTodayStats();
    const last7DaysStats = await SiteStats.getStatsForPeriod(7);
    
    // Calculer les vues des 7 derniers jours
    const last7DaysPageViews = last7DaysStats.reduce((sum, stat) => sum + stat.pageViews, 0);
    const last7DaysUniqueVisitors = last7DaysStats.reduce((sum, stat) => sum + stat.uniqueVisitors, 0);

    // Nombre de notifications non lues
    const unreadNotifications = await Notification.countUnread();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalAnnouncements,
        activeAnnouncements,
        recentUsers,
        recentAnnouncements,
        // Stats de vues
        siteViews: {
          totalPageViews: siteStatsTotals.totalPageViews,
          totalUniqueVisitors: siteStatsTotals.totalUniqueVisitors,
          todayPageViews: todayStats.pageViews,
          todayUniqueVisitors: todayStats.uniqueVisitors,
          last7DaysPageViews,
          last7DaysUniqueVisitors
        },
        unreadNotifications
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques'
    });
  }
});

// GET /api/admin/users - Liste des utilisateurs avec pagination et recherche
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (page - 1) * limit;

    // Construction du filtre
    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    } else {
      filter.role = { $in: ['user', 'admin'] };
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password -passwordResetToken -passwordResetExpires');

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/users:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
});

// PUT /api/admin/users/:id/role - Modifier le rôle d'un utilisateur
router.put('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Rôle mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error('Erreur dans PUT /admin/users/:id/role:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du rôle'
    });
  }
});

// PUT /api/admin/users/:id/verify - Vérifier/déverifier un utilisateur
router.put('/users/:id/verify', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { verified },
      { returnDocument: 'after', runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: `Utilisateur ${verified ? 'vérifié' : 'non vérifié'}`,
      user
    });
  } catch (error) {
    console.error('Erreur dans PUT /admin/users/:id/verify:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification'
    });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher la suppression de soi-même
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Supprimer aussi les annonces de l'utilisateur
    await Announcement.deleteMany({ user: id });

    res.status(200).json({
      success: true,
      message: 'Utilisateur et ses annonces supprimés avec succès'
    });
  } catch (error) {
    console.error('Erreur dans DELETE /admin/users/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'utilisateur'
    });
  }
});

// GET /api/admin/announcements - Liste des annonces avec pagination et recherche
router.get('/announcements', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', category = '' } = req.query;
    const skip = (page - 1) * limit;

    // Construction du filtre
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.status = status;
    }
    if (category) {
      filter.category = category;
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username email verified name');

    const total = await Announcement.countDocuments(filter);

    res.status(200).json({
      success: true,
      announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des annonces'
    });
  }
});

// PUT /api/admin/announcements/:id/status - Modifier le statut d'une annonce
router.put('/announcements/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { status, isActive },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'username email');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statut de l\'annonce mis à jour avec succès',
      announcement
    });
  } catch (error) {
    console.error('Erreur dans PUT /admin/announcements/:id/status:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du statut'
    });
  }
});

// DELETE /api/admin/announcements/:id - Supprimer une annonce
router.delete('/announcements/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans DELETE /admin/announcements/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'annonce'
    });
  }
});

// GET /api/admin/reports - Rapports et analyses
router.get('/reports', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // période en jours
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Statistiques par période
    const newUsers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: daysAgo }
    });

    const newAnnouncements = await Announcement.countDocuments({
      createdAt: { $gte: daysAgo }
    });

    // Annonces par statut
    const announcementsByStatus = await Announcement.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Annonces par catégorie
    const announcementsByCategory = await Announcement.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Utilisateurs les plus actifs
    const topUsers = await Announcement.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo }
        }
      },
      {
        $group: {
          _id: '$user',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          username: '$userInfo.username',
          email: '$userInfo.email',
          count: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      reports: {
        period: parseInt(period),
        newUsers,
        newAnnouncements,
        announcementsByStatus,
        announcementsByCategory,
        topUsers
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/reports:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération des rapports'
    });
  }
});

// ============================================
// ROUTES POUR LES NOTIFICATIONS
// ============================================

// GET /api/admin/notifications - Récupérer les notifications
router.get('/notifications', auth, adminAuth, async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;
    
    const notifications = await Notification.getAll(userId, {
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    
    const unreadCount = await Notification.countUnread(userId);
    
    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications'
    });
  }
});

// GET /api/admin/notifications/unread-count - Compter les notifications non lues
router.get('/notifications/unread-count', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countUnread(userId);
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/notifications/unread-count:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PUT /api/admin/notifications/:id/read - Marquer une notification comme lue
router.put('/notifications/:id/read', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const notification = await Notification.markAsRead(id, userId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification marquée comme lue',
      notification
    });
  } catch (error) {
    console.error('Erreur dans PUT /admin/notifications/:id/read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// PUT /api/admin/notifications/read-all - Marquer toutes les notifications comme lues
router.put('/notifications/read-all', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    await Notification.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'Toutes les notifications ont été marquées comme lues'
    });
  } catch (error) {
    console.error('Erreur dans PUT /admin/notifications/read-all:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// DELETE /api/admin/notifications/:id - Supprimer une notification
router.delete('/notifications/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByIdAndDelete(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification non trouvée'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification supprimée'
    });
  } catch (error) {
    console.error('Erreur dans DELETE /admin/notifications/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

// ============================================
// ROUTES POUR LES STATS DE VUES DU SITE
// ============================================

// GET /api/admin/site-stats - Statistiques de vues du site
router.get('/site-stats', auth, adminAuth, async (req, res) => {
  try {
    const { period = 7 } = req.query;
    
    // Stats totales
    const totals = await SiteStats.getTotals();
    
    // Stats d'aujourd'hui
    const today = await SiteStats.getTodayStats();
    
    // Stats pour la période demandée
    const periodStats = await SiteStats.getStatsForPeriod(parseInt(period));
    
    res.status(200).json({
      success: true,
      stats: {
        totals,
        today: {
          pageViews: today.pageViews,
          uniqueVisitors: today.uniqueVisitors,
          date: today.date
        },
        period: periodStats.map(stat => ({
          date: stat.date,
          pageViews: stat.pageViews,
          uniqueVisitors: stat.uniqueVisitors
        }))
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /admin/site-stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des statistiques de vues'
    });
  }
});

module.exports = router;

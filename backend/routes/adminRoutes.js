const express = require('express');
const auth = require('../config/auth');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
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

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalAnnouncements,
        activeAnnouncements,
        recentUsers,
        recentAnnouncements
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
      { new: true, runValidators: true }
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
      { new: true, runValidators: true }
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
      { new: true, runValidators: true }
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

module.exports = router;

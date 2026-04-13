const express = require('express');
const auth = require('../config/auth');
const Announcement = require('../models/Announcement');
const router = express.Router();

// GET /api/announcements/public - Obtenir toutes les annonces publiques (sans authentification)
router.get('/public', async (req, res) => {
  try {
    const { status, location, category, limit = 20, page = 1 } = req.query;
    
    // Construction du filtre
    const filter = { isActive: true };
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (category) filter.category = category;

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v -user') // Ne pas exposer l'ID utilisateur
      .populate('user', 'username email name verified'); // Populer les infos utilisateur publiques

    res.status(200).json({
      success: true,
      announcements: announcements.map(ann => ({
        id: ann._id,
        title: ann.title,
        description: ann.description,
        status: ann.status,
        location: ann.location,
        category: ann.category,
        images: ann.images,
        contactInfo: ann.contactInfo,
        coordinates: ann.coordinates,
        date: ann.createdAt,
        views: ann.views,
        isActive: ann.isActive,
        user: ann.user ? {
          username: ann.user.username,
          email: ann.user.email,
          name: ann.user.name,
          verified: ann.user.verified
        } : null
      }))
    });
  } catch (error) {
    console.error('Erreur dans GET /announcements/public:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des annonces publiques'
    });
  }
});

// Middleware d'authentification pour les routes protégées
router.use(auth);

// POST /api/announcements - Créer une nouvelle annonce
router.post('/', async (req, res) => {
  try {
    console.log('POST /announcements - Corps de la requête reçu:', JSON.stringify(req.body, null, 2));
    
    const {
      title,
      description,
      status,
      location,
      category,
      images,
      contactInfo,
      coordinates
    } = req.body;

    console.log('Données extraites:', { title, description, status, location, category, images, contactInfo, coordinates });
    console.log('Utilisateur connecté:', req.user);

    // Validation des champs obligatoires
    if (!title || !description || !status || !location) {
      console.log('Validation échouée - champs manquants');
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, description, statut et localisation sont obligatoires'
      });
    }

    // Validation de l'utilisateur connecté
    if (!req.user || !req.user.id) {
      console.log('Utilisateur non connecté ou ID manquant');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non authentifié'
      });
    }

    // Création de l'annonce avec l'utilisateur connecté
    const newAnnouncement = new Announcement({
      title: title.trim(),
      description: description.trim(),
      status,
      location: location.trim(),
      category: category || 'autres',
      images: images || [],
      contactInfo: contactInfo || {},
      coordinates: coordinates || {},
      user: req.user.id // L'utilisateur est ajouté automatiquement
    });

    console.log('Tentative de sauvegarde de l\'annonce...');
    const savedAnnouncement = await newAnnouncement.save();
    console.log('Annonce sauvegardée avec succès:', savedAnnouncement._id);

    res.status(201).json({
      success: true,
      message: 'Annonce créée avec succès',
      announcement: {
        id: savedAnnouncement._id,
        title: savedAnnouncement.title,
        description: savedAnnouncement.description,
        status: savedAnnouncement.status,
        location: savedAnnouncement.location,
        category: savedAnnouncement.category,
        images: savedAnnouncement.images,
        contactInfo: savedAnnouncement.contactInfo,
        coordinates: savedAnnouncement.coordinates,
        date: savedAnnouncement.createdAt,
        views: savedAnnouncement.views,
        isActive: savedAnnouncement.isActive
      }
    });
  } catch (error) {
    console.error('Erreur détaillée dans POST /announcements:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Gestion des erreurs spécifiques
    let errorMessage = 'Erreur serveur lors de la création de l\'annonce';
    if (error.name === 'ValidationError') {
      errorMessage = 'Erreur de validation: ' + error.message;
    } else if (error.name === 'MongoError') {
      errorMessage = 'Erreur de base de données: ' + error.message;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/announcements/my - Obtenir les annonces de l'utilisateur connecté
router.get('/my', async (req, res) => {
  try {
    const announcements = await Announcement.find({ 
      user: req.user.id,
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .select('-__v');

    res.status(200).json({
      success: true,
      announcements: announcements.map(announcement => ({
        id: announcement._id,
        title: announcement.title,
        description: announcement.description,
        status: announcement.status,
        location: announcement.location,
        category: announcement.category,
        images: announcement.images,
        contactInfo: announcement.contactInfo,
        coordinates: announcement.coordinates,
        date: announcement.createdAt,
        views: announcement.views,
        isActive: announcement.isActive
      }))
    });
  } catch (error) {
    console.error('Erreur dans GET /announcements/my:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des annonces'
    });
  }
});

// PUT /api/announcements/:id - Mettre à jour une annonce
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Vérifier que l'annonce appartient à l'utilisateur
    const announcement = await Announcement.findOne({ 
      _id: id, 
      user: req.user.id 
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée ou accès non autorisé'
      });
    }

    // Mise à jour de l'annonce
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Annonce mise à jour avec succès',
      announcement: {
        id: updatedAnnouncement._id,
        title: updatedAnnouncement.title,
        description: updatedAnnouncement.description,
        status: updatedAnnouncement.status,
        location: updatedAnnouncement.location,
        category: updatedAnnouncement.category,
        images: updatedAnnouncement.images,
        contactInfo: updatedAnnouncement.contactInfo,
        coordinates: updatedAnnouncement.coordinates,
        date: updatedAnnouncement.createdAt,
        views: updatedAnnouncement.views,
        isActive: updatedAnnouncement.isActive
      }
    });
  } catch (error) {
    console.error('Erreur dans PUT /announcements/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de l\'annonce'
    });
  }
});

// DELETE /api/announcements/:id - Supprimer une annonce
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'annonce appartient à l'utilisateur
    const announcement = await Announcement.findOne({ 
      _id: id, 
      user: req.user.id 
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée ou accès non autorisé'
      });
    }

    // Suppression de l'annonce
    await Announcement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur dans DELETE /announcements/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de l\'annonce'
    });
  }
});

// GET /api/announcements/:id - Obtenir une annonce spécifique
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'ID d\'annonce invalide'
      });
    }

    const announcement = await Announcement.findById(id)
      .populate('user', 'username email name verified')
      .select('-__v');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Incrémenter le nombre de vues
    await Announcement.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.status(200).json({
      success: true,
      announcement: {
        id: announcement._id,
        title: announcement.title,
        description: announcement.description,
        status: announcement.status,
        location: announcement.location,
        category: announcement.category,
        images: announcement.images,
        contactInfo: announcement.contactInfo,
        coordinates: announcement.coordinates,
        date: announcement.createdAt,
        views: announcement.views + 1,
        user: announcement.user ? {
          username: announcement.user.username,
          name: announcement.user.name,
          verified: announcement.user.verified
        } : null
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /announcements/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'annonce'
    });
  }
});

module.exports = router;

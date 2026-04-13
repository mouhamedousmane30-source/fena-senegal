const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../config/auth');
const User = require('../models/User');

const router = express.Router();

// Middleware d'authentification pour toutes les routes utilisateur
router.use(auth);

// GET /api/user/profile - Obtenir le profil utilisateur
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        profileImage: user.profileImage || null,
        privacy: user.privacy || {}
      }
    });
  } catch (error) {
    console.error('Erreur dans GET /profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération du profil' 
    });
  }
});

// PUT /api/user/profile - Mettre à jour le profil utilisateur
router.put('/profile', async (req, res) => {
  try {
    const { username, email, profileImage, privacy } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }
      user.email = email.toLowerCase();
    }

    // Mettre à jour les autres champs
    if (username) user.username = username.trim();
    if (profileImage) user.profileImage = profileImage;
    if (privacy) user.privacy = { ...user.privacy, ...privacy };

    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        profileImage: user.profileImage,
        privacy: user.privacy
      }
    });
  } catch (error) {
    console.error('Erreur dans PUT /profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour du profil' 
    });
  }
});

// PUT /api/user/password - Changer le mot de passe
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe actuel et le nouveau mot de passe sont requis' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe actuel est incorrect' 
      });
    }

    // Hacher et mettre à jour le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Mot de passe mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur dans PUT /password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la mise à jour du mot de passe' 
    });
  }
});

// DELETE /api/user/account - Supprimer le compte utilisateur
router.delete('/account', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Supprimer l'utilisateur (cascade pour les données associées si configuré)
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ 
      success: true, 
      message: 'Compte supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur dans DELETE /account:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression du compte' 
    });
  }
});

module.exports = router;

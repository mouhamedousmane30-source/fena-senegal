const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

// POST /api/forgot-password - Demande de réinitialisation de mot de passe
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'adresse email est requise' 
      });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Sécurité : ne jamais révéler si l'email existe ou non
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' 
      });
    }

    // Générer un token sécurisé
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hacher le token pour le stocker en base de données
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Définir la date d'expiration (1 heure)
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Mettre à jour l'utilisateur avec le token et la date d'expiration
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Envoyer l'email de réinitialisation
    const emailSent = await sendPasswordResetEmail(user.email, resetToken);

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation' 
    });

  } catch (error) {
    console.error('Erreur dans /forgot-password:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur. Veuillez réessayer plus tard.' 
    });
  }
});

// GET /api/reset-password/:token - Vérification du token
router.get('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token de réinitialisation manquant' 
      });
    }

    // Hacher le token reçu pour le comparer avec celui en base de données
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Rechercher l'utilisateur avec le token valide et non expiré
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      });
    }

    // Token valide - renvoyer les informations de l'utilisateur (sans données sensibles)
    res.status(200).json({ 
      success: true, 
      message: 'Token valide',
      user: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Erreur dans GET /reset-password/:token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur. Veuillez réessayer plus tard.' 
    });
  }
});

// POST /api/reset-password/:token - Réinitialisation du mot de passe
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token de réinitialisation manquant' 
      });
    }

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le nouveau mot de passe est requis' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Hacher le token reçu pour le comparer avec celui en base de données
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Rechercher l'utilisateur avec le token valide et non expiré
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token invalide ou expiré' 
      });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe et supprimer le token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
    });

  } catch (error) {
    console.error('Erreur dans POST /reset-password/:token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur. Veuillez réessayer plus tard.' 
    });
  }
});

module.exports = router;

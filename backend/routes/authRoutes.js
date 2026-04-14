const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../config/auth');
const Notification = require('../models/Notification');

// --- ROUTE D'INSCRIPTION ---
router.post('/register', async (req, res) => {
  try {
    // DEBUG : Afficher exactement ce qui est reçu
    console.log("REGISTER - Données reçues:", req.body);

    const { username, firstName, lastName, email, password } = req.body;

    // ÉTAPE 1 : Validation des champs obligatoires
    if (!username || username.trim() === '') {
      return res.status(400).json({ type: 'VALIDATION_ERROR', message: "Le champ 'username' est obligatoire." });
    }
    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({ type: 'VALIDATION_ERROR', message: "Le prénom est obligatoire." });
    }
    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({ type: 'VALIDATION_ERROR', message: "Le nom est obligatoire." });
    }

    console.log(`✅ Validation OK: username="${username}", email="${email}"`);

    // ✅ ÉTAPE 2 : Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.warn(`⚠️ Email déjà utilisé: ${email}`);
      return res.status(400).json({ type: 'DUPLICATE_EMAIL', message: "Cet email est déjà utilisé à Dakar." });
    }

    console.log("✅ Email unique - Pas de doublon détecté");

    // ✅ ÉTAPE 3 : Créer l'utilisateur (le mot de passe sera haché automatiquement par le middleware pre('save'))
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const fullName = `${trimmedFirstName} ${trimmedLastName}`;
    
    const newUser = new User({ 
      username: fullName,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      name: fullName,
      email: email.toLowerCase().trim(), 
      password 
    });
    
    await newUser.save();
    console.log(`✅ Utilisateur créé dans MongoDB: ${newUser._id}`);

    // Créer une notification pour les admins
    try {
      await Notification.createUserRegisteredNotification(newUser);
      console.log('🔔 Notification créée pour le nouvel utilisateur');
    } catch (notifError) {
      console.error('Erreur lors de la création de la notification:', notifError);
      // Ne pas bloquer l'inscription si la notification échoue
    }

    // ✅ ÉTAPE 4 : Vérifier que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error("❌ ERREUR CRITIQUE : JWT_SECRET non défini dans .env");
      return res.status(500).json({ type: 'SERVER_ERROR', message: "Erreur serveur : JWT_SECRET non configuré" });
    }

    // ✅ ÉTAPE 5 : Générer un Token JWT incluant l'ID utilisateur et le rôle
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log(`✅ Token généré pour: ${newUser.username}`);
    console.log(`✅ Nouvel utilisateur inscrit avec succès: ${newUser.username} (${newUser.email})`);

    // 📤 Réponse au frontend
    res.status(201).json({ 
      token, 
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email 
      } 
    });

  } catch (err) {
    console.error("❌ CRASH SERVEUR (REGISTER):", err.message);
    console.error("Stack complète:", err.stack);
    res.status(500).json({ 
      type: 'SERVER_ERROR', 
      message: err.message 
    });
  }
});

// --- ROUTE DE CONNEXION ---
router.post('/login', async (req, res) => {
  try {
    console.log("📨 LOGIN - Données reçues:", req.body);

    const { email, password, rememberMe } = req.body;

    // ✅ ÉTAPE 1 : Validation des champs obligatoires
    if (!email || email.trim() === '') {
      return res.status(400).json({ type: 'VALIDATION_ERROR', message: "Le champ 'email' est obligatoire." });
    }
    if (!password || password.trim() === '') {
      return res.status(400).json({ type: 'VALIDATION_ERROR', message: "Le champ 'password' est obligatoire." });
    }

    console.log(`✅ Validation OK: email="${email}"`);

    // ✅ ÉTAPE 2 : Chercher l'utilisateur par email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.warn(`⚠️ Tentative de connexion avec email inexistant: ${email}`);
      return res.status(401).json({
        type: 'INVALID_CREDENTIALS',
        message: 'Adresse e-mail ou mot de passe incorrect.',
      });
    }

    console.log(`✅ Utilisateur trouvé: ${user.username}`);

    // ✅ ÉTAPE 3 : Comparer le mot de passe avec le hash stocké
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`⚠️ Mauvais mot de passe pour: ${email}`);
      return res.status(401).json({
        type: 'INVALID_CREDENTIALS',
        message: 'Adresse e-mail ou mot de passe incorrect.',
      });
    }

    console.log(`✅ Mot de passe correct pour: ${user.username}`);

    // ✅ ÉTAPE 4 : Vérifier que JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error("❌ ERREUR CRITIQUE : JWT_SECRET non défini dans .env");
      return res.status(500).json({ type: 'SERVER_ERROR', message: "Erreur serveur : JWT_SECRET non configuré" });
    }

    // ✅ ÉTAPE 5 : Durée de validité dynamique (30j si rememberMe, sinon 24h)
    const expiresIn = rememberMe ? '30d' : '24h';
    console.log(`🔐 Token généré avec rememberMe=${rememberMe}, expiresIn=${expiresIn}`);

    // ✅ ÉTAPE 6 : Générer un Token JWT incluant l'ID utilisateur et le rôle
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn }
    );

    console.log(`✅ Utilisateur connecté avec succès: ${user.username}`);

    // 📤 Réponse au frontend
    res.status(200).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      },
      rememberMe: !!rememberMe
    });

  } catch (err) {
    console.error("❌ CRASH SERVEUR (LOGIN):", err.message);
    console.error("Stack complète:", err.stack);
    res.status(500).json({ 
      type: 'SERVER_ERROR', 
      message: err.message 
    });
  }
});

// --- ROUTE /ME (PROTÉGÉE) ---
// @route   GET /api/auth/me
// @desc    Vérifier le token et renvoyer les infos de l'utilisateur actuel
router.get('/me', auth, async (req, res) => {
  try {
    // On récupère l'utilisateur par l'ID extrait du token (req.user.id ajouté par le middleware auth)
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération du profil", 
      error: err.message 
    });
  }
});

module.exports = router;
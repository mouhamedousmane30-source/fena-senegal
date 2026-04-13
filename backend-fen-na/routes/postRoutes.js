const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // On importe le modèle qu'on a créé ensemble

// @route   POST /api/posts
// @desc    Créer une nouvelle annonce (objet, personne ou animal)
router.post('/', async (req, res) => {
  try {
    // On crée une nouvelle instance de Post avec les données reçues du frontend (req.body)
    const newPost = new Post(req.body);
    
    // On sauvegarde dans MongoDB
    const savedPost = await newPost.save();
    
    // On renvoie l'objet sauvegardé au frontend pour confirmer que c'est bon
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("CRASH SERVEUR (POST):", err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// @route   GET /api/posts
// @desc    Récupérer toutes les annonces pour les afficher sur le site
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ dateSignalement: -1 }); // Les plus récents en premier
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// @route   GET /api/posts/:id
// @desc    Récupérer une seule annonce par son ID (pour la page détails)
router.get('/:id', async (req, res) => {
  try {
    // req.params.id contient l'ID qui arrive de l'URL (ex: 69d1f748...)
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: "Désolé, cette annonce n'existe plus." });
    }
    
    res.json(post);
  } catch (err) {
    // Si l'ID envoyé n'est pas au bon format, MongoDB renvoie une erreur
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
});

module.exports = router;
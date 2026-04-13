const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db.js');

// Charger les variables d'environnement
dotenv.config();

async function checkExistingAnnouncements() {
  try {
    console.log('=== Vérification des annonces existantes ===');
    
    // Attendre la connexion à la base de données
    await connectDB();
    
    // Vérifier s'il y a des annonces dans l'ancien modèle
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('Collections disponibles:', collections.map(c => c.name));
    
    // Vérifier les annonces dans le nouveau modèle
    const Announcement = require('../models/Announcement');
    const announcements = await Announcement.find({});
    
    console.log(`Nombre d'annonces dans le nouveau modèle: ${announcements.length}`);
    
    if (announcements.length > 0) {
      console.log('Détail des annonces:');
      announcements.forEach((ann, index) => {
        console.log(`${index + 1}. ID: ${ann._id}, Titre: ${ann.title}, User: ${ann.user || 'NON DEFINI'}`);
      });
    }
    
    // Vérifier s'il y a des utilisateurs
    const User = require('../models/User');
    const users = await User.find({});
    
    console.log(`Nombre d'utilisateurs: ${users.length}`);
    if (users.length > 0) {
      console.log('Utilisateurs disponibles:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user._id}, Username: ${user.username}, Email: ${user.email}`);
      });
    }
    
    // Vérifier s'il y a des annonces dans l'ancien modèle (s'il existe)
    const oldAnnouncements = await db.collection('posts').find({}).toArray();
    console.log(`Nombre d'annonces dans l'ancienne collection 'posts': ${oldAnnouncements.length}`);
    
    if (oldAnnouncements.length > 0) {
      console.log('Détail des anciennes annonces:');
      oldAnnouncements.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post._id}, Titre: ${post.title || 'Sans titre'}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkExistingAnnouncements();

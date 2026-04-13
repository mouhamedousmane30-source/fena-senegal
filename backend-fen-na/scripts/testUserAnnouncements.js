const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db.js');

// Charger les variables d'environnement
dotenv.config();

async function testUserAnnouncements() {
  try {
    console.log('=== Test des annonces utilisateur ===');
    
    // Attendre la connexion à la base de données
    await connectDB();
    
    // Charger les modèles
    const User = require('../models/User');
    const Announcement = require('../models/Announcement');
    
    // Récupérer l'utilisateur Mohamet
    const mohamet = await User.findOne({ email: 'dioufmohametousmane@gmail.com' });
    
    if (!mohamet) {
      console.log('Utilisateur Mohamet non trouvé');
      return;
    }
    
    console.log(`Test pour l'utilisateur: ${mohamet.username} (${mohamet.email})`);
    console.log(`ID de l'utilisateur: ${mohamet._id}`);
    
    // Simuler une connexion pour obtenir un token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        id: mohamet._id, 
        email: mohamet.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log(`Token JWT généré: ${token.substring(0, 50)}...`);
    
    // Vérifier les annonces de cet utilisateur
    const userAnnouncements = await Announcement.find({ 
      user: mohamet._id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    console.log(`\nAnnonces trouvées pour ${mohamet.username}: ${userAnnouncements.length}`);
    
    if (userAnnouncements.length > 0) {
      userAnnouncements.forEach((ann, index) => {
        console.log(`\n${index + 1}. Annonce:`);
        console.log(`   ID: ${ann._id}`);
        console.log(`   Titre: ${ann.title}`);
        console.log(`   Description: ${ann.description}`);
        console.log(`   Statut: ${ann.status}`);
        console.log(`   Localisation: ${ann.location}`);
        console.log(`   Catégorie: ${ann.category}`);
        console.log(`   Date: ${ann.createdAt}`);
        console.log(`   Vues: ${ann.views}`);
        console.log(`   Active: ${ann.isActive}`);
      });
    } else {
      console.log('Aucune annonce trouvée pour cet utilisateur');
    }
    
    // Simuler l'appel API comme le ferait le frontend
    console.log('\n=== Simulation de l\'appel API /announcements/my ===');
    
    const response = {
      success: true,
      announcements: userAnnouncements.map(announcement => ({
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
    };
    
    console.log('Réponse API simulée:');
    console.log(JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUserAnnouncements();

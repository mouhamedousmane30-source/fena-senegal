const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Announcement = require('../models/Announcement');

// Charger les variables d'environnement
dotenv.config();

async function createTestAnnouncement() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const mohametId = '69d2171a6f53853154910722';
    
    // Créer une annonce de test pour Mohamet
    const newAnnouncement = new Announcement({
      title: 'Annonce de test pour suppression',
      description: 'Cette annonce sert à tester la fonctionnalité de suppression',
      status: 'perdu',
      location: 'Dakar, Sénégal',
      category: 'autres',
      images: [],
      contactInfo: {
        preferredContact: 'phone'
      },
      coordinates: {},
      user: mohametId,
      views: 0,
      isActive: true
    });
    
    await newAnnouncement.save();
    
    console.log('Annonce de test créée avec succès:');
    console.log(`ID: ${newAnnouncement._id}`);
    console.log(`Titre: ${newAnnouncement.title}`);
    console.log(`Utilisateur: ${mohametId}`);
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
  }
}

createTestAnnouncement();

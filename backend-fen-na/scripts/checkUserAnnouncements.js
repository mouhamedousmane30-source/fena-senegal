const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Announcement = require('../models/Announcement');

// Charger les variables d'environnement
dotenv.config();

async function checkUserAnnouncements() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const mohametId = '69d2171a6f53853154910722';
    const announcements = await Announcement.find({ user: mohametId });
    
    console.log('Annonces de Mohamet:');
    announcements.forEach((ann, index) => {
      console.log(`${index + 1}. ID: ${ann._id}, Titre: ${ann.title}`);
    });
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
  }
}

checkUserAnnouncements();

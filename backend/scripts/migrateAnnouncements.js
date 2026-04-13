const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db.js');

// Charger les variables d'environnement
dotenv.config();

async function migrateAnnouncements() {
  try {
    console.log('=== Migration des annonces existantes ===');
    
    // Attendre la connexion à la base de données
    await connectDB();
    
    // Charger les modèles
    const User = require('../models/User');
    const Announcement = require('../models/Announcement');
    
    // Récupérer les utilisateurs existants
    const users = await User.find({});
    console.log(`Utilisateurs disponibles: ${users.length}`);
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé. Création d\'un utilisateur par défaut...');
      
      // Créer un utilisateur par défaut
      const defaultUser = new User({
        username: 'utilisateur_par_defaut',
        email: 'pardefaut@fennasenegal.sn',
        password: 'password123' // Sera haché automatiquement
      });
      
      await defaultUser.save();
      console.log('Utilisateur par défaut créé:', defaultUser.username);
      users.push(defaultUser);
    }
    
    // Utiliser le premier utilisateur comme destinataire des annonces migrées
    const targetUser = users[0];
    console.log(`Utilisateur cible pour la migration: ${targetUser.username} (${targetUser.email})`);
    
    // Récupérer les anciennes annonces de la collection 'posts'
    const db = mongoose.connection.db;
    const oldPosts = await db.collection('posts').find({}).toArray();
    
    console.log(`Annonces à migrer: ${oldPosts.length}`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const post of oldPosts) {
      try {
        // Vérifier si cette annonce a déjà été migrée
        const existingAnnouncement = await Announcement.findOne({
          title: post.title || 'Annonce sans titre',
          user: targetUser._id
        });
        
        if (existingAnnouncement) {
          console.log(`Annonce déjà migrée: ${post.title || 'Sans titre'}`);
          skippedCount++;
          continue;
        }
        
        // Créer la nouvelle annonce avec les données de l'ancienne
        const newAnnouncement = new Announcement({
          title: post.title || 'Annonce sans titre',
          description: post.description || 'Description non disponible',
          status: post.status || 'perdu',
          location: post.location || 'Localisation non spécifiée',
          category: post.category || 'autres',
          images: post.images || [],
          contactInfo: post.contactInfo || {},
          coordinates: post.coordinates || {},
          user: targetUser._id, // Associer à l'utilisateur cible
          views: post.views || 0,
          isActive: post.isActive !== false, // Par défaut actif
          createdAt: post.createdAt || new Date(),
          updatedAt: post.updatedAt || new Date()
        });
        
        await newAnnouncement.save();
        console.log(`Annonce migrée avec succès: ${newAnnouncement.title}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`Erreur lors de la migration de l'annonce ${post._id}:`, error.message);
      }
    }
    
    console.log('\n=== Résultat de la migration ===');
    console.log(`Annonces migrées: ${migratedCount}`);
    console.log(`Annonces ignorées (déjà existantes): ${skippedCount}`);
    console.log(`Total traitées: ${migratedCount + skippedCount}`);
    
    // Vérifier le résultat final
    const finalAnnouncements = await Announcement.find({ user: targetUser._id });
    console.log(`Total d'annonces pour l'utilisateur ${targetUser.username}: ${finalAnnouncements.length}`);
    
    // Afficher les annonces de l'utilisateur
    if (finalAnnouncements.length > 0) {
      console.log('\nAnnonces de l\'utilisateur:');
      finalAnnouncements.forEach((ann, index) => {
        console.log(`${index + 1}. ${ann.title} - ${ann.status} - ${ann.location}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrateAnnouncements();

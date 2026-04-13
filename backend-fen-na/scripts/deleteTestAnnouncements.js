const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Announcement = require('../models/Announcement');

// Charger les variables d'environnement
dotenv.config();

async function deleteTestAnnouncements() {
  try {
    console.log('=== Suppression des annonces de test ===');
    
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');
    
    // Critères pour identifier les annonces de test
    const testCriteria = {
      $or: [
        { title: { $regex: 'test', $options: 'i' } },
        { description: { $regex: 'test', $options: 'i' } },
        { title: 'Annonce de test pour suppression' },
        // Ajouter d'autres critères si nécessaire
      ]
    };
    
    // Compter les annonces de test
    const count = await Announcement.countDocuments(testCriteria);
    console.log(`\n📊 Annonces de test trouvées: ${count}`);
    
    if (count === 0) {
      console.log('✅ Aucune annonce de test à supprimer');
      mongoose.connection.close();
      return;
    }
    
    // Afficher les annonces qui seront supprimées
    const testAnnouncements = await Announcement.find(testCriteria).select('title description createdAt');
    console.log('\n🗑️  Annonces qui seront supprimées:');
    testAnnouncements.forEach((ann, index) => {
      console.log(`   ${index + 1}. "${ann.title}" (créée le ${ann.createdAt})`);
    });
    
    // Supprimer les annonces de test
    const result = await Announcement.deleteMany(testCriteria);
    console.log(`\n✅ ${result.deletedCount} annonce(s) de test supprimée(s)`);
    
    // Vérifier s'il reste des annonces
    const remaining = await Announcement.countDocuments();
    console.log(`📊 Annonces restantes dans la base: ${remaining}`);
    
    mongoose.connection.close();
    console.log('\n👋 Déconnecté de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

deleteTestAnnouncements();

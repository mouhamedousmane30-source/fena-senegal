const mongoose = require('mongoose');

const connectDB = async () => { // "async" car la connexion prend du temps
  try {
    // "await" dit au code : "Attends que la connexion soit établie avant de continuer"
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Si ça marche, on affiche un message de victoire dans la console
    console.log(`MongoDB Connecté : ${conn.connection.host}`);
  } catch (error) {
    // Si ça rate (mauvais mot de passe, pas d'internet...), on affiche l'erreur
    console.error(`Erreur : ${error.message}`);
    process.exit(1); // On coupe le serveur car sans base de données, il ne sert à rien
  }
};

module.exports = connectDB; // On exporte la fonction pour l'utiliser ailleurs
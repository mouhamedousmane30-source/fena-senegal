const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/fen-na-senegal')
  .then(async () => {
    console.log('Connecté à MongoDB');
    const user = await User.findOne({ email: 'dioufmohametousmane@gmail.com' });
    if (user) {
      console.log('Utilisateur trouvé:', { username: user.username, email: user.email, role: user.role });
    } else {
      console.log('Utilisateur non trouvé');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur de connexion:', err);
    process.exit(1);
  });

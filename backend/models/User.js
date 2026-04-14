const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Le nom d'utilisateur est obligatoire"],
    trim: true
  },
  firstName: {
    type: String,
    default: null,
    trim: true
  },
  lastName: {
    type: String,
    default: null,
    trim: true
  },
  name: {
    type: String,
    default: null,
    trim: true
  },
  email: {
    type: String,
    required: [true, "L'email est obligatoire"],
    unique: true, // Empêche les doublons dans la base
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est obligatoire"],
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// --- MIDDLEWARE DE SÉCURITÉ ---
// Cette fonction s'exécute AUTOMATIQUEMENT avant chaque .save()
userSchema.pre('save', async function() {
  // Si le mot de passe n'a pas été modifié (ex: simple mise à jour d'email), on passe
  if (!this.isModified('password')) return;

  try {
    // Génération du sel et hachage
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Méthode pratique pour comparer les mots de passe lors de la connexion
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
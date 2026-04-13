const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre est obligatoire"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "La description est obligatoire"],
    trim: true
  },
  status: {
    type: String,
    enum: ['perdu', 'trouvé'],
    required: [true, "Le statut est obligatoire"]
  },
  location: {
    type: String,
    required: [true, "La localisation est obligatoire"],
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['documents', 'objets', 'animaux', 'personnes', 'autres'],
    default: 'autres'
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        // Si pas de valeur ou tableau vide, c'est valide
        if (!v || !Array.isArray(v)) {
          return true;
        }
        // Vérifier la longueur maximale
        return v.length <= 5;
      },
      message: 'Maximum 5 images autorisées'
    },
    default: []
  },
  contactInfo: {
    phone: String,
    email: String,
    preferredContact: {
      type: String,
      enum: ['phone', 'email'],
      default: 'phone'
    }
  },
  // Référence à l'utilisateur qui a créé l'annonce
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Statistiques
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Coordonnées pour la carte
  coordinates: {
    lat: Number,
    lng: Number
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
announcementSchema.index({ user: 1, createdAt: -1 });
announcementSchema.index({ status: 1, isActive: 1 });
announcementSchema.index({ location: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Announcement', announcementSchema);

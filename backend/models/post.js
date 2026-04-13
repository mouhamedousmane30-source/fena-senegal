const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['objet', 'personne', 'animal']
  },
  statut: {
    type: String,
    required: true,
    enum: ['perdu', 'trouvé'],
    default: 'perdu'
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  lieu: {
    type: String, 
    required: true
  },
  dateSignalement: {
    type: Date,
    default: Date.now
  },
  // CHANGEMENT ICI : On utilise 'imageUrl' pour être raccord avec le Frontend
  imageUrl: {
    type: String,
    default: ""
  },
  contact: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Post', PostSchema);
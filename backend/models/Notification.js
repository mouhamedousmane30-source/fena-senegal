const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Type de notification
  type: {
    type: String,
    enum: ['user_registered', 'announcement_created', 'announcement_reported', 'announcement_deleted', 'user_deleted', 'system'],
    required: true
  },
  
  // Titre de la notification
  title: {
    type: String,
    required: true
  },
  
  // Message de la notification
  message: {
    type: String,
    required: true
  },
  
  // Données associées (ID d'utilisateur, d'annonce, etc.)
  data: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    announcementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    additionalInfo: mongoose.Schema.Types.Mixed
  },
  
  // Pour qui est destinée la notification (null = tous les admins)
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Statut de lecture
  isRead: {
    type: Boolean,
    default: false
  },
  
  // Priorité
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Lien pour rediriger (optionnel)
  link: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
notificationSchema.index({ isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// Méthode statique pour créer une notification
notificationSchema.statics.createNotification = async function(notificationData) {
  return await this.create(notificationData);
};

// Méthode pour marquer comme lue
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  const update = { isRead: true };
  const query = { _id: notificationId };
  
  if (userId) {
    query.$or = [{ recipient: userId }, { recipient: null }];
  }
  
  return await this.findOneAndUpdate(query, update, { returnDocument: 'after' });
};

// Méthode pour marquer toutes comme lues
notificationSchema.statics.markAllAsRead = async function(userId) {
  const query = { isRead: false };
  
  if (userId) {
    query.$or = [{ recipient: userId }, { recipient: null }];
  }
  
  return await this.updateMany(query, { isRead: true });
};

// Méthode pour obtenir les notifications non lues
notificationSchema.statics.getUnread = async function(userId, limit = 20) {
  const query = { isRead: false };
  
  if (userId) {
    query.$or = [{ recipient: userId }, { recipient: null }];
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('data.userId', 'username email')
    .populate('data.announcementId', 'title status');
};

// Méthode pour obtenir toutes les notifications
notificationSchema.statics.getAll = async function(userId, options = {}) {
  const { limit = 50, skip = 0, unreadOnly = false } = options;
  
  const query = {};
  
  if (userId) {
    query.$or = [{ recipient: userId }, { recipient: null }];
  }
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  return await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('data.userId', 'username email')
    .populate('data.announcementId', 'title status');
};

// Méthode pour compter les non lues
notificationSchema.statics.countUnread = async function(userId) {
  const query = { isRead: false };
  
  if (userId) {
    query.$or = [{ recipient: userId }, { recipient: null }];
  }
  
  return await this.countDocuments(query);
};

// Méthode pour créer des notifications automatiques
notificationSchema.statics.createUserRegisteredNotification = async function(user) {
  return await this.create({
    type: 'user_registered',
    title: 'Nouvel utilisateur inscrit',
    message: `${user.username || user.email} vient de s'inscrire sur la plateforme.`,
    data: {
      userId: user._id,
      additionalInfo: { email: user.email }
    },
    link: '/admin/users',
    priority: 'low'
  });
};

notificationSchema.statics.createAnnouncementCreatedNotification = async function(announcement, user) {
  return await this.create({
    type: 'announcement_created',
    title: 'Nouvelle annonce publiée',
    message: `${user.username || 'Un utilisateur'} a publié une annonce "${announcement.title}".`,
    data: {
      userId: user._id,
      announcementId: announcement._id,
      additionalInfo: { status: announcement.status, location: announcement.location }
    },
    link: `/admin/announcements`,
    priority: 'medium'
  });
};

notificationSchema.statics.createAnnouncementDeletedNotification = async function(announcement, deletedBy) {
  return await this.create({
    type: 'announcement_deleted',
    title: 'Annonce supprimée',
    message: `L'annonce "${announcement.title}" a été supprimée par ${deletedBy?.username || 'un admin'}.`,
    data: {
      announcementId: announcement._id,
      additionalInfo: { deletedBy: deletedBy?._id, title: announcement.title }
    },
    priority: 'high'
  });
};

notificationSchema.statics.createUserDeletedNotification = async function(user, deletedBy) {
  return await this.create({
    type: 'user_deleted',
    title: 'Utilisateur supprimé',
    message: `L'utilisateur ${user.username || user.email} a été supprimé par ${deletedBy?.username || 'un admin'}.`,
    data: {
      userId: user._id,
      additionalInfo: { deletedBy: deletedBy?._id, email: user.email }
    },
    priority: 'high'
  });
};

module.exports = mongoose.model('Notification', notificationSchema);

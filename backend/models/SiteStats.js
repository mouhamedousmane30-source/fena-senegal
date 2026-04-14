const mongoose = require('mongoose');

const siteStatsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  pageViews: {
    type: Number,
    default: 0
  },
  uniqueVisitors: {
    type: Number,
    default: 0
  },
  // Pour tracker les visiteurs uniques par jour (hash IP + User-Agent)
  visitorHashes: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
});

// Index pour les requêtes par date
siteStatsSchema.index({ date: -1 });

// Méthode statique pour obtenir ou créer les stats du jour
siteStatsSchema.statics.getTodayStats = async function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let stats = await this.findOne({ date: today });
  
  if (!stats) {
    stats = await this.create({ date: today, pageViews: 0, uniqueVisitors: 0 });
  }
  
  return stats;
};

// Méthode pour incrémenter les vues
siteStatsSchema.statics.incrementPageView = async function(visitorHash) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const update = {
    $inc: { pageViews: 1 }
  };
  
  // Si c'est un nouveau visiteur pour aujourd'hui
  if (visitorHash) {
    const stats = await this.findOne({ date: today });
    if (!stats || !stats.visitorHashes.includes(visitorHash)) {
      update.$inc.uniqueVisitors = 1;
      update.$addToSet = { visitorHashes: visitorHash };
    }
  }
  
  const result = await this.findOneAndUpdate(
    { date: today },
    update,
    { upsert: true, new: true }
  );
  
  return result;
};

// Méthode pour obtenir les stats des N derniers jours
siteStatsSchema.statics.getStatsForPeriod = async function(days) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  return await this.find({
    date: { $gte: startDate }
  }).sort({ date: -1 });
};

// Méthode pour obtenir les totaux
siteStatsSchema.statics.getTotals = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPageViews: { $sum: '$pageViews' },
        totalUniqueVisitors: { $sum: '$uniqueVisitors' }
      }
    }
  ]);
  
  return result[0] || { totalPageViews: 0, totalUniqueVisitors: 0 };
};

module.exports = mongoose.model('SiteStats', siteStatsSchema);

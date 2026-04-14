const crypto = require('crypto');
const SiteStats = require('../models/SiteStats');

// Générer un hash unique pour le visiteur basé sur IP et User-Agent
const generateVisitorHash = (req) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const data = `${ip}-${userAgent}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
};

// Middleware pour tracker les vues des pages
const trackPageView = async (req, res, next) => {
  try {
    // Ne pas tracker les requêtes API (qui commencent par /api)
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Ne pas tracker les fichiers statiques
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
    if (staticExtensions.some(ext => req.path.endsWith(ext))) {
      return next();
    }
    
    // Générer le hash du visiteur
    const visitorHash = generateVisitorHash(req);
    
    // Incrémenter les vues en arrière-plan (ne pas bloquer la requête)
    SiteStats.incrementPageView(visitorHash).catch(err => {
      console.error('Erreur lors du tracking des vues:', err);
    });
    
    next();
  } catch (error) {
    // En cas d'erreur, continuer quand même
    next();
  }
};

// Middleware pour tracker uniquement les visiteurs uniques (sans incrémenter les vues de page)
const trackUniqueVisitor = async (req, res, next) => {
  try {
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    const visitorHash = generateVisitorHash(req);
    
    // Vérifier si c'est un nouveau visiteur
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = await SiteStats.findOne({ date: today });
    
    if (!stats || !stats.visitorHashes.includes(visitorHash)) {
      // C'est un nouveau visiteur
      req.isNewVisitor = true;
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  trackPageView,
  trackUniqueVisitor,
  generateVisitorHash
};

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // 1. Récupérer le token du header Authorization
  // Le format attendu est "Bearer <TOKEN>"
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: "Accès refusé. Vous devez être connecté pour effectuer cette action." 
    });
  }

  // On extrait uniquement la partie token après "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // 2. Vérifier le token avec la clé secrète définie dans le .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Ajouter l'ID de l'utilisateur (et ses autres infos) à l'objet req
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Session expirée ou token invalide. Veuillez vous reconnecter." });
  }
};
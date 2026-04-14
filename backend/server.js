const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const { trackPageView } = require('./middleware/viewTracker.js');

dotenv.config();

// 1. Connexion à MongoDB
connectDB();

const app = express();

// 2. Middlewares cruciaux
// Tracking des vues du site (avant CORS pour capturer toutes les requêtes)
app.use(trackPageView);

// CORS configuration - Autorise localhost en dev et Vercel en production
const corsOptions = {
  origin: [
    'http://localhost:8082',
    'http://localhost:3000',
    'https://fena-senegal.vercel.app',
    process.env.FRONTEND_URL // URL personnalisée si configurée
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json()); // Permet de lire le JSON envoyé par apiClient.post()

// 3. Déclaration des routes avec le préfixe /api
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const userRoutes = require('./routes/userRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Ton ApiClient appelle "/auth/register", donc ici on ajoute le préfixe "/api"
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', passwordRoutes);
app.use('/api/user', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: "ok", message: "Serveur Feñ Na Sénégal opérationnel" });
});

// Endpoint de DEBUG - Pour vérifier que les données arrivent bien du frontend
// 🔧 Endpoint de DEBUG - Pour vérifier que les données arrivent bien du frontend
app.post('/api/debug/echo', (req, res) => {
  console.log("🔍 DEBUG ECHO - Données reçues du frontend:", req.body);
  res.status(200).json({
    received: req.body,
    message: "Les données sont bien reçues par le serveur"
  });
});

// 4. Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend lancé sur : http://localhost:${PORT}`);
});
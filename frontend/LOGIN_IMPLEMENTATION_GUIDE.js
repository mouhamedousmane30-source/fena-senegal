/**
 * GUIDE D'IMPLÉMENTATION - LOGIN & PERSISTANCE DE SESSION
 * Application MERN - Senegal FEGNENA
 * 
 * ========================================================================
 * BACKEND - Node.js/Express (port 5000)
 * ========================================================================
 */

/**
 * 1. SETUP DU BACKEND - Fichier .env
 */
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=votre_secret_jwt_tres_complexe_min_32_caracteres

/**
 * 2. INSTALLATION DES DÉPENDANCES
 */
npm install bcryptjs jsonwebtoken dotenv

/**
 * 3. STRUCTURE FICHIER backend/routes/authRoutes.js
 * (Voir le fichier: BACKEND_authRoutes_REFERENCE.js en root)
 * 
 * This includes:
 * - POST /auth/register (création utilisateur avec bcrypt)
 * - POST /auth/login (vérification email + password, signature JWT)
 * - GET /auth/me (vérification du token, retour utilisateur)
 * - POST /auth/logout (clearance côté serveur optionnel)
 */

/**
 * 4. MODÈLE USER - backend/models/User.js
 */
const userSchema = {
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hasher avant sauvegarde
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
};

/**
 * 5. CONFIGURATION dans backend/app.js ou index.js
 */
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);

/**
 * ========================================================================
 * FRONTEND - React (Vite, port 8081)
 * ========================================================================
 */

/**
 * FLUX COMPLET:
 * 
 * 1. USER SAISIT CREDENTIALS
 *    └─> Auth.tsx > handleSubmit() > login(email, password)
 *
 * 2. APPEL API
 *    └─> AuthContext.login()
 *        └─> authService.login({ email, password })
 *            └─> apiClient.post('/auth/login', data)
 *                └─> fetch('http://localhost:5000/api/auth/login')
 *
 * 3. RÉPONSE SERVEUR
 *    ┌─ Success: { token: "jwt...", user: { id, email, username } }
 *    └─ Error: { message: "Email ou mot de passe incorrect", error: "..." }
 *
 * 4. STOCKAGE TOKEN
 *    └─> apiClient.setTokens(response.token)
 *        └─> localStorage.setItem('fena_token', token)
 *        └─> apiClient.token = token
 *
 * 5. MISE À JOUR STATE
 *    └─> setUser(response.user)
 *
 * 6. REQUÊTES FUTURES
 *    └─> Chaque requête ajoute automatiquement:
 *        headers: { Authorization: 'Bearer <token>' }
 *
 * 7. RECHARGEMENT PAGE (F5)
 *    └─> AuthContext useEffect initial:
 *        ├─ Lit localStorage.getItem('fena_token')
 *        ├─ Appelle GET /auth/me avec le token
 *        ├─ Restaure la session si valide
 *        └─ Nettoie si token expiré
 */

/**
 * ========================================================================
 * POINTS CLÉS IMPLÉMENTÉS
 * ========================================================================
 */

// ✅ 1. CONFIGURATION API
// File: .env.development
// VITE_API_URL=http://localhost:5000/api

// ✅ 2. PAYLOAD LOGIN
// Envoyé: { email: "user@example.com", password: "password123" }
// Reçu: { token: "eyJhbGc...", user: { id, email, username } }

// ✅ 3. STOCKAGE TOKEN
// Location: localStorage['fena_token']
// Updated: apiClient.setTokens(token)

// ✅ 4. INJECTION TOKEN
// Header automatique: Authorization: Bearer <token>
// Code: api.client.ts ligne ~93

// ✅ 5. PERSISTANCE SESSION
// Trigger: App reload (F5)
// Process: useEffect in AuthProvider (AuthContext.tsx)
// Logic: Check localStorage -> Call /auth/me -> Restore user

// ✅ 6. GESTION ERREURS
// 401: Token invalide/expiré -> clearTokens() -> Déconnexion
// 500: Message détaillé du serveur affiché à l'utilisateur
// Logs: Console détaillée pour debug en développement

/**
 * ========================================================================
 * TESTS D'IMPLÉMENTATION
 * ========================================================================
 */

/**
 * TEST 1: INSCRIPTION
 * User: admin@test.com / Password: test123
 * Expected: Token généré + User créé + Redirection /declarer
 * Console: [AUTH] Nouvel utilisateur créé: admin@test.com
 */

/**
 * TEST 2: CONNEXION
 * User: admin@test.com / Password: test123
 * Expected: Token généré + Session restaurée + Redirection /declarer
 * Console: [AUTH] Utilisateur connecté: admin@test.com
 */

/**
 * TEST 3: PERSISTANCE SESSION
 * Steps:
 * 1. Login avec admin@test.com
 * 2. Appuyez F5 (reload page)
 * Expected: Utilisateur toujours connecté, pas de redirection vers /auth
 * Console: [AUTH] Session restaurée pour: admin@test.com
 */

/**
 * TEST 4: ERREUR LOGIN
 * User: admin@test.com / Password: wrongpassword
 * Expected: Message d'erreur moderne affiché
 * Console: DÉTAIL ERREUR BACKEND (LOGIN): { status: 401, message: "..." }
 */

/**
 * TEST 5: HEADER AUTHORIZATION
 * Steps:
 * 1. Login
 * 2. Ouvrir DevTools > Network > Onglet Console
 * 3. Vérifier: Authorization: Bearer eyJhbGc...
 * Expected: Header présent sur toutes les requêtes /api/*
 */

/**
 * ========================================================================
 * DÉPANNAGE
 * ========================================================================
 */

/**
 * PROBLÈME: "Token manquant" ou 401 systématique
 * SOLUTION: 
 * 1. Vérifier .env.development VITE_API_URL correct
 * 2. Console: Voir "[API] POST /auth/login" avec Authorization header
 * 3. Backend: Vérifier JWT_SECRET en .env
 */

/**
 * PROBLÈME: Session non restaurée au reload
 * SOLUTION:
 * 1. Vérifier localStorage: DevTools > Application > localStorage
 * 2. Chercher clé 'fena_token'
 * 3. Console: Voir "[AUTH] Initialisation - Token trouvé: true"
 * 4. GET /auth/me doit retourner user valide
 */

/**
 * PROBLÈME: "Email ou mot de passe incorrect" mais credentials valides
 * SOLUTION:
 * 1. Vérifier backend reçoit bien { email, password }
 * 2. Vérifier bcrypt.compare() dans route login
 * 3. Vérifier User.findOne({ email }) retourne bien l'utilisateur
 */

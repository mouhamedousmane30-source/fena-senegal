# 🚀 Guide de Déploiement - Feñ Na Sénégal

## 📋 Table des matières
1. [Prérequis](#prérequis)
2. [Configuration MongoDB Atlas](#configuration-mongodb-atlas)
3. [Déploiement Backend (Render)](#déploiement-backend-render)
4. [Déploiement Frontend (Vercel)](#déploiement-frontend-vercel)
5. [Variables d'environnement](#variables-denvironnement)
6. [Vérification post-déploiement](#vérification-post-déploiement)

---

## 🔧 Prérequis

### Comptes nécessaires (gratuits)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Base de données
- [Render](https://render.com) - Backend (Web Service gratuit)
- [Vercel](https://vercel.com) - Frontend (hébergement gratuit)
- [GitHub](https://github.com) - Déjà fait ✅

---

## 🗄️ Configuration MongoDB Atlas

### Étape 1 : Créer un cluster
1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Créez un compte ou connectez-vous
3. Cliquez **"Create a New Cluster"**
4. Choisissez le tier **M0 (Gratuit)**
5. Région : `Africa (Johannesburg)` ou `Europe (Frankfurt)`
6. Cliquez **"Create Cluster"** (attendre 1-3 minutes)

### Étape 2 : Configurer l'accès
1. Dans **Database Access** → **Add New Database User**
   - Username : `fena_admin`
   - Password : Générez un mot de passe sécurisé
   - Privileges : **Read and Write to any database**
   - Sauvegardez ce mot de passe !

2. Dans **Network Access** → **Add IP Address**
   - Cliquez **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Confirmez

### Étape 3 : Obtenir l'URI de connexion
1. Allez dans **Clusters** → Cliquez **"Connect"**
2. Choisissez **"Connect your application"**
3. Driver : **Node.js**
4. Copiez l'URI (remplacez `<password>` par votre mot de passe)

```
mongodb+srv://fena_admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/fena_db?retryWrites=true&w=majority
```

---

## 🔧 Configuration Backend (Render)

### Étape 1 : Préparer le backend
1. Créez un fichier `backend/.env.production` :

```env
PORT=10000
MONGODB_URI=mongodb+srv://fena_admin:VOTRE_MOT_DE_PASSE@cluster0.xxxxx.mongodb.net/fena_db?retryWrites=true&w=majority
JWT_SECRET=votre_secret_jwt_complexe_min_32_caracteres
NODE_ENV=production
```

2. Créez un fichier `backend/render.yaml` :

```yaml
services:
  - type: web
    name: fena-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false  # À configurer manuellement sur Render
      - key: JWT_SECRET
        sync: false  # À configurer manuellement sur Render
```

### Étape 2 : Déployer sur Render
1. Allez sur [Render Dashboard](https://dashboard.render.com)
2. Cliquez **"New +"** → **"Web Service"**
3. Connectez votre compte GitHub
4. Choisissez le repository `fena-senegal`
5. Configurez :
   - **Name** : `fena-backend`
   - **Root Directory** : `backend`
   - **Runtime** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `node server.js`
   - **Plan** : `Free`

6. Cliquez **"Advanced"** et ajoutez les variables d'environnement :
   - `MONGODB_URI` : Votre URI MongoDB
   - `JWT_SECRET` : Un secret complexe (min 32 caractères)
   - `NODE_ENV` : `production`

7. Cliquez **"Create Web Service"**

### Étape 3 : Noter l'URL
Une fois déployé, Render donne une URL comme :
```
https://fena-backend.onrender.com
```

**Copiez cette URL** pour le frontend.

---

## 🌐 Configuration Frontend (Vercel)

### Étape 1 : Préparer le frontend
1. Créez un fichier `frontend/.env.production` :

```env
VITE_API_URL=https://fena-backend.onrender.com/api
```

2. Modifiez `frontend/vite.config.ts` pour ajouter la configuration de build :

```typescript
export default defineConfig({
  // ... config existante
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### Étape 2 : Déployer sur Vercel
**Option A - Interface Web :**
1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Cliquez **"Add New Project"**
3. Importez votre repository GitHub `fena-senegal`
4. Configurez :
   - **Framework Preset** : `Vite`
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

5. Dans **Environment Variables**, ajoutez :
   - `VITE_API_URL` : `https://fena-backend.onrender.com/api`

6. Cliquez **"Deploy"**

**Option B - CLI (plus rapide) :**
```bash
# Installer Vercel CLI
npm i -g vercel

# Dans le dossier frontend
cd frontend
vercel

# Suivez les instructions :
# - Login avec Vercel
# - Set up and deploy
# - Link to existing project ou créer nouveau
```

### Étape 3 : Noter l'URL
Vercel donne une URL comme :
```
https://fena-senegal.vercel.app
```

---

## 📊 Variables d'environnement Récapitulatif

### Backend (Render)
| Variable | Valeur | Description |
|----------|--------|-------------|
| `PORT` | `10000` | Port du serveur |
| `MONGODB_URI` | `mongodb+srv://...` | URI MongoDB Atlas |
| `JWT_SECRET` | `votre_secret_32+_chars` | Clé JWT |
| `NODE_ENV` | `production` | Mode production |

### Frontend (Vercel)
| Variable | Valeur | Description |
|----------|--------|-------------|
| `VITE_API_URL` | `https://fena-backend.onrender.com/api` | URL API backend |

---

## 🔒 Sécurité - IMPORTANT

### ❌ Ne jamais commiter ces fichiers
```
.env
.env.local
.env.production
backend/.env*
frontend/.env*
```

Ils sont déjà dans `.gitignore` ✅

### ✅ Bonnes pratiques
1. Utilisez des mots de passe forts pour MongoDB
2. JWT_SECRET doit être long et aléatoire
3. Activez 2FA sur tous les comptes (MongoDB, Render, Vercel)
4. Ne partagez jamais vos clés privées

---

## ✅ Vérification post-déploiement

### Tester le Backend
```bash
# Test de santé
curl https://fena-backend.onrender.com/api/health

# Test connexion MongoDB (via une route qui utilise la DB)
```

### Tester le Frontend
1. Allez sur `https://fena-senegal.vercel.app`
2. Vérifiez que la page charge
3. Testez une fonctionnalité qui appelle le backend (ex: liste des annonces)

### Tester l'Admin
1. Allez sur `https://fena-senegal.vercel.app/admin`
2. Connectez-vous avec vos identifiants admin
3. Vérifiez que les données s'affichent

---

## 🛠️ Dépannage courant

### Problème : "Cannot connect to MongoDB"
- ✅ Vérifiez l'URI dans Render (password correct ?)
- ✅ Vérifiez Network Access dans MongoDB Atlas (0.0.0.0/0)
- ✅ Vérifiez que l'IP de Render n'est pas bloquée

### Problème : "API not found" sur le frontend
- ✅ Vérifiez `VITE_API_URL` dans Vercel
- ✅ Vérifiez que le backend est bien déployé et en ligne
- ✅ Vérifiez CORS dans le backend (doit autoriser l'URL Vercel)

### Problème : Images non chargées
- ✅ Vérifiez que les uploads sont configurés côté backend
- ✅ Sur Render, le filesystem est éphémère - utilisez Cloudinary pour les images en production

---

## 🔄 Mises à jour futures

Pour mettre à jour après modifications :

```bash
# Commit et push
git add .
git commit -m "Description des changements"
git push origin main

# Render et Vercel se mettront à jour automatiquement
```

---

## 📞 Besoin d'aide ?

- **Render** : [Documentation](https://render.com/docs)
- **Vercel** : [Documentation](https://vercel.com/docs)
- **MongoDB Atlas** : [Documentation](https://docs.atlas.mongodb.com/)

**Bon déploiement !** 🚀

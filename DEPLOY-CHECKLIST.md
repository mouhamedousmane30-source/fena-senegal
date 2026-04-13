# ✅ Checklist Déploiement - Feñ Na Sénégal

## Étape 1 : MongoDB Atlas (5 min)
- [ ] Créer compte sur [mongodb.com/atlas](https://mongodb.com/atlas)
- [ ] Créer cluster M0 (Gratuit)
- [ ] Créer utilisateur base de données
- [ ] Autoriser accès IP : `0.0.0.0/0`
- [ ] Copier l'URI de connexion

## Étape 2 : Backend sur Render (10 min)
- [ ] Aller sur [render.com](https://render.com)
- [ ] Connecter GitHub
- [ ] New Web Service → Repository `fena-senegal`
- [ ] Configurer :
  - Name : `fena-backend`
  - Root Directory : `backend`
  - Build : `npm install`
  - Start : `node server.js`
- [ ] Ajouter variables d'environnement :
  - `MONGODB_URI` = URI MongoDB
  - `JWT_SECRET` = secret_aléatoire_32+_caractères
  - `NODE_ENV` = `production`
- [ ] Deploy
- [ ] Noter l'URL : `https://fena-backend.onrender.com`

## Étape 3 : Frontend sur Vercel (5 min)
- [ ] Aller sur [vercel.com](https://vercel.com)
- [ ] Import GitHub → `fena-senegal`
- [ ] Configurer :
  - Framework : `Vite`
  - Root Directory : `frontend`
  - Build : `npm run build`
- [ ] Variable d'environnement :
  - `VITE_API_URL` = `https://fena-backend.onrender.com/api`
- [ ] Deploy

## Étape 4 : Vérification (2 min)
- [ ] Ouvrir frontend Vercel
- [ ] Vérifier que les annonces chargent
- [ ] Tester login admin
- [ ] Vérifier `/admin` fonctionne

---

## 🔧 URLs attendues après déploiement

| Service | URL exemple |
|---------|-------------|
| Frontend | `https://fena-senegal.vercel.app` |
| Backend | `https://fena-backend.onrender.com` |
| API | `https://fena-backend.onrender.com/api` |
| Admin | `https://fena-senegal.vercel.app/admin` |

---

## ⚠️ Problèmes courants

### ❌ "Cannot connect to database"
→ Vérifier MONGODB_URI dans Render

### ❌ "CORS error"
→ Vérifier que l'URL Vercel est dans `server.js` CORS config

### ❌ "Page 404"
→ Vérifier `vercel.json` pour le SPA routing

---

## 📝 Commandes de test

```bash
# Tester backend
curl https://fena-backend.onrender.com/api/health

# Vérifier variables d'environnement
echo $MONGODB_URI
echo $VITE_API_URL
```

---

**Temps total estimé : ~20-30 minutes** ⏱️

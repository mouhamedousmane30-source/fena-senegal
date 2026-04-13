# Feñ Na Sénégal

Plateforme communautaire sénégalaise pour signaler et retrouver les personnes, objets et animaux perdus.

## 🌍 À propos

**Feñ Na** ("Retrouver" en wolof) est la première plateforme 100% gratuite dédiée aux déclarations d'objets perdus et trouvés au Sénégal.

## 🏗️ Architecture

Ce projet est organisé en deux parties :

```
Feñ Na Sénégal/
├── fe-na-connect/     # Frontend (React + TypeScript + Tailwind)
├── backend-fen-na/    # Backend (Node.js + Express + MongoDB)
└── README.md
```

### Frontend
- **Framework** : React 18 avec TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Routing** : React Router
- **Animations** : Framer Motion
- **Icons** : Lucide React

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB (Mongoose)
- **Authentification** : JWT
- **Upload** : Multer

## 🚀 Installation

### Prérequis
- Node.js (v18+)
- MongoDB

### Frontend
```bash
cd fe-na-connect
npm install
npm run dev
```

### Backend
```bash
cd backend-fen-na
npm install
# Créer un fichier .env avec :
# - MONGODB_URI
# - JWT_SECRET
# - PORT
npm run dev
```

## ✨ Fonctionnalités

- 📝 Déclarer un objet perdu ou trouvé
- 🔍 Rechercher par catégorie, ville, date
- 💬 Contact direct via WhatsApp/Téléphone
- 👤 Système d'utilisateurs avec vérification
- 🔒 Administration sécurisée
- 📱 Interface responsive

## 🛡️ Sécurité

- Authentification JWT
- Mots de passe hashés (bcrypt)
- Protection des routes admin
- Validation des données

## 📞 Contact

- Email : dioufmohametousmane@gmail.com
- Téléphone : +221 77 46 49 835
- Instagram : [@30mohamet](https://www.instagram.com/30mohamet/)

---

© 2026 Feñ Na Sénégal. Tous droits réservés.

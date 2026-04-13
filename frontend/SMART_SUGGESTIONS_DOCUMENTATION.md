# Fonctionnalité de Suggestions Intelligentes d'Annonces

## 📋 Vue d'ensemble

Une nouvelle fonctionnalité a été intégrée dans la page de déclaration (Declare) pour suggérer automatiquement des annonces similaires qui pourraient correspondre à celle que l'utilisateur est en train de créer.

## ⚙️ Fonctionnement technique

### Algorithme de matching

L'algorithme utilise une approche multi-critères avec **distance de Levenshtein** pour comparer les annonces :

#### Critères de comparaison et poids :
- **Titre** : 40% du score
- **Description** : 30% du score
- **Type d'objet** : 20% du score
- **Localisation** : 10% du score

### Inversement du statut

- **Utilisateur déclare PERDU** → Suggestions des annonces TROUVÉES correspondantes
- **Utilisateur déclare TROUVÉ** → Suggestions des annonces PERDUES correspondantes

### Filtrage et affichage

- **Résultats** : Limité à 5 annonces maximum
- **Score minimum** : 25% de similarité (paramètre `minSimilarity`)
- **Ordre** : Classement par pertinence décroissante
- **Affichage** : Actif dès que l'utilisateur a rempli :
  - Le titre
  - La description  
  - (Optionnel) Localisation sur le plan

## 🎨 Composants implémentés

### 1. Module `lib/matching.ts`

Fonctions utilitaires pour le calcul de similarité :

```typescript
- normalizeText()        // Normalise le texte
- levenshteinDistance()  // Calcule la distance entre chaînes
- stringSimilarity()     // Score de similarité 0-1
- extractKeywords()      // Extrait mots-clés
- calculateAnnouncementSimilarity()  // Compare deux annonces
- findSimilarAnnouncements()         // Trouve les 5 meilleures correspondances
- getMatchedMessage()               // Génère le message approprié
```

### 2. Composant `components/SimilarAnnouncementsSuggestion.tsx`

Interface visuelle pour afficher les suggestions :

**Caractéristiques :**
- Badge affichant le pourcentage de pertinence
- Visuel avec couleur adaptée au statut (rouge pour PERDU, vert pour TROUVÉ)
- Image, titre, description tronquées
- Boutons d'action :
  - **Contacter** : Copie le contact dans le presse-papiers
  - **Voir** : Navigue vers l'annonce détaillée
- Message informatif expliquant la suggestion

### 3. Page mise à jour `pages/Declare.tsx`

Intégration de la fonctionnalité :

**Changements :**
- Ajoute `useMemo` pour calcul optimisé des suggestions
- Recalcul en temps réel lors de changements du titre, description, type, statut, localisation
- Affichage du composant `SimilarAnnouncementsSuggestion` quand des correspondances sont trouvées

## 📊 Exemple de fonctionnement

### Scénario 1 : PERDU → TROUVÉ

Utilisateur crée une annonce :
- **Status** : J'ai perdu
- **Type** : Objet
- **Titre** : "Téléphone Samsung Galaxy A54"
- **Description** : "Perdu dans un taxi entre Médina et Plateau. Coque bleue."

Suggestions affichées :
- Annonces existantes avec **Status TROUVÉ** et correspondances similaires
- Message : "✨ Une annonce de quelque chose de trouvé peut correspondre à votre recherche!"

### Scénario 2 : TROUVÉ → PERDU

Utilisateur crée une annonce :
- **Status** : J'ai trouvé
- **Type** : Objet
- **Titre** : "Sac à dos noir Nike"
- **Description** : "Trouvé près de la gare routière. Contient des cahiers."

Suggestions affichées :
- Annonces existantes avec **Status PERDU** et correspondances similaires
- Message : "🔍 Une personne qui cherche pourrait être intéressée par cet objet!"

## 🚀 Fonctionnalités bonus implémentées

✅ **Limitation à 3-5 annonces** : Limité à 5 pour éviter la surcharge
✅ **Tri par pertinence** : Algorithme Levenshtein + critères multiples
✅ **Bouton Contacter** : Copie le contact automtiquement
✅ **Bouton Voir** : Navigation vers la fiche annonce
✅ **Pourcentage pertinence** : Affichage du score de similarité
✅ **Design moderne** : Cartes avec hover effects, couleurs adaptées
✅ **Responsive** : Fonctionne sur desktop et mobile

## 📁 Fichiers créés/modifiés

### Créés :
- `src/lib/matching.ts` (407 lignes)
- `src/components/SimilarAnnouncementsSuggestion.tsx` (149 lignes)

### Modifiés :
- `src/pages/Declare.tsx` (ajout imports, state, logique suggestions, affichage composant)

## 🔍 Cas d'usage réels

1. **Personne qui a perdu un objet** → Voit les objets trouvés correspondants
2. **Personne qui a trouvé un objet** → Voit les déclarations de perte correspondantes
3. **Exactitude améliorée** → Algorithme de similarité réduit les faux positifs
4. **UX intuitive** → Messages contextuels en français

## ⚡ Performance

- **Calcul optimisé** : Utilisation de `useMemo()` pour éviter les recalculs inutiles
- **Max 5 résultats** : Requête rapide même avec 1000+ annonces
- **Pas de réseau** : Tout se fait côté client (données mock)

## 🎯 Améliorations futures possibles

- [ ] Connexion à un backend pour stockage persistant des annonces
- [ ] Notifications quand une correspondance est trouvée
- [ ] Filtrage par gamme de dates
- [ ] Recherche par localisation dans un rayon (ex: 5km)
- [ ] Partage de annonces via WhatsApp/Email
- [ ] Machine Learning pour améliorer le matching

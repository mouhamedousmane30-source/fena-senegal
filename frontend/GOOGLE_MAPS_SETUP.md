# 🗺️ Guide d'intégration de Google Maps

## Vue d'ensemble
L'application utilise maintenant **Google Maps** pour permettre aux utilisateurs de sélectionner précisément l'endroit où un objet a été perdu ou trouvé.

## Fonctionnalités

### 1. **Sélection Interactive sur la Carte**
   - Les utilisateurs peuvent cliquer sur la carte pour sélectionner un endroit
   - Un marqueur draggable permet de fine-tuner la position
   - Les coordonnées (latitude/longitude) sont stockées avec chaque annonce

### 2. **Reverse Geocoding**
   - L'adresse complète est automatiquement récupérée à partir des coordonnées
   - Format: "Rue/Ville, Pays" ou coordonnées si l'adresse n'est pas disponible

### 3. **Confirmation Visuelle**
   - La localisation sélectionnée s'affiche avec l'adresse complète
   - Les coordonnées GPS sont affichées pour référence

## Configuration

### Étape 1: Obtenir une clé API Google Maps

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez les APIs suivantes:
   - **Maps JavaScript API**
   - **Geocoding API**
4. Créez une clé API (Application credentials)
5. Restreignez la clé aux domaines de votre application pour la sécurité

### Étape 2: Configurer la clé dans l'application

1. Ouvrez le fichier `.env.local` à la racine du projet
2. Remplacez `YOUR_GOOGLE_MAPS_API_KEY_HERE` par votre clé API:
   ```
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...votre_clé...
   ```
3. Sauvegardez le fichier
4. Redémarrez le serveur de développement

## Structure du Code

### Composant MapPicker (`src/components/MapPicker.tsx`)
- Gère l'initialisation de la carte
- Gère les interactions utilisateur (clic, drag du marqueur)
- Effectue le reverse geocoding pour obtenir l'adresse
- Émet les données de localisation sélectionnées

### Page Declare (`src/pages/Declare.tsx`)
- Utilise le composant MapPicker
- Stocke les coordonnées avec l'annonce
- Affiche la localisation sélectionnée

### Types de Données (`src/lib/data.ts`)
```typescript
interface Announcement {
  // ... autres champs ...
  location: string;        // Adresse/nom du lieu
  latitude?: number;       // Latitude GPS
  longitude?: number;      // Longitude GPS
}
```

## Utilisation

### Création d'une annonce
1. L'utilisateur accède à la page "Créer une déclaration"
2. Il remplit le formulaire (titre, description, etc.)
3. **Dans la section "Localisation":**
   - La carte Google Maps s'affiche
   - L'utilisateur peut:
     - **Cliquer** sur la carte pour sélectionner un endroit
     - **Dragguer** le marqueur pour affiner la position
   - La localisation précise est affichée automatiquement
4. L'utilisateur valide et publie l'annonce

## Variables d'Environnement

Le fichier `.env.local` contient:

```env
# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/
# Enable these APIs in your Google Cloud project:
# - Maps JavaScript API
# - Geocoding API
VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
```

**Note:** `.env.local` est ignoré par Git (voir `.gitignore`) pour des raisons de sécurité.

## Sécurité

### Points importants:
1. **Ne pas commiter `.env.local`** - C'est un fichier local contenant votre clé API
2. **Restreindre votre clé API** dans Google Cloud Console:
   - Par domaine HTTP Referrer
   - Par IP (pour les appels backend si applicable)
3. **Régénérer la clé** si elle est exposée publiquement

## Dépendances Ajoutées

- `@googlemaps/js-api-loader` - Gestionnaire de chargement de Google Maps API
- `@types/google.maps` - Définitions TypeScript pour Google Maps

## Déploiement

Lors du déploiement en production:

1. **Définir la variable d'environnement** sur votre plateforme de déploiement:
   ```
   VITE_GOOGLE_MAPS_API_KEY=votre_clé_api_production
   ```

2. **Restreindre votre clé API** aux domaines de production dans Google Cloud Console

3. **Vérifier que la clé fonctionne** avec les APIs activées:
   - Maps JavaScript API
   - Geocoding API

## Dépannage

### La carte ne s'affiche pas
- Vérifiez que la clé API est correcte dans `.env.local`
- Assurez-vous que les APIs Google Maps sont activées dans Google Cloud Console
- Vérifiez la console du navigateur pour les erreurs

### L'adresse ne s'affiche pas
- Cela peut être normal dans certaines zones rurales
- Les coordonnées GPS seront affichées à la place

### Erreur "API key not valid"
- Vérifiez la clé dans `.env.local`
- Assurez-vous que le fichier a été sauvegardé et que le serveur a redémarré

## Support

Pour toute question sur Google Maps API, consultez:
- [Documentation officielle Google Maps API](https://developers.google.com/maps/documentation)
- [Geocoding API Reference](https://developers.google.com/maps/documentation/geocoding)

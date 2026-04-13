# 🏗️ Architecture détaillée - Feñ Na Sénégal Backend-Ready

## 📁 Structure du projet après refactor

```
fe-na-connect/
├── src/
│   ├── services/                    ← 🆕 COUCHE API
│   │   ├── api.config.ts           ← Config, ApiError, constantes
│   │   ├── api.client.ts           ← HTTP client avec interceptors
│   │   ├── auth.service.ts         ← Endpoints auth
│   │   ├── announcement.service.ts ← Endpoints annonces
│   │   ├── user.service.ts         ← Endpoints utilisateur
│   │   └── index.ts                ← Exports centralisés
│   │
│   ├── hooks/
│   │   ├── use-toast.ts            (existant)
│   │   ├── use-mobile.tsx          (existant)
│   │   └── useApi.ts               ← 🆕 Hook pour API calls
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         ← ✏️ AMÉLIORÉ avec API
│   │
│   ├── components/
│   │   ├── LoadingSpinner.tsx      ← 🆕 Spinner inline + fullscreen
│   │   ├── ErrorMessage.tsx        ← 🆕 Messages d'erreur
│   │   ├── ProtectedRoute.tsx      ← ✏️ AMÉLIORÉ avec rôles
│   │   ├── AnnouncementCard.tsx    (existant)
│   │   ├── Layout.tsx              (existant)
│   │   ├── Navbar.tsx              (existant)
│   │   ├── Footer.tsx              (existant)
│   │   ├── MapPicker.tsx           (existant)
│   │   └── ui/                     (existant - shadcn components)
│   │
│   ├── pages/
│   │   ├── Auth.tsx                (À intégrer avec services)
│   │   ├── Declare.tsx             (Déjà intégré suggestions)
│   │   ├── Listings.tsx            (À intégrer avec API)
│   │   ├── Detail.tsx              (À intégrer avec API)
│   │   ├── Account.tsx             (À intégrer avec API)
│   │   ├── Index.tsx               (existant)
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── data.ts                 ← MOCK_ANNOUNCEMENTS (fallback)
│   │   ├── matching.ts             (suggestions intelligentes)
│   │   └── utils.ts                (existant)
│   │
│   ├── App.tsx                     (routes + AuthProvider)
│   ├── main.tsx                    (entry point)
│   └── vite-env.d.ts
│
├── public/
│   ├── robots.txt
│   └── images/                     (assets)
│
├── .env.development                ← 🆕 Config dev
├── .env.production                 ← 🆕 Config prod
├── .env.example                    ← 🆕 Template env
│
├── BACKEND_READY_CHECKLIST.md      ← 🆕 Guide complet
├── BACKEND_INTEGRATION_GUIDE.md    ← 🆕 Endpoints + exemples
├── INTEGRATION_EXAMPLES.md         ← 🆕 4 exemples d'intégration
├── SMART_SUGGESTIONS_DOCUMENTATION.md (suggestions)
│
├── vite.config.ts                  (existant)
├── tailwind.config.ts              (existant)
├── tsconfig.json                   (existant)
├── package.json                    (existant)
├── eslint.config.js                (existant)
└── playwright.config.ts            (existant)
```

## 🔄 Flux de données

### 1️⃣ Authentification

```
User (Login Form)
     ↓
[Email, Password]
     ↓
useAuth.login()
     ↓
authService.login()
     ↓
apiClient.post('/auth/login')
     ↓
Backend API
     ↓
{token, refreshToken, user}
     ↓
apiClient.setTokens()
     ↓
updateUser state
     ↓
Redirect -> App
```

### 2️⃣ API Calls avec gestion d'erreurs

```
Component
     ↓
useApi(apiCall)
     ↓
{ execute, isLoading, error, data }
     ↓
execute()
     ↓
apiClient.request()
     ↓
Add token header
     ↓
Fetch request
     ↓
Response?
├─ 2xx → Parse JSON → return
├─ 401 → Refresh token
│   ├─ Success → Retry original
│   └─ Fail → logout()
└─ Other → throw ApiError
```

### 3️⃣ File Upload (Images)

```
File input
     ↓
FormData {
  type, title, description,
  images[0], images[1], ...
}
     ↓
announcementService.createAnnouncement()
     ↓
apiClient.post('/announcements', formData)
     ↓
Add Authorization header
     ↓
Fetch with Content-Type: multipart/form-data
     ↓
Backend processes upload
     ↓
Returns announcement with image URLs
```

## 🔐 Sécurité

### Token Flow

```
1. LOGIN
   Backend generates:
   - JWT token (exp: 2h)
   - refresh token (exp: 7d)
   
   Frontend stores in localStorage:
   - feñ_na_token
   - feñ_na_refresh_token

2. EVERY REQUEST
   Header: Authorization: Bearer <token>

3. TOKEN EXPIRED (401)
   - POST /auth/refresh (+ refresh token)
   - Get new token
   - Retry original request
   - If refresh fails → logout

4. LOGOUT
   - POST /auth/logout (optional)
   - Clear localStorage
   - Clear API client
   - Redirect to login
```

### Protected Routes

```
<ProtectedRoute>              ← Any user
  <Declare />
</ProtectedRoute>

<ProtectedRoute requiredRole="admin">  ← Admin only
  <AdminDashboard />
</ProtectedRoute>

Non-authenticated → Redirect to /auth?redirect=...
Wrong role → Show "Access Denied"
Token expired → Auto refresh + continue
```

## 🧩 Composants et Hooks

### LoadingSpinner

```typescript
<LoadingSpinner />
<LoadingSpinner size="lg" />
<LoadingSpinner fullScreen label="Chargement..." />
<InlineLoader label="Chargement..." />

// Vs old way:
// <div>Chargement...</div>
```

### ErrorMessage

```typescript
<ErrorMessage 
  type="error" 
  title="Erreur"
  message="Description..."
  onDismiss={() => {}}
  action={{ label: "Réessayer", onClick: () => {} }}
/>

// Types: error | warning | info | success

<FormError message={fieldError} />
```

### useApi Hook

```typescript
const { execute, isLoading, error, data, reset } = useApi(
  () => service.method(),
  { onSuccess, onError }
);

// Usage:
try {
  await execute(payload);
} catch (err) {
  console.log(err.message);
}
```

## 📊 API Call Cycle

```
┌─ Component Mount
│
├─ useApi(apiCall)
│  ├─ state: isLoading, error, data
│  └─ fn: execute, reset
│
├─ useEffect(() => { execute() })
│
├─ During call:
│  ├─ isLoading = true
│  ├─ error = null
│  └─ UI shows spinner
│
├─ Request completes:
│  ├─ isLoading = false
│  ├─ data = response
│  ├─ error = null
│  └─ UI shows data
│
└─ On error:
   ├─ isLoading = false
   ├─ error = ApiError
   ├─ data = null
   └─ UI shows error message
```

## 🎯 Patterns standards

### ✅ DO: Utiliser les services

```typescript
// ✅ BON
const { execute: fetchAnnouncements } = useApi(
  () => announcementService.getAnnouncements()
);

// ✅ BON - avec hook
const { login } = useAuth();
await login(email, password);
```

### ❌ DON'T: Appels API directs

```typescript
// ❌ MAUVAIS - pas de structure
const response = await fetch('/announcements');

// ❌ MAUVAIS - pas de gestion d'erreur
apiClient.get('/announcements');

// ❌ MAUVAIS - pas de loading state
await authService.login(email, password);
```

## 🔌 Points d'intégration backend

### 1. Environnement
Ajouter `.env.development` ou `.env.production`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Services
Chaque service define les types et endpoints:
```typescript
// auth.service.ts
export async function login(data: LoginRequest): Promise<AuthResponse>

// announcement.service.ts
export async function getAnnouncements(params?): Promise<AnnouncementListResponse>
```

### 3. Composants
Composants utilisent les services:
```typescript
const { execute: fetchArticles } = useApi(() =>
  announcementService.getAnnouncements()
);
```

### 4. Backend implémente endpoints
Match exact des types retournés.

## 🚀 Déploiement

### Frontend (Vercel)
```bash
npm run build
# Deploy 'dist' folder
# Environment: VITE_API_URL=https://api.production.com/api
```

### Backend
Besoin endpoints listés dans `BACKEND_INTEGRATION_GUIDE.md`

### CORS Configuration
Backend must allow:
```
Access-Control-Allow-Origin: https://fena-senegal.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 📈 Next Steps

1. Backend DevOps: Setup Node.js/Python/Go server
2. Database: PostgreSQL/MongoDB/MySQL
3. Auth: Implement JWT generation/validation
4. Testing: Unit + Integration tests
5. Monitoring: Error tracking (Sentry)
6. Optimization: Caching, CDN

---

**La plateforme est maintenant 100% prête pour l'intégration d'un vrai backend! 🎉**

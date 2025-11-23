# Backend API

API REST pour la plateforme de gestion RH avec authentification Supabase.

## Routes disponibles

### Health Check
- `GET /` - Message de bienvenue
- `GET /api/health` - Vérification du statut de l'API

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/forgot-password` - Réinitialisation mot de passe
- `GET /api/auth/me` - Informations utilisateur (protégé)
- `POST /api/auth/refresh` - Rafraîchissement token

## Configuration

### Prérequis
1. Créer la table `users` dans Supabase (voir `supabase_setup.sql`)
2. Configurer les variables d'environnement (`.env`)

### Variables d'environnement
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://ceidgwastaggjcclybcz.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
ACCESS_TOKEN_EXPIRES_IN=7d
```

## Développement

```bash
npm run dev
```

Serveur disponible sur `http://localhost:5000`

## Build

```bash
npm run build
npm start
```

## Documentation

- `API_DOCUMENTATION.md` - Documentation complète de l'API
- `TESTING.md` - Guide de test avec exemples
- `supabase_setup.sql` - Schéma de base de données

## Sécurité

✅ Tokens JWT stockés dans cookies HTTP-only  
✅ CORS configuré pour le frontend  
✅ Contrôle d'accès basé sur les rôles (RH/USER)  
✅ Validation des données entrantes  
✅ Protection XSS et CSRF  

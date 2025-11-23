# Plateforme de Gestion des Formations et Documents RH

## 📋 Vue d'ensemble

Plateforme web intuitive permettant au service RH de gérer le cycle de vie complet des formations internes et des documents de l'entreprise.

### Profils Utilisateurs

- **👨‍💼 Administrateur RH** : Accès complet pour créer, modifier, supprimer formations et documents
- **👤 Collaborateurs** : Accès en lecture aux formations assignées, consultation des documents, réponse aux questionnaires de satisfaction

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 14+ (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS v4
- **UI Components** : shadcn/ui
- **Animations** : Framer Motion
- **Base de données** : Supabase Client

### Backend
- **Runtime** : Node.js
- **Framework** : Express
- **Langage** : TypeScript
- **Base de données** : Supabase
- **Authentication** : Supabase Auth

## 📁 Structure du Projet

```
digitalisation_rh/
├── frontend/              # Application Next.js
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Composants React
│   │   └── lib/          # Utilities & configurations
│   ├── public/           # Assets statiques
│   └── package.json
│
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── routes/       # Routes API
│   │   ├── controllers/  # Logique métier
│   │   ├── models/       # Modèles de données
│   │   ├── middleware/   # Middlewares
│   │   └── index.ts      # Point d'entrée
│   ├── dist/             # Build TypeScript
│   └── package.json
│
└── .github/
    └── copilot-instructions.md
```

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet

```bash
git clone <repository-url>
cd digitalisation_rh
```

### 2. Configuration Frontend

```bash
cd frontend
npm install

# Créer le fichier .env.local
cp .env.example .env.local
```

Éditer `.env.local` avec vos credentials Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Configuration Backend

```bash
cd ../backend
npm install

# Créer le fichier .env
cp .env.example .env
```

Éditer `.env` avec vos credentials :

```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

## 🏃‍♂️ Lancer l'application

### Développement

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
```
Le backend démarre sur `http://localhost:5000`

**Terminal 2 - Frontend** :
```bash
cd frontend
npm run dev
```
Le frontend démarre sur `http://localhost:3000`

### Production

**Backend** :
```bash
cd backend
npm run build
npm start
```

**Frontend** :
```bash
cd frontend
npm run build
npm start
```

## 📦 Scripts Disponibles

### Frontend
- `npm run dev` - Démarre le serveur de développement
- `npm run build` - Build pour la production
- `npm start` - Démarre le serveur de production
- `npm run lint` - Vérifie le code avec ESLint

### Backend
- `npm run dev` - Démarre le serveur avec nodemon (hot reload)
- `npm run build` - Compile TypeScript vers JavaScript
- `npm start` - Démarre le serveur compilé

## 🎨 Composants UI (shadcn/ui)

Pour ajouter des composants shadcn/ui :

```bash
cd frontend
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
# etc...
```

## 🗄️ Configuration Supabase

### Tables à créer

1. **users** - Gestion des utilisateurs
2. **trainings** - Formations
3. **documents** - Documents RH
4. **training_assignments** - Assignations de formations
5. **satisfaction_surveys** - Questionnaires de satisfaction

Consultez la documentation Supabase pour créer vos tables et configurer les Row Level Security (RLS) policies.

## 🔐 Authentification

L'authentification est gérée par Supabase Auth. Les utilisateurs peuvent :
- Se connecter avec email/mot de passe
- Réinitialiser leur mot de passe
- Gérer leur profil

## 📚 Prochaines Étapes

1. ✅ Configuration du projet terminée
2. ⏳ Création des modèles de données Supabase
3. ⏳ Développement des pages frontend
4. ⏳ Développement des API endpoints
5. ⏳ Implémentation de l'authentification
6. ⏳ Création des interfaces administrateur
7. ⏳ Création des interfaces collaborateur
8. ⏳ Tests et déploiement

## 🤝 Contribution

Ce projet est en développement actif. Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue.

## 📄 License

ISC

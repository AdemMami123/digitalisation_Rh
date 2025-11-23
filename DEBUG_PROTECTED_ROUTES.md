# 🔍 Guide de Débogage - Problème de Redirection Login

## Problème
Lorsque vous naviguez vers `/dashboard/formations`, vous êtes redirigé vers `/login`.

## ✅ Corrections Appliquées

### 1. Amélioration du composant ProtectedRoute
- Ajout d'un état `isChecking` pour éviter les redirections prématurées
- Meilleure gestion du cycle de vie de l'authentification
- Affichage du loader pendant la vérification complète

### 2. Ajout de logs de débogage
- Logs dans `AuthContext.checkAuth()` pour tracer l'authentification

## 🧪 Comment Déboguer

### Étape 1 : Vérifier que le backend fonctionne

```powershell
# Dans le terminal backend
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Server running on port 5000
```

Testez l'endpoint health:
```powershell
curl http://localhost:5000/api/health
```

### Étape 2 : Vérifier que le frontend fonctionne

```powershell
# Dans le terminal frontend
cd frontend
npm run dev
```

Vous devriez voir :
```
Local: http://localhost:3000
```

### Étape 3 : Ouvrir la console du navigateur

1. Connectez-vous à votre compte
2. Ouvrez les DevTools (F12)
3. Allez dans l'onglet **Console**
4. Essayez de naviguer vers `/dashboard/formations`

**Logs attendus** :
```
[AuthContext] Checking authentication...
[AuthContext] Auth response: { success: true, user: {...} }
[AuthContext] User authenticated: votre.email@exemple.com
[AuthContext] Auth check completed
```

**Si vous voyez** :
```
[AuthContext] Auth check failed: Error: ...
```

→ Le problème vient de l'API `/api/auth/me`

### Étape 4 : Vérifier les cookies

1. Dans DevTools, allez dans **Application** (ou **Storage**)
2. Dans le menu de gauche, cliquez sur **Cookies**
3. Sélectionnez `http://localhost:3000`
4. Vérifiez qu'il y a un cookie `access_token`

**Si le cookie est absent** :
- Déconnectez-vous
- Reconnectez-vous
- Vérifiez à nouveau

### Étape 5 : Tester l'endpoint /api/auth/me manuellement

Ouvrez la console du navigateur et tapez :

```javascript
fetch('http://localhost:5000/api/auth/me', {
  credentials: 'include'
})
  .then(res => res.json())
  .then(data => console.log('Auth check:', data))
  .catch(err => console.error('Auth error:', err));
```

**Réponse attendue** :
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "...",
    "role": "RH",
    "full_name": "..."
  }
}
```

**Si erreur 401** :
- Le cookie n'est pas envoyé ou est invalide
- Reconnectez-vous

**Si erreur CORS** :
- Vérifiez que le backend a bien `credentials: true` dans CORS
- Vérifiez que l'origin est `http://localhost:3000`

## 🔧 Solutions aux Problèmes Courants

### Problème 1 : Cookie non envoyé

**Cause** : Le frontend et le backend ne sont pas sur le même domaine en développement.

**Solution** : Vérifiez dans `frontend/.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Et dans `backend/.env` :
```
FRONTEND_URL=http://localhost:3000
```

### Problème 2 : CORS bloque les requêtes

**Vérifiez** `backend/src/index.ts` :
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Problème 3 : Token expiré

**Solution** : Déconnectez-vous et reconnectez-vous.

Le token JWT expire après 7 jours.

### Problème 4 : Le composant ProtectedRoute redirige trop vite

**Déjà corrigé** dans cette version ! Le composant attend maintenant que `isChecking` soit false.

### Problème 5 : L'AuthProvider ne charge pas

**Vérifiez** `frontend/src/app/layout.tsx` :
```tsx
<AuthProvider>{children}</AuthProvider>
```

## 🎯 Test Rapide

Après avoir appliqué les corrections, testez cette séquence :

1. ✅ Allez sur `http://localhost:3000/login`
2. ✅ Connectez-vous avec votre compte RH
3. ✅ Vous devriez être redirigé vers `/dashboard`
4. ✅ Dans l'URL, tapez manuellement `/dashboard/formations`
5. ✅ Vous devriez voir la page "Gestion des Formations"
6. ✅ Le bouton "Nouvelle Formation" doit être visible

**Si ça ne fonctionne pas** :
- Ouvrez la console (F12)
- Copiez tous les logs qui commencent par `[AuthContext]`
- Partagez-les pour analyse

## 📞 Checklist de Débogage

- [ ] Backend démarré sur port 5000
- [ ] Frontend démarré sur port 3000
- [ ] Connecté avec succès (redirigé vers /dashboard)
- [ ] Cookie `access_token` présent dans Application > Cookies
- [ ] Logs `[AuthContext]` montrent "User authenticated"
- [ ] Aucune erreur CORS dans la console
- [ ] Endpoint /api/auth/me retourne success: true
- [ ] Navigation vers /dashboard/formations fonctionne

Si tous les points sont cochés et que ça ne fonctionne toujours pas, le problème est ailleurs.

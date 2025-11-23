# 🔍 Guide de Débogage - Reset Password

## Étapes de débogage

### 1️⃣ Vérifier le template email dans Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **Authentication → Email Templates → Reset Password**
4. Vérifiez que le template contient :
   ```html
   <a href="{{ .ConfirmationURL }}">Reset Password</a>
   ```
5. ❌ **N'utilisez PAS** :
   ```html
   <a href="{{ .SiteURL }}/reset-password?token={{ .Token }}">Reset Password</a>
   ```

### 2️⃣ Vérifier la Site URL

1. **Settings → API → Site URL**
2. Doit être exactement : `http://localhost:3000` (sans slash à la fin)
3. Sauvegardez les changements

### 3️⃣ Vérifier les Redirect URLs

1. **Authentication → URL Configuration**
2. Ajoutez dans **Redirect URLs** :
   ```
   http://localhost:3000/**
   ```

### 4️⃣ Tester l'envoi d'email

1. Démarrez votre application :
   ```powershell
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Allez sur http://localhost:3000/forgot-password
3. Entrez un email valide d'un compte existant
4. Cliquez sur "Envoyer le lien"

### 5️⃣ Inspecter l'email reçu

1. Ouvrez l'email (vérifiez les spams)
2. **NE CLIQUEZ PAS** sur le lien tout de suite
3. Faites un clic droit sur le bouton → "Copier l'adresse du lien"
4. Collez le lien dans un éditeur de texte
5. Vérifiez qu'il ressemble à :
   ```
   http://localhost:3000/reset-password?access_token=eyJhbG...&type=recovery
   ```
   OU
   ```
   http://localhost:3000/reset-password#access_token=eyJhbG...&type=recovery
   ```

### 6️⃣ Tester avec la console ouverte

1. Ouvrez votre navigateur (Chrome/Edge recommandé)
2. Appuyez sur **F12** pour ouvrir la console
3. Allez dans l'onglet **Console**
4. Cliquez sur le lien de l'email
5. Dans la console, vous devriez voir :
   ```
   Reset password - tokens found: {
     hasAccessToken: true,
     type: "recovery",
     fromHash: true/false,
     fromQuery: true/false
   }
   ```

### 7️⃣ Interpréter les logs

**✅ Cas normal** :
```javascript
{
  hasAccessToken: true,
  type: "recovery",
  fromHash: true,  // ou fromQuery: true
}
```
→ Le formulaire devrait s'afficher

**❌ Problème 1** :
```javascript
{
  hasAccessToken: false,
  type: null,
}
```
→ Le template email est incorrect. Utilisez `{{ .ConfirmationURL }}`

**❌ Problème 2** :
```javascript
{
  hasAccessToken: true,
  type: null,
}
```
→ Le paramètre `type=recovery` manque. Vérifiez le template email

**❌ Problème 3** :
```
Session error: { message: "Invalid token" }
```
→ Le token a expiré ou a déjà été utilisé. Demandez un nouveau lien

## 🚀 Test rapide

Copiez-collez ce code dans la console du navigateur sur la page reset-password :

```javascript
// Vérifier les query params
const urlParams = new URLSearchParams(window.location.search);
console.log('Query params:', {
  access_token: urlParams.get('access_token')?.substring(0, 20) + '...',
  type: urlParams.get('type'),
  refresh_token: urlParams.get('refresh_token')?.substring(0, 20) + '...'
});

// Vérifier le hash fragment
const hashParams = new URLSearchParams(window.location.hash.substring(1));
console.log('Hash params:', {
  access_token: hashParams.get('access_token')?.substring(0, 20) + '...',
  type: hashParams.get('type'),
  refresh_token: hashParams.get('refresh_token')?.substring(0, 20) + '...'
});
```

## ✅ Checklist de validation

- [ ] Template email utilise `{{ .ConfirmationURL }}`
- [ ] Site URL = `http://localhost:3000`
- [ ] Redirect URLs contient `http://localhost:3000/**`
- [ ] Email reçu contient un lien avec `access_token` et `type=recovery`
- [ ] Console du navigateur affiche `hasAccessToken: true` et `type: "recovery"`
- [ ] Aucune erreur "Session error" dans la console
- [ ] Le formulaire de reset s'affiche correctement

## 📞 Besoin d'aide ?

Si après ces vérifications le problème persiste :

1. Copiez les logs de la console (F12)
2. Copiez l'URL complète du lien de réinitialisation (masquez le token)
3. Vérifiez dans Supabase Dashboard → Logs → Auth Logs pour voir les erreurs côté serveur

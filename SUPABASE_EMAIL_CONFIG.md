# Configuration des Emails Supabase pour la Réinitialisation du Mot de Passe

## 🔧 Configuration Requise

Pour que la fonctionnalité "Mot de passe oublié" fonctionne correctement, vous devez configurer les templates d'email dans votre projet Supabase.

---

## 📧 Étape 1 : Accéder aux Templates Email

1. Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet : **digitalisation_rh** (ou votre projet)
3. Dans le menu latéral, allez dans : **Authentication → Email Templates**

---

## 🔑 Étape 2 : Configurer le Template "Reset Password"

### Template par défaut Supabase :

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### ✅ Template recommandé (utilisez celui-ci) :

Dans Supabase, le template doit utiliser `{{ .ConfirmationURL }}` qui génère automatiquement l'URL complète avec les tokens.

**Important** : Supabase peut placer les tokens soit dans les **query parameters** soit dans le **hash fragment** (#) de l'URL, selon votre configuration.

**Formats possibles** :
```
# Format 1 - Query parameters
http://localhost:3000/reset-password?access_token=eyJhbG...&type=recovery

# Format 2 - Hash fragment (plus sécurisé)
http://localhost:3000/reset-password#access_token=eyJhbG...&type=recovery
```

Notre code gère les deux formats automatiquement ! ✅

---

## 🎨 Étape 3 : Personnaliser le Template (Optionnel)

Vous pouvez personnaliser le template en français :

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
  
  <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte.</p>
  
  <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
      Réinitialiser mon mot de passe
    </a>
  </div>
  
  <p style="color: #666; font-size: 14px;">
    Ce lien est valide pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
  </p>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
  
  <p style="color: #999; font-size: 12px;">
    Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur :<br>
    <span style="color: #4F46E5;">{{ .ConfirmationURL }}</span>
  </p>
</div>
```

---

## ⚙️ Étape 4 : Configurer la Site URL

1. Allez dans **Settings → API**
2. Trouvez la section **Site URL**
3. Pour le développement local, utilisez : `http://localhost:3000`
4. Pour la production, utilisez votre domaine : `https://votredomaine.com`

---

## 🚫 Étape 5 : Désactiver la Confirmation Email (Optionnel)

En développement, vous pouvez désactiver la confirmation d'email pour faciliter les tests :

1. Allez dans **Authentication → Providers**
2. Cliquez sur **Email**
3. Décochez **"Confirm email"**
4. Cliquez sur **Save**

⚠️ **Important** : Réactivez cette option en production pour la sécurité !

---

## 🧪 Test de Configuration

### Test 1 : Vérifier l'envoi d'email

1. Démarrez votre application :
   ```powershell
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Allez sur `http://localhost:3000/login`
3. Cliquez sur "Mot de passe oublié ?"
4. Entrez l'email d'un compte existant
5. Vérifiez votre boîte mail (vérifiez aussi les spams)

### Test 2 : Vérifier le format du lien

L'email reçu doit contenir un lien généré par `{{ .ConfirmationURL }}`.

**Formats possibles** :

Format avec query parameters:
```
http://localhost:3000/reset-password?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
```

OU Format avec hash fragment:
```
http://localhost:3000/reset-password#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=recovery
```

✅ **Notre application gère les deux formats automatiquement !**

**Paramètres requis** :
- `access_token` : Doit être présent (dans query ou hash)
- `type=recovery` : Doit être présent (dans query ou hash)

**Important** : Ouvrez la console du navigateur (F12) après avoir cliqué sur le lien pour voir les logs de débogage qui affichent quels tokens ont été trouvés.

### Test 3 : Réinitialisation complète

1. Cliquez sur le lien de l'email
2. Vous devriez voir : "Vérification du lien..." puis le formulaire
3. Entrez un nouveau mot de passe (min 6 caractères)
4. Confirmez le mot de passe
5. Cliquez sur "Réinitialiser le mot de passe"
6. Attendez la redirection vers `/login`
7. Connectez-vous avec le nouveau mot de passe

---

## 🐛 Dépannage

### Problème : "Lien de réinitialisation invalide ou expiré"

**Causes possibles** :

1. **L'URL ne contient pas les bons paramètres**
   - ✅ Solution : Vérifiez le template email dans Supabase
   - Utilisez `{{ .ConfirmationURL }}` et non pas une construction manuelle
   - L'URL doit contenir `access_token` et `type=recovery` (dans query params OU hash fragment)
   - **Test** : Ouvrez la console du navigateur (F12) et regardez les logs qui affichent les tokens trouvés

2. **Le template email est incorrect**
   - ✅ Solution : Dans Supabase → Authentication → Email Templates → Reset Password
   - Utilisez exactement : `<a href="{{ .ConfirmationURL }}">Reset Password</a>`
   - NE PAS utiliser : `{{ .SiteURL }}/reset-password?token={{ .Token }}`

3. **Le lien a expiré**
   - ✅ Solution : Les liens Supabase expirent après 1 heure
   - Demandez un nouveau lien de réinitialisation

4. **La Site URL est incorrecte**
   - ✅ Solution : Vérifiez **Settings → API → Site URL** dans Supabase
   - Doit correspondre à votre URL frontend (ex: `http://localhost:3000`)

5. **Le token a déjà été utilisé**
   - ✅ Solution : Chaque lien ne peut être utilisé qu'une seule fois
   - Demandez un nouveau lien si nécessaire

6. **Problème de CORS ou de redirection**
   - ✅ Solution : Vérifiez **Authentication → URL Configuration** dans Supabase
   - Ajoutez `http://localhost:3000/*` dans **Redirect URLs**

### Problème : Email non reçu

**Vérifications** :

1. ✅ Vérifiez les spams/courrier indésirable
2. ✅ Vérifiez que le compte existe dans Supabase
3. ✅ Vérifiez les logs dans Supabase Dashboard → Logs
4. ✅ En développement, Supabase peut limiter l'envoi d'emails

**Solution temporaire pour le développement** :

Vous pouvez récupérer les liens de réinitialisation dans les logs Supabase :
1. Allez dans **Logs → Auth Logs**
2. Recherchez l'événement "password_recovery"
3. Le lien complet sera dans les détails de l'événement

---

## 📋 Checklist de Configuration

- [ ] Template "Reset Password" configuré dans Supabase
- [ ] Site URL définie correctement (http://localhost:3000 en dev)
- [ ] Test d'envoi d'email réussi
- [ ] Lien contient bien `access_token` et `type=recovery`
- [ ] Réinitialisation fonctionnelle de bout en bout
- [ ] (Optionnel) Template email personnalisé en français
- [ ] (Optionnel) Confirmation email désactivée pour le dev

---

## 🔗 Liens Utiles

- [Documentation Supabase - Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Documentation Supabase - Password Recovery](https://supabase.com/docs/guides/auth/passwords)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## ✅ Validation Finale

Une fois la configuration terminée, testez le flow complet :

```
1. Login → "Mot de passe oublié ?"
2. Email envoyé et reçu
3. Clic sur le lien → Formulaire affiché
4. Nouveau mot de passe → Succès
5. Redirection → Login
6. Connexion avec nouveau mot de passe → ✅
```

Si toutes les étapes fonctionnent, la configuration est complète ! 🎉

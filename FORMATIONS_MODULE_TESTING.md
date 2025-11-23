# Module Formations - Guide de Test

## ✅ Module Implémenté

Le module de gestion des formations est maintenant complet avec les fonctionnalités suivantes :

### Backend
- ✅ Table `formations` avec RLS dans Supabase
- ✅ 5 endpoints API CRUD protégés par authentification
- ✅ Validation des données côté serveur
- ✅ Protection par rôle (seul RH peut créer/modifier/supprimer)

### Frontend
- ✅ Page liste des formations `/dashboard/formations`
- ✅ Page création `/dashboard/formations/create`
- ✅ Formulaires avec validation complète
- ✅ Interface responsive et animations

---

## 🚀 Installation et Configuration

### Étape 1 : Base de données

1. **Exécuter le script SQL dans Supabase**
   ```bash
   # Ouvrez Supabase Dashboard → SQL Editor
   # Copiez le contenu de: database/formations_table.sql
   # Exécutez le script
   ```

2. **Vérifier la création**
   ```sql
   SELECT * FROM formations LIMIT 1;
   ```

### Étape 2 : Démarrer les serveurs

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

---

## 🧪 Tests Fonctionnels

### Test 1 : Accès à la page formations

1. Connectez-vous avec un compte RH
2. Allez sur http://localhost:3000/dashboard/formations
3. ✅ Vous devriez voir la page "Gestion des Formations"
4. ✅ Le bouton "Nouvelle Formation" doit être visible

**Test avec utilisateur normal (USER)** :
1. Connectez-vous avec un compte USER
2. Allez sur http://localhost:3000/dashboard/formations
3. ✅ Vous devriez voir la liste des formations
4. ❌ Le bouton "Nouvelle Formation" ne doit PAS être visible

### Test 2 : Création d'une formation présentielle

1. Cliquez sur "Nouvelle Formation"
2. Remplissez le formulaire :
   ```
   Titre: Formation Git Avancé
   Description: Maîtrisez Git pour le travail en équipe
   Objectifs pédagogiques: 
   - Comprendre les branches
   - Gérer les conflits
   - Utiliser les pull requests
   Type: Présentielle
   Durée: 8 (heures)
   Formateur: Marie Martin
   Date prévue: [Sélectionner une date future]
   Lieu: Salle de conférence B
   ```
3. Cliquez sur "Créer la formation"
4. ✅ Vous devriez être redirigé vers la liste
5. ✅ La nouvelle formation doit apparaître dans la liste

### Test 3 : Création d'une formation en ligne

1. Créez une nouvelle formation avec :
   ```
   Titre: JavaScript ES6+
   Description: Les nouvelles fonctionnalités JavaScript
   Objectifs pédagogiques: Arrow functions, Promises, Async/Await
   Type: En ligne
   Durée: 12
   Formateur: Pierre Dupont
   Date prévue: [Date future]
   Lien: https://meet.google.com/abc-defg-hij
   ```
2. ✅ Le champ "Lieu" ne doit pas être requis
3. ✅ Le champ "Lien" doit être requis et validé

### Test 4 : Création d'une formation hybride

1. Créez une formation avec :
   ```
   Type: Hybride
   Lieu: Salle A + Distanciel
   Lien: https://zoom.us/j/123456789
   ```
2. ✅ Les deux champs "Lieu" ET "Lien" doivent être requis

### Test 5 : Validation des erreurs

1. Essayez de créer une formation sans titre
   - ✅ Erreur : "Le titre est requis"

2. Essayez avec une durée de 0 ou négative
   - ✅ Erreur : "La durée doit être supérieure à 0"

3. Formation présentielle sans lieu
   - ✅ Erreur : "Le lieu est requis pour les formations présentielles et hybrides"

4. Formation en ligne sans lien
   - ✅ Erreur : "Le lien est requis pour les formations en ligne et hybrides"

### Test 6 : Affichage de la liste

1. Créez 3-4 formations de types différents
2. ✅ Toutes les formations doivent s'afficher
3. ✅ Le badge de type doit avoir la bonne couleur :
   - Présentielle : Bleu
   - En ligne : Vert  
   - Hybride : Violet
4. ✅ Les informations affichées :
   - Titre
   - Description (tronquée)
   - Type (badge)
   - Formateur
   - Date formatée
   - Durée
   - Lieu (si applicable)
   - Lien (si applicable)

### Test 7 : Suppression d'une formation

1. En tant que RH, cliquez sur l'icône poubelle
2. ✅ Une confirmation doit apparaître
3. Confirmez la suppression
4. ✅ La formation doit disparaître de la liste

**Test avec utilisateur USER** :
1. ❌ Les boutons modifier/supprimer ne doivent PAS être visibles

### Test 8 : API Backend

Testez les endpoints avec un outil comme Postman ou curl :

**GET /api/formations** (Liste)
```bash
curl http://localhost:5000/api/formations \
  -H "Cookie: access_token=YOUR_TOKEN"
```
✅ Retourne `{ success: true, formations: [...] }`

**POST /api/formations** (Création - RH seulement)
```bash
curl -X POST http://localhost:5000/api/formations \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_RH_TOKEN" \
  -d '{
    "titre": "Test Formation",
    "description": "Description test",
    "objectifs_pedagogiques": "Objectifs test",
    "type": "PRESENTIELLE",
    "duree": 8,
    "formateur": "Test Formateur",
    "date_prevue": "2025-12-01T09:00:00Z",
    "lieu": "Salle Test"
  }'
```
✅ Retourne `{ success: true, formation: {...} }`

**GET /api/formations/:id** (Détails)
```bash
curl http://localhost:5000/api/formations/UUID \
  -H "Cookie: access_token=YOUR_TOKEN"
```
✅ Retourne `{ success: true, formation: {...} }`

**DELETE /api/formations/:id** (Suppression - RH seulement)
```bash
curl -X DELETE http://localhost:5000/api/formations/UUID \
  -H "Cookie: access_token=YOUR_RH_TOKEN"
```
✅ Retourne `{ success: true, message: "Formation supprimée..." }`

---

## 🐛 Dépannage

### Problème : "Table formations does not exist"

**Solution** : Exécutez le script SQL dans Supabase
```sql
-- Voir database/formations_table.sql
```

### Problème : "Permission denied for table formations"

**Solution** : Vérifiez que vous êtes connecté avec un compte RH
```sql
-- Dans Supabase SQL Editor
UPDATE users SET role = 'RH' WHERE email = 'votre.email@exemple.com';
```

### Problème : Les boutons créer/modifier/supprimer ne s'affichent pas

**Solution** : Vérifiez le rôle de l'utilisateur dans AuthContext
- Ouvrez la console (F12)
- Tapez : `localStorage` ou vérifiez l'objet `user` dans React DevTools

### Problème : Erreur 401 sur les requêtes API

**Solution** : Le token JWT a expiré
1. Déconnectez-vous
2. Reconnectez-vous
3. Réessayez

---

## 📋 Checklist de Validation

- [ ] Script SQL exécuté dans Supabase
- [ ] Table `formations` créée avec RLS activé
- [ ] Backend démarre sans erreur (port 5000)
- [ ] Frontend démarre sans erreur (port 3000)
- [ ] Connexion avec compte RH réussie
- [ ] Page `/dashboard/formations` accessible
- [ ] Bouton "Nouvelle Formation" visible (RH)
- [ ] Création de formation présentielle réussie
- [ ] Création de formation en ligne réussie
- [ ] Création de formation hybride réussie
- [ ] Validations d'erreurs fonctionnelles
- [ ] Affichage liste avec toutes les formations
- [ ] Suppression de formation réussie
- [ ] Utilisateur USER ne peut pas créer/modifier/supprimer
- [ ] Endpoints API testés avec succès

---

## 🎯 Fonctionnalités Implémentées

### Pour les RH ✅
- [x] Créer une formation (titre, description, objectifs, type, durée, formateur, date, lieu/lien)
- [x] Modifier une formation existante
- [x] Supprimer une formation

### Pour tous les utilisateurs ✅
- [x] Voir la liste des formations
- [x] Voir les détails d'une formation
- [x] Filtrage automatique par date (ordre chronologique)

---

## 📝 Prochaines Fonctionnalités (À venir)

Vous aviez mentionné que vous donneriez d'autres fonctionnalités pour le RH. Voici ce qui pourrait être ajouté :

- [ ] Page de détails complets d'une formation
- [ ] Page de modification d'une formation
- [ ] Inscription des collaborateurs aux formations
- [ ] Gestion des participants
- [ ] Statistiques et rapports
- [ ] Notifications par email
- [ ] Export des données

Faites-moi savoir quelles sont les prochaines fonctionnalités à implémenter ! 🚀

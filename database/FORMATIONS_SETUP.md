# Guide d'Installation - Module Formations

## 📋 Étapes d'installation de la base de données

### 1. Accéder à Supabase SQL Editor

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu latéral, cliquez sur **SQL Editor**

### 2. Exécuter le script SQL

1. Cliquez sur **New Query**
2. Copiez le contenu du fichier `database/formations_table.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur **Run** pour exécuter le script

### 3. Vérifier la création

Après l'exécution, vous devriez voir :
- ✅ Table `formations` créée
- ✅ Politiques RLS (Row Level Security) appliquées
- ✅ Index créés pour les performances
- ✅ Trigger pour `updated_at` configuré

### 4. Vérifier les permissions

Le script crée automatiquement les politiques suivantes :
- **SELECT** : Tous les utilisateurs authentifiés peuvent voir les formations
- **INSERT** : Seuls les utilisateurs RH peuvent créer des formations
- **UPDATE** : Seuls les utilisateurs RH peuvent modifier des formations
- **DELETE** : Seuls les utilisateurs RH peuvent supprimer des formations

## 🧪 Tests de la base de données

### Test 1 : Vérifier la structure de la table

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'formations'
ORDER BY ordinal_position;
```

### Test 2 : Vérifier les politiques RLS

```sql
SELECT * FROM pg_policies WHERE tablename = 'formations';
```

### Test 3 : Insertion de test (en tant que RH)

```sql
INSERT INTO formations (
  titre,
  description,
  objectifs_pedagogiques,
  type,
  duree,
  formateur,
  date_prevue,
  lieu,
  created_by
) VALUES (
  'Formation React Avancé',
  'Maîtrisez les concepts avancés de React',
  'Comprendre les hooks, Context API, et optimisation des performances',
  'PRESENTIELLE',
  16,
  'Jean Dupont',
  '2025-12-01 09:00:00+00',
  'Salle de conférence A',
  auth.uid()
);
```

### Test 4 : Récupération des formations

```sql
SELECT * FROM formations ORDER BY date_prevue DESC;
```

### Test 5 : Suppression (cleanup)

```sql
DELETE FROM formations WHERE titre = 'Formation React Avancé';
```

## 🔧 Dépannage

### Problème : Erreur "permission denied for table formations"

**Solution** : Vérifiez que l'utilisateur a un rôle RH dans la table `users` :

```sql
UPDATE users SET role = 'RH' WHERE email = 'votre.email@exemple.com';
```

### Problème : Les politiques RLS bloquent les opérations

**Solution** : Vérifiez que RLS est activé ET que les politiques sont correctes :

```sql
-- Vérifier RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'formations';

-- Si rowsecurity = false
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
```

### Problème : Le trigger updated_at ne fonctionne pas

**Solution** : Recréez le trigger :

```sql
DROP TRIGGER IF EXISTS update_formations_updated_at ON formations;

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## ✅ Validation finale

Checklist après installation :
- [ ] Table `formations` visible dans **Database → Tables**
- [ ] 12 colonnes créées (id, titre, description, etc.)
- [ ] 4 politiques RLS actives
- [ ] 3 index créés (date_prevue, type, created_by)
- [ ] Trigger `update_formations_updated_at` actif
- [ ] Test d'insertion réussi (en tant que RH)
- [ ] Test de lecture réussi (tous utilisateurs)

## 📊 Structure de la table

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Identifiant unique (auto-généré) |
| titre | VARCHAR(255) | Titre de la formation |
| description | TEXT | Description détaillée |
| objectifs_pedagogiques | TEXT | Objectifs d'apprentissage |
| type | VARCHAR(20) | PRESENTIELLE, EN_LIGNE, ou HYBRIDE |
| duree | INTEGER | Durée en heures |
| formateur | VARCHAR(255) | Nom du formateur |
| date_prevue | TIMESTAMPTZ | Date et heure de la formation |
| lieu | VARCHAR(255) | Lieu (optionnel, requis pour PRESENTIELLE/HYBRIDE) |
| lien | VARCHAR(500) | Lien (optionnel, requis pour EN_LIGNE/HYBRIDE) |
| created_by | UUID | Référence à auth.users(id) |
| created_at | TIMESTAMPTZ | Date de création (auto) |
| updated_at | TIMESTAMPTZ | Date de modification (auto) |

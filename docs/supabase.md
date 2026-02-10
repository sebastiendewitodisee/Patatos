# Supabase setup (Patatos)

## Prerequis

- Creer un projet Supabase.
- Garder les secrets cote Supabase/GitHub uniquement (ne rien committer).

## Installer le schema

1. Ouvrir `SQL Editor` dans Supabase.
2. Coller le contenu de `supabase/schema.sql`.
3. Executer le script.

Le script cree 3 tables avec RLS:

- `content_posts`: posts de contenu (visibles publiquement seulement si `published = true`)
- `comments`: commentaires publics avec moderation (`is_approved`)
- `planning_items`: elements de planning publics

## Migrations

Si la base est deja initialisee, executer ensuite les migrations SQL versionnees:

1. Ouvrir `SQL Editor`.
2. Coller `supabase/migrations/001_planning_items_phase.sql`.
3. Executer le script.

Cette migration ajoute `phase_id` (et `type`) pour `planning_items`.

Exemple insert:

```sql
insert into public.planning_items (lang, phase_id, type, title, description, period, status, sort_order)
values ('fr', 'plantation', 'task', 'Preparation du sol', 'Ameublir et preparer les lignes', 'Semaine 12', 'todo', 10);
```

## Creer un compte admin

Dans `Auth > Users`, creer (ou inviter) un utilisateur admin.

Les operations d'ecriture (`insert/update/delete`) sont reservees aux users `authenticated`.

Note admin: un utilisateur `authenticated` peut aussi lire tous les drafts (`content_posts`)
et tous les commentaires non approuves (`comments`) pour moderation.

## Variables d'environnement du site

Le site lit ces variables (deja documentees dans `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

En local, creer un fichier `.env.local` a la racine et y renseigner
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` depuis `Supabase > Settings > API`.
Apres modification des variables d'environnement, redemarrer `npm run dev`.

Sans ces variables, la route `/admin` reste desactivee cote UI, sans casser le build.

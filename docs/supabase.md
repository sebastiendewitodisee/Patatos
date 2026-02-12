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
4. Coller `supabase/migrations/002_comments_edge_submit.sql`.
5. Executer le script.

Cette migration ajoute `phase_id` (et `type`) pour `planning_items`.
La migration `002` retire l'insert `anon` direct sur `comments` et ajoute la table
`comment_rate_limits` pour le cooldown cote Edge Function.

Exemple insert:

```sql
insert into public.planning_items (lang, phase_id, type, title, description, period, status, sort_order)
values ('fr', 'plantation', 'task', 'Preparation du sol', 'Ameublir et preparer les lignes', 'Semaine 12', 'todo', 10);
```

## Edge Function: submit-comment

La soumission publique de commentaire doit passer par l'Edge Function
`submit-comment` (et plus par un insert direct `anon` sur `comments`).

### Deploiement

Option CLI:

1. `supabase functions deploy submit-comment --project-ref <project_ref>`
2. Verifier que la fonction est active dans `Supabase > Edge Functions`.

Option Dashboard:

1. Creer une nouvelle function `submit-comment`.
2. Coller le code de `supabase/functions/submit-comment/index.ts`.
3. Deploy.

### Secrets (cote Supabase uniquement)

Ne jamais committer de secret. Configurer les variables cote Supabase:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Via CLI (exemple):

`supabase secrets set SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... --project-ref <project_ref>`

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

# portfolio-deploy

Dynamic GitHub Pages deployment of Mahir Azmain's portfolio frontend, powered by Supabase.

## Included
- static frontend on GitHub Pages
- dynamic data loading from Supabase for:
  - about
  - education
  - experience
  - projects
  - music
- contact form submission into Supabase `feedback`

## Supabase setup
1. Open the Supabase SQL Editor.
2. Run `supabase_setup.sql`.
3. The frontend is already configured with the current project URL and publishable key.

## Deploy
Push to `main` and GitHub Pages serves the site automatically.

## Notes
- anonymous read access is enabled for public portfolio content
- anonymous insert is enabled for `feedback`
- update/delete/admin auth is not implemented yet

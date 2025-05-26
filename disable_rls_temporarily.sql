
-- Script temporaire pour désactiver RLS et tester
-- À utiliser uniquement pour le développement !

-- Désactiver RLS complètement
ALTER TABLE public.employes DISABLE ROW LEVEL SECURITY;

-- Vérification
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'employes' AND schemaname = 'public';

SELECT 'RLS désactivé temporairement - à réactiver en production!' as warning;

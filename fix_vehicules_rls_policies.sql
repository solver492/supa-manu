
-- Activer RLS sur la table vehicules
ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can view vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Users can insert vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Users can update vehicules" ON public.vehicules;
DROP POLICY IF EXISTS "Users can delete vehicules" ON public.vehicules;

-- Politique pour la lecture (SELECT)
CREATE POLICY "Users can view vehicules" ON public.vehicules
    FOR SELECT USING (true);

-- Politique pour l'insertion (INSERT)
CREATE POLICY "Users can insert vehicules" ON public.vehicules
    FOR INSERT WITH CHECK (true);

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "Users can update vehicules" ON public.vehicules
    FOR UPDATE USING (true) WITH CHECK (true);

-- Politique pour la suppression (DELETE)
CREATE POLICY "Users can delete vehicules" ON public.vehicules
    FOR DELETE USING (true);

-- Accorder les permissions nécessaires
GRANT ALL ON public.vehicules TO authenticated;
GRANT ALL ON public.vehicules TO anon;

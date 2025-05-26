
-- Script pour corriger les politiques RLS de la table employes
-- Exécutez ce script dans votre tableau de bord Supabase (SQL Editor)

-- 1. Supprimer toutes les politiques existantes pour la table employes
DROP POLICY IF EXISTS "Users can view all employes" ON public.employes;
DROP POLICY IF EXISTS "Users can insert employes" ON public.employes;
DROP POLICY IF EXISTS "Users can update employes" ON public.employes;
DROP POLICY IF EXISTS "Users can delete employes" ON public.employes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.employes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.employes;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.employes;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.employes;

-- 2. Désactiver temporairement RLS pour la table employes
ALTER TABLE public.employes DISABLE ROW LEVEL SECURITY;

-- 3. Créer de nouvelles politiques simples et non récursives
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture (SELECT)
CREATE POLICY "employes_select_policy" ON public.employes
    FOR SELECT
    TO authenticated
    USING (true);

-- Politique pour l'insertion (INSERT)
CREATE POLICY "employes_insert_policy" ON public.employes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique pour la mise à jour (UPDATE)
CREATE POLICY "employes_update_policy" ON public.employes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique pour la suppression (DELETE)
CREATE POLICY "employes_delete_policy" ON public.employes
    FOR DELETE
    TO authenticated
    USING (true);

-- 4. Vérifier que la table a les bonnes colonnes
-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.employes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    nom VARCHAR(255) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    poste VARCHAR(100),
    equipe VARCHAR(100),
    nb_manutentionnaires_equipe INTEGER DEFAULT 1,
    disponibilite VARCHAR(50) DEFAULT 'Disponible',
    salaire_journalier DECIMAL(10,2),
    competences TEXT,
    avatar_url TEXT,
    date_embauche DATE DEFAULT CURRENT_DATE,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_employes_user_id ON public.employes(user_id);
CREATE INDEX IF NOT EXISTS idx_employes_poste ON public.employes(poste);
CREATE INDEX IF NOT EXISTS idx_employes_disponibilite ON public.employes(disponibilite);
CREATE INDEX IF NOT EXISTS idx_employes_actif ON public.employes(actif);

-- 6. Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_employes_updated_at ON public.employes;
CREATE TRIGGER update_employes_updated_at
    BEFORE UPDATE ON public.employes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insérer quelques données de test si la table est vide
INSERT INTO public.employes (nom, telephone, email, poste, equipe, nb_manutentionnaires_equipe, disponibilite, salaire_journalier, competences)
SELECT 
    'Jean Dupont',
    '06 12 34 56 78',
    'jean.dupont@email.com',
    'Chef d''équipe',
    'Équipe A',
    5,
    'Disponible',
    180.00,
    'Gestion d''équipe, conduite de camion'
WHERE NOT EXISTS (SELECT 1 FROM public.employes);

INSERT INTO public.employes (nom, telephone, email, poste, equipe, nb_manutentionnaires_equipe, disponibilite, salaire_journalier, competences)
SELECT 
    'Marie Martin',
    '06 98 76 54 32',
    'marie.martin@email.com',
    'Manutentionnaire',
    'Équipe A',
    5,
    'Disponible',
    120.00,
    'Manutention lourde, emballage'
WHERE NOT EXISTS (SELECT 1 FROM public.employes WHERE email = 'marie.martin@email.com');

-- Message de confirmation
SELECT 'Politiques RLS corrigées avec succès pour la table employes!' as status;

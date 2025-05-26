
-- Script complet pour corriger définitivement les politiques RLS
-- Exécutez ce script dans votre tableau de bord Supabase (SQL Editor)

-- 1. Désactiver complètement RLS temporairement
ALTER TABLE IF EXISTS public.employes DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les politiques existantes (même celles avec des noms différents)
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'employes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.employes', policy_record.policyname);
    END LOOP;
END $$;

-- 3. Vérifier que la table existe et la créer si nécessaire
CREATE TABLE IF NOT EXISTS public.employes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- 4. Réactiver RLS
ALTER TABLE public.employes ENABLE ROW LEVEL SECURITY;

-- 5. Créer des politiques très simples et NON récursives
-- Politique SELECT (lecture)
CREATE POLICY "employes_select_all" ON public.employes
    FOR SELECT
    TO authenticated
    USING (true);

-- Politique INSERT (création)
CREATE POLICY "employes_insert_all" ON public.employes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Politique UPDATE (modification)
CREATE POLICY "employes_update_all" ON public.employes
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Politique DELETE (suppression)
CREATE POLICY "employes_delete_all" ON public.employes
    FOR DELETE
    TO authenticated
    USING (true);

-- 6. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_employes_user_id ON public.employes(user_id);
CREATE INDEX IF NOT EXISTS idx_employes_email ON public.employes(email);
CREATE INDEX IF NOT EXISTS idx_employes_poste ON public.employes(poste);
CREATE INDEX IF NOT EXISTS idx_employes_actif ON public.employes(actif);

-- 7. Créer/Recréer le trigger pour updated_at
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

-- 8. Insérer des données de test si la table est vide
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
WHERE NOT EXISTS (SELECT 1 FROM public.employes WHERE email = 'jean.dupont@email.com');

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

-- 9. Vérification finale
SELECT 
    'Correction terminée avec succès!' as message,
    COUNT(*) as nombre_employes,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'employes' AND schemaname = 'public') as nombre_politiques
FROM public.employes;

-- 10. Afficher les politiques actives pour vérification
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'employes' AND schemaname = 'public';


-- Ajouter le champ updated_at à la table prestations s'il n'existe pas
ALTER TABLE prestations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Créer ou remplacer la fonction de mise à jour automatique du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer le trigger existant s'il existe et le recréer
DROP TRIGGER IF EXISTS update_prestations_updated_at ON prestations;
CREATE TRIGGER update_prestations_updated_at
    BEFORE UPDATE ON prestations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Mettre à jour les enregistrements existants
UPDATE prestations SET updated_at = now() WHERE updated_at IS NULL;

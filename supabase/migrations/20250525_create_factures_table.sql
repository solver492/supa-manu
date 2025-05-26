-- Create factures table
CREATE TABLE public.factures (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  client_id uuid NULL,
  prestation_id uuid NULL,
  montant numeric(10,2) NOT NULL,
  date_emission timestamp with time zone NOT NULL,
  statut text NULL DEFAULT 'non_payee',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT factures_pkey PRIMARY KEY (id),
  CONSTRAINT factures_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
  CONSTRAINT factures_prestation_id_fkey FOREIGN KEY (prestation_id) REFERENCES public.prestations(id) ON DELETE SET NULL
);

-- Add RLS (Row Level Security) policies
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON factures
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_factures_client_id ON public.factures(client_id);
CREATE INDEX IF NOT EXISTS idx_factures_prestation_id ON public.factures(prestation_id);
CREATE INDEX IF NOT EXISTS idx_factures_date_emission ON public.factures(date_emission);
CREATE INDEX IF NOT EXISTS idx_factures_statut ON public.factures(statut);

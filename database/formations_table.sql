-- Table: formations
-- Description: Stores training courses information

CREATE TABLE IF NOT EXISTS formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  objectifs_pedagogiques TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('PRESENTIELLE', 'EN_LIGNE', 'HYBRIDE')),
  duree INTEGER NOT NULL CHECK (duree > 0), -- Duration in hours
  formateur VARCHAR(255) NOT NULL,
  date_prevue TIMESTAMPTZ NOT NULL,
  lieu VARCHAR(255), -- Required for PRESENTIELLE and HYBRIDE
  lien VARCHAR(500), -- Required for EN_LIGNE and HYBRIDE
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can view formations
CREATE POLICY "Formations are viewable by authenticated users"
  ON formations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only RH users can insert formations
CREATE POLICY "Only RH can insert formations"
  ON formations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'RH'
    )
  );

-- Policy: Only RH users can update formations
CREATE POLICY "Only RH can update formations"
  ON formations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'RH'
    )
  );

-- Policy: Only RH users can delete formations
CREATE POLICY "Only RH can delete formations"
  ON formations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'RH'
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_formations_date_prevue ON formations(date_prevue);
CREATE INDEX idx_formations_type ON formations(type);
CREATE INDEX idx_formations_created_by ON formations(created_by);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE formations IS 'Stores all training courses information';
COMMENT ON COLUMN formations.type IS 'Training type: PRESENTIELLE (in-person), EN_LIGNE (online), or HYBRIDE (hybrid)';
COMMENT ON COLUMN formations.duree IS 'Training duration in hours';
COMMENT ON COLUMN formations.lieu IS 'Location for PRESENTIELLE and HYBRIDE trainings';
COMMENT ON COLUMN formations.lien IS 'Link for EN_LIGNE and HYBRIDE trainings';

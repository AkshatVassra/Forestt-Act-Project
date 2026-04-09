-- Create documents table to store uploaded files metadata
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create OCR results table
CREATE TABLE IF NOT EXISTS ocr_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  confidence DECIMAL(5, 2),
  page_count INT,
  processing_time_ms INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create extracted entities table for NER results
CREATE TABLE IF NOT EXISTS extracted_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocr_result_id UUID NOT NULL REFERENCES ocr_results(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- PERSON, ORG, GPE, DATE, AMOUNT, etc.
  entity_text TEXT NOT NULL,
  confidence DECIMAL(5, 2),
  start_position INT,
  end_position INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claims table for storing extracted claim information
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  claimant_name TEXT,
  claimant_address TEXT,
  forest_area TEXT,
  claim_type TEXT,
  claim_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  extracted_data JSONB, -- Store all extracted entities as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_ocr_results_document_id ON ocr_results(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_entities_ocr_result_id ON extracted_entities(ocr_result_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_document_id ON claims(document_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(claim_status);

-- Enable Row Level Security for security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for OCR results (view through documents)
CREATE POLICY "Users can view ocr results of their documents" ON ocr_results
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert ocr results" ON ocr_results
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for extracted entities
CREATE POLICY "Users can view entities from their documents" ON extracted_entities
  FOR SELECT USING (
    ocr_result_id IN (
      SELECT id FROM ocr_results WHERE document_id IN (
        SELECT id FROM documents WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "System can insert entities" ON extracted_entities
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for claims
CREATE POLICY "Users can view their own claims" ON claims
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert claims" ON claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own claims" ON claims
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims" ON claims
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
    )
  );

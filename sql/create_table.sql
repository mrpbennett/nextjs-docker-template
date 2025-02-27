CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    type TEXT NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms NUMERIC(3, 1) NOT NULL,
    valuation TEXT NOT NULL,
    estate_agent TEXT NOT NULL,
    selling_agent TEXT NOT NULL,
    occupied TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on the address field for faster searching
CREATE INDEX idx_properties_address ON properties(address);

-- Add a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

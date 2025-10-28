-- Add image_urls column to products table for multiple images
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls TEXT;

-- Add comment
COMMENT ON COLUMN products.image_urls IS 'JSON array of product image URLs (max 5 images)';

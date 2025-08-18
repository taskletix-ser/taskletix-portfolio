
-- Create database and table in XAMPP (phpMyAdmin or MySQL CLI)
CREATE DATABASE IF NOT EXISTS taskletix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE taskletix_db;

CREATE TABLE IF NOT EXISTS contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  country_code VARCHAR(10),
  company VARCHAR(150),
  project_type VARCHAR(120) NOT NULL,
  budget_range VARCHAR(120),
  timeline VARCHAR(120),
  project_details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




USE taskletix_db;

-- Add country_code column if it doesn't exist
ALTER TABLE contact_submissions 
ADD COLUMN country_code VARCHAR(10) AFTER phone;

-- Update existing records to have a default country code (India +91)
UPDATE contact_submissions 
SET country_code = '+91' 
WHERE country_code IS NULL OR country_code = '';


SET country_code = '+91' 
WHERE country_code IS NULL OR country_code = '';





CREATE DATABASE IF NOT EXISTS investpilot;
USE investpilot;

CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  query VARCHAR(255) NOT NULL,
  symbol VARCHAR(50) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  recommendation VARCHAR(50) NOT NULL,
  confidence INT NOT NULL,
  summary TEXT,
  result_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

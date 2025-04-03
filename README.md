//Create Database
CREATE DATABASE wordgame;

//Create Table for storing words
CREATE TABLE words (
    id INT AUTO_INCREMENT PRIMARY KEY,
    word VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    length INT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)


INSERT INTO words (word, length) VALUES ('বাংলা', CHAR_LENGTH('বাংলা'));
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


//Leaderboard Table
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    msisdn VARCHAR(11) NOT NULL,
    correctScore INT NOT NULL,
    incorrectScore INT NOT NULL,
    userTime INT NOT NULL,
    played_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


//Insert data into leaderboard table
INSERT INTO leaderboard (msisdn, correctScore, incorrectScore, userTime)
VALUES ('01712345678', 4, 1, 45);


//for Admin Access
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
);


//create email, pass for admin
INSERT INTO admin (email, password) 
VALUES ('admin@wordgame.com', 'admin123);


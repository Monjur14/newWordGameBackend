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
VALUES ('admin@wordgame.com', 'admin123');



//For Reffer
CREATE TABLE referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_msisdn VARCHAR(20) NOT NULL,
  referred_msisdn VARCHAR(20) NOT NULL,
  referred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referral_payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  referrer_msisdn VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



//For user Table
CREATE TABLE user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  msisdn VARCHAR(20) NOT NULL UNIQUE,
  referred_by VARCHAR(20),
  bkash_number VARCHAR(20),
  joining_date DATETIME DEFAULT CURRENT_TIMESTAMP
);


//for ads image section
CREATE TABLE ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url VARCHAR(255),
  redirect_link VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'inactive',
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




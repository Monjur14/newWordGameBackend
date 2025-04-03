const express = require("express");
const mysql = require("mysql2");
const cors = require('cors');
require("dotenv").config();

// Create an Express app
const app = express();
app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());

// Set up MySQL connection pool
const pool = mysql.createPool({
    host: "127.0.0.1", // XAMPP MySQL runs on localhost
    user: "root",      // Default MySQL user in XAMPP
    password: "",      // Default is an empty password (no password)
    database: "wordgame", // The database you created in phpMyAdmin
    charset: "utf8mb4" // Supports Bangla characters
}).promise(); // Enable promise support

// Test MySQL connection
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("Connected to MySQL database");
        connection.release(); // Release connection after testing
    } catch (err) {
        console.error("Database connection error:", err);
        process.exit(1); // Exit the app if DB connection fails
    }
})();

// API to add a new word
app.post("/add-bangla-word", async (req, res) => {
    try {
        const { word } = req.body;
        if (!word) {
            return res.status(400).json({ error: "Word is required" });
        }

        await pool.query("INSERT INTO words (word, length) VALUES (?, CHAR_LENGTH(?))", [word, word]);
        res.json({ message: "Bangla word added successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API to get all words
app.get("/words", async (req, res) => {
    try {
        const [words] = await pool.query("SELECT * FROM words ORDER BY timestamp DESC");
        res.json(words);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// API to get a random word by length
app.get("/random-word", async (req, res) => {
    try {
        const { length } = req.query;

        if (!length) {
            return res.status(400).json({ error: "Length parameter is required" });
        }

        // Fetch a random word of the given length
        const [words] = await pool.query(
            "SELECT * FROM words WHERE length = ? ORDER BY RAND() LIMIT 1",
            [length]
        );

        if (words.length === 0) {
            return res.status(404).json({ error: "No word found for the given length" });
        }

        res.json(words[0]); // Return the randomly selected word
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const path = require("path");

// Create an Express app
const app = express();
app.use(cors());

// Middleware
app.use(express.json());

// Set up MySQL connection pool
const pool = mysql
  .createPool({
    host: "127.0.0.1", 
    user: "root", 
    password: "", 
    database: "wordgame",
    charset: "utf8mb4",
  })
  .promise(); 

// MySQL connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Connected to MySQL database");
    connection.release(); 
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1); 
  }
})();


const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
// Set up static file serving for uploaded images

// Set up multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Static access to uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Upload ad
app.post("/upload-ad", upload.single("image"), async (req, res) => {
  try {
    const { redirect_link, status } = req.body;
    if (!req.file) return res.status(400).json({ error: "Image required" });

    const image_url = `/uploads/${req.file.filename}`;
    await pool.query(
      "INSERT INTO ads (image_url, redirect_link, status) VALUES (?, ?, ?)",
      [image_url, redirect_link, status || "inactive"]
    );

    res.json({ message: "Ad uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

//Fetch all ads
app.get("/ads", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM ads ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ads" });
  }
});

// PUT: Update ad status by ID
app.put("/update-ad-status/:id", async (req, res) => {
  const adId = req.params.id;
  const { status } = req.body;

  if (!["active", "inactive"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE ads SET status = ? WHERE id = ?",
      [status, adId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ad not found" });
    }

    res.json({ message: "Ad status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update ad status" });
  }
});

// DELETE: Delete ad by ID
app.delete("/delete-ad/:id", async (req, res) => {
  const adId = req.params.id;

  try {
    const [result] = await pool.query("DELETE FROM ads WHERE id = ?", [adId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Ad not found" });
    }

    res.json({ message: "Ad deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete ad" });
  }
});





// API to add a new word
app.post("/add-bangla-word", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word) {
      return res.status(400).json({ error: "Word is required" });
    }

    await pool.query(
      "INSERT INTO words (word, length) VALUES (?, CHAR_LENGTH(?))",
      [word, word]
    );
    res.json({ message: "Bangla word added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



//Add multiple words at once
app.post("/add-words", async (req, res) => {
  try {
    const { words } = req.body;
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({ error: "No words provided" });
    }

    const values = words.map(word => [word.trim(), word.trim().length]);

    await pool.query("INSERT INTO words (word, length) VALUES ?", [values]);

    res.json({ message: `${words.length} words added successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert words" });
  }
});


//Player Login
app.post("/playerlogin", async (req, res) => {
  try {
    const { msisdn, referred_by, bkash_number } = req.body;

    if (!msisdn) {
      return res.status(400).json({ error: "MSISDN are required" });
    }

    // Check if user already exists
    const [existing] = await pool.query("SELECT * FROM user WHERE msisdn = ?", [msisdn]);
    if (existing.length > 0) {
      return res.json({ message: "User already logged in", user: existing[0] });
    }

    // Insert new user
    await pool.query(
      "INSERT INTO user (msisdn, referred_by, bkash_number) VALUES (?, ?, ?)",
      [msisdn, referred_by || null, bkash_number || null]
    );

    res.json({ message: "User login recorded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




// API to get all words
app.get("/words", async (req, res) => {
  try {
    const [words] = await pool.query(
      "SELECT * FROM words ORDER BY timestamp DESC"
    );
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Delete the word
app.delete("/delete-word/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM words WHERE id = ?", [id]);
    res.json({ message: "Word deleted successfully!" });
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

    const [words] = await pool.query(
      "SELECT * FROM words WHERE length = ? ORDER BY RAND() LIMIT 1",
      [length]
    );

    if (words.length === 0) {
      return res
        .status(404)
        .json({ error: "No word found for the given length" });
    }

    res.json(words[0]); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/userscore", async (req, res) => {
  try {
    const { msisdn, correctScore, incorrectScore, userTime } = req.body;

    if (
      !msisdn ||
      correctScore === undefined ||
      incorrectScore === undefined ||
      userTime === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const today = new Date().toISOString().split("T")[0]; // 'YYYY-MM-DD'

    const [existing] = await pool.query(
      "SELECT * FROM leaderboard WHERE msisdn = ? AND played_at = ?",
      [msisdn, today]
    );

    if (existing.length > 0) {
      const current = existing[0];

      // Define "better score" logic
      const isBetter =
        correctScore > current.correctScore ||
        (correctScore === current.correctScore &&
          incorrectScore < current.incorrectScore) ||
        (correctScore === current.correctScore &&
          incorrectScore === current.incorrectScore &&
          userTime < current.userTime);

      if (isBetter) {
        await pool.query(
          "UPDATE leaderboard SET correctScore = ?, incorrectScore = ?, userTime = ? WHERE id = ?",
          [correctScore, incorrectScore, userTime, current.id]
        );
        return res.json({ message: "Score updated successfully!" });
      } else {
        return res.json({
          message: "Existing score is better. No update made.",
        });
      }
    } else {
      await pool.query(
        "INSERT INTO leaderboard (msisdn, correctScore, incorrectScore, userTime, played_at) VALUES (?, ?, ?, ?, ?)",
        [msisdn, correctScore, incorrectScore, userTime, today]
      );
      return res.json({ message: "Score saved successfully!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//For Admin Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM admin WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length > 0) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

//
app.get("/leaderboard", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    let query = "SELECT * FROM leaderboard";
    const values = [];

    if (fromDate && toDate) {
      query += " WHERE DATE(played_at) BETWEEN ? AND ?";
      values.push(fromDate, toDate);
    } else if (fromDate) {
      query += " WHERE DATE(played_at) >= ?";
      values.push(fromDate);
    } else if (toDate) {
      query += " WHERE DATE(played_at) <= ?";
      values.push(toDate);
    }

    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/winners", async (req, res) => {
  try {
    const query = `
          SELECT * FROM leaderboard
          WHERE DATE(played_at) = CURDATE() - INTERVAL 1 DAY
          ORDER BY correctScore DESC, userTime ASC
          LIMIT 5
      `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/public-leaderboard", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [results] = await pool.query(
      `SELECT msisdn, correctScore, incorrectScore, userTime 
         FROM leaderboard 
         WHERE played_at = ? 
         ORDER BY correctScore DESC, incorrectScore ASC, userTime ASC 
         LIMIT 100`,
      [today]
    );

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/save-referral", async (req, res) => {
  try {
    const { referrer_msisdn, referred_msisdn } = req.body;

    if (!referrer_msisdn || !referred_msisdn) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prevent self-referral
    if (referrer_msisdn === referred_msisdn) {
      return res.status(400).json({ error: "Self-referral not allowed" });
    }

    // Check if the referred_msisdn already exists
    const [existing] = await pool.query(
      "SELECT * FROM referrals WHERE referred_msisdn = ?",
      [referred_msisdn]
    );

    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "Referral already exists for this user" });
    }

    // Insert the referral
    await pool.query(
      "INSERT INTO referrals (referrer_msisdn, referred_msisdn) VALUES (?, ?)",
      [referrer_msisdn, referred_msisdn]
    );

    res.json({ message: "Referral saved successfully!" });
    bn;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




// Update user's bKash number
app.post("/update-bkash", async (req, res) => {
  const { msisdn, bkash_number } = req.body;

  if (!msisdn || !bkash_number) {
    return res.status(400).json({ error: "Both MSISDN and bKash number are required" });
  }

  try {
    // Check if bKash number already exists
    const [check] = await pool.query("SELECT * FROM user WHERE bkash_number = ?", [bkash_number]);

    if (check.length > 0) {
      return res.status(409).json({ error: "bKash number already exists" });
    }

    // Update bKash number
    await pool.query("UPDATE user SET bkash_number = ? WHERE msisdn = ?", [bkash_number, msisdn]);

    res.json({ message: "bKash number added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's bKash number
app.get("/get-bkash/:msisdn", async (req, res) => {
  const { msisdn } = req.params;

  try {
    const [rows] = await pool.query("SELECT bkash_number FROM user WHERE msisdn = ?", [msisdn]);
    if (rows.length > 0) {
      res.json({ bkash_number: rows[0].bkash_number });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

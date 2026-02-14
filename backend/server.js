const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "mysecretkey";

const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT
    )
`);

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
        [name, email, hashedPassword],
        function (err) {
            if (err) {
                return res.status(400).json({ message: "User already exists" });
            }
            res.json({ message: "User registered successfully" });
        }
    );
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
        async (err, user) => {
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresIn: "1h",
            });

            res.json({ token });
        }
    );
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get("/dashboard", authenticateToken, (req, res) => {
    db.get(
        `SELECT name, email FROM users WHERE id = ?`,
        [req.user.id],
        (err, user) => {
            if (err || !user) {
                return res.status(500).json({ message: "User not found" });
            }

            res.json({
                message: "Welcome to your dashboard!",
                name: user.name,
                email: user.email
            });
        }
    );
});


app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});

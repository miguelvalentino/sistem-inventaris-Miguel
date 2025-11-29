const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

const db = require("./database");

// agar server bisa membaca form dan JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// file static sbadmin
app.use(express.static(path.join(__dirname, 'startbootstrap-sb-admin-gh-pages')));

// tampilkan login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'startbootstrap-sb-admin-gh-pages', 'login.html'));
});

// proses login
app.post('/login', async (req, res) => {
    const { user_name, password } = req.body;

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE user_name = $1 AND password = $2",
            [user_name, password]
        );

        if (result.rows.length > 0) {
            res.send("login berhasil");
        } else {
            res.send("login gagal");
        }

    } catch (err) {
        console.error(err);
        res.send("Terjadi error di server.");
    }
});

// jalankan server
app.listen(3000, () => console.log("Server berjalan di http://localhost:3000/login"));

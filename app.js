const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

const db = require("./database");

// Middleware parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Proses Login
app.post('/login', async (req, res) => {
    const { user_name, password } = req.body;

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE user_name = $1 AND password = $2",
            [user_name, password]
        );
        if (result.length > 0) {
            console.log("Login Berhasil!");
            res.redirect('/index.html');
        } else {
            console.log("Login Gagal: Data tidak cocok");
            res.send("Login gagal: Username atau password salah.");
        }

    } catch (err) {
        console.error("Database Error:", err);
        res.send("Terjadi error di server.");
    }
});

app.get('/logout', (req, res) => {
    res.redirect('/login');
});

app.get('/api/items', async (req, res) => {
    try {
        const items = await db.any("SELECT * FROM barang_inventaris ORDER BY id_item ASC");
        res.json(items);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', async (req, res) => {
    const { name_item, type_item, brand_item, info_item } = req.body;
    
    // Debugging: Cek di terminal apakah data sampai sini
    console.log("Menerima data baru:", req.body); 

    try {
        await db.none(
            "INSERT INTO barang_inventaris(name_item, type_item, brand_item, info_item, total_item) VALUES($1, $2, $3, $4, 0)", 
            [name_item, type_item, brand_item, info_item]
        );
        res.json({ status: 'success' });
    } catch (err) {
        console.error("Gagal Insert:", err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/items/:id', async (req, res) => {
    const { name_item, type_item, brand_item, info_item } = req.body;
    const id = req.params.id;
    try {
        await db.none(
            "UPDATE barang_inventaris SET name_item=$1, type_item=$2, brand_item=$3, info_item=$4 WHERE id_item=$5",
            [name_item, type_item, brand_item, info_item, id]
        );
        res.json({ status: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const item = await db.one("SELECT total_item FROM barang_inventaris WHERE id_item=$1", [id]);
        
        if (item.total_item > 0) {
            return res.status(400).json({ error: "Gagal hapus: Barang masih ada stok!" });
        }
        
        await db.none("DELETE FROM barang_inventaris WHERE id_item=$1", [id]);
        res.json({ status: 'success' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items/in', async (req, res) => {
    const { id_item, total_entry } = req.body;
    try {
        await db.tx(async t => {
            await t.none("INSERT INTO barang_masuk(id_item, total_entry) VALUES($1, $2)", [id_item, total_entry]);
            await t.none("UPDATE barang_inventaris SET total_item = total_item + $1 WHERE id_item = $2", [total_entry, id_item]);
        });
        res.json({ status: 'success' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items/out', async (req, res) => {
    const { id_item, total_exit } = req.body;
    try {
        await db.tx(async t => {
            const item = await t.one("SELECT total_item FROM barang_inventaris WHERE id_item = $1", [id_item]);
            if (item.total_item < total_exit) throw new Error("Stok kurang!");
            
            await t.none("INSERT INTO barang_keluar(id_item, total_exit) VALUES($1, $2)", [id_item, total_exit]);
            await t.none("UPDATE barang_inventaris SET total_item = total_item - $1 WHERE id_item = $2", [total_exit, id_item]);
        });
        res.json({ status: 'success' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000/login"));
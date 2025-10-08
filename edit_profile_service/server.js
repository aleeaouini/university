const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');
const path = require('path');

const app = express();
const PORT = 3003;

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Dossier pour stocker les images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connexion MySQL 
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',       
    database: 'platforme' 
});

connection.connect(function(err) {
    if (err) {
        console.error('Erreur de connexion MySQL:', err);
        return;
    }
    console.log('Connecté à MySQL !');
});

// Service pour éditer le profil
app.post('/edit-profile/:id', function(req, res) {
    const { id } = req.params;
    const { email, motdepasse, telp } = req.body;
    let image = null;

    // Gestion upload image
    if (req.files && req.files.image) {
        const uploadedFile = req.files.image;
        const uploadPath = path.join(__dirname, 'uploads', uploadedFile.name);
        uploadedFile.mv(uploadPath, function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('Erreur lors de l\'upload de l\'image');
            }
        });
        image = '/uploads/' + uploadedFile.name;
    }

    const fields = [];
    const values = [];

    if (email) {
        fields.push("email = ?");
        values.push(email);
    }

    if (motdepasse) {
        const hash = bcrypt.hashSync(motdepasse, 10);
        fields.push("mdp_hash = ?");
        values.push(hash);
    }

    if (telp) {
        fields.push("telp = ?");
        values.push(telp);
    }

    if (image) {
        fields.push("image = ?");
        values.push(image);
    }

    if (fields.length === 0) {
        return res.status(400).send("Rien à mettre à jour");
    }

    const sql = `UPDATE utilisateur SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);

    connection.query(sql, values, function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur serveur");
        }
        res.send("Profil mis à jour avec succès !");
    });
});

// Lancer le serveur
app.listen(PORT, function() {
    console.log('Serveur lancé sur http://localhost:' + PORT);
});

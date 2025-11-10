const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const csv = require('csv-parser');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');

const app = express();
const PORT = 3004;

// CORS pour le frontend
app.use(cors({ origin: '*', methods: ['GET', 'POST'] }));

// Middleware
app.use(express.json());
app.use(fileUpload());

// Connexion MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'platforme',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connecté à MySQL');
});

// Dossier uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// --- Route Import CSV ---
app.post('/import-csv', (req, res) => {
  if (!req.files || !req.files.csvfile) {
    return res.status(400).send('Aucun fichier CSV envoyé.');
  }

  const file = req.files.csvfile;
  const uploadPath = path.join(uploadDir, file.name);

  file.mv(uploadPath, (err) => {
    if (err) return res.status(500).send('Erreur lors de l\'upload du CSV');

    const results = [];
    fs.createReadStream(uploadPath)
      .pipe(csv({ headers: ['nom', 'prenom', 'email', 'telp', 'cin'], skipLines: 1 }))
      .on('data', (data) => {
        Object.keys(data).forEach((k) => data[k] = data[k].trim());
        results.push(data);
      })
      .on('end', () => {
        let count = 0;

        results.forEach((row) => {
          const { nom = '', prenom = '', email = '', telp = '', cin = '' } = row;

          if (!cin || !email) {
            console.error(`Ligne ignorée (cin ou email manquant): ${nom} ${prenom} ${email}`);
            return;
          }

          connection.query(
            `INSERT INTO utilisateur (nom, prenom, email, cin, mdp_hash, telp, image)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nom, prenom, email, cin, '', telp, null],
            (err, result) => {
              if (err) console.error("Erreur MySQL:", err.sqlMessage);
              else count++;
            }
          );
        });

        setTimeout(() => {
          res.send(`Import terminé (${count} utilisateurs ajoutés).`);
        }, 500);
      });
  });
});

// --- Route Export CSV ---
app.get('/export-csv', (req, res) => {
  const fileName = 'utilisateurs_export.csv';
  const filePath = path.join(uploadDir, fileName);

  connection.query('SELECT nom, prenom, email, telp, cin FROM utilisateur', (err, results) => {
    if (err) return res.status(500).send('Erreur MySQL');

    const header = 'nom,prenom,email,telp,cin\n';
    const rows = results.map(r => `${r.nom},${r.prenom},${r.email},${r.telp},${r.cin}`).join('\n');
    const csvContent = header + rows;

    fs.writeFileSync(filePath, csvContent, 'utf8');
    res.download(filePath, fileName);
  });
});

// --- Lancer serveur ---
app.listen(PORT, () => console.log(`Serveur CSV lancé sur http://localhost:${PORT}`));

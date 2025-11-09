
const express = require('express');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'platforme'
});

connection.connect(function(err) {
  if (err) {
    console.error('Erreur de connexion MySQL:', err);
    process.exit(1);
  }
  console.log('✅ Connecté à MySQL !');
});

function sendError(res, err) {
  console.error(err);
  res.status(500).json({ error: err.message || err });
}

/* =================== ROUTES =================== */

/* Root */
app.get('/', function(req, res) {
  res.send('Service Administratif (API) - Node.js + MySQL');
});

/* ---------- DEPARTEMENTS CRUD ---------- */
app.get('/departements', function(req, res) {
  connection.query('SELECT * FROM departement', function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.get('/departements/:id', function(req, res) {
  connection.query('SELECT * FROM departement WHERE id = ?', [req.params.id], function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows[0] || null);
  });
});

app.post('/departements', function(req, res) {
  const nom = req.body.nom;
  connection.query('INSERT INTO departement (nom) VALUES (?)', [nom], function(err, result) {
    if (err) return sendError(res, err);
    res.status(201).json({ message: '✅ Département ajouté', id: result.insertId });
  });
});

app.put('/departements/:id', function(req, res) {
  const nom = req.body.nom;
  connection.query('UPDATE departement SET nom = ? WHERE id = ?', [nom, req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '✅ Département modifié' });
  });
});

app.delete('/departements/:id', function(req, res) {
  connection.query('DELETE FROM departement WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Département supprimé' });
  });
});

/* ---------- SPECIALITES CRUD ---------- */
app.get('/specialites', function(req, res) {
  const sql = `SELECT s.id, s.nom, s.id_departement, d.nom AS departement_nom
               FROM specialite s
               LEFT JOIN departement d ON s.id_departement = d.id`;
  connection.query(sql, function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/specialites', function(req, res) {
  const { nom, id_departement } = req.body;
  connection.query('INSERT INTO specialite (nom, id_departement) VALUES (?, ?)', [nom, id_departement || null], function(err, result) {
    if (err) return sendError(res, err);
    res.status(201).json({ message: '✅ Spécialité ajoutée', id: result.insertId });
  });
});

app.put('/specialites/:id', function(req, res) {
  const { nom, id_departement } = req.body;
  connection.query('UPDATE specialite SET nom = ?, id_departement = ? WHERE id = ?', [nom, id_departement || null, req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '✅ Spécialité modifiée' });
  });
});

app.delete('/specialites/:id', function(req, res) {
  connection.query('DELETE FROM specialite WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Spécialité supprimée' });
  });
});

/* ---------- NIVEAUX CRUD ---------- */
app.get('/niveaux', function(req, res) {
  connection.query('SELECT * FROM niveau', function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/niveaux', function(req, res) {
  const nom = req.body.nom;
  connection.query('INSERT INTO niveau (nom) VALUES (?)', [nom], function(err, result) {
    if (err) return sendError(res, err);
    res.status(201).json({ message: '✅ Niveau ajouté', id: result.insertId });
  });
});

/* ---------- GROUPES CRUD ---------- */
app.get('/groupes', function(req, res) {
  const sql = `SELECT g.id, g.nom, g.id_niveau, n.nom AS niveau_nom, g.id_specialite, s.nom AS specialite_nom
               FROM \`groupe\` g
               LEFT JOIN niveau n ON g.id_niveau = n.id
               LEFT JOIN specialite s ON g.id_specialite = s.id`;
  connection.query(sql, function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/groupes', function(req, res) {
  const { nom, id_niveau, id_specialite } = req.body;
  connection.query('INSERT INTO `groupe` (nom, id_niveau, id_specialite) VALUES (?, ?, ?)', [nom, id_niveau || null, id_specialite || null], function(err, result) {
    if (err) return sendError(res, err);
    res.status(201).json({ message: '✅ Groupe ajouté', id: result.insertId });
  });
});

app.put('/groupes/:id', function(req, res) {
  const { nom, id_niveau, id_specialite } = req.body;
  connection.query('UPDATE `groupe` SET nom = ?, id_niveau = ?, id_specialite = ? WHERE id = ?', [nom, id_niveau || null, id_specialite || null, req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '✅ Groupe modifié' });
  });
});

app.delete('/groupes/:id', function(req, res) {
  connection.query('DELETE FROM `groupe` WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Groupe supprimé' });
  });
});

/* ---------- MATIERES CRUD ---------- */
app.get('/matieres', function(req, res) {
  const sql = `SELECT m.id, m.nom, m.id_departement, d.nom AS departement
               FROM matiere m
               LEFT JOIN departement d ON m.id_departement = d.id`;
  connection.query(sql, function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/matieres', function(req, res) {
  const { nom, id_departement } = req.body;
  connection.query('INSERT INTO matiere (nom, id_departement) VALUES (?, ?)', [nom, id_departement || null], function(err, result) {
    if (err) return sendError(res, err);
    res.status(201).json({ message: '✅ Matière ajoutée', id: result.insertId });
  });
});

app.put('/matieres/:id', function(req, res) {
  const { nom, id_departement } = req.body;
  connection.query('UPDATE matiere SET nom = ?, id_departement = ? WHERE id = ?', [nom, id_departement || null, req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '✅ Matière modifiée' });
  });
});

app.delete('/matieres/:id', function(req, res) {
  connection.query('DELETE FROM matiere WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Matière supprimée' });
  });
});

/* ---------- ENSEIGNANTS (utilisateur + enseignant) ---------- */
app.get('/enseignants', function(req, res) {
  const sql = `SELECT e.id, u.nom, u.prenom, u.email, u.cin, u.telp, d.nom AS departement
               FROM enseignant e
               JOIN utilisateur u ON e.id = u.id
               LEFT JOIN departement d ON e.id_departement = d.id`;
  connection.query(sql, function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/enseignants', function(req, res) {
  const { nom, prenom, email, cin, telp, id_departement } = req.body;
  // 1) créer utilisateur
  connection.query('INSERT INTO utilisateur (nom, prenom, email, cin, telp) VALUES (?, ?, ?, ?, ?)', [nom, prenom, email, cin, telp || null],
    function(err, result) {
      if (err) return sendError(res, err);
      const userId = result.insertId;
      // 2) créer enseignant
      connection.query('INSERT INTO enseignant (id, id_departement) VALUES (?, ?)', [userId, id_departement], function(err2) {
        if (err2) return sendError(res, err2);
        res.status(201).json({ message: '✅ Enseignant créé', id: userId });
      });
    });
});

app.put('/enseignants/:id', function(req, res) {
  const { nom, prenom, email, cin, telp, id_departement } = req.body;
  connection.query('UPDATE utilisateur SET nom=?, prenom=?, email=?, cin=?, telp=? WHERE id=?', [nom, prenom, email, cin, telp || null, req.params.id],
    function(err) {
      if (err) return sendError(res, err);
      if (typeof id_departement !== 'undefined') {
        connection.query('UPDATE enseignant SET id_departement = ? WHERE id = ?', [id_departement, req.params.id], function(err2) {
          if (err2) return sendError(res, err2);
          res.json({ message: '✅ Enseignant modifié' });
        });
      } else {
        res.json({ message: '✅ Enseignant modifié' });
      }
    });
});

app.delete('/enseignants/:id', function(req, res) {
  // supprime utilisateur -> cascade supprimera enseignant si FK ON DELETE CASCADE
  connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Enseignant (et utilisateur) supprimé' });
  });
});

/* ---------- ETUDIANTS (utilisateur + etudiant) ---------- */
app.get('/etudiants', function(req, res) {
  const sql = `SELECT e.id, u.nom, u.prenom, u.email, u.cin, u.telp, g.nom AS groupe, s.nom AS specialite
               FROM etudiant e
               JOIN utilisateur u ON e.id = u.id
               LEFT JOIN \`groupe\` g ON e.id_groupe = g.id
               LEFT JOIN specialite s ON e.id_specialite = s.id`;
  connection.query(sql, function(err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/etudiants', function(req, res) {
  const { nom, prenom, email, cin, telp, id_groupe, id_specialite } = req.body;
  connection.query('INSERT INTO utilisateur (nom, prenom, email, cin, telp) VALUES (?, ?, ?, ?, ?)', [nom, prenom, email, cin, telp || null],
    function(err, result) {
      if (err) return sendError(res, err);
      const userId = result.insertId;
      connection.query('INSERT INTO etudiant (id, id_groupe, id_specialite) VALUES (?, ?, ?)', [userId, id_groupe, id_specialite], function(err2) {
        if (err2) return sendError(res, err2);
        res.status(201).json({ message: '✅ Étudiant créé', id: userId });
      });
    });
});

app.put('/etudiants/:id', function(req, res) {
  const { nom, prenom, email, cin, telp, id_groupe, id_specialite } = req.body;
  connection.query('UPDATE utilisateur SET nom=?, prenom=?, email=?, cin=?, telp=? WHERE id=?', [nom, prenom, email, cin, telp || null, req.params.id],
    function(err) {
      if (err) return sendError(res, err);
      if (typeof id_groupe !== 'undefined' || typeof id_specialite !== 'undefined') {
        connection.query('UPDATE etudiant SET id_groupe = ?, id_specialite = ? WHERE id = ?', [id_groupe, id_specialite, req.params.id], function(err2) {
          if (err2) return sendError(res, err2);
          res.json({ message: '✅ Étudiant modifié' });
        });
      } else {
        res.json({ message: '✅ Étudiant modifié' });
      }
    });
});

app.delete('/etudiants/:id', function(req, res) {
  connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], function(err) {
    if (err) return sendError(res, err);
    res.json({ message: '🗑️ Étudiant (et utilisateur) supprimé' });
  });
});

/* =============== START SERVER =============== */
app.listen(PORT, function() {
  console.log('🚀 Admin service lancé sur http://localhost:' + PORT);
});

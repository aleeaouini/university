const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
require('dotenv').config();

const { ApolloServer } = require('apollo-server-express');
const { UserInputError } = require('apollo-server-express');
const { checkConflict } = require('./services/seanceConflict');
const seanceTypeDefs = require('./graphql/seanceTypeDefs');
const seanceResolvers = require('./graphql/seanceResolvers');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

/* =================== MySQL =================== */
const connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'platforme'
});

connection.connect(err => {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
    process.exit(1);
  }
  console.log('Connecté à MySQL');
});

function sendError(res, err) {
  console.error(err);
  res.status(500).json({ error: err && err.message ? err.message : err });
}

/* =================== ROUTES =================== */
app.get('/', (req, res) => {
  res.send('Service Administratif (API) - Node.js + MySQL');
});

/* ---------------- DEPARTEMENTS ---------------- */
app.get('/departements', (req, res) => {
  const sql = `
    SELECT d.*, u.nom AS chef_nom, u.prenom AS chef_prenom 
    FROM departement d 
    LEFT JOIN chef c ON d.id_chef = c.id 
    LEFT JOIN enseignant e ON c.id = e.id 
    LEFT JOIN utilisateur u ON e.id = u.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.get('/departements/:id', (req, res) => {
  const sql = `
    SELECT d.*, u.nom AS chef_nom, u.prenom AS chef_prenom 
    FROM departement d 
    LEFT JOIN chef c ON d.id_chef = c.id 
    LEFT JOIN enseignant e ON c.id = e.id 
    LEFT JOIN utilisateur u ON e.id = u.id 
    WHERE d.id = ?
  `;
  connection.query(sql, [req.params.id], (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows[0] || null);
  });
});

app.post('/departements', (req, res) => {
  const { nom, nom_chef } = req.body;

  function findChefId(cb) {
    if (!nom_chef) return cb(null, null);
    const sql = `
      SELECT e.id FROM enseignant e 
      JOIN utilisateur u ON e.id = u.id 
      WHERE u.nom = ? OR u.prenom = ? OR CONCAT(u.prenom, ' ', u.nom) = ?
      LIMIT 1
    `;
    connection.query(sql, [nom_chef, nom_chef, nom_chef], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) {
        connection.query('SELECT id FROM chef WHERE id = ?', [rows[0].id], (err2, chefRows) => {
          if (err2) return cb(err2);
          if (chefRows.length > 0) cb(null, rows[0].id);
          else {
            connection.query('INSERT INTO chef (id, date_nomination) VALUES (?, CURDATE())', [rows[0].id], (err3) => {
              if (err3) return cb(err3);
              cb(null, rows[0].id);
            });
          }
        });
      } else cb(new Error('Enseignant non trouvé'));
    });
  }

  findChefId((err, chefId) => {
    if (err) return sendError(res, err);
    connection.query('INSERT INTO departement (nom, id_chef) VALUES (?, ?)', [nom, chefId], (err, result) => {
      if (err) return sendError(res, err);
      res.status(201).json({ message: 'Département ajouté', id: result.insertId });
    });
  });
});

app.put('/departements/:id', (req, res) => {
  const { nom, nom_chef } = req.body;

  function findChefId(cb) {
    if (!nom_chef) return cb(null, null);
    const sql = `
      SELECT e.id FROM enseignant e 
      JOIN utilisateur u ON e.id = u.id 
      WHERE u.nom = ? OR u.prenom = ? OR CONCAT(u.prenom, ' ', u.nom) = ?
      LIMIT 1
    `;
    connection.query(sql, [nom_chef, nom_chef, nom_chef], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) {
        connection.query('SELECT id FROM chef WHERE id = ?', [rows[0].id], (err2, chefRows) => {
          if (err2) return cb(err2);
          if (chefRows.length > 0) cb(null, rows[0].id);
          else {
            connection.query('INSERT INTO chef (id, date_nomination) VALUES (?, CURDATE())', [rows[0].id], (err3) => {
              if (err3) return cb(err3);
              cb(null, rows[0].id);
            });
          }
        });
      } else cb(new Error('Enseignant non trouvé'));
    });
  }

  findChefId((err, chefId) => {
    if (err) return sendError(res, err);
    connection.query('UPDATE departement SET nom = ?, id_chef = ? WHERE id = ?', [nom, chefId, req.params.id], (err) => {
      if (err) return sendError(res, err);
      res.json({ message: 'Département modifié' });
    });
  });
});

app.delete('/departements/:id', (req, res) => {
  connection.query('DELETE FROM departement WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Département supprimé' });
  });
});

/* ---------------- SPECIALITES ---------------- */
app.get('/specialites', (req, res) => {
  const sql = `
    SELECT s.*, d.nom AS departement 
    FROM specialite s 
    LEFT JOIN departement d ON s.id_departement = d.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/specialites', (req, res) => {
  const { nom, nom_departement } = req.body;
  if (!nom || !nom_departement) return res.status(400).json({ error: 'nom and nom_departement are required' });

  connection.query('SELECT id FROM departement WHERE nom = ?', [nom_departement], (err, rows) => {
    if (err) return sendError(res, err);
    if (!rows.length) return res.status(400).json({ error: 'Departement not found' });
    const departementId = rows[0].id;
    connection.query('INSERT INTO specialite (nom, id_departement) VALUES (?, ?)', [nom, departementId], (err, result) => {
      if (err) return sendError(res, err);
      res.status(201).json({ message: 'Spécialité ajoutée', id: result.insertId });
    });
  });
});

app.put('/specialites/:id', (req, res) => {
  const { nom, nom_departement } = req.body;
  function findDepartementId(cb) {
    if (!nom_departement) return cb(null, null);
    connection.query('SELECT id FROM departement WHERE nom = ?', [nom_departement], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) cb(null, rows[0].id);
      else {
        connection.query('INSERT INTO departement (nom) VALUES (?)', [nom_departement], (err2, result) => {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }
  findDepartementId((err, departementId) => {
    if (err) return sendError(res, err);
    connection.query('UPDATE specialite SET nom = ?, id_departement = ? WHERE id = ?', [nom, departementId, req.params.id], (err) => {
      if (err) return sendError(res, err);
      res.json({ message: 'Spécialité modifiée' });
    });
  });
});

app.delete('/specialites/:id', (req, res) => {
  connection.query('DELETE FROM specialite WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Spécialité supprimée' });
  });
});

/* ---------------- NIVEAUX ---------------- */
app.get('/niveaux', (req, res) => {
  const sql = `
    SELECT n.*, s.nom AS specialite 
    FROM niveau n 
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/niveaux', (req, res) => {
  const { nom, nom_specialite } = req.body;
  if (!nom || !nom_specialite) return res.status(400).json({ error: 'nom and nom_specialite are required' });

  function findSpecialiteId(cb) {
    connection.query('SELECT id FROM specialite WHERE nom = ?', [nom_specialite], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) cb(null, rows[0].id);
      else {
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], (err2, result) => {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }

  findSpecialiteId((err, specialiteId) => {
    if (err) return sendError(res, err);
    connection.query('INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)', [nom, specialiteId], (err, result) => {
      if (err) return sendError(res, err);
      res.status(201).json({ message: 'Niveau ajouté', id: result.insertId });
    });
  });
});

app.put('/niveaux/:id', (req, res) => {
  const { nom, nom_specialite } = req.body;

  function findSpecialiteId(cb) {
    if (!nom_specialite) return cb(null, null);
    connection.query('SELECT id FROM specialite WHERE nom = ?', [nom_specialite], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) cb(null, rows[0].id);
      else {
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], (err2, result) => {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }

  findSpecialiteId((err, specialiteId) => {
    if (err) return sendError(res, err);
    connection.query('UPDATE niveau SET nom = ?, id_specialite = ? WHERE id = ?', [nom, specialiteId, req.params.id], (err) => {
      if (err) return sendError(res, err);
      res.json({ message: 'Niveau modifié' });
    });
  });
});

app.delete('/niveaux/:id', (req, res) => {
  connection.query('DELETE FROM niveau WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Niveau supprimé' });
  });
});

/* ---------------- GROUPES ---------------- */
app.get('/groupes', (req, res) => {
  const sql = `
    SELECT g.*, n.nom AS niveau, s.nom AS specialite 
    FROM groupe g 
    LEFT JOIN niveau n ON g.id_niveau = n.id 
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

// Nouvelle route pour récupérer les groupes avec leurs spécialités complètes
app.get('/groupes-with-specialites', (req, res) => {
  const sql = `
    SELECT g.*, s.id as specialite_id, s.nom as specialite_nom, 
           d.nom as departement_nom, n.id as niveau_id, n.nom as niveau_nom
    FROM groupe g
    LEFT JOIN niveau n ON g.id_niveau = n.id
    LEFT JOIN specialite s ON n.id_specialite = s.id
    LEFT JOIN departement d ON s.id_departement = d.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

// Route pour récupérer la spécialité automatique d'un groupe
app.get('/groupes/:id/specialite-auto', (req, res) => {
  const groupId = req.params.id;
  
  const sql = `
    SELECT s.id as specialite_id, s.nom as specialite_nom,
           n.id as niveau_id, n.nom as niveau_nom
    FROM groupe g
    JOIN niveau n ON g.id_niveau = n.id
    JOIN specialite s ON n.id_specialite = s.id
    WHERE g.id = ?
  `;
  
  connection.query(sql, [groupId], (err, rows) => {
    if (err) return sendError(res, err);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucune spécialité trouvée pour ce groupe' });
    }
    
    res.json({
      id_specialite: rows[0].specialite_id,
      specialite_nom: rows[0].specialite_nom,
      id_niveau: rows[0].niveau_id,
      niveau_nom: rows[0].niveau_nom
    });
  });
});

app.post('/groupes', (req, res) => {
  const { nom_niveau, nom_specialite } = req.body;
  if (!nom_niveau || !nom_specialite) return res.status(400).json({ error: 'nom_niveau and nom_specialite are required' });

  function findNiveauId(cb) {
    const sql = `
      SELECT n.id FROM niveau n 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE n.nom = ? AND s.nom = ?
    `;
    connection.query(sql, [nom_niveau, nom_specialite], (err, rows) => {
      if (err) return cb(err);
      if (rows.length > 0) cb(null, rows[0].id);
      else {
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], (err2, result2) => {
          if (err2) return cb(err2);
          const specialiteId = result2.insertId;
          connection.query('INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)', [nom_niveau, specialiteId], (err3, result3) => {
            if (err3) return cb(err3);
            cb(null, result3.insertId);
          });
        });
      }
    });
  }

  findNiveauId((err, niveauId) => {
    if (err) return sendError(res, err);

    const countSql = `
      SELECT COUNT(*) AS cnt 
      FROM etudiant e 
      JOIN specialite s ON e.id_specialite = s.id 
      JOIN groupe g ON e.id_groupe = g.id 
      JOIN niveau n ON g.id_niveau = n.id 
      WHERE s.nom = ? AND n.nom = ?
    `;

    connection.query(countSql, [nom_specialite, nom_niveau], (err, countRows) => {
      if (err) return sendError(res, err);
      const count = countRows[0]?.cnt || 0;
      let index = Math.ceil((count + 1) / 30);
      if (index < 1) index = 1;

      const firstLetter = (nom_niveau || '').trim().charAt(0);
      const groupName = `${nom_specialite}${firstLetter}${index}`;

      connection.query('INSERT INTO groupe (nom, id_niveau) VALUES (?, ?)', [groupName, niveauId], (err, result) => {
        if (err) return sendError(res, err);
        res.status(201).json({
          message: 'Groupe ajouté',
          id: result.insertId,
          nom: groupName,
          index,
          niveau: nom_niveau,
          specialite: nom_specialite
        });
      });
    });
  });
});

app.put('/groupes/:id', (req, res) => {
  const { nom } = req.body;
  connection.query('UPDATE groupe SET nom = ? WHERE id = ?', [nom, req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Groupe modifié' });
  });
});

app.delete('/groupes/:id', (req, res) => {
  connection.query('DELETE FROM groupe WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Groupe supprimé' });
  });
});

/* ---------------- MATIERES ---------------- */
app.get('/matieres', (req, res) => {
  const sql = `
    SELECT 
        m.*, 
        n.nom AS niveau,
        s.nom AS specialite,
        g.nom AS groupe
    FROM matiere m
    LEFT JOIN niveau n ON m.id_niveau = n.id
    LEFT JOIN specialite s ON n.id_specialite = s.id
    LEFT JOIN groupe g ON g.id_niveau = n.id
  `;

  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/matieres', (req, res) => {
  const { nom, nom_niveau, nom_specialite } = req.body;

  if (!nom || !nom_niveau || !nom_specialite) {
    return res.status(400).json({ error: "nom, nom_niveau and nom_specialite are required" });
  }

  const findSpecialite = `
    SELECT id FROM specialite WHERE nom = ?
  `;

  connection.query(findSpecialite, [nom_specialite], (err, rows) => {
    if (err) return sendError(res, err);

    function handleSpecialite(specialiteId) {
      const findNiveau = `
        SELECT id FROM niveau WHERE nom = ? AND id_specialite = ?
      `;

      connection.query(findNiveau, [nom_niveau, specialiteId], (err2, nRows) => {
        if (err2) return sendError(res, err2);

        function handleNiveau(niveauId) {
          const insertMatiere = `
            INSERT INTO matiere (nom, id_niveau) VALUES (?, ?)
          `;
          connection.query(insertMatiere, [nom, niveauId], (err3, result) => {
            if (err3) return sendError(res, err3);
            res.status(201).json({
              message: "Matière ajoutée",
              id: result.insertId,
              nom,
              niveau: nom_niveau,
              specialite: nom_specialite
            });
          });
        }

        if (nRows.length > 0) handleNiveau(nRows[0].id);
        else {
          const createNiveau = `
            INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)
          `;
          connection.query(createNiveau, [nom_niveau, specialiteId], (err3, result3) => {
            if (err3) return sendError(res, err3);
            handleNiveau(result3.insertId);
          });
        }
      });
    }

    if (rows.length > 0) handleSpecialite(rows[0].id);
    else {
      const createSpecialite = `
        INSERT INTO specialite (nom) VALUES (?)
      `;
      connection.query(createSpecialite, [nom_specialite], (err2, result2) => {
        if (err2) return sendError(res, err2);
        handleSpecialite(result2.insertId);
      });
    }
  });
});

app.get('/matieres/group/:id_groupe', (req, res) => {
  const idGroupe = req.params.id_groupe;

  const sql = `
    SELECT DISTINCT m.id, m.nom, n.nom AS niveau, s.nom AS specialite
    FROM matiere m
    JOIN niveau n ON m.id_niveau = n.id
    JOIN specialite s ON n.id_specialite = s.id
    JOIN groupe g ON g.id_niveau = n.id
    WHERE g.id = ?
  `;

  console.log(`Fetching matieres for group ID: ${idGroupe}`);

  connection.query(sql, [idGroupe], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`Found ${rows.length} matieres for group ${idGroupe}:`, rows);
    res.json(rows);
  });
});

app.put('/matieres/:id', (req, res) => {
  const { nom, nom_niveau, nom_specialite } = req.body;

  if (!nom || !nom_niveau || !nom_specialite) {
    return res.status(400).json({ error: "nom, nom_niveau and nom_specialite are required" });
  }

  const findSpecialite = `SELECT id FROM specialite WHERE nom = ?`;

  connection.query(findSpecialite, [nom_specialite], (err, rows) => {
    if (err) return sendError(res, err);

    function handleSpecialite(esid) {
      const findNiveau = `SELECT id FROM niveau WHERE nom = ? AND id_specialite = ?`;

      connection.query(findNiveau, [nom_niveau, esid], (err2, nRows) => {
        if (err2) return sendError(res, err2);

        function handleNiveau(nid) {
          const updateSql = `
            UPDATE matiere SET nom = ?, id_niveau = ? WHERE id = ?
          `;
          connection.query(updateSql, [nom, nid, req.params.id], (err3, result) => {
            if (err3) return sendError(res, err3);
            res.json({ message: "Matière modifiée" });
          });
        }

        if (nRows.length > 0) handleNiveau(nRows[0].id);
        else {
          const createNiveau = `
            INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)
          `;
          connection.query(createNiveau, [nom_niveau, esid], (err3, result3) => {
            if (err3) return sendError(res, err3);
            handleNiveau(result3.insertId);
          });
        }
      });
    }

    if (rows.length > 0) handleSpecialite(rows[0].id);
    else {
      const createSpecialite = `
        INSERT INTO specialite (nom) VALUES (?)
      `;
      connection.query(createSpecialite, [nom_specialite], (err2, result2) => {
        if (err2) return sendError(res, err2);
        handleSpecialite(result2.insertId);
      });
    }
  });
});

app.delete('/matieres/:id', (req, res) => {
  const sql = "DELETE FROM matiere WHERE id = ?";

  connection.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Matiere not found" });
    }

    res.json({ message: "Matiere deleted successfully" });
  });
});

/* ---------------- SEANCES ---------------- */
app.get('/seances', (req, res) => {
  const sql = `
    SELECT s.*, 
           sal.numero AS salle_numero,
           m.nom AS matiere_nom,
           g.nom AS groupe_nom,
           u.nom AS enseignant_nom,
           u.prenom AS enseignant_prenom
    FROM seance s
    LEFT JOIN salle sal ON s.id_salle = sal.id
    LEFT JOIN matiere m ON s.id_matiere = m.id
    LEFT JOIN groupe g ON s.id_groupe = g.id
    LEFT JOIN enseignant e ON s.id_enseignant = e.id
    LEFT JOIN utilisateur u ON e.id = u.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.get('/seances/group/:id_groupe', (req, res) => {
  const groupId = req.params.id_groupe;
  const sql = `
    SELECT s.*, 
           sal.numero AS salle_numero,
           m.nom AS matiere_nom,
           g.nom AS groupe_nom,
           u.nom AS enseignant_nom,
           u.prenom AS enseignant_prenom
    FROM seance s
    LEFT JOIN salle sal ON s.id_salle = sal.id
    LEFT JOIN matiere m ON s.id_matiere = m.id
    LEFT JOIN groupe g ON s.id_groupe = g.id
    LEFT JOIN enseignant e ON s.id_enseignant = e.id
    LEFT JOIN utilisateur u ON e.id = u.id
    WHERE s.id_groupe = ?
    ORDER BY s.day_of_week, s.heure_debut
  `;
  
  console.log(`Fetching seances for group: ${groupId}`);
  
  connection.query(sql, [groupId], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`Found ${rows.length} seances for group ${groupId}`);
    res.json(rows);
  });
});

// Enhanced seance creation with conflict checking
app.post('/seances', async (req, res) => {
  const { 
    id_groupe, 
    id_matiere, 
    id_salle, 
    id_enseignant, 
    day_of_week, 
    heure_debut, 
    heure_fin 
  } = req.body;

  console.log('🔄 Creating seance:', req.body);

  // Validate required fields
  if (!id_groupe || !id_matiere || !id_salle || !id_enseignant || !heure_debut || !heure_fin) {
    return res.status(400).json({ 
      error: 'Missing required fields: id_groupe, id_matiere, id_salle, id_enseignant, heure_debut, heure_fin' 
    });
  }

  // Check for conflicts manually
  try {
    const conflictCheckSql = `
      SELECT s.*, 
             sal.numero AS salle_numero,
             m.nom AS matiere_nom,
             g.nom AS groupe_nom,
             u.nom AS enseignant_nom,
             u.prenom AS enseignant_prenom
      FROM seance s
      LEFT JOIN salle sal ON s.id_salle = sal.id
      LEFT JOIN matiere m ON s.id_matiere = m.id
      LEFT JOIN groupe g ON s.id_groupe = g.id
      LEFT JOIN enseignant e ON s.id_enseignant = e.id
      LEFT JOIN utilisateur u ON e.id = u.id
      WHERE s.day_of_week = ? 
        AND ((s.heure_debut < ? AND s.heure_fin > ?) 
          OR (s.heure_debut < ? AND s.heure_fin > ?)
          OR (s.heure_debut >= ? AND s.heure_fin <= ?))
        AND (s.id_salle = ? OR s.id_enseignant = ? OR s.id_groupe = ?)
    `;

    connection.query(conflictCheckSql, [
      day_of_week,
      heure_fin, heure_debut, // First overlap condition
      heure_debut, heure_fin, // Second overlap condition  
      heure_debut, heure_fin, // Third overlap condition
      id_salle, id_enseignant, id_groupe
    ], async (err, conflictRows) => {
      if (err) {
        console.error('Error checking conflicts:', err);
        return res.status(500).json({ error: err.message });
      }

      if (conflictRows.length > 0) {
        const conflicts = conflictRows.map(row => {
          let resource = '';
          if (row.id_salle == id_salle) resource = 'Room';
          if (row.id_enseignant == id_enseignant) resource = 'Teacher';
          if (row.id_groupe == id_groupe) resource = 'Group';
          
          return {
            resource,
            existingSeance: {
              id: row.id,
              heure_debut: row.heure_debut,
              heure_fin: row.heure_fin,
              salle_numero: row.salle_numero,
              matiere_nom: row.matiere_nom,
              enseignant_nom: `${row.enseignant_prenom} ${row.enseignant_nom}`
            }
          };
        });

        console.log(' Conflicts detected:', conflicts);
        return res.status(409).json({ 
          error: 'Seance conflict detected',
          conflicts 
        });
      }

      // No conflicts, create the seance
      const sql = `
        INSERT INTO seance 
        (id_groupe, id_matiere, id_salle, id_enseignant, day_of_week, heure_debut, heure_fin, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      connection.query(sql, [
        id_groupe, id_matiere, id_salle, id_enseignant, 
        day_of_week || null, heure_debut, heure_fin, 1
      ], (err, result) => {
        if (err) {
          console.error('Error creating seance:', err);
          return res.status(500).json({ error: err.message });
        }

        // Return the created seance with joined data
        const selectSql = `
          SELECT s.*, 
                 sal.numero AS salle_numero,
                 m.nom AS matiere_nom,
                 g.nom AS groupe_nom,
                 u.nom AS enseignant_nom,
                 u.prenom AS enseignant_prenom
          FROM seance s
          LEFT JOIN salle sal ON s.id_salle = sal.id
          LEFT JOIN matiere m ON s.id_matiere = m.id
          LEFT JOIN groupe g ON s.id_groupe = g.id
          LEFT JOIN enseignant e ON s.id_enseignant = e.id
          LEFT JOIN utilisateur u ON e.id = u.id
          WHERE s.id = ?
        `;

        connection.query(selectSql, [result.insertId], (err, rows) => {
          if (err) {
            console.error('Error fetching created seance:', err);
            return res.status(500).json({ error: err.message });
          }
          
          const newSeance = rows[0];
          console.log(' Seance created successfully:', newSeance);
          res.status(201).json(newSeance);
        });
      });
    });
  } catch (error) {
    console.error('Error in seance creation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* ---------------- UPDATE SEANCE ---------------- */
app.put('/seances/:id', (req, res) => {
  const seanceId = req.params.id;
  const { 
    id_groupe, 
    id_matiere, 
    id_salle, 
    id_enseignant, 
    day_of_week, 
    heure_debut, 
    heure_fin 
  } = req.body;

  console.log('🔄 Updating seance:', seanceId, req.body);

  // Validate required fields
  if (!id_groupe || !id_matiere || !id_salle || !id_enseignant || !heure_debut || !heure_fin) {
    return res.status(400).json({ 
      error: 'Missing required fields: id_groupe, id_matiere, id_salle, id_enseignant, heure_debut, heure_fin' 
    });
  }

  // Check for conflicts (excluding the current seance)
  const conflictCheckSql = `
    SELECT s.*, 
           sal.numero AS salle_numero,
           m.nom AS matiere_nom,
           g.nom AS groupe_nom,
           u.nom AS enseignant_nom,
           u.prenom AS enseignant_prenom
    FROM seance s
    LEFT JOIN salle sal ON s.id_salle = sal.id
    LEFT JOIN matiere m ON s.id_matiere = m.id
    LEFT JOIN groupe g ON s.id_groupe = g.id
    LEFT JOIN enseignant e ON s.id_enseignant = e.id
    LEFT JOIN utilisateur u ON e.id = u.id
    WHERE s.day_of_week = ? 
      AND s.id != ?
      AND ((s.heure_debut < ? AND s.heure_fin > ?) 
        OR (s.heure_debut < ? AND s.heure_fin > ?)
        OR (s.heure_debut >= ? AND s.heure_fin <= ?))
      AND (s.id_salle = ? OR s.id_enseignant = ? OR s.id_groupe = ?)
  `;

  connection.query(conflictCheckSql, [
    day_of_week,
    seanceId,
    heure_fin, heure_debut,
    heure_debut, heure_fin,  
    heure_debut, heure_fin,
    id_salle, id_enseignant, id_groupe
  ], (err, conflictRows) => {
    if (err) {
      console.error('Error checking conflicts:', err);
      return res.status(500).json({ error: err.message });
    }

    if (conflictRows.length > 0) {
      const conflicts = conflictRows.map(row => {
        let resource = '';
        if (row.id_salle == id_salle) resource = 'Room';
        if (row.id_enseignant == id_enseignant) resource = 'Teacher';
        if (row.id_groupe == id_groupe) resource = 'Group';
        
        return {
          resource,
          existingSeance: {
            id: row.id,
            heure_debut: row.heure_debut,
            heure_fin: row.heure_fin,
            salle_numero: row.salle_numero,
            matiere_nom: row.matiere_nom,
            enseignant_nom: `${row.enseignant_prenom} ${row.enseignant_nom}`
          }
        };
      });

      console.log(' Conflicts detected:', conflicts);
      return res.status(409).json({ 
        error: 'Seance conflict detected',
        conflicts 
      });
    }

    // No conflicts, update the seance (without updated_at)
    const updateSql = `
      UPDATE seance 
      SET id_groupe = ?, id_matiere = ?, id_salle = ?, id_enseignant = ?, 
          day_of_week = ?, heure_debut = ?, heure_fin = ?
      WHERE id = ?
    `;

    connection.query(updateSql, [
      id_groupe, id_matiere, id_salle, id_enseignant, 
      day_of_week || null, heure_debut, heure_fin, seanceId
    ], (err, result) => {
      if (err) {
        console.error('Error updating seance:', err);
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Seance not found' });
      }

      // Return the updated seance with joined data
      const selectSql = `
        SELECT s.*, 
               sal.numero AS salle_numero,
               m.nom AS matiere_nom,
               g.nom AS groupe_nom,
               u.nom AS enseignant_nom,
               u.prenom AS enseignant_prenom
        FROM seance s
        LEFT JOIN salle sal ON s.id_salle = sal.id
        LEFT JOIN matiere m ON s.id_matiere = m.id
        LEFT JOIN groupe g ON s.id_groupe = g.id
        LEFT JOIN enseignant e ON s.id_enseignant = e.id
        LEFT JOIN utilisateur u ON e.id = u.id
        WHERE s.id = ?
      `;

      connection.query(selectSql, [seanceId], (err, rows) => {
        if (err) {
          console.error('Error fetching updated seance:', err);
          return res.status(500).json({ error: err.message });
        }
        
        const updatedSeance = rows[0];
        console.log(' Seance updated successfully:', updatedSeance);
        res.json(updatedSeance);
      });
    });
  });
});

/* ---------------- DELETE SEANCE ---------------- */
app.delete('/seances/:id', (req, res) => {
  const seanceId = req.params.id;

  console.log('🗑️ Deleting seance:', seanceId);

  // First, check if the seance exists
  const checkSql = 'SELECT id FROM seance WHERE id = ?';
  
  connection.query(checkSql, [seanceId], (err, rows) => {
    if (err) {
      console.error('Error checking seance:', err);
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Seance not found' });
    }

    // Delete the seance
    const deleteSql = 'DELETE FROM seance WHERE id = ?';
    
    connection.query(deleteSql, [seanceId], (err, result) => {
      if (err) {
        console.error('Error deleting seance:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log('Seance deleted successfully');
      res.json({ 
        message: 'Seance deleted successfully',
        deletedId: seanceId
      });
    });
  });
});

/* ---------------- ENSEIGNANTS ---------------- */
app.get('/enseignants', (req, res) => {
  const sql = `
    SELECT e.*, u.nom, u.prenom 
    FROM enseignant e 
    LEFT JOIN utilisateur u ON e.id = u.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/enseignants', (req, res) => {
  const { nom, prenom } = req.body;
  if (!nom || !prenom) return res.status(400).json({ error: 'nom and prenom required' });

  const conflictSql = 'SELECT * FROM utilisateur WHERE nom = ? AND prenom = ?';
  connection.query(conflictSql, [nom, prenom], (err, rows) => {
    if (err) return sendError(res, err);
    if (rows.length > 0) return res.status(400).json({ error: 'Enseignant already exists' });

    connection.query('INSERT INTO utilisateur (nom, prenom) VALUES (?, ?)', [nom, prenom], (err, result) => {
      if (err) return sendError(res, err);
      const id = result.insertId;
      connection.query('INSERT INTO enseignant (id) VALUES (?)', [id], (err2) => {
        if (err2) return sendError(res, err2);
        res.status(201).json({ message: 'Enseignant ajouté', id });
      });
    });
  });
});

app.put('/enseignants/:id', (req, res) => {
  const { nom, prenom } = req.body;
  connection.query('UPDATE utilisateur SET nom = ?, prenom = ? WHERE id = ?', [nom, prenom, req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Enseignant modifié' });
  });
});

app.delete('/enseignants/:id', (req, res) => {
  connection.query('DELETE FROM enseignant WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], (err2) => {
      if (err2) return sendError(res, err2);
      res.json({ message: 'Enseignant supprimé' });
    });
  });
});

/* ---------------- ETUDIANTS ---------------- */

app.get('/etudiants', (req, res) => {
  const sql = `
    SELECT e.*, u.nom, u.prenom, u.email, u.cin, u.telp, 
           g.nom AS groupe, g.id_niveau,
           n.nom AS niveau_nom, 
           s.id AS specialite_id, s.nom AS specialite_nom
    FROM etudiant e 
    LEFT JOIN utilisateur u ON e.id = u.id 
    LEFT JOIN groupe g ON e.id_groupe = g.id
    LEFT JOIN niveau n ON g.id_niveau = n.id
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

// Route pour récupérer la spécialité automatique d'un groupe
app.get('/groupes/:id/specialite-auto', (req, res) => {
  const groupId = req.params.id;
  
  const sql = `
    SELECT s.id as specialite_id, s.nom as specialite_nom,
           n.id as niveau_id, n.nom as niveau_nom
    FROM groupe g
    JOIN niveau n ON g.id_niveau = n.id
    JOIN specialite s ON n.id_specialite = s.id
    WHERE g.id = ?
  `;
  
  connection.query(sql, [groupId], (err, rows) => {
    if (err) return sendError(res, err);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Aucune spécialité trouvée pour ce groupe' });
    }
    
    res.json({
      id_specialite: rows[0].specialite_id,
      specialite_nom: rows[0].specialite_nom,
      id_niveau: rows[0].niveau_id,
      niveau_nom: rows[0].niveau_nom
    });
  });
});

// NOUVELLE route POST pour étudiants avec gestion AUTOMATIQUE de la spécialité
app.post('/etudiants', (req, res) => {
  const { nom, prenom, email, cin, telp, id_groupe } = req.body;
  
  // Validation des champs requis
  if (!nom || !prenom || !id_groupe) {
    return res.status(400).json({ error: 'nom, prenom, and id_groupe are required' });
  }

  // Vérifier si l'utilisateur existe déjà
  const conflictSql = `
    SELECT * FROM utilisateur 
    WHERE (nom = ? AND prenom = ?) OR email = ? OR cin = ?
  `;
  
  connection.query(conflictSql, [nom, prenom, email, cin], (err, rows) => {
    if (err) return sendError(res, err);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Student with same name, email or CIN already exists' });
    }

    // ÉTAPE 1: Récupérer AUTOMATIQUEMENT la spécialité via les relations
    // Groupe → Niveau → Spécialité
    const getSpecialiteSql = `
      SELECT s.id as specialite_id, s.nom as specialite_nom,
             n.id as niveau_id, n.nom as niveau_nom
      FROM groupe g
      JOIN niveau n ON g.id_niveau = n.id
      JOIN specialite s ON n.id_specialite = s.id
      WHERE g.id = ?
    `;
    
    connection.query(getSpecialiteSql, [id_groupe], (err, specialiteResult) => {
      if (err) return sendError(res, err);
      
      if (specialiteResult.length === 0) {
        return res.status(400).json({ 
          error: 'Groupe sélectionné non trouvé ou sans niveau/spécialité associée' 
        });
      }

      const id_specialite = specialiteResult[0].specialite_id;
      const specialite_nom = specialiteResult[0].specialite_nom;
      const id_niveau = specialiteResult[0].niveau_id;
      const niveau_nom = specialiteResult[0].niveau_nom;

      console.log(`🎯 Relations trouvées:`);
      console.log(`   Groupe: ${id_groupe} → Niveau: ${niveau_nom} (${id_niveau}) → Spécialité: ${specialite_nom} (${id_specialite})`);

      // ÉTAPE 2: Insérer dans utilisateur
      const userSql = `
        INSERT INTO utilisateur 
        (nom, prenom, email, cin, telp, role) 
        VALUES (?, ?, ?, ?, ?, 'etudiant')
      `;
      
      connection.query(userSql, [nom, prenom, email || null, cin || null, telp || null], (err, result) => {
        if (err) return sendError(res, err);
        
        const id = result.insertId;
        
        // ÉTAPE 3: Insérer dans etudiant avec la spécialité AUTOMATIQUE
        const studentSql = `
          INSERT INTO etudiant 
          (id, id_groupe, id_specialite) 
          VALUES (?, ?, ?)
        `;
        
        connection.query(studentSql, [id, id_groupe, id_specialite], (err2) => {
          if (err2) {
            // Rollback en cas d'erreur
            connection.query('DELETE FROM utilisateur WHERE id = ?', [id]);
            return sendError(res, err2);
          }
          
          res.status(201).json({ 
            message: 'Étudiant ajouté avec succès', 
            id,
            id_groupe,
            id_specialite,
            specialite_nom,
            id_niveau,
            niveau_nom
          });
        });
      });
    });
  });
});

// NOUVELLE route PUT pour étudiants avec gestion AUTOMATIQUE de la spécialité
app.put('/etudiants/:id', (req, res) => {
  const { nom, prenom, email, cin, telp, id_groupe } = req.body;
  
  if (!nom || !prenom) {
    return res.status(400).json({ error: 'nom and prenom are required' });
  }

  // Vérifier les conflits d'email/CIN
  const conflictSql = `
    SELECT * FROM utilisateur 
    WHERE (email = ? OR cin = ?) AND id != ?
  `;
  
  connection.query(conflictSql, [email, cin, req.params.id], (err, rows) => {
    if (err) return sendError(res, err);
    if (rows.length > 0) {
      return res.status(400).json({ error: 'Email or CIN already exists for another user' });
    }

    // Si le groupe est modifié, récupérer AUTOMATIQUEMENT la nouvelle spécialité
    if (id_groupe) {
      const getSpecialiteSql = `
        SELECT s.id as specialite_id, s.nom as specialite_nom,
               n.id as niveau_id, n.nom as niveau_nom
        FROM groupe g
        JOIN niveau n ON g.id_niveau = n.id
        JOIN specialite s ON n.id_specialite = s.id
        WHERE g.id = ?
      `;
      
      connection.query(getSpecialiteSql, [id_groupe], (err, specialiteResult) => {
        if (err) return sendError(res, err);
        
        if (specialiteResult.length === 0) {
          return res.status(400).json({ error: 'Selected group not found' });
        }

        const id_specialite = specialiteResult[0].specialite_id;
        const specialite_nom = specialiteResult[0].specialite_nom;
        const id_niveau = specialiteResult[0].niveau_id;
        const niveau_nom = specialiteResult[0].niveau_nom;

        console.log(`🔄 Mise à jour automatique des relations:`);
        console.log(`   Groupe: ${id_groupe} → Niveau: ${niveau_nom} → Spécialité: ${specialite_nom}`);

        updateStudent(id_specialite, specialite_nom, id_niveau, niveau_nom);
      });
    } else {
      // Pas de changement de groupe, garder l'ancienne spécialité
      updateStudent(null, null, null, null);
    }

    function updateStudent(specialiteId, specialiteNom, niveauId, niveauNom) {
      // Mettre à jour utilisateur
      const userSql = `
        UPDATE utilisateur 
        SET nom = ?, prenom = ?, email = ?, cin = ?, telp = ? 
        WHERE id = ?
      `;
      
      connection.query(userSql, [nom, prenom, email || null, cin || null, telp || null, req.params.id], (err) => {
        if (err) return sendError(res, err);
        
        // Mettre à jour etudiant avec la spécialité AUTOMATIQUE
        let studentSql, studentParams;
        
        if (id_groupe && specialiteId) {
          studentSql = `
            UPDATE etudiant 
            SET id_groupe = ?, id_specialite = ? 
            WHERE id = ?
          `;
          studentParams = [id_groupe, specialiteId, req.params.id];
        } else if (id_groupe) {
          // Garder l'ancienne spécialité si seul le groupe change
          studentSql = `
            UPDATE etudiant 
            SET id_groupe = ? 
            WHERE id = ?
          `;
          studentParams = [id_groupe, req.params.id];
        } else {
          // Pas de changement de groupe
          res.json({ message: 'Étudiant modifié' });
          return;
        }
        
        connection.query(studentSql, studentParams, (err2) => {
          if (err2) return sendError(res, err2);
          res.json({ 
            message: 'Étudiant modifié avec succès',
            id_groupe,
            id_specialite: specialiteId,
            specialite_nom: specialiteNom,
            id_niveau: niveauId,
            niveau_nom: niveauNom
          });
        });
      });
    }
  });
});

app.delete('/etudiants/:id', (req, res) => {
  connection.query('DELETE FROM etudiant WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], (err2) => {
      if (err2) return sendError(res, err2);
      res.json({ message: 'Étudiant supprimé' });
    });
  });
});

/* ---------------- SALLES ---------------- */
app.get('/salles', (req, res) => {
  const sql = 'SELECT * FROM salle';
  connection.query(sql, (err, rows) => {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/salles', (req, res) => {
  const { numero, type, capacite } = req.body;
  if (!numero) return res.status(400).json({ error: 'numero is required' });
  
  connection.query('INSERT INTO salle (numero, type, capacite) VALUES (?, ?, ?)', 
    [numero, type || 'cours', capacite || 30], (err, result) => {
    if (err) return sendError(res, err);
    res.status(201).json({ message: 'Salle ajoutée', id: result.insertId });
  });
});

app.put('/salles/:id', (req, res) => {
  const { numero, type, capacite } = req.body;
  connection.query('UPDATE salle SET numero = ?, type = ?, capacite = ? WHERE id = ?', 
    [numero, type, capacite, req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Salle modifiée' });
  });
});

app.delete('/salles/:id', (req, res) => {
  connection.query('DELETE FROM salle WHERE id = ?', [req.params.id], (err) => {
    if (err) return sendError(res, err);
    res.json({ message: 'Salle supprimée' });
  });
});

// Create a simple mock models object for GraphQL
const mockModels = {
  Seance: {
    findAll: () => Promise.resolve([]),
    create: () => Promise.resolve({ id: 1 }),
    findByPk: () => Promise.resolve({}),
    update: () => Promise.resolve([1]),
    destroy: () => Promise.resolve(1)
  },
  Salle: {},
  Matiere: {},
  Groupe: {},
  Enseignant: {}
};

console.log(' Using mock models for GraphQL');

const server = new ApolloServer({
  typeDefs: seanceTypeDefs,
  resolvers: seanceResolvers,
  context: () => ({
    models: mockModels, // Use mock models
    checkConflict,
  }),
});

async function startServer() {
  try {
    await server.start();
    server.applyMiddleware({ app, path: '/graphql', cors: false });
    
    app.listen(PORT, () => {
      console.log(`🚀 Admin service lancé sur http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error('Error starting Apollo Server:', error);
  }
}

startServer();
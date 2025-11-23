const express = require('express');
const mysql = require('mysql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =================== MySQL =================== */

var connection = mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'platforme'
});

connection.connect(function (err) {
  if (err) {
    console.error('Erreur connexion MySQL:', err);
    process.exit(1);
  }
  console.log(' Connecté à MySQL');
});

function sendError(res, err) {
  console.error(err);
  res.status(500).json({ error: err && err.message ? err.message : err });
}

/* =================== ROUTES =================== */

app.get('/', function (req, res) {
  res.send('Service Administratif (API) - Node.js + MySQL');
});

/* -------------------------------------------
    1) DEPARTEMENTS
-------------------------------------------- */
app.get('/departements', function (req, res) {
  var sql = `
    SELECT d.*, u.nom AS chef_nom, u.prenom AS chef_prenom 
    FROM departement d 
    LEFT JOIN chef c ON d.id_chef = c.id 
    LEFT JOIN enseignant e ON c.id = e.id 
    LEFT JOIN utilisateur u ON e.id = u.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.get('/departements/:id', function (req, res) {
  var sql = `
    SELECT d.*, u.nom AS chef_nom, u.prenom AS chef_prenom 
    FROM departement d 
    LEFT JOIN chef c ON d.id_chef = c.id 
    LEFT JOIN enseignant e ON c.id = e.id 
    LEFT JOIN utilisateur u ON e.id = u.id 
    WHERE d.id = ?
  `;

  connection.query(sql, [req.params.id], function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows[0] || null);
  });
});

app.post('/departements', function (req, res) {
  var nom = req.body.nom;
  var nom_chef = req.body.nom_chef || null;

  function findChefId(cb) {
    if (!nom_chef) return cb(null, null);
    
    var sql = `
      SELECT e.id 
      FROM enseignant e 
      JOIN utilisateur u ON e.id = u.id 
      WHERE u.nom = ? OR u.prenom = ? OR CONCAT(u.prenom, ' ', u.nom) = ?
      LIMIT 1
    `;
    
    connection.query(sql, [nom_chef, nom_chef, nom_chef], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        // Vérifier si cet enseignant est déjà chef
        connection.query('SELECT id FROM chef WHERE id = ?', [rows[0].id], function (err2, chefRows) {
          if (err2) return cb(err2);
          if (chefRows && chefRows.length > 0) {
            cb(null, rows[0].id);
          } else {
            // Créer le chef
            connection.query('INSERT INTO chef (id, date_nomination) VALUES (?, CURDATE())', [rows[0].id], function (err3) {
              if (err3) return cb(err3);
              cb(null, rows[0].id);
            });
          }
        });
      } else {
        cb(new Error('Enseignant non trouvé'));
      }
    });
  }

  findChefId(function (err, chefId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'INSERT INTO departement (nom, id_chef) VALUES (?, ?)',
      [nom, chefId],
      function (err, result) {
        if (err) return sendError(res, err);
        res.status(201).json({ message: 'Département ajouté', id: result.insertId });
      }
    );
  });
});

app.put('/departements/:id', function (req, res) {
  var nom = req.body.nom;
  var nom_chef = req.body.nom_chef || null;

  function findChefId(cb) {
    if (!nom_chef) return cb(null, null);
    
    var sql = `
      SELECT e.id 
      FROM enseignant e 
      JOIN utilisateur u ON e.id = u.id 
      WHERE u.nom = ? OR u.prenom = ? OR CONCAT(u.prenom, ' ', u.nom) = ?
      LIMIT 1
    `;
    
    connection.query(sql, [nom_chef, nom_chef, nom_chef], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        connection.query('SELECT id FROM chef WHERE id = ?', [rows[0].id], function (err2, chefRows) {
          if (err2) return cb(err2);
          if (chefRows && chefRows.length > 0) {
            cb(null, rows[0].id);
          } else {
            connection.query('INSERT INTO chef (id, date_nomination) VALUES (?, CURDATE())', [rows[0].id], function (err3) {
              if (err3) return cb(err3);
              cb(null, rows[0].id);
            });
          }
        });
      } else {
        cb(new Error('Enseignant non trouvé'));
      }
    });
  }

  findChefId(function (err, chefId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'UPDATE departement SET nom = ?, id_chef = ? WHERE id = ?',
      [nom, chefId, req.params.id],
      function (err) {
        if (err) return sendError(res, err);
        res.json({ message: 'Département modifié' });
      }
    );
  });
});

app.delete('/departements/:id', function (req, res) {
  connection.query('DELETE FROM departement WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.json({ message: 'Département supprimé' });
  });
});

/* -------------------------------------------
    2) SPECIALITES
-------------------------------------------- */
app.get('/specialites', function (req, res) {
  var sql = `
    SELECT s.*, d.nom AS departement 
    FROM specialite s 
    LEFT JOIN departement d ON s.id_departement = d.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/specialites', function (req, res) {
  var nom = req.body.nom;
  var nom_departement = req.body.nom_departement; // ⬅️ choisir le nom

  if (!nom) return res.status(400).json({ error: 'nom is required' });
  if (!nom_departement) return res.status(400).json({ error: 'nom_departement is required' });

  // Trouver le département par son nom (sans création)
  connection.query(
    'SELECT id FROM departement WHERE nom = ?',
    [nom_departement],
    function (err, rows) {
      if (err) return sendError(res, err);

      // Département n'existe pas → erreur
      if (!rows || rows.length === 0) {
        return res.status(400).json({ error: 'Departement not found' });
      }

      var departementId = rows[0].id;

      // Ajouter la spécialité
      connection.query(
        'INSERT INTO specialite (nom, id_departement) VALUES (?, ?)',
        [nom, departementId],
        function (err, result) {
          if (err) return sendError(res, err);
          res.status(201).json({ message: 'Spécialité ajoutée', id: result.insertId });
        }
      );
    }
  );
});


app.put('/specialites/:id', function (req, res) {
  var nom = req.body.nom;
  var nom_departement = req.body.nom_departement || null;

  function findDepartementId(cb) {
    if (!nom_departement) return cb(null, null);
    
    connection.query('SELECT id FROM departement WHERE nom = ?', [nom_departement], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        connection.query('INSERT INTO departement (nom) VALUES (?)', [nom_departement], function (err2, result) {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }

  findDepartementId(function (err, departementId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'UPDATE specialite SET nom = ?, id_departement = ? WHERE id = ?',
      [nom, departementId, req.params.id],
      function (err) {
        if (err) return sendError(res, err);
        res.json({ message: 'Spécialité modifiée' });
      }
    );
  });
});

app.delete('/specialites/:id', function (req, res) {
  connection.query('DELETE FROM specialite WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.json({ message: 'Spécialité supprimée' });
  });
});

/* -------------------------------------------
    3) NIVEAUX
-------------------------------------------- */
app.get('/niveaux', function (req, res) {
  var sql = `
    SELECT n.*, s.nom AS specialite 
    FROM niveau n 
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/niveaux', function (req, res) {
  var nom = req.body.nom;
  var nom_specialite = req.body.nom_specialite;

  if (!nom || !nom_specialite) return res.status(400).json({ error: 'nom and nom_specialite are required' });

  function findSpecialiteId(cb) {
    connection.query('SELECT id FROM specialite WHERE nom = ?', [nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        // Créer la spécialité si elle n'existe pas
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], function (err2, result) {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }

  findSpecialiteId(function (err, specialiteId) {
    if (err) return sendError(res, err);
    
    connection.query('INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)', [nom, specialiteId], function (err, result) {
      if (err) return sendError(res, err);
      res.status(201).json({ message: 'Niveau ajouté', id: result.insertId });
    });
  });
});

app.put('/niveaux/:id', function (req, res) {
  var nom = req.body.nom;
  var nom_specialite = req.body.nom_specialite;

  function findSpecialiteId(cb) {
    connection.query('SELECT id FROM specialite WHERE nom = ?', [nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], function (err2, result) {
          if (err2) return cb(err2);
          cb(null, result.insertId);
        });
      }
    });
  }

  findSpecialiteId(function (err, specialiteId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'UPDATE niveau SET nom = ?, id_specialite = ? WHERE id = ?',
      [nom, specialiteId, req.params.id],
      function (err) {
        if (err) return sendError(res, err);
        res.json({ message: 'Niveau modifié' });
      }
    );
  });
});

app.delete('/niveaux/:id', function (req, res) {
  connection.query('DELETE FROM niveau WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.json({ message: 'Niveau supprimé' });
  });
});

/* -------------------------------------------
    4) GROUPES
-------------------------------------------- */
app.get('/groupes', function (req, res) {
  var sql = `
    SELECT g.*, n.nom AS niveau, s.nom AS specialite 
    FROM groupe g 
    LEFT JOIN niveau n ON g.id_niveau = n.id 
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/groupes', function (req, res) {
  var nom_niveau = req.body.nom_niveau;
  var nom_specialite = req.body.nom_specialite;

  if (!nom_niveau || !nom_specialite) return res.status(400).json({ error: 'nom_niveau and nom_specialite are required' });

  function findNiveauId(cb) {
    var sql = `
      SELECT n.id 
      FROM niveau n 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE n.nom = ? AND s.nom = ?
    `;
    
    connection.query(sql, [nom_niveau, nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        // Créer la spécialité et le niveau s'ils n'existent pas
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], function (err2, result2) {
          if (err2) return cb(err2);
          var specialiteId = result2.insertId;
          connection.query('INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)', [nom_niveau, specialiteId], function (err3, result3) {
            if (err3) return cb(err3);
            cb(null, result3.insertId);
          });
        });
      }
    });
  }

  findNiveauId(function (err, niveauId) {
    if (err) return sendError(res, err);

    // Compter les étudiants pour cette spécialité et niveau
    var countSql = `
      SELECT COUNT(*) AS cnt 
      FROM etudiant e 
      JOIN specialite s ON e.id_specialite = s.id 
      JOIN groupe g ON e.id_groupe = g.id 
      JOIN niveau n ON g.id_niveau = n.id 
      WHERE s.nom = ? AND n.nom = ?
    `;
    
    connection.query(countSql, [nom_specialite, nom_niveau], function (err, countRows) {
      if (err) return sendError(res, err);
      
      var count = countRows && countRows[0] && countRows[0].cnt ? countRows[0].cnt : 0;
      var index = Math.ceil((count + 1) / 30);
      if (index < 1) index = 1;
      
      // Première lettre du niveau
      var firstLetter = (nom_niveau || '').trim().charAt(0) || '';
      var groupName = nom_specialite + firstLetter + index;

      connection.query('INSERT INTO groupe (nom, id_niveau) VALUES (?, ?)', [groupName, niveauId], function (err, result) {
        if (err) return sendError(res, err);
        res.status(201).json({ 
          message: 'Groupe ajouté', 
          id: result.insertId, 
          nom: groupName, 
          index: index,
          niveau: nom_niveau,
          specialite: nom_specialite
        });
      });
    });
  });
});

app.put('/groupes/:id', function (req, res) {
  var nom = req.body.nom;
  var nom_niveau = req.body.nom_niveau;
  var nom_specialite = req.body.nom_specialite;

  function findNiveauId(cb) {
    if (!nom_niveau || !nom_specialite) return cb(null, null);
    
    var sql = `
      SELECT n.id 
      FROM niveau n 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE n.nom = ? AND s.nom = ?
    `;
    
    connection.query(sql, [nom_niveau, nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        cb(new Error('Niveau non trouvé'));
      }
    });
  }

  findNiveauId(function (err, niveauId) {
    if (err) return sendError(res, err);
    
    var updateData = [];
    var updateFields = [];
    
    if (nom) {
      updateFields.push('nom = ?');
      updateData.push(nom);
    }
    
    if (niveauId) {
      updateFields.push('id_niveau = ?');
      updateData.push(niveauId);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }
    
    updateData.push(req.params.id);
    
    connection.query(`UPDATE groupe SET ${updateFields.join(', ')} WHERE id = ?`, updateData, function (err) {
      if (err) return sendError(res, err);
      res.json({ message: 'Groupe modifié' });
    });
  });
});

app.delete('/groupes/:id', function (req, res) {
  connection.query('DELETE FROM groupe WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.json({ message: 'Groupe supprimé' });
  });
});

/* -------------------------------------------
    5) MATIERES
-------------------------------------------- */
app.get('/matieres', function (req, res) {
  var sql = `
    SELECT m.*, n.nom AS niveau, s.nom AS specialite 
    FROM matiere m 
    LEFT JOIN niveau n ON m.id_niveau = n.id 
    LEFT JOIN specialite s ON n.id_specialite = s.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/matieres', function (req, res) {
  var nom = req.body.nom;
  var nom_niveau = req.body.nom_niveau;
  var nom_specialite = req.body.nom_specialite;

  if (!nom || !nom_niveau || !nom_specialite) {
    return res.status(400).json({ error: 'nom, nom_niveau and nom_specialite are required' });
  }

  function findNiveauId(cb) {
    var sql = `
      SELECT n.id 
      FROM niveau n 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE n.nom = ? AND s.nom = ?
    `;
    
    connection.query(sql, [nom_niveau, nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        // Créer la spécialité et le niveau s'ils n'existent pas
        connection.query('INSERT INTO specialite (nom) VALUES (?)', [nom_specialite], function (err2, result2) {
          if (err2) return cb(err2);
          var specialiteId = result2.insertId;
          connection.query('INSERT INTO niveau (nom, id_specialite) VALUES (?, ?)', [nom_niveau, specialiteId], function (err3, result3) {
            if (err3) return cb(err3);
            cb(null, result3.insertId);
          });
        });
      }
    });
  }

  findNiveauId(function (err, niveauId) {
    if (err) return sendError(res, err);
    
    connection.query('INSERT INTO matiere (nom, id_niveau) VALUES (?, ?)', [nom, niveauId], function (err, result) {
      if (err) return sendError(res, err);
      res.status(201).json({ message: 'Matière ajoutée', id: result.insertId });
    });
  });
});

app.put('/matieres/:id', function (req, res) {
  var nom = req.body.nom;
  var nom_niveau = req.body.nom_niveau;
  var nom_specialite = req.body.nom_specialite;

  function findNiveauId(cb) {
    if (!nom_niveau || !nom_specialite) return cb(null, null);
    
    var sql = `
      SELECT n.id 
      FROM niveau n 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE n.nom = ? AND s.nom = ?
    `;
    
    connection.query(sql, [nom_niveau, nom_specialite], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].id);
      } else {
        cb(new Error('Niveau non trouvé'));
      }
    });
  }

  findNiveauId(function (err, niveauId) {
    if (err) return sendError(res, err);
    
    var updateData = [nom];
    var updateFields = ['nom = ?'];
    
    if (niveauId) {
      updateFields.push('id_niveau = ?');
      updateData.push(niveauId);
    }
    
    updateData.push(req.params.id);
    
    connection.query(`UPDATE matiere SET ${updateFields.join(', ')} WHERE id = ?`, updateData, function (err) {
      if (err) return sendError(res, err);
      res.json({ message: 'Matière modifiée' });
    });
  });
});

app.delete('/matieres/:id', function (req, res) {
  connection.query('DELETE FROM matiere WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    res.json({ message: 'Matière supprimée' });
  });
});

/* -------------------------------------------
    6) ENSEIGNANTS
-------------------------------------------- */
app.get('/enseignants', function (req, res) {
  var sql = `
    SELECT e.id, u.nom, u.prenom, u.email, u.cin, u.telp, u.image, u.role 
    FROM enseignant e 
    JOIN utilisateur u ON e.id = u.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/enseignants', function (req, res) {
  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var email = req.body.email;
  var cin = typeof req.body.cin !== 'undefined' ? req.body.cin : null;
  var telp = typeof req.body.telp !== 'undefined' ? req.body.telp : null;
  var image = req.body.image || null;
  var mdp_hash = req.body.mdp_hash || null;

  if (!nom || !prenom || !email) return res.status(400).json({ error: 'nom, prenom and email are required' });

  connection.query(
    'INSERT INTO utilisateur (nom, prenom, email, cin, telp, image, mdp_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nom, prenom, email, cin || null, telp || null, image, mdp_hash, 'enseignant'],
    function (err, result) {
      if (err) return sendError(res, err);
      var userId = result.insertId;
      connection.query('INSERT INTO enseignant (id) VALUES (?)', [userId], function (err2) {
        if (err2) return sendError(res, err2);
        res.status(201).json({ message: 'Enseignant créé', id: userId });
      });
    }
  );
});

app.put('/enseignants/:id', function (req, res) {
  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var email = req.body.email;
  var cin = typeof req.body.cin !== 'undefined' ? req.body.cin : null;
  var telp = typeof req.body.telp !== 'undefined' ? req.body.telp : null;
  var image = req.body.image || null;
  var mdp_hash = req.body.mdp_hash || null;

  connection.query(
    'UPDATE utilisateur SET nom=?, prenom=?, email=?, cin=?, telp=?, image=?, mdp_hash=? WHERE id=?',
    [nom, prenom, email, cin || null, telp || null, image, mdp_hash, req.params.id],
    function (err) {
      if (err) return sendError(res, err);
      res.json({ message: 'Enseignant modifié' });
    }
  );
});

app.delete('/enseignants/:id', function (req, res) {
  connection.query('DELETE FROM enseignant WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], function (err2) {
      if (err2) return sendError(res, err2);
      res.json({ message: 'Enseignant supprimé' });
    });
  });
});

/* -------------------------------------------
    7) ETUDIANTS
-------------------------------------------- */
app.get('/etudiants', function (req, res) {
  var sql = `
    SELECT e.id, u.nom, u.prenom, u.email, u.cin, u.telp, u.image, g.nom AS groupe, s.nom AS specialite 
    FROM etudiant e 
    JOIN utilisateur u ON e.id = u.id 
    LEFT JOIN groupe g ON e.id_groupe = g.id 
    LEFT JOIN specialite s ON e.id_specialite = s.id
  `;

  connection.query(sql, function (err, rows) {
    if (err) return sendError(res, err);
    res.json(rows);
  });
});

app.post('/etudiants', function (req, res) {
  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var email = req.body.email;
  var cin = req.body.cin || null;
  var telp = req.body.telp || null;
  var image = req.body.image || null;
  var mdp_hash = req.body.mdp_hash || null;
  var name_groupe = req.body.name_groupe || null;

  if (!nom || !prenom || !email) return res.status(400).json({ error: 'nom, prenom and email are required' });

  function findGroupeAndSpecialite(cb) {
    if (!name_groupe) return cb(null, null, null);
    
    var sql = `
      SELECT g.id AS groupe_id, s.id AS specialite_id 
      FROM groupe g 
      JOIN niveau n ON g.id_niveau = n.id 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE g.nom = ?
    `;
    
    connection.query(sql, [name_groupe], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].groupe_id, rows[0].specialite_id);
      } else {
        cb(new Error('Groupe non trouvé'));
      }
    });
  }

  findGroupeAndSpecialite(function (err, groupeId, specialiteId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'INSERT INTO utilisateur (nom, prenom, email, cin, telp, image, mdp_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, cin, telp, image, mdp_hash, 'etudiant'],
      function (err, result) {
        if (err) return sendError(res, err);
        var userId = result.insertId;
        connection.query('INSERT INTO etudiant (id, id_groupe, id_specialite) VALUES (?, ?, ?)', [userId, groupeId, specialiteId], function (err2) {
          if (err2) return sendError(res, err2);
          res.status(201).json({ message: 'Étudiant créé', id: userId });
        });
      }
    );
  });
});

app.put('/etudiants/:id', function (req, res) {
  var nom = req.body.nom;
  var prenom = req.body.prenom;
  var email = req.body.email;
  var cin = req.body.cin || null;
  var telp = req.body.telp || null;
  var image = req.body.image || null;
  var mdp_hash = req.body.mdp_hash || null;
  var name_groupe = req.body.name_groupe || null;

  function findGroupeAndSpecialite(cb) {
    if (!name_groupe) return cb(null, null, null);
    
    var sql = `
      SELECT g.id AS groupe_id, s.id AS specialite_id 
      FROM groupe g 
      JOIN niveau n ON g.id_niveau = n.id 
      JOIN specialite s ON n.id_specialite = s.id 
      WHERE g.nom = ?
    `;
    
    connection.query(sql, [name_groupe], function (err, rows) {
      if (err) return cb(err);
      if (rows && rows.length > 0) {
        cb(null, rows[0].groupe_id, rows[0].specialite_id);
      } else {
        cb(new Error('Groupe non trouvé'));
      }
    });
  }

  findGroupeAndSpecialite(function (err, groupeId, specialiteId) {
    if (err) return sendError(res, err);
    
    connection.query(
      'UPDATE utilisateur SET nom=?, prenom=?, email=?, cin=?, telp=?, image=?, mdp_hash=? WHERE id=?',
      [nom, prenom, email, cin, telp, image, mdp_hash, req.params.id],
      function (err) {
        if (err) return sendError(res, err);
        
        if (groupeId !== null || specialiteId !== null) {
          connection.query('UPDATE etudiant SET id_groupe=?, id_specialite=? WHERE id=?', [groupeId, specialiteId, req.params.id], function (err2) {
            if (err2) return sendError(res, err2);
            res.json({ message: 'Étudiant modifié' });
          });
        } else {
          res.json({ message: 'Étudiant modifié' });
        }
      }
    );
  });
});

app.delete('/etudiants/:id', function (req, res) {
  connection.query('DELETE FROM etudiant WHERE id = ?', [req.params.id], function (err) {
    if (err) return sendError(res, err);
    connection.query('DELETE FROM utilisateur WHERE id = ?', [req.params.id], function (err2) {
      if (err2) return sendError(res, err2);
      res.json({ message: 'Étudiant supprimé' });
    });
  });
});



/* START SERVER */
app.listen(PORT, function () {
  console.log(' Server ON : http://localhost:' + PORT);
});
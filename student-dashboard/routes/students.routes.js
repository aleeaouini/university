const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Protect all student routes
router.use(auth);

// Log API calls
router.use((req, res, next) => {
  console.log(`Student route accessed: ${req.method} ${req.path}`);
  console.log('Authenticated user:', req.user);
  next();
});

// GET schedule - Shows only sessions for the student's group
router.get('/schedule', (req, res) => {
  const studentId = req.user?.id || req.user?.sub;
  if (!studentId) return res.status(401).json({ error: 'User not authenticated' });

  console.log(`[Schedule] Fetching schedule for student ID: ${studentId}`);

  // First, get the student's group
  const getGroupSql = `SELECT id_groupe FROM etudiant WHERE id = ?`;
  
  db.query(getGroupSql, [studentId], (err, studentRows) => {
    if (err) {
      console.error('[Schedule] Error fetching student group:', err);
      return res.status(500).json({ error: err.message });
    }

    if (!studentRows || studentRows.length === 0) {
      console.log('[Schedule] Student not found or has no group');
      return res.json([]); // Return empty schedule
    }

    const studentGroupId = studentRows[0].id_groupe;
    
    if (!studentGroupId) {
      console.log('[Schedule] Student has no assigned group');
      return res.json([]); // Return empty schedule
    }

    console.log(`[Schedule] Student belongs to group ID: ${studentGroupId}`);

    // Now get all sessions for this specific group
    const scheduleSql = `
      SELECT 
        s.id AS seance_id,
        s.day_of_week,
        s.heure_debut,
        s.heure_fin,
        s.id_groupe,
        m.nom AS matiere,
        m.id AS matiere_id,
        u.prenom AS enseignant_prenom,
        u.nom AS enseignant_nom,
        sal.numero AS salle,
        sal.id AS salle_id,
        g.nom AS groupe_nom
      FROM seance s
      JOIN matiere m ON s.id_matiere = m.id
      JOIN enseignant ens ON s.id_enseignant = ens.id
      JOIN utilisateur u ON ens.id = u.id
      JOIN salle sal ON sal.id = s.id_salle
      JOIN groupe g ON s.id_groupe = g.id
      WHERE s.id_groupe = ?
      ORDER BY s.day_of_week, s.heure_debut
    `;

    db.query(scheduleSql, [studentGroupId], (err, rows) => {
      if (err) {
        console.error('[Schedule] Error fetching schedule:', err);
        return res.status(500).json({ error: err.message });
      }

      console.log(`[Schedule] Found ${rows.length} sessions for group ${studentGroupId}`);
      res.json(rows);
    });
  });
});

// GET absences
router.get('/absences', (req, res) => {
  const studentId = req.user?.id || req.user?.sub;
  if (!studentId) return res.status(401).json({ error: "User not authenticated" });

  console.log(`[Absences] Fetching absences for student ID: ${studentId}`);

  const sql = `
    SELECT a.id, a.date, a.statut,
           s.heure_debut, s.heure_fin, s.day_of_week,
           m.nom AS matiere,
           m.id AS matiere_id
    FROM absence a
    JOIN seance s ON a.id_seance = s.id
    JOIN matiere m ON s.id_matiere = m.id
    WHERE a.id_etudiant = ?
    ORDER BY a.date DESC
  `;

  db.query(sql, [studentId], (err, rows) => {
    if (err) {
      console.error('[Absences] Error fetching absences:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`[Absences] Found ${rows.length} absence records`);
    res.json(rows);
  });
});

// GET summary
router.get('/summary', (req, res) => {
  const studentId = req.user?.id || req.user?.sub;
  if (!studentId) return res.status(401).json({ error: "User not authenticated" });

  console.log(`[Summary] Fetching summary for student ID: ${studentId}`);

  const sql = `
    SELECT m.id AS matiere_id, m.nom AS matiere, 
           SUM(CASE WHEN a.statut = 'absent' THEN 1 ELSE 0 END) AS absences,
           COUNT(*) AS total_sessions
    FROM absence a
    JOIN seance s ON a.id_seance = s.id
    JOIN matiere m ON s.id_matiere = m.id
    WHERE a.id_etudiant = ?
    GROUP BY m.id, m.nom
    ORDER BY m.nom
  `;

  db.query(sql, [studentId], (err, rows) => {
    if (err) {
      console.error('[Summary] Error fetching summary:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`[Summary] Found ${rows.length} subjects with attendance records`);
    res.json(rows);
  });
});

// GET student info (bonus endpoint to verify group assignment)
router.get('/info', (req, res) => {
  const studentId = req.user?.id || req.user?.sub;
  if (!studentId) return res.status(401).json({ error: "User not authenticated" });

  const sql = `
    SELECT 
      e.id,
      e.id_groupe,
      e.id_specialite,
      u.nom,
      u.prenom,
      u.email,
      u.telp,
      g.nom AS groupe_nom,
      s.nom AS specialite_nom
    FROM etudiant e
    JOIN utilisateur u ON e.id = u.id
    LEFT JOIN groupe g ON e.id_groupe = g.id
    LEFT JOIN specialite s ON e.id_specialite = s.id
    WHERE e.id = ?
  `;

  db.query(sql, [studentId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(rows[0]);
  });
});

module.exports = router;
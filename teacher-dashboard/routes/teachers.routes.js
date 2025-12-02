const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Protect all teacher routes
router.use(auth);

// Logging middleware
router.use((req, res, next) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Teacher route: ${req.method} ${req.path}`);
  console.log('User:', req.user);
  console.log('='.repeat(60));
  next();
});

// ============================================
// GET TEACHER'S SCHEDULE (WITH VERIFICATION)
// ============================================
router.get('/schedule', (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });

  console.log(`[Teacher Schedule] Fetching for teacher ID: ${teacherId}`);

  // First, verify the teacher exists and has the correct role
  const verifyTeacherSql = `
    SELECT id, role 
    FROM utilisateur 
    WHERE id = ? AND role = 'enseignant'
  `;

  db.query(verifyTeacherSql, [teacherId], (err, teacherRows) => {
    if (err) {
      console.error('[Teacher Schedule] Verification error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (teacherRows.length === 0) {
      console.log('[Teacher Schedule] Access denied - not a valid teacher');
      return res.status(403).json({ error: 'Access denied - invalid teacher credentials' });
    }

    // Now fetch the schedule - ONLY for sessions assigned to THIS teacher
    const sql = `
      SELECT 
        s.id AS seance_id,
        s.day_of_week,
        s.heure_debut,
        s.heure_fin,
        s.id_enseignant,
        m.nom AS matiere,
        m.id AS matiere_id,
        g.nom AS groupe_nom,
        g.id AS groupe_id,
        sal.numero AS salle,
        sal.id AS salle_id,
        COUNT(DISTINCT e.id) AS nb_etudiants
      FROM seance s
      JOIN matiere m ON s.id_matiere = m.id
      JOIN groupe g ON s.id_groupe = g.id
      JOIN salle sal ON s.id_salle = sal.id
      LEFT JOIN etudiant e ON e.id_groupe = g.id
      WHERE s.id_enseignant = ?
      GROUP BY s.id, s.day_of_week, s.heure_debut, s.heure_fin, 
               s.id_enseignant, m.nom, m.id, g.nom, g.id, sal.numero, sal.id
      ORDER BY s.day_of_week, s.heure_debut
    `;

    db.query(sql, [teacherId], (err, rows) => {
      if (err) {
        console.error('[Teacher Schedule] Error:', err);
        return res.status(500).json({ error: err.message });
      }

      // Double-check that all returned sessions belong to this teacher
      const invalidSessions = rows.filter(row => row.id_enseignant !== teacherId);
      if (invalidSessions.length > 0) {
        console.error('[Teacher Schedule] Security violation - mismatched teacher IDs');
        return res.status(500).json({ error: 'Data integrity error' });
      }

      console.log(`[Teacher Schedule] Found ${rows.length} sessions for teacher ${teacherId}`);
      
      // Remove id_enseignant from response for cleaner output
      const cleanedRows = rows.map(({ id_enseignant, ...rest }) => rest);
      
      res.json(cleanedRows);
    });
  });
});

// ============================================
// GET TODAY'S SESSIONS (for attendance)
// ============================================
router.get('/today-sessions', (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });

  // Get current day of week (1=Monday, 7=Sunday)
  const today = new Date().getDay();
  const dayOfWeek = today === 0 ? 7 : today;

  console.log(`[Today Sessions] Teacher ${teacherId}, Day: ${dayOfWeek}`);

  // Verify teacher and fetch sessions in one query
  const sql = `
    SELECT 
      s.id AS seance_id,
      s.heure_debut,
      s.heure_fin,
      s.is_presente,
      s.id_enseignant,
      m.nom AS matiere,
      g.nom AS groupe_nom,
      g.id AS groupe_id,
      sal.numero AS salle,
      COUNT(DISTINCT e.id) AS nb_etudiants
    FROM seance s
    JOIN matiere m ON s.id_matiere = m.id
    JOIN groupe g ON s.id_groupe = g.id
    JOIN salle sal ON s.id_salle = sal.id
    LEFT JOIN etudiant e ON e.id_groupe = g.id
    WHERE s.id_enseignant = ? AND s.day_of_week = ?
    GROUP BY s.id, s.heure_debut, s.heure_fin, s.is_presente,
             s.id_enseignant, m.nom, g.nom, g.id, sal.numero
    ORDER BY s.heure_debut
  `;

  db.query(sql, [teacherId, dayOfWeek], (err, rows) => {
    if (err) {
      console.error('[Today Sessions] Error:', err);
      return res.status(500).json({ error: err.message });
    }

    // Verify all sessions belong to this teacher
    const invalidSessions = rows.filter(row => row.id_enseignant !== teacherId);
    if (invalidSessions.length > 0) {
      console.error('[Today Sessions] Security violation - mismatched teacher IDs');
      return res.status(500).json({ error: 'Data integrity error' });
    }

    console.log(`[Today Sessions] Found ${rows.length} sessions`);
    
    // Clean response
    const cleanedRows = rows.map(({ id_enseignant, ...rest }) => rest);
    res.json(cleanedRows);
  });
});

// ============================================
// GET STUDENTS FOR A SPECIFIC SESSION
// ============================================
router.get('/seance/:seanceId/students', (req, res) => {
  const teacherId = req.user?.id;
  const { seanceId } = req.params;

  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });

  console.log(`[Get Students] Seance ${seanceId}, Teacher ${teacherId}`);

  // First verify this session belongs to this teacher
  const verifySql = `SELECT id FROM seance WHERE id = ? AND id_enseignant = ?`;
  
  db.query(verifySql, [seanceId, teacherId], (err, verifyRows) => {
    if (err) {
      console.error('[Get Students] Verification error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (verifyRows.length === 0) {
      console.log(`[Get Students] Access denied - session ${seanceId} does not belong to teacher ${teacherId}`);
      return res.status(403).json({ error: 'Access denied to this session' });
    }

    // Get students and their attendance status for today
    const sql = `
      SELECT 
        e.id AS etudiant_id,
        u.nom,
        u.prenom,
        u.email,
        u.image,
        COALESCE(a.statut, 'non_marque') AS statut,
        a.id AS absence_id,
        a.date AS absence_date
      FROM seance s
      JOIN groupe g ON s.id_groupe = g.id
      JOIN etudiant e ON e.id_groupe = g.id
      JOIN utilisateur u ON e.id = u.id
      LEFT JOIN absence a ON a.id_etudiant = e.id 
        AND a.id_seance = ? 
        AND a.date = CURDATE()
      WHERE s.id = ?
      ORDER BY u.nom, u.prenom
    `;

    db.query(sql, [seanceId, seanceId], (err, rows) => {
      if (err) {
        console.error('[Get Students] Error:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log(`[Get Students] Found ${rows.length} students`);
      res.json(rows);
    });
  });
});

// ============================================
// MARK ATTENDANCE FOR A SESSION
// ============================================
router.post('/seance/:seanceId/attendance', (req, res) => {
  const teacherId = req.user?.id;
  const { seanceId } = req.params;
  const { attendanceData } = req.body;

  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });
  if (!attendanceData || !Array.isArray(attendanceData)) {
    return res.status(400).json({ error: 'Invalid attendance data' });
  }

  console.log(`[Mark Attendance] Seance ${seanceId}, ${attendanceData.length} records`);

  // Verify session belongs to teacher
  const verifySql = `SELECT id FROM seance WHERE id = ? AND id_enseignant = ?`;
  
  db.query(verifySql, [seanceId, teacherId], (err, verifyRows) => {
    if (err) {
      console.error('[Mark Attendance] Verification error:', err);
      return res.status(500).json({ error: err.message });
    }

    if (verifyRows.length === 0) {
      console.log(`[Mark Attendance] Access denied - session ${seanceId} does not belong to teacher ${teacherId}`);
      return res.status(403).json({ error: 'Access denied to this session' });
    }

    // Insert/Update attendance records
    const values = attendanceData.map(record => [
      record.etudiant_id,
      seanceId,
      new Date().toISOString().split('T')[0],
      record.statut
    ]);

    const sql = `
      INSERT INTO absence (id_etudiant, id_seance, date, statut)
      VALUES ?
      ON DUPLICATE KEY UPDATE statut = VALUES(statut)
    `;

    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error('[Mark Attendance] Error:', err);
        return res.status(500).json({ error: err.message });
      }

      // Mark session as presented
      const updateSeanceSql = `UPDATE seance SET is_presente = 1 WHERE id = ?`;
      db.query(updateSeanceSql, [seanceId], (updateErr) => {
        if (updateErr) console.error('[Mark Attendance] Update seance error:', updateErr);

        console.log(`[Mark Attendance] Success! ${result.affectedRows} records processed`);
        res.json({ 
          success: true, 
          message: 'Attendance marked successfully',
          records_processed: result.affectedRows
        });
      });
    });
  });
});

// ============================================
// GET ATTENDANCE STATISTICS
// ============================================
router.get('/statistics', (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });

  console.log(`[Statistics] For teacher ${teacherId}`);

  const sql = `
    SELECT 
      m.nom AS matiere,
      g.nom AS groupe,
      COUNT(DISTINCT e.id) AS total_etudiants,
      COUNT(DISTINCT CASE WHEN a.statut = 'absent' THEN e.id END) AS etudiants_with_absences,
      SUM(CASE WHEN a.statut = 'absent' THEN 1 ELSE 0 END) AS total_absences,
      COUNT(DISTINCT s.id) AS total_seances
    FROM seance s
    JOIN matiere m ON s.id_matiere = m.id
    JOIN groupe g ON s.id_groupe = g.id
    LEFT JOIN etudiant e ON e.id_groupe = g.id
    LEFT JOIN absence a ON a.id_seance = s.id AND a.id_etudiant = e.id
    WHERE s.id_enseignant = ?
    GROUP BY m.nom, g.nom
    ORDER BY m.nom, g.nom
  `;

  db.query(sql, [teacherId], (err, rows) => {
    if (err) {
      console.error('[Statistics] Error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`[Statistics] Found ${rows.length} course groups`);
    res.json(rows);
  });
});

// ============================================
// GET AT-RISK STUDENTS (>3 absences)
// ============================================
router.get('/at-risk-students', (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ error: 'User not authenticated' });

  console.log(`[At-Risk Students] For teacher ${teacherId}`);

  const sql = `
    SELECT 
      u.nom,
      u.prenom,
      u.email,
      m.nom AS matiere,
      g.nom AS groupe,
      COUNT(CASE WHEN a.statut = 'absent' THEN 1 END) AS absences
    FROM seance s
    JOIN matiere m ON s.id_matiere = m.id
    JOIN groupe g ON s.id_groupe = g.id
    JOIN etudiant e ON e.id_groupe = g.id
    JOIN utilisateur u ON e.id = u.id
    LEFT JOIN absence a ON a.id_etudiant = e.id AND a.id_seance = s.id
    WHERE s.id_enseignant = ?
    GROUP BY u.id, u.nom, u.prenom, u.email, m.nom, g.nom
    HAVING absences > 3
    ORDER BY absences DESC, u.nom
  `;

  db.query(sql, [teacherId], (err, rows) => {
    if (err) {
      console.error('[At-Risk Students] Error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log(`[At-Risk Students] Found ${rows.length} at-risk students`);
    res.json(rows);
  });
});

module.exports = router;
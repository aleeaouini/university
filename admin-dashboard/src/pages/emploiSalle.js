// EmploiSalle.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EmploiSalle = () => {
  const [seances, setSeances] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const timeSlots = [
    '08:30', '09:30', '10:30', '11:30', '12:30', 
    '13:30', '14:30', '15:30', '16:30', '17:30'
  ];

  useEffect(() => {
    fetchGroupes();
  }, []);

  useEffect(() => {
    if (selectedGroupe) {
      fetchSeances(selectedGroupe);
    }
  }, [selectedGroupe]);

  const fetchGroupes = async () => {
    try {
      const response = await axios.get('http://localhost:3004/groupes');
      setGroupes(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des groupes');
      console.error('Error fetching groups:', err);
    }
  };

  const fetchSeances = async (groupeId) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:3004/seances/group/${groupeId}`);
      setSeances(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des séances');
      console.error('Error fetching seances:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeancesForDayAndTime = (dayIndex, timeSlot) => {
    return seances.filter(seance => {
      const seanceDayIndex = seance.day_of_week - 1;
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
      const slotTime = slotHour * 60 + slotMinute;
      
      const [startHour, startMinute] = seance.heure_debut.split(':').map(Number);
      const [endHour, endMinute] = seance.heure_fin.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      return seanceDayIndex === dayIndex && slotTime >= startTime && slotTime < endTime;
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Styles intégrés
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1400px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px'
    },
    groupSelector: {
      marginBottom: '20px',
      textAlign: 'center'
    },
    label: {
      fontWeight: 'bold',
      marginRight: '10px'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px'
    },
    error: {
      backgroundColor: '#ffebee',
      color: '#c62828',
      padding: '10px',
      borderRadius: '4px',
      margin: '10px 0',
      textAlign: 'center'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '18px',
      color: '#666'
    },
    timetable: {
      display: 'grid',
      gridTemplateRows: 'auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    timetableHeader: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(6, 1fr)',
      backgroundColor: '#f5f5f5',
      fontWeight: 'bold'
    },
    headerCell: {
      padding: '15px 10px',
      textAlign: 'center',
      borderRight: '1px solid #ddd'
    },
    timetableRow: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(6, 1fr)',
      minHeight: '80px'
    },
    timeCell: {
      padding: '10px',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      borderRight: '1px solid #ddd',
      borderBottom: '1px solid #ddd',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    dayCell: {
      position: 'relative',
      borderRight: '1px solid #ddd',
      borderBottom: '1px solid #ddd',
      minHeight: '80px',
      padding: '2px'
    },
    seanceCard: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '8px',
      borderRadius: '6px',
      margin: '2px',
      fontSize: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      height: 'calc(100% - 4px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    seanceSubject: {
      fontWeight: 'bold',
      marginBottom: '4px',
      fontSize: '11px'
    },
    seanceRoom: {
      marginBottom: '2px',
      fontSize: '10px'
    },
    seanceTeacher: {
      marginBottom: '2px',
      fontSize: '10px'
    },
    seanceTime: {
      fontSize: '9px',
      opacity: '0.9'
    }
  };

  // Style pour le dernier header (pas de bordure droite)
  const lastHeaderStyle = {
    ...styles.headerCell,
    borderRight: 'none'
  };

  // Style pour la dernière cellule du jour
  const lastDayCellStyle = {
    ...styles.dayCell,
    borderRight: 'none'
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Emploi du Temps des Salles</h1>
      
      <div style={styles.groupSelector}>
        <label style={styles.label} htmlFor="groupe-select">
          Sélectionner un groupe: 
        </label>
        <select 
          id="groupe-select"
          style={styles.select}
          value={selectedGroupe} 
          onChange={(e) => setSelectedGroupe(e.target.value)}
        >
          <option value="">Choisir un groupe</option>
          {groupes.map(groupe => (
            <option key={groupe.id} value={groupe.id}>
              {groupe.nom} - {groupe.specialite}
            </option>
          ))}
        </select>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>Chargement...</div>
      ) : selectedGroupe && (
        <div style={styles.timetable}>
          {/* Header Row */}
          <div style={styles.timetableHeader}>
            <div style={styles.headerCell}>Heure</div>
            {days.map((day, index) => (
              <div 
                key={day} 
                style={index === days.length - 1 ? lastHeaderStyle : styles.headerCell}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <div key={timeSlot} style={styles.timetableRow}>
              <div style={styles.timeCell}>{timeSlot}</div>
              
              {days.map((day, dayIndex) => {
                const seancesAtSlot = getSeancesForDayAndTime(dayIndex, timeSlot);
                
                return (
                  <div 
                    key={dayIndex} 
                    style={dayIndex === days.length - 1 ? lastDayCellStyle : styles.dayCell}
                  >
                    {seancesAtSlot.map(seance => (
                      <div 
                        key={seance.id} 
                        style={{
                          ...styles.seanceCard,
                          gridRow: `span ${calculateDuration(seance.heure_debut, seance.heure_fin)}`
                        }}
                      >
                        <div style={styles.seanceSubject}>{seance.matiere_nom}</div>
                        <div style={styles.seanceRoom}>Salle: {seance.salle_numero}</div>
                        <div style={styles.seanceTeacher}>
                          Prof: {seance.enseignant_prenom} {seance.enseignant_nom}
                        </div>
                        <div style={styles.seanceTime}>
                          {formatTime(seance.heure_debut)} - {formatTime(seance.heure_fin)}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const calculateDuration = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  
  return Math.ceil((endTotal - startTotal) / 60);
};

export default EmploiSalle;
// services/seanceConflict.js - Version simplifiée sans Sequelize

function timeToMinutes(time) {
  if (!time) return 0;
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

function intervalsOverlap(aStart, aEnd, bStart, bEnd) {
  const startA = timeToMinutes(aStart);
  const endA = timeToMinutes(aEnd);
  const startB = timeToMinutes(bStart);
  const endB = timeToMinutes(bEnd);

  console.log(`🕒 Time comparison: ${aStart}-${aEnd} vs ${bStart}-${bEnd}`);
  console.log(`🕒 In minutes: ${startA}-${endA} vs ${startB}-${endB}`);
  console.log(`🕒 Overlap check: ${startA} < ${endB} && ${endA} > ${startB} = ${startA < endB && endA > startB}`);

  return startA < endB && endA > startB;
}

async function checkConflict(models, payload) {
  const { 
    id_salle, 
    id_groupe, 
    id_enseignant, 
    day_of_week, 
    heure_debut, 
    heure_fin 
  } = payload;

  console.log('🔍 Checking conflicts for:', {
    id_salle, id_groupe, id_enseignant, day_of_week, heure_debut, heure_fin
  });

  // Since we don't have real models, return no conflicts
  // The actual conflict checking is done in the REST API route
  console.log('⚠️ Using mock conflict check - no conflicts detected');
  return [];
}

module.exports = { checkConflict };
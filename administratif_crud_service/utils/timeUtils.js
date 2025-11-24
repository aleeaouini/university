function timeToMinutes(t) {
  const parts = t.split(':').map(Number);
  return parts[0]*60 + (parts[1] || 0);
}

function intervalsOverlap(startA, endA, startB, endB) {
  const a0 = timeToMinutes(startA);
  const a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB);
  const b1 = timeToMinutes(endB);
  return (a0 < b1) && (b0 < a1);
}

module.exports = { timeToMinutes, intervalsOverlap };

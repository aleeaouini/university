import  { useState } from "react";
import { Calendar, Clock, User, MapPin, AlertCircle, CheckCircle, XCircle, BookOpen, GraduationCap } from "lucide-react";

const scheduleData = [
  { jour: "Lundi", debut: "08:30", fin: "10:00", matiere: "Web 3.0", prof: "Ahmed NEFZAOUI", salle: "SI 10" },
  { jour: "Lundi", debut: "10:10", fin: "11:40", matiere: "Développement Mobile", prof: "Abdelkader MAATALAH", salle: "LI 04" },
  { jour: "Lundi", debut: "11:50", fin: "13:20", matiere: "Atelier SOA", prof: "Abdelkader MAATALAH", salle: "LI 04" },
  { jour: "Lundi", debut: "14:30", fin: "16:00", matiere: "Technique de recherche d'emploi", prof: "Mohamed TOUMI", salle: "SI 03" },
  { jour: "Mardi", debut: "08:30", fin: "10:00", matiere: "Atelier développement Mobile natif", prof: "Abdelkader MAATALAH", salle: "LI 05" },
  { jour: "Mardi", debut: "10:10", fin: "11:40", matiere: "Méthodologie de Conception Objet", prof: "Mariem JERIDI", salle: "AMPHI" },
  { jour: "Mardi", debut: "14:30", fin: "16:00", matiere: "SOA", prof: "Abdelkader MAATALAH", salle: "LI 05" },
  { jour: "Mercredi", debut: "08:30", fin: "10:00", matiere: "Environnement de développement", prof: "Ahmed NEFZAOUI", salle: "LI 05" },
  { jour: "Mercredi", debut: "10:10", fin: "11:40", matiere: "Projet d'Intégration", prof: "Haithem HAFSI", salle: "AMPHI" },
  { jour: "Jeudi", debut: "08:30", fin: "10:00", matiere: "Preparing TOEIC", prof: "Diziya ARFAOUI", salle: "SI 03" },
  { jour: "Jeudi", debut: "14:30", fin: "16:00", matiere: "Atelier Framework cross-platform", prof: "Wahid HAMDI", salle: "LI 05" },
  { jour: "Vendredi", debut: "08:30", fin: "10:00", matiere: "Gestion des données Massives", prof: "Abdelkader MAATALAH", salle: "LI 04" },
  { jour: "Vendredi", debut: "10:10", fin: "11:40", matiere: "Atelier Base de Données Avancée", prof: "Abdelkader MAATALAH", salle: "LI 04" },
];

const absencesData = [
  { matiere: "Web 3.0", date: "2024-11-04", seance: "Séance 1", presence: true },
  { matiere: "Web 3.0", date: "2024-11-11", seance: "Séance 2", presence: true },
  { matiere: "Web 3.0", date: "2024-11-18", seance: "Séance 3", presence: false },
  { matiere: "Web 3.0", date: "2024-11-25", seance: "Séance 4", presence: true },
  
  { matiere: "Développement Mobile", date: "2024-11-04", seance: "Séance 1", presence: false },
  { matiere: "Développement Mobile", date: "2024-11-11", seance: "Séance 2", presence: false },
  { matiere: "Développement Mobile", date: "2024-11-18", seance: "Séance 3", presence: false },
  { matiere: "Développement Mobile", date: "2024-11-25", seance: "Séance 4", presence: false },
  
  { matiere: "Atelier SOA", date: "2024-11-04", seance: "Séance 1", presence: true },
  { matiere: "Atelier SOA", date: "2024-11-11", seance: "Séance 2", presence: false },
  { matiere: "Atelier SOA", date: "2024-11-18", seance: "Séance 3", presence: true },
  
  { matiere: "Méthodologie de Conception Objet", date: "2024-11-05", seance: "Séance 1", presence: true },
  { matiere: "Méthodologie de Conception Objet", date: "2024-11-12", seance: "Séance 2", presence: false },
  { matiere: "Méthodologie de Conception Objet", date: "2024-11-19", seance: "Séance 3", presence: true },
  
  { matiere: "SOA", date: "2024-11-05", seance: "Séance 1", presence: true },
  { matiere: "SOA", date: "2024-11-12", seance: "Séance 2", presence: false },
  { matiere: "SOA", date: "2024-11-19", seance: "Séance 3", presence: false },
  { matiere: "SOA", date: "2024-11-26", seance: "Séance 4", presence: true },
];

const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const horaires = ["08:30-10:00", "10:10-11:40", "11:50-13:20", "14:30-16:00"];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  
  // Calculer les absences par matière
  const getAbsencesBySubject = () => {
    const subjects = {};
    absencesData.forEach(item => {
      if (!subjects[item.matiere]) {
        subjects[item.matiere] = {
          total: 0,
          absences: 0,
          presences: 0,
          sessions: []
        };
      }
      subjects[item.matiere].total++;
      subjects[item.matiere].sessions.push(item);
      if (item.presence) {
        subjects[item.matiere].presences++;
      } else {
        subjects[item.matiere].absences++;
      }
    });
    return subjects;
  };
  
  const subjectStats = getAbsencesBySubject();
  const totalAbsences = absencesData.filter(a => !a.presence).length;
  const attendanceRate = absencesData.length > 0 
    ? ((absencesData.filter(a => a.presence).length / absencesData.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("schedule")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "schedule"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Emploi du temps
              </div>
            </button>
            <button
              onClick={() => setActiveTab("absences")}
              className={`flex-1 px-6 py-4 font-semibold transition-colors border-b-2 ${
                activeTab === "absences"
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Suivi des Absences
              </div>
            </button>
          </nav>
        </div>

        {/* Schedule Table */}
        {activeTab === "schedule" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Emploi du Temps - Semestre en cours
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Horaire
                      </div>
                    </th>
                    {jours.map((j) => (
                      <th key={j} className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700">
                        {j}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horaires.map((horaire, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-700 bg-gray-50 whitespace-nowrap">
                        {horaire}
                      </td>
                      {jours.map(jour => {
                        const cell = scheduleData.find(s => s.jour === jour && `${s.debut}-${s.fin}` === horaire);
                        return (
                          <td key={jour} className="border border-gray-300 p-2 align-top">
                            {cell ? (
                              <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                                <div className="font-bold text-sm text-gray-900 mb-2">{cell.matiere}</div>
                                <div className="flex items-start gap-1 text-xs text-gray-600 mb-1">
                                  <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{cell.prof}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="font-medium">{cell.salle}</span>
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Absences Table */}
        {activeTab === "absences" && (
          <div className="space-y-6">
            {/* Résumé par matière */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" />
                  Résumé des Absences par Matière
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(subjectStats).map(([matiere, stats]) => {
                    const isEliminated = stats.absences > 3;
                    return (
                      <div 
                        key={matiere} 
                        className={`border-2 rounded-lg p-4 ${
                          isEliminated 
                            ? 'border-red-500 bg-red-50' 
                            : stats.absences === 3 
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <h3 className="font-bold text-sm text-gray-900 mb-3">{matiere}</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total séances:</span>
                            <span className="font-semibold">{stats.total}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Présences:</span>
                            <span className="font-semibold text-green-600">{stats.presences}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Absences:</span>
                            <span className={`font-semibold ${stats.absences > 3 ? 'text-red-600' : stats.absences === 3 ? 'text-orange-600' : 'text-gray-900'}`}>
                              {stats.absences}
                            </span>
                          </div>
                        </div>
                        {isEliminated && (
                          <div className="mt-3 pt-3 border-t-2 border-red-300">
                            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                              <XCircle className="w-5 h-5" />
                              ÉLIMINÉ
                            </div>
                            <p className="text-xs text-red-600 mt-1">Plus de 3 absences</p>
                          </div>
                        )}
                        {stats.absences === 3 && (
                          <div className="mt-3 pt-3 border-t-2 border-orange-300">
                            <div className="flex items-center gap-2 text-orange-700 font-bold text-sm">
                              <AlertCircle className="w-5 h-5" />
                              ATTENTION
                            </div>
                            <p className="text-xs text-orange-600 mt-1">Limite atteinte</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Détail par matière */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6" />
                  Détail des Séances
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Matière
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Séance
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {absencesData.map((item, index) => {
                      const subjectAbsences = subjectStats[item.matiere].absences;
                      const isEliminated = subjectAbsences > 3;
                      
                      return (
                        <tr 
                          key={index}
                          className={`border-b border-gray-200 hover:bg-gray-50 ${
                            isEliminated ? 'bg-red-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              {item.matiere}
                              {isEliminated && (
                                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                                  ÉLIMINÉ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {item.seance}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(item.date).toLocaleDateString('fr-FR', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.presence ? (
                              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-300">
                                <CheckCircle className="w-4 h-4" />
                                Présent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium border border-red-300">
                                <XCircle className="w-4 h-4" />
                                Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
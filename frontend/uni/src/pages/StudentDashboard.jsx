import { useState, useEffect } from "react";
import { Calendar, Clock, User, MapPin, AlertCircle, CheckCircle, XCircle, Loader, RefreshCw, Menu, X, Settings } from "lucide-react";

const API_BASE_URL = "http://localhost:3005";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [scheduleData, setScheduleData] = useState([]);
  const [absencesData, setAbsencesData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const jourMapping = {1:"Lundi",2:"Mardi",3:"Mercredi",4:"Jeudi",5:"Vendredi",6:"Samedi",7:"Dimanche"};
  const horaires = ["08:30-10:00", "10:10-11:40", "11:50-13:20", "14:30-16:00", "16:10-17:40"];

  // Helper function to normalize time format (handles both HH:MM:SS and HH:MM)
  const normalizeTime = (time) => {
    if (!time) return "";
    // If it's HH:MM:SS, extract just HH:MM
    const parts = time.toString().split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const getToken = () => localStorage.getItem("jwt");

  const authFetch = async (url) => {
    const token = getToken();
    console.log("[authFetch] Fetching URL:", url);
    console.log("[authFetch] Token:", token ? `${token.substring(0, 20)}...` : "Missing");
    
    if (!token) {
      throw new Error("Token manquant. Veuillez vous connecter.");
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        cache: 'no-store'
      });
      
      console.log(`[authFetch] Response status for ${url}:`, res.status);
      console.log(`[authFetch] Response headers:`, {
        'content-type': res.headers.get('content-type'),
        'content-length': res.headers.get('content-length')
      });
      
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[authFetch] Error response:`, errText);
        throw new Error(`Erreur ${res.status}: ${errText}`);
      }
      
      const data = await res.json();
      console.log(`[authFetch] Data received from ${url}:`, data);
      console.log(`[authFetch] Data type:`, Array.isArray(data) ? `Array(${data.length})` : typeof data);
      return data;
    } catch (error) {
      console.error(`[authFetch] Fetch failed for ${url}:`, error);
      throw error;
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("[fetchSchedule] Starting...");
      const data = await authFetch(`${API_BASE_URL}/student/schedule`);
      console.log("[fetchSchedule] Raw data:", data);
      console.log("[fetchSchedule] Number of sessions:", data.length);
      
      if (data.length === 0) {
        console.warn("[fetchSchedule] No sessions found for this student's group");
      }
      
      const transformed = data.map(item => {
        const normalized = {
          jour: jourMapping[item.day_of_week] || `Jour ${item.day_of_week}`,
          debut: normalizeTime(item.heure_debut),
          fin: normalizeTime(item.heure_fin),
          matiere: item.matiere,
          prof: `${item.enseignant_prenom} ${item.enseignant_nom}`,
          salle: item.salle
        };
        console.log("[fetchSchedule] Processing item:", {
          original: item,
          transformed: normalized,
          timeSlot: `${normalized.debut}-${normalized.fin}`
        });
        return normalized;
      });
      
      console.log("[fetchSchedule] Transformed data:", transformed);
      console.log("[fetchSchedule] Time slots found:", transformed.map(t => `${t.debut}-${t.fin}`));
      setScheduleData(transformed);
    } catch (err) {
      console.error("[fetchSchedule] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsences = async () => {
    try {
      console.log("[fetchAbsences] Starting...");
      const data = await authFetch(`${API_BASE_URL}/student/absences`);
      console.log("[fetchAbsences] Raw data:", data);
      
      const transformed = data.map(item => ({
        matiere: item.matiere,
        date: item.date,
        seance: `Séance - ${item.heure_debut}`,
        presence: item.statut.toLowerCase() !== 'absent'
      }));
      
      console.log("[fetchAbsences] Transformed data:", transformed);
      setAbsencesData(transformed);
    } catch (err) {
      console.error("[fetchAbsences] Error:", err);
      setError(err.message);
    }
  };

  const fetchSummary = async () => {
    try {
      console.log("[fetchSummary] Starting...");
      const data = await authFetch(`${API_BASE_URL}/student/summary`);
      console.log("[fetchSummary] Raw data:", data);
      
      const transformed = {};
      data.forEach(item => {
        transformed[item.matiere] = {
          total: item.total_sessions,
          absences: item.absences,
          presences: item.total_sessions - item.absences,
          eliminated: item.absences > 3
        };
      });
      
      console.log("[fetchSummary] Transformed data:", transformed);
      setSummaryData(transformed);
    } catch (err) {
      console.error("[fetchSummary] Error:", err);
      setError(err.message);
    }
  };

  const handleRefresh = async () => {
    console.log("[handleRefresh] Starting refresh...");
    setRefreshing(true);
    await Promise.all([fetchSchedule(), fetchAbsences(), fetchSummary()]);
    setRefreshing(false);
    console.log("[handleRefresh] Refresh complete");
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  const handleEditProfile = () => {
    // Add your edit profile logic here
   window.location.href = "/editprofile";
  };

  useEffect(() => {
    const token = getToken();
    console.log("[useEffect] Checking token on mount...");
    if (!token) {
      alert("Token manquant. Veuillez vous connecter.");
      window.location.href = "/login";
      return;
    }
    console.log("[useEffect] Token found, loading data...");
    handleRefresh();
  }, []);

  const totalAbsences = absencesData.filter(a => !a.presence).length;
  const totalSessions = absencesData.length;
  const attendanceRate = totalSessions > 0 ? ((totalSessions - totalAbsences) / totalSessions * 100).toFixed(1) : 0;

  console.log("[Render] State:", {
    activeTab,
    scheduleDataLength: scheduleData.length,
    absencesDataLength: absencesData.length,
    summaryDataKeys: Object.keys(summaryData).length,
    loading,
    error,
    refreshing
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">EduTrack</span>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-8 md:flex md:space-x-1">
                <button
                  onClick={() => setActiveTab("schedule")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "schedule"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Emploi du temps
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("absences")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === "absences"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Absences
                  </div>
                </button>
              </div>
            </div>

            {/* Right side - Profile menu and mobile menu button */}
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button 
                onClick={handleRefresh} 
                disabled={refreshing || loading} 
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
                Actualiser
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">Mon Profil</span>
                  <Settings className="w-4 h-4 text-gray-500" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleEditProfile}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Modifier le profil
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => {
                    setActiveTab("schedule");
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === "schedule"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  Emploi du temps
                </button>
                <button
                  onClick={() => {
                    setActiveTab("absences");
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === "absences"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  Absences
                </button>
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3"
                >
                  <User className="w-5 h-5" />
                  Modifier le profil
                </button>
                <button 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading} 
                  className="px-4 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3 disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} /> 
                  Actualiser
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Tableau de Bord Étudiant</h2>
                <p className="text-sm text-gray-600">Consultez votre emploi du temps et vos absences</p>
              </div>
            </div>
            <button 
              onClick={handleRefresh} 
              disabled={refreshing || loading} 
              className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> 
              Actualiser
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-2 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5"/>
            <div className="flex-1">
              <p className="font-semibold">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600"/> 
            <div>
              <p className="text-sm text-gray-600">Séances totales</p>
              <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600"/> 
            <div>
              <p className="text-sm text-gray-600">Total absences</p>
              <p className="text-2xl font-bold text-gray-900">{totalAbsences}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600"/> 
            <div>
              <p className="text-sm text-gray-600">Taux de présence</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceRate}%</p>
            </div>
          </div>
        </div>

        {/* Content Tabs (Secondary navigation - optional, you can remove this if you prefer only the main nav) */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 flex">
          <button 
            onClick={() => setActiveTab("schedule")} 
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "schedule" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Emploi du temps
          </button>
          <button 
            onClick={() => setActiveTab("absences")} 
            className={`flex-1 px-6 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "absences" 
                ? "border-blue-600 text-blue-600" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Suivi des Absences
          </button>
        </div>

        {/* Loading State */}
        {(loading || refreshing) && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader className="w-8 h-8 animate-spin text-blue-600"/>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        )}

        {/* Schedule Tab */}
        {!loading && activeTab === "schedule" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            {scheduleData.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
                  <Calendar className="w-10 h-10 text-blue-400"/>
                </div>
                <p className="text-gray-500 text-lg font-medium">Aucun cours programmé</p>
                <p className="text-gray-400 text-sm mt-2">Vérifiez que vous êtes assigné à un groupe</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                      <th className="p-4 text-left font-semibold text-white border-r border-blue-500 sticky left-0 bg-blue-600 z-10">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4"/>
                          <span>Horaire</span>
                        </div>
                      </th>
                      {jours.map((j) => (
                        <th key={j} className="p-4 text-center font-semibold text-white border-r border-blue-500 last:border-r-0 min-w-[140px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm font-medium">{j}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horaires.map((h, idx) => (
                      <tr key={h} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                        <td className="p-4 font-semibold text-gray-700 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{h.split('-')[0]}</div>
                              <div className="text-xs text-gray-500">{h.split('-')[1]}</div>
                            </div>
                          </div>
                        </td>
                        {jours.map(j => {
                          const timeSlot = `${normalizeTime(h.split('-')[0])}-${normalizeTime(h.split('-')[1])}`;
                          const cell = scheduleData.find(s => {
                            const cellTimeSlot = `${s.debut}-${s.fin}`;
                            const matches = s.jour === j && cellTimeSlot === timeSlot;
                            if (s.jour === j) {
                              console.log(`[Render] Comparing ${j} ${h}:`, {
                                cellTimeSlot,
                                expectedTimeSlot: timeSlot,
                                matches
                              });
                            }
                            return matches;
                          });
                          return (
                            <td key={j} className="p-3 border-r border-gray-200 last:border-r-0">
                              {cell ? (
                                <div className="relative group">
                                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-blue-400">
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <div className="text-white mb-2">
                                      <div className="font-bold text-sm mb-1 line-clamp-2">{cell.matiere}</div>
                                      <div className="text-xs opacity-90 flex items-center gap-1 mb-1">
                                        <User className="w-3 h-3"/> 
                                        <span className="truncate">{cell.prof}</span>
                                      </div>
                                      <div className="text-xs opacity-90 flex items-center gap-1">
                                        <MapPin className="w-3 h-3"/> 
                                        <span>{cell.salle}</span>
                                      </div>
                                    </div>
                                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
                                  </div>
                                  {/* Tooltip on hover */}
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
                                    <div className="font-semibold mb-1">{cell.matiere}</div>
                                    <div>Prof: {cell.prof}</div>
                                    <div>Salle: {cell.salle}</div>
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center h-24 text-gray-300">
                                  <div className="text-2xl font-light">—</div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Legend */}
            {scheduleData.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-gray-600">Cours actif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500"/>
                      <span className="text-gray-600">Enseignant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500"/>
                      <span className="text-gray-600">Salle</span>
                    </div>
                  </div>
                  <div className="text-gray-500">
                    Total: <span className="font-semibold text-blue-600">{scheduleData.length}</span> cours
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Absences Tab */}
        {!loading && activeTab === "absences" && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {Object.keys(summaryData).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(summaryData).map(([matiere, stats]) => (
                  <div 
                    key={matiere} 
                    className={`border-2 p-4 rounded-lg ${
                      stats.eliminated 
                        ? "border-red-500 bg-red-50" 
                        : stats.absences === 3 
                        ? "border-orange-500 bg-orange-50" 
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{matiere}</h3>
                    <p className="text-sm text-gray-600">Total séances: <span className="font-semibold">{stats.total}</span></p>
                    <p className="text-sm text-gray-600">Présences: <span className="font-semibold text-green-600">{stats.presences}</span></p>
                    <p className={`text-sm ${stats.absences > 3 ? "text-red-600" : stats.absences === 3 ? "text-orange-600" : "text-gray-600"}`}>
                      Absences: <span className="font-semibold">{stats.absences}</span>
                    </p>
                    {stats.eliminated && (
                      <div className="text-red-700 font-bold text-xs flex items-center gap-1 mt-2 bg-red-100 p-2 rounded">
                        <XCircle className="w-4 h-4"/> ÉLIMINÉ
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Absences Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-auto">
              {absencesData.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                  <p className="text-gray-500 text-lg font-medium">Aucune séance enregistrée</p>
                  <p className="text-gray-400 text-sm mt-2">Les absences apparaîtront ici</p>
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold text-gray-700 border-b">Matière</th>
                      <th className="p-3 text-left font-semibold text-gray-700 border-b">Séance</th>
                      <th className="p-3 text-left font-semibold text-gray-700 border-b">Date</th>
                      <th className="p-3 text-center font-semibold text-gray-700 border-b">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absencesData.map((item, i) => {
                      const stats = summaryData[item.matiere];
                      return (
                        <tr key={i} className={`hover:bg-gray-50 ${stats?.eliminated ? "bg-red-50" : ""}`}>
                          <td className="p-3 border-b font-medium text-gray-900">{item.matiere}</td>
                          <td className="p-3 border-b text-gray-600">{item.seance}</td>
                          <td className="p-3 border-b text-gray-600">{new Date(item.date).toLocaleDateString('fr-FR')}</td>
                          <td className="p-3 border-b text-center">
                            {item.presence ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                <CheckCircle className="w-4 h-4"/> Présent
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                <XCircle className="w-4 h-4"/> Absent
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {(profileMenuOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setProfileMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
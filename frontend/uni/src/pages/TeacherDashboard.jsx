import { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckSquare, AlertTriangle, User, MapPin, RefreshCw, Loader, BookOpen, LogOut, UserCog, BarChart3, MessageCircle, Mail, MailOpen, Send, Search, X } from "lucide-react";

// API Base URL - Port 3006 with /api prefix
const API_BASE_URL = "http://localhost:3006/api";
const MESSAGING_API_URL = "http://localhost:3000";

// Messaging Modal Component
const MessagingModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({ recipient: "", content: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [success, setSuccess] = useState("");
  const [serverStatus, setServerStatus] = useState("checking");

  // Check server status
  const checkServerStatus = async () => {
    try {
      const response = await fetch(`${MESSAGING_API_URL}/api/test`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        setServerStatus("online");
        return true;
      } else {
        setServerStatus("offline");
        return false;
      }
    } catch (err) {
      setServerStatus("offline");
      return false;
    }
  };

  // Fetch inbox messages
  const fetchInbox = async () => {
    try {
      setLoading(true);
      setError("");
      
      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) {
        setError("Serveur de messagerie indisponible. Veuillez réessayer plus tard.");
        return;
      }

      const response = await fetch(`${MESSAGING_API_URL}/api/inbox`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expirée - Veuillez vous reconnecter");
          return;
        }
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || "Erreur lors du chargement des messages");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur de messagerie");
      console.error("Fetch inbox error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sent messages
  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      setError("");
      
      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) {
        setError("Serveur de messagerie indisponible. Veuillez réessayer plus tard.");
        return;
      }

      const response = await fetch(`${MESSAGING_API_URL}/api/sent`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expirée - Veuillez vous reconnecter");
          return;
        }
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSentMessages(data.messages);
      } else {
        setError(data.error || "Erreur lors du chargement des messages envoyés");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur de messagerie");
      console.error("Fetch sent messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for autocomplete
  const fetchUsers = async () => {
    try {
      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) return;

      const response = await fetch(`${MESSAGING_API_URL}/api/users`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.recipient || !newMessage.content) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) {
        setError("Serveur de messagerie indisponible. Veuillez réessayer plus tard.");
        return;
      }

      const response = await fetch(`${MESSAGING_API_URL}/api/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          recipient: newMessage.recipient,
          content: newMessage.content
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage({ recipient: "", content: "" });
        setSuccess("Message envoyé avec succès!");
        setError("");
        await fetchSentMessages();
        setActiveTab("sent");
      } else {
        setError(data.error || "Erreur lors de l'envoi du message");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur de messagerie");
      console.error("Send message error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users for autocomplete
  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(newMessage.recipient.toLowerCase())
  );

  const handleRecipientSelect = (user) => {
    setNewMessage({ ...newMessage, recipient: user.fullName });
    setShowSuggestions(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays > 1) {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const refreshData = () => {
    if (activeTab === "inbox") {
      fetchInbox();
    } else if (activeTab === "sent") {
      fetchSentMessages();
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSuccess("");
      checkServerStatus().then((isOnline) => {
        if (isOnline) {
          if (activeTab === "inbox") {
            fetchInbox();
          } else if (activeTab === "sent") {
            fetchSentMessages();
          } else if (activeTab === "compose") {
            fetchUsers();
          }
        }
      });
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Messagerie</h2>
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
              serverStatus === "online" ? "bg-green-100 text-green-700" : 
              serverStatus === "offline" ? "bg-red-100 text-red-700" : 
              "bg-yellow-100 text-yellow-700"
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === "online" ? "bg-green-500" : 
                serverStatus === "offline" ? "bg-red-500" : 
                "bg-yellow-500"
              }`}></div>
              {serverStatus === "online" ? "En ligne" : 
               serverStatus === "offline" ? "Hors ligne" : 
               "Vérification..."}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={loading || serverStatus === "offline"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Server Offline Warning */}
        {serverStatus === "offline" && (
          <div className="bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Serveur de messagerie hors ligne</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Le service de messagerie est temporairement indisponible. Veuillez réessayer plus tard.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("inbox")}
            disabled={serverStatus === "offline"}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            }`}
          >
            <MailOpen className="w-4 h-4" />
            Boîte de réception
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            disabled={serverStatus === "offline"}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "sent"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            }`}
          >
            <Send className="w-4 h-4" />
            Messages envoyés
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            disabled={serverStatus === "offline"}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "compose"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 disabled:text-gray-400"
            }`}
          >
            <Mail className="w-4 h-4" />
            Nouveau message
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-800 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-green-800 text-sm flex items-center gap-2">
                <span>✅</span>
                {success}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center items-center py-8">
              <Loader className="w-6 h-6 animate-spin text-purple-600 mr-2" />
              <span className="text-gray-600">Chargement...</span>
            </div>
          )}

          {/* Server Offline Message */}
          {serverStatus === "offline" && !loading && (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service indisponible</h3>
              <p className="text-gray-500 mb-4">
                Le service de messagerie est temporairement hors ligne.
              </p>
              <button
                onClick={checkServerStatus}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Inbox Tab */}
          {!loading && serverStatus === "online" && activeTab === "inbox" && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher dans les messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MailOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun message dans la boîte de réception</p>
                </div>
              ) : (
                messages
                  .filter(msg => 
                    msg.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    msg.sender?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(message => (
                    <div
                      key={message.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold text-gray-900">{message.sender}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(message.date)}
                        </span>
                      </div>
                      <p className="text-gray-700">{message.content}</p>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Sent Messages Tab */}
          {!loading && serverStatus === "online" && activeTab === "sent" && (
            <div className="space-y-4">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun message envoyé</p>
                </div>
              ) : (
                sentMessages.map(message => (
                  <div
                    key={message.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">À: </span>
                        <span className="font-semibold text-gray-900">{message.recipient}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(message.date)}
                      </span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Compose Tab */}
          {!loading && serverStatus === "online" && activeTab === "compose" && (
            <form onSubmit={sendMessage} className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire (Nom Prénom)
                </label>
                <input
                  type="text"
                  value={newMessage.recipient}
                  onChange={(e) => {
                    setNewMessage({ ...newMessage, recipient: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Ex: Dupont Jean"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                {showSuggestions && newMessage.recipient && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        onClick={() => handleRecipientSelect(user)}
                        className="px-4 py-2 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Commencez à taper pour voir les suggestions</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Tapez votre message ici..."
                  rows="6"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                {loading ? "Envoi..." : "Envoyer le message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom hook for messaging notifications
const useMessaging = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [serverOnline, setServerOnline] = useState(true);

  const checkNewMessages = async () => {
    try {
      const response = await fetch(`${MESSAGING_API_URL}/api/unread-count`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count);
          setServerOnline(true);
        }
      } else {
        setServerOnline(false);
      }
    } catch (error) {
      console.error('Error checking messages:', error);
      setServerOnline(false);
    }
  };

  useEffect(() => {
    checkNewMessages();
    const interval = setInterval(checkNewMessages, 30000);

    return () => clearInterval(interval);
  }, []);

  return { unreadCount, serverOnline };
};

// Main TeacherDashboard Component
const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const [scheduleData, setScheduleData] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [atRiskStudents, setAtRiskStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);

  const { unreadCount, serverOnline } = useMessaging();

  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const jourMapping = {1:"Lundi",2:"Mardi",3:"Mercredi",4:"Jeudi",5:"Vendredi",6:"Samedi",7:"Dimanche"};
  const horaires = ["08:30-10:00", "10:10-11:40", "11:50-13:20", "14:30-16:00", "16:10-17:40"];

  const getToken = () => localStorage.getItem("jwt");

  const authFetch = async (url) => {
    const token = getToken();
    if (!token) {
      setError("Token manquant - Veuillez vous reconnecter");
      throw new Error("Token manquant");
    }

    const res = await fetch(url, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      throw new Error(`Erreur ${res.status}: ${errorText}`);
    }
    
    return res.json();
  };

  const normalizeTime = (time) => {
    if (!time) return "";
    const parts = time.toString().split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const fetchSchedule = async () => {
    try {
      setError(null);
      const data = await authFetch(`${API_BASE_URL}/teacher/schedule`);
      setScheduleData(data.map(item => ({
        ...item,
        jour: jourMapping[item.day_of_week],
        debut: normalizeTime(item.heure_debut),
        fin: normalizeTime(item.heure_fin)
      })));
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err.message);
    }
  };

  const fetchTodaySessions = async () => {
    try {
      setError(null);
      const data = await authFetch(`${API_BASE_URL}/teacher/today-sessions`);
      setTodaySessions(data);
    } catch (err) {
      console.error("Error fetching today's sessions:", err);
      setError(err.message);
    }
  };

  const fetchStudents = async (seanceId) => {
    try {
      setError(null);
      const data = await authFetch(`${API_BASE_URL}/teacher/seance/${seanceId}/students`);
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError(err.message);
    }
  };

  const fetchStatistics = async () => {
    try {
      setError(null);
      const data = await authFetch(`${API_BASE_URL}/teacher/statistics`);
      setStatistics(data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError(err.message);
    }
  };

  const fetchAtRiskStudents = async () => {
    try {
      setError(null);
      const data = await authFetch(`${API_BASE_URL}/teacher/at-risk-students`);
      setAtRiskStudents(data);
    } catch (err) {
      console.error("Error fetching at-risk students:", err);
      setError(err.message);
    }
  };

  const markAttendance = async () => {
    if (!selectedSession) return;

    const attendanceData = students.map(s => ({
      etudiant_id: s.etudiant_id,
      statut: s.statut === 'non_marque' ? 'present' : s.statut
    }));

    try {
      setError(null);
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/teacher/seance/${selectedSession.seance_id}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attendanceData })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }
      
      alert('Présence enregistrée avec succès!');
      setSelectedSession(null);
      fetchTodaySessions();
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert('Erreur: ' + err.message);
    }
  };

  const toggleStudentStatus = (etudiantId) => {
    setStudents(students.map(s => {
      if (s.etudiant_id === etudiantId) {
        let newStatus = 'present';
        if (s.statut === 'present') newStatus = 'absent';
        else if (s.statut === 'absent') newStatus = 'present';
        return { ...s, statut: newStatus };
      }
      return s;
    }));
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSchedule(),
        fetchTodaySessions(),
        fetchStatistics(),
        fetchAtRiskStudents()
      ]);
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    window.location.href = "/login";
  };

  const handleEditProfile = () => {
    window.location.href = "/editprofile";
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    handleRefresh();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchStudents(selectedSession.seance_id);
    }
  }, [selectedSession]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">EduManager</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setActiveTab("schedule")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "schedule" 
                    ? "bg-purple-100 text-purple-700 font-semibold" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Emploi du temps
              </button>
              <button 
                onClick={() => setActiveTab("attendance")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "attendance" 
                    ? "bg-purple-100 text-purple-700 font-semibold" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                Faire l'appel
              </button>
              <button 
                onClick={() => setActiveTab("statistics")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "statistics" 
                    ? "bg-purple-100 text-purple-700 font-semibold" 
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Statistiques d'absence
              </button>
              
              {/* Messaging Button */}
              <button 
                onClick={() => setShowMessaging(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative"
              >
                <MessageCircle className="w-4 h-4" />
                Messagerie
                {!serverOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                )}
                {serverOnline && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:block text-gray-700">Mon Profil</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                  <button 
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <UserCog className="w-4 h-4" />
                    Modifier le profil
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex justify-between items-center py-3 border-t">
            <button 
              onClick={() => setActiveTab("schedule")}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-colors ${
                activeTab === "schedule" 
                  ? "text-purple-600" 
                  : "text-gray-600"
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs">Emploi</span>
            </button>
            <button 
              onClick={() => setActiveTab("attendance")}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-colors ${
                activeTab === "attendance" 
                  ? "text-purple-600" 
                  : "text-gray-600"
              }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span className="text-xs">Appel</span>
            </button>
            <button 
              onClick={() => setActiveTab("statistics")}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-colors ${
                activeTab === "statistics" 
                  ? "text-purple-600" 
                  : "text-gray-600"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Stats</span>
            </button>
            <button 
              onClick={() => setShowMessaging(true)}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded transition-colors text-gray-600 relative`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">Messages</span>
              {!serverOnline && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
              )}
              {serverOnline && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tableau de Bord Enseignant</h2>
              <p className="text-sm text-gray-600">Gérez vos cours et la présence des étudiants</p>
            </div>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={loading} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> 
            Actualiser
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="font-semibold text-red-900">Erreur</div>
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs (Hidden on desktop, shown on mobile as navigation) */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 flex overflow-x-auto md:hidden">
          <button 
            onClick={() => setActiveTab("schedule")} 
            className={`flex-1 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "schedule" 
                ? "border-purple-600 text-purple-600" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📅 Emploi
          </button>
          <button 
            onClick={() => setActiveTab("attendance")} 
            className={`flex-1 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "attendance" 
                ? "border-purple-600 text-purple-600" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            ✅ Appel
          </button>
          <button 
            onClick={() => setActiveTab("statistics")} 
            className={`flex-1 px-4 py-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === "statistics" 
                ? "border-purple-600 text-purple-600" 
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📊 Stats
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-purple-600 mb-4"/>
            <p className="text-gray-600">Chargement des données...</p>
          </div>
        )}

        {/* Schedule Tab */}
        {!loading && activeTab === "schedule" && (
          <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
            {scheduleData.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <p className="text-gray-500">Aucun cours programmé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-purple-700">
                      <th className="p-4 text-left font-semibold text-white border-r border-purple-500">
                        <Clock className="w-4 h-4 inline mr-2"/>Horaire
                      </th>
                      {jours.map(j => (
                        <th key={j} className="p-4 text-center font-semibold text-white border-r border-purple-500 last:border-r-0">{j}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horaires.map((h, idx) => (
                      <tr key={h} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-4 font-semibold text-gray-700 border-r border-gray-200">{h}</td>
                        {jours.map(j => {
                          const cell = scheduleData.find(s => s.jour === j && `${s.debut}-${s.fin}` === h);
                          return (
                            <td key={j} className="p-3 border-r border-gray-200 last:border-r-0">
                              {cell ? (
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white shadow-md hover:shadow-lg transition-shadow">
                                  <div className="font-bold text-sm mb-1">{cell.matiere}</div>
                                  <div className="text-xs opacity-90 flex items-center gap-1">
                                    <Users className="w-3 h-3"/> {cell.groupe_nom} ({cell.nb_etudiants})
                                  </div>
                                  <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3"/> {cell.salle}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-gray-300">—</div>
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
          </div>
        )}

        {/* Attendance Tab */}
        {!loading && activeTab === "attendance" && (
          <div className="space-y-6">
            {!selectedSession ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600"/>
                  Cours d'aujourd'hui
                </h3>
                {todaySessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                    <p className="text-gray-500">Aucun cours aujourd'hui</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {todaySessions.map(session => (
                      <div 
                        key={session.seance_id} 
                        className="border rounded-lg p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer" 
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900">{session.matiere}</h4>
                            <p className="text-sm text-gray-600">{session.groupe_nom} • Salle {session.salle}</p>
                            <p className="text-sm text-gray-500">{normalizeTime(session.heure_debut)} - {normalizeTime(session.heure_fin)}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">{session.nb_etudiants}</div>
                            <div className="text-xs text-gray-500">étudiants</div>
                            {session.is_presente ? (
                              <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">✓ Fait</span>
                            ) : (
                              <span className="inline-block mt-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">En attente</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedSession.matiere}</h3>
                    <p className="text-gray-600">
                      {selectedSession.groupe_nom} • {normalizeTime(selectedSession.heure_debut)} - {normalizeTime(selectedSession.heure_fin)}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedSession(null)} 
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Retour
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  {students.map(student => (
                    <div 
                      key={student.etudiant_id} 
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        student.statut === 'present' 
                          ? 'bg-green-50 border-green-300' 
                          : student.statut === 'absent' 
                            ? 'bg-red-50 border-red-300' 
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold">
                          {student.prenom[0]}{student.nom[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{student.prenom} {student.nom}</div>
                          <div className="text-sm text-gray-600">{student.email}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleStudentStatus(student.etudiant_id)} 
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            student.statut === 'present' 
                              ? 'bg-green-600 text-white shadow-md' 
                              : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                          }`}
                        >
                          Présent
                        </button>
                        <button 
                          onClick={() => toggleStudentStatus(student.etudiant_id)} 
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            student.statut === 'absent' 
                              ? 'bg-red-600 text-white shadow-md' 
                              : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={markAttendance} 
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                >
                  Enregistrer la présence
                </button>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {!loading && activeTab === "statistics" && (
          <div className="space-y-6">
            {statistics.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
                <p className="text-gray-500">Aucune statistique disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {statistics.map((stat, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-gray-900 mb-2">{stat.matiere} - {stat.groupe}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-600">Étudiants:</span> <span className="font-semibold">{stat.total_etudiants}</span></div>
                      <div><span className="text-gray-600">Séances:</span> <span className="font-semibold">{stat.total_seances}</span></div>
                      <div><span className="text-gray-600">Absences:</span> <span className="font-semibold text-red-600">{stat.total_absences}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {atRiskStudents.length > 0 && (
              <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5"/>
                  Étudiants éliminés
                </h3>
                <div className="space-y-2">
                  {atRiskStudents.map((student, idx) => (
                    <div key={idx} className="bg-white rounded p-3 flex justify-between items-center hover:shadow-md transition-shadow">
                      <div>
                        <div className="font-semibold">{student.prenom} {student.nom}</div>
                        <div className="text-sm text-gray-600">{student.matiere} - {student.groupe}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{student.absences}</div>
                        <div className="text-xs text-gray-500">absences</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messaging Modal */}
      <MessagingModal 
        isOpen={showMessaging}
        onClose={() => setShowMessaging(false)}
      />
    </div>
  );
};

export default TeacherDashboard;
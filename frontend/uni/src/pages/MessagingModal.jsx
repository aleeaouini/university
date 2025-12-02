import { useState, useEffect } from "react";
import { X, Send, Search, User, MessageCircle, Loader, Mail, MailOpen } from "lucide-react";

const MessagingModal = ({ isOpen, onClose, userId }) => {
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

  const API_BASE_URL = "http://localhost:3010";

  // Fetch inbox messages
  const fetchInbox = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/api/inbox/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
      } else {
        setError(data.error || "Erreur lors du chargement des messages");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
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
      const response = await fetch(`${API_BASE_URL}/api/sent/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSentMessages(data.messages);
      } else {
        setError(data.error || "Erreur lors du chargement des messages envoyés");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
      console.error("Fetch sent messages error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all users for autocomplete
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
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
      
      const response = await fetch(`${API_BASE_URL}/api/send/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setError("Erreur de connexion au serveur");
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
      if (activeTab === "inbox") {
        fetchInbox();
      } else if (activeTab === "sent") {
        fetchSentMessages();
      } else if (activeTab === "compose") {
        fetchUsers();
      }
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
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualiser"
            >
              <Loader className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "inbox"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <MailOpen className="w-4 h-4" />
            Boîte de réception
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "sent"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Send className="w-4 h-4" />
            Messages envoyés
          </button>
          <button
            onClick={() => setActiveTab("compose")}
            className={`flex items-center justify-center gap-2 flex-1 py-4 font-semibold border-b-2 transition-colors ${
              activeTab === "compose"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
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
                <span>⚠️</span>
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

          {/* Inbox Tab */}
          {!loading && activeTab === "inbox" && (
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
          {!loading && activeTab === "sent" && (
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
          {!loading && activeTab === "compose" && (
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

export default MessagingModal;
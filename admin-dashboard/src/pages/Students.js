import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { UserCheck, Plus, Edit2, Trash2, Search, X, Mail, Phone, Users, BookOpen } from "lucide-react";

function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    cin: "",
    telp: "",
    id_groupe: "",
    specialite: "" // Just for display
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch students with specialites
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get("/etudiants");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      setError("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch groups with specialites
  const fetchGroups = async () => {
    try {
      const res = await axiosClient.get("/groupes-with-specialites");
      setGroups(res.data);
    } catch (error) {
      console.error("Error loading groups:", error);
      setError("Failed to load groups");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Si le groupe change, récupérer AUTOMATIQUEMENT la spécialité
    if (name === "id_groupe" && value) {
      try {
        const response = await axiosClient.get(`/groupes/${value}/specialite-auto`);
        setForm(prev => ({
          ...prev,
          specialite: response.data.specialite_nom
        }));
      } catch (error) {
        console.error("Error fetching specialite:", error);
        setForm(prev => ({
          ...prev,
          specialite: "Specialité non trouvée"
        }));
      }
    }
    
    setError("");
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs requis
    if (!form.nom || !form.prenom || !form.id_groupe) {
      setError("First name, last name, and group are required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Préparer les données pour le backend
      const payload = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email || null,
        cin: form.cin || null,
        telp: form.telp || null,
        id_groupe: parseInt(form.id_groupe)
      };

      if (editId) {
        await axiosClient.put(`/etudiants/${editId}`, payload);
      } else {
        await axiosClient.post("/etudiants", payload);
      }
      
      // Réinitialiser le formulaire
      setForm({ 
        nom: "", 
        prenom: "", 
        email: "", 
        cin: "", 
        telp: "", 
        id_groupe: "",
        specialite: "" 
      });
      setEditId(null);
      fetchStudents();
      
    } catch (error) {
      console.error("Error saving student:", error);
      const errorMessage = error.response?.data?.error || "Failed to save student";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Set edit mode
  const handleEdit = (student) => {
    // Trouver le groupe correspondant pour récupérer l'ID
    const selectedGroup = groups.find(g => g.nom === student.groupe);
    
    setForm({
      nom: student.nom,
      prenom: student.prenom,
      email: student.email || "",
      cin: student.cin || "",
      telp: student.telp || "",
      id_groupe: selectedGroup ? selectedGroup.id.toString() : "",
      specialite: student.specialite_nom || student.specialite || ""
    });
    
    setEditId(student.id);
    setError("");
    document.getElementById("student-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      setIsLoading(true);
      await axiosClient.delete(`/etudiants/${id}`);
      fetchStudents();
    } catch (error) {
      console.error("Error deleting:", error);
      setError("Failed to delete student");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    [s.nom, s.prenom, s.email, s.groupe, s.specialite_nom, s.specialite]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <Users className="icon" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">Manage all registered students</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <Users className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{students.length}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper filtered">
            <Search className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredStudents.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="content-layout">

        {/* Form */}
        <div className="form-column">
          <div className="form-card" id="student-form">
            <div className="form-header">
              <div className="form-title">
                <Plus />
                {editId ? "Update Student" : "Create New Student"}
              </div>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm({ 
                      nom: "", 
                      prenom: "", 
                      email: "", 
                      cin: "", 
                      telp: "", 
                      id_groupe: "",
                      specialite: "" 
                    });
                    setEditId(null);
                    setError("");
                  }}
                  className="cancel-edit-btn"
                >
                  <X />
                </button>
              )}
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="teacher-form">

              <div className="input-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label>CIN</label>
                <input
                  type="text"
                  name="cin"
                  value={form.cin}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="telp"
                  value={form.telp}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label>Group *</label>
                <select
                  name="id_groupe"
                  value={form.id_groupe}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                >
                  <option value="">Select group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom} 
                      {g.specialite_nom && ` - ${g.specialite_nom}`}
                      {g.niveau_nom && ` (${g.niveau_nom})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialite display (read-only) */}
              <div className="input-group">
                <label>Speciality (automatic)</label>
                <div className="specialite-display">
                  <BookOpen className="specialite-icon" />
                  <span className={form.specialite ? "specialite-text" : "specialite-placeholder"}>
                    {form.specialite || "Select a group to see speciality"}
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${editId ? "update" : "create"}`}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : (editId ? "Update Student" : "Create Student")}
              </button>

            </form>
          </div>
        </div>

        {/* Table */}
        <div className="table-column">

          {/* Search */}
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={isLoading}
              />
              {searchTerm && (
                <button 
                  type="button"
                  onClick={() => setSearchTerm("")} 
                  className="clear-search-btn"
                  disabled={isLoading}
                >
                  <X />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="table-section">
            <div className="table-header">
              <h3 className="table-title">Student List</h3>
            </div>

            <div className="table-container">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Contact</th>
                    <th>Group</th>
                    <th>Speciality</th>
                    <th>Level</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>#{student.id}</td>

                      <td>
                        {student.prenom} {student.nom}
                        <div className="teacher-meta">{student.cin || "No CIN"}</div>
                      </td>

                      <td>
                        <div className="contact-item">
                          <Mail /> {student.email}
                        </div>
                        {student.telp && (
                          <div className="contact-item">
                            <Phone /> {student.telp}
                          </div>
                        )}
                      </td>

                      <td>{student.groupe || "—"}</td>
                      
                      <td>
                        <div className="specialite-badge">
                          {student.specialite_nom || student.specialite || "—"}
                        </div>
                      </td>

                      <td>
                        {student.niveau_nom || "—"}
                      </td>

                      <td>
                        <button 
                          onClick={() => handleEdit(student)} 
                          className="action-btn edit-btn"
                          disabled={isLoading}
                        >
                          <Edit2 /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)} 
                          className="action-btn delete-btn"
                          disabled={isLoading}
                        >
                          <Trash2 /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="empty-state">
                  <Users />
                  <p>No students found</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Students;
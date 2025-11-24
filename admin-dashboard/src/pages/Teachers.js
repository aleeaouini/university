import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { UserCheck, Plus, Edit2, Trash2, Search, X, Mail, Phone } from "lucide-react";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    cin: "",
    telp: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get("/enseignants");
      setTeachers(res.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) return;

    try {
      setIsLoading(true);
      if (editId) {
        await axiosClient.put(`/enseignants/${editId}`, form);
      } else {
        await axiosClient.post("/enseignants", form);
      }

      setForm({ nom: "", prenom: "", email: "", cin: "", telp: "" });
      setEditId(null);
      await fetchTeachers();
    } catch (error) {
      console.error("Error saving teacher:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (t) => {
    setForm(t);
    setEditId(t.id);
    document.getElementById("teacher-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        setIsLoading(true);
        await axiosClient.delete(`/enseignants/${id}`);
        await fetchTeachers();
      } catch (error) {
        console.error("Error deleting teacher:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <UserCheck className="icon" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Teachers</h1>
            <p className="page-subtitle">Manage faculty and teaching staff</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <UserCheck className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{teachers.length}</div>
            <div className="stat-label">Total Teachers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper filtered">
            <Search className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredTeachers.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-layout">

        {/* Form */}
        <div className="form-column">
          <div className="form-card" id="teacher-form">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-title-icon" />
                {editId ? "Update Teacher" : "Create New Teacher"}
              </div>

              {editId && (
                <button
                  onClick={() => {
                    setForm({ nom: "", prenom: "", email: "", cin: "", telp: "" });
                    setEditId(null);
                  }}
                  className="cancel-edit-btn"
                >
                  <X />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="teacher-form">
              
              <div className="input-group">
                <label className="input-label">First Name</label>
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
                <label className="input-label">Last Name</label>
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
                <label className="input-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <label className="input-label">CIN</label>
                <input
                  type="text"
                  name="cin"
                  value={form.cin}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  type="tel"
                  name="telp"
                  value={form.telp}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${editId ? "update" : "create"}`}
                disabled={isLoading}
              >
                {editId ? "Update Teacher" : "Create Teacher"}
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
                placeholder="Search teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                >
                  <X />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="table-section">
            <div className="table-header">
              <h3 className="table-title">Teacher List</h3>
            </div>

            <div className="table-container">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Teacher</th>
                    <th>Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.map((t) => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>

                      <td>
                        {t.prenom} {t.nom}
                        <div className="teacher-meta">
                          {t.cin || "No CIN"}
                        </div>
                      </td>

                      <td>
                        <div className="contact-item">
                          <Mail />
                          {t.email}
                        </div>
                        {t.telp && (
                          <div className="contact-item">
                            <Phone />
                            {t.telp}
                          </div>
                        )}
                      </td>

                      <td>
                        <button onClick={() => handleEdit(t)} className="action-btn edit-btn">
                          <Edit2 /> Edit
                        </button>

                        <button onClick={() => handleDelete(t.id)} className="action-btn delete-btn">
                          <Trash2 /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTeachers.length === 0 && (
                <div className="empty-state">
                  <UserCheck />
                  <p>No teachers found</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Teachers;

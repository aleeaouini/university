import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { UserCheck, Plus, Edit2, Trash2, Search, X, Mail, Phone, Users } from "lucide-react";

function Students() {
  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    cin: "",
    telp: "",
    name_groupe: "",
  });

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get("/etudiants");
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch groups list
  const fetchGroups = async () => {
    try {
      const res = await axiosClient.get("/groupes");
      setGroups(res.data);
    } catch (error) {
      console.error("Error loading groupes:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.email) return;

    try {
      setIsLoading(true);
      if (editId) {
        await axiosClient.put(`/etudiants/${editId}`, form);
      } else {
        await axiosClient.post("/etudiants", form);
      }
      setForm({ nom: "", prenom: "", email: "", cin: "", telp: "", name_groupe: "" });
      setEditId(null);
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set edit mode
  const handleEdit = (s) => {
    setForm({
      nom: s.nom,
      prenom: s.prenom,
      email: s.email,
      cin: s.cin || "",
      telp: s.telp || "",
      name_groupe: s.groupe || "",
    });
    setEditId(s.id);
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
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter((s) =>
    [s.nom, s.prenom, s.email, s.groupe, s.specialite]
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
                  onClick={() => {
                    setForm({ nom: "", prenom: "", email: "", cin: "", telp: "", name_groupe: "" });
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
                <label>First Name</label>
                <input
                  type="text"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="input-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
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
                  required
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
                />
              </div>

              <div className="input-group">
                <label>Group</label>
                <select
                  name="name_groupe"
                  value={form.name_groupe}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.nom}>{g.nom}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className={`submit-btn ${editId ? "update" : "create"}`}>
                {editId ? "Update Student" : "Create Student"}
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
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search-btn">
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
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td>#{s.id}</td>

                      <td>
                        {s.prenom} {s.nom}
                        <div className="teacher-meta">{s.cin || "No CIN"}</div>
                      </td>

                      <td>
                        <div className="contact-item"><Mail /> {s.email}</div>
                        {s.telp && <div className="contact-item"><Phone /> {s.telp}</div>}
                      </td>

                      <td>{s.groupe || "—"}</td>
                      <td>{s.specialite || "—"}</td>

                      <td>
                        <button onClick={() => handleEdit(s)} className="action-btn edit-btn">
                          <Edit2 /> Edit
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="action-btn delete-btn">
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

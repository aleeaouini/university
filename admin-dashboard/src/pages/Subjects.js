import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { BookOpen, Plus, Edit2, Trash2, Search, X, Layers, GraduationCap, Loader2 } from "lucide-react";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [niveaux, setNiveaux] = useState([]);

  const [form, setForm] = useState({ nom: "", id_niveau: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      setIsLoadingTable(true);
      const res = await axiosClient.get("/matieres");
      setSubjects(res.data);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to fetch subjects");
    } finally {
      setIsLoadingTable(false);
    }
  };

  // Fetch niveaux
  const fetchNiveaux = async () => {
    try {
      const res = await axiosClient.get("/niveaux");
      setNiveaux(res.data);
    } catch (error) {
      console.error("Error fetching niveaux:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
    fetchNiveaux();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nom: "", id_niveau: "" });
    setEditId(null);
  };

 // Replace your handleSubmit function with this:
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.nom.trim() || !form.id_niveau) return;

  // Find the selected niveau to get its name and specialite
  const selectedNiveau = niveaux.find(nv => nv.id === parseInt(form.id_niveau));
  
  if (!selectedNiveau) {
    alert("Selected niveau not found");
    return;
  }

  const payload = {
    nom: form.nom.trim(),
    nom_niveau: selectedNiveau.nom,
    nom_specialite: selectedNiveau.specialite || ""
  };

  try {
    setIsLoadingForm(true);
    if (editId) {
      await axiosClient.put(`/matieres/${editId}`, payload);
      alert("Subject updated successfully!");
    } else {
      await axiosClient.post("/matieres", payload);
      alert("Subject created successfully!");
    }
    resetForm();
    fetchSubjects();
  } catch (error) {
    alert(error.response?.data?.error || "Failed to save subject");
  } finally {
    setIsLoadingForm(false);
  }
};

  const handleEdit = (s) => {
    setForm({
      nom: s.nom || "",
      id_niveau: s.id_niveau || ""
    });
    setEditId(s.id);
    document.getElementById("subject-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      setIsLoadingTable(true);
      await axiosClient.delete(`/matieres/${id}`);
      fetchSubjects();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete subject");
    } finally {
      setIsLoadingTable(false);
    }
  };

  const filteredSubjects = subjects.filter((s) =>
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.niveau && s.niveau.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.specialite && s.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const uniqueNiveauxCount = new Set(subjects.map(s => s.niveau).filter(Boolean)).size;
  const uniqueSpecialitesCount = new Set(subjects.map(s => s.specialite).filter(Boolean)).size;

  return (
    <div className="page-container">

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <BookOpen className="icon" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Subjects</h1>
            <p className="page-subtitle">Manage course subjects and curriculum</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total"><BookOpen className="stat-icon" /></div>
          <div className="stat-content">
            <div className="stat-number">{subjects.length}</div>
            <div className="stat-label">Total Subjects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper filtered"><Search className="stat-icon" /></div>
          <div className="stat-content">
            <div className="stat-number">{filteredSubjects.length}</div>
            <div className="stat-label">Filtered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper active"><Layers className="stat-icon" /></div>
          <div className="stat-content">
            <div className="stat-number">{uniqueNiveauxCount}</div>
            <div className="stat-label">Niveaux</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper active-2"><GraduationCap className="stat-icon" /></div>
          <div className="stat-content">
            <div className="stat-number">{uniqueSpecialitesCount}</div>
            <div className="stat-label">Specialités</div>
          </div>
        </div>
      </div>

      <div className="content-layout">

        {/* LEFT FORM */}
        <div className="form-column">
          <div className="form-card" id="subject-form">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-title-icon" />
                {editId ? "Update Subject" : "Create New Subject"}
              </div>
              {editId && (
                <button onClick={resetForm} className="cancel-edit-btn">
                  <X className="cancel-icon" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="subject-form">

              {/* Subject Name */}
              <div className="input-group">
                <label className="input-label">Subject Name</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoadingForm}
                />
              </div>

              {/* Niveau Selector */}
              <div className="input-group">
                <label className="input-label">Niveau</label>
                <select
                  name="id_niveau"
                  value={form.id_niveau}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoadingForm}
                >
                  <option value="">Select a niveau</option>
                  {niveaux.map((nv) => (
                    <option key={nv.id} value={nv.id}>
                      {nv.nom} {nv.specialite ? `— ${nv.specialite}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`submit-btn ${editId ? "update" : "create"}`}
                disabled={isLoadingForm}
              >
                {isLoadingForm ? (
                  <>
                    <Loader2 className="btn-icon animate-spin" /> Processing...
                  </>
                ) : editId ? (
                  <>
                    <Edit2 className="btn-icon" /> Update Subject
                  </>
                ) : (
                  <>
                    <Plus className="btn-icon" /> Create Subject
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT TABLE */}
        <div className="table-column">
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search-btn">
                  <X className="clear-icon" />
                </button>
              )}
            </div>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3 className="table-title">Subject List</h3>
            </div>

            <div className="table-container">
              {isLoadingTable ? (
                <div className="loading-state">
                  <Loader2 className="loading-icon animate-spin" />
                  <p>Loading subjects...</p>
                </div>
              ) : (
                <>
                  <table className="subjects-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Niveau</th>
                        <th>Specialité</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredSubjects.map((subject) => (
                        <tr key={subject.id}>
                          <td>#{subject.id}</td>
                          <td>{subject.nom}</td>
                          <td>{subject.niveau}</td>
                          <td>{subject.specialite}</td>

                          <td>
                            <button className="action-btn edit-btn" onClick={() => handleEdit(subject)}>
                              <Edit2 />
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDelete(subject.id)}>
                              <Trash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredSubjects.length === 0 && (
                    <div className="empty-state">
                      <BookOpen className="empty-icon" />
                      <h3>No subjects found</h3>
                      <p>Try adjusting your search or create a new subject</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Subjects;
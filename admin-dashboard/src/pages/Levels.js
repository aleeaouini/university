import React, { useEffect, useState } from "react"; 
import axiosClient from "../api/axiosClient";
import { Layers, Plus, Edit2, Trash2, Search, X, GraduationCap } from "lucide-react";

function Levels() {
  const [levels, setLevels] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [form, setForm] = useState({ nom: "", nom_specialite: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const fetchLevels = async () => {
    try {
      setIsTableLoading(true);
      const res = await axiosClient.get("/niveaux");
      setLevels(res.data);
    } catch (error) {
      console.error("Error fetching levels:", error);
      alert(error.response?.data?.error || "Failed to fetch levels");
    } finally {
      setIsTableLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await axiosClient.get("/specialites");
      setSpecialties(res.data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      alert(error.response?.data?.error || "Failed to fetch specialties");
    }
  };

  useEffect(() => {
    fetchLevels();
    fetchSpecialties();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nom: "", nom_specialite: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.nom_specialite.trim()) return;

    const payload = {
      nom: form.nom,
      nom_specialite: form.nom_specialite
    };

    try {
      setIsFormLoading(true);

      if (editId) {
        await axiosClient.put(`/niveaux/${editId}`, payload);
      } else {
        await axiosClient.post("/niveaux", payload);
      }

      resetForm();
      await fetchLevels();

      alert(editId ? "Level updated successfully!" : "Level created successfully!");
    } catch (error) {
      console.error("Error saving level:", error);
      alert(error.response?.data?.error || "Failed to save level");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEdit = (level) => {
    setForm({
      nom: level.nom,
      nom_specialite: level.specialite || ""
    });
    setEditId(level.id);
    document.getElementById("level-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this level?")) return;

    try {
      setIsTableLoading(true);
      await axiosClient.delete(`/niveaux/${id}`);
      await fetchLevels();
      alert("Level deleted successfully!");
    } catch (error) {
      console.error("Error deleting level:", error);
      alert(error.response?.data?.error || "Failed to delete level");
    } finally {
      setIsTableLoading(false);
    }
  };

  const filteredLevels = levels.filter((l) =>
    l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.specialite && l.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <Layers className="icon" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Academic Levels</h1>
            <p className="page-subtitle">Manage study levels and academic years</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <Layers className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{levels.length}</div>
            <div className="stat-label">Total Levels</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper filtered">
            <Search className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredLevels.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper active">
            <GraduationCap className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{specialties.length}</div>
            <div className="stat-label">Specialties</div>
          </div>
        </div>
      </div>

      <div className="content-layout">
        <div className="form-column">
          <div className="form-card" id="level-form">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-title-icon" />
                {editId ? "Update Level" : "Create New Level"}
              </div>
              {editId && (
                <button
                  onClick={resetForm}
                  className="cancel-edit-btn"
                  title="Cancel edit"
                  aria-label="Cancel edit"
                >
                  <X className="cancel-icon" />
                </button>
              )}
            </div>

            <div className="specialty-form">
              <div className="input-group">
                <label htmlFor="nom" className="input-label">Level Name</label>
                <input
                  type="text"
                  id="nom"
                  placeholder="e.g., 1st Year, 2nd Year, Master 1..."
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isFormLoading}
                />
              </div>

              <div className="input-group">
                <label htmlFor="nom_specialite" className="input-label">Specialty</label>
                <select
                  id="nom_specialite"
                  name="nom_specialite"
                  value={form.nom_specialite}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isFormLoading}
                >
                  <option value="">Select a specialty</option>
                  {specialties.map((spec) => (
                    <option key={spec.id} value={spec.nom}>
                      {spec.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                className={`submit-btn ${editId ? "update" : "create"} ${isFormLoading ? "loading" : ""}`}
                disabled={isFormLoading || !form.nom.trim() || !form.nom_specialite.trim()}
              >
                {isFormLoading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {editId ? (
                      <>
                        <Edit2 className="btn-icon" />
                        Update Level
                      </>
                    ) : (
                      <>
                        <Plus className="btn-icon" />
                        Create Level
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="table-column">
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search levels by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-btn"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="clear-icon" />
                </button>
              )}
            </div>
          </div>

          <div className="table-section">
            <div className="table-header">
              <h3 className="table-title">Level List</h3>
              <div className="table-actions">
                <span className="result-count">
                  Showing {filteredLevels.length} of {levels.length} levels
                </span>
              </div>
            </div>

            <div className="table-container">
              {isTableLoading && levels.length === 0 ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading levels...</p>
                </div>
              ) : (
                <>
                  <table className="specialties-table">
                    <thead>
                      <tr>
                        <th className="table-th id-col">ID</th>
                        <th className="table-th name-col">Level Name</th>
                        <th className="table-th department-col">Specialty</th>
                        <th className="table-th actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLevels.map((level, index) => (
                        <tr key={level.id} className="table-row" style={{ animationDelay: `${index * 0.05}s` }}>
                          <td className="table-td id-cell">
                            <span className="id-badge">#{level.id}</span>
                          </td>
                          <td className="table-td name-cell">
                            <div className="specialty-info">
                              <div className="specialty-avatar">
                                <Layers className="specialty-icon" />
                              </div>
                              <div className="specialty-details">
                                <span className="specialty-name">{level.nom}</span>
                                <span className="specialty-meta">Academic Year</span>
                              </div>
                            </div>
                          </td>
                          <td className="table-td department-cell">
                            <div className="department-info">
                              <GraduationCap className="department-icon" />
                              <span>{level.specialite || "No Specialty"}</span>
                            </div>
                          </td>
                          <td className="table-td actions-cell">
                            <div className="actions-wrapper">
                              <button
                                onClick={() => handleEdit(level)}
                                className="action-btn edit-btn"
                                title="Edit level"
                                disabled={isFormLoading || isTableLoading}
                                aria-label={`Edit ${level.nom}`}
                              >
                                <Edit2 className="action-icon" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(level.id)}
                                className="action-btn delete-btn"
                                title="Delete level"
                                disabled={isFormLoading || isTableLoading}
                                aria-label={`Delete ${level.nom}`}
                              >
                                <Trash2 className="action-icon" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredLevels.length === 0 && !isTableLoading && (
                    <div className="empty-state">
                      <div className="empty-icon-wrapper">
                        <Layers className="empty-icon" />
                      </div>
                      <div className="empty-text">
                        <h3>No levels found</h3>
                        <p>
                          {searchTerm
                            ? "No levels match your search criteria. Try adjusting your search terms."
                            : "Get started by creating your first level using the form on the left."}
                        </p>
                      </div>
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

export default Levels;

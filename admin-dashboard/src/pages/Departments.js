import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Building2, Plus, Edit2, Trash2, Search, X } from "lucide-react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ nom: "", nom_chef: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get("/departements");
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.nom.trim()) return;

  try {
    setIsLoading(true);
    if (editId) {
      await axiosClient.put(`/departements/${editId}`, form);
    } else {
      await axiosClient.post("/departements", form);
    }
    setForm({ nom: "", nom_chef: "" });
    setEditId(null);
    await fetchDepartments();
    alert("Department saved successfully!");
  } catch (error) {
    console.error("Error saving department:", error);
    const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     error.message || 
                     "Failed to save department";
    alert(errorMsg);
  } finally {
    setIsLoading(false);
  }
};

  const handleEdit = (d) => {
    setForm({ nom: d.nom || "", nom_chef: d.chef_nom ? `${d.chef_prenom} ${d.chef_nom}` : "" });
    setEditId(d.id);
    document.getElementById("department-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        setIsLoading(true);
        await axiosClient.delete(`/departements/${id}`);
        await fetchDepartments();
      } catch (error) {
        console.error("Error deleting department:", error);
        alert(error.response?.data?.error || "Failed to delete department");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredDepartments = departments.filter(d =>
    d.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper"><Building2 className="icon" /></div>
          <div className="header-text">
            <h1 className="page-title">Departments</h1>
            <p className="page-subtitle">Manage your department records and assign chefs</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Form Section */}
        <div className="form-section">
          <div className="card form-card" id="department-form">
            <div className="card-header">
              <div className="card-title">
                <Plus className="title-icon" />
                {editId ? "Update Department" : "Create New Department"}
              </div>
              {editId && (
                <button
                  onClick={() => { setForm({ nom: "", nom_chef: "" }); setEditId(null); }}
                  className="cancel-button"
                >
                  <X className="cancel-icon" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Department name..."
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Chef name (optional)..."
                  name="nom_chef"
                  value={form.nom_chef}
                  onChange={handleChange}
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className={`submit-button ${editId ? 'update' : 'create'}`}
                  disabled={isLoading || !form.nom.trim()}
                >
                  {isLoading ? <div className="loading-spinner"></div> :
                    editId ? "Update Department" : "Create Department"
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Stats */}
          <div className="card stats-card">
            <div className="stats-content">
              <div className="stat-item">
                <div className="stat-number">{departments.length}</div>
                <div className="stat-label">Total Departments</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{filteredDepartments.length}</div>
                <div className="stat-label">Filtered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="card search-card">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="clear-search">
                  <X className="clear-icon" />
                </button>
              )}
            </div>
          </div>

          <div className="card table-card">
            <div className="table-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="loading-spinner large"></div>
                  <p>Loading departments...</p>
                </div>
              ) : (
                <>
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th>ID</th>
                        <th>Department Name</th>
                        <th>Chef</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((d, idx) => (
                        <tr key={d.id} className="table-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <td>#{d.id}</td>
                          <td>{d.nom}</td>
                          <td>{d.chef_nom ? `${d.chef_prenom} ${d.chef_nom}` : "—"}</td>
                          <td>
                            <button onClick={() => handleEdit(d)} className="action-button edit" disabled={isLoading}>
                              <Edit2 />
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="action-button delete" disabled={isLoading}>
                              <Trash2 />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredDepartments.length === 0 && (
                    <div className="empty-state">
                      <Building2 className="empty-icon" />
                      <div className="empty-text">
                        <h3>No departments found</h3>
                        <p>{searchTerm ? "No matching departments." : "Create your first department."}</p>
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

export default Departments;

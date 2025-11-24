import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { GraduationCap, Plus, Edit2, Trash2, Search, X, Building2 } from "lucide-react";

function Specialties() {
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ nom: "", nom_departement: "" });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      setIsTableLoading(true);
      const res = await axiosClient.get("/specialites");
      setSpecialties(res.data);
    } catch (error) {
      console.error("Error fetching specialties:", error);
    } finally {
      setIsTableLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await axiosClient.get("/departements");
      setDepartments(res.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  useEffect(() => {
    fetchSpecialties();
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ nom: "", nom_departement: "" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.nom_departement) return;

    try {
      setIsFormLoading(true);

      const payload = {
        nom: form.nom,
        nom_departement: form.nom_departement, // <-- IMPORTANT
      };

      if (editId) {
        await axiosClient.put(`/specialites/${editId}`, payload);
      } else {
        await axiosClient.post("/specialites", payload);
      }

      resetForm();
      await fetchSpecialties();
    } catch (error) {
      console.error("Error saving specialty:", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleEdit = (specialty) => {
    setForm({
      nom: specialty.nom,
      nom_departement: specialty.nom_departement || "", // <-- NEW
    });

    setEditId(specialty.id);
    document.getElementById("specialty-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this specialty?")) return;

    try {
      setIsTableLoading(true);
      await axiosClient.delete(`/specialites/${id}`);
      await fetchSpecialties();
    } catch (error) {
      console.error("Error deleting specialty:", error);
    } finally {
      setIsTableLoading(false);
    }
  };

  const filteredSpecialties = specialties.filter((s) =>
    s.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDepartmentName = (nom) => nom || "No Department";

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <GraduationCap className="icon" />
          </div>
          <div className="header-text">
            <h1 className="page-title">Specialties</h1>
            <p className="page-subtitle">Manage academic specialties and programs</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper total">
            <GraduationCap className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{specialties.length}</div>
            <div className="stat-label">Total Specialties</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper filtered">
            <Search className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredSpecialties.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper active">
            <Building2 className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-number">{departments.length}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-layout">
        {/* FORM */}
        <div className="form-column">
          <div className="form-card" id="specialty-form">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-title-icon" />
                {editId ? "Update Specialty" : "Create New Specialty"}
              </div>
              {editId && (
                <button
                  onClick={resetForm}
                  className="cancel-edit-btn"
                >
                  <X className="cancel-icon" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="specialty-form">
              <div className="input-group">
                <label className="input-label">Specialty Name</label>
                <input
                  type="text"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              {/* DEPARTMENT NAME INSTEAD OF ID */}
              <div className="input-group">
                <label className="input-label">Department</label>
                <select
                  name="nom_departement"
                  value={form.nom_departement}
                  onChange={handleChange}
                  className="form-input"
                  required
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.nom}>
                      {dept.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={`submit-btn ${editId ? "update" : "create"}`}
                disabled={isFormLoading}
              >
                {editId ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-column">
          <div className="search-container">
            <Search />
            <input
              type="text"
              placeholder="Search specialties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <table className="specialties-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredSpecialties.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td>{s.nom}</td>
                  <td>{getDepartmentName(s.nom_departement)}</td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(s)}>
                      <Edit2 />
                    </button>

                    <button className="delete-btn" onClick={() => handleDelete(s.id)}>
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSpecialties.length === 0 && <p>No specialties found.</p>}
        </div>
      </div>
    </div>
  );
}

export default Specialties;

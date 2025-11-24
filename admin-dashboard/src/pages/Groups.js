import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Users, Plus, Edit2, Trash2, Search, X } from "lucide-react";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [levels, setLevels] = useState([]);
  const [form, setForm] = useState({
    nom_niveau: "",
    nom_specialite: "",
  });
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch groups, specialties, levels
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [groupsRes, specsRes, levelsRes] = await Promise.all([
        axiosClient.get("/groupes"),
        axiosClient.get("/specialites"),
        axiosClient.get("/niveaux"),
      ]);
      setGroups(groupsRes.data);
      setSpecialties(specsRes.data);
      setLevels(levelsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nom_niveau || !form.nom_specialite) return;

    try {
      setIsLoading(true);

      const payload = {
        nom_niveau: form.nom_niveau,
        nom_specialite: form.nom_specialite,
      };

      if (editId) {
        await axiosClient.put(`/groupes/${editId}`, payload);
      } else {
        await axiosClient.post("/groupes", payload);
      }

      setForm({ nom_niveau: "", nom_specialite: "" });
      setEditId(null);
      await fetchData();
    } catch (error) {
      console.error("Error saving group:", error);
      alert(error.response?.data?.error || "Failed to save group");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (g) => {
    setForm({
      nom_niveau: g.niveau || "",
      nom_specialite: g.specialite || "",
    });
    setEditId(g.id);

    document.getElementById("group-form")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this group?")) {
      try {
        setIsLoading(true);
        await axiosClient.delete(`/groupes/${id}`);
        await fetchData();
      } catch (error) {
        alert(error.response?.data?.error || "Failed to delete group");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.nom.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="page-title">Groups</h1>
            <p className="page-subtitle">
              Manage student groups and class organization
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="content-layout">
        {/* Left Form Column */}
        <div className="form-column">
          <div className="form-card" id="group-form">
            <div className="form-header">
              <div className="form-title">
                <Plus className="form-title-icon" />
                {editId ? "Update Group" : "Create New Group"}
              </div>
              {editId && (
                <button
                  onClick={() => {
                    setForm({ nom_niveau: "", nom_specialite: "" });
                    setEditId(null);
                  }}
                  className="cancel-edit-btn"
                >
                  <X />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="group-form">
              <div className="input-group">
                <label>Level</label>
                <select
                  name="nom_niveau"
                  value={form.nom_niveau}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select level</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.nom}>
                      {l.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Specialty</label>
                <select
                  name="nom_specialite"
                  value={form.nom_specialite}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select specialty</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.nom}>
                      {s.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {editId ? "Update Group" : "Create Group"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Table Column */}
        <div className="table-column">
          <div className="search-section">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X />
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="groups-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Group Name</th>
                  <th>Level</th>
                  <th>Specialty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((g) => (
                  <tr key={g.id}>
                    <td>#{g.id}</td>
                    <td>{g.nom}</td>
                    <td>{g.niveau}</td>
                    <td>{g.specialite}</td>
                    <td>
                      <button onClick={() => handleEdit(g)}>
                        <Edit2 />
                      </button>
                      <button onClick={() => handleDelete(g.id)}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredGroups.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No groups found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Groups;

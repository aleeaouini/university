import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import jsPDF from "jspdf";
import "jspdf-autotable";
import axiosClient from "../api/axiosClient";

// ================= THEMES =================
const lightTheme = {
  background: "#ffffff", text: "#2d3748", textSecondary: "#718096",
  sidebarBg: "#f7fafc", slotBg: "#ffffff", border: "#e2e8f0",
  primary: "#4a90e2", primaryHover: "#357abd", danger: "#e53e3e",
  success: "#38a169", warning: "#d69e2e", shadow: "rgba(0,0,0,0.1)", borderRadius: "12px"
};
const darkTheme = {
  background: "#1a202c", text: "#f7fafc", textSecondary: "#a0aec0",
  sidebarBg: "#2d3748", slotBg: "#2d3748", border: "#4a5568",
  primary: "#4299e1", primaryHover: "#3182ce", danger: "#fc8181",
  success: "#68d391", warning: "#f6e05e", shadow: "rgba(0,0,0,0.3)", borderRadius: "12px"
};

// ================= GLOBAL STYLES =================
const GlobalStyle = createGlobalStyle`
  body { background: ${({ theme }) => theme.background}; color: ${({ theme }) => theme.text}; margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
  * { box-sizing:border-box; }
`;

/* ========== Styled components ========== */
const AppContainer = styled.div`min-height:100vh;padding:24px;background:${({ theme }) => theme.background};`;
const Header = styled.header`display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid ${({ theme }) => theme.border};`;
const Title = styled.h1`color:${({ theme }) => theme.text};font-size:2.5rem;font-weight:700;margin:0;`;
const Controls = styled.div`display:flex;gap:16px;align-items:center;flex-wrap:wrap;`;
const Button = styled.button`
  background: ${({ theme, variant }) => 
    variant === 'danger' ? theme.danger : 
    variant === 'success' ? theme.success : 
    variant === 'warning' ? theme.warning : 
    theme.primary};
  color:white;border:none;padding:12px 24px;border-radius:8px;cursor:pointer;font-weight:600;font-size:14px;transition:all 0.2s ease;
  &:hover { 
    background:${({ theme, variant }) => 
      variant === 'danger' ? '#c53030' : 
      variant === 'success' ? '#2f855a' : 
      variant === 'warning' ? '#b7791f' : 
      theme.primaryHover}; 
  }
  &:disabled { opacity:0.6; cursor:not-allowed; }
`;
const Select = styled.select`padding:8px 12px; border-radius:6px; border:1px solid #ccc; font-size:14px; background:white; color:#333;`;
const MainLayout = styled.div`display:flex;gap:32px;max-width:1400px;margin:0 auto; @media(max-width:1024px){flex-direction:column;}`;
const Sidebar = styled.div`width:320px;background:${({theme})=>theme.sidebarBg};padding:24px;border-radius:${({theme})=>theme.borderRadius};border:1px solid ${({theme})=>theme.border};`;
const SidebarHeader = styled.div`display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid ${({theme})=>theme.border};`;
const SidebarTitle = styled.h2`color:${({theme})=>theme.text};font-size:1.5rem;font-weight:600;margin:0;`;
const ClassCounter = styled.span`background:${({theme})=>theme.primary};color:white;padding:4px 12px;border-radius:20px;font-size:14px;font-weight:600;`;
const ScheduleContainer = styled.div`flex:1;`;
const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;
const DayColumn = styled.div`
  background:${({theme})=>theme.slotBg};
  border-radius:${({theme})=>theme.borderRadius};
  border:1px solid ${({theme})=>theme.border};
  overflow:hidden;
  display:flex;
  flex-direction:column;
`;
const DayHeader = styled.div`
  background:${({theme})=>theme.primary};
  color:white;
  padding:16px;
  text-align:center;
  font-weight:600;
  font-size:1.1rem;
`;
const DropZone = styled.div`
  padding:4px;
  min-height:50px;
  background:${({isDraggingOver,theme,isConflict})=>isDraggingOver ? `${theme.primary}15` : isConflict ? '#fdd' : 'transparent'};
  border:${({isDraggingOver,theme,isConflict})=>isDraggingOver ? `2px dashed ${theme.primary}` : isConflict ? `2px dashed ${theme.danger}` : '2px dashed transparent'};
  transition: background 0.2s ease, border 0.2s ease;
`;
const ClassBlock = styled.div`
  background:${({theme,type})=>type==='lab'?theme.success:theme.primary};
  color:white;
  padding:8px 12px;
  margin:4px;
  border-radius:8px;
  cursor:grab;
  font-size:14px;
  font-weight:500;
  display:flex;
  flex-direction:column;
  position: relative;

  span.time {
    font-size:12px;
    font-weight:400;
    color:#fff;
    opacity:0.8;
  }

  &:hover .class-actions {
    opacity: 1;
  }
`;
const ClassActions = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;

  button {
    background: rgba(0,0,0,0.7);
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    padding: 2px 6px;
    font-size: 10px;
    line-height: 1;

    &:hover {
      background: rgba(0,0,0,0.9);
    }
  }
`;
const EmptySlot = styled.div`text-align:center;color:${({theme})=>theme.textSecondary};padding:16px 8px;font-style:italic;border:2px dashed ${({theme})=>theme.border};border-radius:8px;margin:4px 0;`;
const ErrorMessage = styled.div`background:#fee;border:1px solid #fcc;padding:12px;border-radius:8px;color:#c00;margin-bottom:16px;`;
const SuccessMessage = styled.div`background:#efe;border:1px solid #cfc;padding:12px;border-radius:8px;color:#080;margin-bottom:16px;`;
const LoadingMessage = styled.div`padding:20px;text-align:center;color:${({theme})=>theme.textSecondary};`;
const DebugInfo = styled.div`background:#f0f8ff;border:1px solid #4a90e2;padding:12px;border-radius:8px;color:#2d3748;margin-bottom:16px;font-family:monospace;font-size:12px;`;

const ModalOverlay = styled.div`
  position: fixed; top:0; left:0; width:100%; height:100%;
  background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000;
`;
const ModalContent = styled.div`
  background: ${({theme})=>theme.slotBg}; padding:24px; border-radius:12px; width:420px; max-width:95%;
`;
const ModalHeader = styled.h3`margin-top:0;color:${({theme})=>theme.text};`;
const ModalForm = styled.form`display:flex; flex-direction:column; gap:12px;`;
const ModalInput = styled.input`padding:8px; border-radius:6px; border:1px solid #ccc; font-size:14px; background:white; color:#333;`;
const ModalLabel = styled.label`font-weight:600;color:${({theme})=>theme.text};font-size:14px;`;
const ModalButtons = styled.div`display:flex; gap:8px; justify-content:flex-end; margin-top:16px;`;

const ConfirmationModal = styled(ModalContent)`
  width: 400px;
  text-align: center;
`;

const ConfirmationText = styled.p`color:${({theme})=>theme.text}; margin-bottom: 20px;`;

// ================= HELPERS =================
const timeToMinutes = t => {
  if (!t) return 0;
  const timeParts = t.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  return hours * 60 + minutes;
};

const intervalsOverlap = (aStart,aEnd,bStart,bEnd) => timeToMinutes(aStart)<timeToMinutes(bEnd) && timeToMinutes(bStart)<timeToMinutes(aEnd);

const normalizeTime = (timeStr) => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  return `${parts[0]}:${parts[1]}`;
};

export default function Emploi() {
  const [theme, setTheme] = useState("light");
  const currentTheme = theme === "light" ? lightTheme : darkTheme;

  const [selectedGroupe, setSelectedGroupe] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const [baseData, setBaseData] = useState({ 
    enseignants: [], 
    salles: [], 
    groupes: [], 
    matieres: [] 
  });
  const [baseLoading, setBaseLoading] = useState(true);

  const [availableClasses, setAvailableClasses] = useState([]);
  const [schedule, setSchedule] = useState({ 
    monday: [], 
    tuesday: [], 
    wednesday: [], 
    thursday: [], 
    friday: [], 
    saturday: [] 
  });

  // États pour les modals
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("create"); // "create" or "edit"
  const [draggedClass, setDraggedClass] = useState(null);
  const [editingSeance, setEditingSeance] = useState(null);
  const [targetDay, setTargetDay] = useState("");
  const [formData, setFormData] = useState({ 
    id_salle: "", 
    id_enseignant: "", 
    heure_debut: "08:30", 
    heure_fin: "10:00" 
  });

  // États pour la confirmation de suppression
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [seanceToDelete, setSeanceToDelete] = useState(null);

  const [conflictSlots, setConflictSlots] = useState({});
  const [disableSubmitDueToConflict, setDisableSubmitDueToConflict] = useState(false);
  const [seanceLoading, setSeanceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dayMap = {
    1: "monday",
    2: "tuesday", 
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
  };
  
  const reverseDayMap = {
    "monday": 1,
    "tuesday": 2,
    "wednesday": 3,
    "thursday": 4,
    "friday": 5,
    "saturday": 6
  };
  
  const generateTimeSlots = () => {
    const slots = []; 
    let start = 8.5; 
    const duration = 1.5; 
    const breakTime = 0.1667;
    
    while (start + duration <= 18.5) {
      const end = start + duration;
      const fmt = h => {
        const hh = Math.floor(h);
        const mm = Math.round((h - hh) * 60);
        return `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
      };
      slots.push({ start: fmt(start), end: fmt(end) });
      start = end + breakTime;
    }
    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // ================= FONCTIONS CRUD =================
  
  const getAllSeancesForGroup = async (groupId) => {
    try {
      setSeanceLoading(true);
      const response = await axiosClient.get(`/seances/group/${groupId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("❌ Error fetching seances:", error);
      return [];
    } finally {
      setSeanceLoading(false);
    }
  };

  const createSeance = async (input) => {
    try {
      const response = await axiosClient.post('/seances', input);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating seance:", error);
      throw error;
    }
  };

  // ================= NOUVELLE FONCTION : UPDATE SEANCE =================
  const updateSeance = async (id, input) => {
    try {
      console.log("🔄 Updating seance:", id, input);
      const response = await axiosClient.put(`/seances/${id}`, input);
      console.log("✅ Seance updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error updating seance:", error);
      throw error;
    }
  };

  // ================= NOUVELLE FONCTION : DELETE SEANCE =================
  const deleteSeance = async (id) => {
    try {
      console.log("🔄 Deleting seance:", id);
      const response = await axiosClient.delete(`/seances/${id}`);
      console.log("✅ Seance deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error deleting seance:", error);
      throw error;
    }
  };

  const refreshScheduleDisplay = async () => {
    if (!selectedGroupe) return;
    
    try {
      const allSeances = await getAllSeancesForGroup(selectedGroupe);
      processScheduleData(baseData.matieres, allSeances);
    } catch (error) {
      console.error("❌ Error refreshing schedule display:", error);
      setError("Failed to refresh schedule display");
    }
  };

  const processScheduleData = (matieres, seances) => {
    const newSchedule = { 
      monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] 
    };

    if (Array.isArray(seances)) {
      seances.forEach(seance => {
        const dayName = dayMap[seance.day_of_week];
        
        if (dayName && newSchedule[dayName]) {
          const matiere = matieres?.find(m => m.id === seance.id_matiere);
          const enseignant = baseData.enseignants.find(e => e.id === seance.id_enseignant);
          const salle = baseData.salles.find(s => s.id === seance.id_salle);
          
          const formattedSeance = {
            id: seance.id,
            id_matiere: seance.id_matiere,
            id_salle: seance.id_salle,
            id_enseignant: seance.id_enseignant,
            id_groupe: seance.id_groupe,
            day_of_week: seance.day_of_week,
            heure_debut: normalizeTime(seance.heure_debut),
            heure_fin: normalizeTime(seance.heure_fin),
            matiere: { 
              nom: matiere?.nom || seance.matiere_nom || `Subject ${seance.id_matiere}` 
            },
            enseignant: { 
              nom: enseignant?.nom || seance.enseignant_nom || 'Teacher',
              prenom: enseignant?.prenom || seance.enseignant_prenom || ''
            },
            salle: { 
              numero: salle?.numero || seance.salle_numero || 'Room' 
            }
          };
          
          newSchedule[dayName].push(formattedSeance);
        }
      });

      Object.keys(newSchedule).forEach(day => {
        newSchedule[day].sort((a, b) => timeToMinutes(a.heure_debut) - timeToMinutes(b.heure_debut));
      });
    }

    setSchedule(newSchedule);
    
    const scheduledMatiereIds = new Set();
    if (Array.isArray(seances)) {
      seances.forEach(s => scheduledMatiereIds.add(Number(s.id_matiere)));
    }
    
    const available = Array.isArray(matieres) 
      ? matieres.filter(m => !scheduledMatiereIds.has(Number(m.id)))
      : [];
    
    setAvailableClasses(available);
  };

  const getClassForTimeSlot = (day, timeSlot) => {
    const daySeances = schedule[day] || [];
    return daySeances.find(seance => seance.heure_debut === timeSlot.start);
  };

  // ================= NOUVELLES FONCTIONS : GESTION DES ACTIONS =================
  const handleEditSeance = (seance) => {
    setEditingSeance(seance);
    setModalType("edit");
    setFormData({
      id_salle: seance.id_salle,
      id_enseignant: seance.id_enseignant,
      heure_debut: seance.heure_debut,
      heure_fin: seance.heure_fin
    });
    setModalOpen(true);
  };

  const handleDeleteSeance = (seance) => {
    setSeanceToDelete(seance);
    setConfirmationModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!seanceToDelete) return;
    
    try {
      setSubmitting(true);
      await deleteSeance(seanceToDelete.id);
      
      await refreshScheduleDisplay();
      
      setConfirmationModalOpen(false);
      setSeanceToDelete(null);
      setSuccess(`✅ Session "${seanceToDelete.matiere.nom}" successfully deleted!`);
      
    } catch (err) {
      console.error("❌ Error deleting seance:", err);
      setError(`❌ Failed to delete session: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= MODAL SUBMIT UNIFIÉ =================
  const handleModalSubmit = async e => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const dayNumber = modalType === "create" ? reverseDayMap[targetDay] : editingSeance.day_of_week;
      const input = {
        id_groupe: Number(selectedGroupe),
        id_matiere: modalType === "create" ? Number(draggedClass.id) : Number(editingSeance.id_matiere),
        id_salle: Number(formData.id_salle),
        id_enseignant: Number(formData.id_enseignant),
        day_of_week: dayNumber,
        heure_debut: formData.heure_debut,
        heure_fin: formData.heure_fin
      };
      
      if (modalType === "create") {
        await createSeance(input);
        setSuccess(`✅ Session "${draggedClass.nom}" successfully scheduled!`);
      } else {
        await updateSeance(editingSeance.id, input);
        setSuccess(`✅ Session "${editingSeance.matiere.nom}" successfully updated!`);
      }
      
      await refreshScheduleDisplay();
      
      // Reset modal
      setModalOpen(false);
      setDraggedClass(null);
      setEditingSeance(null);
      setFormData({
        id_salle: "",
        id_enseignant: "", 
        heure_debut: "08:30", 
        heure_fin: "10:00"
      });
      
    } catch (err) {
      console.error("❌ Error in handleModalSubmit:", err);
      setError(`❌ Failed to ${modalType} session: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DRAG & DROP =================
  const onDragEnd = result => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (!selectedGroupe) {
      setError("Please select a group first");
      return;
    }
    
    if (source.droppableId === "sidebar" && destination.droppableId !== "sidebar") {
      const slot = timeSlots[destination.index] || timeSlots[0];
      const day = destination.droppableId;
      
      const existingClass = getClassForTimeSlot(day, slot);
      if (existingClass) {
        setError(`Slot ${slot.start}-${slot.end} on ${day.toUpperCase()} is already occupied by ${existingClass.matiere.nom}`);
        return;
      }
      
      const cls = availableClasses[source.index];
      
      if (!cls) {
        setError("No class available to assign");
        return;
      }
      
      setDraggedClass(cls);
      setTargetDay(day);
      setModalType("create");
      setFormData({
        ...formData,
        heure_debut: slot.start,
        heure_fin: slot.end
      });
      setModalOpen(true);
      setError(null);
    }
  };

  // ================= EFFETS =================
  useEffect(() => {
    const debugData = {
      selectedGroupe,
      baseData: {
        enseignants: baseData.enseignants?.length || 0,
        salles: baseData.salles?.length || 0,
        groupes: baseData.groupes?.length || 0,
        matieres: baseData.matieres?.length || 0
      },
      availableClasses: availableClasses.length,
      schedule: Object.keys(schedule).reduce((acc, day) => {
        acc[day] = {
          count: schedule[day].length,
          classes: schedule[day].map(s => ({
            matiere: s.matiere.nom,
            time: `${s.heure_debut}-${s.heure_fin}`
          }))
        };
        return acc;
      }, {})
    };
    
    setDebugInfo(JSON.stringify(debugData, null, 2));
  }, [selectedGroupe, baseData, availableClasses, schedule]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // ================= FETCH BASE DATA =================
  useEffect(() => {
    const fetchBase = async () => {
      try {
        setBaseLoading(true);
        setError(null);
        
        const [enseignantsRes, sallesRes, groupesRes] = await Promise.all([
          axiosClient.get('/enseignants'),
          axiosClient.get('/salles'),
          axiosClient.get('/groupes')
        ]);

        setBaseData({
          enseignants: enseignantsRes.data || [],
          salles: sallesRes.data || [],
          groupes: groupesRes.data || [],
          matieres: []
        });
      } catch (err) {
        console.error("❌ Error loading base data:", err);
        setError("Failed to load base data: " + (err.message || "Unknown error"));
      } finally {
        setBaseLoading(false);
      }
    };
    
    fetchBase();
  }, []);

  // ================= LOAD SCHEDULE WHEN GROUP IS SELECTED =================
  useEffect(() => {
    if (!selectedGroupe) {
      setBaseData(prev => ({ ...prev, matieres: [] }));
      setAvailableClasses([]);
      setSchedule({ monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [] });
      return;
    }

    const loadGroupData = async () => {
      try {
        setBaseLoading(true);
        setError(null);
        
        const matieresRes = await axiosClient.get(`/matieres/group/${selectedGroupe}`);
        const matieresData = Array.isArray(matieresRes.data) ? matieresRes.data : [];
        
        setBaseData(prev => ({ ...prev, matieres: matieresData }));
        
        const allSeances = await getAllSeancesForGroup(selectedGroupe);
        processScheduleData(matieresData, allSeances);
        
      } catch (err) {
        console.error("❌ Error loading group data:", err);
        setError(`Failed to load data for this group: ${err.message}`);
      } finally {
        setBaseLoading(false);
      }
    };

    loadGroupData();
  }, [selectedGroupe]);

  const downloadPDF = () => {
    if (!selectedGroupe) {
      setError("Please select a group first");
      return;
    }

    const doc = new jsPDF();
    const groupName = baseData.groupes.find(g => g.id == selectedGroupe)?.nom || "Group";
    
    doc.setFontSize(20);
    doc.text(`Schedule - ${groupName}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableCols = ["Day", "Time", "Subject", "Room", "Teacher"];
    const tableRows = [];
    
    Object.entries(schedule).forEach(([day, classes]) => {
      classes.forEach(cls => {
        tableRows.push([
          day.toUpperCase(),
          `${cls.heure_debut}-${cls.heure_fin}`,
          cls.matiere?.nom || `Subject ${cls.id_matiere}`,
          cls.salle?.numero || cls.id_salle || "",
          `${cls.enseignant?.prenom || ""} ${cls.enseignant?.nom || ""}`.trim()
        ]);
      });
    });
    
    if (tableRows.length === 0) {
      tableRows.push(["No scheduled sessions found", "", "", "", ""]);
    }
    
    doc.autoTable({ 
      head: [tableCols], 
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [74, 144, 226] }
    });
    
    doc.save(`schedule_${groupName.replace(/\s+/g, '_')}.pdf`);
  };

  const refreshData = async () => {
    if (selectedGroupe) {
      try {
        await refreshScheduleDisplay();
        setSuccess("Schedule refreshed successfully!");
      } catch (err) {
        console.error("❌ Error refreshing data:", err);
        setError("Failed to refresh data");
      }
    } else {
      setError("Please select a group first");
    }
  };

  const { enseignants, salles, groupes } = baseData;

  // ================= RENDER =================
  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>📚 Weekly Schedule Planner</Title>
          <Controls>
            <Select 
              value={selectedGroupe} 
              onChange={e => setSelectedGroupe(e.target.value)}
            >
              <option value="">Select Group</option>
              {groupes.map(g => (
                <option key={g.id} value={g.id}>
                  {g.nom}
                </option>
              ))}
            </Select>
            
            <Button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
              {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
            </Button>
            
            <Button variant="success" onClick={downloadPDF} disabled={!selectedGroupe}>
              📄 Download PDF
            </Button>

            <Button onClick={refreshData} disabled={!selectedGroupe}>
              🔄 Refresh Schedule
            </Button>
          </Controls>
        </Header>

        {baseLoading && <LoadingMessage>Loading data…</LoadingMessage>}
        {seanceLoading && <LoadingMessage>Loading schedule…</LoadingMessage>}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <DebugInfo>
          <strong>Debug Info:</strong>
          <pre>{debugInfo}</pre>
        </DebugInfo>

        <DragDropContext onDragEnd={onDragEnd}>
          <MainLayout>
            {/* SIDEBAR - Available Classes */}
            <Sidebar>
              <SidebarHeader>
                <SidebarTitle>Available Classes</SidebarTitle>
                <ClassCounter>{availableClasses.length}</ClassCounter>
              </SidebarHeader>
              
              <Droppable droppableId="sidebar">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {availableClasses.map((cls, index) => (
                      <Draggable key={cls.id} draggableId={`class-${cls.id}`} index={index}>
                        {(prov) => (
                          <ClassBlock ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                            {cls.nom}
                            {cls.niveau && <small> ({cls.niveau})</small>}
                          </ClassBlock>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {availableClasses.length === 0 && (
                      <EmptySlot>
                        {selectedGroupe ? "All classes are scheduled" : "Select a group to see available classes"}
                      </EmptySlot>
                    )}
                  </div>
                )}
              </Droppable>
            </Sidebar>

            {/* SCHEDULE GRID */}
            <ScheduleContainer>
              <DaysGrid>
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map(day => (
                  <DayColumn key={day}>
                    <DayHeader>{day.toUpperCase()}</DayHeader>
                    
                    <Droppable droppableId={day}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                          {timeSlots.map((slot, index) => {
                            const cls = getClassForTimeSlot(day, slot);
                            const isConflict = (conflictSlots[day] || []).includes(slot.start);
                            
                            return (
                              <DropZone key={index} isDraggingOver={snapshot.isDraggingOver} isConflict={isConflict}>
                                {cls ? (
                                  <Draggable key={cls.id} draggableId={`seance-${cls.id}`} index={index}>
                                    {(prov) => (
                                      <ClassBlock
                                        ref={prov.innerRef}
                                        {...prov.draggableProps}
                                        {...prov.dragHandleProps}
                                      >
                                        {/* ================= BOUTONS D'ACTION ================= */}
                                        <ClassActions className="class-actions">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditSeance(cls);
                                            }}
                                            title="Edit"
                                          >
                                            ✏️
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSeance(cls);
                                            }}
                                            title="Delete"
                                          >
                                            🗑️
                                          </button>
                                        </ClassActions>

                                        {cls.matiere?.nom || `Subject ${cls.id_matiere}`}
                                        <span className="time">
                                          {cls.heure_debut}-{cls.heure_fin}
                                        </span>
                                        <span className="time">
                                          {cls.salle?.numero} • {cls.enseignant?.prenom} {cls.enseignant?.nom}
                                        </span>
                                      </ClassBlock>
                                    )}
                                  </Draggable>
                                ) : (
                                  <EmptySlot>
                                    {slot.start}-{slot.end}
                                    <br />
                                    <small>Drag class here</small>
                                  </EmptySlot>
                                )}
                              </DropZone>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DayColumn>
                ))}
              </DaysGrid>
            </ScheduleContainer>
          </MainLayout>
        </DragDropContext>

        {/* MODAL POUR CRÉER/MODIFIER */}
        {modalOpen && (
          <ModalOverlay>
            <ModalContent>
              <ModalHeader>
                {modalType === "create" ? `Assign "${draggedClass?.nom}"` : `Edit "${editingSeance?.matiere.nom}"`}
              </ModalHeader>
              
              <ModalForm onSubmit={handleModalSubmit}>
                <div>
                  <ModalLabel>Room:</ModalLabel>
                  <Select 
                    required 
                    value={formData.id_salle} 
                    onChange={e => setFormData({...formData, id_salle: e.target.value})}
                  >
                    <option value="">Select Room</option>
                    {salles.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.numero} {s.type ? `(${s.type})` : ''}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <ModalLabel>Teacher:</ModalLabel>
                  <Select 
                    required 
                    value={formData.id_enseignant} 
                    onChange={e => setFormData({...formData, id_enseignant: e.target.value})}
                  >
                    <option value="">Select Teacher</option>
                    {enseignants.map(en => (
                      <option key={en.id} value={en.id}>
                        {en.prenom} {en.nom}
                      </option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <ModalLabel>Start Time:</ModalLabel>
                  <ModalInput 
                    type="time" 
                    required 
                    value={formData.heure_debut} 
                    onChange={e => setFormData({...formData, heure_debut: e.target.value})} 
                  />
                </div>
                
                <div>
                  <ModalLabel>End Time:</ModalLabel>
                  <ModalInput 
                    type="time" 
                    required 
                    value={formData.heure_fin} 
                    onChange={e => setFormData({...formData, heure_fin: e.target.value})} 
                  />
                </div>
                
                <ModalButtons>
                  <Button 
                    type="submit" 
                    variant="success" 
                    disabled={submitting}
                  >
                    {submitting ? "⏳ Saving..." : modalType === "create" ? "✅ Assign" : "💾 Update"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="danger" 
                    onClick={() => {
                      setModalOpen(false);
                      setDraggedClass(null);
                      setEditingSeance(null);
                      setError(null);
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </ModalButtons>
              </ModalForm>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
        {confirmationModalOpen && (
          <ModalOverlay>
            <ConfirmationModal>
              <ModalHeader>Confirm Deletion</ModalHeader>
              <ConfirmationText>
                Are you sure you want to delete the session "<strong>{seanceToDelete?.matiere.nom}</strong>"?
                <br />
                <small>This action cannot be undone.</small>
              </ConfirmationText>
              <ModalButtons>
                <Button 
                  variant="danger" 
                  onClick={confirmDelete}
                  disabled={submitting}
                >
                  {submitting ? "⏳ Deleting..." : "🗑️ Delete"}
                </Button>
                <Button 
                  onClick={() => {
                    setConfirmationModalOpen(false);
                    setSeanceToDelete(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </ModalButtons>
            </ConfirmationModal>
          </ModalOverlay>
        )}
      </AppContainer>
    </ThemeProvider>
  );
}
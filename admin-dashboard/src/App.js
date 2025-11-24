import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Building2, GraduationCap, Users, BookOpen, UserCheck, Users2, Home, Layers, DoorOpen } from "lucide-react";
import { useState, useEffect } from "react";
import Departments from "./pages/Departments";
import Specialties from "./pages/Specialties";
import Levels from "./pages/Levels";
import Groups from "./pages/Groups";
import Subjects from "./pages/Subjects";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import Emploi from './pages/emploi';
import "./App.css";
import axiosClient from "./api/axiosClient";
import SallesManager from "./pages/salle";

function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/departments", icon: Building2, label: "Departments" },
    { path: "/specialties", icon: GraduationCap, label: "Specialties" },
    { path: "/levels", icon: Layers, label: "Levels" },
    { path: "/groups", icon: Users, label: "Groups" },
    { path: "/subjects", icon: BookOpen, label: "Subjects" },
    { path: "/teachers", icon: UserCheck, label: "Teachers" },
    { path: "/students", icon: Users2, label: "Students" },
    { path: "/salle", icon: DoorOpen, label: "Salles" },
    { path: "/emploi", icon: BookOpen, label: "Schedule" },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-text">
              <span className="logo-title">ISET Manager</span>
              <span className="logo-subtitle">Education Management System</span>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="desktop-menu">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="nav-icon" />
                  <span>{item.label}</span>
                  {isActive && <div className="active-indicator"></div>}
                  <div className="hover-effect"></div>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-btn">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="mobile-nav-icon" />
                {item.label}
                {isActive && <div className="mobile-active-indicator"></div>}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app-container">
      <Navbar />
      
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <main className="main-content">
        <div className="content-container">
          {/* Welcome Header */}
          <div className="welcome-header">
            <h1 className="main-title">
              Education Management
            </h1>
            <p className="main-subtitle">
              Streamline your academic operations with our comprehensive management system
            </p>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/specialties" element={<Specialties />} />
            <Route path="/levels" element={<Levels />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/students" element={<Students />} />
            <Route path="/salle" element={<SallesManager />} />
            <Route path="/emploi" element={<Emploi />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Dynamic Dashboard component
function Dashboard() {
  const [departments, setDepartments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [levels, setLevels] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [salles, setSalles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions = [
    { icon: Building2, label: "Departments", path: "/departments", color: "blue" },
    { icon: GraduationCap, label: "Specialties", path: "/specialties", color: "green" },
    { icon: Layers, label: "Levels", path: "/levels", color: "teal" },
    { icon: Users, label: "Groups", path: "/groups", color: "purple" },
    { icon: BookOpen, label: "Subjects", path: "/subjects", color: "orange" },
    { icon: UserCheck, label: "Teachers", path: "/teachers", color: "red" },
    { icon: Users2, label: "Students", path: "/students", color: "indigo" },
    { icon: DoorOpen, label: "Salles", path: "/salle", color: "pink" },
  ];

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching dashboard stats...");
      
      const [
        departmentsRes,
        specialtiesRes,
        levelsRes,
        groupsRes,
        subjectsRes,
        teachersRes,
        studentsRes,
        sallesRes
      ] = await Promise.all([
        axiosClient.get("/departements").catch(err => {
          console.error("Error fetching departments:", err);
          return { data: [] };
        }),
        axiosClient.get("/specialites").catch(err => {
          console.error("Error fetching specialties:", err);
          return { data: [] };
        }),
        axiosClient.get("/niveaux").catch(err => {
          console.error("Error fetching levels:", err);
          return { data: [] };
        }),
        axiosClient.get("/groupes").catch(err => {
          console.error("Error fetching groups:", err);
          return { data: [] };
        }),
        axiosClient.get("/matieres").catch(err => {
          console.error("Error fetching subjects:", err);
          return { data: [] };
        }),
        axiosClient.get("/enseignants").catch(err => {
          console.error("Error fetching teachers:", err);
          return { data: [] };
        }),
        axiosClient.get("/etudiants").catch(err => {
          console.error("Error fetching students:", err);
          return { data: [] };
        }),
        axiosClient.get("/salles").catch(err => {
          console.error("Error fetching salles:", err);
          return { data: [] };
        })
      ]);

      console.log("API Responses:", {
        departments: departmentsRes.data,
        specialties: specialtiesRes.data,
        levels: levelsRes.data,
        groups: groupsRes.data,
        subjects: subjectsRes.data,
        teachers: teachersRes.data,
        students: studentsRes.data,
        salles: sallesRes.data
      });

      setDepartments(departmentsRes.data || []);
      setSpecialties(specialtiesRes.data || []);
      setLevels(levelsRes.data || []);
      setGroups(groupsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setTeachers(teachersRes.data || []);
      setStudents(studentsRes.data || []);
      setSalles(sallesRes.data || []);

    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setDepartments([]);
      setSpecialties([]);
      setLevels([]);
      setGroups([]);
      setSubjects([]);
      setTeachers([]);
      setStudents([]);
      setSalles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard">
        {/* Stats Grid Skeleton */}
        <div className="stats-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div 
              key={item}
              className="stat-card loading"
            >
              <div className="stat-gradient-bar skeleton"></div>
              <div className="stat-value skeleton-text"></div>
              <div className="stat-label skeleton-text"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={action.label}
                to={action.path}
                className={`action-card ${action.color}`}
              >
                <div className="action-icon">
                  <action.icon className="icon" />
                </div>
                <span className="action-label">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{departments.length}</div>
          <div className="stat-label">Departments</div>
        </div>

        <div className="stat-card green">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{specialties.length}</div>
          <div className="stat-label">Specialties</div>
        </div>

        <div className="stat-card teal">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{levels.length}</div>
          <div className="stat-label">Academic Levels</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{groups.length}</div>
          <div className="stat-label">Student Groups</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{subjects.length}</div>
          <div className="stat-label">Active Subjects</div>
        </div>

        <div className="stat-card red">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{teachers.length}</div>
          <div className="stat-label">Teachers</div>
        </div>

        <div className="stat-card indigo">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{students.length}</div>
          <div className="stat-label">Students</div>
        </div>

        <div className="stat-card pink">
          <div className="stat-gradient-bar"></div>
          <div className="stat-value">{salles.length}</div>
          <div className="stat-label">Salles</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <Link
              key={action.label}
              to={action.path}
              className={`action-card ${action.color}`}
            >
              <div className="action-icon">
                <action.icon className="icon" />
              </div>
              <span className="action-label">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
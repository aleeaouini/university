import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './index.css';
import EditProfile from './pages/Editeprofile';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import Home from './pages/Home';
import MainLayout from './layout/MainLayout';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/editprofile' element={<EditProfile />} />
        <Route element={<MainLayout/>}>
        
        <Route path='/' element={<Home />} />
        
       </Route>
        <Route path="/teacherDashboard" element={<TeacherDashboard />} />
        <Route path='/studentDashboard' element={<StudentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

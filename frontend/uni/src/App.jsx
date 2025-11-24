import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './index.css';
import Home from './pages/Home';
import EditProfile from './pages/Editeprofile';
import MainLayout from './layout/MainLayout';
import Contact from './pages/Contact';
import MessEns from './pages/MessEns';
import ChefMessages from './pages/ListEns';
import MessChef from './pages/MessChef';
import StudentDashboard from './pages/StudentDashboard';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />}/>
        <Route path='/login' element={<Login />}/>
        
        <Route element={<MainLayout />}>
        <Route path='/editprofile' element={<EditProfile />}/>
        <Route path='/home' element={<Home />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/mess-ens' element={<MessEns />} />
        //list ens
        <Route path='/mess-chef' element={<ChefMessages />} />
      
        <Route path='/mess-chef/:id_enseignant' element={<MessChef />} />
        <Route path='/studentDashboard' element={<StudentDashboard/>} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;

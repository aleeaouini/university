import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './index.css';
import EditProfile from './pages/Editeprofile';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/editprofile' element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

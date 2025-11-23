import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './index.css';
import CsvPage from './pages/Csv';
import Home from './pages/Home';

import EditProfile from './pages/Editeprofile';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/csv' element={<CsvPage/>} />
        <Route path='/editprofile' element={<EditProfile />} />
        <Route path='/home' element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './index.css';
import { Edit } from 'lucide-react';
import CsvPage from './pages/Csv';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/edit' element={<Edit/>} />
        <Route path='/csv' element={<CsvPage/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

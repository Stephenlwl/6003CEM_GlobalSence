import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './pages/UserData';
import reportWebVitals from './reportWebVitals';
import Login from './pages/Login';
import App from './pages/App';
import Signup from './pages/Signup';
import SavedWeather from './pages/SavedWeather';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <UserProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/weather" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/saved-weather" element={<SavedWeather />} />
      </Routes>
    </BrowserRouter>
  </UserProvider>
);

reportWebVitals();

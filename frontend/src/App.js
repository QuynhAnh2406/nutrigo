import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MealPlan from './pages/MealPlan';
import Community from './pages/Community';
import CreatePost from './pages/CreatePost';
import Favourites from './pages/Favourites';
import Profile from './pages/Profile';
import Signup from './pages/Signup';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes (Main Layout) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/create-post" element={<CreatePost />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

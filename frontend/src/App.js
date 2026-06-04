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
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Ingredients from './pages/Ingredients';
import MyRecipes from './pages/MyRecipes';
import CreateRecipe from './pages/CreateRecipe';

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
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/my-recipes" element={<MyRecipes />} />
          <Route path="/my-recipes/create" element={<CreateRecipe />} />
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

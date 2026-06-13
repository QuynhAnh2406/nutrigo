import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function MainLayout() {
    // Shared state that was previously in App.js
    const [menuItems] = useState([
        { name: 'Oatmeal & Berries', type: 'Breakfast', calories: 350, carbs: 45, protein: 12, fats: 8 },
        { name: 'Avocado Toast', type: 'Breakfast', calories: 250, carbs: 20, protein: 6, fats: 15 },
        { name: 'Grilled Chicken Salad', type: 'Lunch', calories: 420, carbs: 15, protein: 45, fats: 18 },
        { name: 'Quinoa Bowl', type: 'Lunch', calories: 380, carbs: 55, protein: 15, fats: 12 },
        { name: 'Baked Salmon', type: 'Dinner', calories: 480, carbs: 5, protein: 40, fats: 25 },
    ]);
    const [newMenuItems] = useState([
        { name: 'Beef Mignon & Asparagus', calories: 550, carbs: 10, protein: 50, fats: 28 },
        { name: 'Greek Yogurt Parfait', calories: 220, carbs: 25, protein: 18, fats: 5 },
    ]);
    const [recommendedItems] = useState([
        { name: 'Protein Shake', type: 'Breakfast', calories: 150, carbs: 5, protein: 25, fats: 2 },
        { name: 'Turkey Wrap', type: 'Lunch', calories: 320, carbs: 30, protein: 28, fats: 10 },
        { name: 'Almond Snacks', type: 'Snack', calories: 180, carbs: 6, protein: 6, fats: 15 },
    ]);

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : {
            name: 'Khách',
            email: 'khach@example.com',
            avatar: 'https://ui-avatars.com/api/?name=Khach&background=random',
            followers: 0,
            following: 0,
            isPremium: false
        };
    });

    const [healthData, setHealthData] = useState({
        dateOfBirth: '',
        gender: '',
        height: '',
        weight: '',
        activityLevel: '',
        goal: '',
        dietaryPreference: '',
        allergies: '',
        cookingSkill: '',
        phone: ''
    });

    const [metrics, setMetrics] = useState({
        bmi: 0,
        bmr: 0,
        tdee: 0,
        targetCalories: 0,
        bmiStatus: '',
        age: 0
    });

    useEffect(() => {
        const fetchHealthData = async() => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await fetch('http://localhost:5002/api/profile/health', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    const row = data.data;
                    setHealthData({
                        dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : '',
                        gender: row.gender || '',
                        height: row.height_cm || '',
                        weight: row.weight_kg || '',
                        activityLevel: row.activity_level || '',
                        goal: row.goal || '',
                        dietaryPreference: row.dietary_preference || '',
                        allergies: row.allergies || '',
                        cookingSkill: row.cooking_skill || 'Beginner',
                        phone: row.phone || ''
                    });

                    setUser(prev => {
                        const updated = {
                            ...prev,
                            createdAt: row.created_at || prev.createdAt,
                            avatar: row.avatar_url || prev.avatar
                        };
                        return updated;
                    });
                }
            } catch (err) {
                console.error('Failed to fetch health data:', err);
            }
        };

        fetchHealthData();
    }, []);

    useEffect(() => {
        localStorage.setItem('user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        const calculateMetrics = () => {
            const { weight, height, dateOfBirth, gender, activityLevel } = healthData;
            if (!weight || !height || !dateOfBirth) return;

            // Calculate age from dateOfBirth
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            age = Math.max(0, age);

            // BMI
            const heightInMeters = height / 100;
            const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

            let bmiStatus = '';
            if (bmi < 18.5) bmiStatus = 'Underweight';
            else if (bmi >= 18.5 && bmi < 24.9) bmiStatus = 'Normal';
            else if (bmi >= 25 && bmi < 29.9) bmiStatus = 'Overweight';
            else bmiStatus = 'Obese';

            // BMR (Mifflin-St Jeor Equation)
            let bmr = 10 * weight + 6.25 * height - 5 * age;
            if (gender === 'Male') bmr += 5;
            else bmr -= 161;

            // TDEE
            const activityMultipliers = {
                'Sedentary': 1.2,
                'Light': 1.375,
                'Moderate': 1.55,
                'Active': 1.725,
                'Very Active': 1.9
            };
            const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

            // Target Calories based on Goal
            let targetCalories = tdee;
            if (healthData.goal === 'Lose weight') targetCalories -= 500;
            else if (healthData.goal === 'Gain weight') targetCalories += 500;

            setMetrics({ bmi, bmr: Math.round(bmr), tdee, targetCalories, bmiStatus, age });
        };

        calculateMetrics();
    }, [healthData]);

    return ( <
        div className = "dashboard-container" >
        <
        Sidebar user = { user }
        /> <
        Outlet context = {
            { menuItems, newMenuItems, recommendedItems, user, setUser, healthData, setHealthData, metrics } }
        /> <
        /div>
    );
}

export default MainLayout;
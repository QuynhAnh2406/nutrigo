import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

function MainLayout() {
    const location = useLocation();
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
                        height: (row.height_cm !== null && row.height_cm !== undefined && row.height_cm !== '') ? parseFloat(row.height_cm) : '',
                        weight: (row.weight_kg !== null && row.weight_kg !== undefined && row.weight_kg !== '') ? parseFloat(row.weight_kg) : '',
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

    // MEAL TIME REMINDER POPUP LOGIC
    const [reminder, setReminder] = useState({ show: false, mealType: null, message: '' });

    const checkMealTime = () => {
        // Check for test query parameter first
        const urlParams = new URLSearchParams(window.location.search);
        const testMeal = urlParams.get('testMeal');
        
        if (testMeal) {
            if (testMeal === 'breakfast') {
                return {
                    show: true,
                    mealType: 'breakfast',
                    message: '🌅 (Chế độ Test) Đến giờ ăn sáng rồi! Hãy bắt đầu ngày mới với một bữa sáng đầy đủ dinh dưỡng bạn nhé.'
                };
            } else if (testMeal === 'lunch') {
                return {
                    show: true,
                    mealType: 'lunch',
                    message: '☀️ (Chế độ Test) Đến giờ ăn trưa rồi! Nghỉ tay một chút và bổ sung năng lượng cho buổi chiều nào.'
                };
            } else if (testMeal === 'dinner') {
                return {
                    show: true,
                    mealType: 'dinner',
                    message: '🌌 (Chế độ Test) Đến giờ ăn tối rồi! Hãy thưởng thức một bữa tối ấm áp và thư giãn sau ngày làm việc.'
                };
            }
        }

        const now = new Date();
        const currentHour = now.getHours();
        const todayStr = now.toDateString();

        let mealType = null;
        let message = '';

        if (currentHour === 6) {
            mealType = 'breakfast';
            message = '🌅 Đến giờ ăn sáng rồi! Hãy bắt đầu ngày mới với một bữa sáng đầy đủ dinh dưỡng bạn nhé.';
        } else if (currentHour === 11) {
            mealType = 'lunch';
            message = '☀️ Đến giờ ăn trưa rồi! Nghỉ tay một chút và bổ sung năng lượng cho buổi chiều nào.';
        } else if (currentHour === 18) {
            mealType = 'dinner';
            message = '🌌 Đến giờ ăn tối rồi! Hãy thưởng thức một bữa tối ấm áp và thư giãn sau ngày làm việc.';
        }

        if (mealType) {
            // Check if we already dismissed this meal today
            const dismissed = localStorage.getItem('lastDismissedMeal');
            if (dismissed) {
                const parsed = JSON.parse(dismissed);
                if (parsed.type === mealType && parsed.date === todayStr) {
                    return { show: false, mealType: null, message: '' };
                }
            }
            return { show: true, mealType, message };
        }

        return { show: false, mealType: null, message: '' };
    };

    useEffect(() => {
        // Initial check on mount
        const initialCheck = checkMealTime();
        if (initialCheck.show) {
            setReminder(initialCheck);
        }

        // Set interval to check every 15 seconds for real-time responsiveness
        const timer = setInterval(() => {
            const check = checkMealTime();
            if (check.show) {
                setReminder(check);
            }
        }, 15000);

        return () => clearInterval(timer);
    }, [location.search]); // Depend on search parameters to trigger immediately on test URL

    const handleCloseReminder = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('testMeal')) {
            urlParams.delete('testMeal');
            const newRelativePathQuery = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState(null, '', newRelativePathQuery);
        } else {
            const now = new Date();
            const todayStr = now.toDateString();
            localStorage.setItem('lastDismissedMeal', JSON.stringify({
                type: reminder.mealType,
                date: todayStr
            }));
        }
        setReminder({ show: false, mealType: null, message: '' });
    };

    return (
        <div className="dashboard-container relative">
            <Sidebar user={user} />
            <Outlet context={{ menuItems, newMenuItems, recommendedItems, user, setUser, healthData, setHealthData, metrics }} />

            {/* FULL SCREEN MEAL TIME REMINDER OVERLAY */}
            {reminder.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300">
                    <div className="relative w-11/12 max-w-md overflow-hidden rounded-[2.5rem] bg-white p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        {/* Decorative background blur shapes */}
                        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#B5E361]/30 blur-2xl"></div>
                        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-[#4facfe]/20 blur-2xl"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            {/* Animated icon based on meal type */}
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#B5E361] to-[#8CB33D] text-5xl shadow-lg shadow-green-200 animate-bounce">
                                {reminder.mealType === 'breakfast' ? '🍳' : reminder.mealType === 'lunch' ? '🍱' : '🥩'}
                            </div>

                            <h3 className="mb-3 text-2xl font-black text-gray-900">
                                {reminder.mealType === 'breakfast' ? 'Bữa Sáng Dinh Dưỡng!' : reminder.mealType === 'lunch' ? 'Bữa Trưa Năng Lượng!' : 'Bữa Tối Ấm Áp!'}
                            </h3>

                            <p className="mb-8 text-gray-600 leading-relaxed font-medium">
                                {reminder.message}
                            </p>

                            <button
                                onClick={handleCloseReminder}
                                className="w-full rounded-2xl bg-gray-900 py-4 text-base font-black text-white shadow-xl hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Tôi đã hiểu, đi ăn thôi! 😋
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MainLayout;
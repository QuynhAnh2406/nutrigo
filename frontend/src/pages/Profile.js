import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { UserCircle2, Settings } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function Profile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'Personal');

  useEffect(() => {
    if (tabParam) {
      // Only allow Personal/Edit/Settings for now
      if (tabParam === 'Edit') setActiveTab('Edit');
      else if (tabParam === 'Settings') setActiveTab('Settings');
      else setActiveTab('Personal');
    }
  }, [tabParam]);

  // Get User Profile & Health Data from MainLayout context
  const { user, setUser, healthData, setHealthData, metrics } = useOutletContext();

  const saveHealthToDb = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/profile/health', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        dateOfBirth: healthData.dateOfBirth,
        gender: healthData.gender,
        height: healthData.height,
        weight: healthData.weight,
        activityLevel: healthData.activityLevel,
        goal: healthData.goal,
        dietaryPreference: healthData.dietaryPreference,
        allergies: healthData.allergies,
        cookingSkill: healthData.cookingSkill
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to save profile');
    }

    // Map DB -> frontend state shape
    const row = data.data || {};
    setHealthData((prev) => ({
      ...prev,
      dateOfBirth: row.date_of_birth ? String(row.date_of_birth).slice(0, 10) : prev.dateOfBirth,
      gender: row.gender ?? prev.gender,
      height: row.height_cm ?? prev.height,
      weight: row.weight_kg ?? prev.weight,
      activityLevel: row.activity_level ?? prev.activityLevel,
      goal: row.goal ?? prev.goal,
      dietaryPreference: row.dietary_preference ?? prev.dietaryPreference,
      allergies: row.allergies ?? prev.allergies,
      cookingSkill: row.cooking_skill ?? prev.cookingSkill
    }));
  };

  const handleHealthChange = (e) => {
    let newValues = { [e.target.name]: e.target.value };
    if (e.target.name === 'dateOfBirth') {
      const today = new Date();
      const birthDate = new Date(e.target.value);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      newValues.age = Math.max(0, age);
    }
    setHealthData({ ...healthData, ...newValues });
  };

  const renderTabContent = () => {
    switch (activeTab) {

      case 'Personal':
        return (
          <div className="profile-tab-content edit-profile animate-in">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
              <h4 className="font-bold text-blue-900 mb-4">Health Metrics</h4>
              <div className="flex gap-4">
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm flex-1">
                  <span className="block text-xs text-gray-500 uppercase font-bold">BMI</span>
                  <strong className="text-2xl text-blue-700 block mt-1">{metrics.bmi}</strong>
                  <span className={`text-xs font-semibold ${metrics.bmiStatus === 'Normal' ? 'text-green-600' : 'text-orange-600'}`}>{metrics.bmiStatus}</span>
                </div>
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm flex-1">
                  <span className="block text-xs text-gray-500 uppercase font-bold">BMR</span>
                  <strong className="text-2xl text-orange-600 block mt-1">{metrics.bmr} <small className="text-sm">kcal</small></strong>
                  <span className="text-xs text-gray-400 font-semibold">Resting Calories</span>
                </div>
                <div className="bg-white px-4 py-3 rounded-xl shadow-sm flex-1">
                  <span className="block text-xs text-gray-500 uppercase font-bold">TDEE</span>
                  <strong className="text-2xl text-green-600 block mt-1">{metrics.tdee} <small className="text-sm">kcal</small></strong>
                  <span className="text-xs text-gray-400 font-semibold">Daily Calories</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="profile-form border p-6 rounded-2xl border-gray-100 bg-white">
                <h4 className="font-bold mb-4 text-gray-800">Basic Info</h4>
                <div className="form-grid opacity-80 pointer-events-none">
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" value={healthData.dateOfBirth} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input type="number" value={healthData.age} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <input type="text" value={healthData.gender} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input type="number" value={healthData.height} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" value={healthData.weight} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group">
                    <label>Activity Level</label>
                    <input type="text" value={healthData.activityLevel} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Goal</label>
                    <input type="text" value={healthData.goal} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                </div>
              </div>

              <div className="profile-form border p-6 rounded-2xl border-gray-100 bg-white flex flex-col h-full">
                <h4 className="font-bold mb-4 text-gray-800">Survey Preferences</h4>
                <div className="form-grid opacity-80 pointer-events-none">
                  <div className="form-group col-span-2">
                    <label>Dietary Preferences</label>
                    <input type="text" value={healthData.dietaryPreference || ''} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Allergies</label>
                    <input type="text" value={healthData.allergies || ''} disabled className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Cooking Skill</label>
                    <select value={healthData.cookingSkill || ''} disabled className="bg-gray-50 border-gray-200">
                      <option value="Beginner">Beginner (Little or no experience)</option>
                      <option value="Intermediate">Intermediate (Can follow recipes easily)</option>
                      <option value="Advanced">Advanced (Experienced home cook)</option>
                      <option value="Expert">Expert (Professional or highly skilled)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Edit':
        return (
          <div className="profile-tab-content edit-profile animate-in">
            <form
              className="profile-form"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await saveHealthToDb();
                  alert('Profile updated!');
                  setActiveTab('Personal');
                } catch (err) {
                  console.error(err);
                  alert('Save failed. Please check backend & DB connection.');
                }
              }}
            >
              <h4 className="font-bold mb-4 text-gray-800 border-b pb-2">Basic Info</h4>
              <div className="form-grid mb-8">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={healthData.dateOfBirth} onChange={handleHealthChange} />
                </div>
                <div className="form-group opacity-70">
                  <label>Age</label>
                  <input type="number" name="age" value={healthData.age} disabled className="bg-gray-50 cursor-not-allowed" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={healthData.gender} onChange={handleHealthChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Height (cm)</label>
                  <input type="number" name="height" value={healthData.height} onChange={handleHealthChange} />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input type="number" name="weight" value={healthData.weight} onChange={handleHealthChange} />
                </div>
                <div className="form-group">
                  <label>Activity Level</label>
                  <select name="activityLevel" value={healthData.activityLevel} onChange={handleHealthChange}>
                    <option value="Sedentary">Sedentary (Little or no exercise)</option>
                    <option value="Light">Light (Exercise 1-3 times/week)</option>
                    <option value="Moderate">Moderate (Exercise 4-5 times/week)</option>
                    <option value="Active">Active (Daily exercise or intense exercise 3-4 times/week)</option>
                    <option value="Very Active">Very Active (Intense exercise 6-7 times/week)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Goal</label>
                  <select name="goal" value={healthData.goal} onChange={handleHealthChange}>
                    <option value="Lose weight">Lose weight</option>
                    <option value="Maintain weight">Maintain weight</option>
                    <option value="Gain weight">Gain weight</option>
                    <option value="Build muscle">Build muscle</option>
                  </select>
                </div>
              </div>

              <h4 className="font-bold mb-4 text-gray-800 border-b pb-2">Survey Preferences</h4>
              <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label>Dietary Preferences</label>
                    <input type="text" name="dietaryPreference" value={healthData.dietaryPreference || ''} onChange={handleHealthChange} />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Allergies</label>
                    <input type="text" name="allergies" value={healthData.allergies || ''} onChange={handleHealthChange} />
                  </div>
                  <div className="form-group col-span-2">
                    <label>Cooking Skill</label>
                    <select name="cookingSkill" value={healthData.cookingSkill || ''} onChange={handleHealthChange}>
                      <option value="Beginner">Beginner (Little or no experience)</option>
                      <option value="Intermediate">Intermediate (Can follow recipes easily)</option>
                      <option value="Advanced">Advanced (Experienced home cook)</option>
                      <option value="Expert">Expert (Professional or highly skilled)</option>
                    </select>
                  </div>
              </div>
              <button type="submit" className="btn-primary mt-6">Save Changes</button>
            </form>
          </div>
        );
      
      case 'Settings':
        return (
          <div className="profile-tab-content account-settings animate-in">
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Address</h4>
                  <p>{user.email}</p>
                </div>
                <button className="btn-outline">Change</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Password</h4>
                  <p>Last changed 3 months ago</p>
                </div>
                <button className="btn-outline">Update</button>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Notifications</h4>
                  <p>Receive daily meal plan reminders</p>
                </div>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="profile-page main-content">
      <div className="mb-8">
        <PageHeader
          title="My Profile"
          icon={UserCircle2}
          actions={
            <div className="flex flex-wrap gap-2">
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${
                  activeTab === 'Personal' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                }`}
                onClick={() => setActiveTab('Personal')}
              >
                <UserCircle2 className="h-4 w-4" />
                Personal
              </button>
              <button
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition-colors ${
                  activeTab === 'Settings' ? 'bg-gray-900 text-white' : 'bg-white/70 text-gray-900 ring-1 ring-white/70 backdrop-blur hover:bg-white'
                }`}
                onClick={() => setActiveTab('Settings')}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          }
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT MAIN AREA */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="section-title mb-0">
              {activeTab === 'Settings'
                ? 'Account Settings'
                : activeTab === 'Edit'
                  ? 'Edit Info'
                  : 'Personal Information'}
            </h3>
            {activeTab === 'Personal' ? (
              <button className="btn-primary" onClick={() => setActiveTab('Edit')}>
                Edit Info
              </button>
            ) : activeTab === 'Edit' ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab('Personal')}
              >
                Back
              </button>
            ) : null}
          </div>

          <div className="profile-content-area">
            {renderTabContent()}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">
            <div className="h-24 bg-gradient-to-r from-[#a8e063] to-[#56ab2f]"></div>
            <div className="px-6 pb-6 flex flex-col items-center text-center relative">
              <img 
                src={user.avatar} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-white shadow-md -mt-12 mb-3 bg-white object-cover" 
              />
              <h2 className="text-xl font-bold text-gray-800">
                {user.name} {user.isPremium && <span title="Premium Member" className="text-yellow-500">👑</span>}
              </h2>
              <p className="text-gray-500 text-sm mb-6">{user.email}</p>
              
              <div className="flex gap-8 w-full justify-center border-t border-b border-gray-100 py-4 mb-6">
                <div className="text-center cursor-pointer hover:text-green-600 transition-colors">
                  <strong className="block text-xl text-gray-800">{user.followers}</strong>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Followers</span>
                </div>
                <div className="text-center cursor-pointer hover:text-green-600 transition-colors">
                  <strong className="block text-xl text-gray-800">{user.following}</strong>
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Following</span>
                </div>
              </div>
              
              <button className="btn-secondary w-full">Share Profile</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;

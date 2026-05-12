import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Apple, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user and token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-gray-800">
      
      {/* Cột trái: Hình ảnh / Thông điệp truyền cảm hứng (Ẩn trên mobile, hiện trên màn hình lớn) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#EAF5DA] items-center justify-center p-12 overflow-hidden">
        {/* Vòng tròn trang trí */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#B5E361] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FFE4A0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Mô phỏng một card giao diện giống trong dashboard */}
          <div className="bg-[#B5E361] rounded-[2rem] p-8 shadow-lg text-gray-900 mb-8 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Daily Nutrition</h2>
              <div className="bg-white/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                 <Leaf className="w-4 h-4 mr-1" /> Fresh
              </div>
            </div>
            <div className="bg-white/40 rounded-2xl p-6">
              <p className="font-medium text-lg italic mb-2">
                "Start your day with positive energy and healthy meals!"
              </p>
              <p className="text-sm font-medium mt-4">NUTRITION QUOTE OF THE DAY</p>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Your health journey <br/> starts here.
          </h1>
          <p className="text-gray-600 text-lg">
            Log in to Nutrigo to track calories, plan meals, and connect with a healthy food community.
          </p>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-[#B5E361] rounded-full rounded-tl-sm flex items-center justify-center shadow-sm">
               <Leaf className="w-6 h-6 text-gray-900" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Nutrigo</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back! 👋</h2>
          <p className="text-gray-500 mb-6">Please enter your details to access your dashboard.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B5E361] focus:border-transparent transition-all"
                  placeholder="hello@nutrigo.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B5E361] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Nhớ mật khẩu & Quên mật khẩu */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#B5E361] focus:ring-[#B5E361] border-gray-300 rounded cursor-pointer accent-[#B5E361]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#forgot" className="font-semibold text-gray-700 hover:text-[#8cbd3e] transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-gray-900 bg-[#B5E361] hover:bg-[#a5d44b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5E361] transition-colors mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          {/* Dấu gạch ngang phân cách */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Đăng nhập bằng Mạng xã hội */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Apple className="h-5 w-5 mr-2" />
                Apple
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#signup" className="font-bold text-gray-900 hover:text-[#8cbd3e] transition-colors">
              Sign up now
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}

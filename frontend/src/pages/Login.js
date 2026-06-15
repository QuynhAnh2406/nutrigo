import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
      const response = await fetch('http://localhost:5002/api/auth/login', {
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
              <h2 className="text-2xl font-bold">Dinh dưỡng hàng ngày</h2>
              <div className="bg-white/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                 <Leaf className="w-4 h-4 mr-1" /> Tươi ngon
              </div>
            </div>
            <div className="bg-white/40 rounded-2xl p-6">
              <p className="font-medium text-lg italic mb-2">
                "Bắt đầu ngày mới với năng lượng tích cực và những bữa ăn lành mạnh!"
              </p>
              <p className="text-sm font-medium mt-4">TRÍCH DẪN DINH DƯỠNG CỦA NGÀY</p>
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            Hành trình sức khỏe <br/> bắt đầu từ đây.
          </h1>
          <p className="text-gray-600 text-lg">
            Đăng nhập vào Nutrigo để theo dõi calo, lên lịch ăn uống và kết nối với cộng đồng ăn uống lành mạnh.
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

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chào mừng quay trở lại! 👋</h2>
          <p className="text-gray-500 mb-6">Vui lòng nhập thông tin của bạn để truy cập trang chủ.</p>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
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
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <div className="text-sm">
                <a href="#forgot" className="font-semibold text-gray-700 hover:text-[#8cbd3e] transition-colors">
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Nút Đăng nhập */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-gray-900 bg-[#B5E361] hover:bg-[#a5d44b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5E361] transition-colors mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/signup" className="font-bold text-gray-900 hover:text-[#8cbd3e] transition-colors">
              Đăng ký ngay
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

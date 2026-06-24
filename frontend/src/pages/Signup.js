import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Leaf } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5002/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Đăng ký không thành công. Vui lòng thử lại.');
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
      
      {/* Cột trái: Hình ảnh / Thông điệp truyền cảm hứng */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#EAF5DA] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#B5E361] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#FFE4A0] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-green-900/5 border border-white/50 mb-10">
            <div className="w-16 h-16 bg-[#B5E361] rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-green-200">🥗</div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">Tham gia cùng hơn 10.000 thành viên ăn uống lành mạnh mỗi ngày.</h2>
            <p className="text-gray-600 leading-relaxed">
              Tạo tài khoản để nhận lịch ăn uống cá nhân hóa, theo dõi các chất dinh dưỡng đa lượng và đạt được mục tiêu thể hình nhanh hơn.
            </p>
          </div>

          <div className="flex gap-4">
             <div className="flex-1 bg-white/40 p-4 rounded-2xl border border-white/40">
                <div className="text-2xl font-bold text-gray-900">2K+</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Công thức</div>
             </div>
             <div className="flex-1 bg-white/40 p-4 rounded-2xl border border-white/40">
                <div className="text-2xl font-bold text-gray-900">150+</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Huấn luyện viên</div>
             </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng ký */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] my-8">
          
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#B5E361] rounded-full rounded-tl-sm flex items-center justify-center shadow-sm">
               <Leaf className="w-6 h-6 text-gray-900" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Nutrigo</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký tài khoản ✨</h2>
          <p className="text-gray-500 mb-8">Bắt đầu hành trình sống khỏe cùng chúng tôi ngay hôm nay.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignup}>
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B5E361] focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B5E361] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-base font-bold text-gray-900 bg-[#B5E361] hover:bg-[#a5d44b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B5E361] transition-colors mt-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:text-[#8cbd3e] transition-colors">
              Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

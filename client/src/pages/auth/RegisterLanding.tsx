import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RegisterLanding() {
  const navigate = useNavigate();
  const [registerRole, setRegisterRole] = useState('');
  const [loginRole, setLoginRole] = useState('');

  const roles = [
    { label: 'Seller', value: 'seller' },
    { label: 'Customer', value: 'customer' },
    { label: 'Admin', value: 'admin' },
  ];

  const handleRegister = () => {
    if (!registerRole) {
      toast.error('Please select a role to register.');
      return;
    }
    navigate(`/register/${registerRole}`);
  };

  const handleLogin = () => {
    if (!loginRole) {
      toast.error('Please select a role to login.');
      return;
    }
    // Navigate to /login/admin for admin role, otherwise /login
    navigate(loginRole === 'admin' ? '/login/admin' : '/login', { state: { role: loginRole } });
  };

  // After registration, redirect to the appropriate login page
  const handlePostRegisterRedirect = (role: string) => {
    if (role === 'admin') {
      navigate('/login/admin', { state: { role: 'admin' } });
    } else {
      navigate('/login', { state: { role } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <h1 className="text-4xl font-extrabold mb-12 text-gray-800">Company Access Portal</h1>

      <div className="flex flex-col md:flex-row gap-12 w-full max-w-5xl">
        {/* Register Card */}
        <div className="flex flex-col w-full p-8 rounded-xl shadow-lg bg-white" style={{ borderLeft: '4px solid #7f1d1d' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Register</h2>
          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
            className="mb-6 w-full rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 bg-gray-50 text-gray-700"
          >
            <option value="" disabled>
              Select role to register
            </option>
            {roles.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRegister}
            className="w-full bg-red-900 text-white font-semibold py-3 rounded-md hover:bg-red-950 transition duration-300"
          >
            Proceed to Register
          </button>
        </div>

        {/* Login Card */}
        <div className="flex flex-col w-full p-8 rounded-xl shadow-lg bg-white" style={{ borderLeft: '4px solid #7f1d1d' }}>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>
          <select
            value={loginRole}
            onChange={(e) => setLoginRole(e.target.value)}
            className="mb-6 w-full rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-300 bg-gray-50 text-gray-700"
          >
            <option value="" disabled>
              Select role to login
            </option>
            {roles.map(({ label, value }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={handleLogin}
            className="w-full bg-red-900 text-white font-semibold py-3 rounded-md hover:bg-red-950 transition duration-300"
          >
            Proceed to Login
          </button>
        </div>
      </div>
    </div>
  );
}
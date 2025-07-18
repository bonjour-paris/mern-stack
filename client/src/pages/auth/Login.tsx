import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../api/axios';
import { setAuthToken, clearAuthToken } from '../../utils/auth';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import { LoginDTO, loginSchema, AdminLoginDTO, adminLoginSchema } from '../../validation/schemas';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminLogin = location.pathname.includes('/login/admin') || location.state?.role === 'admin';

  useEffect(() => {
    if (location.state?.role === 'admin' && !location.pathname.includes('/login/admin')) {
      navigate('/login/admin', { replace: true, state: { role: 'admin' } });
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginDTO | AdminLoginDTO>({
    resolver: zodResolver(isAdminLogin ? adminLoginSchema : loginSchema),
  });

  const onSubmit = async (data: LoginDTO | AdminLoginDTO) => {
    try {
      const res = await api.post('/login', {
        email: data.email,
        password: data.password,
        role: isAdminLogin ? 'admin' : data.role,
        ...(isAdminLogin && { adminRole: data.role }),
      });
      console.log('Login response:', res.data);
      if (res.data.token) {
        setAuthToken(res.data.token);
        localStorage.setItem('role', isAdminLogin ? 'admin' : data.role);
        console.log('Token set:', res.data.token.substring(0, 20) + '...');
      }
      if (res.data.redirect) {
        navigate(res.data.redirect);
        const roleMessage = isAdminLogin ? 'Admin' : data.role.charAt(0).toUpperCase() + data.role.slice(1);
        toast.success(`${roleMessage} login successful!`);
      }
    } catch (err: any) {
      console.error('Login failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
      if (err.response?.status === 401) {
        clearAuthToken();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">{isAdminLogin ? 'Admin Login' : 'Login'}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="Email" type="email" {...register('email')} error={errors.email} />
        <FormInput label="Password" type="password" {...register('password')} error={errors.password} />
        <FormSelect label="Role" {...register('role')} error={errors.role}>
          <option value="">Select Role</option>
          {isAdminLogin ? (
            <>
              <option value="useradmin">User Admin</option>
              <option value="superadmin">Super Admin</option>
            </>
          ) : (
            <>
              <option value="seller">Seller</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </>
          )}
        </FormSelect>
        <button
          type="submit"
          className="bg-indigo-600 text-white w-full py-2 rounded disabled:opacity-50 hover:bg-indigo-700 transition"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
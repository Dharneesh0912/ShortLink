import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login as loginApi, signup as signupApi, verifyToken } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await verifyToken();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Login successful!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const serverMsg = error.response?.data?.error || error.response?.data?.details?.[0]?.message;
      const msg = serverMsg || 'Login failed';
      toast.error(msg);
      return msg;
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await signupApi(email, password);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
      return true;
    } catch (error) {
      const serverMsg = error.response?.data?.error || error.response?.data?.details?.[0]?.message;
      const msg = serverMsg || 'Signup failed';
      toast.error(msg);
      return msg;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
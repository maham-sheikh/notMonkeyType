import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../ui/Toast';
import Button from './../ui/Button';
const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await login({ email, password });
      
      if (result.success) {
        showToast('Login successful', 'success');
        
        // Call onSuccess if provided (for modal close)
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
            navigate('/Home/GameMenu');
          }, 1000);
        } else {
          // Default navigation
          setTimeout(() => navigate('/Home/GameMenu'), 1000);
        }
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Login failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Email Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            required
          />
        </div>
        
        {/* Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            required
          />
        </div>
        
        {/* Login Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`relative w-full flex justify-center py-2.5 px-4
            text-white text-sm font-medium rounded-lg
            ${isLoading 
              ? 'bg-accent cursor-not-allowed' 
              : 'bg-accent hover:bg-accentHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
            }
            transition-colors duration-200 ease-in-out
            overflow-hidden`}
        >
          <span className="relative z-10">
            {isLoading ? 'Logging in...' : 'Login'}
          </span>
          
        </button>
      </form>
      
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </>
  );
};

export default LoginForm;
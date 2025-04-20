import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../ui/Toast';
import VerificationInput from '../ui/VerificationInput';

const SignupForm = () => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const { register, verifyEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName,
        lastName,
        email,
        password
      });
      
      if (result.success) {
        showToast(result.message, 'success');
        setShowVerification(true);
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code) => {
    try {
      const result = await verifyEmail(email, code);
      
      if (result.success) {
        showToast(result.message, 'success');
        setShowVerification(false);
      } else {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Verification failed. Please try again.', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              required
            />
          </div>
          
          {/* Last Name */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              required
            />
          </div>
        </div>
        
        {/* Email */}
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
        
        {/* Password Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
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
              minLength="6"
            />
          </div>
          
          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
              required
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`relative w-full flex justify-center py-2.5 px-4 mt-6
            text-white text-sm font-medium rounded-lg
            ${isLoading 
              ? 'bg-accent cursor-not-allowed' 
              : 'bg-accent hover:bg-accentHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent'
            }
            transition-colors duration-200 ease-in-out
            overflow-hidden`}
        >
          <span className="relative z-10">
            {isLoading ? 'Processing...' : 'Sign Up'}
          </span>

        </button>
      </form>
      
      {showVerification && (
        <VerificationInput
          onVerify={handleVerify}
          onCancel={() => setShowVerification(false)}
        />
      )}
      
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

export default SignupForm;
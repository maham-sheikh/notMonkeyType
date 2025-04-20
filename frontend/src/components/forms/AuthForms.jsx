import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../ui/Toast';
import VerificationInput from '../ui/VerificationInput';
import { User, Mail, Lock, Loader } from 'lucide-react';

const AuthForms = ({ formType = 'login', onSuccess }) => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const { login, register, verifyEmail } = useAuth();
  const navigate = useNavigate();

  const isLogin = formType === 'login';

  // Form field configurations
  const formFields = {
    login: [
      {
        id: 'email',
        type: 'email',
        placeholder: 'Email Address',
        icon: <Mail size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'full'
      },
      {
        id: 'password',
        type: 'password',
        placeholder: 'Password',
        icon: <Lock size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'full'
      }
    ],
    signup: [
      {
        id: 'firstName',
        type: 'text',
        placeholder: 'First Name',
        icon: <User size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'half'
      },
      {
        id: 'lastName',
        type: 'text',
        placeholder: 'Last Name',
        icon: <User size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'half'
      },
      {
        id: 'email',
        type: 'email',
        placeholder: 'Email Address',
        icon: <Mail size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'full'
      },
      {
        id: 'password',
        type: 'password',
        placeholder: 'Password',
        icon: <Lock size={18} className="text-gray-400" />,
        required: true,
        minLength: 6,
        colSpan: 'half'
      },
      {
        id: 'confirmPassword',
        type: 'password',
        placeholder: 'Confirm Password',
        icon: <Lock size={18} className="text-gray-400" />,
        required: true,
        colSpan: 'half'
      }
    ]
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await login({ 
        email: formData.email, 
        password: formData.password 
      });
      
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

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
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
      const result = await verifyEmail(formData.email, code);
      
      if (result.success) {
        showToast(result.message, 'success');
        setShowVerification(false);
        // Optionally switch to login view after successful verification
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

  const handleSubmit = isLogin ? handleLoginSubmit : handleSignupSubmit;
  const currentFields = formFields[isLogin ? 'login' : 'signup'];

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-4">
          {currentFields.map((field) => (
            <div 
              key={field.id}
              className={`relative ${field.colSpan === 'full' ? 'col-span-2' : ''}`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {field.icon}
              </div>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id]}
                onChange={handleChange}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm rounded-lg 
                focus:ring-accent focus:border-accent block w-full pl-10 p-2.5 transition-all duration-200"
                required={field.required}
                minLength={field.minLength}
              />
            </div>
          ))}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`relative w-full flex justify-center py-2.5 px-4 mt-6
            text-white text-sm font-medium rounded-lg
            ${isLoading 
              ? 'bg-accent/70 cursor-not-allowed' 
              : 'bg-accent hover:bg-accent/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50'
            }
            backdrop-filter backdrop-blur-sm
            transition-all duration-200 ease-in-out
            overflow-hidden group`}
        >
          <span className="relative z-10 flex items-center">
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                {isLogin ? 'Logging in...' : 'Processing...'}
              </>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent/80 to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

export default AuthForms;
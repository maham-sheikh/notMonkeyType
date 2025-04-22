import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/ui/Toast';
import VerificationInput from '../components/ui/VerificationInput';
import { User, Mail, Lock, Loader, X, RefreshCcw, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AuthPortal = ({ logo, activeTab = 'login', setActiveTab, onClose }) => {
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
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
  const [passwordVisible, setPasswordVisible] = useState({
    login: false,
    signup: false,
    confirm: false
  });
  const [formErrors, setFormErrors] = useState({
    login: {},
    signup: {}
  });
  
  const { login, register, verifyEmail } = useAuth();
  const navigate = useNavigate();
  
  // CAPTCHA state
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');

  // Generate CAPTCHA on component mount and tab change
  useEffect(() => {
    refreshCaptcha();
  }, [activeTab]);
  
  // Function to generate a simple CAPTCHA code
  const generateCaptcha = useCallback(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }, []);

  // Function to refresh CAPTCHA
  const refreshCaptcha = useCallback(() => {
    setCaptchaValue(generateCaptcha());
    setCaptchaInput('');
  }, [generateCaptcha]);

  // Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Include at least one number');
    return errors;
  };

  // Form field configurations
  const loginFields = [
    {
      id: 'email',
      type: 'email',
      placeholder: 'Email Address',
      icon: <Mail size={18} className="text-gray-400" />,
      required: true
    },
    {
      id: 'password',
      type: passwordVisible.login ? 'text' : 'password',
      placeholder: 'Password',
      icon: <Lock size={18} className="text-gray-400" />,
      required: true,
      rightIcon: passwordVisible.login ? 
        <Eye size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, login: false})} /> : 
        <EyeOff size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, login: true})} />
    }
  ];

  const signupFields = [
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
      type: passwordVisible.signup ? 'text' : 'password',
      placeholder: 'Password',
      icon: <Lock size={18} className="text-gray-400" />,
      required: true,
      minLength: 8,
      colSpan: 'half',
      rightIcon: passwordVisible.signup ? 
        <Eye size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, signup: false})} /> : 
        <EyeOff size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, signup: true})} />
    },
    {
      id: 'confirmPassword',
      type: passwordVisible.confirm ? 'text' : 'password',
      placeholder: 'Confirm Password',
      icon: <Lock size={18} className="text-gray-400" />,
      required: true,
      colSpan: 'half',
      rightIcon: passwordVisible.confirm ? 
        <Eye size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, confirm: false})} /> : 
        <EyeOff size={18} className="text-gray-400 cursor-pointer" onClick={() => setPasswordVisible({...passwordVisible, confirm: true})} />
    }
  ];

  const handleLoginChange = (e) => {
    const { id, value } = e.target;
    setLoginData(prev => ({ ...prev, [id]: value }));
    
    // Clear errors when user types
    if (formErrors.login[id]) {
      setFormErrors(prev => ({
        ...prev,
        login: {
          ...prev.login,
          [id]: undefined
        }
      }));
    }
  };

  const handleSignupChange = (e) => {
    const { id, value } = e.target;
    setSignupData(prev => ({ ...prev, [id]: value }));
    
    // Clear errors when user types
    if (formErrors.signup[id]) {
      setFormErrors(prev => ({
        ...prev,
        signup: {
          ...prev.signup,
          [id]: undefined
        }
      }));
    }
    
    // Validate password as user types
    if (id === 'password') {
      const passwordErrors = validatePassword(value);
      setFormErrors(prev => ({
        ...prev,
        signup: {
          ...prev.signup,
          password: passwordErrors.length > 0 ? passwordErrors : undefined
        }
      }));
    }
    
    // Check if passwords match as user types in confirm field
    if (id === 'confirmPassword') {
      setFormErrors(prev => ({
        ...prev,
        signup: {
          ...prev.signup,
          confirmPassword: value !== signupData.password ? ['Passwords do not match'] : undefined
        }
      }));
    }
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!loginData.email) errors.email = ['Email is required'];
    if (!loginData.password) errors.password = ['Password is required'];
    
    setFormErrors(prev => ({ ...prev, login: errors }));
    return Object.keys(errors).length === 0;
  };

  const validateSignupForm = () => {
    const errors = {};
    if (!signupData.firstName) errors.firstName = ['First name is required'];
    if (!signupData.lastName) errors.lastName = ['Last name is required'];
    if (!signupData.email) errors.email = ['Email is required'];
    
    const passwordErrors = validatePassword(signupData.password);
    if (passwordErrors.length > 0) errors.password = passwordErrors;
    
    if (signupData.password !== signupData.confirmPassword) {
      errors.confirmPassword = ['Passwords do not match'];
    }
    
    setFormErrors(prev => ({ ...prev, signup: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    if (!validateLoginForm()) return;
    if (captchaInput !== captchaValue) {
      showToast('Invalid CAPTCHA code', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login({ 
        email: loginData.email, 
        password: loginData.password,
      });
      
      if (result.success) {
        showToast('Login successful', 'success');
        
        // Navigate after successful login
        setTimeout(() => {
          onClose();
          navigate('/Home/GameMenu');
        }, 1000);
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
    
    if (isLoading) return;
    if (!validateSignupForm()) return;
    if (captchaInput !== captchaValue) {
      showToast('Invalid CAPTCHA code', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password
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
      const result = await verifyEmail(signupData.email, code);
      
      if (result.success) {
        showToast(result.message, 'success');
        setShowVerification(false);
        // Switch to login view after successful verification
        setActiveTab('login');
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
  
  const handleForgotPassword = () => {
    // Implement forgot password functionality
    showToast('Password reset email sent', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="max-w-md min-h-[430px] w-full bg-gradient-to-br from-black/40 to-black/40 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-fadeIn border border-white/10 relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
        
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Logo and Title */}
        <div className="text-center pt-8 pb-4 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/10 to-transparent opacity-50"></div>
          <img 
            src={logo} 
            alt="notMonkeyType Logo" 
            className="h-20 w-auto mx-auto drop-shadow-lg"
          />
          <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
            not<span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent/70">MonkeyType</span>
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="relative px-6">
          <div className="flex border-b border-white/10">
            <button
              className={`w-1/2 py-4 px-1 text-center text-sm font-medium transition-all duration-300 ease-in-out
                ${activeTab === 'login' 
                  ? 'text-white border-b-2 border-accent drop-shadow-md' 
                  : 'text-gray-400 hover:text-white hover:border-white/30'
                }`}
              onClick={() => setActiveTab('login')}
            >
              LOGIN
            </button>
            <button
              className={`w-1/2 py-4 px-1 text-center text-sm font-medium transition-all duration-300 ease-in-out
                ${activeTab === 'signup' 
                  ? 'text-white border-b-2 border-accent drop-shadow-md' 
                  : 'text-gray-400 hover:text-white hover:border-white/30'
                }`}
              onClick={() => setActiveTab('signup')}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="px-6 py-8 relative">
          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4 w-full">
              {loginFields.map((field) => (
                <div key={field.id} className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors duration-200">
                    {field.icon}
                  </div>
                  <input
                    id={field.id}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={loginData[field.id]}
                    onChange={handleLoginChange}
                    className={`bg-white/5 backdrop-blur-sm border ${formErrors.login[field.id] ? 'border-red-500' : 'border-white/10'} text-white text-sm rounded-lg 
                    focus:ring-accent focus:border-accent/50 block w-full pl-10 ${field.rightIcon ? 'pr-10' : 'pr-3'} p-3 transition-all duration-200
                    shadow-sm hover:shadow-md focus:shadow-accent/20`}
                    required={field.required}
                    minLength={field.minLength}
                  />
                  {field.rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {field.rightIcon}
                    </div>
                  )}
                  {formErrors.login[field.id] && (
                    <div className="text-red-500 text-xs mt-1 flex items-start">
                      <AlertCircle size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                      <span>{formErrors.login[field.id][0]}</span>
                    </div>
                  )}
                </div>
              ))}
              
          
              
              {/* Simple CAPTCHA */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-300 mb-2">Please verify you're human:</p>
                <div className="flex items-center">
                  <div className="flex-1 p-2 bg-white/10 rounded-md mr-2 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute text-xs font-mono rotate-45"
                          style={{ 
                            left: `${Math.random() * 100}%`, 
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() + 0.2
                          }}
                        >
                          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-center tracking-widest text-white select-none">
                      {captchaValue}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg 
                    focus:ring-accent focus:border-accent p-2"
                    required
                  />
                  <button 
                    type="button"
                    onClick={refreshCaptcha}
                    className="ml-1 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || captchaInput !== captchaValue}
                className={`relative w-full flex justify-center py-3 px-4 mt-6
                  text-white text-sm font-medium rounded-lg
                  ${(isLoading || captchaInput !== captchaValue)
                    ? 'bg-accent/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50'
                  }
                  backdrop-filter backdrop-blur-sm
                  transition-all duration-300 ease-in-out
                  shadow-lg shadow-accent/10 hover:shadow-accent/20
                  overflow-hidden group`}
              >
                <span className="relative z-10 flex items-center">
                  {isLoading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : 'Login'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/80 to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"></div>
              </button>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4 w-full">
              <div className="grid grid-cols-2 gap-4">
                {signupFields.map((field) => (
                  <div 
                    key={field.id}
                    className={`relative group ${field.colSpan === 'full' ? 'col-span-2' : ''}`}
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors duration-200">
                      {field.icon}
                    </div>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={signupData[field.id]}
                      onChange={handleSignupChange}
                      className={`bg-white/5 backdrop-blur-sm border ${formErrors.signup[field.id] ? 'border-red-500' : 'border-white/10'} text-white text-sm rounded-lg 
                      focus:ring-accent focus:border-accent/50 block w-full pl-10 ${field.rightIcon ? 'pr-10' : 'pr-3'} p-3 transition-all duration-200
                      shadow-sm hover:shadow-md focus:shadow-accent/20`}
                      required={field.required}
                      minLength={field.minLength}
                    />
                    {field.rightIcon && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {field.rightIcon}
                      </div>
                    )}
                    {formErrors.signup[field.id] && (
                      <div className="text-red-500 text-xs mt-1 flex items-start">
                        <AlertCircle size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                        <span>{formErrors.signup[field.id][0]}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Password requirements */}
              {activeTab === 'signup' && signupData.password && formErrors.signup.password && (
                <div className="text-xs text-gray-300 bg-white/5 p-2 rounded-md">
                  <p className="font-medium mb-1">Password requirements:</p>
                  <ul className="space-y-1 pl-4">
                    {formErrors.signup.password.map((error, idx) => (
                      <li key={idx} className="flex items-start">
                        <AlertCircle size={12} className="mr-1 mt-0.5 text-red-400 flex-shrink-0" />
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Simple CAPTCHA */}
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <p className="text-sm text-gray-300 mb-2">Please verify you're human:</p>
                <div className="flex items-center">
                  <div className="flex-1 p-2 bg-white/10 rounded-md mr-2 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div 
                          key={i}
                          className="absolute text-xs font-mono rotate-45"
                          style={{ 
                            left: `${Math.random() * 100}%`, 
                            top: `${Math.random() * 100}%`,
                            opacity: Math.random() + 0.2
                          }}
                        >
                          {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                        </div>
                      ))}
                    </div>
                    <p className="font-mono text-center tracking-widest text-white select-none">
                      {captchaValue}
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-lg 
                    focus:ring-accent focus:border-accent p-2"
                    required
                  />
                  <button 
                    type="button"
                    onClick={refreshCaptcha}
                    className="ml-1 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Refresh CAPTCHA"
                  >
                    <RefreshCcw size={16} />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-300">
                By signing up, you agree to our <a href="#" className="text-accent hover:text-white">Terms of Service</a> and <a href="#" className="text-accent hover:text-white">Privacy Policy</a>.
              </div>
              
              <button
                type="submit"
                disabled={isLoading || captchaInput !== captchaValue || Object.keys(formErrors.signup).some(key => !!formErrors.signup[key])}
                className={`relative w-full flex justify-center py-3 px-4 mt-6
                  text-white text-sm font-medium rounded-lg
                  ${(isLoading || captchaInput !== captchaValue || Object.keys(formErrors.signup).some(key => !!formErrors.signup[key]))
                    ? 'bg-accent/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50'
                  }
                  backdrop-filter backdrop-blur-sm
                  transition-all duration-300 ease-in-out
                  shadow-lg shadow-accent/10 hover:shadow-accent/20
                  overflow-hidden group`}
              >
                <span className="relative z-10 flex items-center">
                  {isLoading ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : 'Sign Up'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/80 to-accent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out"></div>
              </button>
            </form>
          )}
        </div>
        
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
      </div>
    </div>
  );
};

export default AuthPortal;
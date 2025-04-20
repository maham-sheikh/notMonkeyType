import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Lock, Mail, Trash2, User, Check, AlertTriangle, 
  EyeOff, Eye 
} from 'lucide-react';
import profileService, { getUserInfoFromToken } from './../../../services/authService';
import LoadingErrorState from '../../ui/LoadingErrorState';
import Toast from '../../ui/Toast';

const Profile = () => {
  const [userData, setUserData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [viewState, setViewState] = useState({
    showPassword: false,
    loading: true,
    deleted: false,
    error: null,
    passwordStrength: {
      isValid: false,
      message: ''
    },
    toast: {
      show: false,
      message: '',
      type: 'info'
    }
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Try to get user profile from API
        const profileData = await profileService.getProfile();
        
        // Fallback to token info if API fails
        if (!profileData.email) {
          const userInfo = getUserInfoFromToken();
          setUserData(prev => ({
            ...prev,
            email: userInfo?.email || ''
          }));
        } else {
          setUserData(prev => ({
            ...prev,
            email: profileData.email
          }));
        }

        setViewState(prev => ({
          ...prev,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // Try to get email from token as fallback
        const userInfo = getUserInfoFromToken();
        if (userInfo?.email) {
          setUserData(prev => ({
            ...prev,
            email: userInfo.email
          }));
          setViewState(prev => ({
            ...prev,
            loading: false
          }));
        } else {
          setViewState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Failed to load profile data'
          }));
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Password validation logic
  const validatePassword = (password) => {
    if (!password) return { isValid: false, message: '' };
    
    const criteria = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];

    const strengthScore = criteria.filter(Boolean).length;
    return {
      isValid: strengthScore >= 3,
      message: strengthScore >= 3 
        ? 'Strong password' 
        : 'Weak password. Include uppercase, lowercase, numbers, and special characters'
    };
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [id.replace('-', '')]: value
    }));

    if (id === 'new-password') {
      const passwordCheck = validatePassword(value);
      setViewState(prev => ({
        ...prev,
        passwordStrength: passwordCheck
      }));
    }
  };

  // Show toast notification
  const showToast = (type, message) => {
    setViewState(prev => ({
      ...prev,
      toast: {
        show: true,
        type,
        message
      }
    }));
  };

  // Close toast notification
  const closeToast = () => {
    setViewState(prev => ({
      ...prev,
      toast: {
        ...prev.toast,
        show: false
      }
    }));
  };

  // Handle password change
  const handleChangePassword = async () => {
    // Validate passwords match
    if (userData.newPassword !== userData.confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (!viewState.passwordStrength.isValid) {
      showToast('error', 'Password does not meet strength requirements');
      return;
    }

    try {
      await profileService.changePassword({
        currentPassword: userData.currentPassword,
        newPassword: userData.newPassword
      });

      showToast('success', 'Password changed successfully');

      // Reset password fields
      setUserData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      showToast('error', error.message || 'Password change failed');
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await profileService.deleteAccount();

        setViewState(prev => ({
          ...prev,
          deleted: true
        }));
        localStorage.removeItem('token');
      } catch (error) {
        showToast('error', error.message || 'Account deletion failed');
      }
    }
  };

  // Handle retry
  const handleRetry = () => {
    setViewState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    // Re-fetch profile data
    const fetchUserProfile = async () => {
      try {
        const profileData = await profileService.getProfile();
        
        setUserData(prev => ({
          ...prev,
          email: profileData.email || getUserInfoFromToken()?.email || ''
        }));

        setViewState(prev => ({
          ...prev,
          loading: false
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setViewState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load profile data'
        }));
      }
    };

    fetchUserProfile();
  };

  // Render deleted account view
  if (viewState.deleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/40 to-accent">
        <div className="text-center bg-white/10 backdrop-blur-xl p-12 rounded-2xl">
          <Check className="mx-auto text-green-400 mb-6" size={64} />
          <h2 className="text-3xl text-white mb-6">Account Deleted Successfully</h2>
          <Link 
            to="/login" 
            className="px-8 py-3 bg-accent text-white rounded-xl hover:bg-accentHover transition"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex items-start justify-center">
      <LoadingErrorState
        loading={viewState.loading}
        error={viewState.error}
        title="Profile"
        onRetry={handleRetry}
        loadingMessage="Loading Profile..."
        errorMessage="Failed to load Profile: "
      >
        <div className="w-full max-w-6xl bg-black/5 backdrop-blur-xl rounded-2xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-accent/70 p-4">
          <div className="grid md:grid-cols-2 gap-20">
            {/* Profile Info Section */}
            <div className=''>
              <div className="flex items-center mb-8">
                <User className="text-accent mr-4" size={40} />
                <h1 className="text-4xl font-bold text-white">Profile</h1>
              </div>

              {/* Email Display */}
              <div className="p-4">
              <div className="bg-white/10 p-6 rounded-xl mb-6">
                <div className="flex items-center mb-4">
                  <Mail className="text-accent mr-3" size={24} />
                  <h3 className="text-xl text-white">Email Address</h3>
                </div>
                <p className="text-gray-300">{userData.email}</p>
              </div>

              {/* Delete Account */}
              <div className="bg-red-500/10 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  <Trash2 className="text-red-400 mr-3" size={24} />
                  <h3 className="text-xl text-white">Delete Account</h3>
                </div>
                <p className="text-gray-300 mb-4">Warning: This action cannot be undone</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                >
                  Delete Account
                </button>
              </div>

              
              </div>

            </div>

            {/* Password Change Section */}
            <div>
              <div className="bg-white/10 p-8 rounded-xl">
                <h2 className="text-2xl text-white mb-6">Change Password</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Current Password</label>
                    <div className="relative">
                      <input 
                        type={viewState.showPassword ? "text" : "password"}
                        id="current-password"
                        value={userData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full py-3 px-4 bg-white/10 text-white rounded-xl"
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button"
                        onClick={() => setViewState(prev => ({
                          ...prev, 
                          showPassword: !prev.showPassword
                        }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
                      >
                        {viewState.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white mb-2">New Password</label>
                    <input 
                      type="password"
                      id="new-password"
                      value={userData.newPassword}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 bg-white/10 text-white rounded-xl"
                      placeholder="Enter new password"
                    />
                    {userData.newPassword && (
                      <p className={`text-sm mt-2 ${viewState.passwordStrength.isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {viewState.passwordStrength.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-white mb-2">Confirm Password</label>
                    <input 
                      type="password"
                      id="confirm-password"
                      value={userData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full py-3 px-4 bg-white/10 text-white rounded-xl"
                      placeholder="Confirm new password"
                    />
                    {userData.confirmPassword && userData.newPassword !== userData.confirmPassword && (
                      <p className="text-sm mt-2 text-red-400">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={handleChangePassword}
                    className="w-full py-3 bg-accent text-white rounded-xl hover:bg-accentHover transition"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </LoadingErrorState>

      {/* Toast Notification */}
      {viewState.toast.show && (
        <Toast
          message={viewState.toast.message}
          type={viewState.toast.type}
          onClose={closeToast}
          duration={3000}
        />
      )}
    </div>
  );
};

export default Profile;
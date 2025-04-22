import React, { useState, useEffect } from 'react';
import LoginForm from '../components/forms/LoginForm';
import SignupForm from '../components/forms/SignupForm';
import logoImage from './../assets/images/Logo2Transparent.png';

const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-800 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Logo and Title */}
        <div className="text-center pt-8 pb-4">
          <img 
            src={logoImage} 
            alt="notMonkeyType Logo" 
            className="h-20 w-auto mx-auto"
          />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900">
            notMonkeyType
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="relative px-6">
          <div className="flex border-b border-gray-200">
            <button
              className={`w-1/2 py-4 px-1 text-center text-sm font-medium ${
                isLoginView 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 focus:outline-none' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setIsLoginView(true)}
            >
              LOGIN
            </button>
            <button
              className={`w-1/2 py-4 px-1 text-center text-sm font-medium ${
                !isLoginView 
                  ? 'text-indigo-600 border-b-2 border-indigo-600 focus:outline-none' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setIsLoginView(false)}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="px-6 py-8">
          {isLoginView ? <LoginForm /> : <SignupForm />}
        </div>
      </div>
    </div>
  );
};

export default Login;
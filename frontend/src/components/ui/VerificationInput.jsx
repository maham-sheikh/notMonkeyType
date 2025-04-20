import React, { useState, useRef, useEffect } from "react";
import { Timer, AlertCircle, CheckCircle2, X, Mail } from "lucide-react";

const VerificationInput = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRef = useRef(null);
  const digitsRef = useRef([]);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6 || isExpired) return;
    
    setIsVerifying(true);
    try {
      await onVerify(code);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDigitChange = (e, index) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]$/.test(value)) {
      const newCode = code.split("");
      newCode[index] = value;
      setCode(newCode.join(""));
      
      // Auto-focus next input if a digit was entered
      if (value !== "" && index < 5) {
        digitsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === "Backspace" && index > 0 && !code[index]) {
      digitsRef.current[index - 1].focus();
    }
    
    // Handle left/right arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      digitsRef.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      digitsRef.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();
    if (/^\d{6}$/.test(pastedData)) {
      setCode(pastedData);
      // Focus the last input
      digitsRef.current[5].focus();
    }
  };

  const formattedTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const requestNewCode = () => {
    setTimeLeft(60);
    setIsExpired(false);
    setCode("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    // Here you would trigger the API call to request a new code
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-lg">
      <div className="max-w-md w-full bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden animate-fadeIn border border-white/10 relative p-6">
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"></div>
        
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1 rounded-full bg-white/5 hover:bg-white/10 transition-all duration-200 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Mail size={24} className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Email</h2>
          <p className="text-gray-300 text-sm mb-1">We've sent a 6-digit code to your email.</p>
          <p className="text-gray-300 text-sm flex items-center justify-center">
            <Timer size={14} className={`mr-1 ${isExpired ? 'text-red-400' : 'text-accent'}`} />
            <span className={isExpired ? 'text-red-400' : 'text-gray-300'}>
              {isExpired ? 'Code expired' : `Expires in ${formattedTimeLeft()}`}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div 
            className="grid grid-cols-6 gap-2 mx-auto max-w-xs" 
            onPaste={handlePaste}
          >
            {[0, 1, 2, 3, 4, 5].map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                ref={el => digitsRef.current[index] = el}
                value={code[index] || ''}
                onChange={(e) => handleDigitChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-full h-14 text-center text-xl font-bold rounded-lg
                  bg-white/5 backdrop-blur-sm border 
                  ${isExpired ? 'border-red-500 text-red-400' : 'border-white/10 text-white'}
                  focus:ring-accent focus:border-accent/50 
                  shadow-sm transition-all duration-200
                  outline-none`}
                disabled={isExpired || isVerifying}
              />
            ))}
          </div>

          {isExpired && (
            <div className="text-center text-sm text-red-400 flex items-center justify-center">
              <AlertCircle size={14} className="mr-1" />
              Verification code has expired
            </div>
          )}

          <div className="flex flex-col space-y-3">
            <button
              type="submit"
              disabled={code.length !== 6 || isExpired || isVerifying}
              className={`w-full py-3 px-4 rounded-lg text-sm font-medium
                text-white flex items-center justify-center
                ${code.length !== 6 || isExpired || isVerifying
                  ? 'bg-accent/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70'}
                transition-all duration-300 ease-in-out shadow-lg shadow-accent/10 hover:shadow-accent/20`}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} className="mr-2" />
                  Verify
                </>
              )}
            </button>
            
            {isExpired && (
              <button
                type="button"
                onClick={requestNewCode}
                className="w-full py-3 px-4 rounded-lg text-sm font-medium
                  text-white bg-white/10 hover:bg-white/20
                  transition-all duration-200 ease-in-out"
              >
                Resend Code
              </button>
            )}
            
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-3 px-4 rounded-lg text-sm font-medium
                text-gray-300 hover:text-white bg-transparent 
                transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          Didn't receive a code? Check your spam folder or{' '}
          <button 
            className="text-accent hover:text-white transition-colors duration-200"
            onClick={requestNewCode}
            disabled={!isExpired && timeLeft > 30}
          >
            request a new one
            {!isExpired && timeLeft > 30 && ` in ${timeLeft - 30}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationInput;
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './Button';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: string;
  resendIn?: number;
  onResend?: () => void;
  disabled?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  onComplete,
  error,
  resendIn = 0,
  onResend,
  disabled = false,
  className = '',
}: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(resendIn);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Handle paste functionality
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const pastedArray = pastedData.split('');
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedArray.length && i < length; i++) {
      newOtp[i] = pastedArray[i];
    }
    
    setOtp(newOtp);
    
    // Focus on the next empty field or the last field
    const nextIndex = Math.min(pastedArray.length, length - 1);
    setActiveOtpIndex(nextIndex);
    inputRefs.current[nextIndex]?.focus();
    
    // Check if OTP is complete
    if (pastedArray.length === length) {
      onComplete(pastedData);
    }
  }, [otp, length, onComplete]);

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    if (value.length > 1) {
      // Handle paste-like behavior for multiple characters
      const values = value.split('').slice(0, length - index);
      const newOtp = [...otp];
      
      for (let i = 0; i < values.length && (index + i) < length; i++) {
        newOtp[index + i] = values[i];
      }
      
      setOtp(newOtp);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(index + values.length, length - 1);
      setActiveOtpIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();
      
      // Check if OTP is complete
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
    } else {
      // Single character input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Move to next field if value is entered
      if (value && index < length - 1) {
        setActiveOtpIndex(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
      
      // Check if OTP is complete
      if (newOtp.every(digit => digit !== '')) {
        onComplete(newOtp.join(''));
      }
    }
  }, [otp, length, onComplete]);

  // Handle key down for navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous field if current field is empty
      setActiveOtpIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setActiveOtpIndex(index - 1);
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setActiveOtpIndex(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp, length]);

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    setActiveOtpIndex(index);
  }, []);

  // Handle resend
  const handleResend = useCallback(() => {
    if (onResend && resendCountdown === 0) {
      onResend();
      setResendCountdown(resendIn);
    }
  }, [onResend, resendCountdown, resendIn]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={() => handleFocus(index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-12 text-center text-lg font-semibold
              border-2 rounded-md
              focus:outline-none focus:ring-2 focus:ring-brand-primary
              transition-colors duration-200
              ${error 
                ? 'border-status-danger focus:ring-status-danger' 
                : activeOtpIndex === index
                  ? 'border-brand-primary'
                  : 'border-brand-text/20 hover:border-brand-text/40'
              }
              ${disabled ? 'bg-brand-text/5 cursor-not-allowed' : 'bg-white'}
            `}
            maxLength={length}
          />
        ))}
      </div>
      
      {error && (
        <p className="text-sm text-status-danger text-center">{error}</p>
      )}
      
      {onResend && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendCountdown > 0 || disabled}
            className="text-brand-text/70 hover:text-brand-primary"
          >
            {resendCountdown > 0 
              ? `Resend in ${resendCountdown}s` 
              : 'Resend OTP'
            }
          </Button>
        </div>
      )}
    </div>
  );
}

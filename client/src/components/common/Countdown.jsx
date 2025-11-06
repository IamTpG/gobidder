import React, { useState, useEffect } from 'react';

const Countdown = ({ 
  endDate,
  variant = 'overlay', 
  size = 'md',
  showLabels = true,
  onComplete,
  className = '',
  ...props 
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      } else {
        if (onComplete) onComplete();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  if (variant === 'overlay') {
    return (
      <div 
        className={`
          absolute left-0 right-0 bottom-0
          bg-white/95 backdrop-blur-sm
          rounded-t-3xl shadow-countdown
          px-4 py-3
          ${className}
        `}
        {...props}
      >
        <div className="grid grid-cols-4 gap-3 text-center">
          {[
            { value: timeLeft.days, label: 'Days' },
            { value: timeLeft.hours, label: 'Hours' },
            { value: timeLeft.minutes, label: 'Minutes' },
            { value: timeLeft.seconds, label: 'Seconds' },
          ].map((item, index) => (
            <div key={index}>
              <div className="text-3xl font-black text-slate-900 leading-none mb-1">
                {formatNumber(item.value)}
              </div>
              {showLabels && (
                <div className="text-countdown-label font-medium text-slate-600 uppercase tracking-wide">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sizeStyles = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div 
      className={`flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {[
        { value: timeLeft.days, label: 'D' },
        { value: timeLeft.hours, label: 'H' },
        { value: timeLeft.minutes, label: 'M' },
        { value: timeLeft.seconds, label: 'S' },
      ].map((item, index) => (
        <React.Fragment key={index}>
          <div className="text-center">
            <div className={`font-black text-slate-900 ${sizeStyles[size]}`}>
              {formatNumber(item.value)}
            </div>
            {showLabels && (
              <div className="text-xs text-slate-600">{item.label}</div>
            )}
          </div>
          {index < 3 && (
            <div className={`font-bold text-slate-400 ${sizeStyles[size]}`}>:</div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Countdown;

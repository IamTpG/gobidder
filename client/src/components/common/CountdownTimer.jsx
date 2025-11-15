import React, { useState, useEffect } from "react";

const CountdownTimer = ({
  days: initialDays = 0,
  hours: initialHours = 0,
  minutes: initialMinutes = 0,
  seconds: initialSeconds = 0,
  endDate,
  size = "md",
  variant = "default",
  className = "",
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: initialDays,
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  useEffect(() => {
    if (!endDate) {
      // Nếu không có endDate, dùng giá trị props
      setTimeLeft({
        days: initialDays,
        hours: initialHours,
        minutes: initialMinutes,
        seconds: initialSeconds,
      });
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Set initial time
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, initialDays, initialHours, initialMinutes, initialSeconds]);
  const sizeClasses = {
    sm: {
      value: "text-lg",
      label: "text-[8px]",
      gap: "gap-1.5",
      padding: "p-2",
    },
    md: {
      value: "text-2xl",
      label: "text-[10px]",
      gap: "gap-2.5",
      padding: "p-3",
    },
    lg: {
      value: "text-3xl",
      label: "text-xs",
      gap: "gap-4",
      padding: "p-5",
    },
  };

  const variantClasses = {
    default: "bg-gray-50 border border-gray-200",
    white: "bg-white border border-gray-200",
    primary: "bg-primary/5 border border-primary/20",
    transparent: "bg-transparent",
    compact: "bg-gray-50 border border-gray-200",
  };

  const size_class = sizeClasses[size] || sizeClasses.md;
  const isCompact = variant === "compact";

  return (
    <div
      className={`rounded-lg ${isCompact ? "p-2.5" : size_class.padding} ${variantClasses[variant]} ${className}`}
    >
      <div
        className={`grid grid-cols-4 ${isCompact ? "gap-1.5" : size_class.gap} text-center`}
      >
        <CountdownUnit
          value={timeLeft.days}
          label="Days"
          size={
            isCompact ? { value: "text-lg", label: "text-[8px]" } : size_class
          }
        />
        <CountdownUnit
          value={timeLeft.hours}
          label="Hours"
          size={
            isCompact ? { value: "text-lg", label: "text-[8px]" } : size_class
          }
        />
        <CountdownUnit
          value={timeLeft.minutes}
          label="Minutes"
          size={
            isCompact ? { value: "text-lg", label: "text-[8px]" } : size_class
          }
        />
        <CountdownUnit
          value={timeLeft.seconds}
          label="Seconds"
          size={
            isCompact ? { value: "text-lg", label: "text-[8px]" } : size_class
          }
        />
      </div>
    </div>
  );
};

const CountdownUnit = ({ value, label, size }) => (
  <div>
    <div className={`${size.value} font-black text-gray-900 mb-0.5`}>
      {String(value).padStart(2, "0")}
    </div>
    <div
      className={`${size.label} font-medium text-gray-600 uppercase tracking-wide`}
    >
      {label}
    </div>
  </div>
);

export default CountdownTimer;

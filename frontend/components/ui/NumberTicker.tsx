"use client";
import React, { useEffect, useState } from 'react';

interface NumberTickerProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export const NumberTicker = ({ 
  value, 
  duration = 800, 
  decimals = 0,
  prefix = '',
  suffix = ''
}: NumberTickerProps) => {
  const [displayed, setDisplayed] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const progress = Math.min((now - startTime) / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * value);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    };
    
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);
  
  return (
    <span className="mono-lg">
      {prefix}
      {displayed.toLocaleString('en-GB', { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })}
      {suffix}
    </span>
  );
};

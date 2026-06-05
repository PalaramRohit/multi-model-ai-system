import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`glass-card p-6 ${hover ? 'hover:border-neon-cyan/50 transition-all duration-300' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

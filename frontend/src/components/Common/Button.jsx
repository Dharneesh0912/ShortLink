import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  
  const baseStyles = "py-3 px-6 rounded-2xl font-display font-bold text-white transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700", // Yellow/Orange
    secondary: "bg-purple-600 hover:bg-purple-700 border-b-4 border-purple-800", // Purple
    success: "bg-green-500 hover:bg-green-600 border-b-4 border-green-700", // Green
    danger: "bg-red-500 hover:bg-red-600 border-b-4 border-red-700", // Red
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

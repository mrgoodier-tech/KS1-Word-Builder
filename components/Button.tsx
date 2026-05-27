import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "transform active:scale-95 transition-all duration-200 font-bold rounded-2xl shadow-lg border-b-4 focus:outline-none focus:ring-4 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-400 text-white border-blue-700 focus:ring-blue-500",
    secondary: "bg-purple-500 hover:bg-purple-400 text-white border-purple-700 focus:ring-purple-500",
    success: "bg-green-500 hover:bg-green-400 text-white border-green-700 focus:ring-green-500",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 focus:ring-slate-400"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const sizeClass = "py-4 px-8 text-xl md:text-2xl";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
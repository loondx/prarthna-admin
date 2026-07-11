import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      {...props}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: variant === 'primary' ? '#4F46E5' : '#E5E7EB',
        color: variant === 'primary' ? '#FFFFFF' : '#1F2937',
        cursor: 'pointer',
        fontWeight: 'bold',
        ...props.style
      }}
    >
      {children}
    </button>
  );
};

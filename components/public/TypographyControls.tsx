
import React from 'react';
import MinusIcon from '../icons/MinusIcon';
import PlusIcon from '../icons/PlusIcon';

interface TypographyControlsProps {
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  isMinFont: boolean;
  isMaxFont: boolean;
}

const ControlButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
        type="button"
        className="p-2 text-gray-500 transition-colors bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
        {...props}
    >
        {children}
    </button>
);

const TypographyControls: React.FC<TypographyControlsProps> = ({ 
    onIncreaseFontSize, 
    onDecreaseFontSize, 
    isMinFont,
    isMaxFont
}) => {
  return (
    <div className="flex items-center space-x-2">
       <span className="text-sm font-medium text-gray-600">Text options:</span>
       <ControlButton onClick={onDecreaseFontSize} disabled={isMinFont} aria-label="Decrease font size">
           <MinusIcon className="w-5 h-5" />
       </ControlButton>
       <ControlButton onClick={onIncreaseFontSize} disabled={isMaxFont} aria-label="Increase font size">
           <PlusIcon className="w-5 h-5" />
       </ControlButton>
    </div>
  );
};

export default TypographyControls;
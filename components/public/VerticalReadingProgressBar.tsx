

import React from 'react';

interface VerticalReadingProgressBarProps {
  progress: number;
  color?: string;
  onClick: (progress: number) => void;
}

const VerticalReadingProgressBar: React.FC<VerticalReadingProgressBarProps> = ({ progress, color = '#0D9488', onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate the percentage of the viewport height where the user clicked.
    const clickProgress = (e.clientY / window.innerHeight) * 100;
    // Call the provided onClick handler with the calculated progress.
    onClick(clickProgress);
  };

  return (
    // The track container. Made clickable by adding an onClick handler and cursor-pointer.
    <div 
      className="fixed top-0 left-0 z-30 h-screen w-1.5 bg-gray-200/50 cursor-pointer"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Scroll progress bar, click to navigate"
    >
      {/* The progress indicator bar. It scales vertically from the top.
          The bar itself is not interactive to allow the click event on the parent track. */}
      <div
        className="w-full h-full transition-transform duration-100 ease-linear origin-top pointer-events-none"
        style={{
          transform: `scaleY(${progress / 100})`,
          backgroundColor: color,
        }}
        aria-hidden="true"
      />
    </div>
  );
};

export default VerticalReadingProgressBar;
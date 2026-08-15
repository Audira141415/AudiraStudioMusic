import React, { useState } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  badge?: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  children,
  badge,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-black/90 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-black/90 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-black/90 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-black/90 border-y-transparent border-l-transparent'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-2.5 py-1.5 bg-black/90 backdrop-blur-md text-white text-[10px] font-bold rounded-lg shadow-[3px_3px_10px_rgba(0,0,0,0.5)] border border-white/20 whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${posClasses[position]}`}
        >
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="px-1 py-0.2 bg-amber-400 text-black font-black text-[8px] rounded uppercase tracking-wider">
                {badge}
              </span>
            )}
            <span>{content}</span>
          </div>
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
        </div>
      )}
    </div>
  );
};

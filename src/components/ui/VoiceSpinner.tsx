import React from 'react';
import { cn } from '../../lib/utils';

export function VoiceSpinner({ className, size = 'medium' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-24 h-24'
  };

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
    xlarge: 'w-12 h-12'
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Microphone */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className={cn('text-gray-600 dark:text-gray-300', iconSizes[size])}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Microphone body */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </div>

        {/* Animated sound waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Wave 1 - closest to mic */}
          <div className="absolute w-8 h-8 border-2 border-blue-400 rounded-full animate-ping opacity-75"
               style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>

          {/* Wave 2 - middle */}
          <div className="absolute w-12 h-12 border border-purple-400 rounded-full animate-ping opacity-50"
               style={{ animationDuration: '2s', animationDelay: '0.3s' }}></div>

          {/* Wave 3 - farthest */}
          <div className="absolute w-16 h-16 border border-indigo-400 rounded-full animate-ping opacity-25"
               style={{ animationDuration: '2.5s', animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  );
}
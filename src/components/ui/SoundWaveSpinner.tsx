import React from 'react';
import { cn } from '../../lib/utils';

export function SoundWaveSpinner({ className, size = 'medium' }) {
  const sizeClasses = {
    small: 'w-16 h-8',
    medium: 'w-24 h-12',
    large: 'w-32 h-16',
    xlarge: 'w-40 h-20'
  };

  const barHeights = {
    small: ['h-1', 'h-2', 'h-3', 'h-2', 'h-1'],
    medium: ['h-2', 'h-4', 'h-6', 'h-4', 'h-2'],
    large: ['h-3', 'h-6', 'h-9', 'h-6', 'h-3'],
    xlarge: ['h-4', 'h-8', 'h-12', 'h-8', 'h-4']
  };

  const delays = ['0s', '0.1s', '0.2s', '0.3s', '0.4s'];

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <div className={cn('flex items-end justify-center space-x-1', sizeClasses[size])}>
        {barHeights[size].map((height, index) => (
          <div
            key={index}
            className={cn(
              'w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full animate-pulse',
              height
            )}
            style={{
              animationDelay: delays[index],
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
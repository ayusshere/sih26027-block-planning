import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({ message = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className={`${sizeClasses} animate-spin text-blue-600 dark:text-blue-400`} />
      {message && (
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 animate-pulse font-mono">
          {message}
        </p>
      )}
    </div>
  );
}

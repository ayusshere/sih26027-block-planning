import React from 'react';
import { Link } from 'react-router-dom';
import { Train, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Train className="w-10 h-10 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404 - Section Blocked</h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md">
        The requested track or station page is not scheduled in this corridor timetable.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md transition-all"
      >
        <Home size={18} />
        Return to Dashboard
      </Link>
    </div>
  );
}

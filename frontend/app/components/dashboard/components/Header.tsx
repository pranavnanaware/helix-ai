import React from 'react';
import { Settings } from 'lucide-react';
import { HeaderProps, Page } from '@/app/types';

const pages: Page[] = ['workspace', 'past-sequences'];

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => (
  <div className="p-3 border-b border-gray-800 flex justify-between items-center">
    <div className="flex gap-2">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentPage === page
              ? 'bg-rose-900 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {page.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </button>
      ))}
    </div>
    <button
      onClick={() => setCurrentPage('settings')}
      className={`p-2 rounded-lg transition-colors ${
        currentPage === 'settings'
          ? 'bg-rose-900 text-white'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
      title="Settings"
    >
      <Settings size={20} />
    </button>
  </div>
); 
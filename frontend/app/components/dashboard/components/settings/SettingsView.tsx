import React from 'react';
import { Mail, Linkedin, Key, MessageCircle } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Settings</h2>
      <div className="space-y-6">
        {/* Email SMTP Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="text-rose-500" size={20} />
            <h3 className="text-white font-medium">Email SMTP Settings</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">SMTP Host</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">SMTP Port</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="587"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email Password/App Password</label>
              <input 
                type="password" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter email password or app password"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-400 text-sm mb-1">From Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Your Name"
              />
            </div>
            <div className="col-span-2">
              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" 
                  id="use_ssl"
                  className="rounded bg-gray-700 border-gray-600 text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="use_ssl" className="ml-2 text-gray-400">
                  Use SSL/TLS
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
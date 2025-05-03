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

        {/* LinkedIn API Settings */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Linkedin className="text-rose-500" size={20} />
            <h3 className="text-white font-medium">LinkedIn Messaging Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-900/50 p-3 rounded-md mb-4">
              <p className="text-gray-400 text-sm">To enable LinkedIn messaging, you'll need to:</p>
              <ul className="list-disc list-inside text-gray-400 text-sm mt-2 space-y-1">
                <li>Create a LinkedIn Developer App</li>
                <li>Enable Sign In with LinkedIn</li>
                <li>Request messaging API access</li>
                <li>Add your OAuth 2.0 credentials below</li>
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} className="text-gray-400" />
                <label className="block text-gray-400 text-sm">Client ID</label>
              </div>
              <input 
                type="text" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter your LinkedIn App Client ID"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} className="text-gray-400" />
                <label className="block text-gray-400 text-sm">Client Secret</label>
              </div>
              <input 
                type="password" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Enter your LinkedIn App Client Secret"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={16} className="text-gray-400" />
                <label className="block text-gray-400 text-sm">Messaging Scopes</label>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="w_member_social"
                    className="rounded bg-gray-700 border-gray-600 text-rose-500 focus:ring-rose-500"
                    checked
                    readOnly
                  />
                  <label htmlFor="w_member_social" className="ml-2 text-gray-400 text-sm">
                    w_member_social (Required for messaging)
                  </label>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="r_emailaddress"
                    className="rounded bg-gray-700 border-gray-600 text-rose-500 focus:ring-rose-500"
                    checked
                    readOnly
                  />
                  <label htmlFor="r_emailaddress" className="ml-2 text-gray-400 text-sm">
                    r_emailaddress (Required for authentication)
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-gray-400 text-sm">Redirect URI</label>
              </div>
              <input 
                type="text" 
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="http://localhost:3000/api/linkedin/callback"
              />
              <p className="text-gray-400 text-xs mt-1">Add this URL to your LinkedIn App's OAuth 2.0 settings</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2">
            <Linkedin size={16} />
            Test LinkedIn Connection
          </button>
          <button className="px-4 py-2 bg-rose-900 text-white rounded-lg hover:bg-rose-800 transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}; 
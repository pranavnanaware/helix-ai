import React from 'react';
import ChatInterface from '../components/ChatInterface';
import Dashboard from '../components/Dashboard';

const MainLayout: React.FC = () => {
  return (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div style={{ width: '35%', borderRight: '1px solid #ccc', padding: '10px' }}>
      <ChatInterface />
      {/* Chat messages and input can be added here */}
    </div>
    <div style={{ width: '65%' }}>
     <Dashboard />
    </div>
  </div>
  );
};

export default MainLayout;
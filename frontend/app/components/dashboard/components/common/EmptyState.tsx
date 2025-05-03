import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => (
  <div className="text-center py-8">
    {icon}
    <p className="text-gray-400">{title}</p>
    <p className="text-gray-500 text-sm mt-2">{subtitle}</p>
  </div>
); 
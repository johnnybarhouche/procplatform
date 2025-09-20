'use client';

import MaterialRequestForm from '@/components/MaterialRequestForm';

export default function Home() {
  // Mock projects data - in real app this would come from API
  const projects = [
    { id: '1', name: 'Project Alpha' },
    { id: '2', name: 'Project Beta' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <MaterialRequestForm 
        projects={projects} 
      />
    </div>
  );
}

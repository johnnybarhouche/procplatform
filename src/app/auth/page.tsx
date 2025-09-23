'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useProject } from '@/contexts/ProjectContext';
import SignInPage from '@/components/SignInPage';
import ProjectSelection from '@/components/ProjectSelection';
import RequestAccessForm from '@/components/RequestAccessForm';
import ProjectWizard from '@/components/ProjectWizard';

export default function AuthPage() {
  const router = useRouter();
  const { user, login, logout, loading, error } = useAuth();
  const { projects, selectedProject, selectProject, createProject } = useProject();
  const [showRequestAccess, setShowRequestAccess] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  const handleSignIn = async (credentials: { username: string; password: string; rememberMe: boolean; role: string }) => {
    try {
      await login(credentials);
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };

  const handleRequestAccess = () => {
    setShowRequestAccess(true);
  };

  const handleAdminAccess = () => {
    // For demo purposes, automatically sign in as admin
    handleSignIn({ username: 'admin', password: 'admin123', rememberMe: false, role: 'admin' });
  };

  const handleAccessRequested = () => {
    setShowRequestAccess(false);
    // Show success message or redirect
  };

  const handleProjectSelected = (project: { id: string; name: string; description: string; logo?: string }) => {
    selectProject(project);
    router.push('/');
  };

  const handleCreateProject = () => {
    setShowProjectWizard(true);
  };

  const handleProjectCreated = async (project: { id: string; name: string; description: string; logo?: string }) => {
    try {
      await createProject(project);
      setShowProjectWizard(false);
      router.push('/');
    } catch (err) {
      // Error is handled by the ProjectContext
    }
  };

  // Handle navigation when user is authenticated and has a project
  useEffect(() => {
    if (user && selectedProject) {
      router.push('/');
    }
  }, [user, selectedProject, router]);

  if (user && !selectedProject) {
    return (
      <>
        <ProjectSelection
          projects={projects}
          onProjectSelected={handleProjectSelected}
          onCreateProject={handleCreateProject}
        />
        <ProjectWizard
          isOpen={showProjectWizard}
          onClose={() => setShowProjectWizard(false)}
          onProjectCreated={handleProjectCreated}
        />
      </>
    );
  }

  return (
    <>
      <SignInPage
        onSignIn={handleSignIn}
        onRequestAccess={handleRequestAccess}
        onAdminAccess={handleAdminAccess}
        loading={loading}
        error={error || undefined}
      />
      <RequestAccessForm
        isOpen={showRequestAccess}
        onClose={() => setShowRequestAccess(false)}
        onAccessRequested={handleAccessRequested}
      />
    </>
  );
}

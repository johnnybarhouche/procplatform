'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  selectProject: (project: Project) => void;
  createProject: (project: Omit<Project, 'id'>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load projects from localStorage on mount
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(parsedProjects);
        if (parsedProjects.length > 0) {
          setSelectedProject(parsedProjects[0]);
        }
      } catch (err) {
        console.error('Failed to parse saved projects:', err);
      }
    }
  }, []);

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    localStorage.setItem('selectedProject', JSON.stringify(project));
  };

  const createProject = async (projectData: Omit<Project, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { project } = await response.json();
      setProjects(prev => [...prev, project]);
      setSelectedProject(project);
      localStorage.setItem('projects', JSON.stringify([...projects, project]));
      localStorage.setItem('selectedProject', JSON.stringify(project));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, selectedProject, selectProject, createProject, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

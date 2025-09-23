'use client';

import React, { useState } from 'react';
import { Button, Card, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

interface Project {
  id: string;
  name: string;
  description: string;
  logo?: string;
}

interface ProjectSelectionProps {
  projects: Project[];
  onProjectSelected: (project: Project) => void;
  onCreateProject: () => void;
}

export default function ProjectSelection({ projects, onProjectSelected, onCreateProject }: ProjectSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-text mb-2">Select Project</h1>
            <p className="text-brand-text/70">Choose a project to continue</p>
          </div>

          <div className="mb-6">
            <Input
              label="Search Projects"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or description"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onProjectSelected(project)}
              >
                <div className="flex items-center space-x-3">
                  {project.logo ? (
                    <img
                      src={project.logo}
                      alt={`${project.name} logo`}
                      className="h-12 w-12 rounded-md object-contain"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-brand-primary/10 flex items-center justify-center">
                      <span className="text-brand-primary font-semibold">
                        {project.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-text">{project.name}</h3>
                    <p className="text-sm text-brand-text/70">{project.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={onCreateProject}
              variant="secondary"
              className="w-full"
            >
              Create New Project
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

'use client';

interface TopBarProps {
  projects: Array<{ id: string; name: string }>;
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  userRole: 'requester' | 'procurement' | 'approver' | 'admin';
  onRoleChange: (role: 'requester' | 'procurement' | 'approver' | 'admin') => void;
}

const ROLES: Array<{ id: TopBarProps['userRole']; label: string }> = [
  { id: 'requester', label: 'Requester' },
  { id: 'procurement', label: 'Procurement' },
  { id: 'approver', label: 'Approver' },
  { id: 'admin', label: 'Admin' },
];

export function TopBar({
  projects,
  selectedProjectId,
  onProjectChange,
  userRole,
  onRoleChange,
}: TopBarProps) {
  return (
    <header className="bg-brand-primary text-brand-on-primary">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-on-primary text-brand-primary font-semibold">
            PP
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm uppercase tracking-wide text-brand-on-primary/70">Procurement Platform</span>
            <span className="text-lg font-semibold">Global Operations</span>
          </div>
        </div>

        <div className="hidden w-64 sm:block">
          <label className="flex flex-col space-y-1 text-sm text-brand-on-primary/80">
            <span className="font-medium text-brand-on-primary">Project</span>
            <select
              value={selectedProjectId}
              onChange={(event) => onProjectChange(event.target.value)}
              className="w-full rounded-md border border-brand-on-primary/30 bg-brand-on-primary px-3 py-2 text-brand-primary focus:border-brand-primary/80 focus:outline-none focus:ring-2 focus:ring-brand-on-primary/40"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex min-w-[140px] flex-col space-y-1 text-sm text-brand-on-primary/80">
            <span className="font-medium text-brand-on-primary">Role</span>
            <select
              value={userRole}
              onChange={(event) => onRoleChange(event.target.value as TopBarProps['userRole'])}
              className="w-full rounded-md border border-brand-on-primary/30 bg-brand-on-primary px-3 py-2 text-brand-primary focus:border-brand-primary/80 focus:outline-none focus:ring-2 focus:ring-brand-on-primary/40"
            >
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-on-primary/10 text-brand-on-primary hover:bg-brand-on-primary/20"
          >
            🔔
          </button>
          <button
            type="button"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-on-primary/10 text-brand-on-primary font-semibold hover:bg-brand-on-primary/20"
          >
            JD
          </button>
        </div>
      </div>
    </header>
  );
}

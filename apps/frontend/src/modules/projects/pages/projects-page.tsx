import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderKanban } from 'lucide-react';
import {
  useProjects,
  useCreateProject,
} from '../hooks/use-projects';
import type { ProjectListItem } from '../hooks/use-projects';
import { ProjectFilters } from '../components/project-filters';
import { ProjectCard } from '../components/project-card';
import { ProjectDialog } from '../components/project-dialog';
import type {
  ProjectFilters as ProjectFiltersType,
  CreateProjectInput,
  UpdateProjectInput,
} from '@lifeos/shared';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProjectFiltersType>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProjects({ ...filters, page, limit: 30 });
  const createProject = useCreateProject();

  const projects = data?.data ?? [];
  const meta = data?.meta;

  const handleSubmit = (
    input: CreateProjectInput | (UpdateProjectInput & { id: string }),
  ) => {
    if ('id' in input) return;
    createProject.mutate(input, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleCardClick = (project: ProjectListItem) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your projects, milestones, and track progress
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="mb-4">
        <ProjectFilters filters={filters} onChange={setFilters} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[180px] rounded-lg border border-border bg-card animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <FolderKanban className="h-10 w-10 text-muted" />
          <p className="mt-3 text-sm text-muted-foreground">No projects found</p>
          <p className="mt-1 text-xs text-muted">
            Create your first project to start organizing your work
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-4 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div key={project.id} className="animate-card-in" style={{ '--i': i } as React.CSSProperties}>
                <ProjectCard
                  project={project}
                  onClick={handleCardClick}
                />
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

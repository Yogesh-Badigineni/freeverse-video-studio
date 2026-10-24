import React from 'react';
import { 
  FolderOpen, 
  Trash2, 
  Copy, 
  Play, 
  Plus, 
  Clock, 
  Layers, 
  X,
  AlertTriangle
} from 'lucide-react';
import { Project } from '../types/studio';

interface ProjectManagerModalProps {
  projects: Project[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  onNewProject: () => void;
  onClose: () => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onDuplicateProject,
  onNewProject,
  onClose
}) => {
  const handleDelete = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete "${project.title}"?`)) {
      onDeleteProject(project.id);
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicateProject(id);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderOpen size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Manage Projects & Templates</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                View, switch, duplicate, or delete your saved video projects
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onNewProject();
              }}
            >
              <Plus size={14} /> New Project
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '480px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No projects found. Click "New Project" to create your first video.
            </div>
          ) : (
            projects.map((proj) => {
              const isCurrent = proj.id === currentProjectId;
              const totalSec = proj.scenes.reduce((sum, s) => sum + s.duration, 0);

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj.id);
                    onClose();
                  }}
                  style={{
                    background: isCurrent ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                    border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="glass-card"
                >
                  {/* Left Details */}
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {proj.title}
                      </h4>
                      {isCurrent && (
                        <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                          Active
                        </span>
                      )}
                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>
                        {proj.style.replace('_', ' ')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Layers size={13} /> {proj.scenes.length} Scenes
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {totalSec.toFixed(1)}s
                      </span>
                      <span>Format: {proj.aspect_ratio} ({proj.resolution})</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      title="Open this project"
                    >
                      <Play size={13} /> Open
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={(e) => handleDuplicate(proj.id, e)}
                      title="Duplicate project"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={(e) => handleDelete(proj, e)}
                      title="Delete project"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

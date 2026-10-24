import React from 'react';
import { 
  Film, 
  Sparkles, 
  Download, 
  Cpu, 
  HelpCircle, 
  FolderOpen, 
  Plus, 
  Settings,
  Layers,
  Trash2
} from 'lucide-react';
import { Project } from '../types/studio';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onOpenProjectManager: () => void;
  onOpenGallery: () => void;
  onOpenModelHub: () => void;
  onOpenRender: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  onOpenProjectManager,
  onOpenGallery,
  onOpenModelHub,
  onOpenRender,
  onOpenHelp,
  onOpenSettings
}) => {
  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-glass)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Project Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onOpenGallery}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <Film size={20} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              FreeVerse <span className="gradient-text">Studio</span>
            </h1>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              100% Free • Open Source • Local AI
            </span>
          </div>
        </div>

        <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

        {/* Project Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderOpen size={16} color="var(--text-secondary)" />
          <select 
            className="select-field"
            value={currentProject?.id || ''}
            onChange={(e) => onSelectProject(e.target.value)}
            style={{ maxWidth: '240px', fontWeight: 600 }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenProjectManager}
            title="Manage All Projects & Templates"
          >
            Manage
          </button>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onNewProject}
            title="Create New Blank Project"
          >
            <Plus size={14} /> New
          </button>
          {currentProject && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete "${currentProject.title}"?`)) {
                  onDeleteProject(currentProject.id);
                }
              }}
              title="Delete Current Project / Template"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Center Navigation Shortcuts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenGallery}
        >
          <Layers size={15} /> Video Styles Gallery
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenModelHub}
          style={{ position: 'relative' }}
        >
          <Cpu size={15} color="var(--accent-cyan)" /> 
          <span>Local AI Hub</span>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B981',
            display: 'inline-block'
          }} />
        </button>
      </div>

      {/* Right Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenSettings}
          title="Hardware & Storage Settings"
        >
          <Settings size={16} />
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenHelp}
          title="Documentation & Shortcuts"
        >
          <HelpCircle size={16} />
        </button>
        <button 
          className="btn btn-primary"
          onClick={onOpenRender}
          style={{ padding: '8px 20px' }}
        >
          <Download size={16} /> Render & Export
        </button>
      </div>
    </header>
  );
};

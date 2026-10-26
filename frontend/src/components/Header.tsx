import React, { useState, useEffect } from 'react';
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
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import { Project } from '../types/studio';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject?: (title: string) => void;
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
  onRenameProject,
  onOpenProjectManager,
  onOpenGallery,
  onOpenModelHub,
  onOpenRender,
  onOpenHelp,
  onOpenSettings
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editableTitle, setEditableTitle] = useState(currentProject?.title || '');

  useEffect(() => {
    setEditableTitle(currentProject?.title || '');
  }, [currentProject?.title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (editableTitle.trim() && editableTitle !== currentProject?.title && onRenameProject) {
      onRenameProject(editableTitle.trim());
    } else {
      setEditableTitle(currentProject?.title || '');
    }
  };

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
          {currentProject && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
              {isEditingTitle ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    onBlur={handleTitleSubmit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSubmit();
                      if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                        setEditableTitle(currentProject.title);
                      }
                    }}
                    autoFocus
                    style={{
                      height: '32px',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      width: '200px'
                    }}
                  />
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleTitleSubmit}
                    style={{ padding: '6px' }}
                    title="Save title"
                  >
                    <Check size={13} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    maxWidth: '220px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Click to rename project"
                >
                  <span style={{ 
                    fontSize: '13px', 
                    fontWeight: 700, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    color: 'var(--text-primary)' 
                  }}>
                    {currentProject.title}
                  </span>
                  <Edit2 size={12} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              )}
            </div>
          )}

          {projects.length > 1 && (
            <select 
              className="select-field"
              value={currentProject?.id || ''}
              onChange={(e) => onSelectProject(e.target.value)}
              style={{ maxWidth: '160px', fontSize: '12px', padding: '5px 8px' }}
              title="Switch project"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onOpenProjectManager}
            title="Manage All Projects & Templates"
          >
            <FolderOpen size={14} /> Projects
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={onNewProject}
            title="Create New Video Project"
            style={{ fontWeight: 700 }}
          >
            <Plus size={14} /> New Video
          </button>

          {currentProject && (
            <button 
              className="btn btn-danger btn-sm"
              onClick={() => onDeleteProject(currentProject.id)}
              title="Delete Current Project"
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
          <Cpu size={15} /> Local AI Hub
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            position: 'absolute',
            top: '6px',
            right: '6px'
          }} />
        </button>
      </div>

      {/* Right Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenHelp}
          title="Studio Guide & Shortcuts"
        >
          <HelpCircle size={16} />
        </button>
        <button 
          className="btn btn-outline btn-sm"
          onClick={onOpenSettings}
          title="Hardware & Settings"
        >
          <Settings size={16} />
        </button>
        <button 
          className="btn btn-primary btn-sm"
          onClick={onOpenRender}
          style={{
            padding: '7px 16px',
            fontWeight: 700,
            letterSpacing: '0.01em',
            boxShadow: '0 4px 14px var(--primary-glow)'
          }}
        >
          <Download size={15} /> Render & Export
        </button>
      </div>
    </header>
  );
};

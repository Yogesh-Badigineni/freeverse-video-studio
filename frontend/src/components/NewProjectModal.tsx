import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Layers, 
  Monitor, 
  Smartphone, 
  Square, 
  Film, 
  X,
  ArrowRight
} from 'lucide-react';
import { VideoStyle, AspectRatio, Resolution } from '../types/studio';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: (params: {
    title: string;
    style: VideoStyle;
    aspect_ratio: AspectRatio;
    resolution: Resolution;
  }) => void;
  onOpenAIScriptStudio: () => void;
  onOpenTemplates: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateBlank,
  onOpenAIScriptStudio,
  onOpenTemplates
}) => {
  const [title, setTitle] = useState('New Video Project');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [style, setStyle] = useState<VideoStyle>('natural');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateBlank({
      title: title.trim() || 'Untitled Video Project',
      style,
      aspect_ratio: aspectRatio,
      resolution
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', padding: '28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-glow)'
            }}>
              <Plus size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Create New Video Project</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Start a fresh blank canvas or kick off with smart AI generation
              </p>
            </div>
          </div>

          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Quick Launch Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div 
            onClick={() => {
              onClose();
              onOpenAIScriptStudio();
            }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sparkles size={18} color="#818CF8" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>AI Script Studio</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Turn a text prompt or document into a full storyboard with generated visuals & narration.
            </p>
          </div>

          <div 
            onClick={() => {
              onClose();
              onOpenTemplates();
            }}
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            className="glass-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Layers size={18} color="#34D399" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>Video Styles</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Browse curated presets (Social 9:16, Cartoons, Explainers, Visualizers).
            </p>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '20px' }} />

        {/* Blank Project Config Form */}
        <form onSubmit={handleCreate}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Project Title
              </label>
              <input 
                className="input-field"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Next Masterpiece"
                autoFocus
              />
            </div>

            {/* Aspect Ratio Selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Aspect Ratio / Format
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: '16:9' as AspectRatio, label: '16:9 Landscape', desc: 'YouTube & Desktop', icon: <Monitor size={16} /> },
                  { id: '9:16' as AspectRatio, label: '9:16 Vertical', desc: 'Shorts & TikTok', icon: <Smartphone size={16} /> },
                  { id: '1:1' as AspectRatio, label: '1:1 Square', desc: 'Instagram & Posts', icon: <Square size={16} /> }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setAspectRatio(item.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1.5px solid ${aspectRatio === item.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: aspectRatio === item.id ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', color: aspectRatio === item.id ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {item.icon}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality and Style Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Target Quality
                </label>
                <select 
                  className="select-field"
                  style={{ width: '100%' }}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as Resolution)}
                >
                  <option value="1080p">1080p Full HD (Recommended)</option>
                  <option value="720p">720p HD (Faster rendering)</option>
                  <option value="4k">4K Ultra HD (Studio Master)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Initial Style Preset
                </label>
                <select 
                  className="select-field"
                  style={{ width: '100%' }}
                  value={style}
                  onChange={(e) => setStyle(e.target.value as VideoStyle)}
                >
                  <option value="natural">Natural & Cinematic Editing</option>
                  <option value="ai_generated">AI Generated Story</option>
                  <option value="educational">Educational / Explainer</option>
                  <option value="cartoon">Kids / Animated Story</option>
                  <option value="social">Social Media Viral</option>
                  <option value="visualizer">Music Visualizer</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 22px' }}>
              <Film size={15} /> Start Blank Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

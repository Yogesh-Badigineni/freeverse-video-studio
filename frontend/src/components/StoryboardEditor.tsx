import React from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  Type, 
  Sliders, 
  Mic, 
  Move,
  Film
} from 'lucide-react';
import { Scene, TransitionType, MotionType, Project } from '../types/studio';

interface StoryboardEditorProps {
  project: Project;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateScene: (index: number, updated: Partial<Scene>) => void;
  onAddScene: () => void;
  onDeleteScene: (index: number) => void;
  onDuplicateScene: (index: number) => void;
  onMoveScene: (fromIndex: number, toIndex: number) => void;
  onOpenAssetPicker: (sceneIndex: number) => void;
}

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
  onMoveScene,
  onOpenAssetPicker
}) => {
  const currentScene: Scene | undefined = project.scenes[activeSceneIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Scene Strip Bar */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        padding: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={16} color="var(--primary)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
              Storyboard Scenes ({project.scenes.length})
            </h3>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={onAddScene}
          >
            <Plus size={14} /> Add Scene
          </button>
        </div>

        {/* Horizontal Card Strip */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {project.scenes.map((scene, idx) => {
            const isActive = idx === activeSceneIndex;
            return (
              <div
                key={scene.id || idx}
                onClick={() => onSelectScene(idx)}
                style={{
                  minWidth: '150px',
                  maxWidth: '160px',
                  borderRadius: 'var(--radius-sm)',
                  border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                  padding: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                {/* Thumbnail Preview */}
                <div style={{
                  height: '80px',
                  borderRadius: '4px',
                  background: scene.background_color || '#1A1A24',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  position: 'relative'
                }}>
                  {scene.asset_url ? (
                    <img 
                      src={scene.asset_url} 
                      alt={scene.title}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <ImageIcon size={22} color="var(--text-muted)" />
                  )}
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '2px 5px',
                    borderRadius: '3px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {scene.duration}s
                  </span>
                </div>

                {/* Title & Scene Number */}
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {idx + 1}. {scene.title}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {scene.motion_effect.replace(/_/g, ' ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Scene Inspector */}
      {currentScene && (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '20px'
        }}>
          {/* Header & Quick Scene Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">Scene {activeSceneIndex + 1}</span>
              <input
                className="input-field"
                style={{ fontWeight: 700, fontSize: '15px', padding: '6px 10px', width: '260px' }}
                value={currentScene.title}
                onChange={(e) => onUpdateScene(activeSceneIndex, { title: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveScene(activeSceneIndex, activeSceneIndex - 1)}
                disabled={activeSceneIndex === 0}
                title="Move Left"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onMoveScene(activeSceneIndex, activeSceneIndex + 1)}
                disabled={activeSceneIndex === project.scenes.length - 1}
                title="Move Right"
              >
                <ChevronRight size={14} />
              </button>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onDuplicateScene(activeSceneIndex)}
                title="Duplicate Scene"
              >
                <Copy size={14} />
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => onDeleteScene(activeSceneIndex)}
                disabled={project.scenes.length <= 1}
                title="Delete Scene"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Left Column: Visual Asset & Motion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Visual Asset & Media
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onOpenAssetPicker(activeSceneIndex)}
                  >
                    <ImageIcon size={14} /> {currentScene.asset_url ? 'Replace Image / Video' : 'Choose Media Asset'}
                  </button>
                  <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Color:
                    <input 
                      type="color" 
                      value={currentScene.background_color || '#1A1A24'}
                      onChange={(e) => onUpdateScene(activeSceneIndex, { background_color: e.target.value })}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', width: '28px', height: '28px' }}
                    />
                  </label>
                </div>
              </div>

              {/* Duration & Motion Effect */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Duration ({currentScene.duration}s)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={currentScene.duration}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { duration: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Camera Motion
                  </label>
                  <select
                    className="select-field"
                    style={{ width: '100%' }}
                    value={currentScene.motion_effect}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { motion_effect: e.target.value as MotionType })}
                  >
                    <option value="none">None (Static)</option>
                    <option value="ken_burns_zoom_in">Ken Burns Zoom In</option>
                    <option value="ken_burns_zoom_out">Ken Burns Zoom Out</option>
                    <option value="pan_left">Slow Pan Left</option>
                    <option value="pan_right">Slow Pan Right</option>
                    <option value="cartoon_bounce">Cartoon 2D Bounce</option>
                  </select>
                </div>
              </div>

              {/* Scene Transition */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Transition
                  </label>
                  <select
                    className="select-field"
                    style={{ width: '100%' }}
                    value={currentScene.transition}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { transition: e.target.value as TransitionType })}
                  >
                    <option value="none">Cut (No Transition)</option>
                    <option value="fade">Smooth Fade</option>
                    <option value="dissolve">Cross Dissolve</option>
                    <option value="slideleft">Slide Left</option>
                    <option value="wipeleft">Wipe</option>
                    <option value="zoomin">Zoom Burst</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Text Position
                  </label>
                  <select
                    className="select-field"
                    style={{ width: '100%' }}
                    value={currentScene.text_position}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { text_position: e.target.value as any })}
                  >
                    <option value="bottom">Bottom (Subtitles)</option>
                    <option value="center">Center (Title Card)</option>
                    <option value="top">Top (Header)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Subtitles & Voiceover Script */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Type size={14} color="var(--primary)" /> On-Screen Text / Subtitles
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="Enter title text or subtitles to overlay on this scene..."
                  value={currentScene.text_overlay || ''}
                  onChange={(e) => onUpdateScene(activeSceneIndex, { text_overlay: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Mic size={14} color="var(--accent-pink)" /> Voiceover / Narration Script
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Voiceover spoken narration text for this scene..."
                  value={currentScene.voiceover_text || ''}
                  onChange={(e) => onUpdateScene(activeSceneIndex, { voiceover_text: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

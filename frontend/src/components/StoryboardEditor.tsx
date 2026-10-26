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
  Film,
  Sparkles,
  Eraser
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
  onOpenPromptStudio?: () => void;
}

const BG_COLOR_PALETTES = [
  { label: 'Obsidian', color: '#0A0A10' },
  { label: 'Deep Slate', color: '#1E293B' },
  { label: 'Midnight Indigo', color: '#1E1B4B' },
  { label: 'Ruby Dusk', color: '#4C0519' },
  { label: 'Emerald Forest', color: '#064E3B' },
  { label: 'Sunset Amber', color: '#78350F' },
  { label: 'Cosmic Violet', color: '#3B0764' },
  { label: 'Studio Light', color: '#F8FAFC' }
];

export const StoryboardEditor: React.FC<StoryboardEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onAddScene,
  onDeleteScene,
  onDuplicateScene,
  onMoveScene,
  onOpenAssetPicker,
  onOpenPromptStudio
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
            title="Add a new scene to this project"
          >
            <Plus size={14} /> Add Scene
          </button>
        </div>

        {/* Horizontal Card Strip */}
        {project.scenes.length === 0 ? (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px dashed var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>No scenes in this project yet. Start by adding your first scene!</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary btn-sm" onClick={onAddScene}>
                <Plus size={14} /> Add Scene
              </button>
              {onOpenPromptStudio && (
                <button className="btn btn-secondary btn-sm" onClick={onOpenPromptStudio}>
                  <Sparkles size={14} /> AI Script Assistant
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '8px',
            alignItems: 'stretch'
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
                    background: isActive ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                    padding: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                  className="glass-card"
                >
                  {/* Thumbnail Preview */}
                  <div style={{
                    height: '76px',
                    borderRadius: '4px',
                    background: scene.background_color || '#1A1A24',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '6px',
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
                      <ImageIcon size={20} color="var(--text-muted)" />
                    )}
                    <span style={{
                      position: 'absolute',
                      bottom: '3px',
                      right: '4px',
                      background: 'rgba(0,0,0,0.75)',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: '#FFFFFF'
                    }}>
                      {scene.duration}s
                    </span>

                    {/* Quick action buttons on thumbnail */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: '3px',
                        right: '3px',
                        display: 'flex',
                        gap: '2px'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onDuplicateScene(idx)}
                        style={{
                          background: 'rgba(0,0,0,0.65)',
                          border: 'none',
                          color: '#FFFFFF',
                          borderRadius: '3px',
                          padding: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Duplicate this scene"
                      >
                        <Copy size={11} />
                      </button>
                      <button
                        onClick={() => onDeleteScene(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.85)',
                          border: 'none',
                          color: '#FFFFFF',
                          borderRadius: '3px',
                          padding: '3px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete this scene"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Scene Number */}
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {idx + 1}. {scene.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {(scene.motion_effect || 'none').replace(/_/g, ' ')}
                  </div>
                </div>
              );
            })}

            {/* Inline Quick Add Scene Card */}
            <div
              onClick={onAddScene}
              style={{
                minWidth: '100px',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '12px',
                color: 'var(--text-muted)',
                transition: 'all 0.15s ease',
                flexShrink: 0
              }}
              title="Add a new scene"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={20} />
              <span style={{ fontSize: '11px', fontWeight: 600, marginTop: '4px' }}>Add Scene</span>
            </div>
          </div>
        )}
      </div>

      {/* Active Scene Inspector */}
      {currentScene ? (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '20px'
        }}>
          {/* Header & Quick Scene Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary">Scene {activeSceneIndex + 1} of {project.scenes.length}</span>
              <input
                className="input-field"
                style={{ fontWeight: 700, fontSize: '15px', padding: '6px 10px', width: '260px' }}
                value={currentScene.title}
                onChange={(e) => onUpdateScene(activeSceneIndex, { title: e.target.value })}
                placeholder="Scene Title..."
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
                title="Delete this Scene"
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => onOpenAssetPicker(activeSceneIndex)}
                  >
                    <ImageIcon size={14} /> {currentScene.asset_url ? 'Replace Image / Video' : 'Choose Media Asset'}
                  </button>
                  {currentScene.asset_url && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onUpdateScene(activeSceneIndex, { asset_id: undefined, asset_url: undefined })}
                      title="Remove media asset and use solid background"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Quick Color Presets Palette */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Color:</span>
                  {BG_COLOR_PALETTES.map((p) => (
                    <div
                      key={p.color}
                      onClick={() => onUpdateScene(activeSceneIndex, { background_color: p.color })}
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '4px',
                        background: p.color,
                        border: currentScene.background_color === p.color ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                      title={p.label}
                    />
                  ))}
                  <input 
                    type="color" 
                    value={currentScene.background_color || '#1A1A24'}
                    onChange={(e) => onUpdateScene(activeSceneIndex, { background_color: e.target.value })}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', width: '22px', height: '22px', marginLeft: '4px' }}
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Duration & Motion Effect */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>
                      Duration ({currentScene.duration}s)
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[2, 4, 6].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          className="badge"
                          style={{
                            background: currentScene.duration === sec ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                            color: currentScene.duration === sec ? '#FFFFFF' : 'var(--text-muted)',
                            cursor: 'pointer',
                            border: 'none',
                            fontSize: '9px',
                            padding: '1px 5px'
                          }}
                          onClick={() => onUpdateScene(activeSceneIndex, { duration: sec })}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
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
                    value={currentScene.motion_effect || 'none'}
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

              {/* Scene Transition & Text Position */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Transition
                  </label>
                  <select
                    className="select-field"
                    style={{ width: '100%' }}
                    value={currentScene.transition || 'fade'}
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
                    value={currentScene.text_position || 'bottom'}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Type size={14} color="var(--primary)" /> On-Screen Text / Subtitles
                  </label>
                  {currentScene.text_overlay && (
                    <button
                      type="button"
                      onClick={() => onUpdateScene(activeSceneIndex, { text_overlay: '' })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Clear subtitle text"
                    >
                      <Eraser size={12} /> Clear Text
                    </button>
                  )}
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mic size={14} color="var(--accent-pink)" /> Voiceover / Narration Script
                  </label>
                  {currentScene.voiceover_text && (
                    <button
                      type="button"
                      onClick={() => onUpdateScene(activeSceneIndex, { voiceover_text: '' })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                      title="Clear voiceover text"
                    >
                      <Eraser size={12} /> Clear Voiceover
                    </button>
                  )}
                </div>
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
      ) : (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--border-subtle)',
          padding: '36px 20px',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '14px', fontSize: '13px' }}>
            No scene selected. Add a new scene to customize visual assets, captions, and voiceover.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={onAddScene}>
              <Plus size={14} /> Add Scene
            </button>
            {onOpenPromptStudio && (
              <button className="btn btn-secondary btn-sm" onClick={onOpenPromptStudio}>
                <Sparkles size={14} /> AI Script Assistant
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { 
  Music, 
  Mic, 
  Volume2, 
  Sliders, 
  Clock, 
  Plus,
  Trash2
} from 'lucide-react';
import { Project, AudioTrack } from '../types/studio';

interface TimelineTracksProps {
  project: Project;
  activeSceneIndex: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onSelectScene: (index: number) => void;
  onUpdateAudioTrack: (index: number, updated: Partial<AudioTrack>) => void;
  onAddAudioTrack: () => void;
  onDeleteAudioTrack: (index: number) => void;
}

export const TimelineTracks: React.FC<TimelineTracksProps> = ({
  project,
  activeSceneIndex,
  currentTime,
  onSeek,
  onSelectScene,
  onUpdateAudioTrack,
  onAddAudioTrack,
  onDeleteAudioTrack
}) => {
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 10;
  // Pixels per second for zoom scale
  const pixelsPerSec = 45;
  const totalWidth = Math.max(800, totalDuration * pixelsPerSec);

  // Handle click on timeline ruler
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, Math.min(totalDuration, clickX / pixelsPerSec));
    onSeek(seekTime);
  };

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} color="var(--primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Multi-Track Timeline</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Total Duration: {totalDuration.toFixed(1)}s
          </span>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={onAddAudioTrack}
        >
          <Plus size={13} /> Add Audio Track
        </button>
      </div>

      {/* Scrollable Tracks Area */}
      <div style={{ overflowX: 'auto', padding: '12px 16px', position: 'relative' }}>
        <div style={{ width: `${totalWidth}px`, position: 'relative' }}>
          
          {/* Time Ruler */}
          <div 
            onClick={handleRulerClick}
            style={{
              height: '24px',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'relative',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {Array.from({ length: Math.ceil(totalDuration) + 1 }).map((_, sec) => (
              <div 
                key={sec}
                style={{
                  position: 'absolute',
                  left: `${sec * pixelsPerSec}px`,
                  top: 0,
                  bottom: 0,
                  borderLeft: `1px solid ${sec % 5 === 0 ? 'var(--text-secondary)' : 'var(--border-subtle)'}`,
                  paddingLeft: '3px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  color: sec % 5 === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                  pointerEvents: 'none'
                }}
              >
                {sec % 5 === 0 ? `${sec}s` : ''}
              </div>
            ))}
          </div>

          {/* Video Scene Track */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              VIDEO / SCENE TRACK
            </div>
            <div style={{ display: 'flex', height: '52px', gap: '3px' }}>
              {project.scenes.length === 0 ? (
                <div style={{
                  height: '52px',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  padding: '0 16px',
                  background: 'var(--bg-tertiary)'
                }}>
                  No scenes on timeline yet. Click "+ Add Scene" above.
                </div>
              ) : (
                project.scenes.map((scene, idx) => {
                  const widthPx = Math.max(50, scene.duration * pixelsPerSec);
                  const isActive = idx === activeSceneIndex;
                  return (
                    <div
                      key={scene.id || idx}
                      onClick={() => onSelectScene(idx)}
                      style={{
                        width: `${widthPx}px`,
                        background: isActive ? 'linear-gradient(135deg, #4F46E5, #6366F1)' : 'var(--bg-tertiary)',
                        border: `1px solid ${isActive ? '#818CF8' : 'var(--border-subtle)'}`,
                        borderRadius: '6px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        overflow: 'hidden',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {idx + 1}. {scene.title}
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>
                        <span>{(scene.motion_effect || 'none').split('_')[0]}</span>
                        <span>{scene.duration}s</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Audio Tracks */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              AUDIO TRACKS ({project.audio_tracks.length})
            </div>
            {project.audio_tracks.map((track, idx) => {
              const startX = track.start_time * pixelsPerSec;
              const trackWidth = (track.duration || totalDuration) * pixelsPerSec;
              return (
                <div 
                  key={track.id || idx}
                  style={{
                    height: '42px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    marginBottom: '6px',
                    position: 'relative',
                    left: `${startX}px`,
                    width: `${trackWidth}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {track.type === 'voiceover' ? (
                      <Mic size={14} color="#EC4899" />
                    ) : (
                      <Music size={14} color="#10B981" />
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>{track.title}</span>
                    {track.ducking && (
                      <span className="badge badge-emerald" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        Auto-Ducking
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Volume2 size={13} color="var(--text-muted)" />
                      <input
                        type="range"
                        min={0}
                        max={1.5}
                        step={0.1}
                        value={track.volume}
                        onChange={(e) => onUpdateAudioTrack(idx, { volume: parseFloat(e.target.value) })}
                        style={{ width: '60px', accentColor: '#10B981' }}
                      />
                    </div>
                    <button 
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 6px' }}
                      onClick={() => onDeleteAudioTrack(idx)}
                      title="Remove audio track"
                    >
                      <Trash2 size={12} color="#EF4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Red Playhead line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${currentTime * pixelsPerSec}px`,
              width: '2px',
              background: '#EF4444',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#EF4444',
              position: 'absolute',
              top: '-3px',
              left: '-4px'
            }} />
          </div>

        </div>
      </div>
    </div>
  );
};

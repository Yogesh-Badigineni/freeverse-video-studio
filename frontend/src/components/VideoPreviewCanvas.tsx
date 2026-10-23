import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Smartphone, 
  Square,
  Sparkles
} from 'lucide-react';
import { Project, Scene, AspectRatio, Resolution } from '../types/studio';

interface VideoPreviewCanvasProps {
  project: Project;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateProjectSettings: (aspect: AspectRatio, res: Resolution) => void;
}

export const VideoPreviewCanvas: React.FC<VideoPreviewCanvasProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateProjectSettings
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total project duration
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 1;

  // Active scene based on currentTime
  const currentScene: Scene | undefined = project.scenes[activeSceneIndex] || project.scenes[0];

  // Playback timer loop
  useEffect(() => {
    let animFrame: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (isPlaying) {
        const delta = (timestamp - lastTimestamp) / 1000 * playbackSpeed;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }
      lastTimestamp = timestamp;
      animFrame = requestAnimationFrame(loop);
    };

    if (isPlaying) {
      animFrame = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, totalDuration, playbackSpeed]);

  // Sync activeSceneIndex with currentTime
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < project.scenes.length; i++) {
      accumulated += project.scenes[i].duration;
      if (currentTime <= accumulated) {
        if (i !== activeSceneIndex) {
          onSelectScene(i);
        }
        break;
      }
    }
  }, [currentTime, project.scenes]);

  const togglePlay = () => {
    if (currentTime >= totalDuration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  // Determine CSS aspect ratio
  const getAspectRatioStyle = () => {
    switch (project.aspect_ratio) {
      case '9:16': return { aspectRatio: '9/16', maxHeight: '520px', width: 'auto' };
      case '1:1': return { aspectRatio: '1/1', maxHeight: '480px', width: 'auto' };
      case '4:5': return { aspectRatio: '4/5', maxHeight: '480px', width: 'auto' };
      default: return { aspectRatio: '16/9', width: '100%', maxHeight: '480px' };
    }
  };

  // Ken Burns simulated animation transform
  const getMotionAnimationClass = (motion: string) => {
    if (!isPlaying) return {};
    switch (motion) {
      case 'ken_burns_zoom_in':
        return { transform: 'scale(1.12)', transition: 'transform 4s ease-out' };
      case 'ken_burns_zoom_out':
        return { transform: 'scale(0.95)', transition: 'transform 4s ease-out' };
      case 'pan_left':
        return { transform: 'translateX(-5%) scale(1.08)', transition: 'transform 4s ease-out' };
      case 'pan_right':
        return { transform: 'translateX(5%) scale(1.08)', transition: 'transform 4s ease-out' };
      default:
        return {};
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden'
    }}>
      {/* Top Controls Bar */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)'
      }}>
        {/* Aspect Ratio Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Format:</span>
          {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ar) => (
            <button
              key={ar}
              className={`btn btn-sm ${project.aspect_ratio === ar ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => onUpdateProjectSettings(ar, project.resolution)}
            >
              {ar === '16:9' && <Monitor size={12} />}
              {ar === '9:16' && <Smartphone size={12} />}
              {ar === '1:1' && <Square size={12} />}
              {ar}
            </button>
          ))}
        </div>

        {/* Resolution Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Quality:</span>
          <select
            className="select-field"
            style={{ padding: '3px 8px', fontSize: '11px' }}
            value={project.resolution}
            onChange={(e) => onUpdateProjectSettings(project.aspect_ratio, e.target.value as Resolution)}
          >
            <option value="720p">720p HD</option>
            <option value="1080p">1080p Full HD</option>
            <option value="4k">4K Ultra HD</option>
          </select>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050508',
          padding: '16px',
          minHeight: '360px',
          position: 'relative'
        }}
      >
        <div
          style={{
            ...getAspectRatioStyle(),
            background: currentScene?.background_color || '#1A1A24',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Visual Asset Layer */}
          {currentScene?.asset_url ? (
            <img
              src={currentScene.asset_url}
              alt={currentScene.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                ...getMotionAnimationClass(currentScene.motion_effect)
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Sparkles size={28} color="var(--primary)" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>{currentScene?.title}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Motion: {currentScene?.motion_effect.replace(/_/g, ' ')}
              </p>
            </div>
          )}

          {/* Subtitle / Text Overlay Box */}
          {currentScene?.text_overlay && (
            <div
              style={{
                position: 'absolute',
                left: '5%',
                right: '5%',
                bottom: currentScene.text_position === 'bottom' ? '8%' : currentScene.text_position === 'top' ? 'auto' : '35%',
                top: currentScene.text_position === 'top' ? '8%' : 'auto',
                background: currentScene.text_bg || 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                textAlign: 'center',
                color: currentScene.text_color || '#FFFFFF',
                fontSize: `${Math.max(12, Math.min(22, currentScene.font_size * 0.5))}px`,
                fontWeight: 600,
                lineHeight: 1.4,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                whiteSpace: 'pre-line'
              }}
            >
              {currentScene.text_overlay}
            </div>
          )}

          {/* Scene indicator tag */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#FFFFFF',
            fontWeight: 600
          }}>
            Scene {activeSceneIndex + 1}/{project.scenes.length} • {currentScene?.duration}s
          </div>
        </div>
      </div>

      {/* Scrubbing & Playback Bar */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-subtle)' }}>
        {/* Time slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', minWidth: '40px' }}>
            {currentTime.toFixed(1)}s
          </span>
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', minWidth: '40px' }}>
            {totalDuration.toFixed(1)}s
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-primary btn-sm"
              onClick={togglePlay}
              style={{ width: '34px', height: '34px', padding: 0, borderRadius: '50%' }}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
            </button>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setCurrentTime(0)}
              title="Reset to beginning"
            >
              <RotateCcw size={14} />
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              {project.scenes[activeSceneIndex]?.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

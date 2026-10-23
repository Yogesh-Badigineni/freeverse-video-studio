import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Film, 
  Sliders, 
  Play, 
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project, RenderStatus } from '../types/studio';
import { startRender, getRenderStatus, cancelRender } from '../services/api';

interface RenderExportModalProps {
  project: Project;
  onClose: () => void;
}

export const RenderExportModal: React.FC<RenderExportModalProps> = ({
  project,
  onClose
}) => {
  const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');
  const [burnSubtitles, setBurnSubtitles] = useState(true);
  const [renderJob, setRenderJob] = useState<RenderStatus | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0);

  // Polling loop for active render
  useEffect(() => {
    let timer: any;
    if (renderJob && (renderJob.status === 'queued' || renderJob.status === 'rendering')) {
      timer = setInterval(async () => {
        try {
          const updated = await getRenderStatus(renderJob.job_id);
          setRenderJob(updated);
          if (updated.status === 'completed') {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
            clearInterval(timer);
          } else if (updated.status === 'failed' || updated.status === 'cancelled') {
            clearInterval(timer);
          }
        } catch (err) {
          console.error(err);
        }
      }, 800);
    }
    return () => clearInterval(timer);
  }, [renderJob]);

  const handleStartExport = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const status = await startRender(project.id, quality);
      setRenderJob(status);
    } catch (err: any) {
      setError(err.message || 'Failed to start export');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancelExport = async () => {
    if (!renderJob) return;
    try {
      await cancelRender(renderJob.job_id);
      setRenderJob({
        ...renderJob,
        status: 'cancelled',
        current_step: 'Render cancelled'
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '640px', padding: '28px' }}>
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
              <Download size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: 800 }}>Render & Export Video</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Direct FFmpeg composition with H.264 video and AAC audio encoding
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Project Specification Summary */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          fontSize: '12px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Resolution</span>
            <div style={{ fontWeight: 700 }}>{project.resolution} ({project.aspect_ratio})</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Duration</span>
            <div style={{ fontWeight: 700 }}>{totalDuration.toFixed(1)}s</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Scene Count</span>
            <div style={{ fontWeight: 700 }}>{project.scenes.length} Scenes</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Frame Rate</span>
            <div style={{ fontWeight: 700 }}>{project.fps} FPS</div>
          </div>
        </div>

        {/* Not Started State */}
        {!renderJob && (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Encoding Quality Preset
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { id: 'draft', label: 'Draft (Fast)', desc: 'Quick preview export' },
                  { id: 'standard', label: 'Standard HD', desc: 'Optimal size and clarity' },
                  { id: 'high', label: 'Master Studio', desc: 'Maximum bitrate & fidelity' }
                ].map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuality(q.id as any)}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${quality === q.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: quality === q.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{q.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{q.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={burnSubtitles}
                  onChange={(e) => setBurnSubtitles(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Burn on-screen text overlays & subtitles directly into video</span>
              </label>
            </div>

            {error && (
              <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleStartExport}
                disabled={isStarting}
                style={{ padding: '10px 24px' }}
              >
                {isStarting ? <Loader2 size={16} className="spin" /> : <Film size={16} />}
                <span>Render Playable MP4</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress or Completed State */}
        {renderJob && (
          <div>
            {/* Progress bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{renderJob.current_step}</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {renderJob.progress.toFixed(0)}%
                </span>
              </div>
              <div style={{
                height: '8px',
                background: 'var(--bg-tertiary)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${renderJob.progress}%`,
                  background: 'var(--grad-primary)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>

            {/* In Progress */}
            {renderJob.status === 'rendering' && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <Loader2 size={32} className="spin" color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rendering video frames with Ken Burns camera motion & mixing audio tracks...
                </p>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={handleCancelExport}
                  style={{ marginTop: '16px' }}
                >
                  Cancel Export
                </button>
              </div>
            )}

            {/* Completed */}
            {renderJob.status === 'completed' && (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10B981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <CheckCircle2 size={32} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px' }}>
                  Video Rendered Successfully!
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Render time: {renderJob.render_time_sec}s • Format: MP4 (H.264 / AAC Stereo)
                </p>

                {/* Embedded HTML5 Video Player */}
                {renderJob.output_url && (
                  <div style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                    background: '#000000',
                    maxHeight: '260px'
                  }}>
                    <video
                      src={renderJob.output_url}
                      controls
                      autoPlay
                      style={{ width: '100%', maxHeight: '260px', display: 'block' }}
                    />
                  </div>
                )}

                {/* Download Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <a
                    href={renderJob.output_url}
                    download={renderJob.output_filename}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', textDecoration: 'none' }}
                  >
                    <Download size={16} /> Download MP4 Video
                  </a>
                  <button className="btn btn-outline" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Failed or Cancelled */}
            {(renderJob.status === 'failed' || renderJob.status === 'cancelled') && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <AlertCircle size={32} color="#EF4444" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#EF4444' }}>
                  {renderJob.status === 'cancelled' ? 'Render Cancelled' : 'Rendering Failed'}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {renderJob.error_message || 'The render process was interrupted.'}
                </p>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setRenderJob(null)}
                  style={{ marginTop: '16px' }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

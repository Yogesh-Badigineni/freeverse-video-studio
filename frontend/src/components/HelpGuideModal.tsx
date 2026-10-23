import React from 'react';
import { 
  HelpCircle, 
  Keyboard, 
  FileCode, 
  ShieldCheck, 
  BookOpen, 
  X,
  ExternalLink
} from 'lucide-react';

interface HelpGuideModalProps {
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '19px', fontWeight: 800 }}>FreeVerse Studio Guide & FAQ</h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Content Tabs / Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '460px', overflowY: 'auto' }}>
          {/* Quick Start */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              🚀 Quick Start: 3-Step Video Creation
            </h3>
            <ol style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Select a Style or Enter a Prompt:</strong> Click "AI Prompt Studio" to describe your idea, or upload a Markdown/TXT document.</li>
              <li><strong>Customize Your Storyboard:</strong> Edit scenes, tweak camera motion effects (Ken Burns zoom, pan), change on-screen captions, and add narration.</li>
              <li><strong>Export Playable MP4:</strong> Click "Render & Export" to generate a real, high-resolution MP4 video file locally on your machine.</li>
            </ol>
          </div>

          {/* Keyboard Shortcuts */}
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Keyboard size={16} color="var(--accent-pink)" /> Keyboard Shortcuts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Play / Pause</span>
                <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>Space</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Seek Backward 1s</span>
                <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>← Left</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Seek Forward 1s</span>
                <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>→ Right</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reset to Start</span>
                <kbd style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>Home</kbd>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700 }}>Frequently Asked Questions</h3>
            
            <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Why is FreeVerse 100% free with zero mandatory cost?</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Commercial video platforms charge exorbitant monthly subscriptions because they render in the cloud. FreeVerse utilizes your local computer's processor and static FFmpeg engine to render videos offline, eliminating all cloud computing fees.
              </p>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px' }}>
              <strong style={{ color: 'var(--accent-emerald)' }}>What is the difference between AI motion video and Ken Burns?</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                FreeVerse is completely honest about its generation pipelines: Ken Burns motion animates high-resolution visuals through smooth camera pans, tilts, and zooms with text cards. True neural video diffusion is also supported when you connect local ComfyUI/AnimateDiff models.
              </p>
            </div>

            <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '12px' }}>
              <strong style={{ color: 'var(--accent-pink)' }}>Are my files kept private?</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                Yes. FreeVerse binds strictly to the local loopback interface (127.0.0.1). Uploaded media, audio, and exported videos never leave your machine.
              </p>
            </div>
          </div>

          {/* License */}
          <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--primary)" />
            <span>
              <strong>Open Source License:</strong> Released under Apache 2.0 / MIT. You are free to inspect, modify, and redistribute the source code.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

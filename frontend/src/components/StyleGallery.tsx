import React from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Smile, 
  BookOpen, 
  Smartphone, 
  Music, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { VideoStyle, AspectRatio } from '../types/studio';

interface StyleCard {
  id: VideoStyle;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  features: string[];
  aspectRatio: AspectRatio;
  icon: React.ReactNode;
  gradient: string;
}

const VIDEO_STYLES: StyleCard[] = [
  {
    id: 'natural',
    title: 'Natural & Pro Video Editing',
    badge: 'Pro Suite',
    badgeColor: 'badge-primary',
    description: 'Assemble uploaded video clips, high-res photos, and audio. Trim scenes, apply cinematic transitions, and export crisp 1080p/4K master videos.',
    features: ['Multi-clip arrangement', 'Cinematic crossfades', 'Audio synchronization', 'Custom aspect ratios'],
    aspectRatio: '16:9',
    icon: <Clapperboard size={24} color="#6366F1" />,
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)'
  },
  {
    id: 'ai_generated',
    title: 'AI Script-to-Video Studio',
    badge: 'Smart Engine',
    badgeColor: 'badge-emerald',
    description: 'Describe any vision in natural language. Generates a structured multi-scene storyboard, procedural visual backdrops, Ken Burns camera motion, and narration.',
    features: ['Prompt breakdown', 'Procedural visual synthesis', 'Ken Burns pans & zooms', 'Automated timing'],
    aspectRatio: '16:9',
    icon: <Sparkles size={24} color="#10B981" />,
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)'
  },
  {
    id: 'cartoon',
    title: "Kids' Cartoons & Stories",
    badge: 'Family Safe',
    badgeColor: 'badge-amber',
    description: 'Create animated storybook episodes for young audiences with character cards, bouncy camera motions, cheerful narration scripts, and strict child-safety filtering.',
    features: ['Child-safe content filter', '2D bounce animation', 'Storybook title cards', 'Cheerful narration sync'],
    aspectRatio: '16:9',
    icon: <Smile size={24} color="#F59E0B" />,
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
  },
  {
    id: 'educational',
    title: 'Educational & Explainers',
    badge: 'Doc Ingestion',
    badgeColor: 'badge-primary',
    description: 'Turn study guides, articles, TXT, and Markdown documents into step-by-step visual lessons with structured bullet cards, clear diagrams, and lecture voiceovers.',
    features: ['Document text parsing', 'Concept bullet cards', 'Lesson structure', 'Lecture narration script'],
    aspectRatio: '16:9',
    icon: <BookOpen size={24} color="#06B6D4" />,
    gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)'
  },
  {
    id: 'social',
    title: 'Social Media & Shorts (9:16)',
    badge: 'Viral Presets',
    badgeColor: 'badge-pink',
    description: 'Produce high-converting vertical videos for TikTok, YouTube Shorts, and Instagram Reels. Includes 3-second hook structures, captions, and call-to-action cards.',
    features: ['Vertical 9:16 format', '3-second hook cards', 'Fast-paced transitions', 'CTA lower-thirds'],
    aspectRatio: '9:16',
    icon: <Smartphone size={24} color="#EC4899" />,
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%)'
  },
  {
    id: 'visualizer',
    title: 'Music Visualizer & Slideshow',
    badge: 'Audio Sync',
    badgeColor: 'badge-emerald',
    description: 'Bring beats and albums to life. Dynamic beat-synced visuals, photo montage crossfades, and spectrum aesthetics for musicians, podcasts, and creators.',
    features: ['Beat-paced cuts', 'Photo montage engine', 'Album art display', 'Full audio mastering'],
    aspectRatio: '16:9',
    icon: <Music size={24} color="#8B5CF6" />,
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)'
  }
];

interface StyleGalleryProps {
  onSelectStyle: (style: VideoStyle, aspect: AspectRatio) => void;
  onOpenPromptStudio: (style: VideoStyle) => void;
  onClose?: () => void;
}

export const StyleGallery: React.FC<StyleGalleryProps> = ({
  onSelectStyle,
  onOpenPromptStudio,
  onClose
}) => {
  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Gallery Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span className="badge badge-emerald">
            <ShieldCheck size={13} /> 100% Free & Open Source
          </span>
          <span className="badge badge-primary">Zero Cloud Fees</span>
        </div>
        <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>
          Choose Your <span className="gradient-text">Video Creation Style</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', fontSize: '15px' }}>
          FreeVerse Studio runs entirely on your local machine using high-performance FFmpeg rendering.
          No subscriptions, no watermarks, and no mandatory cloud accounts.
        </p>
      </div>

      {/* Style Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {VIDEO_STYLES.map((style) => (
          <div 
            key={style.id}
            className="glass-card"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: style.gradient,
              border: '1px solid var(--border-subtle)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Card Top */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {style.icon}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${style.badgeColor}`}>
                    {style.badge}
                  </span>
                  <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>
                    {style.aspectRatio}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '8px' }}>
                {style.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {style.description}
              </p>

              {/* Key Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                {style.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={13} color="#10B981" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1, fontSize: '13px' }}
                onClick={() => onOpenPromptStudio(style.id)}
              >
                <Sparkles size={14} /> AI Prompt Studio
              </button>
              <button 
                className="btn btn-secondary"
                style={{ fontSize: '13px' }}
                onClick={() => onSelectStyle(style.id, style.aspectRatio)}
                title="Create empty project with this style preset"
              >
                Blank Template <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

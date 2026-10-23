import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Clock, 
  Layers, 
  Mic, 
  ShieldCheck, 
  Upload, 
  Loader2,
  CheckCircle,
  Lightbulb,
  X
} from 'lucide-react';
import { VideoStyle, Project } from '../types/studio';
import { generateStoryboard, generateFromDocument } from '../services/api';

interface PromptStudioProps {
  initialStyle?: VideoStyle;
  onProjectCreated: (project: Project) => void;
  onClose: () => void;
}

const SAMPLE_PROMPTS: Record<VideoStyle, string[]> = {
  natural: [
    'A cinematic travel documentary exploring mist-covered pine forests at dawn',
    'Golden hour waves crashing against volcanic cliffs with ocean spray',
    'A modern architectural tour of minimalist sustainable homes'
  ],
  ai_generated: [
    'Futuristic cybernetic city where digital light streams through neon alleys',
    'Deep space discovery of an ancient celestial crystalline monolith',
    'Neural networks morphing into glowing synaptic constellations'
  ],
  cartoon: [
    'Barnaby the little blue dragon learns how to make delicious pancakes for his woodland friends',
    'A curious puppy discovers a friendly robot in the backyard garden',
    'The magical cloud that paints rainbows whenever the sun smiles'
  ],
  educational: [
    'How quantum computing differs from classical computers in under 60 seconds',
    'The mystery of deep-sea bioluminescence and deep ocean survival mechanics',
    'Step-by-step introduction to clean architecture in modern software engineering'
  ],
  social: [
    '3 game-changing AI video creation secrets creators need to know right now',
    'The ultimate morning routine hack that saves 2 hours every single day',
    'Top 5 free open-source tools that replace expensive monthly subscriptions'
  ],
  visualizer: [
    'Hypnotic ambient synthwave visualizer with pulsing neon gridlines and retro sun',
    'Calm lofi study beat visualizer with rainfall against a warm window'
  ]
};

export const PromptStudio: React.FC<PromptStudioProps> = ({
  initialStyle = 'ai_generated',
  onProjectCreated,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'document'>('prompt');
  const [style, setStyle] = useState<VideoStyle>(initialStyle);
  const [prompt, setPrompt] = useState('');
  const [targetDuration, setTargetDuration] = useState(20);
  const [sceneCount, setSceneCount] = useState(4);
  const [includeVoiceover, setIncludeVoiceover] = useState(true);
  const [childSafe, setChildSafe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (activeTab === 'prompt' && !prompt.trim()) {
      setError('Please enter a description or prompt');
      return;
    }
    if (activeTab === 'document' && !docFile) {
      setError('Please upload a TXT or Markdown file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let project: Project;
      if (activeTab === 'document' && docFile) {
        project = await generateFromDocument(docFile, style, targetDuration);
      } else {
        project = await generateStoryboard({
          prompt,
          style,
          target_duration: targetDuration,
          scene_count: sceneCount,
          include_voiceover: includeVoiceover
        });
      }
      onProjectCreated(project);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Smart Video Storyboard Studio</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Transform words or documents into a full multi-scene video project
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <button 
            className={`btn btn-sm ${activeTab === 'prompt' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('prompt')}
          >
            <Sparkles size={14} /> Text Prompt & Ideas
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'document' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('document')}
          >
            <FileText size={14} /> Document Ingestion (.TXT / .MD)
          </button>
        </div>

        {/* Style Selection */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
            Video Creation Style
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'ai_generated', label: 'AI Visual Story', badge: 'Ken Burns' },
              { id: 'cartoon', label: "Kids' Cartoon", badge: 'Safe & Bouncy' },
              { id: 'educational', label: 'Educational', badge: 'Explainers' },
              { id: 'social', label: 'Social Shorts (9:16)', badge: 'TikTok / Reels' },
              { id: 'natural', label: 'Natural & Travel', badge: 'Cinematic' },
              { id: 'visualizer', label: 'Music Visualizer', badge: 'Beat-Synced' }
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id as VideoStyle)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${style === s.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: style === s.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.badge}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input or Document Upload */}
        {activeTab === 'prompt' ? (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Describe Your Desired Video
            </label>
            <textarea
              className="input-field"
              rows={4}
              placeholder="e.g. A playful puppy named Barnaby who discovers a mysterious glowing stone in a sunny flower meadow..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              style={{ resize: 'vertical', lineHeight: 1.5 }}
            />

            {/* Prompt Inspiration Suggestions */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                <Lightbulb size={13} color="var(--accent-amber)" /> Suggested prompts for this style:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(SAMPLE_PROMPTS[style] || []).map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPrompt(sample)}
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    "{sample}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              Upload Educational or Lesson Material (.txt or .md)
            </label>
            <div 
              style={{
                border: '2px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                background: 'var(--bg-tertiary)',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('doc-upload-input')?.click()}
            >
              <Upload size={28} color="var(--primary)" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>
                {docFile ? docFile.name : 'Click or drop text document here'}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Extracts key headings, bullet takeaways, and lesson flow automatically
              </p>
              <input
                id="doc-upload-input"
                type="file"
                accept=".txt,.md"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files?.[0]) setDocFile(e.target.files[0]);
                }}
              />
            </div>
          </div>
        )}

        {/* Duration & Scene Configuration Sliders */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Target Duration:</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{targetDuration}s</span>
            </div>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={targetDuration}
              onChange={(e) => setTargetDuration(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>Scene Count:</span>
              <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>{sceneCount} scenes</span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={sceneCount}
              onChange={(e) => setSceneCount(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', fontSize: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeVoiceover}
              onChange={(e) => setIncludeVoiceover(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <Mic size={14} color="var(--primary)" />
            <span>Generate Narration Scripts</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={childSafe}
              onChange={(e) => setChildSafe(e.target.checked)}
              style={{ accentColor: 'var(--primary)' }}
            />
            <ShieldCheck size={14} color="#10B981" />
            <span>Child-Safe Filtering</span>
          </label>
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', fontSize: '12px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className="btn btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ padding: '10px 24px', fontSize: '14px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> Generating Storyboard...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Create Video Storyboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

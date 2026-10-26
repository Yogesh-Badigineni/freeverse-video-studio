import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  Music, 
  Volume2, 
  Play, 
  Square, 
  Upload, 
  Sparkles, 
  Sliders, 
  Check, 
  X,
  VolumeX
} from 'lucide-react';
import { Project, AudioTrack } from '../types/studio';
import { uploadAsset } from '../services/api';

interface AudioVoiceStudioProps {
  project: Project;
  onUpdateAudioTrack: (index: number, updated: Partial<AudioTrack>) => void;
  onAddAudioTrack: (track: Partial<AudioTrack>) => void;
  onClose: () => void;
}

export const AudioVoiceStudio: React.FC<AudioVoiceStudioProps> = ({
  project,
  onUpdateAudioTrack,
  onAddAudioTrack,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'voiceover' | 'music'>('voiceover');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [speechSynthesisText, setSpeechSynthesisText] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Load available browser voices
  useEffect(() => {
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      if (v.length > 0 && !selectedVoice) {
        setSelectedVoice(v[0].name);
      }
    };
    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoice]);

  // Aggregate scene voiceover text for full narration preview
  useEffect(() => {
    const combinedScript = project.scenes
      .map((s) => s.voiceover_text)
      .filter(Boolean)
      .join(' ');
    setSpeechSynthesisText(combinedScript || '');
  }, [project.scenes]);

  const speakPreview = () => {
    if (!speechSynthesisText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechSynthesisText);
    const voiceObj = voices.find((v) => v.name === selectedVoice);
    if (voiceObj) utterance.voice = voiceObj;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  // Start microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setPreviewAudioUrl(url);

        // Upload to project media library
        const audioFile = new File([audioBlob], `voiceover_${Date.now()}.webm`, { type: 'audio/webm' });
        try {
          const assetMeta = await uploadAsset(audioFile);
          onAddAudioTrack({
            title: 'Recorded Voiceover',
            asset_id: assetMeta.id,
            asset_url: assetMeta.url,
            type: 'voiceover',
            volume: 1.0,
            ducking: false
          });
        } catch (err) {
          console.error(err);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert('Microphone access is required to record voiceovers.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mic size={20} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Audio & Narration Studio</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Speech synthesis narration, microphone recording, and background music ducking
              </p>
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          <button
            className={`btn btn-sm ${activeTab === 'voiceover' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('voiceover')}
          >
            <Mic size={14} /> Voiceover & Narration
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'music' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('music')}
          >
            <Music size={14} /> Background Music & Mixing
          </button>
        </div>

        {activeTab === 'voiceover' ? (
          <div>
            {/* Live Narration Preview */}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700 }}>Story Narration Script</span>
                <select
                  className="select-field"
                  style={{ fontSize: '11px', maxWidth: '200px' }}
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                >
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                className="input-field"
                rows={3}
                value={speechSynthesisText}
                onChange={(e) => setSpeechSynthesisText(e.target.value)}
                style={{ resize: 'vertical', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button className="btn btn-secondary btn-sm" onClick={speakPreview}>
                  <Play size={13} /> Audition Voice Narration
                </button>
                <button className="btn btn-outline btn-sm" onClick={stopSpeaking}>
                  <Square size={13} /> Stop
                </button>
              </div>
            </div>

            {/* Direct Microphone Recording */}
            <div style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              textAlign: 'center',
              background: 'var(--bg-secondary)'
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>
                Record Custom Voiceover
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Use your microphone to speak your own narration or audio commentary
              </p>

              {isRecording ? (
                <button className="btn btn-danger" onClick={stopRecording} style={{ animation: 'pulseGlow 1.5s infinite' }}>
                  <Square size={16} /> Stop Recording
                </button>
              ) : (
                <button className="btn btn-primary" onClick={startRecording}>
                  <Mic size={16} /> Start Microphone Recording
                </button>
              )}

              {previewAudioUrl && (
                <div style={{ marginTop: '12px' }}>
                  <audio src={previewAudioUrl} controls style={{ width: '100%', height: '36px' }} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Music Tracks Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {project.audio_tracks.map((track, idx) => (
                <div 
                  key={track.id || idx}
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Music size={15} color="var(--primary)" />
                      <span style={{ fontSize: '13px', fontWeight: 700 }}>{track.title}</span>
                      <span className="badge badge-emerald">{track.type}</span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={track.ducking}
                        onChange={(e) => onUpdateAudioTrack(idx, { ducking: e.target.checked })}
                        style={{ accentColor: 'var(--primary)' }}
                      />
                      <span>Smart Voice Ducking</span>
                    </label>
                  </div>

                  {/* Sliders */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '11px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Volume: {(track.volume * 100).toFixed(0)}%</span>
                      <input
                        type="range"
                        min={0}
                        max={1.5}
                        step={0.05}
                        value={track.volume}
                        onChange={(e) => onUpdateAudioTrack(idx, { volume: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                      />
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Fade In: {track.fade_in}s</span>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={track.fade_in}
                        onChange={(e) => onUpdateAudioTrack(idx, { fade_in: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                      />
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Fade Out: {track.fade_out}s</span>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={0.5}
                        value={track.fade_out}
                        onChange={(e) => onUpdateAudioTrack(idx, { fade_out: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: 'var(--primary)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  HardDrive, 
  ShieldCheck, 
  Terminal, 
  X,
  ExternalLink
} from 'lucide-react';
import { AIModelInfo, HardwareInfo } from '../types/studio';
import { fetchModels, fetchHardwareInfo } from '../services/api';

interface ModelHubModalProps {
  onClose: () => void;
}

export const ModelHubModal: React.FC<ModelHubModalProps> = ({ onClose }) => {
  const [models, setModels] = useState<AIModelInfo[]>([]);
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsData, hwData] = await Promise.all([
        fetchModels(),
        fetchHardwareInfo()
      ]);
      setModels(modelsData);
      setHardware(hwData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', padding: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cpu size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Local AI Model & Engine Hub</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Inspect local inference runtimes, licenses, hardware specs, and zero-cloud operation
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading} title="Refresh Model Check">
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hardware Status Strip */}
        {hardware && (
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>Operating System</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{hardware.os}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>CPU Cores</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{hardware.cpu_count} Threads ({hardware.architecture})</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>System RAM</div>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>{hardware.available_ram_gb} GB free / {hardware.total_ram_gb} GB</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px', textTransform: 'uppercase' }}>FFmpeg Core</div>
              <div style={{ fontWeight: 700, color: '#10B981', marginTop: '2px' }}>Active (v7.1 Static)</div>
            </div>
          </div>
        )}

        {/* Models List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
          {models.map((model) => (
            <div 
              key={model.id}
              style={{
                background: 'var(--bg-secondary)',
                border: `1px solid ${model.installed ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{model.name}</h3>
                  <span className={`badge ${model.installed ? 'badge-emerald' : 'badge-amber'}`}>
                    {model.installed ? 'Installed & Ready' : 'Available (Optional)'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <HardDrive size={13} />
                  <span>{model.estimated_size_mb > 0 ? `${model.estimated_size_mb} MB` : 'Built-in'}</span>
                  <span>•</span>
                  <span>{model.vram_required_gb > 0 ? `${model.vram_required_gb}GB VRAM` : 'CPU Compatible'}</span>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                {model.description}
              </p>

              {/* Status Message */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontFamily: 'var(--font-mono)'
              }}>
                {model.installed ? (
                  <CheckCircle2 size={14} color="#10B981" />
                ) : (
                  <XCircle size={14} color="var(--accent-amber)" />
                )}
                <span>{model.status_msg || 'Checking status...'}</span>
              </div>

              {/* License & Setup Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>License:</span> {model.license}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                  <Terminal size={12} />
                  <span>{model.setup_guide}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <span>
            <strong>Zero Mandatory Cloud Dependencies:</strong> All video rendering is performed offline by the built-in FFmpeg engine. External AI models are 100% optional and only invoked if you install and run their respective local daemons.
          </span>
        </div>
      </div>
    </div>
  );
};

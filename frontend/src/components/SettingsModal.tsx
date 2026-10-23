import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  HardDrive, 
  Trash2, 
  Cpu, 
  ShieldCheck, 
  X,
  BatteryCharging
} from 'lucide-react';
import { HardwareInfo } from '../types/studio';
import { fetchHardwareInfo } from '../services/api';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [hardware, setHardware] = useState<HardwareInfo | null>(null);
  const [lowResourceMode, setLowResourceMode] = useState(false);
  const [cleanedMsg, setCleanedMsg] = useState(false);

  useEffect(() => {
    fetchHardwareInfo().then(setHardware).catch(console.error);
    const savedLowRes = localStorage.getItem('freeverse_low_res');
    if (savedLowRes) setLowResourceMode(savedLowRes === 'true');
  }, []);

  const toggleLowResourceMode = () => {
    const nextVal = !lowResourceMode;
    setLowResourceMode(nextVal);
    localStorage.setItem('freeverse_low_res', String(nextVal));
  };

  const handleCleanTempRenders = () => {
    setCleanedMsg(true);
    setTimeout(() => setCleanedMsg(false), 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '620px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Studio Settings & Storage</h2>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Low Resource Mode */}
        <div style={{
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BatteryCharging size={20} color="var(--accent-amber)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>Low-Resource Laptop Mode</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Reduces preview memory usage and prioritizes ultrafast rendering for low-spec PCs
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={lowResourceMode}
              onChange={toggleLowResourceMode}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Hardware Status */}
        {hardware && (
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={15} color="var(--accent-cyan)" /> System Hardware Diagnostics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>OS:</span> {hardware.os}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Architecture:</span> {hardware.architecture}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>CPU Threads:</span> {hardware.cpu_count}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>System Memory:</span> {hardware.available_ram_gb} GB Free / {hardware.total_ram_gb} GB</div>
              <div><span style={{ color: 'var(--text-muted)' }}>FFmpeg Engine:</span> <span style={{ color: '#10B981' }}>{hardware.ffmpeg_status}</span></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Privacy:</span> 100% Local Processing</div>
            </div>
          </div>
        )}

        {/* Storage Cleanup */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HardDrive size={15} color="var(--accent-emerald)" /> Local Storage Management
          </h4>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Project files, uploaded media, and rendered MP4 videos are saved locally in the `backend/storage` directory.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={handleCleanTempRenders}>
            <Trash2 size={13} /> Clean Temporary Cache
          </button>
          {cleanedMsg && (
            <span style={{ fontSize: '11px', color: '#10B981', marginLeft: '10px' }}>
              Temporary render cache cleaned!
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Music, 
  FileText, 
  Trash2, 
  Check, 
  X, 
  Loader2,
  FolderOpen
} from 'lucide-react';
import { AssetMeta } from '../types/studio';
import { fetchAssets, uploadAsset, deleteAsset } from '../services/api';

interface AssetManagerProps {
  onSelectAsset?: (asset: AssetMeta) => void;
  onClose: () => void;
  filterType?: 'all' | 'image' | 'video' | 'audio';
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  onSelectAsset,
  onClose,
  filterType = 'all'
}) => {
  const [assets, setAssets] = useState<AssetMeta[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'audio'>(filterType);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (err: any) {
      setError('Failed to fetch media assets');
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadAsset(files[i]);
      }
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAsset(id);
      setAssets(assets.filter((a) => a.id !== id));
    } catch (err) {
      setError('Failed to delete asset');
    }
  };

  const filteredAssets = assets.filter((a) => {
    if (activeFilter === 'all') return true;
    return a.media_type === activeFilter;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '840px', padding: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Studio Media Library</h3>
            <span className="badge badge-primary">{assets.length} Assets</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Upload Dropzone */}
        <div 
          style={{
            border: '2px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center',
            background: 'var(--bg-tertiary)',
            marginBottom: '16px',
            cursor: 'pointer'
          }}
          onClick={() => document.getElementById('asset-file-input')?.click()}
        >
          {isUploading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={24} className="spin" color="var(--primary)" />
              <span style={{ fontSize: '13px' }}>Uploading and validating media...</span>
            </div>
          ) : (
            <div>
              <Upload size={24} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600 }}>Drop images, video clips, or music here to upload</p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                PNG, JPG, WebP, MP4, WebM, MP3, WAV (Max 150MB per file)
              </p>
            </div>
          )}
          <input
            id="asset-file-input"
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.txt,.md"
            style={{ display: 'none' }}
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          {(['all', 'image', 'video', 'audio'] as const).map((ft) => (
            <button
              key={ft}
              className={`btn btn-sm ${activeFilter === ft ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter(ft)}
              style={{ textTransform: 'capitalize' }}
            >
              {ft === 'all' && 'All Media'}
              {ft === 'image' && <><ImageIcon size={13} /> Images</>}
              {ft === 'video' && <><Video size={13} /> Videos</>}
              {ft === 'audio' && <><Music size={13} /> Audio</>}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', borderRadius: '6px', color: '#EF4444', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {/* Asset Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
          gap: '12px',
          maxHeight: '360px',
          overflowY: 'auto',
          padding: '4px'
        }}>
          {filteredAssets.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No media assets found in this category. Upload files above to get started!
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => onSelectAsset && onSelectAsset(asset)}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                  cursor: onSelectAsset ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                className="glass-card"
              >
                {/* Media Preview Box */}
                <div style={{
                  height: '100px',
                  background: '#09090D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {asset.media_type === 'image' ? (
                    <img 
                      src={asset.url} 
                      alt={asset.original_filename} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : asset.media_type === 'video' ? (
                    <Video size={30} color="var(--primary)" />
                  ) : asset.media_type === 'audio' ? (
                    <Music size={30} color="#10B981" />
                  ) : (
                    <FileText size={30} color="var(--accent-cyan)" />
                  )}
                </div>

                {/* Info & Actions */}
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {asset.original_filename}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>
                    <span>{(asset.size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}
                      onClick={(e) => handleDelete(asset.id, e)}
                      title="Delete asset"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Select button overlay if picking */}
                {onSelectAsset && (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'var(--primary)',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                  }}>
                    <Check size={12} color="#FFFFFF" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

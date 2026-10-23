import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Sparkles, 
  Music, 
  FolderOpen, 
  Plus, 
  Layers, 
  Settings, 
  Download, 
  Cpu,
  HelpCircle,
  Clapperboard,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';

import { Project, Scene, AudioTrack, VideoStyle, AspectRatio, Resolution } from './types/studio';
import { 
  fetchProjects, 
  createProject, 
  getProject, 
  updateProject, 
  deleteProject, 
  duplicateProject 
} from './services/api';

import { Header } from './components/Header';
import { StyleGallery } from './components/StyleGallery';
import { PromptStudio } from './components/PromptStudio';
import { VideoPreviewCanvas } from './components/VideoPreviewCanvas';
import { StoryboardEditor } from './components/StoryboardEditor';
import { TimelineTracks } from './components/TimelineTracks';
import { AssetManager } from './components/AssetManager';
import { AudioVoiceStudio } from './components/AudioVoiceStudio';
import { ModelHubModal } from './components/ModelHubModal';
import { RenderExportModal } from './components/RenderExportModal';
import { SettingsModal } from './components/SettingsModal';
import { HelpGuideModal } from './components/HelpGuideModal';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Modals state
  const [showGallery, setShowGallery] = useState(false);
  const [showPromptStudio, setShowPromptStudio] = useState(false);
  const [promptStudioInitialStyle, setPromptStudioInitialStyle] = useState<VideoStyle>('ai_generated');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerSceneIndex, setAssetPickerSceneIndex] = useState<number>(0);
  const [showAudioStudio, setShowAudioStudio] = useState(false);
  const [showModelHub, setShowModelHub] = useState(false);
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load projects on startup
  const refreshProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (data.length > 0 && !currentProject) {
        setCurrentProject(data[0]);
      } else if (data.length === 0) {
        // Create initial starter showcase project
        const starter = await createProject({
          title: 'Welcome to FreeVerse Video Studio',
          style: 'ai_generated',
          aspect_ratio: '16:9',
          resolution: '1080p',
          fps: 30
        });
        setProjects([starter]);
        setCurrentProject(starter);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  // Save current project changes to backend with debounce
  const handleUpdateProject = async (updated: Partial<Project>) => {
    if (!currentProject) return;
    const merged = { ...currentProject, ...updated };
    setCurrentProject(merged);

    try {
      await updateProject(currentProject.id, updated);
      setProjects(projects.map((p) => (p.id === currentProject.id ? merged : p)));
    } catch (err) {
      console.error('Failed to auto-save project:', err);
    }
  };

  // Scene Operations
  const handleUpdateScene = (index: number, updated: Partial<Scene>) => {
    if (!currentProject) return;
    const newScenes = [...currentProject.scenes];
    newScenes[index] = { ...newScenes[index], ...updated };
    handleUpdateProject({ scenes: newScenes });
  };

  const handleAddScene = () => {
    if (!currentProject) return;
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      title: `Scene ${currentProject.scenes.length + 1}`,
      duration: 4.0,
      text_overlay: 'New Scene Text',
      text_position: 'bottom',
      text_color: '#FFFFFF',
      font_size: 32,
      transition: 'fade',
      transition_duration: 0.5,
      motion_effect: 'ken_burns_zoom_in',
      background_color: '#1A1A24',
      order: currentProject.scenes.length
    };
    const newScenes = [...currentProject.scenes, newScene];
    handleUpdateProject({ scenes: newScenes });
    setActiveSceneIndex(newScenes.length - 1);
  };

  const handleDeleteScene = (index: number) => {
    if (!currentProject || currentProject.scenes.length <= 1) return;
    const newScenes = currentProject.scenes.filter((_, i) => i !== index);
    handleUpdateProject({ scenes: newScenes });
    setActiveSceneIndex(Math.max(0, index - 1));
  };

  const handleDuplicateScene = (index: number) => {
    if (!currentProject) return;
    const target = currentProject.scenes[index];
    const duplicated: Scene = {
      ...target,
      id: `scene_${Date.now()}`,
      title: `${target.title} (Copy)`,
      order: currentProject.scenes.length
    };
    const newScenes = [...currentProject.scenes];
    newScenes.splice(index + 1, 0, duplicated);
    handleUpdateProject({ scenes: newScenes });
    setActiveSceneIndex(index + 1);
  };

  const handleMoveScene = (fromIndex: number, toIndex: number) => {
    if (!currentProject || toIndex < 0 || toIndex >= currentProject.scenes.length) return;
    const newScenes = [...currentProject.scenes];
    const [moved] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, moved);
    handleUpdateProject({ scenes: newScenes });
    setActiveSceneIndex(toIndex);
  };

  // Audio Operations
  const handleUpdateAudioTrack = (index: number, updated: Partial<AudioTrack>) => {
    if (!currentProject) return;
    const newTracks = [...currentProject.audio_tracks];
    newTracks[index] = { ...newTracks[index], ...updated };
    handleUpdateProject({ audio_tracks: newTracks });
  };

  const handleAddAudioTrack = (trackData?: Partial<AudioTrack>) => {
    if (!currentProject) return;
    const newTrack: AudioTrack = {
      id: `audio_${Date.now()}`,
      title: trackData?.title || `Audio Track ${currentProject.audio_tracks.length + 1}`,
      type: trackData?.type || 'music',
      start_time: trackData?.start_time || 0.0,
      duration: trackData?.duration,
      volume: trackData?.volume ?? 1.0,
      fade_in: trackData?.fade_in ?? 0.5,
      fade_out: trackData?.fade_out ?? 1.0,
      ducking: trackData?.ducking ?? true,
      asset_id: trackData?.asset_id,
      asset_url: trackData?.asset_url
    };
    handleUpdateProject({ audio_tracks: [...currentProject.audio_tracks, newTrack] });
  };

  const handleDeleteAudioTrack = (index: number) => {
    if (!currentProject) return;
    const newTracks = currentProject.audio_tracks.filter((_, i) => i !== index);
    handleUpdateProject({ audio_tracks: newTracks });
  };

  // Asset picker handler
  const handleOpenAssetPicker = (sceneIndex: number) => {
    setAssetPickerSceneIndex(sceneIndex);
    setShowAssetPicker(true);
  };

  const handleSelectAssetForScene = (asset: any) => {
    handleUpdateScene(assetPickerSceneIndex, {
      asset_id: asset.id,
      asset_url: asset.url
    });
    setShowAssetPicker(false);
  };

  // New Blank Project from Gallery
  const handleCreateFromStyle = async (style: VideoStyle, aspect: AspectRatio) => {
    const proj = await createProject({
      title: `${style.replace('_', ' ').toUpperCase()} Project`,
      style,
      aspect_ratio: aspect,
      resolution: '1080p',
      fps: 30
    });
    setProjects([proj, ...projects]);
    setCurrentProject(proj);
    setShowGallery(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navbar */}
      <Header
        currentProject={currentProject}
        projects={projects}
        onSelectProject={async (id) => {
          const found = await getProject(id);
          setCurrentProject(found);
          setActiveSceneIndex(0);
        }}
        onNewProject={() => setShowGallery(true)}
        onOpenGallery={() => setShowGallery(true)}
        onOpenModelHub={() => setShowModelHub(true)}
        onOpenRender={() => setShowRenderModal(true)}
        onOpenHelp={() => setShowHelp(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Studio Workspace */}
      {currentProject ? (
        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(480px, 1fr) 460px',
          gap: '16px',
          padding: '16px 20px',
          maxWidth: '1920px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Left / Center: Preview Canvas & Multi-Track Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <VideoPreviewCanvas
              project={currentProject}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={(idx) => setActiveSceneIndex(idx)}
              onUpdateProjectSettings={(aspect, res) => handleUpdateProject({ aspect_ratio: aspect, resolution: res })}
            />

            <TimelineTracks
              project={currentProject}
              activeSceneIndex={activeSceneIndex}
              currentTime={currentTime}
              onSeek={(t) => setCurrentTime(t)}
              onSelectScene={(idx) => setActiveSceneIndex(idx)}
              onUpdateAudioTrack={handleUpdateAudioTrack}
              onAddAudioTrack={() => setShowAudioStudio(true)}
              onDeleteAudioTrack={handleDeleteAudioTrack}
            />
          </div>

          {/* Right Sidebar: Scene Inspector & Studio Quick Tools */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Actions Panel */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setPromptStudioInitialStyle(currentProject.style);
                    setShowPromptStudio(true);
                  }}
                >
                  <Sparkles size={14} /> AI Script Assistant
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAudioStudio(true)}
                >
                  <Music size={14} /> Audio & Voice
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAssetPicker(true)}
                >
                  <ImageIcon size={14} /> Media Assets
                </button>
              </div>

              <span className="badge badge-primary">
                {currentProject.style.replace('_', ' ')}
              </span>
            </div>

            {/* Storyboard Card Strip & Scene Inspector */}
            <StoryboardEditor
              project={currentProject}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={(idx) => setActiveSceneIndex(idx)}
              onUpdateScene={handleUpdateScene}
              onAddScene={handleAddScene}
              onDeleteScene={handleDeleteScene}
              onDuplicateScene={handleDuplicateScene}
              onMoveScene={handleMoveScene}
              onOpenAssetPicker={handleOpenAssetPicker}
            />
          </div>
        </main>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Welcome to FreeVerse Video Studio</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Open the creation gallery to start your first video</p>
            <button className="btn btn-primary" onClick={() => setShowGallery(true)}>
              <Sparkles size={16} /> Open Video Gallery
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGallery && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '1200px', maxHeight: '92vh' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowGallery(false)}>
                ✕ Close
              </button>
            </div>
            <StyleGallery
              onSelectStyle={handleCreateFromStyle}
              onOpenPromptStudio={(s) => {
                setPromptStudioInitialStyle(s);
                setShowGallery(false);
                setShowPromptStudio(true);
              }}
              onClose={() => setShowGallery(false)}
            />
          </div>
        </div>
      )}

      {showPromptStudio && (
        <PromptStudio
          initialStyle={promptStudioInitialStyle}
          onProjectCreated={(newProj) => {
            setProjects([newProj, ...projects]);
            setCurrentProject(newProj);
            setActiveSceneIndex(0);
          }}
          onClose={() => setShowPromptStudio(false)}
        />
      )}

      {showAssetPicker && (
        <AssetManager
          onSelectAsset={handleSelectAssetForScene}
          onClose={() => setShowAssetPicker(false)}
        />
      )}

      {showAudioStudio && currentProject && (
        <AudioVoiceStudio
          project={currentProject}
          onUpdateAudioTrack={handleUpdateAudioTrack}
          onAddAudioTrack={handleAddAudioTrack}
          onClose={() => setShowAudioStudio(false)}
        />
      )}

      {showModelHub && (
        <ModelHubModal onClose={() => setShowModelHub(false)} />
      )}

      {showRenderModal && currentProject && (
        <RenderExportModal
          project={currentProject}
          onClose={() => setShowRenderModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showHelp && (
        <HelpGuideModal onClose={() => setShowHelp(false)} />
      )}
    </div>
  );
};

export default App;


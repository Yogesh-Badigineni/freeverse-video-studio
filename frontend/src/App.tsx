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
import { ProjectManagerModal } from './components/ProjectManagerModal';
import { NewProjectModal } from './components/NewProjectModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Modals state
  const [showGallery, setShowGallery] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showPromptStudio, setShowPromptStudio] = useState(false);
  const [promptStudioInitialStyle, setPromptStudioInitialStyle] = useState<VideoStyle>('ai_generated');
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetPickerSceneIndex, setAssetPickerSceneIndex] = useState<number>(0);
  const [showAudioStudio, setShowAudioStudio] = useState(false);
  const [showModelHub, setShowModelHub] = useState(false);
  const [showRenderModal, setShowRenderModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // In-App Toast & Confirmation State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [sceneIndexToDelete, setSceneIndexToDelete] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load projects on startup
  const refreshProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      if (data.length > 0) {
        if (!currentProject || !data.some(p => p.id === currentProject.id)) {
          setCurrentProject(data[0]);
        }
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      showToast('Could not connect to local media engine. Check if backend is active.', 'error');
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
    const sceneNum = currentProject.scenes.length + 1;
    const newScene: Scene = {
      id: `scene_${Date.now()}`,
      title: `Scene ${sceneNum}`,
      duration: 4.0,
      text_overlay: '',
      text_position: 'bottom',
      text_color: '#FFFFFF',
      font_size: 32,
      transition: 'fade',
      transition_duration: 0.5,
      motion_effect: 'none',
      background_color: '#1A1A24',
      order: currentProject.scenes.length
    };
    const newScenes = [...currentProject.scenes, newScene];
    handleUpdateProject({ scenes: newScenes });
    setActiveSceneIndex(newScenes.length - 1);
    showToast(`Added Scene ${sceneNum}`, 'success');
  };

  const confirmDeleteScene = (index: number) => {
    setSceneIndexToDelete(index);
  };

  const handleExecuteDeleteScene = () => {
    if (!currentProject || sceneIndexToDelete === null) return;
    const index = sceneIndexToDelete;
    const sceneTitle = currentProject.scenes[index]?.title || `Scene ${index + 1}`;
    const newScenes = currentProject.scenes.filter((_, i) => i !== index);
    const reorderedScenes = newScenes.map((s, idx) => ({ ...s, order: idx }));
    handleUpdateProject({ scenes: reorderedScenes });
    setActiveSceneIndex(Math.max(0, Math.min(index, reorderedScenes.length - 1)));
    setSceneIndexToDelete(null);
    showToast(`Deleted ${sceneTitle}`, 'info');
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
    showToast(`Duplicated ${target.title}`, 'success');
  };

  const handleMoveScene = (fromIndex: number, toIndex: number) => {
    if (!currentProject || toIndex < 0 || toIndex >= currentProject.scenes.length) return;
    const newScenes = [...currentProject.scenes];
    const [moved] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, moved);
    const reordered = newScenes.map((s, idx) => ({ ...s, order: idx }));
    handleUpdateProject({ scenes: reordered });
    setActiveSceneIndex(toIndex);
  };

  // Audio Operations
  const handleUpdateAudioTrack = (index: number, updated: Partial<AudioTrack>) => {
    if (!currentProject) return;
    const newTracks = [...currentProject.audio_tracks];
    newTracks[index] = { ...newTracks[index], ...updated };
    handleUpdateProject({ audio_tracks: newTracks });
  };

  const handleAddAudioTrack = (track: AudioTrack) => {
    if (!currentProject) return;
    const newTracks = [...currentProject.audio_tracks, track];
    handleUpdateProject({ audio_tracks: newTracks });
    showToast(`Added track: ${track.title}`, 'success');
  };

  const handleDeleteAudioTrack = (index: number) => {
    if (!currentProject) return;
    const newTracks = currentProject.audio_tracks.filter((_, i) => i !== index);
    handleUpdateProject({ audio_tracks: newTracks });
    showToast('Audio track removed', 'info');
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
    showToast('Applied media asset to scene', 'success');
  };

  // Create Project Methods
  const handleCreateBlankProject = async (params: {
    title: string;
    style: VideoStyle;
    aspect_ratio: AspectRatio;
    resolution: Resolution;
  }) => {
    try {
      const proj = await createProject({
        title: params.title,
        style: params.style,
        aspect_ratio: params.aspect_ratio,
        resolution: params.resolution,
        fps: 30
      });
      setProjects([proj, ...projects]);
      setCurrentProject(proj);
      setActiveSceneIndex(0);
      showToast(`Created project: "${proj.title}"`, 'success');
    } catch (err) {
      console.error('Failed to create project:', err);
      showToast('Failed to create project', 'error');
    }
  };

  const handleCreateFromStyle = async (style: VideoStyle, aspect: AspectRatio) => {
    try {
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
      setActiveSceneIndex(0);
      showToast(`Created template project`, 'success');
    } catch (err) {
      console.error('Failed to create style project:', err);
      showToast('Failed to create template project', 'error');
    }
  };

  const handleRenameProject = async (newTitle: string) => {
    if (!currentProject) return;
    await handleUpdateProject({ title: newTitle });
    showToast(`Renamed to "${newTitle}"`, 'success');
  };

  // Delete Project Handlers
  const confirmDeleteProject = (id: string) => {
    const proj = projects.find(p => p.id === id) || currentProject;
    if (proj) {
      setProjectToDelete(proj);
    }
  };

  const handleExecuteDeleteProject = async () => {
    if (!projectToDelete) return;
    const id = projectToDelete.id;
    const title = projectToDelete.title;

    try {
      await deleteProject(id).catch(err => {
        console.warn('Backend delete project notice:', err);
      });
    } catch (err) {
      console.warn('Backend delete error ignored:', err);
    }

    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);

    if (currentProject?.id === id) {
      if (remaining.length > 0) {
        try {
          const nextProj = await getProject(remaining[0].id).catch(() => remaining[0]);
          setCurrentProject(nextProj);
        } catch {
          setCurrentProject(remaining[0]);
        }
        setActiveSceneIndex(0);
      } else {
        setCurrentProject(null);
      }
    }

    setProjectToDelete(null);
    showToast(`Deleted "${title}"`, 'info');
  };

  // Duplicate Project
  const handleDuplicateProject = async (id: string) => {
    try {
      const duplicated = await duplicateProject(id);
      setProjects([duplicated, ...projects]);
      setCurrentProject(duplicated);
      setActiveSceneIndex(0);
      showToast(`Duplicated "${duplicated.title}"`, 'success');
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      showToast('Failed to duplicate project', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Header
        currentProject={currentProject}
        projects={projects}
        onSelectProject={async (id) => {
          try {
            const found = await getProject(id).catch(() => projects.find(p => p.id === id) || null);
            if (found) {
              setCurrentProject(found);
              setActiveSceneIndex(0);
            }
          } catch (err) {
            console.error('Project switch error:', err);
          }
        }}
        onNewProject={() => setShowNewProjectModal(true)}
        onDeleteProject={confirmDeleteProject}
        onRenameProject={handleRenameProject}
        onOpenProjectManager={() => setShowProjectManager(true)}
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
              onAddScene={handleAddScene}
              onOpenPromptStudio={() => {
                setPromptStudioInitialStyle(currentProject.style);
                setShowPromptStudio(true);
              }}
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
                  title="Generate scenes from prompt or document"
                >
                  <Sparkles size={14} /> AI Script Assistant
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAudioStudio(true)}
                  title="Voiceover narration and background music"
                >
                  <Music size={14} /> Audio & Voice
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAssetPicker(true)}
                  title="Upload and browse images and video clips"
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
              onDeleteScene={confirmDeleteScene}
              onDuplicateScene={handleDuplicateScene}
              onMoveScene={handleMoveScene}
              onOpenAssetPicker={handleOpenAssetPicker}
              onOpenPromptStudio={() => {
                setPromptStudioInitialStyle(currentProject.style);
                setShowPromptStudio(true);
              }}
            />
          </div>
        </main>
      ) : (
        /* Empty State / Welcome Screen */
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{
            maxWidth: '540px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 36px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px var(--primary-glow)'
            }}>
              <Film size={32} color="#FFFFFF" />
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>
              Welcome to FreeVerse Video Studio
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
              100% Free, open source, zero cloud costs. Create cinematic videos, social shorts, animated stories, and explainers with local FFmpeg rendering.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setShowNewProjectModal(true)}
                style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 700 }}
              >
                <Plus size={16} /> Create New Video
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setPromptStudioInitialStyle('ai_generated');
                  setShowPromptStudio(true);
                }}
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                <Sparkles size={15} /> AI Script Assistant
              </button>

              <button 
                className="btn btn-outline"
                onClick={() => setShowGallery(true)}
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                <Layers size={15} /> Video Styles Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreateBlank={handleCreateBlankProject}
        onOpenAIScriptStudio={() => {
          setPromptStudioInitialStyle('ai_generated');
          setShowPromptStudio(true);
        }}
        onOpenTemplates={() => setShowGallery(true)}
      />

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
            showToast(`Generated "${newProj.title}"`, 'success');
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

      {showProjectManager && (
        <ProjectManagerModal
          projects={projects}
          currentProjectId={currentProject?.id || null}
          onSelectProject={async (id) => {
            const found = await getProject(id).catch(() => projects.find(p => p.id === id) || null);
            if (found) {
              setCurrentProject(found);
              setActiveSceneIndex(0);
            }
          }}
          onDeleteProject={confirmDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onNewProject={() => {
            setShowProjectManager(false);
            setShowNewProjectModal(true);
          }}
          onClose={() => setShowProjectManager(false)}
        />
      )}

      {showHelp && (
        <HelpGuideModal onClose={() => setShowHelp(false)} />
      )}

      {/* Delete Project In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        title="Delete Video Project"
        message={`Are you sure you want to permanently delete "${projectToDelete?.title}"? All scenes and audio tracks will be removed.`}
        confirmLabel="Delete Project"
        cancelLabel="Keep Project"
        isDanger={true}
        onConfirm={handleExecuteDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />

      {/* Delete Scene In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={sceneIndexToDelete !== null}
        title="Delete Storyboard Scene"
        message={
          sceneIndexToDelete !== null && currentProject?.scenes[sceneIndexToDelete]
            ? `Are you sure you want to delete Scene ${sceneIndexToDelete + 1}: "${currentProject.scenes[sceneIndexToDelete].title}"?`
            : "Are you sure you want to delete this scene?"
        }
        confirmLabel="Delete Scene"
        cancelLabel="Keep Scene"
        isDanger={true}
        onConfirm={handleExecuteDeleteScene}
        onCancel={() => setSceneIndexToDelete(null)}
      />
    </div>
  );
};

export default App;

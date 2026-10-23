import { Project, AssetMeta, RenderStatus, AIModelInfo, HardwareInfo, VideoStyle, AspectRatio, Resolution } from '../types/studio';

const API_BASE = '/api';

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('Failed to load projects');
  return res.json();
}

export async function createProject(payload: {
  title: string;
  style: VideoStyle;
  aspect_ratio: AspectRatio;
  resolution: Resolution;
  fps: number;
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update project');
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete project');
}

export async function duplicateProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}/duplicate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to duplicate project');
  return res.json();
}

export async function fetchAssets(): Promise<AssetMeta[]> {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function uploadAsset(file: File): Promise<AssetMeta> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/assets/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

export async function deleteAsset(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assets/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete asset');
}

export async function generateStoryboard(params: {
  prompt: string;
  style: VideoStyle;
  target_duration: number;
  scene_count: number;
  include_voiceover: boolean;
  source_document?: string;
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/generator/storyboard`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Generation failed' }));
    throw new Error(err.detail || 'Failed to generate storyboard');
  }
  return res.json();
}

export async function generateFromDocument(file: File, style: VideoStyle, duration: number): Promise<Project> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('style', style);
  formData.append('target_duration', duration.toString());
  
  const res = await fetch(`${API_BASE}/generator/document-storyboard`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to process document');
  return res.json();
}

export async function startRender(projectId: string, quality: 'draft' | 'standard' | 'high' = 'standard'): Promise<RenderStatus> {
  const res = await fetch(`${API_BASE}/render/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id: projectId, quality })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to start render' }));
    throw new Error(err.detail || 'Failed to start render');
  }
  return res.json();
}

export async function getRenderStatus(jobId: string): Promise<RenderStatus> {
  const res = await fetch(`${API_BASE}/render/status/${jobId}`);
  if (!res.ok) throw new Error('Failed to fetch render status');
  return res.json();
}

export async function cancelRender(jobId: string): Promise<void> {
  await fetch(`${API_BASE}/render/cancel/${jobId}`, {
    method: 'POST'
  });
}

export async function fetchModels(): Promise<AIModelInfo[]> {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch AI models');
  return res.json();
}

export async function fetchHardwareInfo(): Promise<HardwareInfo> {
  const res = await fetch(`${API_BASE}/models/hardware`);
  if (!res.ok) throw new Error('Failed to fetch hardware specs');
  return res.json();
}

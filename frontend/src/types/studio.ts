export type VideoStyle = 
  | 'natural' 
  | 'ai_generated' 
  | 'cartoon' 
  | 'educational' 
  | 'social' 
  | 'visualizer';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';
export type Resolution = '720p' | '1080p' | '4k';

export type TransitionType = 
  | 'none' 
  | 'fade' 
  | 'dissolve' 
  | 'slideleft' 
  | 'slideright' 
  | 'wipeleft' 
  | 'zoomin' 
  | 'bounce';

export type MotionType = 
  | 'none' 
  | 'ken_burns_zoom_in' 
  | 'ken_burns_zoom_out' 
  | 'pan_left' 
  | 'pan_right' 
  | 'tilt_up' 
  | 'cartoon_bounce';

export type AudioType = 'music' | 'voiceover' | 'sfx';

export interface Scene {
  id: string;
  title: string;
  duration: number; // in seconds
  asset_id?: string;
  asset_url?: string;
  text_overlay?: string;
  text_position: 'top' | 'center' | 'bottom' | 'custom';
  text_color: string;
  text_bg?: string;
  font_size: number;
  transition: TransitionType;
  transition_duration: number;
  motion_effect: MotionType;
  voiceover_text?: string;
  background_color: string;
  order: number;
}

export interface AudioTrack {
  id: string;
  title: string;
  asset_id?: string;
  asset_url?: string;
  type: AudioType;
  start_time: number;
  duration?: number;
  volume: number; // 0.0 - 2.0
  fade_in: number;
  fade_out: number;
  ducking: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  style: VideoStyle;
  aspect_ratio: AspectRatio;
  resolution: Resolution;
  fps: number;
  scenes: Scene[];
  audio_tracks: AudioTrack[];
  created_at: string;
  updated_at: string;
}

export interface AssetMeta {
  id: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  media_type: 'image' | 'video' | 'audio' | 'document';
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
}

export interface RenderStatus {
  job_id: string;
  project_id: string;
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_step: string;
  output_filename?: string;
  output_url?: string;
  error_message?: string;
  render_time_sec?: number;
  created_at: string;
  completed_at?: string;
}

export interface AIModelInfo {
  id: string;
  name: string;
  category: string;
  description: string;
  license: string;
  permitted_uses: string;
  installed: boolean;
  estimated_size_mb: number;
  vram_required_gb: number;
  cpu_compatible: boolean;
  provider_type: string;
  endpoint_url: string;
  setup_guide: string;
  status_msg?: string;
}

export interface HardwareInfo {
  os: string;
  architecture: string;
  cpu_count: number;
  total_ram_gb: number | string;
  available_ram_gb: number | string;
  ffmpeg_status: string;
  offline_ready: boolean;
}

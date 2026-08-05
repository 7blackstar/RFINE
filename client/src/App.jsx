
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Image, 
  Video, 
  Camera, 
  Type, 
  Folder, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  Check,
  Sliders, 
  Trash2,
  CaseSensitive,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  FolderOpen,
  ArrowLeft,
  HardDrive,
  FileImage,
  FileVideo,
  FileCode,
  FileText,
  Eye,
  Star,
  GripVertical,
  Info,
  LayoutDashboard,
  Sun,
  Moon,
  Settings,
  Layers,
  X,
  Play,
  Pause,
  FileAudio,
  Film,
  BookOpen,
  RotateCw,
  Plus,
  Menu,
  Search,
  Maximize,
  Music,
  Zap,
  Maximize2,
  AlertCircle,
  Pipette,
  Copy,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Crop,
  Home
} from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

// Reusable Collapsed File Browser Bar Component
// Collapsible File Browser Component with animations
// Collapsible File Browser Component with animations
// Collapsible File Browser Component with animations
function CollapsibleFileBrowser({
  isFileBrowserCollapsed,
  toggleFileBrowser,
  explorerHeight,
  setExplorerHeight,
  handleDividerMouseDown,
  children
}) {
  const handleMouseDown = handleDividerMouseDown || ((e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
      if (setExplorerHeight) setExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  return (
    <div 
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {/* Unified Header Bar (Always present and showing title) */}
      <div 
        onClick={toggleFileBrowser}
        className="hover-bright"
        style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: isFileBrowserCollapsed ? 'none' : '1px solid var(--glass-border)',
          transition: 'border-bottom 0.3s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FolderOpen size={16} color="var(--primary-color)" />
          <span 
            style={{ 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: 'var(--color-white)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px'
            }}
          >
            File Browser
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFileBrowser();
          }}
          className="collapsible-toggle-btn"
          style={{
            border: 'none',
            background: 'transparent',
            width: '24px',
            height: '24px',
            transform: isFileBrowserCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease'
          }}
          title={isFileBrowserCollapsed ? "Expand File Explorer" : "Collapse File Explorer"}
        >
          <ChevronDown size={14} color="var(--color-white)" />
        </button>
      </div>

      {/* Collapsible Content Area */}
      <div 
        style={{ 
          height: isFileBrowserCollapsed ? '0px' : `${explorerHeight}px`,
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '12px 12px 0 12px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flex: 1, minHeight: 0, overflow: 'auto' }}>
          {children}
        </div>
        
        {/* Draggable vertical divider */}
        <div 
          onMouseDown={handleMouseDown}
          style={{
            height: '8px',
            cursor: 'ns-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '2px 0',
            userSelect: 'none',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0
          }}
          title="Drag to resize panels"
        >
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.1)' }} />
        </div>
      </div>
    </div>
  );
}

// Browser path helpers for Windows environment
const path = {
  basename: (str) => {
    if (!str) return '';
    const parts = str.split(/[\\/]/);
    return parts[parts.length - 1];
  },
  dirname: (str) => {
    if (!str) return '';
    const parts = str.split(/[\\/]/);
    parts.pop();
    return parts.join('\\');
  },
  join: (...args) => {
    return args.filter(Boolean).join('\\').replace(/\\+/g, '\\');
  },
  extname: (str) => {
    if (!str) return '';
    const lastDot = str.lastIndexOf('.');
    return lastDot === -1 ? '' : str.substring(lastDot);
  },
  parse: (str) => {
    const base = path.basename(str);
    const lastDot = base.lastIndexOf('.');
    return {
      name: lastDot === -1 ? base : base.substring(0, lastDot),
      ext: lastDot === -1 ? '' : base.substring(lastDot)
    };
  }
};

// Global helper to format file size cleanly
const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '0 KB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1) {
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  }
  return `${mb.toFixed(2)} MB`;
};

const getDefaultOutputPath = () => {
  return localStorage.getItem('rfine_def_save_dir') || '';
};

// Global helper to format seconds to standard timestamp
const secondsToTimestamp = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) return '00:00:00.000';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds - (hrs * 3600)) / 60);
  const secs = Math.floor(seconds - (hrs * 3600) - (mins * 60));
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${String(ms).padStart(3, '0')}`;
};

function ToolCard({ title, desc, icon: Icon, onClick, color = 'var(--primary-color)', style = {} }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div 
      onClick={onClick}
      className="glass-card animate-fade-in" 
      style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center',
        gap: '16px', 
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '1px solid var(--glass-border)',
        borderColor: hovered ? 'var(--primary-color)' : 'var(--glass-border)',
        boxShadow: hovered ? '0 12px 30px rgba(77, 155, 34, 0.15)' : 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        height: '100%',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--glass-bg)',
        borderRadius: '12px',
        ...style
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Graphic Grid/Waves on Hover */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          opacity: hovered ? 0.08 : 0.02,
          transition: 'opacity 0.3s ease',
          backgroundImage: 'radial-gradient(circle at 20% 50%, var(--primary-color) 0%, transparent 60%), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 10px 10px, 10px 10px'
        }}
      />

      {/* Left Icon Graphic Container */}
      <div style={{ 
        width: '56px',
        height: '56px',
        borderRadius: '12px', 
        background: 'var(--icon-bg)', 
        border: '1px solid rgba(77, 155, 34, 0.2)',
        boxShadow: hovered ? '0 0 15px rgba(77, 155, 34, 0.3)' : 'none',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}>
        {/* Subtle grid points in icon background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.25,
          backgroundImage: 'radial-gradient(var(--primary-color) 1px, transparent 0)',
          backgroundSize: '8px 8px'
        }} />
        <Icon size={22} color="var(--dashboard-icon-color)" style={{ transition: 'all 0.3s ease', transform: hovered ? 'scale(1.15)' : 'scale(1)', zIndex: 2 }} />
      </div>

      {/* Text Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1, minWidth: 0, zIndex: 2 }}>
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--color-white)', margin: 0, letterSpacing: '0.5px' }}>{title}</h3>
        <p style={{ fontSize: '10.5px', color: 'var(--color-slate)', margin: 0, lineHeight: '1.4' }}>{desc}</p>
      </div>
    </div>
  );
}

// IMAGE CROPPER MODULE
function ImageCropper({ files, onFilesChange, toggleFileBrowser, isFileBrowserCollapsed, explorerHeight, handleDividerMouseDown, theme, openFolderPicker }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState('crop');
  const [isCroppedPreview, setIsCroppedPreview] = useState(false);
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('free');
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [targetFolder, setTargetFolder] = useState('');
  const [saveDestMode, setSaveDestMode] = useState('original');
  const [openOnComplete, setOpenOnComplete] = useState(true);

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [inputWidth, setInputWidth] = useState('');
  const [inputHeight, setInputHeight] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files]);

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (ratio === '1:1') setCropBox(prev => ({ ...prev, width: 50, height: 50 }));
    else if (ratio === '16:9') setCropBox(prev => ({ ...prev, width: 80, height: 45 }));
    else if (ratio === '4:3') setCropBox(prev => ({ ...prev, width: 80, height: 60 }));
    else if (ratio === '9:16') setCropBox(prev => ({ ...prev, width: 45, height: 80 }));
  };

  const handleSaveCrop = async () => {
    if (!selectedFile) return;
    setProcessing(true);
    try {
      const targetDir = saveDestMode === 'original' ? undefined : saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || undefined) : targetFolder || undefined;
      const res = await fetch(`${API_BASE}/image/crop-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localPath: selectedFile.path,
          cropBox, rotation, outputFormat,
          outputFolder: targetDir
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to crop image');
      let savedFolder = data.targetFolder || '';
      alert('Image cropped successfully!');
      if (openOnComplete && savedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: savedFolder }) });
        } catch (e) {}
      }
    } catch (e) {
      alert('Crop failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
        <CollapsibleFileBrowser isFileBrowserCollapsed={isFileBrowserCollapsed} toggleFileBrowser={toggleFileBrowser} explorerHeight={explorerHeight} handleDividerMouseDown={handleDividerMouseDown}>
          <FileExplorer 
            onAddFiles={(newFiles) => {
              onFilesChange(prev => {
                const updated = [...prev];
                newFiles.forEach(f => { if (!updated.some(x => x.path === f.path)) updated.push(f); });
                return updated;
              });
              if (newFiles.length > 0) setSelectedFile(newFiles[0]);
            }}
            allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
            storageKey="rfine_last_dir_image"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
            onPreviewFile={setSelectedFile}
          />
        </CollapsibleFileBrowser>

        <div ref={containerRef} style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas-bg)', borderRadius: '12px', margin: '16px 0', border: '1px solid var(--glass-border)' }}>
          {selectedFile ? (
            <img 
              ref={imageRef}
              src={`${API_BASE}/image-preview?path=${encodeURIComponent(selectedFile.path)}`}
              alt="Crop target"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: `rotate(${rotation}deg)` }}
              onLoad={(e) => setImageSize({ width: e.target.naturalWidth, height: e.target.naturalHeight })}
            />
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Select an image to crop</span>
          )}
        </div>
      </div>

      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Crop size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>IMAGE CROPPER</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0' }}>Crop, rotate, and adjust image dimensions.</p>

        <div className="sidebar-settings-content">
          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Aspect Ratio Presets</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
              {['free', '1:1', '16:9', '4:3', '9:16'].map(ratio => (
                <button key={ratio} className={`clean-preset-btn ${aspectRatio === ratio ? 'active' : ''}`} onClick={() => handleAspectRatioChange(ratio)} style={{ padding: '6px 0', fontSize: '9px' }}>{ratio.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Rotate Image</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }} onClick={() => setRotation(r => (r - 90) % 360)}>↺ 90° Left</button>
              <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '11px' }} onClick={() => setRotation(r => (r + 90) % 360)}>↻ 90° Right</button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Output Format</span>
            <div className="clean-preset-grid">
              {['jpg', 'png', 'webp', 'avif'].map(fmt => (
                <button key={fmt} className={`clean-preset-btn ${outputFormat === fmt ? 'active' : ''}`} onClick={() => setOutputFormat(fmt)}>{fmt.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Target Directory</span>
            <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
              <button className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`} onClick={() => setSaveDestMode('original')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Original</button>
              <button className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`} onClick={() => setSaveDestMode('default')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Default</button>
              <button className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`} onClick={() => { if (openFolderPicker) openFolderPicker(targetFolder, (p) => { setTargetFolder(p); setSaveDestMode('custom'); }); }} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Custom...</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <input type="checkbox" id="chk-crop-open" checked={openOnComplete} onChange={(e) => setOpenOnComplete(e.target.checked)} />
              <label htmlFor="chk-crop-open" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>Auto-Open Output Directory</label>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button className="process-action-btn flex-center" onClick={handleSaveCrop} disabled={processing || !selectedFile} style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'CROPPING...' : 'CROP IMAGE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------------
function FrameExtractor({ videoFile, setVideoFile, setGlobalProgress, theme, openFolderPicker, isDraggingFile, explorerHeight, handleDividerMouseDown, addRecentProcess, onOpenFullscreenPreview, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [videoSrc, setVideoSrc] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [activeStill, setActiveStill] = useState(null);
  const videoRef = useRef(null);

  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_ext_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_ext_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_ext_open_on_complete');
    return val === null ? true : val === 'true';
  });
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  useEffect(() => {
    if (videoFile) {
      const p = typeof videoFile === 'string' ? videoFile : (videoFile.path || videoFile.name);
      setVideoSrc(`${API_BASE}/video-stream?path=${encodeURIComponent(p)}`);
    } else {
      setVideoSrc('');
    }
  }, [videoFile]);

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        setCustomDestPath(selectedPath);
        setSaveDestMode('custom');
      });
    }
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1920;
    canvas.height = videoRef.current.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    const still = {
      id: Date.now() + Math.random(),
      dataUrl,
      timestamp: secondsToTimestamp(currentTime),
      selected: true
    };
    setGallery(prev => [still, ...prev]);
    setActiveStill(still);
  };

  const handleSaveStillLocally = async (still) => {
    try {
      const p = typeof videoFile === 'string' ? videoFile : (videoFile.path || videoFile.name);
      const targetDir = saveDestMode === 'original' ? path.dirname(p) :
                        saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || path.dirname(p)) :
                        customDestPath || path.dirname(p);
      
      const res = await fetch(`${API_BASE}/image/save-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: still.dataUrl,
          folderPath: targetDir,
          fileName: `frame_${still.timestamp.replace(/[:.]/g, '-')}.png`
        })
      });
      if (res.ok && addRecentProcess) {
        addRecentProcess('Frame Extractor', `frame_${still.timestamp}.png`, 0, null, targetDir);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadAll = async () => {
    for (const still of gallery) {
      await handleSaveStillLocally(still);
    }
  };

  return (
    <div className="workspace-layout">
      {/* Middle Canvas: Video Scrubber & Capture */}
      <div className="middle-canvas">
        <CollapsibleFileBrowser
          isFileBrowserCollapsed={isFileBrowserCollapsed}
          toggleFileBrowser={toggleFileBrowser}
          explorerHeight={explorerHeight}
          handleDividerMouseDown={handleDividerMouseDown}
        >
          <FileExplorer 
            onAddFiles={(f) => {
              if (f && f[0]) setVideoFile(f[0]);
            }} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov']} 
            maxListHeight={null} 
            onPreviewFile={(f) => setVideoFile(f)}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_video"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {videoSrc ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1, marginTop: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px', background: 'transparent', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
              <video 
                ref={videoRef}
                src={videoSrc}
                crossOrigin="anonymous"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onClick={() => {
                  if (videoRef.current) {
                    if (videoRef.current.paused) videoRef.current.play();
                    else videoRef.current.pause();
                  }
                }}
                style={{ width: '100%', maxHeight: '280px', borderRadius: '8px', border: '1px solid var(--glass-border)', objectFit: 'contain', cursor: 'pointer' }}
              />

              <div style={{ width: '100%', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.04"
                  value={currentTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setCurrentTime(val);
                    if (videoRef.current) videoRef.current.currentTime = val;
                  }}
                  style={{ width: '100%', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', height: '32px' }}
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-slate)' }}>{secondsToTimestamp(currentTime)}</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-slate)' }}>/ {secondsToTimestamp(duration)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '12px' }}>
                <button 
                  onClick={handleCaptureFrame}
                  className="flex-center"
                  style={{ 
                    width: '52px', 
                    height: '52px', 
                    borderRadius: '50%', 
                    padding: 0,
                    boxShadow: '0 4px 15px rgba(77, 155, 34, 0.25)',
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  title="Capture Current Frame"
                >
                  <Camera size={22} color="#FFF" />
                </button>
                <span style={{ fontSize: '9px', color: 'var(--color-slate)', marginTop: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>
                  CAPTURE FRAME STILL
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="dropzone flex-center" 
            onClick={() => document.getElementById('frame-extractor-add-file-input').click()}
            style={{ padding: '40px', flexGrow: 1 }}
          >
            <input 
              type="file"
              id="frame-extractor-add-file-input"
              accept=".mp4,.webm,.mkv,.mov"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setVideoFile(e.target.files[0].path || e.target.files[0].name);
                }
              }}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Select a video file to capture stills</span>
            <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports MP4, WebM, MKV, MOV</span>
          </div>
        )}
      </div>

      {/* Right Sidebar: Extracted Stills Gallery */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Camera size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Frame Extractor</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Extract high-quality stills from video clips.</p>

        <div className="sidebar-settings-content">
          {/* Active Still Inspector */}
          {activeStill && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '0', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {onOpenFullscreenPreview && (
                  <button
                    onClick={() => onOpenFullscreenPreview({ ...activeStill, name: `frame_${activeStill.timestamp}.png` })}
                    className="btn-secondary"
                    style={{ position: 'absolute', top: '6px', right: '6px', padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', zIndex: 5 }}
                    title="Open Fullscreen Preview"
                  >
                    <Maximize2 size={12} color="#FFFFFF" />
                  </button>
                )}
                <img src={activeStill.dataUrl} style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} alt="Selected still" />
              </div>

              <button 
                onClick={() => handleSaveStillLocally(activeStill)} 
                className="btn-secondary flex-center"
                style={{ width: '100%', padding: '8px 0', borderRadius: '4px', gap: '6px' }}
              >
                <Download size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Save Still ({activeStill.timestamp})</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default 
function GlobalFolderPickerModal({ isOpen, initialPath, onClose, onSelect, theme }) {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [parentPath, setParentPath] = useState('');
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState('');

  const loadFolders = async (dirPath) => {
    try {
      const res = await fetch(`${API_BASE}/scan-dir?path=` + encodeURIComponent(dirPath));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read directory');
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath || '');
      setFolders((data.items || []).filter(i => i.isDir));
      setError('');
    } catch (e) { setError(e.message); }
  };

  useEffect(() => {
    if (isOpen) loadFolders(initialPath || '');
  }, [isOpen, initialPath]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999 }} onClick={onClose}>
      <div className="glass-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ width: '500px', padding: '20px', borderRadius: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen size={18} color="var(--primary-color)" />
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-white)', margin: 0 }}>Select Directory</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-slate)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => loadFolders(parentPath)} disabled={!parentPath} className="btn-secondary" style={{ padding: '6px 10px', borderRadius: '4px' }} title="Go Up"><ArrowLeft size={12} /></button>
          <input type="text" className="form-input" value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadFolders(currentPath)} style={{ flexGrow: 1, padding: '6px 10px', fontSize: '12px' }} />
        </div>

        <div style={{ height: '220px', overflowY: 'auto', border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(0,0,0,0.15)', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {error ? (
            <div style={{ color: '#EF4444', fontSize: '11px', textAlign: 'center', padding: '10px' }}>{error}</div>
          ) : folders.length === 0 ? (
            <div style={{ color: 'var(--color-slate)', fontSize: '11px', textAlign: 'center', padding: '10px' }}>No subfolders found</div>
          ) : (
            folders.map(f => (
              <div key={f.path} onClick={() => loadFolders(f.path)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} className="hover-bright">
                <FolderOpen size={14} color="var(--primary-color)" />
                <span style={{ fontSize: '12px', color: 'var(--color-white)' }}>{f.name}</span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>Cancel</button>
          <button onClick={() => onSelect(currentPath)} className="btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>Select Folder</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverOnline, setServerOnline] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('rfine_theme') || 'dark');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isFileBrowserCollapsed, setIsFileBrowserCollapsed] = useState(() => localStorage.getItem('rfine_file_browser_collapsed') === 'true');
  const toggleFileBrowser = () => {
    const next = !isFileBrowserCollapsed;
    setIsFileBrowserCollapsed(next);
    localStorage.setItem('rfine_file_browser_collapsed', String(next));
  };

  const [explorerHeight, setExplorerHeight] = useState(() => parseInt(localStorage.getItem('rfine_explorer_height')) || 320);
  const updateExplorerHeight = (newHeight) => {
    setExplorerHeight(newHeight);
    localStorage.setItem('rfine_explorer_height', newHeight);
  };

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientY - startY;
      let newHeight = startH + delta;
      if (newHeight < 150) newHeight = 150;
      if (newHeight > 600) newHeight = 600;
      updateExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const [recentProcesses, setRecentProcesses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rfine_recent_processes')) || [];
    } catch {
      return [];
    }
  });

  const addRecentProcess = (type, name, origSize, optSize, targetFolder, filePath) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const fullPath = filePath || (targetFolder ? path.join(targetFolder, name) : name);
    const newItem = { type, name, origSize, optSize, targetFolder, filePath: fullPath, time };
    setRecentProcesses(prev => {
      const updated = [newItem, ...prev.filter(x => x.name !== name || x.type !== type)].slice(0, 10);
      localStorage.setItem('rfine_recent_processes', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('rfine_theme', theme);
  }, [theme]);

  // Workspace files
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoFiles, setVideoFiles] = useState([]);
  const [renamerFiles, setRenamerFiles] = useState([]);
  const [watermarkFiles, setWatermarkFiles] = useState([]);
  
  const [audioFiles, setAudioFiles] = useState([]);
  const [gifFiles, setGifFiles] = useState([]);

  // Shared explorer preview states
  const [explorerPreviewFile, setExplorerPreviewFile] = useState(null);

  const [globalProgress, setGlobalProgress] = useState({
    active: false,
    percent: 0,
    label: ''
  });

  // Global Folder Picker Modal state
  const [globalFolderPickerOpen, setGlobalFolderPickerOpen] = useState(false);
  const [globalFolderPickerCallback, setGlobalFolderPickerCallback] = useState(null);
  const [globalFolderPickerPath, setGlobalFolderPickerPath] = useState('');
  const [sharedExplorerPath, setSharedExplorerPath] = useState(() => localStorage.getItem('rfine_shared_explorer_path') || '');

  const handleExplorerPathChange = (newPath) => {
    if (newPath) {
      setSharedExplorerPath(newPath);
      localStorage.setItem('rfine_shared_explorer_path', newPath);
    }
  };

  
  const [videoStartupFile, setVideoStartupFile] = useState(null);
  const [fullscreenPreviewFile, setFullscreenPreviewFile] = useState(null);
  const [showVideoLaunchModal, setShowVideoLaunchModal] = useState(false);
  const deepLinkParsedRef = useRef(false);

  const [collapsedCategories, setCollapsedCategories] = useState({
    main: false,
    imageStudio: false,
    videoAudio: false,
    utilities: false
  });
  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };



  useEffect(() => {
    const parseDeepLink = async () => {
      if (deepLinkParsedRef.current) return;
      const params = new URLSearchParams(window.location.search);
      const openFile = params.get('openFile');
      if (openFile) {
        deepLinkParsedRef.current = true;
        try {
          const res = await fetch(`${API_BASE}/file-info?path=${encodeURIComponent(openFile)}`);
          if (!res.ok) return;
          const fileInfo = await res.json();
          const ext = fileInfo.ext.toLowerCase();

           if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(ext)) {
            setActiveTab('image');
            setImageFiles([fileInfo]);
          } else if (['.mp3', '.wav', '.aac', '.flac', '.m4a'].includes(ext)) {
            setActiveTab('audio-studio');
            setAudioFiles([fileInfo]);
          } else if (['.mp4', '.webm', '.mkv', '.mov', '.avi'].includes(ext)) {
            setVideoStartupFile(fileInfo);
            setShowVideoLaunchModal(true);
          }
        } catch (e) {
          console.error('Error fetching deep linked file info:', e);
        }
      }
    };
    if (serverOnline) {
      parseDeepLink();
    }
  }, [serverOnline]);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateChecking, setUpdateChecking] = useState(false);
  const [updateChecked, setUpdateChecked] = useState(false);

  const openFolderPicker = (initialPath, callback) => {
    setGlobalFolderPickerPath(initialPath || '');
    setGlobalFolderPickerCallback(() => callback);
    setGlobalFolderPickerOpen(true);
  };
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/scan-dir?path=.`);
        if (res.ok) setServerOnline(true);
      } catch (e) {
        setServerOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      if (window.isDraggingQueueItem) return;
      setIsDraggingFile(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      if (window.isDraggingQueueItem) return;
      if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
        setIsDraggingFile(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      if (window.isDraggingQueueItem) return;
      setIsDraggingFile(false);
      
      const fileList = Array.from(e.dataTransfer.files);
      if (fileList.length === 0) return;

      const fileObj = fileList[0];
      const p = fileObj.path || fileObj.name;
      const ext = p.substring(p.lastIndexOf('.')).toLowerCase();

       if (['.mp4', '.webm', '.mkv', '.mov'].includes(ext)) {
        if (activeTab === 'video-compress' || activeTab === 'video-extract' || activeTab === 'gif-creator') {
          if (activeTab === 'video-compress') setVideoFile(fileObj);
          else if (activeTab === 'video-extract') setVideoFile(fileObj);
          else if (activeTab === 'gif-creator') setGifFiles([fileObj]);
        } else {
          setActiveTab('video-compress');
          setVideoFile(fileObj);
        }
      } else if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(ext)) {
        if (activeTab === 'watermark') {
          setWatermarkFiles(prev => [...prev, fileObj]);
        } else {
          setActiveTab('image');
          setImageFiles(prev => [...prev, fileObj]);
        }
      } else if (['.mp3', '.wav', '.aac', '.flac', '.m4a'].includes(ext)) {
        setActiveTab('audio-studio');
        setAudioFiles([fileObj]);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'transparent', overflow: 'hidden', position: 'relative' }}>
      

      {/* Sidebar Navigation */}
      <aside className={`clean-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* RFINE Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', padding: '0 16px', marginBottom: '20px', flexShrink: 0 }}>
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, paddingLeft: '8px' }}>
              <img src={theme === 'light' ? 'logo_light.png' : 'logo.png'} style={{ height: '52px', maxWidth: '160px', objectFit: 'contain' }} alt="RFINE" className="app-logo-img" draggable="false" />
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={18} />
          </button>
        </div>        {/* Navigation Tabs */}
        <nav className="clean-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: isSidebarCollapsed ? '0 8px' : '0 12px', flexGrow: 1, overflowY: 'auto' }}>
          {/* Dashboard (Independent) */}
          <button onClick={() => setActiveTab('dashboard')} className={`clean-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Dashboard">
            <LayoutDashboard size={16} />
            <span className="sidebar-text">Dashboard</span>
          </button>

          {/* CATEGORY 2: IMAGE STUDIO */}
          {!isSidebarCollapsed ? (
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleCategory('imageStudio')} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '4px 8px', marginTop: '12px' }}
            >
              <span>IMAGE STUDIO</span>
              {collapsedCategories.imageStudio ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </div>
          ) : null}
          {(!collapsedCategories.imageStudio || isSidebarCollapsed) && (
            <>
              <button onClick={() => setActiveTab('image')} className={`clean-nav-item ${activeTab === 'image' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Image Resizer">
                <Image size={16} />
                <span className="sidebar-text">Image Resizer</span>
              </button>
              <button onClick={() => setActiveTab('watermark')} className={`clean-nav-item ${activeTab === 'watermark' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Watermarker">
                <Layers size={16} />
                <span className="sidebar-text">Watermarker</span>
              </button>
              <button onClick={() => setActiveTab('color-studio')} className={`clean-nav-item ${activeTab === 'color-studio' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Color Studio">
                <Pipette size={16} />
                <span className="sidebar-text">Color Studio</span>
              </button>
              <button onClick={() => setActiveTab('image-cropper')} className={`clean-nav-item ${activeTab === 'image-cropper' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Image Cropper">
                <Crop size={16} />
                <span className="sidebar-text">Image Cropper</span>
              </button>
            </>
          )}

          {/* CATEGORY 3: VIDEO & AUDIO */}
          {!isSidebarCollapsed ? (
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleCategory('videoAudio')} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '4px 8px', marginTop: '12px' }}
            >
              <span>VIDEO & AUDIO</span>
              {collapsedCategories.videoAudio ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </div>
          ) : null}
          {(!collapsedCategories.videoAudio || isSidebarCollapsed) && (
            <>
              <button onClick={() => setActiveTab('video-compress')} className={`clean-nav-item ${activeTab === 'video-compress' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Video Compressor">
                <Video size={16} />
                <span className="sidebar-text">Video Compressor</span>
              </button>
              <button onClick={() => setActiveTab('video-extract')} className={`clean-nav-item ${activeTab === 'video-extract' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Frame Extractor">
                <Camera size={16} />
                <span className="sidebar-text">Frame Extractor</span>
              </button>
              <button onClick={() => setActiveTab('audio-studio')} className={`clean-nav-item ${activeTab === 'audio-studio' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Audio Converter">
                <FileAudio size={16} />
                <span className="sidebar-text">Audio Converter</span>
              </button>
              <button onClick={() => setActiveTab('gif-creator')} className={`clean-nav-item ${activeTab === 'gif-creator' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="GIF Creator">
                <Film size={16} />
                <span className="sidebar-text">GIF Creator</span>
              </button>
            </>
          )}

          {/* CATEGORY 4: UTILITIES */}
          {!isSidebarCollapsed ? (
            <div 
              className="sidebar-category-header" 
              onClick={() => toggleCategory('utilities')} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '4px 8px', marginTop: '12px' }}
            >
              <span>UTILITIES</span>
              {collapsedCategories.utilities ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </div>
          ) : null}
          {(!collapsedCategories.utilities || isSidebarCollapsed) && (
            <>
              <button onClick={() => setActiveTab('bulk-renamer')} className={`clean-nav-item ${activeTab === 'bulk-renamer' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Bulk Renamer">
                <Type size={16} />
                <span className="sidebar-text">Bulk Renamer</span>
              </button>
              <button onClick={() => setActiveTab('case-converter')} className={`clean-nav-item ${activeTab === 'case-converter' ? 'active' : ''}`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Case Converter">
                <CaseSensitive size={16} />
                <span className="sidebar-text">Case Converter</span>
              </button>
            </>
          )}
        </nav>
        
          {/* Global Progress Bar */}
          {globalProgress.active && !isSidebarCollapsed && (
            <div style={{ margin: '15px 12px 0 12px', padding: '12px', background: 'rgba(90, 46, 230, 0.05)', borderRadius: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)', fontWeight: 'bold', display: 'block', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {globalProgress.label}
              </span>
              <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${globalProgress.percent}%`, 
                  height: '100%', 
                  background: 'var(--primary-gradient)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
              <span style={{ fontSize: '9px', color: 'var(--color-slate)', display: 'block', textAlign: 'right', marginTop: '2px' }}>
                {globalProgress.percent}%
              </span>
            </div>
          )}

          <div style={{ marginTop: 'auto' }} />

          {/* Bottom Options */}
          <nav className="clean-nav-list" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px', marginTop: '12px', padding: isSidebarCollapsed ? '0 8px' : '0 12px' }}>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`clean-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
              title="Settings"
            >
              <Settings size={16} />
              <span className="sidebar-text">Settings</span>
            </button>

            <button
              onClick={() => setIsAboutOpen(true)}
              className="clean-nav-item"
              style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
              title="About"
            >
              <Info size={16} />
              <span className="sidebar-text">About</span>
            </button>
          </nav>
        </aside>
      <main style={{ flexGrow: 1, overflow: 'hidden', height: '100%', position: 'relative', minWidth: 0, zIndex: 11 }}>
        <div className="animate-fade-in" style={{ height: '100%', width: '100%' }} key={activeTab}>
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '40px 45px', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }} className="animate-fade-in">
              {/* Welcome Greeting Header instead of repeating logo */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexShrink: 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-white)', margin: 0, letterSpacing: '-0.5px' }}>
                  What would you like to <span style={{ color: 'var(--primary-color)' }}>refine</span> today?
                </h1>
                <p style={{ fontSize: '10px', color: 'var(--color-slate)', letterSpacing: '1px', textTransform: 'uppercase', margin: 0, fontWeight: 'bold', opacity: 0.8 }}>
                  Media Suite
                </p>
              </div>

              {/* Grid of All 7 Active Tools */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '16px',
                width: '100%',
                maxWidth: '1200px',
                marginBottom: '40px',
                flexShrink: 0
              }}>
                <ToolCard 
                  title="Image Resizer"
                  desc="Upscale, convert, and batch process images offline."
                  icon={Image}
                  onClick={() => setActiveTab('image')}
                />
                <ToolCard 
                  title="Video Compressor"
                  desc="Compress video files using H.265 codec presets."
                  icon={Video}
                  onClick={() => setActiveTab('video-compress')}
                />
                <ToolCard 
                  title="Frame Extractor"
                  desc="Extract raw high-quality stills from video clips."
                  icon={Camera}
                  onClick={() => setActiveTab('video-extract')}
                />
                <ToolCard 
                  title="Bulk Renamer"
                  desc="Batch rename multiple files using custom replace rules."
                  icon={Type}
                  onClick={() => setActiveTab('bulk-renamer')}
                />
                <ToolCard 
                  title="Watermarker"
                  desc="Apply custom text or logo watermarks to your images."
                  icon={Layers}
                  onClick={() => setActiveTab('watermark')}
                />
                <ToolCard 
                  title="Case Converter"
                  desc="Transform text blocks between popular case structures."
                  icon={CaseSensitive}
                  onClick={() => setActiveTab('case-converter')}
                />
                <ToolCard 
                  title="Color Studio"
                  desc="Pick colors, generate palettes, check contrast and more."
                  icon={Pipette}
                  onClick={() => setActiveTab('color-studio')}
                />
                <ToolCard 
                  title="Audio Converter"
                  desc="Convert, split, and extract audio tracks from media."
                  icon={FileAudio}
                  onClick={() => setActiveTab('audio-studio')}
                />
                <ToolCard 
                  title="GIF Creator"
                  desc="Generate optimized animated GIF clips from videos."
                  icon={Film}
                  onClick={() => setActiveTab('gif-creator')}
                />
              </div>

              {/* Recent Processes Section */}
              <div style={{ width: '100%', maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                      Recent Processes
                    </h2>
                  </div>
                  {recentProcesses.length > 0 && (
                    <span 
                      onClick={() => {
                        setRecentProcesses([]);
                        localStorage.removeItem('rfine_recent_processes');
                      }}
                      style={{ fontSize: '10px', color: 'var(--color-slate)', fontWeight: 'bold', letterSpacing: '0.5px', cursor: 'pointer', textTransform: 'uppercase' }}
                    >
                      Clear History
                    </span>
                  )}
                </div>

                {recentProcesses.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'var(--color-slate)', fontSize: '12px' }}>
                    No recent processes yet. Run files through any tool to see details.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentProcesses.map((proc, idx) => {
                      const reductionPct = proc.origSize && proc.optSize ? Math.round((1 - proc.optSize / proc.origSize) * 100) : 0;
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px', gap: '15px' }}>
                          {/* Clickable File Icon */}
                          <div 
                            onClick={async () => {
                              const fileToOpen = proc.filePath || (proc.targetFolder ? path.join(proc.targetFolder, proc.name.includes(' → ') ? proc.name.split(' → ')[1] : proc.name) : null);
                              if (fileToOpen) {
                                try {
                                  await fetch(`${API_BASE}/open-file`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filePath: fileToOpen })
                                  });
                                } catch (e) { console.error(e); }
                              }
                            }}
                            style={{ 
                              width: '28px', 
                              height: '28px', 
                              borderRadius: '6px', 
                              background: 'rgba(77, 155, 34, 0.08)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              flexShrink: 0,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            className="recent-icon-wrapper"
                            title="Click to Open File"
                          >
                            {proc.type.includes('Image') || proc.type.includes('Watermark') ? (
                              <Image size={14} color="var(--primary-color)" />
                            )  : (
                              <Video size={14} color="#9148F8" />
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {proc.type === 'Bulk Renamer' && proc.name.includes(' → ') ? (
                                <>
                                  <span style={{ color: 'var(--color-slate)', fontWeight: 'normal' }}>{proc.name.split(' → ')[0]}</span>
                                  <span style={{ color: 'var(--color-slate)', fontWeight: 'normal', margin: '0 6px' }}>→</span>
                                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{proc.name.split(' → ')[1]}</span>
                                </>
                              ) : (
                                proc.name
                              )}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>
                              {proc.type} • {proc.time}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            {proc.origSize && proc.optSize ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                                  {formatFileSize(proc.origSize)} → <strong style={{ color: theme === 'light' ? 'var(--primary-color)' : '#5ABF3A' }}>{formatFileSize(proc.optSize)}</strong>
                                </span>
                                {reductionPct > 0 && (
                                  <span style={{ fontSize: '10px', fontWeight: 'bold', background: theme === 'light' ? 'rgba(77, 155, 34, 0.12)' : 'rgba(90, 191, 58, 0.15)', color: theme === 'light' ? 'var(--primary-color)' : '#5ABF3A', padding: '2px 8px', borderRadius: '12px' }}>
                                    -{reductionPct}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: theme === 'light' ? 'var(--primary-color)' : '#5ABF3A', fontWeight: 'bold' }}>Success</span>
                            )}

                            {/* Open File Button */}
                            <button
                              onClick={async () => {
                                if (proc.outputPath) {
                                  try {
                                    await fetch(`${API_BASE}/open-file`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ filePath: proc.outputPath })
                                    });
                                  } catch (e) { console.error(e); }
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                              title="Open File"
                            >
                              <FileText size={13} color="var(--primary-color)" />
                            </button>

                            {/* Open Folder Button */}
                            <button
                              onClick={async () => {
                                if (proc.targetFolder) {
                                  try {
                                    await fetch(`${API_BASE}/open-folder`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ folderPath: proc.targetFolder })
                                    });
                                  } catch (e) { console.error(e); }
                                }
                              }}
                              className="btn-secondary"
                              style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', borderRadius: '4px' }}
                              title="Open Folder"
                            >
                              <FolderOpen size={13} color="var(--primary-color)" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <ImageResizer
              files={imageFiles}
              onFilesChange={setImageFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              onOpenFullscreenPreview={(f) => setFullscreenPreviewFile(f)}
            />
          )}

          {activeTab === 'watermark' && (
            <WatermarkerStudio
              files={watermarkFiles}
              setFiles={setWatermarkFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              explorerPreviewFile={explorerPreviewFile}
              setExplorerPreviewFile={setExplorerPreviewFile}
            />
          )}

          {activeTab === 'color-studio' && (
            <ColorStudio
              theme={theme}
            />
          )}

          {activeTab === 'image-cropper' && (
            <ImageCropper
              files={imageFiles}
              onFilesChange={setImageFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
            />
          )}

          {activeTab === 'video-compress' && (
            <VideoCompressor
              files={videoFiles}
              setFiles={setVideoFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              setExplorerHeight={setExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              mode="compress"
            />
          )}

          {activeTab === 'video-extract' && (
            <FrameExtractor
              videoFile={videoFile}
              setVideoFile={setVideoFile}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              onOpenFullscreenPreview={(f) => setFullscreenPreviewFile(f)}
            />
          )}

          {activeTab === 'audio-studio' && (
            <AudioStudio
              files={audioFiles}
              setFiles={setAudioFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
            />
          )}

          {activeTab === 'gif-creator' && (
            <GIFCreator
              files={gifFiles}
              setFiles={setGifFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
            />
          )}

          {activeTab === 'bulk-renamer' && (
            <FileRenamer
              files={renamerFiles}
              setFiles={setRenamerFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
              openFolderPicker={openFolderPicker}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
            />
          )}

          {activeTab === 'case-converter' && (
            <CaseConverter theme={theme} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab theme={theme} setTheme={setTheme} openFolderPicker={openFolderPicker} />
          )}
        </div>
      </main>
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} theme={theme} />
      <GlobalFolderPickerModal 
        isOpen={globalFolderPickerOpen} 
        initialPath={globalFolderPickerPath} 
        onClose={() => setGlobalFolderPickerOpen(false)} 
        onSelect={(selectedPath) => {
          if (globalFolderPickerCallback) globalFolderPickerCallback(selectedPath);
          setGlobalFolderPickerOpen(false);
        }} 
        theme={theme} 
      />
    </div>
  );
}

// ----------------------------------------------------------------------------
// REUSABLE LOCAL FILE EXPLORER (PRESERVED CLEAN AND STREAMLINED)
// ----------------------------------------------------------------------------
function FileExplorer({ onAddFiles, allowedExtensions = [], maxListHeight = null, onPreviewFile, theme, defaultPath, onPathChange, storageKey, showActions = true, openFolderPicker, onCollapse, flat = true }) {
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState('');
  const [items, setItems] = useState([]);
  const [explorerError, setExplorerError] = useState('');
  const [selectedItems, setSelectedItems] = useState({});
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [roots, setRoots] = useState({ home: '', drives: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'modified', 'size'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rfine_favorite_folders')) || [];
    } catch {
      return [];
    }
  });

  const syncFavorites = () => {
    try {
      setFavorites(JSON.parse(localStorage.getItem('rfine_favorite_folders')) || []);
    } catch {}
  };

  const loadDirectory = async (dirPath) => {
    try {
      const res = await fetch(`${API_BASE}/scan-dir?path=` + encodeURIComponent(dirPath));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read directory');
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath || '');
      setItems(data.items || []);
      setExplorerError('');
      setLastSelectedIndex(null);
      if (storageKey) localStorage.setItem(storageKey, data.currentPath);
      if (onPathChange) onPathChange(data.currentPath);
      syncFavorites();
    } catch (err) {
      setExplorerError(err.message);
    }
  };

  useEffect(() => {
    const initRootsAndPath = async () => {
      let homePath = '';
      try {
        const rootsRes = await fetch(`${API_BASE}/explorer/roots`);
        if (rootsRes.ok) {
          const rootsData = await rootsRes.json();
          setRoots(rootsData);
          homePath = rootsData.home;
        }
      } catch (err) {}
      const initial = defaultPath || homePath || '';
      const cached = storageKey ? localStorage.getItem(storageKey) : null;
      loadDirectory(cached || initial);
    };
    initRootsAndPath();
  }, []);

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (item.isDir) return true;
    if (allowedExtensions.length === 0) return true;
    return allowedExtensions.includes(item.ext.toLowerCase());
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;

    let res = 0;
    if (sortBy === 'name') {
      res = a.name.localeCompare(b.name);
    } else if (sortBy === 'modified') {
      res = (a.mtime || 0) - (b.mtime || 0);
    } else if (sortBy === 'size') {
      res = (a.size || 0) - (b.size || 0);
    }
    return sortOrder === 'asc' ? res : -res;
  });

  const handleItemClick = (item, index, e) => {
    if (item.isDir) {
      loadDirectory(item.path);
      setLastSelectedIndex(null);
      return;
    }

    if (e && e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);
      const newSelections = { ...selectedItems };
      for (let i = start; i <= end; i++) {
        const targetItem = sortedItems[i];
        if (targetItem && !targetItem.isDir) {
          newSelections[targetItem.path] = targetItem;
        }
      }
      setSelectedItems(newSelections);
    } else {
      setLastSelectedIndex(index);
      setSelectedItems(prev => ({
        ...prev,
        [item.path]: prev[item.path] ? null : item
      }));
    }
    if (onPreviewFile) onPreviewFile(item);
  };

  const toggleFavorite = () => {
    if (!currentPath) return;
    let updated;
    if (favorites.includes(currentPath)) {
      updated = favorites.filter(p => p !== currentPath);
    } else {
      updated = [...favorites, currentPath];
    }
    setFavorites(updated);
    localStorage.setItem('rfine_favorite_folders', JSON.stringify(updated));
  };

  const handleAddSelected = () => {
    const list = Object.values(selectedItems).filter(Boolean);
    if (list.length > 0) {
      onAddFiles(list);
      setSelectedItems({});
    }
  };

  const renderIcon = (item) => {
    if (item.isDir) return <FolderOpen size={14} color="var(--primary-color)" />;
    const ext = (item.ext || '').toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(ext)) {
      return (
        <img 
          src={`${API_BASE}/image-preview?path=` + encodeURIComponent(item.path)}
          alt=""
          style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '3px', flexShrink: 0 }}
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
        />
      );
    }
    if (['.mp4', '.webm', '.mkv', '.mov'].includes(ext)) {
      return <FileVideo size={14} color="var(--secondary-color)" />;
    }
    return <FileText size={14} color="var(--color-slate)" />;
  };

  const handleSelectAll = () => {
    const newSelections = {};
    sortedItems.forEach(item => { if (!item.isDir) newSelections[item.path] = item; });
    setSelectedItems(newSelections);
  };

  const handleDeselectAll = () => setSelectedItems({});
  const isFavorite = favorites.includes(currentPath);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
      {/* Row 1: Quick Access Chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={() => loadDirectory(roots.home)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}>
          <Home size={10} />
          <span>Home Directory</span>
        </button>
        {roots.drives && roots.drives.map(drive => (
          <button key={drive} onClick={() => loadDirectory(drive)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}>
            <HardDrive size={10} />
            <span>{drive}</span>
          </button>
        ))}
        {favorites.map(fav => (
          <button key={fav} onClick={() => loadDirectory(fav)} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}>
            <Star size={10} color="var(--primary-color)" fill="var(--primary-color)" />
            <span>{path.basename(fav) || fav}</span>
          </button>
        ))}
      </div>

      {/* Row 2: Path Breadcrumbs Bar */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button onClick={() => loadDirectory(parentPath)} disabled={!parentPath} className="btn-secondary" style={{ padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Back">
          <ArrowLeft size={12} />
        </button>
        <input type="text" className="form-input" value={currentPath} onChange={(e) => setCurrentPath(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadDirectory(currentPath)} style={{ flexGrow: 1, padding: '4px 10px', fontSize: '11px', borderRadius: '4px' }} />
        <button onClick={toggleFavorite} className="btn-secondary" style={{ padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={isFavorite ? "Remove Bookmark" : "Bookmark Folder"}>
          <Star size={12} fill={isFavorite ? "var(--primary-color)" : "none"} color={isFavorite ? "var(--primary-color)" : "currentColor"} />
        </button>
        <button onClick={() => loadDirectory(currentPath)} className="btn-secondary" style={{ padding: '5px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh">
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Row 3: Sort Options (Left) + Search Input (Right) */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--color-slate)', fontWeight: 'bold' }}>Sort:</span>
          <select className="form-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '3px 6px', fontSize: '10.5px', width: '95px' }}>
            <option value="name">Name</option>
            <option value="modified">Modified</option>
            <option value="size">Size</option>
          </select>
          <select className="form-input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ padding: '3px 6px', fontSize: '10.5px', width: '70px' }}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <input type="text" className="form-input" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '160px', padding: '3px 8px 3px 24px', fontSize: '10.5px', borderRadius: '4px' }} />
          <Search size={11} color="var(--color-slate)" style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Row 4: File List Box */}
      <div className="file-explorer-list-box" style={{ flexGrow: 1, overflowY: 'auto', maxHeight: maxListHeight || '220px', border: '1px solid var(--glass-border)', borderRadius: '6px', background: theme === 'light' ? '#F8FAFC' : 'rgba(0,0,0,0.15)', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '100px' }}>
        {explorerError ? (
          <div style={{ color: '#EF4444', fontSize: '11px', padding: '10px', textAlign: 'center' }}>{explorerError}</div>
        ) : sortedItems.length === 0 ? (
          <div style={{ color: 'var(--color-slate)', fontSize: '11px', padding: '10px', textAlign: 'center' }}>No items found</div>
        ) : (
          sortedItems.map((item, idx) => {
            const isSel = !!selectedItems[item.path];
            return (
              <div 
                key={item.path} 
                onClick={(e) => handleItemClick(item, idx, e)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', background: isSel ? 'rgba(77, 155, 34, 0.15)' : 'transparent', transition: 'all 0.15s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexGrow: 1 }}>
                  {!item.isDir && (
                    <input type="checkbox" checked={isSel} onChange={() => {}} style={{ cursor: 'pointer' }} />
                  )}
                  {renderIcon(item)}
                  <span style={{ fontSize: '11px', fontWeight: item.isDir ? 'bold' : 'normal', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                </div>
                {!item.isDir && item.size > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--color-slate)', marginLeft: '10px', flexShrink: 0 }}>{formatFileSize(item.size)}</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Row 5: Action Buttons Footer Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={handleSelectAll} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }}>Select All</button>
          <button onClick={handleDeselectAll} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }}>Deselect All</button>
        </div>
        <button onClick={handleAddSelected} className="btn-primary" style={{ padding: '5px 14px', fontSize: '10px', borderRadius: '4px' }}>
          ADD SELECTED ({Object.values(selectedItems).filter(Boolean).length})
        </button>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------------
function ImageResizer({ files, onFilesChange, toggleFileBrowser, isFileBrowserCollapsed, explorerHeight, handleDividerMouseDown, theme, openFolderPicker, addRecentProcess, setGlobalProgress, onOpenFullscreenPreview }) {
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [format, setFormat] = useState('png');
  const [resizeMode, setResizeMode] = useState('none');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [scalePercent, setScalePercent] = useState('80');
  const [quality, setQuality] = useState('80');
  const [proportionateAnchor, setProportionateAnchor] = useState('width');
  const [proportionateValue, setProportionateValue] = useState('1920');

  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_img_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_img_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_img_open_on_complete');
    return val === null ? true : val === 'true';
  });

  const [sectionConfigExpanded, setSectionConfigExpanded] = useState(true);
  const [sectionResizeExpanded, setSectionResizeExpanded] = useState(true);
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDragLeave = () => setDragOverIndex(null);
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const updated = [...files];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    onFilesChange(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveFile = (index) => {
    onFilesChange(prev => prev.filter((_, i) => i !== index));
    if (activePreviewFile === files[index]) setActivePreviewFile(null);
  };

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        if (selectedPath) {
          setCustomDestPath(selectedPath);
          setSaveDestMode('custom');
          localStorage.setItem('rfine_img_custom_dest_path', selectedPath);
          localStorage.setItem('rfine_img_save_dest_mode', 'custom');
        }
      });
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setSuccessResult(null);
    try {
      const targetDir = saveDestMode === 'original' ? undefined : saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || undefined) : customDestPath || undefined;
      const res = await fetch(`${API_BASE}/image/convert-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files, format, quality, resizeMode, width, height, scalePercent,
          proportionateAnchor, proportionateValue,
          outputFolder: targetDir
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process images');
      let lastSavedFolder = data.targetFolder || (files[0] && files[0].path ? files[0].path.substring(0, files[0].path.lastIndexOf('\\')) : '');
      if (data.results && addRecentProcess) {
        data.results.forEach(r => {
          if (r.success) addRecentProcess('Image Resizer', r.name, r.originalSize, r.optimizedSize, r.targetFolder);
        });
      }
      setSuccessResult({ results: data.results, targetFolder: lastSavedFolder, count: files.length });

      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: lastSavedFolder }) });
        } catch (e) { console.error('Auto-open failed:', e); }
      }
    } catch (e) { alert('Processing failed: ' + e.message); }
    finally { setProcessing(false); }
  };

  const currentSelectedFile = activePreviewFile || files[0];

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflowY: 'auto' }}>
        <CollapsibleFileBrowser isFileBrowserCollapsed={isFileBrowserCollapsed} toggleFileBrowser={toggleFileBrowser} explorerHeight={explorerHeight} handleDividerMouseDown={handleDividerMouseDown}>
          <FileExplorer 
            onAddFiles={(newFiles) => {
              onFilesChange(prev => {
                const updated = [...prev];
                newFiles.forEach(f => { if (!updated.some(x => x.path === f.path)) updated.push(f); });
                return updated;
              });
            }}
            onPreviewFile={(item) => setActivePreviewFile(item)}
            allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
            storageKey="rfine_last_dir_image"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {/* Processing Queue Header with Uniform Spacing */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0, marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processing Queue</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(77, 155, 34, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px' }}>
              {files.length} {files.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          {files.length > 0 && (
            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10.5px', color: '#EF4444', borderColor: 'transparent', background: 'transparent', fontWeight: 'bold' }} onClick={() => { onFilesChange([]); setActivePreviewFile(null); setSuccessResult(null); }}>
              Clear Queue
            </button>
          )}
        </div>

        {/* Success Banner (Square Folder Icon Only) */}
        {successResult && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(77, 155, 34, 0.08)', border: '1px solid rgba(77, 155, 34, 0.25)', borderRadius: '6px', fontSize: '11px', color: '#72BC28', fontWeight: 'bold', marginBottom: '12px', gap: '12px', flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#72BC28" />
              Successfully processed {successResult.count || 1} images!
            </span>
            {successResult.targetFolder && (
              <button 
                onClick={async () => { try { await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: successResult.targetFolder }) }); } catch (e) {} }} 
                style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer' }} 
                title="Open Output Folder"
              >
                <FolderOpen size={16} color="var(--primary-color)" />
              </button>
            )}
          </div>
        )}

        {/* Single Contiguous Queue Box */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '12px', flexShrink: 0 }}>
            {files.map((file, idx) => {
              const fileName = typeof file === 'string' ? path.basename(file) : file.name;
              const filePath = typeof file === 'string' ? file : file.path;
              const fileSize = typeof file === 'string' ? 0 : file.size;
              const ext = (path.extname(fileName) || '').toUpperCase().replace('.', '');
              const isDragTarget = dragOverIndex === idx;
              return (
                <div 
                  key={idx} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, idx)} 
                  onDragOver={(e) => handleDragOver(e, idx)} 
                  onDragLeave={handleDragLeave} 
                  onDragEnd={handleDragEnd} 
                  onDrop={(e) => handleDrop(e, idx)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 14px', 
                    borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)', 
                    borderTop: isDragTarget ? '3px solid var(--primary-color)' : 'none',
                    background: isDragTarget ? 'rgba(77, 155, 34, 0.15)' : 'transparent', 
                    opacity: draggedIndex === idx ? 0.5 : 1, 
                    transition: 'all 0.15s ease', 
                    cursor: 'grab' 
                  }} 
                  onClick={() => setActivePreviewFile(file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '13px', userSelect: 'none' }}>⋮⋮</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`${API_BASE}/image-preview?path=${encodeURIComponent(filePath)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fileName}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{ext} • {formatFileSize(fileSize)}</span>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }} onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }} title="Remove item">
                    <Trash2 size={15} color="var(--primary-color)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Dropzone placed at bottom */}
        <div className="dropzone flex-center" onClick={() => document.getElementById('image-studio-add-file-input').click()} style={{ padding: '20px', position: 'relative', marginTop: 'auto', flexShrink: 0 }}>
          <input type="file" id="image-studio-add-file-input" multiple accept=".jpg,.jpeg,.png,.webp,.avif,.heic" onChange={(e) => { if (e.target.files) { const newFiles = Array.from(e.target.files).map(file => ({ name: file.name, path: file.path || file.name, size: file.size })); onFilesChange(prev => [...prev, ...newFiles.filter(f => !prev.some(x => x.path === f.path))]); } }} style={{ display: 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add more files or drag & drop</span>
          <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports JPEG, PNG, WEBP, AVIF, HEIC</span>
        </div>
      </div>

      {/* Right Sidebar: Accordion Collapsible Sections */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Image size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>IMAGE RESIZER</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 16px 0' }}>Batch resize and convert images.</p>

        {/* Right Sidebar Preview Box */}
        {currentSelectedFile && (() => {
          const fn = typeof currentSelectedFile === 'string' ? path.basename(currentSelectedFile) : currentSelectedFile.name;
          const fp = typeof currentSelectedFile === 'string' ? currentSelectedFile : currentSelectedFile.path;
          return (
            <div className="glass-panel" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '16px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <button 
                onClick={() => onOpenFullscreenPreview && onOpenFullscreenPreview({ name: fn, path: fp })} 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#FFF', cursor: 'pointer', zIndex: 5 }} 
                title="Fullscreen Preview"
              >
                <Maximize2 size={12} />
              </button>
              <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <img 
                  src={`${API_BASE}/image-preview?path=${encodeURIComponent(fp)}`} 
                  alt="" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', marginTop: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {fn}
              </span>
            </div>
          );
        })()}

        <div className="sidebar-settings-content">
          {/* Section 1: Output Format & Quality */}
          <div style={{ marginBottom: '16px' }}>
            <div onClick={() => setSectionConfigExpanded(!sectionConfigExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Output Format</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionConfigExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionConfigExpanded && (
              <div className="animate-fade-in">
                <div className="clean-preset-grid" style={{ marginBottom: '12px' }}>
                  {['jpg', 'png', 'webp', 'avif'].map((fmt) => (
                    <button key={fmt} className={`clean-preset-btn ${format === fmt ? 'active' : ''}`} onClick={() => setFormat(fmt)}>{fmt.toUpperCase()}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Quality</span>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)' }}>{quality}%</span>
                </div>
                <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} />
              </div>
            )}
          </div>

          {/* Section 2: Resize Options */}
          <div style={{ marginBottom: '16px' }}>
            <div onClick={() => setSectionResizeExpanded(!sectionResizeExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resize Options</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionResizeExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionResizeExpanded && (
              <div className="animate-fade-in">
                <span className="form-label" style={{ fontSize: '10px' }}>Resize Mode</span>
                <select className="form-input" value={resizeMode} onChange={(e) => setResizeMode(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px', marginBottom: '8px' }}>
                  <option value="none">Original Resolution</option>
                  <option value="resolution">Pixels</option>
                  <option value="percentage">Percentage Scale</option>
                  <option value="proportionate">Proportionate</option>
                </select>

                {resizeMode === 'percentage' && (
                  <div>
                    <span className="form-label" style={{ fontSize: '9px' }}>Scale %</span>
                    <input type="number" className="form-input" value={scalePercent} onChange={(e) => setScalePercent(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }} />
                  </div>
                )}
                {resizeMode === 'resolution' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Width (px)</span>
                      <input type="number" className="form-input" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="Auto" style={{ padding: '6px 10px', fontSize: '12px' }} />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Height (px)</span>
                      <input type="number" className="form-input" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Auto" style={{ padding: '6px 10px', fontSize: '12px' }} />
                    </div>
                  </div>
                )}
                {resizeMode === 'proportionate' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Anchor</span>
                      <select className="form-input" value={proportionateAnchor} onChange={(e) => setProportionateAnchor(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                        <option value="width">Width</option>
                        <option value="height">Height</option>
                      </select>
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Value (px)</span>
                      <input type="number" className="form-input" value={proportionateValue} onChange={(e) => setProportionateValue(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Target Directory */}
          <div style={{ marginBottom: '16px' }}>
            <div onClick={() => setSectionSaveExpanded(!sectionSaveExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Destination</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionSaveExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionSaveExpanded && (
              <div className="animate-fade-in">
                <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                  <button className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`} onClick={() => setSaveDestMode('original')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Original</button>
                  <button className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`} onClick={() => setSaveDestMode('default')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Default</button>
                  <button className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`} onClick={() => { setSaveDestMode('custom'); handleBrowseDestFolder(); }} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Custom...</button>
                </div>
                {saveDestMode === 'custom' && customDestPath && (
                  <div style={{ fontSize: '10px', color: 'var(--primary-color)', marginTop: '6px', wordBreak: 'break-all' }}>
                    Path: {customDestPath}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input type="checkbox" id="chk-img-open-folder" checked={openOnComplete} onChange={(e) => setOpenOnComplete(e.target.checked)} />
                  <label htmlFor="chk-img-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>Auto-Open Output Directory</label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button className="process-action-btn flex-center" onClick={handleConvert} disabled={processing || files.length === 0} style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'PROCESSING...' : 'PROCESS SELECTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------------
function WatermarkerStudio({ files, setFiles, setGlobalProgress, explorerPreviewFile, setExplorerPreviewFile, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, onOpenFullscreenPreview, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [watermark, setWatermark] = useState(() => localStorage.getItem('rfine_wm_watermark') || '');
  const [watermarkType, setWatermarkType] = useState(() => localStorage.getItem('rfine_wm_type') || 'image'); 
  const [watermarkText, setWatermarkText] = useState(() => localStorage.getItem('rfine_wm_text') || 'RFINE Copyright'); 
  const [watermarkOpacity, setWatermarkOpacity] = useState(() => parseFloat(localStorage.getItem('rfine_wm_opacity')) || 0.35);
  const [watermarkSize, setWatermarkSize] = useState(() => parseInt(localStorage.getItem('rfine_wm_size')) || 15);
  const [watermarkPosition, setWatermarkPosition] = useState(() => localStorage.getItem('rfine_wm_position') || 'bottom-right');
  const [watermarkFileName, setWatermarkFileName] = useState(() => localStorage.getItem('rfine_wm_filename') || '');
  
  const [watermarkX, setWatermarkX] = useState(() => parseFloat(localStorage.getItem('rfine_wm_x')) || 82);
  const [watermarkY, setWatermarkY] = useState(() => parseFloat(localStorage.getItem('rfine_wm_y')) || 82);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreenAdjusterOpen, setIsFullscreenAdjusterOpen] = useState(false);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_wm_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_wm_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_wm_open_on_complete');
    return val === null ? true : val === 'true';
  });

  const [sectionConfigExpanded, setSectionConfigExpanded] = useState(true);
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  const handleDragStart = (e, index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDragLeave = () => setDragOverIndex(null);
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const updated = [...files];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    setFiles(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activePreviewFile === files[index]) setActivePreviewFile(null);
  };

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        if (selectedPath) {
          setCustomDestPath(selectedPath);
          setSaveDestMode('custom');
          localStorage.setItem('rfine_wm_custom_dest_path', selectedPath);
          localStorage.setItem('rfine_wm_save_dest_mode', 'custom');
        }
      });
    }
  };

  const handleApplyWatermark = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setSuccessResult(null);
    try {
      const targetDir = saveDestMode === 'original' ? undefined : saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || undefined) : customDestPath || undefined;
      const res = await fetch(`${API_BASE}/watermark/apply-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files, watermarkType, watermarkText, watermark, watermarkOpacity, watermarkSize,
          watermarkX, watermarkY,
          outputFolder: targetDir
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply watermark');
      let lastSavedFolder = data.targetFolder || (files[0] && files[0].path ? files[0].path.substring(0, files[0].path.lastIndexOf('\\')) : '');
      setSuccessResult({ results: data.results, targetFolder: lastSavedFolder, count: files.length });

      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: lastSavedFolder }) });
        } catch (e) {}
      }
    } catch (e) { alert('Processing failed: ' + e.message); }
    finally { setProcessing(false); }
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWatermarkFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => setWatermark(uploadEvent.target.result);
      reader.readAsDataURL(file);
    }
  };

  const currentSelectedFile = activePreviewFile || files[0];

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setWatermarkX(x);
    setWatermarkY(y);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflowY: 'auto' }}>
        <CollapsibleFileBrowser isFileBrowserCollapsed={isFileBrowserCollapsed} toggleFileBrowser={toggleFileBrowser} explorerHeight={explorerHeight} handleDividerMouseDown={handleDividerMouseDown}>
          <FileExplorer 
            onAddFiles={(newFiles) => {
              setFiles(prev => {
                const updated = [...prev];
                newFiles.forEach(f => { if (!updated.some(x => x.path === f.path)) updated.push(f); });
                return updated;
              });
            }}
            onPreviewFile={(item) => setActivePreviewFile(item)}
            allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
            storageKey="rfine_last_dir_wm"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {/* Processing Queue Header with Grey Clear Queue Button & Uniform Spacing */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0, marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processing Queue</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(77, 155, 34, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px' }}>
              {files.length} {files.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          {files.length > 0 && (
            <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10.5px', color: 'var(--color-slate)', borderColor: 'transparent', background: 'transparent' }} onClick={() => { setFiles([]); setActivePreviewFile(null); setSuccessResult(null); }}>
              Clear Queue
            </button>
          )}
        </div>

        {/* Success Banner (Square Folder Icon Only) */}
        {successResult && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: 'rgba(77, 155, 34, 0.08)', border: '1px solid rgba(77, 155, 34, 0.25)', borderRadius: '6px', fontSize: '11px', color: '#72BC28', fontWeight: 'bold', marginBottom: '12px', gap: '12px', flexShrink: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#72BC28" />
              Watermark applied successfully!
            </span>
            {successResult.targetFolder && (
              <button 
                onClick={async () => { try { await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: successResult.targetFolder }) }); } catch (e) {} }} 
                style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer' }} 
                title="Open Output Folder"
              >
                <FolderOpen size={16} color="var(--primary-color)" />
              </button>
            )}
          </div>
        )}

        {/* Queue List (JPG • 355 KB with NO size reduction pill) */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '12px', flexShrink: 0 }}>
            {files.map((file, idx) => {
              const fileName = typeof file === 'string' ? path.basename(file) : file.name;
              const filePath = typeof file === 'string' ? file : file.path;
              const fileSize = typeof file === 'string' ? 0 : file.size;
              const ext = (path.extname(fileName) || '').toUpperCase().replace('.', '');
              const isDragTarget = dragOverIndex === idx;
              return (
                <div 
                  key={idx} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, idx)} 
                  onDragOver={(e) => handleDragOver(e, idx)} 
                  onDragLeave={handleDragLeave} 
                  onDragEnd={handleDragEnd} 
                  onDrop={(e) => handleDrop(e, idx)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '10px 14px', 
                    borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)', 
                    borderTop: isDragTarget ? '3px solid var(--primary-color)' : 'none',
                    background: isDragTarget ? 'rgba(77, 155, 34, 0.15)' : 'transparent', 
                    opacity: draggedIndex === idx ? 0.5 : 1, 
                    transition: 'all 0.15s ease', 
                    cursor: 'grab' 
                  }} 
                  onClick={() => setActivePreviewFile(file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '13px', userSelect: 'none' }}>⋮⋮</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={`${API_BASE}/image-preview?path=${encodeURIComponent(filePath)}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fileName}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{ext} • {formatFileSize(fileSize)}</span>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }} onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }} title="Remove item">
                    <Trash2 size={15} color="var(--primary-color)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Unified Dropzone at bottom */}
        <div className="dropzone flex-center" onClick={() => document.getElementById('wm-studio-add-file-input').click()} style={{ padding: '20px', position: 'relative', marginTop: 'auto', flexShrink: 0 }}>
          <input type="file" id="wm-studio-add-file-input" multiple accept=".jpg,.jpeg,.png,.webp,.avif,.heic" onChange={(e) => { if (e.target.files) { const newFiles = Array.from(e.target.files).map(file => ({ name: file.name, path: file.path || file.name, size: file.size })); setFiles(prev => [...prev, ...newFiles.filter(f => !prev.some(x => x.path === f.path))]); } }} style={{ display: 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add more files or drag & drop</span>
          <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports JPEG, PNG, WEBP, AVIF, HEIC</span>
        </div>
      </div>

      {/* Right Sidebar: Watermark Settings & Preview Card with Fullscreen Button */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Layers size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>WATERMARKER</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 16px 0' }}>Batch watermark images.</p>

        {/* Preview Card with Expand Button */}
        {currentSelectedFile && (() => {
          const fn = typeof currentSelectedFile === 'string' ? path.basename(currentSelectedFile) : currentSelectedFile.name;
          const fp = typeof currentSelectedFile === 'string' ? currentSelectedFile : currentSelectedFile.path;
          return (
            <div className="glass-panel" style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '16px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)' }}>
              <button 
                onClick={() => setIsFullscreenAdjusterOpen(true)} 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--glass-border)', color: '#FFF', cursor: 'pointer', zIndex: 5 }} 
                title="Interactive Fullscreen Adjuster"
              >
                <Maximize2 size={12} />
              </button>
              <div 
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleCanvasMouseMove}
                style={{ width: '100%', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.3)', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <img 
                  src={`${API_BASE}/image-preview?path=${encodeURIComponent(fp)}`} 
                  alt="" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                  onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
                {watermarkType === 'text' && watermarkText && (
                  <div style={{ position: 'absolute', left: `${watermarkX}%`, top: `${watermarkY}%`, color: '#FFFFFF', opacity: watermarkOpacity, fontSize: `${watermarkSize * 0.8}px`, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    {watermarkText}
                  </div>
                )}
                {watermarkType === 'image' && watermark && (
                  <img src={watermark} alt="wm" style={{ position: 'absolute', left: `${watermarkX}%`, top: `${watermarkY}%`, width: `${watermarkSize * 2}px`, opacity: watermarkOpacity, pointerEvents: 'none', userSelect: 'none' }} />
                )}
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', marginTop: '8px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {fn}
              </span>
            </div>
          );
        })()}

        <div className="sidebar-settings-content">
          {/* Section 1: Configuration */}
          <div style={{ marginBottom: '16px' }}>
            <div onClick={() => setSectionConfigExpanded(!sectionConfigExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Configuration</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionConfigExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionConfigExpanded && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span className="form-label" style={{ fontSize: '10px' }}>Watermark Type</span>
                <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <button className={`clean-preset-btn ${watermarkType === 'image' ? 'active' : ''}`} onClick={() => setWatermarkType('image')}>Image Logo</button>
                  <button className={`clean-preset-btn ${watermarkType === 'text' ? 'active' : ''}`} onClick={() => setWatermarkType('text')}>Text</button>
                </div>

                {watermarkType === 'text' ? (
                  <div>
                    <span className="form-label" style={{ fontSize: '9px' }}>Text Content</span>
                    <input type="text" className="form-input" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }} />
                  </div>
                ) : (
                  <div>
                    <span className="form-label" style={{ fontSize: '9px' }}>Upload Logo Image</span>
                    <input type="file" accept="image/*" onChange={handleWatermarkUpload} style={{ fontSize: '11px', color: 'var(--color-slate)' }} />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-label" style={{ fontSize: '9px' }}>Opacity</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-white)' }}>{Math.round(watermarkOpacity * 100)}%</span>
                </div>
                <input type="range" min="0.05" max="1" step="0.05" value={watermarkOpacity} onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="form-label" style={{ fontSize: '9px' }}>Size</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-white)' }}>{watermarkSize}%</span>
                </div>
                <input type="range" min="5" max="50" value={watermarkSize} onChange={(e) => setWatermarkSize(parseInt(e.target.value))} />
              </div>
            )}
          </div>

          {/* Section 2: Save Destination */}
          <div style={{ marginBottom: '16px' }}>
            <div onClick={() => setSectionSaveExpanded(!sectionSaveExpanded)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Destination</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionSaveExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionSaveExpanded && (
              <div className="animate-fade-in">
                <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                  <button className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`} onClick={() => setSaveDestMode('original')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Original</button>
                  <button className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`} onClick={() => setSaveDestMode('default')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Default</button>
                  <button className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`} onClick={() => { setSaveDestMode('custom'); handleBrowseDestFolder(); }} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Custom...</button>
                </div>
                {saveDestMode === 'custom' && customDestPath && (
                  <div style={{ fontSize: '10px', color: 'var(--primary-color)', marginTop: '6px', wordBreak: 'break-all' }}>
                    Path: {customDestPath}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input type="checkbox" id="chk-wm-open-folder" checked={openOnComplete} onChange={(e) => setOpenOnComplete(e.target.checked)} />
                  <label htmlFor="chk-wm-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>Auto-Open Output Directory</label>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button className="process-action-btn flex-center" onClick={handleApplyWatermark} disabled={processing || files.length === 0} style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'PROCESSING...' : 'APPLY WATERMARK'}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Watermark Adjuster Modal */}
      {isFullscreenAdjusterOpen && currentSelectedFile && (() => {
        const fp = typeof currentSelectedFile === 'string' ? currentSelectedFile : currentSelectedFile.path;
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px' }} onClick={() => setIsFullscreenAdjusterOpen(false)}>
            <div className="glass-card animate-scale-up" onClick={(e) => e.stopPropagation()} style={{ width: '90vw', height: '85vh', padding: '20px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="var(--primary-color)" />
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-white)' }}>Drag Watermark to Adjust Placement</span>
                </div>
                <button onClick={() => setIsFullscreenAdjusterOpen(false)} className="btn-primary" style={{ padding: '6px 14px', fontSize: '11px' }}>Apply & Close</button>
              </div>

              <div 
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleCanvasMouseMove}
                style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.4)', position: 'relative', cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <img 
                  src={`${API_BASE}/image-preview?path=${encodeURIComponent(fp)}`} 
                  alt="" 
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                />
                {watermarkType === 'text' && watermarkText && (
                  <div style={{ position: 'absolute', left: `${watermarkX}%`, top: `${watermarkY}%`, color: '#FFFFFF', opacity: watermarkOpacity, fontSize: `${watermarkSize * 1.5}px`, fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
                    {watermarkText}
                  </div>
                )}
                {watermarkType === 'image' && watermark && (
                  <img src={watermark} alt="wm" style={{ position: 'absolute', left: `${watermarkX}%`, top: `${watermarkY}%`, width: `${watermarkSize * 4}px`, opacity: watermarkOpacity, pointerEvents: 'none', userSelect: 'none' }} />
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


// ----------------------------------------------------------------------------
function VideoCompressor({ files, setFiles, setGlobalProgress, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [format, setFormat] = useState(() => localStorage.getItem('rfine_vid_format') || 'mp4');
  const [qualityPercent, setQualityPercent] = useState(() => parseInt(localStorage.getItem('rfine_vid_qualitypercent')) || 80); 
  const [scale, setScale] = useState(() => localStorage.getItem('rfine_vid_scale') || '?x720'); 
  const [muteAudio, setMuteAudio] = useState(() => localStorage.getItem('rfine_vid_muteaudio') === 'true'); 
  const [compressing, setCompressing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null); 
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_vid_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_vid_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_vid_open_on_complete');
    return val === null ? true : val === 'true';
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, idx) => setDraggedIndex(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIndex(idx); };
  const handleDragLeave = () => setDragOverIndex(null);
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const reordered = [...files];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(idx, 0, removed);
    setFiles(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
      setExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        setCustomDestPath(selectedPath);
        setSaveDestMode('custom');
      });
    }
  };

  const handleAddVideo = (selected) => {
    const formatted = selected.map(f => typeof f === 'string' ? { path: f, name: path.basename(f), size: 0 } : f);
    setFiles(prev => [...prev, ...formatted.filter(item => !prev.some(x => x.path === item.path))]);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setCompressing(true);
    setSuccessResult(null);
    const mappedCrf = Math.round(35 - ((qualityPercent - 10) / 90) * 17);
    let lastSavedFolder = '';
    const results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        setGlobalProgress({ active: true, percent: Math.round((i / files.length) * 100), label: `Compressing ${i + 1}/${files.length}: ${currentFile.name}...` });

        const targetDir = saveDestMode === 'original' ? undefined : saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || undefined) : customDestPath || undefined;

        const res = await fetch(`${API_BASE}/video/compress-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ localPath: currentFile.path, format, crf: mappedCrf, scale, outputFolder: targetDir, muteAudio })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start compression');
        lastSavedFolder = data.targetFolder || '';
        results.push({ name: currentFile.name, success: true, originalSize: currentFile.size, optimizedSize: data.optimizedSize || 0 });
        if (addRecentProcess) addRecentProcess('Video Compressor', currentFile.name, currentFile.size, data.optimizedSize || null, lastSavedFolder);
      }
      setSuccessResult({ targetFolder: lastSavedFolder, count: files.length, results });
      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: lastSavedFolder }) });
        } catch (e) {}
      }
    } catch (err) { alert('Compression error: ' + err.message); }
    finally { setCompressing(false); setGlobalProgress({ active: false, percent: 0, label: '' }); }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
        <CollapsibleFileBrowser isFileBrowserCollapsed={isFileBrowserCollapsed} toggleFileBrowser={toggleFileBrowser} explorerHeight={explorerHeight} handleDividerMouseDown={handleDividerMouseDown}>
          <FileExplorer 
            onAddFiles={handleAddVideo} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_video"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '15px', flexShrink: 0 }}>
            {files.map((file, idx) => {
              const fileName = typeof file === 'string' ? path.basename(file) : file.name;
              const fileSize = typeof file === 'string' ? '' : formatFileSize(file.size);
              const ext = path.extname(fileName).toUpperCase().replace('.', '');
              return (
                <div key={idx} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, idx)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)', cursor: 'grab' }} onClick={() => setActivePreviewFile(file)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }}>⋮⋮</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>{fileName} ({ext} • {fileSize})</span>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, i) => i !== idx)); }}><Trash2 size={14} color="var(--primary-color)" /></button>
                </div>
              );
            })}
          </div>
        )}

        <div className="dropzone flex-center" onClick={() => document.getElementById('vid-compress-add-file-input').click()} style={{ padding: '20px', position: 'relative' }}>
          <input type="file" id="vid-compress-add-file-input" multiple accept=".mp4,.webm,.mkv,.mov" onChange={(e) => { if (e.target.files) handleAddVideo(Array.from(e.target.files).map(f => ({ name: f.name, path: f.path || f.name, size: f.size }))); }} style={{ display: 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add video files or drag & drop</span>
        </div>
      </div>

      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Video size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>VIDEO COMPRESSOR</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0' }}>Batch compress and resize video files.</p>

        <div className="sidebar-settings-content">
          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Target Quality: {qualityPercent}%</span>
            <input type="range" min="10" max="100" value={qualityPercent} onChange={(e) => setQualityPercent(parseInt(e.target.value))} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Resolution</span>
            <select className="form-input" value={scale} onChange={(e) => setScale(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
              <option value="none">Original Resolution</option>
              <option value="?x1080">1080p FHD</option>
              <option value="?x720">720p HD</option>
              <option value="?x480">480p SD</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Output Format</span>
            <div className="clean-preset-grid">
              {['mp4', 'webm', 'mkv'].map(fmt => (
                <button key={fmt} className={`clean-preset-btn ${format === fmt ? 'active' : ''}`} onClick={() => setFormat(fmt)}>{fmt.toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input type="checkbox" id="chk-mute" checked={muteAudio} onChange={(e) => setMuteAudio(e.target.checked)} />
            <label htmlFor="chk-mute" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>Mute Audio Track</label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>Target Directory</span>
            <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
              <button className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`} onClick={() => setSaveDestMode('original')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Original</button>
              <button className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`} onClick={() => setSaveDestMode('default')} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Default</button>
              <button className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`} onClick={handleBrowseDestFolder} style={{ padding: '6px 4px', fontSize: '9.5px' }}>Custom...</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <input type="checkbox" id="chk-vid-open" checked={openOnComplete} onChange={(e) => setOpenOnComplete(e.target.checked)} />
              <label htmlFor="chk-vid-open" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>Auto-Open Output Directory</label>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button className="process-action-btn flex-center" onClick={handleCompress} disabled={compressing || files.length === 0} style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{compressing ? 'COMPRESSING...' : 'COMPRESS SELECTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------------
function FileRenamer({ files, setFiles, setGlobalProgress, explorerPreviewFile, setExplorerPreviewFile, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, onOpenFullscreenPreview, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [folderPath, setFolderPath] = useState('');
  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem('rfine_rename_rules');
      return saved ? JSON.parse(saved) : {
        find: '',
        replace: '',
        prefix: '',
        suffix: '',
        casing: 'none',
        caseSensitive: false,
        numbering: false,
        numberingStart: 1,
        numberingDigits: 2,
        discardOriginal: false 
      };
    } catch {
      return {
        find: '',
        replace: '',
        prefix: '',
        suffix: '',
        casing: 'none',
        caseSensitive: false,
        numbering: false,
        numberingStart: 1,
        numberingDigits: 2,
        discardOriginal: false 
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('rfine_rename_rules', JSON.stringify(rules));
  }, [rules]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [applying, setApplying] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [showGuide, setShowGuide] = useState(false); 
  const [draggedIndex, setDraggedIndex] = useState(null); 
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [successResult, setSuccessResult] = useState(null); // Success banner track
  
  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_rename_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_rename_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_rename_open_on_complete');
    return val === null ? true : val === 'true';
  });
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  useEffect(() => { localStorage.setItem('rfine_rename_save_dest_mode', saveDestMode); }, [saveDestMode]);
  useEffect(() => { localStorage.setItem('rfine_rename_custom_dest_path', customDestPath); }, [customDestPath]);
  useEffect(() => { localStorage.setItem('rfine_rename_open_on_complete', openOnComplete); }, [openOnComplete]);

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        setCustomDestPath(selectedPath);
        setSaveDestMode('custom');
      });
    }
  };

  const [sectionFindReplaceExpanded, setSectionFindReplaceExpanded] = useState(true);
  const [sectionCasingExpanded, setSectionCasingExpanded] = useState(true);



  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
      setExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (explorerPreviewFile) {
      setActivePreviewFile(explorerPreviewFile);
    }
  }, [explorerPreviewFile]);

  const handleAddExplorerFiles = (newFiles) => {
    setFiles(prev => {
      const existingPaths = prev.map(f => f.path);
      const filtered = newFiles.filter(nf => !existingPaths.includes(nf.path));
      return [...prev, ...filtered.map(f => ({ ...f, selected: true }))];
    });
    if (newFiles.length > 0) {
      setActivePreviewFile(newFiles[0]);
    }
    setSuccessResult(null);
  };

  const toggleSelectFile = (index) => {
    const updated = [...files];
    updated[index].selected = !updated[index].selected;
    setFiles(updated);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Clear index on leave
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...files];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setFiles(updated);
    setDraggedIndex(null);
  };

  useEffect(() => {
    const activeFiles = files.filter(f => f.selected);
    if (activeFiles.length === 0) {
      setPreviewFiles([]);
      return;
    }

    const calculatePreview = async () => {
      try {
        const res = await fetch(`${API_BASE}/rename`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dirPath: folderPath, files: activeFiles, rules, dryRun: true })
        });
        const data = await res.json();
        if (data.results) {
          setPreviewFiles(data.results);
        }
      } catch (err) {
        console.error(err);
      }
    };
    calculatePreview();
  }, [files, rules]);

  const handleApplyRename = async () => {
    const activeFiles = files.filter(f => f.selected);
    if (activeFiles.length === 0) return;
    setApplying(true);
    setSuccessResult(null);
    setGlobalProgress({ active: true, percent: 50, label: 'Renaming files...' });

    let targetDir = '';
    if (saveDestMode === 'original') {
      targetDir = folderPath;
    } else if (saveDestMode === 'default') {
      targetDir = localStorage.getItem('rfine_def_save_dir') || '';
    } else if (saveDestMode === 'custom') {
      targetDir = customDestPath;
    }

    try {
      const res = await fetch(`${API_BASE}/rename`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dirPath: targetDir, files: activeFiles, rules, dryRun: false })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to rename files');
      
      if (addRecentProcess && data.results) {
        data.results.forEach(item => {
          addRecentProcess('Bulk Renamer', `${item.oldName} → ${item.newName}`, null, null, data.targetFolder || folderPath);
        });
      }
      
      setGlobalProgress({ active: true, percent: 100, label: 'Files renamed successfully!' });
      setTimeout(() => setGlobalProgress({ active: false, percent: 0, label: '' }), 3000);
      
      setSuccessResult({ targetFolder: data.targetFolder || folderPath });
      setFiles([]);
      setActivePreviewFile(null);
    } catch (err) {
      setGlobalProgress({ active: false, percent: 0, label: '' });
      alert(err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="workspace-layout">
      {/* Middle Canvas: File Explorer + Processing Queue */}
      <div className="middle-canvas">
        <CollapsibleFileBrowser
          isFileBrowserCollapsed={isFileBrowserCollapsed}
          toggleFileBrowser={toggleFileBrowser}
          explorerHeight={explorerHeight}
          handleDividerMouseDown={handleDividerMouseDown}
        >
          <FileExplorer 
            onAddFiles={handleAddExplorerFiles} 
            maxListHeight={null} 
            onPreviewFile={setExplorerPreviewFile}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_rename_dir') || undefined}
            onPathChange={setFolderPath}
            storageKey="rfine_last_dir_rename"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {/* Processing Queue Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processing Queue</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(77, 155, 34, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px' }}>
              {files.length} {files.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          {files.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                onClick={() => setFiles(files.map(f => ({ ...f, selected: true })))} 
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '10px' }}
              >
                Select All
              </button>
              <button 
                onClick={() => setFiles(files.map(f => ({ ...f, selected: false })))} 
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '10px' }}
              >
                Deselect All
              </button>
              <button 
                onClick={() => { setFiles([]); setSuccessResult(null); }} 
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '4px' }}
              >
                Clear Queue
              </button>
            </div>
          )}
        </div>

        {successResult && (
          <div className="animate-fade-in" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '10px 14px', 
            background: 'rgba(77, 155, 34, 0.08)', 
            border: '1px solid rgba(77, 155, 34, 0.25)', 
            borderRadius: '6px', 
            fontSize: '11px', 
            color: '#72BC28', 
            fontWeight: 'bold',
            marginBottom: '12px',
            gap: '12px',
            flexShrink: 0
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#72BC28" />
              Files renamed successfully!
            </span>
            {successResult.targetFolder && (
              <button 
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/open-folder`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ folderPath: successResult.targetFolder })
                    });
                  } catch (e) { console.error(e); }
                }}
                className="btn-secondary"
                style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', borderColor: 'var(--glass-border)', color: 'var(--primary-color)', borderRadius: '4px' }}
                title="Open Saved Directory"
              >
                <FolderOpen size={14} color="var(--primary-color)" />
              </button>
            )}
          </div>
        )}

        {/* Selected Files List */}
        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '15px', flexShrink: 0 }}>
            {files.map((file, idx) => {
              const matchedProposed = previewFiles.find(p => p.oldName === file.name);
              const isCurrentActive = activePreviewFile?.path === file.path;
              const isImage = ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(file.ext?.toLowerCase());
              return (
                <div 
                  key={idx} 
                  onClick={() => setActivePreviewFile(file)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, idx)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px', 
                    borderBottom: dragOverIndex === idx && draggedIndex !== null && draggedIndex < idx ? '2px solid var(--secondary-color)' : (idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)'), 
                    borderTop: dragOverIndex === idx && draggedIndex !== null && draggedIndex > idx ? '2px solid var(--secondary-color)' : 'none',
                    backgroundColor: isCurrentActive ? 'rgba(77, 155, 34, 0.12)' : 'transparent',
                    cursor: 'grab'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <GripVertical size={14} style={{ color: 'var(--color-slate)', flexShrink: 0 }} />
                    <input 
                      type="checkbox" 
                      checked={file.selected} 
                      onChange={(e) => { e.stopPropagation(); toggleSelectFile(idx); }} 
                      style={{ flexShrink: 0 }}
                    />
                    <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      {isImage ? (
                        <img 
                          src={`${API_BASE}/image-preview?path=${encodeURIComponent(file.path)}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          alt=""
                        />
                      ) : (
                        <FileText size={16} color="var(--primary-color)" />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                      {file.selected && matchedProposed && matchedProposed.changed && (
                        <span style={{ color: 'var(--secondary-color)', fontSize: '10px', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          &rarr; {matchedProposed.newName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '10px' }}>{formatFileSize(file.size)}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = files.filter((_, i) => i !== idx);
                        setFiles(updated);
                      }}
                      style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px' }}
                      title="Remove file from queue"
                    >
                      <Trash2 size={14} color="var(--primary-color)" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div 
          className="dropzone flex-center" 
          onClick={() => document.getElementById('file-renamer-add-file-input').click()}
          style={{ 
            padding: '20px', 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <input 
            type="file"
            id="file-renamer-add-file-input"
            multiple
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files).map(file => ({
                  name: file.name,
                  path: file.path || file.name,
                  size: file.size,
                  type: file.type,
                  selected: true,
                  ext: file.name.substring(file.name.lastIndexOf('.'))
                }));
                setFiles(prev => {
                  const existingPaths = new Set(prev.map(f => f.path));
                  const uniqueNew = newFiles.filter(f => !existingPaths.has(f.path));
                  return [...prev, ...uniqueNew];
                });
              }
            }}
            style={{ display: 'none' }}
          />
          {isDraggingFile ? (
            <>
              <Download size={20} color="var(--primary-color)" className="animate-bounce" style={{ color: 'var(--primary-color)' }} />
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)' }}>Drop files here to start refining</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add files or drag & drop</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Rearrange numbering sequence by dragging queue list items</span>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Type size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Bulk Renamer</h2>
          </div>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 'bold' }}
            title="How to rename files"
          >
            <Info size={14} />
            Guide
          </button>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Batch rename files.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Collapsible Info Guide Banner */}
          {showGuide && (
            <div className="glass-card animate-fade-in" style={{ padding: '10px 14px', background: 'rgba(77, 155, 34, 0.05)', border: '1px solid rgba(77, 155, 34, 0.2)', borderRadius: '6px', fontSize: '11px', color: 'var(--color-light-gray)', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '15px', flexShrink: 0 }}>
              <strong style={{ color: '#FFF' }}>Rename Pattern Rules:</strong>
              <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li><strong>Discard Original Filename</strong>: Completely ignores the original name. Useful to build names entirely from prefix + numbering (e.g., A154-ABC-1.JPG).</li>
                <li><strong>Find & Replace</strong>: Finds matching characters and swaps them.</li>
                <li><strong>Prefix / Suffix</strong>: Inserts text at the start or end of the filename.</li>
                <li><strong>Casing</strong>: Changes lettering (lowercase, UPPERCASE, kebab-case, snake_case).</li>
                <li><strong>Auto-Numbering</strong>: Appends incrementing sequence numbers (e.g. 01, 02).</li>
                <li>💡 <em>Drag and drop the queue items to rearrange the numbering order!</em></li>
              </ul>
            </div>
          )}

          {/* Selection Preview at top of settings sidebar */}
          {activePreviewFile && (
            <div className="animate-fade-in" style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '15px', border: '1px solid var(--glass-border)', textAlign: 'center', flexShrink: 0, position: 'relative' }}>
              {onOpenFullscreenPreview && (
                <button
                  onClick={() => onOpenFullscreenPreview(activePreviewFile)}
                  className="btn-secondary"
                  style={{ position: 'absolute', top: '6px', right: '6px', padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', zIndex: 5 }}
                  title="Open Fullscreen Preview"
                >
                  <Maximize2 size={12} color="#FFFFFF" />
                </button>
              )}
              {['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(activePreviewFile.ext?.toLowerCase()) ? (
                <img 
                  src={`${API_BASE}/image-preview?path=${encodeURIComponent(activePreviewFile.path)}`}
                  style={{ maxWidth: '100%', maxHeight: '100px', borderRadius: '4px', objectFit: 'contain' }}
                  alt=""
                />
              ) : (
                <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} color="var(--primary-color)" />
                </div>
              )}
              <span style={{ fontSize: '10px', color: 'var(--color-slate)', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {activePreviewFile.name}
              </span>
            </div>
          )}

          {/* Category 1: Find & Replace Options */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionFindReplaceExpanded(!sectionFindReplaceExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Find & Replace Options</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionFindReplaceExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionFindReplaceExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Find</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={rules.find} 
                      onChange={(e) => setRules({ ...rules, find: e.target.value })}
                      placeholder="Find match"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Replace</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={rules.replace} 
                      onChange={(e) => setRules({ ...rules, replace: e.target.value })}
                      placeholder="Replace with"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Prefix</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={rules.prefix} 
                      onChange={(e) => setRules({ ...rules, prefix: e.target.value })}
                      placeholder="Prefix text"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    />
                  </div>
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Suffix</span>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={rules.suffix} 
                      onChange={(e) => setRules({ ...rules, suffix: e.target.value })}
                      placeholder="Suffix text"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category 2: Casing & Numbering */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionCasingExpanded(!sectionCasingExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Casing & Numbering</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionCasingExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionCasingExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Case Converter Presets</span>
                  <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'none' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'none' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'lower' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'lower' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      lowercase
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'upper' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'upper' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      UPPERCASE
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'title' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'title' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      Title Case
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'kebab' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'kebab' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      kebab-case
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${rules.casing === 'snake' ? 'active' : ''}`}
                      onClick={() => setRules({ ...rules, casing: 'snake' })}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      snake_case
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-discard-orig"
                    checked={rules.discardOriginal}
                    onChange={(e) => setRules({ ...rules, discardOriginal: e.target.checked })}
                  />
                  <label htmlFor="chk-discard-orig" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
                    Discard Original Filename
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-numbering-v2"
                    checked={rules.numbering}
                    onChange={(e) => setRules({ ...rules, numbering: e.target.checked })}
                  />
                  <label htmlFor="chk-numbering-v2" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
                    Apply Auto-Numbering
                  </label>
                </div>

                {rules.numbering && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Start From</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={rules.numberingStart}
                        onChange={(e) => setRules({ ...rules, numberingStart: parseInt(e.target.value) || 1 })}
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                      />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Digit Padding</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={rules.numberingDigits}
                        onChange={(e) => setRules({ ...rules, numberingDigits: parseInt(e.target.value) || 2 })}
                        style={{ padding: '6px 10px', fontSize: '11px' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category 3: Save Destination */}
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => setSectionSaveExpanded(!sectionSaveExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Destination</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionSaveExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionSaveExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <span className="form-label" style={{ fontSize: '10px' }}>Target Directory</span>
                <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`}
                    onClick={() => setSaveDestMode('original')}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Original
                  </button>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`}
                    onClick={() => setSaveDestMode('default')}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Default
                  </button>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`}
                    onClick={handleBrowseDestFolder}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Custom...
                  </button>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--color-slate)', fontStyle: 'italic', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={
                  saveDestMode === 'original' ? 'Original file directory' :
                  saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || 'Default folder not set') :
                  customDestPath || 'No folder selected'
                }>
                  Saving to: {
                    saveDestMode === 'original' ? 'Original Folder' :
                    saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || 'Default not set') :
                    customDestPath ? path.basename(customDestPath) : 'Not configured'
                  }
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-rename-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-rename-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
                    Auto-Open Output Directory
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pinned Button Container */}
        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button 
            className="process-action-btn flex-center"
            onClick={handleApplyRename} 
            disabled={applying || previewFiles.length === 0} 
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{applying ? 'RENAMING...' : 'PROCESS SELECTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// AUDIO STUDIO MODULE (v1.1)
// ----------------------------------------------------------------------------
function AudioStudio({ files, setFiles, setGlobalProgress, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('192k');
  
  const [saveDestMode, setSaveDestMode] = useState('original');
  const [customDestPath, setCustomDestPath] = useState('');
  const [openOnComplete, setOpenOnComplete] = useState(true);
  const [successResult, setSuccessResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState(null);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, idx) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(idx);
    window.isDraggingQueueItem = true;
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    window.isDraggingQueueItem = false;
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const reordered = [...files];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(idx, 0, removed);
    setFiles(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    window.isDraggingQueueItem = false;
  };

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
      setExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const [sectionConfigExpanded, setSectionConfigExpanded] = useState(true);
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  const handleBrowseDestFolder = () => {
    openFolderPicker(customDestPath, (path) => {
      setCustomDestPath(path);
      setSaveDestMode('custom');
    });
  };

  const getDefaultOutputPath = () => {
    return localStorage.getItem('rfine_def_save_dir') || '';
  };

  const handleAddAudio = (selected) => {
    const formatted = selected.map(f => {
      if (typeof f === 'string') {
        return { path: f, name: path.basename(f), size: 0 };
      }
      return f;
    });
    setFiles(prev => {
      const updated = [...prev];
      formatted.forEach(item => {
        if (!updated.some(x => x.path === item.path)) {
          updated.push(item);
        }
      });
      if (!activePreviewFile && updated.length > 0) {
        setActivePreviewFile(updated[0]);
      }
      return updated;
    });
    setSuccessResult(null);
  };

  const handleApplyExtract = async () => {
    if (files.length === 0 || processing) return;
    setProcessing(true);
    setSuccessResult(null);

    let lastSavedFolder = '';
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setGlobalProgress({ 
          active: true, 
          percent: Math.round((i / files.length) * 100), 
          label: `Processing audio ${i + 1}/${files.length}: ${file.name}...` 
        });

        const destFolder = saveDestMode === 'original' ? path.dirname(file.path) :
                           saveDestMode === 'default' ? getDefaultOutputPath() :
                           customDestPath;
                           
        const outName = `${path.parse(file.path).name}_audio.${format}`;
        const outputPath = path.join(destFolder || path.dirname(file.path), outName);

        const res = await fetch(`${API_BASE}/audio/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: file.path,
            outputPath,
            format,
            bitrate
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Extraction failed');
        lastSavedFolder = destFolder || path.dirname(file.path);
        if (addRecentProcess) {
          addRecentProcess(
            'Audio Converter',
            `${path.parse(file.path).name}_audio.${format}`,
            file.size || null,
            null,
            lastSavedFolder
          );
        }
      }

      setGlobalProgress({ active: true, percent: 100, label: 'All audio processing finished!' });
      setTimeout(() => setGlobalProgress({ active: false, percent: 0, label: '' }), 3000);
      setSuccessResult({ targetFolder: lastSavedFolder });

      if (openOnComplete && lastSavedFolder) {
        await fetch(`${API_BASE}/open-folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderPath: lastSavedFolder })
        });
      }
    } catch (e) {
      console.error(e);
      alert('Error processing audio files: ' + e.message);
      setGlobalProgress({ active: false, percent: 0, label: '' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="workspace-layout">
      {/* Middle Canvas: File Explorer + Processing Queue */}
      <div className="middle-canvas">
        <CollapsibleFileBrowser
          isFileBrowserCollapsed={isFileBrowserCollapsed}
          toggleFileBrowser={toggleFileBrowser}
          explorerHeight={explorerHeight}
          handleDividerMouseDown={handleDividerMouseDown}
        >
          <FileExplorer 
            onAddFiles={handleAddAudio} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov', '.avi', '.mp3', '.wav', '.aac', '.m4a', '.flac']}
            maxListHeight={null}
            onPreviewFile={(f) => {
              const fileObj = typeof f === 'string' ? { path: f, name: path.basename(f), size: 0 } : f;
              handleAddAudio([fileObj]);
              setActivePreviewFile(fileObj);
            }}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_audio_studio"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {/* Processing Queue Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Processing Queue</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', background: 'rgba(77, 155, 34, 0.1)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '12px' }}>
              {files.length} {files.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button 
            className="btn-secondary" 
            style={{ padding: '4px 8px', fontSize: '10px', borderColor: 'transparent', background: 'transparent' }} 
            onClick={() => {
              setFiles([]);
              setActivePreviewFile(null);
              setSuccessResult(null);
            }}
          >
            Clear All
          </button>
        </div>

        {successResult && (
          <div className="animate-fade-in" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '10px 14px', 
            background: 'rgba(77, 155, 34, 0.08)', 
            border: '1px solid rgba(77, 155, 34, 0.25)', 
            borderRadius: '6px', 
            fontSize: '11px', 
            color: '#72BC28', 
            fontWeight: 'bold',
            marginBottom: '12px',
            gap: '12px',
            flexShrink: 0
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="#72BC28" />
              Audio tracks extracted successfully!
            </span>
            {successResult.targetFolder && (
              <button 
                onClick={async () => {
                  try {
                    await fetch(`${API_BASE}/open-folder`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ folderPath: successResult.targetFolder })
                    });
                  } catch (e) { console.error(e); }
                }}
                className="btn-secondary"
                style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', borderColor: 'var(--glass-border)', color: 'var(--primary-color)', borderRadius: '4px' }}
                title="Open Saved Directory"
              >
                <FolderOpen size={14} color="var(--primary-color)" />
              </button>
            )}
          </div>
        )}

        {/* Selected Files List */}
        {files.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '15px', flexShrink: 0, maxHeight: '200px', overflowY: 'auto' }}>
            {files.map((f, idx) => {
              const fileName = f.name;
              const fileSize = f.size ? formatFileSize(f.size) : '0 KB';
              const ext = path.extname(fileName).toUpperCase().replace('.', '');
              const isSelected = activePreviewFile?.path === f.path;

              return (
                  <div key={f.path} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => setActivePreviewFile(f)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '8px 12px', 
                    borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)', 
                    backgroundColor: isSelected ? 'rgba(77, 155, 34, 0.05)' : 'transparent',
                    borderTop: dragOverIndex === idx && draggedIndex > idx ? '2px solid var(--primary-color)' : '',
                    // borderBottomActive: dragOverIndex === idx && draggedIndex < idx ? '2px solid var(--primary-color)' : '',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }} onClick={(e) => e.stopPropagation()}>⋮⋮</span>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <Music size={16} color="var(--primary-color)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fileName}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{ext} • {fileSize}</span>
                    </div>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = files.filter(x => x.path !== f.path);
                      setFiles(updated);
                      if (activePreviewFile?.path === f.path) {
                        setActivePreviewFile(updated.length > 0 ? updated[0] : null);
                      }
                    }}
                    title="Remove file"
                  >
                    <Trash2 size={14} color="var(--primary-color)" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dashed Drag/Drop Area: Local Dropzone showing overlay only inside this container */
          <div 
            className="dropzone flex-center" 
            onClick={() => document.getElementById('audio-studio-add-file-input').click()}
            style={{ 
              padding: '40px', 
              position: 'relative',
              overflow: 'hidden',
              flexGrow: 1,
              marginBottom: '15px'
            }}
          >
            <input 
              type="file"
              id="audio-studio-add-file-input"
              multiple
              accept=".mp4,.webm,.mkv,.mov,.avi,.mp3,.wav,.aac,.m4a,.flac"
              onChange={(e) => {
                if (e.target.files) {
                  const arr = Array.from(e.target.files).map(x => ({ path: x.path || x.name, name: x.name, size: x.size }));
                  handleAddAudio(arr);
                }
              }}
              style={{ display: 'none' }}
            />
            {isDraggingFile ? (
              <>
                <Download size={20} color="var(--primary-color)" className="animate-bounce" style={{ color: 'var(--primary-color)' }} />
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-color)' }}>Drop files here to start refining</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add audio or video files or drag & drop</span>
                <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports MP4, WebM, MKV, MOV, MP3, WAV, FLAC</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Music size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Audio Converter</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Convert and extract audio.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Active File info */}
          {activePreviewFile && (
            <div className="animate-fade-in" style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={activePreviewFile.path}>
                🎵 {activePreviewFile.name}
              </span>
            </div>
          )}

          {/* Category 1: Audio Settings */}
          <div style={{ marginBottom: '16px' }}>
            <div 
              onClick={() => setSectionConfigExpanded(!sectionConfigExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Encoding Options</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionConfigExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionConfigExpanded && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '10px' }}>Output Audio Format</label>
                  <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '4px' }}>
                    {['mp3', 'wav', 'aac', 'flac'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`clean-preset-btn ${format === fmt ? 'active' : ''}`}
                        style={{ textTransform: 'uppercase', padding: '6px 0', fontSize: '11px' }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '10px' }}>Audio Bitrate</label>
                  <select 
                    className="form-input" 
                    value={bitrate} 
                    onChange={(e) => setBitrate(e.target.value)}
                    disabled={format === 'wav'}
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                  >
                    <option value="128k">128 kbps</option>
                    <option value="192k">192 kbps (Standard)</option>
                    <option value="256k">256 kbps</option>
                    <option value="320k">320 kbps (HQ)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Category 2: Save Destination */}
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => setSectionSaveExpanded(!sectionSaveExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderOpen size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Save Destination</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionSaveExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionSaveExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <span className="form-label" style={{ fontSize: '10px' }}>Target Directory</span>
                <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr 1.2fr' }}>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'original' ? 'active' : ''}`}
                    onClick={() => setSaveDestMode('original')}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Original
                  </button>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'default' ? 'active' : ''}`}
                    onClick={() => setSaveDestMode('default')}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Default
                  </button>
                  <button
                    className={`clean-preset-btn ${saveDestMode === 'custom' ? 'active' : ''}`}
                    onClick={handleBrowseDestFolder}
                    style={{ padding: '6px 4px', fontSize: '9.5px' }}
                  >
                    Custom...
                  </button>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--color-slate)', fontStyle: 'italic', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={
                  saveDestMode === 'original' ? 'Original file directory' :
                  saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || 'Default folder not set') :
                  customDestPath || 'No folder selected'
                }>
                  Saving to: {
                    saveDestMode === 'original' ? 'Original Folder' :
                    saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || 'Default not set') :
                    customDestPath ? path.basename(customDestPath) : 'Not configured'
                  }
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-audio-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-audio-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
                    Auto-Open Output Directory
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pinned Button Container */}
        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button 
            className="process-action-btn flex-center"
            onClick={handleApplyExtract}
            disabled={processing || files.length === 0}
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'CONVERTING...' : 'EXTRACT AUDIO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// GIF CREATOR MODULE (v1.1)
// ----------------------------------------------------------------------------
function GIFCreator({ files, setFiles, setGlobalProgress, explorerPreviewFile, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, onOpenFullscreenPreview, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [startTime, setStartTime] = useState('0');
  const [duration, setDuration] = useState('5');
  const [gifWidth, setGifWidth] = useState('480');
  const [gifFps, setGifFps] = useState('15');

  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_gif_save_dest_mode') || 'original');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_gif_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_gif_open_on_complete');
    return val === null ? true : val === 'true';
  });

  const [sectionConfigExpanded, setSectionConfigExpanded] = useState(true);
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => { e.preventDefault(); setDragOverIndex(index); };
  const handleDragLeave = () => setDragOverIndex(null);
  const handleDragEnd = () => { setDraggedIndex(null); setDragOverIndex(null); };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    const updated = [...files];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(targetIndex, 0, item);
    setFiles(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleAddVideo = (newFiles) => {
    setFiles(prev => {
      const existing = prev.map(f => f.path);
      const filtered = newFiles.filter(nf => !existing.includes(nf.path));
      return [...prev, ...filtered];
    });
  };

  const handleBrowseDestFolder = () => {
    if (openFolderPicker) {
      openFolderPicker(customDestPath, (selectedPath) => {
        setCustomDestPath(selectedPath);
        setSaveDestMode('custom');
      });
    }
  };

  const handleApplyGIF = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setSuccessResult(null);
    try {
      const res = await fetch(`${API_BASE}/gif/create-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files, startTime, duration, width: gifWidth, fps: gifFps,
          outputFolder: saveDestMode === 'original' ? undefined : saveDestMode === 'default' ? (localStorage.getItem('rfine_def_save_dir') || undefined) : customDestPath || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create GIF');
      let lastSavedFolder = data.targetFolder || '';
      if (data.results && addRecentProcess) {
        data.results.forEach(r => {
          if (r.success) {
            addRecentProcess('GIF Creator', r.name, r.originalSize, r.optimizedSize, r.targetFolder);
            lastSavedFolder = r.targetFolder;
          }
        });
      }
      setSuccessResult({ results: data.results, targetFolder: lastSavedFolder });
      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath: lastSavedFolder }) });
        } catch (e) {}
      }
    } catch (e) {
      alert('GIF Creation failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDividerMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = explorerHeight;
    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(150, Math.min(600, startHeight + deltaY));
      setExplorerHeight(newHeight);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
        <CollapsibleFileBrowser isFileBrowserCollapsed={isFileBrowserCollapsed} toggleFileBrowser={toggleFileBrowser} explorerHeight={explorerHeight} handleDividerMouseDown={handleDividerMouseDown}>
          <FileExplorer 
            onAddFiles={handleAddVideo} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov', '.avi']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_gif_creator"
            openFolderPicker={openFolderPicker}
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)', marginBottom: '15px', flexShrink: 0 }}>
            {files.map((file, idx) => {
              const fileName = typeof file === 'string' ? path.basename(file) : file.name;
              const fileSize = typeof file === 'string' ? '' : formatFileSize(file.size);
              const ext = path.extname(fileName).toUpperCase().replace('.', '');
              return (
                <div key={idx} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} onDrop={(e) => handleDrop(e, idx)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)', cursor: 'grab' }} onClick={() => setActivePreviewFile(file)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }}>⋮⋮</span>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>{fileName} ({ext} • {fileSize})</span>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, i) => i !== idx)); }}><Trash2 size={14} color="var(--primary-color)" /></button>
                </div>
              );
            })}
          </div>
        )}

        <div className="dropzone flex-center" onClick={() => document.getElementById('gif-creator-add-file-input').click()} style={{ padding: '20px', position: 'relative' }}>
          <input type="file" id="gif-creator-add-file-input" multiple accept=".mp4,.webm,.mkv,.mov,.avi" onChange={(e) => { if (e.target.files) { const arr = Array.from(e.target.files).map(x => ({ path: x.path || x.name, name: x.name, size: x.size })); handleAddVideo(arr); } }} style={{ display: 'none' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add video files or drag & drop</span>
        </div>
      </div>

      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Image size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>GIF CREATOR</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0' }}>Create animated GIFs from videos.</p>

        <div className="sidebar-settings-content">
          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ fontSize: '10px' }}>GIF Clipper Settings</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '10px' }}>Start Time (s)</label>
                <input type="number" step="0.1" min="0" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '10px' }}>Duration (s)</label>
                <input type="number" step="0.1" min="0.5" value={duration} onChange={(e) => setDuration(e.target.value)} className="form-input" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '10px' }}>Width</label>
                <select className="form-input" value={gifWidth} onChange={(e) => setGifWidth(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  <option value="320">320px</option>
                  <option value="480">480px</option>
                  <option value="640">640px</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '10px' }}>Frame Rate</label>
                <select className="form-input" value={gifFps} onChange={(e) => setGifFps(e.target.value)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                  <option value="10">10 fps</option>
                  <option value="15">15 fps</option>
                  <option value="24">24 fps</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button className="process-action-btn flex-center" onClick={handleApplyGIF} disabled={processing || files.length === 0} style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}>
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'CREATING...' : 'CREATE ANIMATED GIF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
function CaseConverter({ theme }) {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [activeCasing, setActiveCasing] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const stats = useMemo(() => {
    const chars = inputText.length;
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const lines = inputText ? inputText.split('\n').length : 0;
    const sentences = inputText ? inputText.split(/[.!?]+/).filter(Boolean).length : 0;
    return { chars, words, lines, sentences };
  }, [inputText]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const convertCase = (type) => {
    setActiveCasing(type);
    if (!inputText) return;
    let converted = '';
    switch (type) {
      case 'upper':
        converted = inputText.toUpperCase();
        break;
      case 'lower':
        converted = inputText.toLowerCase();
        break;
      case 'title':
        converted = inputText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        break;
      case 'sentence':
        converted = inputText.toLowerCase().replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
        break;
      case 'kebab':
        converted = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        break;
      case 'snake':
        converted = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s_]/g, '')
          .trim()
          .replace(/\s+/g, '_');
        break;
      case 'camel':
        converted = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .trim()
          .split(/\s+/)
          .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;
      case 'pascal':
        converted = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join('');
        break;
      case 'toggle':
        converted = inputText
          .split('')
          .map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())
          .join('');
        break;
      case 'random':
        converted = inputText
          .split('')
          .map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase())
          .join('');
        break;
      default:
        converted = inputText;
    }
    setOutputText(converted);
  };

  return (
    <div className="workspace-layout animate-fade-in" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CaseSensitive size={24} /> CASE CONVERTER
          </h2>
          <p style={{ color: 'var(--color-slate)', fontSize: '12px', margin: '4px 0 0 0' }}>Instantly transform the case of your text passages.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1, minHeight: 0 }}>
        {/* Buttons Panel (Styled like Format Preset grid) */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="clean-preset-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', width: '100%' }}>
            {[
              { id: 'upper', label: 'UPPERCASE' },
              { id: 'lower', label: 'lowercase' },
              { id: 'title', label: 'Title Case' },
              { id: 'sentence', label: 'Sentence case' },
              { id: 'kebab', label: 'kebab-case' },
              { id: 'snake', label: 'snake_case' },
              { id: 'camel', label: 'camelCase' },
              { id: 'pascal', label: 'PascalCase' },
              { id: 'toggle', label: 'tOgGlE cAsE' },
              { id: 'random', label: 'rAnDoM cAsE' }
            ].map(opt => (
              <button 
                key={opt.id}
                onClick={() => convertCase(opt.id)} 
                className={`clean-preset-btn ${activeCasing === opt.id ? 'active' : ''}`}
                style={{ padding: '8px 0', fontSize: '11px', fontWeight: '600' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', flexGrow: 1, minHeight: '380px' }}>
          {/* Input Text Area */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', letterSpacing: '0.5px' }}>
                INPUT TEXT
              </span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); setOutputText(''); setActiveCasing(''); }}
              placeholder="Type or paste your text here to begin..."
              style={{
                flexGrow: 1,
                width: '100%',
                background: 'var(--glass-hover)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                color: 'var(--color-white)',
                fontSize: '13px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                minHeight: 0
              }}
            />
            {/* Stats */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', fontSize: '10.5px', color: 'var(--color-slate)', height: '44px' }}>
              <span style={{ background: 'rgba(77, 155, 34, 0.08)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Chars: <strong>{stats.chars}</strong>
              </span>
              <span style={{ background: 'rgba(77, 155, 34, 0.08)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Words: <strong>{stats.words}</strong>
              </span>
              <span style={{ background: 'rgba(77, 155, 34, 0.08)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Lines: <strong>{stats.lines}</strong>
              </span>
              <span style={{ background: 'rgba(77, 155, 34, 0.08)', color: 'var(--primary-color)', padding: '3px 8px', borderRadius: '12px', fontWeight: '600' }}>
                Sentences: <strong>{stats.sentences}</strong>
              </span>
              
              <button 
                onClick={() => { setInputText(''); setOutputText(''); }}
                style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '10.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                CLEAR ALL
              </button>
            </div>
          </div>

          {/* Output Text Area */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', letterSpacing: '0.5px' }}>
                TRANSFORMED TEXT
              </span>
            </div>
            <textarea
              readOnly
              value={outputText}
              placeholder="Your converted text will appear here..."
              style={{
                flexGrow: 1,
                width: '100%',
                background: 'var(--glass-hover)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '16px',
                color: 'var(--color-white)',
                fontSize: '13px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                minHeight: 0,
                opacity: outputText ? 1 : 0.7
              }}
            />
            <button 
              onClick={handleCopy}
              disabled={!outputText}
              className="process-action-btn flex-center"
              style={{ width: '100%', padding: '12px 0', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', color: '#FFF', height: '44px' }}
            >
              {copySuccess ? 'COPIED TO CLIPBOARD!' : 'COPY TO CLIPBOARD'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorStudio({ theme, explorerHeight, setExplorerHeight, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [subView, setSubView] = useState('picker');
  const [activeImage, setActiveImage] = useState(null);
  const [activeImagePath, setActiveImagePath] = useState(null);
  const [pickedColor, setPickedColor] = useState('#4D9B22');
  const [dominantColors, setDominantColors] = useState([]);
  const [randomColors, setRandomColors] = useState(['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5', '#F5FF33']);
  const [gradientStart, setGradientStart] = useState('#4D9B22');
  const [gradientEnd, setGradientEnd] = useState('#72BC28');
  const canvasRef = useRef(null);

  const hexToRgb = (hex) => {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c= hex.substring(1).split('');
      if(c.length === 3) c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      c= '0x'+c.join('');
      return [(c>>16)&255, (c>>8)&255, c&255];
    }
    return [0,0,0];
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if(max === min){ h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const rgbToCmyk = (r, g, b) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    if (k === 1) return [0, 0, 0, 100];
    c = Math.round((c - k) / (1 - k) * 100);
    m = Math.round((m - k) / (1 - k) * 100);
    y = Math.round((y - k) / (1 - k) * 100);
    k = Math.round(k * 100);
    return [c, m, y, k];
  };

  const getLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.722;
  };

  const getContrastRatio = (color1, color2) => {
    const l1 = getLuminance(color1[0], color1[1], color1[2]);
    const l2 = getLuminance(color2[0], color2[1], color2[2]);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return { ratio, pass: ratio >= 4.5 };
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  const getHarmonies = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    let [h, s, l] = rgbToHsl(r, g, b);
    return {
      complementary: [hex, hslToHex((h + 180) % 360, s, l)],
      analogous: [hslToHex((h + 330) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)],
      triadic: [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)],
      splitComplementary: [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)]
    };
  };

  const generateRandomColors = () => {
    const generateHex = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
    setRandomColors([generateHex(), generateHex(), generateHex(), generateHex(), generateHex(), generateHex()]);
  };

  const harmonies = getHarmonies(pickedColor);
  const rgb = hexToRgb(pickedColor);
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const cmyk = rgbToCmyk(rgb[0], rgb[1], rgb[2]);
  const contrastWhite = getContrastRatio(rgb, [255, 255, 255]);
  const contrastBlack = getContrastRatio(rgb, [0, 0, 0]);

  const extractPalette = (imgObj) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imgObj.naturalWidth || imgObj.width;
    canvas.height = imgObj.naturalHeight || imgObj.height;
    ctx.drawImage(imgObj, 0, 0);
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = {};
      const step = Math.ceil(data.length / (4 * 2000));
      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a < 128) continue;
        const rgbKey = `${Math.round(r/16)*16},${Math.round(g/16)*16},${Math.round(b/16)*16}`;
        colors[rgbKey] = (colors[rgbKey] || 0) + 1;
      }
      const sorted = Object.keys(colors).sort((a, b) => colors[b] - colors[a]).slice(0, 6);
      const toHex = (r,g,b) => "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
      const palette = sorted.map(k => {
        const [r,g,b] = k.split(',').map(Number);
        return toHex(r,g,b);
      });
      while(palette.length < 6) palette.push('#CCCCCC');
      setDominantColors(palette);
    } catch(e) { console.error(e); }
  };

  const handleImageLoad = (e) => {
    extractPalette(e.target);
  };

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert("EyeDropper API not supported in this browser.");
      return;
    }
    try {
      const ed = new window.EyeDropper();
      const res = await ed.open();
      setPickedColor(res.sRGBHex.toUpperCase());
    } catch(e) {}
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handlePreviewFile = (file) => {
    if (file && (file.path || file.name)) {
      const isImg = /\.(jpg|jpeg|png|webp|avif|heic|heif)$/i.test(file.name || file.path);
      if (isImg) {
        setActiveImagePath(file.path);
        const url = `${API_BASE}/image-preview?path=${encodeURIComponent(file.path)}`;
        setActiveImage(url);
      }
    }
  };

  return (
    <div className="workspace-layout animate-fade-in">
      <div className="middle-canvas">
        {subView === 'picker' ? (
          <>
            <CollapsibleFileBrowser
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              toggleFileBrowser={toggleFileBrowser}
              explorerHeight={explorerHeight}
              setExplorerHeight={setExplorerHeight}
            >
              <FileExplorer 
                onAddFiles={(files) => {
                  if(files.length > 0) handlePreviewFile(files[0]);
                }} 
                maxListHeight="100%"
                onPreviewFile={handlePreviewFile}
                theme={theme}
                showActions={false}
                onCollapse={toggleFileBrowser}
              />
            </CollapsibleFileBrowser>

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, overflowY: 'auto' }}>
              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '300px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>IMAGE PREVIEW</span>
                  <button className="btn-primary" onClick={handleEyeDropper}>
                    <Pipette size={16} /> PICK COLOR
                  </button>
                </div>
                <div style={{ flexGrow: 1, background: 'var(--glass-hover)', border: '1px solid var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                  {activeImage ? (
                    <img 
                      src={activeImage} 
                      alt="Selected" 
                      crossOrigin="anonymous"
                      onLoad={handleImageLoad}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px' }}>Select an image from the browser to analyze.</span>
                  )}
                </div>
              </div>

              <div className="glass-panel" style={{ padding: '20px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>DOMINANT PALETTE</span>
                <div style={{ display: 'flex', gap: '12px', height: '60px' }}>
                  {dominantColors.length > 0 ? dominantColors.map((col, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => { setPickedColor(col); copyToClipboard(col); }}
                      style={{ flexGrow: 1, backgroundColor: col, borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' }}
                      title={`Click to pick & copy: ${col}`}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  )) : (
                    <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--color-slate)' }}>
                      No image loaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, overflowY: 'auto' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>RANDOM COLORS</span>
                <button className="btn-secondary" onClick={generateRandomColors} style={{ padding: '4px 8px', fontSize: '10px' }}>GENERATE</button>
              </div>
              <div style={{ display: 'flex', gap: '12px', height: '60px' }}>
                {randomColors.map((col, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => { setPickedColor(col); copyToClipboard(col); }}
                    style={{ flexGrow: 1, backgroundColor: col, borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--glass-border)', transition: 'transform 0.2s' }}
                    title={`Click to pick & copy: ${col}`}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>GRADIENT CREATOR</span>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '200px' }}>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-slate)' }}>START COLOR</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} style={{ width: '40px', height: '30px', padding: '0', border: 'none' }} />
                      <input type="text" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="form-input" style={{ height: '30px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-slate)' }}>END COLOR</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} style={{ width: '40px', height: '30px', padding: '0', border: 'none' }} />
                      <input type="text" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="form-input" style={{ height: '30px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ flexGrow: 1, background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`, borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="text" readOnly value={`background: linear-gradient(90deg, ${gradientStart}, ${gradientEnd});`} className="form-input" style={{ fontSize: '11px', fontFamily: 'monospace' }} />
                    <button onClick={() => copyToClipboard(`background: linear-gradient(90deg, ${gradientStart}, ${gradientEnd});`)} className="btn-secondary" style={{ padding: '6px' }} title="Copy CSS">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>HARMONIES FOR {pickedColor}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Complementary', colors: harmonies.complementary },
                  { label: 'Analogous', colors: harmonies.analogous },
                  { label: 'Triadic', colors: harmonies.triadic },
                  { label: 'Split-Complementary', colors: harmonies.splitComplementary }
                ].map(harm => (
                  <div key={harm.label}>
                    <span style={{ fontSize: '10px', color: 'var(--color-slate)', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>{harm.label}</span>
                    <div style={{ display: 'flex', gap: '8px', height: '40px' }}>
                      {harm.colors.map((c, i) => (
                        <div 
                          key={i} 
                          onClick={() => { setPickedColor(c); copyToClipboard(c); }}
                          style={{ flexGrow: 1, backgroundColor: c, borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--glass-border)' }} 
                          title={`Pick ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Pipette size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Color Studio</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Pick colors, generate swatches, and check contrast scores.</p>

        <div style={{ display: 'flex', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px' }}>
          <button 
            onClick={() => setSubView('picker')}
            style={{ 
              flex: 1, padding: '8px 0', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              background: subView === 'picker' ? 'var(--primary-color)' : 'transparent',
              color: subView === 'picker' ? '#fff' : 'var(--color-slate)',
              transition: 'all 0.2s'
            }}
          >
            IMAGE PICKER
          </button>
          <button 
            onClick={() => setSubView('finder')}
            style={{ 
              flex: 1, padding: '8px 0', fontSize: '11px', fontWeight: 'bold', border: 'none', cursor: 'pointer',
              background: subView === 'finder' ? 'var(--primary-color)' : 'transparent',
              color: subView === 'finder' ? '#fff' : 'var(--color-slate)',
              transition: 'all 0.2s'
            }}
          >
            COLOR FINDER
          </button>
        </div>

        <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: pickedColor, border: '1px solid var(--glass-border)' }} />
          INSPECTOR
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'HEX', val: pickedColor },
            { label: 'RGB', val: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` },
            { label: 'HSL', val: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` },
            { label: 'CMYK', val: `cmyk(${cmyk[0]}%, ${cmyk[1]}%, ${cmyk[2]}%, ${cmyk[3]}%)` }
          ].map(fmt => (
            <div key={fmt.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--glass-hover)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-slate)' }}>{fmt.label}</span>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{fmt.val}</span>
              </div>
              <button 
                onClick={() => copyToClipboard(fmt.val)}
                className="btn-secondary" 
                style={{ padding: '4px', borderRadius: '4px' }}
                title="Copy"
              >
                <Copy size={14} />
              </button>
            </div>
          ))}
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '12px' }}>WCAG CONTRAST</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: pickedColor, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#FFF', display: 'block' }}>ON WHITE</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#FFF' }}>{contrastWhite.ratio.toFixed(2)}:1</span>
              <span style={{ fontSize: '9px', display: 'block', marginTop: '2px', color: contrastWhite.pass ? '#4E9F3D' : '#FF5D5D' }}>
                {contrastWhite.pass ? 'PASS (AA)' : 'FAIL'}
              </span>
            </div>
            <div style={{ background: pickedColor, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#000', display: 'block' }}>ON BLACK</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#000' }}>{contrastBlack.ratio.toFixed(2)}:1</span>
              <span style={{ fontSize: '9px', display: 'block', marginTop: '2px', color: contrastBlack.pass ? '#4E9F3D' : '#FF5D5D' }}>
                {contrastBlack.pass ? 'PASS (AA)' : 'FAIL'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SETTINGS TAB MODULE
// ----------------------------------------------------------------------------
function SettingsTab({ theme, setTheme, openFolderPicker }) {
  const [defaultSaveDir, setDefaultSaveDir] = useState(() => localStorage.getItem('rfine_def_save_dir') || '');
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('rfine_theme') || 'dark');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rfine_favorite_folders')) || [];
    } catch {
      return [];
    }
  });

  const handleSelectSaveDir = () => {
    if (openFolderPicker) {
      openFolderPicker(defaultSaveDir, (selectedPath) => {
        if (selectedPath) {
          setDefaultSaveDir(selectedPath);
          localStorage.setItem('rfine_def_save_dir', selectedPath);
        }
      });
    }
  };

  const handleRemoveFavorite = (idx) => {
    const updated = favorites.filter((_, i) => i !== idx);
    setFavorites(updated);
    localStorage.setItem('rfine_favorite_folders', JSON.stringify(updated));
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('rfine_theme', newTheme);
    if (setTheme) setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '30px 40px', height: '100%', boxSizing: 'border-box', overflowY: 'auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <Settings size={24} color="var(--primary-color)" />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-white)', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: '11px', color: 'var(--color-slate)', margin: '4px 0 0 0' }}>Configure default save directories and application preferences.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', width: '100%' }}>
        {/* Left Column: Default Save Dir & Theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={16} color="var(--primary-color)" /> Default Save Directory
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" readOnly value={defaultSaveDir || 'No default directory set'} className="form-input" style={{ flexGrow: 1, fontSize: '12px' }} />
              <button onClick={handleSelectSaveDir} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 'bold' }}>Browse...</button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sun size={16} color="var(--primary-color)" /> Interface Theme
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => handleThemeChange('dark')} className={`clean-preset-btn ${currentTheme === 'dark' ? 'active' : ''}`} style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Moon size={14} /> Dark Theme</button>
              <button onClick={() => handleThemeChange('light')} className={`clean-preset-btn ${currentTheme === 'light' ? 'active' : ''}`} style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Sun size={14} /> Light Theme</button>
            </div>
          </div>
        </div>

        {/* Right Column: Favorited Directories */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '10px', border: '1px solid var(--glass-border)', height: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-white)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} color="var(--primary-color)" fill="var(--primary-color)" /> Favorited Directories
            </h3>
            {favorites.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {favorites.map((fav, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-white)', wordBreak: 'break-all' }}>{fav}</span>
                    <button onClick={() => handleRemoveFavorite(idx)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '4px' }} title="Remove favorite"><Trash2 size={14} color="var(--primary-color)" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--color-slate)', fontStyle: 'italic' }}>No favorited directories saved yet. Bookmark folders directly inside the File Explorer by clicking the star icon.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ----------------------------------------------------------------------------
function AboutModal({ isOpen, onClose, theme }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999
    }} onClick={onClose}>
      <div 
        className="glass-card animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '440px',
          padding: '30px',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          backgroundColor: 'var(--glass-bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--color-slate)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>

        <img src={theme === 'light' ? 'logo_light.png' : 'logo.png'} style={{ height: '60px', marginBottom: '16px', objectFit: 'contain' }} alt="RFINE" />
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-color)', margin: 0 }}>RFINE Media Suite</h2>
        <span style={{ fontSize: '11px', color: 'var(--color-slate)', marginTop: '4px', fontWeight: 'bold' }}>Version 1.3.0</span>

        <p style={{ fontSize: '12px', color: 'var(--color-white)', opacity: 0.8, lineHeight: '1.6', margin: '20px 0' }}>
          An all-in-one local processing media suite designed for rapid image scaling, video compression, color palette analysis, document cropping, and file utilities.
        </p>

        <div style={{ fontSize: '10px', color: 'var(--color-slate)', borderTop: '1px solid var(--glass-border)', paddingTop: '16px', width: '100%' }}>
          Engineered with React, Electron & FFmpeg • 100% Private & Local
        </div>
      </div>
    </div>
  );
}

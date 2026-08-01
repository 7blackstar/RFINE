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
  Crop
} from 'lucide-react';

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? `${window.location.origin}/api`
  : 'http://localhost:5001/api';

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
function ImageCropper({ files, onFilesChange, toggleFileBrowser, isFileBrowserCollapsed, explorerHeight, handleDividerMouseDown, theme }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState('crop'); // 'crop' or 'perspective'
  
  const [isCroppedPreview, setIsCroppedPreview] = useState(false);

  useEffect(() => {
    setIsCroppedPreview(false);
    setSuccessResult(null);
  }, [selectedFile]);

  // Crop state
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 }); // Percentages
  
  // Perspective state
  const [corners, setCorners] = useState([
    { x: 10, y: 10 }, { x: 90, y: 10 },
    { x: 90, y: 90 }, { x: 10, y: 90 }
  ]); // Percentages

  // Padding state
  const [padding, setPadding] = useState({ top: 0, right: 0, bottom: 0, left: 0 }); // px
  const [fillMode, setFillMode] = useState('solid'); // 'solid', 'blur', 'mirror'
  const [fillColor, setFillColor] = useState('#ffffff');
  
  // Adjustments
  const [rotation, setRotation] = useState(0);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('free');
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(null); // 'tl', 'tr', 'bl', 'br', 'move', or index (0,1,2,3)
  const dragStartRef = useRef({ startX: 0, startY: 0, box: null, corners: null });

  // Output options
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [targetFolder, setTargetFolder] = useState('');

  // Accordion categories expansion
  const [sectionModeExpanded, setSectionModeExpanded] = useState(true);
  const [sectionAspectExpanded, setSectionAspectExpanded] = useState(true);
  const [sectionAdjustExpanded, setSectionAdjustExpanded] = useState(true);
  const [sectionExtendExpanded, setSectionExtendExpanded] = useState(true);
  const [sectionFormatExpanded, setSectionFormatExpanded] = useState(true);
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [inputWidth, setInputWidth] = useState('');
  const [inputHeight, setInputHeight] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedFile) {
        if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
          setIsCroppedPreview(true);
        } else if (e.key === 'Escape') {
          setIsCroppedPreview(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile]);

  const getRatioFactor = (ratio) => {
    if (ratio === '1:1') return 1;
    if (ratio === '16:9') return 16 / 9;
    if (ratio === '4:3') return 4 / 3;
    if (ratio === '3:2') return 3 / 2;
    if (ratio === '9:16') return 9 / 16;
    if (ratio === '3:4') return 3 / 4;
    if (ratio === '2:3') return 2 / 3;
    return null;
  };

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (ratio === 'free') return;
    
    const factor = getRatioFactor(ratio);
    if (!factor || imageSize.width === 0) return;
    
    const currentW = (cropBox.width / 100) * imageSize.width;
    let newH = currentW / factor;
    let newHPercent = (newH / imageSize.height) * 100;
    
    if (cropBox.y + newHPercent > 100) {
      newHPercent = 100 - cropBox.y;
      newH = (newHPercent / 100) * imageSize.height;
      const newW = newH * factor;
      const newWPercent = (newW / imageSize.width) * 100;
      setCropBox(prev => ({
        ...prev,
        width: Math.min(100 - prev.x, newWPercent),
        height: newHPercent
      }));
    } else {
      setCropBox(prev => ({
        ...prev,
        height: newHPercent
      }));
    }
  };

  const handlePixelWidthChange = (val) => {
    setInputWidth(val);
    const parsedVal = parseInt(val);
    if (!parsedVal || imageSize.width === 0) return;
    
    const factor = getRatioFactor(aspectRatio) || (lockAspectRatio ? (cropBox.width * imageSize.width) / (cropBox.height * imageSize.height || 1) : null);
    if (factor) {
      const targetHPx = Math.round(parsedVal / factor);
      setInputHeight(String(targetHPx));
      
      const newWPercent = (parsedVal / imageSize.width) * 100;
      const newHPercent = (targetHPx / imageSize.height) * 100;
      setCropBox(prev => ({
        ...prev,
        width: Math.min(100 - prev.x, newWPercent),
        height: Math.min(100 - prev.y, newHPercent)
      }));
    } else {
      const newWPercent = (parsedVal / imageSize.width) * 100;
      setCropBox(prev => ({
        ...prev,
        width: Math.min(100 - prev.x, newWPercent)
      }));
    }
  };

  const handlePixelHeightChange = (val) => {
    setInputHeight(val);
    const parsedVal = parseInt(val);
    if (!parsedVal || imageSize.height === 0) return;
    
    const factor = getRatioFactor(aspectRatio) || (lockAspectRatio ? (cropBox.width * imageSize.width) / (cropBox.height * imageSize.height || 1) : null);
    if (factor) {
      const targetWPx = Math.round(parsedVal * factor);
      setInputWidth(String(targetWPx));
      
      const newWPercent = (targetWPx / imageSize.width) * 100;
      const newHPercent = (parsedVal / imageSize.height) * 100;
      setCropBox(prev => ({
        ...prev,
        width: Math.min(100 - prev.x, newWPercent),
        height: Math.min(100 - prev.y, newHPercent)
      }));
    } else {
      const newHPercent = (parsedVal / imageSize.height) * 100;
      setCropBox(prev => ({
        ...prev,
        height: Math.min(100 - prev.y, newHPercent)
      }));
    }
  };

  const [successResult, setSuccessResult] = useState(null);
  
  const handleSaveCrop = async () => {
    if (!selectedFile) return;
    try {
      const res = await fetch(`${API_BASE}/image/crop-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          localPath: selectedFile.path,
          cropBox,
          mode,
          corners,
          rotation,
          tiltX,
          tiltY,
          fillMode,
          fillColor,
          outputFormat,
          outputFolder: targetFolder || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save crop');
      setSuccessResult({ targetFolder: data.targetFolder || targetFolder || '' });
    } catch (e) {
      alert('Crop failed: ' + e.message);
    }
  };

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files]);

  useEffect(() => {
    if (selectedFile) {
      const img = new window.Image();
      img.src = `${API_BASE}/image-preview?path=${encodeURIComponent(selectedFile.path)}`;
      img.onload = () => {
        imageRef.current = img;
        setImageSize({ width: img.width, height: img.height });
        const initialW = Math.round((cropBox.width / 100) * img.width);
        const initialH = Math.round((cropBox.height / 100) * img.height);
        setInputWidth(String(initialW));
        setInputHeight(String(initialH));
        drawCanvas();
      };
    }
  }, [selectedFile, rotation, tiltX, tiltY, padding, fillMode, fillColor, cropBox, corners, mode, isCroppedPreview]);

  useEffect(() => {
    if (imageSize.width > 0) {
      const wPx = Math.round((cropBox.width / 100) * imageSize.width);
      const hPx = Math.round((cropBox.height / 100) * imageSize.height);
      setInputWidth(String(wPx));
      setInputHeight(String(hPx));
    }
  }, [cropBox.width, cropBox.height, imageSize]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    if (isCroppedPreview) {
      // Create offscreen canvas to draw full transformed image
      const offscreen = document.createElement('canvas');
      offscreen.width = img.width;
      offscreen.height = img.height;
      const oCtx = offscreen.getContext('2d');
      
      oCtx.save();
      oCtx.translate(offscreen.width / 2, offscreen.height / 2);
      oCtx.rotate((rotation * Math.PI) / 180);
      oCtx.transform(1, Math.tan(tiltY * Math.PI/180), Math.tan(tiltX * Math.PI/180), 1, 0, 0);
      oCtx.translate(-offscreen.width / 2, -offscreen.height / 2);
      oCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
      oCtx.restore();

      if (mode === 'crop') {
        const cropScale = Math.min(
          (containerWidth - 40) / (img.width * cropBox.width / 100), 
          (containerHeight - 40) / (img.height * cropBox.height / 100)
        );
        canvas.width = (img.width * cropBox.width / 100) * cropScale;
        canvas.height = (img.height * cropBox.height / 100) * cropScale;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          offscreen,
          (cropBox.x / 100) * offscreen.width,
          (cropBox.y / 100) * offscreen.height,
          (cropBox.width / 100) * offscreen.width,
          (cropBox.height / 100) * offscreen.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      } else if (mode === 'perspective') {
        // Perspective warped crop preview
        let minX = 100, maxX = 0, minY = 100, maxY = 0;
        corners.forEach(c => {
          if (c.x < minX) minX = c.x;
          if (c.x > maxX) maxX = c.x;
          if (c.y < minY) minY = c.y;
          if (c.y > maxY) maxY = c.y;
        });
        
        const wPercent = maxX - minX;
        const hPercent = maxY - minY;
        
        const cropScale = Math.min(
          (containerWidth - 40) / (img.width * wPercent / 100), 
          (containerHeight - 40) / (img.height * hPercent / 100)
        );
        
        canvas.width = (img.width * wPercent / 100) * cropScale;
        canvas.height = (img.height * hPercent / 100) * cropScale;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          offscreen,
          (minX / 100) * offscreen.width,
          (minY / 100) * offscreen.height,
          (wPercent / 100) * offscreen.width,
          (hPercent / 100) * offscreen.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
      return;
    }

    const scale = Math.min((containerWidth - 40) / img.width, (containerHeight - 40) / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.transform(1, Math.tan(tiltY * Math.PI/180), Math.tan(tiltX * Math.PI/180), 1, 0, 0);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    if (mode === 'crop') {
      const cropX = (cropBox.x / 100) * canvas.width;
      const cropY = (cropBox.y / 100) * canvas.height;
      const cropW = (cropBox.width / 100) * canvas.width;
      const cropH = (cropBox.height / 100) * canvas.height;
      
      // Draw dark semi-transparent overlay outside crop box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.rect(cropX, cropY, cropW, cropH);
      ctx.fill('evenodd');
      
      // Draw crop box border
      ctx.strokeStyle = 'var(--primary-color)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      ctx.fillStyle = 'var(--primary-color)';
      const handleSize = 8;
      ctx.fillRect(cropX - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
      ctx.fillRect(cropX + cropW - handleSize/2, cropY + cropH - handleSize/2, handleSize, handleSize);
    } else if (mode === 'perspective') {
      if (!isCroppedPreview) {
        ctx.strokeStyle = 'var(--primary-color)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        corners.forEach((c, i) => {
          const x = (c.x / 100) * canvas.width;
          const y = (c.y / 100) * canvas.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = 'var(--primary-color)';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        corners.forEach(c => {
          const x = (c.x / 100) * canvas.width;
          const y = (c.y / 100) * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 6, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        });
      }
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (isCroppedPreview) return;
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (mode === 'crop') {
      const threshold = 6; // percentage proximity
      const tlDist = Math.hypot(clickX - cropBox.x, clickY - cropBox.y);
      const trDist = Math.hypot(clickX - (cropBox.x + cropBox.width), clickY - cropBox.y);
      const blDist = Math.hypot(clickX - cropBox.x, clickY - (cropBox.y + cropBox.height));
      const brDist = Math.hypot(clickX - (cropBox.x + cropBox.width), clickY - (cropBox.y + cropBox.height));
      
      dragStartRef.current = { startX: clickX, startY: clickY, box: { ...cropBox } };
      
      if (tlDist < threshold) {
        setIsDragging('tl');
      } else if (trDist < threshold) {
        setIsDragging('tr');
      } else if (blDist < threshold) {
        setIsDragging('bl');
      } else if (brDist < threshold) {
        setIsDragging('br');
      } else if (
        clickX > cropBox.x && clickX < cropBox.x + cropBox.width &&
        clickY > cropBox.y && clickY < cropBox.y + cropBox.height
      ) {
        setIsDragging('move');
      }
    } else if (mode === 'perspective') {
      const threshold = 6;
      let draggedIdx = null;
      for (let i = 0; i < corners.length; i++) {
        const dist = Math.hypot(clickX - corners[i].x, clickY - corners[i].y);
        if (dist < threshold) {
          draggedIdx = i;
          break;
        }
      }
      if (draggedIdx !== null) {
        dragStartRef.current = { startX: clickX, startY: clickY, corners: [...corners] };
        setIsDragging(draggedIdx);
      }
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (isDragging === null || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const dx = currentX - dragStartRef.current.startX;
    const dy = currentY - dragStartRef.current.startY;
    
    if (mode === 'crop') {
      const startBox = dragStartRef.current.box;
      let newBox = { ...startBox };
      
      if (isDragging === 'move') {
        newBox.x = Math.max(0, Math.min(100 - startBox.width, startBox.x + dx));
        newBox.y = Math.max(0, Math.min(100 - startBox.height, startBox.y + dy));
      } else if (isDragging === 'tl') {
        const newX = Math.max(0, Math.min(startBox.x + startBox.width - 5, startBox.x + dx));
        const newY = Math.max(0, Math.min(startBox.y + startBox.height - 5, startBox.y + dy));
        newBox.width = startBox.x + startBox.width - newX;
        newBox.height = startBox.y + startBox.height - newY;
        newBox.x = newX;
        newBox.y = newY;
      } else if (isDragging === 'tr') {
        newBox.width = Math.max(5, Math.min(100 - startBox.x, startBox.width + dx));
        const newY = Math.max(0, Math.min(startBox.y + startBox.height - 5, startBox.y + dy));
        newBox.height = startBox.y + startBox.height - newY;
        newBox.y = newY;
      } else if (isDragging === 'bl') {
        const newX = Math.max(0, Math.min(startBox.x + startBox.width - 5, startBox.x + dx));
        newBox.width = startBox.x + startBox.width - newX;
        newBox.x = newX;
        newBox.height = Math.max(5, Math.min(100 - startBox.y, startBox.height + dy));
      } else if (isDragging === 'br') {
        newBox.width = Math.max(5, Math.min(100 - startBox.x, startBox.width + dx));
        newBox.height = Math.max(5, Math.min(100 - startBox.y, startBox.height + dy));
      }
      
      if (lockAspectRatio) {
        const factor = getRatioFactor(aspectRatio) || (startBox.width * imageSize.width) / (startBox.height * imageSize.height || 1);
        if (isDragging === 'br' || isDragging === 'tr' || isDragging === 'bl' || isDragging === 'tl') {
          // Adjust height to match width times factor
          const widthPx = (newBox.width / 100) * imageSize.width;
          const heightPx = widthPx / factor;
          newBox.height = (heightPx / imageSize.height) * 100;
          if (newBox.y + newBox.height > 100) {
            newBox.height = 100 - newBox.y;
            newBox.width = ((newBox.height * imageSize.height / 100) * factor / imageSize.width) * 100;
          }
        }
      }
      setCropBox(newBox);
    } else if (mode === 'perspective') {
      const startCorners = dragStartRef.current.corners;
      const newCorners = [...startCorners];
      newCorners[isDragging] = {
        x: Math.max(0, Math.min(100, startCorners[isDragging].x + dx)),
        y: Math.max(0, Math.min(100, startCorners[isDragging].y + dy))
      };
      setCorners(newCorners);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    const images = droppedFiles.filter(f => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif'].includes(ext);
    }).map(f => ({
      name: f.name,
      path: f.path,
      size: f.size,
      ext: f.name.substring(f.name.lastIndexOf('.'))
    }));
    if (images.length > 0) {
      onFilesChange(prev => {
        const updated = [...prev];
        images.forEach(img => {
          if (!updated.some(x => x.path === img.path)) {
            updated.push(img);
          }
        });
        return updated;
      });
      setSelectedFile(images[0]);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div 
        className="middle-canvas" 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}
      >
        <CollapsibleFileBrowser
          isFileBrowserCollapsed={isFileBrowserCollapsed}
          toggleFileBrowser={toggleFileBrowser}
          explorerHeight={explorerHeight}
          handleDividerMouseDown={handleDividerMouseDown}
        >
          <FileExplorer 
                onAddFiles={(newFiles) => {
                  onFilesChange(prev => {
                    const updated = [...prev];
                    newFiles.forEach(f => {
                      if (!updated.some(x => x.path === f.path)) {
                        updated.push(f);
                      }
                    });
                    return updated;
                  });
                  if (newFiles.length > 0) setSelectedFile(newFiles[0]);
                }}
                allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
                theme={theme}
                defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
                storageKey="rfine_last_dir_image"
                onCollapse={toggleFileBrowser}
                onPreviewFile={setSelectedFile}
              />
        </CollapsibleFileBrowser>
 
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
            color: 'var(--primary-color)', 
            fontWeight: 'bold',
            marginBottom: '12px',
            gap: '12px',
            flexShrink: 0
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="var(--primary-color)" />
              Successfully saved crop output!
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
        
        <div ref={containerRef}
          style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas-bg)', borderRadius: '12px', margin: '16px 0', border: '1px solid var(--glass-border)' }}
        >
          {selectedFile && (
            <>
              {/* Floating controls toolbar */}
              <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 20 }}>
                {!isCroppedPreview ? (
                  <button
                    onClick={() => setIsCroppedPreview(true)}
                    className="btn-primary"
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--primary-color)', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    title="Apply Crop Preview (Enter)"
                  >
                    <Check size={12} color="#FFFFFF" />
                    <span>Apply Crop</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsCroppedPreview(false)}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', borderColor: '#EF4444', background: 'var(--glass-bg)', borderRadius: '4px', cursor: 'pointer' }}
                    title="Undo Preview (Esc)"
                  >
                    <RefreshCw size={12} />
                    <span>Undo</span>
                  </button>
                )}
              </div>

              {/* Enter/Esc hint banner */}
              <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', padding: '6px 12px', borderRadius: '20px', background: 'rgba(0, 0, 0, 0.75)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--color-white)', fontSize: '10px', pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ padding: '2px 4px', background: '#333', borderRadius: '3px', border: '1px solid #555', fontSize: '9px', fontWeight: 'bold' }}>Enter</span>
                <span>to preview crop</span>
                <span style={{ color: 'var(--color-slate)', margin: '0 4px' }}>|</span>
                <span style={{ padding: '2px 4px', background: '#333', borderRadius: '3px', border: '1px solid #555', fontSize: '9px', fontWeight: 'bold' }}>Esc</span>
                <span>to undo</span>
              </div>
            </>
          )}

          {selectedFile ? (
            <canvas 
              ref={canvasRef} 
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', cursor: isCroppedPreview ? 'default' : (isDragging ? 'grabbing' : 'crosshair') }} 
            />
          ) : (
            <div 
              className="dropzone flex-center"
              style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(77,155,34,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Image size={24} color="var(--primary-color)" />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-white)' }}>Drag & Drop Image Here</span>
              <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>or use the file explorer to add files</span>
            </div>
          )}
        </div>
      </div>
 
      {/* Right Sidebar */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Crop size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase', flexGrow: 1 }}>Image Cropper</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Crop, straighten, and rotate images.</p>
 
        <div className="sidebar-settings-content">
          {/* Category 1: Mode & Dimensions */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionModeExpanded(!sectionModeExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mode & Dimensions</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionModeExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionModeExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Mode</span>
                  <div className="clean-preset-grid">
                    <button 
                      className={`clean-preset-btn ${mode === 'crop' ? 'active' : ''}`} 
                      onClick={() => setMode('crop')} 
                    >
                      Crop
                    </button>
                    <button 
                      className={`clean-preset-btn ${mode === 'perspective' ? 'active' : ''}`} 
                      onClick={() => setMode('perspective')} 
                    >
                      Perspective
                    </button>
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '9.5px', color: 'var(--color-slate)', lineHeight: '1.4' }}>
                    {mode === 'crop' 
                      ? 'Crop Mode: Drag handles to select a rectangular area to crop or extend.' 
                      : 'Perspective Mode: Drag the 4 corner pins to warp, align, and flatten skewed documents or signs.'
                    }
                  </p>
                </div>

                {mode === 'crop' && (
                  <div style={{ marginBottom: '8px' }}>
                    <span className="form-label" style={{ fontSize: '10px' }}>Crop Dimensions (Pixels)</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-slate)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>WIDTH (PX)</span>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={inputWidth} 
                          onChange={(e) => handlePixelWidthChange(e.target.value)} 
                          disabled={!selectedFile || imageSize.width === 0} 
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        />
                      </div>
                      <span style={{ color: 'var(--color-slate)', fontSize: '11px', marginTop: '14px' }}>&times;</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-slate)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>HEIGHT (PX)</span>
                        <input 
                          type="number" 
                          className="form-input" 
                          value={inputHeight} 
                          onChange={(e) => handlePixelHeightChange(e.target.value)} 
                          disabled={!selectedFile || imageSize.height === 0} 
                          style={{ padding: '6px 10px', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                    {selectedFile && imageSize.width > 0 && (
                      <span style={{ display: 'block', fontSize: '9px', color: 'var(--color-slate)', marginTop: '6px' }}>
                        Original size: {imageSize.width} &times; {imageSize.height} px
                      </span>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--color-slate)', marginTop: '8px', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={lockAspectRatio} 
                        onChange={(e) => setLockAspectRatio(e.target.checked)} 
                        style={{ width: 'auto', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Lock Aspect Ratio</span>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category 2: Aspect Ratio */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionAspectExpanded(!sectionAspectExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crop size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aspect Ratio</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionAspectExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionAspectExpanded && mode === 'crop' && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                {/* Visual Ratio Cards Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  {/* 16:9 Card */}
                  <button 
                    className={`clean-preset-btn ${aspectRatio === '16:9' ? 'active' : ''}`}
                    onClick={() => handleAspectRatioChange('16:9')}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: aspectRatio === '16:9' ? 'rgba(114, 188, 40, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: aspectRatio === '16:9' ? '1.5px solid var(--primary-color)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      height: 'auto',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'var(--color-white)'
                    }}>
                      16:9
                    </div>
                  </button>

                  {/* 9:16 Card */}
                  <button 
                    className={`clean-preset-btn ${aspectRatio === '9:16' ? 'active' : ''}`}
                    onClick={() => handleAspectRatioChange('9:16')}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: aspectRatio === '9:16' ? 'rgba(114, 188, 40, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: aspectRatio === '9:16' ? '1.5px solid var(--primary-color)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      height: 'auto',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      height: '100%',
                      aspectRatio: '9/16',
                      background: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'var(--color-white)'
                    }}>
                      9:16
                    </div>
                  </button>

                  {/* 1:1 Card */}
                  <button 
                    className={`clean-preset-btn ${aspectRatio === '1:1' ? 'active' : ''}`}
                    onClick={() => handleAspectRatioChange('1:1')}
                    style={{
                      flex: 1,
                      aspectRatio: '1',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: aspectRatio === '1:1' ? 'rgba(114, 188, 40, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: aspectRatio === '1:1' ? '1.5px solid var(--primary-color)' : '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      height: 'auto',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '75%',
                      aspectRatio: '1/1',
                      background: theme === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'var(--color-white)'
                    }}>
                      1:1
                    </div>
                  </button>
                </div>

                {/* Other presets selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px' }}>
                  <button
                    className={`clean-preset-btn ${aspectRatio === 'free' ? 'active' : ''}`}
                    onClick={() => handleAspectRatioChange('free')}
                    style={{ padding: '6px 8px', fontSize: '10.5px' }}
                  >
                    Free Ratio
                  </button>
                  <select
                    className="form-input"
                    value={['16:9', '9:16', '1:1', 'free'].includes(aspectRatio) ? 'other' : aspectRatio}
                    onChange={(e) => {
                      if (e.target.value !== 'other') {
                        handleAspectRatioChange(e.target.value);
                      }
                    }}
                    style={{ padding: '4px 8px', fontSize: '10.5px', borderRadius: '6px', height: '28px', backgroundColor: 'rgba(255,255,255,0.02)' }}
                  >
                    <option value="other" disabled>Other Ratios...</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="3:2">3:2 Classic</option>
                    <option value="3:4">3:4 Portrait</option>
                    <option value="2:3">2:3 Portrait</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Category 3: Adjustments */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionAdjustExpanded(!sectionAdjustExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCw size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Adjustments</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionAdjustExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionAdjustExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px', fontWeight: '600' }}>
                      <span>Straighten</span>
                      <span>{rotation}°</span>
                    </div>
                    <input type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ width: '100%' }} />
                  </div>
                  {mode === 'perspective' && (
                    <>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px', fontWeight: '600' }}>
                          <span>Horizontal Tilt (Keystone)</span>
                          <span>{tiltX}°</span>
                        </div>
                        <input type="range" min="-45" max="45" value={tiltX} onChange={(e) => setTiltX(Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px', fontWeight: '600' }}>
                          <span>Vertical Tilt</span>
                          <span>{tiltY}°</span>
                        </div>
                        <input type="range" min="-45" max="45" value={tiltY} onChange={(e) => setTiltY(Number(e.target.value))} style={{ width: '100%' }} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Category 4: Extend Image */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionExtendExpanded(!sectionExtendExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Extend Image</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionExtendExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionExtendExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <span className="form-label" style={{ fontSize: '10px' }}>Fill Mode</span>
                <div className="clean-preset-grid" style={{ marginBottom: '8px' }}>
                  <button 
                    className={`clean-preset-btn ${fillMode === 'solid' ? 'active' : ''}`}
                    onClick={() => setFillMode('solid')}
                  >
                    Solid
                  </button>
                  <button 
                    className={`clean-preset-btn ${fillMode === 'blur' ? 'active' : ''}`}
                    onClick={() => setFillMode('blur')}
                  >
                    Blur
                  </button>
                  <button 
                    className={`clean-preset-btn ${fillMode === 'mirror' ? 'active' : ''}`}
                    onClick={() => setFillMode('mirror')}
                  >
                    Mirror
                  </button>
                </div>
                {fillMode === 'solid' && (
                  <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
                )}
                <p style={{ margin: '8px 0 0 0', fontSize: '9.5px', color: 'var(--color-slate)', lineHeight: '1.4' }}>
                  {fillMode === 'solid' && 'Solid Mode: Extends the image border with a solid background color.'}
                  {fillMode === 'blur' && 'Blur Mode: Fills the extended boundaries with a blurred replica of the image.'}
                  {fillMode === 'mirror' && 'Mirror Mode: Extends the margins by reflecting the edge pixels outwards.'}
                </p>
              </div>
            )}
          </div>

          {/* Category 5: Output Format */}
          <div style={{ marginBottom: '20px' }}>
            <div 
              onClick={() => setSectionFormatExpanded(!sectionFormatExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileImage size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Output Format</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionFormatExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionFormatExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <div className="clean-preset-grid">
                  {['jpg', 'png', 'webp'].map((fmt) => (
                    <button
                      key={fmt}
                      className={`clean-preset-btn ${outputFormat === fmt ? 'active' : ''}`}
                      onClick={() => setOutputFormat(fmt)}
                    >
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pinned Button Container */}
        <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <button 
            className="process-action-btn flex-center"
            onClick={handleSaveCrop}
            disabled={!selectedFile}
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Crop size={14} color="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>Save Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
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
              <img src={theme === 'light' ? 'logo_light.png' : 'logo.png'} style={{ height: '52px', maxWidth: '160px', objectFit: 'contain' }} alt="RFINE" draggable="false" />
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
                  Offline Media Suite
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
            />
          )}

          {activeTab === 'watermark' && (
            <WatermarkerStudio
              files={watermarkFiles}
              setFiles={setWatermarkFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              explorerPreviewFile={explorerPreviewFile}
              setExplorerPreviewFile={setExplorerPreviewFile}
              onOpenFullscreenPreview={setFullscreenPreviewFile}
            />
          )}

          {activeTab === 'color-studio' && (
            <ColorStudio
              theme={theme}
              explorerHeight={explorerHeight}
              setExplorerHeight={updateExplorerHeight}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              toggleFileBrowser={toggleFileBrowser}
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
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              mode="compress"
            />
          )}

          {activeTab === 'video-extract' && (
            <VideoCompressor
              files={videoFile ? [videoFile] : []}
              setFiles={(f) => setVideoFile(f[0] || null)}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              mode="extract"
            />
          )}

          {activeTab === 'audio-studio' && (
            <AudioStudio
              files={audioFiles}
              setFiles={setAudioFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
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
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
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
              setExplorerHeight={updateExplorerHeight}
              theme={theme}
              openFolderPicker={openFolderPicker}
              isDraggingFile={isDraggingFile}
              addRecentProcess={addRecentProcess}
              setGlobalProgress={setGlobalProgress}
              explorerPreviewFile={explorerPreviewFile}
              setExplorerPreviewFile={setExplorerPreviewFile}
              onOpenFullscreenPreview={setFullscreenPreviewFile}
            />
          )}


          {activeTab === 'case-converter' && (
            <CaseConverter theme={theme} />
          )}

          {activeTab === 'settings' && (

            <Settings theme={theme} />
          )}
        </div>
      </main>
    
      {/* About Dialog Modal */}
      {isAboutOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(4, 5, 8, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999
        }}>
          <div className="glass-panel animate-fade-in animate-slide-in" style={{
            width: '420px',
            padding: '30px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px',
            position: 'relative'
          }}>
            <button onClick={() => setIsAboutOpen(false)}
              className="btn-secondary flex-center"
              style={{ position: 'absolute', top: '15px', right: '15px', padding: '6px', borderRadius: '50%', width: '28px', height: '28px', justifyContent: 'center' }}
              title="Close"
            >
              <X size={14} />
            </button>
            <div style={{ marginBottom: '10px' }}>
              <img src={theme === 'light' ? 'logo_light.png' : 'logo.png'} style={{ maxHeight: '42px', width: 'auto' }} alt="RFINE Logo" />
              <span style={{ fontSize: '10px', color: 'var(--primary-color)', display: 'block', marginTop: '6px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Refined Media Utilities
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-slate)', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              Version 1.3.0 (Offline Mode)<br/>
              A high-performance offline desktop media processing workshop designed for speed, privacy, and visual elegance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>OS Version:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Windows x64</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>Build Engine:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Electron + React</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)' }}>
                <span>Local Server:</span>
                <span style={{ color: 'var(--color-white)', fontWeight: 'bold' }}>Online (Port 5001)</span>
              </div>
            </div>
            <button onClick={() => setIsAboutOpen(false)} className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '11px' }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
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
  const [roots, setRoots] = useState({ home: '', drives: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const [favorites, setFavorites] = useState(() => {
    const val = localStorage.getItem('rfine_favorites');
    return val ? JSON.parse(val) : [];
  });

  const handleSystemBrowse = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).map(file => ({
      name: file.name,
      path: file.path,
      size: file.size,
      ext: file.name.substring(file.name.lastIndexOf('.'))
    }));
    onAddFiles(selected);
  };

  const handleBrowseFolder = () => {
    if (!openFolderPicker) return;
    openFolderPicker(currentPath, (selectedPath) => {
      loadDirectory(selectedPath);
    });
  };

  const loadDirectory = async (dirPath) => {
    try {
      const res = await fetch(`${API_BASE}/files?path=` + encodeURIComponent(dirPath));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to read directory');
      setCurrentPath(data.currentPath);
      setParentPath(data.parentPath || '');
      setItems(data.items || []);
      setRoots(data.roots || { home: '', drives: [] });
      setExplorerError('');
      if (storageKey) {
        localStorage.setItem(storageKey, data.currentPath);
      }
      if (onPathChange) onPathChange(data.currentPath);
    } catch (err) {
      setExplorerError(err.message);
    }
  };

  useEffect(() => {
    const initial = defaultPath || roots.home || '';
    const cached = storageKey ? localStorage.getItem(storageKey) : null;
    loadDirectory(cached || initial);
  }, []);

  const handleItemClick = (item, index, e) => {
    if (item.isDir) {
      loadDirectory(item.path);
      return;
    }
    setSelectedItems(prev => ({
      ...prev,
      [item.path]: prev[item.path] ? null : item
    }));
    if (onPreviewFile) onPreviewFile(item);
  };

  const toggleFavorite = () => {
    let updated;
    if (favorites.includes(currentPath)) {
      updated = favorites.filter(p => p !== currentPath);
    } else {
      updated = [...favorites, currentPath];
    }
    setFavorites(updated);
    localStorage.setItem('rfine_favorites', JSON.stringify(updated));
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
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = 'none';
          }}
        />
      );
    }
    if (['.mp4', '.webm', '.mkv', '.mov'].includes(ext)) {
      return <FileVideo size={14} color="var(--secondary-color)" />;
    }
    return <FileText size={14} color="var(--color-slate)" />;
  };

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (item.isDir) return true;
    if (allowedExtensions.length === 0) return true;
    return allowedExtensions.includes(item.ext.toLowerCase());
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.isDir && !b.isDir) return -1;
    if (!a.isDir && b.isDir) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSelectAll = () => {
    const newSelections = {};
    sortedItems.forEach(item => {
      if (!item.isDir) {
        newSelections[item.path] = item;
      }
    });
    setSelectedItems(newSelections);
  };

  const handleDeselectAll = () => {
    setSelectedItems({});
  };

  const isFavorite = favorites.includes(currentPath);

  return (
    <div className={flat ? "flat-explorer" : "glass-card animate-fade-in"} style={flat ? { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flex: 1, minHeight: 0, position: 'relative' } : { padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', flex: 1, minHeight: 0, position: 'relative' }}>
      {!flat && onCollapse && (
        <button
          onClick={onCollapse}
          className="collapsible-toggle-btn"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            border: 'none',
            background: 'transparent',
            width: '24px',
            height: '24px',
            zIndex: 10
          }}
          title="Collapse File Explorer"
        >
          <ChevronUp size={14} color="var(--color-white)" />
        </button>
      )}
      {/* Roots Shortcuts */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <button 
          onClick={() => loadDirectory(roots.home)}
          className="btn-secondary"
          style={{ padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
        >
          <Home size={10} />
          <span>Home Directory</span>
        </button>
        {roots.drives && roots.drives.map(drive => (
          <button 
            key={drive}
            onClick={() => loadDirectory(drive)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}
          >
            <HardDrive size={10} />
            <span>{drive}</span>
          </button>
        ))}
        {favorites.map(fav => (
          <button 
            key={fav}
            onClick={() => loadDirectory(fav)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px', color: '#72BC28', borderColor: '#72BC28' }}
          >
            <Star size={10} color="#72BC28" />
            <span>{path.basename(fav) || fav}</span>
          </button>
        ))}
      </div>

      {/* Path Breadcrumbs Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <button 
          onClick={() => loadDirectory(parentPath)}
          disabled={!parentPath}
          className="btn-secondary"
          style={{ padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Back"
        >
          <ArrowLeft size={12} />
        </button>
        
        <input 
          type="text" 
          className="form-input" 
          value={currentPath}
          onChange={(e) => setCurrentPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadDirectory(currentPath)}
          style={{ flexGrow: 1, padding: '4px 10px', fontSize: '11px', borderRadius: '4px' }}
        />

        <button 
          onClick={toggleFavorite}
          className="btn-secondary"
          style={{ padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title={isFavorite ? "Bookmark this folder" : "Bookmark this folder"}
        >
          <Star size={12} fill={isFavorite ? "#72BC28" : "none"} color={isFavorite ? "#72BC28" : "currentColor"} />
        </button>

        <button 
          onClick={() => loadDirectory(currentPath)}
          className="btn-secondary"
          style={{ padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Refresh"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {/* Search & Sort Panel */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Sorting dropdown */}
        </div>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '180px', padding: '4px 8px', fontSize: '11px', borderRadius: '4px' }}
        />
      </div>

      {/* Explorer Content list */}
      <div style={{ flexGrow: 1, overflowY: 'auto', maxHeight: maxListHeight || '200px', border: '1px solid var(--glass-border)', borderRadius: '6px', background: 'rgba(0,0,0,0.1)', padding: '6px', display: 'flex', flexDirection: 'column', gap: '2px', minHeight: '80px' }}>
        {explorerError ? (
          <div style={{ color: '#EF4444', fontSize: '11px', padding: '10px', textAlign: 'center' }}>{explorerError}</div>
        ) : sortedItems.length === 0 ? (
          <div style={{ color: 'var(--color-slate)', fontSize: '11px', padding: '10px', textAlign: 'center' }}>No items found</div>
        ) : (
          sortedItems.map((item, idx) => (
            <div 
              key={item.path}
              onClick={(e) => handleItemClick(item, idx, e)}
              className={`explorer-item ${selectedItems[item.path] ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContext: 'space-between', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {!item.isDir && (
                  <input 
                    type="checkbox" 
                    checked={!!selectedItems[item.path]}
                    onChange={() => {}}
                    style={{ margin: 0, accentColor: 'var(--primary-color)' }}
                  />
                )}
                {renderIcon(item)}
                <span style={{ fontSize: '11.5px', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</span>
              </div>
              {!item.isDir && (
                <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{formatFileSize(item.size)}</span>
              )}
            </div>
          ))
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={handleSelectAll}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '10.5px', borderRadius: '4px', height: '24px', display: 'flex', alignItems: 'center' }}
            >
              Select All
            </button>
            <button 
              onClick={handleDeselectAll}
              className="btn-secondary"
              style={{ padding: '4px 8px', fontSize: '10.5px', borderRadius: '4px', height: '24px', display: 'flex', alignItems: 'center' }}
            >
              Deselect All
            </button>
          </div>
          
          <button 
            onClick={handleAddSelected}
            disabled={Object.values(selectedItems).filter(Boolean).length === 0}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
          >
            Add Selected ({Object.values(selectedItems).filter(Boolean).length})
          </button>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// IMAGE RESIZER COMPONENT
// ----------------------------------------------------------------------------
function ImageResizer({ files, onFilesChange, toggleFileBrowser, isFileBrowserCollapsed, explorerHeight, handleDividerMouseDown, theme }) {
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [format, setFormat] = useState('png');
  const [resizeMode, setResizeMode] = useState('percentage');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [scalePercent, setScalePercent] = useState('80');
  const [quality, setQuality] = useState('80');
  const [outputFolder, setOutputFolder] = useState('');
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right');
  const [keepMetadata, setKeepMetadata] = useState(true);

  // Drag and drop sorting
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
  };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
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
    if (activePreviewFile === files[index]) {
      setActivePreviewFile(null);
    }
  };

  const handleProcessImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setSuccessResult(null);
    try {
      const res = await fetch(`${API_BASE}/image/convert-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files,
          format,
          quality,
          resizeMode,
          width,
          height,
          scalePercent,
          outputFolder: outputFolder || undefined,
          watermark: watermarkText || undefined,
          watermarkPosition,
          keepMetadata
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process images');
      setSuccessResult({ targetFolder: data.targetFolder || outputFolder || '' });
    } catch (e) {
      alert('Processing failed: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
        <CollapsibleFileBrowser
          isFileBrowserCollapsed={isFileBrowserCollapsed}
          toggleFileBrowser={toggleFileBrowser}
          explorerHeight={explorerHeight}
          handleDividerMouseDown={handleDividerMouseDown}
        >
          <FileExplorer 
            onAddFiles={(newFiles) => {
              onFilesChange(prev => {
                const updated = [...prev];
                newFiles.forEach(f => {
                  if (!updated.some(x => x.path === f.path)) {
                    updated.push(f);
                  }
                });
                return updated;
              });
            }}
            allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
            storageKey="rfine_last_dir_image"
            onCollapse={toggleFileBrowser}
          />
        </CollapsibleFileBrowser>

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
            color: 'var(--primary-color)', 
            fontWeight: 'bold',
            marginBottom: '12px',
            gap: '12px',
            flexShrink: 0
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} color="var(--primary-color)" />
              Successfully processed {successResult.results ? successResult.results.length : 1} images!
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
              const fileName = typeof file === 'string' ? path.basename(file) : file.name;
              const filePath = typeof file === 'string' ? file : file.path;
              const fileSize = typeof file === 'string' ? '' : formatFileSize(file.size);
              const ext = path.extname(fileName).toUpperCase().replace('.', '');
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
                    padding: '8px 12px', 
                    borderBottom: dragOverIndex === idx && draggedIndex !== null && draggedIndex < idx ? '2px solid var(--secondary-color)' : (idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)'), 
                    borderTop: dragOverIndex === idx && draggedIndex !== null && draggedIndex > idx ? '2px solid var(--secondary-color)' : 'none',
                    backgroundColor: activePreviewFile === file ? 'rgba(0,0,0,0.03)' : 'transparent',
                    cursor: 'grab'
                  }}
                  onClick={() => setActivePreviewFile(file)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }}>⋮⋮</span>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src={`${API_BASE}/image-preview?path=${encodeURIComponent(filePath)}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        alt=""
                        onError={(e) => {
                          e.target.style.display = 'none'; // Fallback if failed to load
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{fileName}</span>
                      {(() => {
                        const result = successResult?.results?.find(r => r.name === fileName);
                        if (result && result.success) {
                          const pct = Math.round((1 - result.optimizedSize / result.originalSize) * 100);
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', marginTop: '2px' }}>
                              <span style={{ color: 'var(--color-slate)' }}>{ext} • {fileSize}</span>
                              <span style={{ color: 'var(--color-slate)' }}>&rarr;</span>
                              <span style={{ color: '#5ABF3A', fontWeight: 'bold' }}>{formatFileSize(result.optimizedSize)}</span>
                              <span style={{ background: 'rgba(90, 191, 58, 0.15)', color: '#5ABF3A', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold', fontSize: '9px' }}>
                                {pct > 0 ? `-${pct}%` : `0%`}
                              </span>
                            </div>
                          );
                        }
                        return <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{ext} • {fileSize}</span>;
                      })()}
                    </div>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '4px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    title="Remove file"
                  >
                    <Trash2 size={14} color="var(--primary-color)" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Dashed Drag/Drop Area: Local Dropzone showing overlay only inside this container */}
        <div 
          className="dropzone flex-center" 
          onClick={() => document.getElementById('image-studio-add-file-input').click()}
          style={{ 
            padding: '20px', 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <input 
            type="file"
            id="image-studio-add-file-input"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.avif,.heic"
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files).map(file => ({
                  name: file.name,
                  path: file.path || file.name,
                  size: file.size,
                  type: file.type
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
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add more files or drag & drop</span>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports JPEG, PNG, WEBP, AVIF, HEIC</span>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Image size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Image Resizer</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Batch resize and convert images.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Selection Preview at top of settings sidebar */}
          {activePreviewFile && (
            <div className="animate-fade-in" style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '15px', border: '1px solid var(--glass-border)', textAlign: 'center', position: 'relative' }}>
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
              <img 
                src={`${API_BASE}/image-preview?path=${encodeURIComponent(activePreviewFile.path || activePreviewFile)}`}
                style={{ maxWidth: '100%', maxHeight: '120px', borderRadius: '4px', objectFit: 'contain' }}
                alt="Selected preview"
              />
              <span style={{ fontSize: '10px', color: 'var(--color-slate)', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {path.basename(activePreviewFile.path || activePreviewFile)}
              </span>
            </div>
          )}

          {/* Category 1: Format & Quality */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionFormatExpanded(!sectionFormatExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Format & Quality</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionFormatExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionFormatExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                {/* Formats Presets */}
                <div style={{ marginBottom: '12px' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Output Format</span>
                  <div className="clean-preset-grid">
                    {['jpg', 'png', 'webp', 'avif'].map((fmt) => (
                      <button
                        key={fmt}
                        className={`clean-preset-btn ${format === fmt ? 'active' : ''}`}
                        onClick={() => setFormat(fmt)}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Slider */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="form-label" style={{ marginBottom: 0, fontSize: '10px' }}>Quality</span>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)' }}>{quality}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))} 
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px', color: 'var(--color-slate)' }}>
                    <span>Small File</span>
                    <span>High Fidelity</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category 2: Resize Options */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionResizeExpanded(!sectionResizeExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resize Options</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionResizeExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionResizeExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0' }}>
                <span className="form-label" style={{ fontSize: '10px' }}>Resize Mode</span>
                <select 
                  className="form-input" 
                  value={resizeMode} 
                  onChange={(e) => setResizeMode(e.target.value)}
                  style={{ marginBottom: '10px', padding: '6px 10px', fontSize: '12px' }}
                >
                  <option value="none">Original Resolution</option>
                  <option value="percentage">Percentage Scale</option>
                  <option value="resolution">In Pixels</option>
                  <option value="proportionate">Based on one side (Proportionate)</option>
                </select>

                {resizeMode === 'percentage' && (
                  <div style={{ marginBottom: '8px' }}>
                    <span className="form-label" style={{ fontSize: '9px' }}>Scale Percentage</span>
                    <input 
                      type="number" 
                      className="form-input" 
                      value={scalePercent} 
                      onChange={(e) => setScalePercent(parseInt(e.target.value) || 100)} 
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    />
                  </div>
                )}

                {resizeMode === 'resolution' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Width (px)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={width} 
                        onChange={(e) => setWidth(e.target.value)} 
                        placeholder="Width"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Height (px)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={height} 
                        onChange={(e) => setHeight(e.target.value)} 
                        placeholder="Height"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      />
                    </div>
                  </div>
                )}

                {resizeMode === 'proportionate' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Anchor Side</span>
                      <select 
                        className="form-input" 
                        value={proportionateAnchor} 
                        onChange={(e) => setProportionateAnchor(e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        <option value="width">Width</option>
                        <option value="height">Height</option>
                      </select>
                    </div>
                    <div>
                      <span className="form-label" style={{ fontSize: '9px' }}>Dimension (px)</span>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={proportionateValue} 
                        onChange={(e) => setProportionateValue(e.target.value)} 
                        placeholder="e.g. 1920"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
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
                    id="chk-img-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-img-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
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
            onClick={handleConvert}
            disabled={processing || files.length === 0}
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'PROCESSING...' : 'PROCESS SELECTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// WATERMARK STUDIO MODULE (STANDALONE 5TH TAB)
// ----------------------------------------------------------------------------
function WatermarkerStudio({ files, setFiles, setGlobalProgress, explorerPreviewFile, setExplorerPreviewFile, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, onOpenFullscreenPreview, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [watermark, setWatermark] = useState(() => localStorage.getItem('rfine_wm_watermark') || ''); // base64 DataURL of watermark image
  const [watermarkType, setWatermarkType] = useState(() => localStorage.getItem('rfine_wm_type') || 'image'); 
  const [watermarkText, setWatermarkText] = useState(() => localStorage.getItem('rfine_wm_text') || 'RFINE Copyright'); 
  const [watermarkOpacity, setWatermarkOpacity] = useState(() => parseFloat(localStorage.getItem('rfine_wm_opacity')) || 0.35);
  const [watermarkSize, setWatermarkSize] = useState(() => parseInt(localStorage.getItem('rfine_wm_size')) || 15);
  const [watermarkPosition, setWatermarkPosition] = useState(() => localStorage.getItem('rfine_wm_position') || 'bottom-right');
  const [watermarkFileName, setWatermarkFileName] = useState(() => localStorage.getItem('rfine_wm_filename') || '');
  
  // Custom Drag coordinate percentages (defaults to bottom-right)
  const [watermarkX, setWatermarkX] = useState(() => parseFloat(localStorage.getItem('rfine_wm_x')) || 82);
  const [watermarkY, setWatermarkY] = useState(() => parseFloat(localStorage.getItem('rfine_wm_y')) || 82);
  const [isDragging, setIsDragging] = useState(false);
  const [modalPos, setModalPos] = useState({ x: 60, y: 100 });
  const [dragStart, setDragStart] = useState(null);

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

  const handleModalMouseDown = (e) => {
    // Only drag on left click and not if clicking inputs or buttons
    if (e.button !== 0) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('input')) return;
    setDragStart({
      startX: e.clientX - modalPos.x,
      startY: e.clientY - modalPos.y
    });
  };

  const handleModalMouseMove = (e) => {
    if (!dragStart) return;
    setModalPos({
      x: e.clientX - dragStart.startX,
      y: e.clientY - dragStart.startY
    });
  };

  const handleModalMouseUp = () => {
    setDragStart(null);
  };

  useEffect(() => { localStorage.setItem('rfine_wm_watermark', watermark); }, [watermark]);
  useEffect(() => { localStorage.setItem('rfine_wm_type', watermarkType); }, [watermarkType]);
  useEffect(() => { localStorage.setItem('rfine_wm_text', watermarkText); }, [watermarkText]);
  useEffect(() => { localStorage.setItem('rfine_wm_opacity', watermarkOpacity); }, [watermarkOpacity]);
  useEffect(() => { localStorage.setItem('rfine_wm_size', watermarkSize); }, [watermarkSize]);
  useEffect(() => { localStorage.setItem('rfine_wm_position', watermarkPosition); }, [watermarkPosition]);
  useEffect(() => { localStorage.setItem('rfine_wm_filename', watermarkFileName); }, [watermarkFileName]);
  useEffect(() => { localStorage.setItem('rfine_wm_x', watermarkX); }, [watermarkX]);
  useEffect(() => { localStorage.setItem('rfine_wm_y', watermarkY); }, [watermarkY]);

  const setPlacementPreset = (pos) => {
    const size = watermarkSize || 15;
    if (pos === 'top-left') {
      setWatermarkX(3);
      setWatermarkY(3);
    } else if (pos === 'top-right') {
      setWatermarkX(100 - size - 3);
      setWatermarkY(3);
    } else if (pos === 'center') {
      setWatermarkX(50 - (size / 2));
      setWatermarkY(50 - (size / 2));
    } else if (pos === 'bottom-left') {
      setWatermarkX(3);
      setWatermarkY(100 - size - 3);
    } else if (pos === 'bottom-right') {
      setWatermarkX(100 - size - 3);
      setWatermarkY(100 - size - 3);
    }
    setWatermarkPosition(pos);
  };

  const handleSizeChange = (newSize) => {
    setWatermarkSize(newSize);
    const pos = watermarkPosition;
    if (pos === 'top-right') {
      setWatermarkX(100 - newSize - 3);
    } else if (pos === 'bottom-right') {
      setWatermarkX(100 - newSize - 3);
      setWatermarkY(100 - newSize - 3);
    } else if (pos === 'bottom-left') {
      setWatermarkY(100 - newSize - 3);
    } else if (pos === 'center') {
      setWatermarkX(50 - (newSize / 2));
      setWatermarkY(50 - (newSize / 2));
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    let xPct = ((e.clientX - rect.left) / rect.width) * 100;
    let yPct = ((e.clientY - rect.top) / rect.height) * 100;
    
    xPct = Math.max(0, Math.min(xPct - (watermarkSize / 2), 100 - watermarkSize));
    yPct = Math.max(0, Math.min(yPct - (watermarkSize / 2), 100 - watermarkSize));
    
    setWatermarkX(xPct);
    setWatermarkY(yPct);
    setWatermarkPosition('custom');
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  
  const [saveDestMode, setSaveDestMode] = useState(() => localStorage.getItem('rfine_wm_save_dest_mode') || 'original');
  const [saveCopyMode, setSaveCopyMode] = useState(() => localStorage.getItem('rfine_wm_save_copy_mode') || 'copy');
  const [customDestPath, setCustomDestPath] = useState(() => localStorage.getItem('rfine_wm_custom_dest_path') || '');
  const [openOnComplete, setOpenOnComplete] = useState(() => {
    const val = localStorage.getItem('rfine_wm_open_on_complete');
    return val === null ? true : val === 'true';
  });

  useEffect(() => { localStorage.setItem('rfine_wm_open_on_complete', openOnComplete); }, [openOnComplete]);
  useEffect(() => { localStorage.setItem('rfine_wm_save_dest_mode', saveDestMode); }, [saveDestMode]);
  useEffect(() => { localStorage.setItem('rfine_wm_save_copy_mode', saveCopyMode); }, [saveCopyMode]);
  useEffect(() => { localStorage.setItem('rfine_wm_custom_dest_path', customDestPath); }, [customDestPath]);

  const handleBrowseDestFolder = () => {
    openFolderPicker(customDestPath, (selectedPath) => {
      setCustomDestPath(selectedPath);
      setSaveDestMode('custom');
    });
  };
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    if (explorerPreviewFile) {
      setActivePreviewFile(explorerPreviewFile);
    }
  }, [explorerPreviewFile]);

  const handleAddExplorerFiles = (newFiles) => {
    setFiles(prev => {
      const existingPaths = prev.map(f => f.path);
      const filtered = newFiles.filter(nf => !existingPaths.includes(nf.path));
      return [...prev, ...filtered];
    });
    if (newFiles.length > 0) {
      setActivePreviewFile(newFiles[0]);
    }
    setSuccessResult(null);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activePreviewFile === files[index]) {
      setActivePreviewFile(null);
    }
  };

  const handleApplyWatermark = async () => {
    if (files.length === 0) return;
    if (watermarkType === 'image' && !watermark) {
      alert('Please configure a watermark image first!');
      return;
    }
    if (watermarkType === 'text' && !watermarkText) {
      alert('Please configure a watermark text first!');
      return;
    }
    setProcessing(true);
    setSuccessResult(null);
    setGlobalProgress({ active: true, percent: 0, label: 'Watermarking images...' });

    // Cache image watermark once on server to prevent payload bottlenecks
    if (watermarkType === 'image') {
      try {
        await fetch(`${API_BASE}/watermark/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ watermark })
        });
      } catch (e) {
        console.error('Failed to cache watermark on server:', e);
      }
    }

    const total = files.length;
    const processedList = [];
    let lastSavedFolder = '';

    for (let i = 0; i < total; i++) {
      const file = files[i];
      setGlobalProgress({
        active: true,
        percent: Math.round((i / total) * 100),
        label: `Watermarking ${file.name} (${i + 1}/${total})...`
      });

      try {
        const fileRes = await fetch(`${API_BASE}/image/convert-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: [file],
            format: file.name.substring(file.name.lastIndexOf('.') + 1) || 'png',
            quality: 85,
            resizeMode: 'none',
            watermark: watermarkType === 'image' ? 'temp_watermark.png' : watermarkText,
            watermarkType,
            keepMetadata: true,
            watermarkOpacity,
            watermarkSize,
            watermarkPosition,
            watermarkX,
            watermarkY,
            replaceOriginal: saveCopyMode === 'replace',
            fileSuffix: '_watermarked',
            outputFolder: 
              saveDestMode === 'original' ? undefined :
              saveDestMode === 'default' ? (getDefaultOutputPath('rfine_def_image_dir') || undefined) :
              customDestPath || undefined
          })
        });

        const resData = await fileRes.json();
        const singleResult = resData.results[0];

        if (singleResult && singleResult.success) {
          processedList.push(singleResult);
          lastSavedFolder = singleResult.targetFolder;
          if (addRecentProcess) {
            addRecentProcess(
              'Watermarker',
              singleResult.name,
              singleResult.originalSize,
              singleResult.optimizedSize,
              singleResult.targetFolder
            );
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    setGlobalProgress({ active: false, percent: 100, label: '' });
    setProcessing(false);

    if (processedList.length > 0) {
      setSuccessResult({
        results: processedList,
        targetFolder: lastSavedFolder
      });

      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath: lastSavedFolder })
          });
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      alert('Failed to apply watermark. Please check if your watermark image or photos are valid.');
    }
  };

  const handleOpenCurrentFolder = async () => {
    if (successResult && successResult.targetFolder) {
      try {
        await fetch(`${API_BASE}/open-folder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folderPath: successResult.targetFolder })
        });
      } catch (e) {
        console.error(e);
      }
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
            allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
            maxListHeight={null}
            onPreviewFile={setExplorerPreviewFile}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
            storageKey="rfine_last_dir_watermark"
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
            <button 
              onClick={() => { setFiles([]); setSuccessResult(null); }} 
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Clear Queue
            </button>
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
              Watermark applied successfully!
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
            {files.map((file, idx) => (
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
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  borderBottom: dragOverIndex === idx && draggedIndex !== null && draggedIndex < idx ? '2px solid var(--secondary-color)' : (idx === files.length - 1 ? 'none' : '1px solid var(--glass-border)'), 
                  borderTop: dragOverIndex === idx && draggedIndex !== null && draggedIndex > idx ? '2px solid var(--secondary-color)' : 'none',
                  backgroundColor: activePreviewFile === file ? 'rgba(77, 155, 34, 0.12)' : 'transparent',
                  cursor: 'grab',
                  fontSize: '12px' 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                  <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }}>⋮⋮</span>
                  <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                    <img 
                      src={`${API_BASE}/image-preview?path=${encodeURIComponent(file.path)}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      alt=""
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ color: 'var(--color-white)', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={file.path}>
                      {file.name}
                    </span>
                    {(() => {
                      const result = successResult?.results?.find(r => r.name === file.name);
                      if (result && result.success) {
                        const pct = Math.round((1 - result.optimizedSize / result.originalSize) * 100);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', marginTop: '2px' }}>
                            <span style={{ color: 'var(--color-slate)' }}>{formatFileSize(file.size)}</span>
                            <span style={{ color: 'var(--color-slate)' }}>&rarr;</span>
                            <span style={{ color: '#5ABF3A', fontWeight: 'bold' }}>{formatFileSize(result.optimizedSize)}</span>
                            <span style={{ background: 'rgba(90, 191, 58, 0.15)', color: '#5ABF3A', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold', fontSize: '9px' }}>
                              {pct > 0 ? `-${pct}%` : `0%`}
                            </span>
                          </div>
                        );
                      }
                      return <span style={{ color: 'var(--color-slate)', fontSize: '10px' }}>{formatFileSize(file.size)}</span>;
                    })()}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '4px' }}
                  title="Remove file"
                >
                  <Trash2 size={14} color="var(--primary-color)" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div 
          className="dropzone flex-center" 
          onClick={() => document.getElementById('watermark-studio-add-file-input').click()}
          style={{ 
            padding: '20px', 
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <input 
            type="file"
            id="watermark-studio-add-file-input"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.avif,.heic"
            onChange={(e) => {
              if (e.target.files) {
                const newFiles = Array.from(e.target.files).map(file => ({
                  name: file.name,
                  path: file.path || file.name,
                  size: file.size,
                  type: file.type
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
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports JPEG, PNG, WEBP, AVIF, HEIC</span>
            </>
          )}
        </div>
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Layers size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Watermarker</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Batch watermark images.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Active Preview Frame with watermark overlay */}
          {activePreviewFile && (
            <div className="animate-fade-in" style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '15px', border: '1px solid var(--glass-border)', textAlign: 'center', position: 'relative' }}>
              {onOpenFullscreenPreview && (
                <button
                  onClick={() => onOpenFullscreenPreview(activePreviewFile)}
                  className="btn-secondary"
                  style={{ position: 'absolute', top: '6px', right: '6px', padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', zIndex: 10 }}
                  title="Open Fullscreen Preview"
                >
                  <Maximize2 size={12} color="#FFFFFF" />
                </button>
              )}
              <div 
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  maxWidth: '100%',
                  maxHeight: '160px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  userSelect: 'none',
                  background: 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <img 
                  src={`${API_BASE}/image-preview?path=${encodeURIComponent(activePreviewFile.path)}`}
                  style={{ display: 'block', maxWidth: '100%', maxHeight: '160px', borderRadius: '4px', objectFit: 'contain', pointerEvents: 'none' }}
                  alt="Selected preview"
                />
                {watermarkType === 'image' && watermark && (
                  <img 
                    src={watermark}
                    onMouseDown={handleMouseDown}
                    style={{
                      position: 'absolute',
                      left: `${watermarkX}%`,
                      top: `${watermarkY}%`,
                      width: `${watermarkSize}%`,
                      opacity: watermarkOpacity,
                      cursor: 'move',
                      userSelect: 'none',
                      pointerEvents: 'auto',
                      border: '1px dashed rgba(255,255,255,0.4)',
                      transition: isDragging ? 'none' : 'all 0.1s ease'
                    }}
                    alt="Watermark overlay"
                  />
                )}
                {watermarkType === 'text' && watermarkText && (
                  <div
                    onMouseDown={handleMouseDown}
                    style={{
                      position: 'absolute',
                      left: `${watermarkX}%`,
                      top: `${watermarkY}%`,
                      fontSize: `${Math.round(14 * (watermarkSize / 15))}px`,
                      color: '#ffffff',
                      opacity: watermarkOpacity,
                      cursor: 'move',
                      userSelect: 'none',
                      pointerEvents: 'auto',
                      border: '1px dashed rgba(255,255,255,0.4)',
                      padding: '2px 4px',
                      fontWeight: 'bold',
                      fontFamily: 'sans-serif',
                      whiteSpace: 'nowrap',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                      transition: isDragging ? 'none' : 'all 0.1s ease'
                    }}
                  >
                    {watermarkText}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {activePreviewFile.name}
              </span>
            </div>
          )}

          {/* Category 1: Watermark Configuration */}
          <div style={{ marginBottom: '12px' }}>
            <div 
              onClick={() => setSectionConfigExpanded(!sectionConfigExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Configuration</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionConfigExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionConfigExpanded && (
              <div className="animate-fade-in" style={{ padding: '2px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span className="form-label" style={{ fontSize: '10px' }}>Watermark Type</span>
                  <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <button
                      type="button"
                      onClick={() => setWatermarkType('image')}
                      className={`clean-preset-btn ${watermarkType === 'image' ? 'active' : ''}`}
                    >
                      Image Logo
                    </button>
                    <button
                      type="button"
                      onClick={() => setWatermarkType('text')}
                      className={`clean-preset-btn ${watermarkType === 'text' ? 'active' : ''}`}
                    >
                      Text
                    </button>
                  </div>
                </div>

                {watermarkType === 'image' && (
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Watermark File (PNG/JPG)</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg"
                        style={{ display: 'none' }}
                        id="watermark-studio-file-input-sidebar"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setWatermarkFileName(file.name);
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setWatermark(event.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => document.getElementById('watermark-studio-file-input-sidebar').click()}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '10.5px' }}
                      >
                        Choose...
                      </button>
                      <span style={{ fontSize: '9px', color: 'var(--color-slate)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flexGrow: 1 }}>
                        {watermarkFileName ? watermarkFileName : 'No file'}
                      </span>
                    </div>
                  </div>
                )}

                {watermarkType === 'text' && (
                  <div>
                    <span className="form-label" style={{ fontSize: '10px' }}>Watermark Text</span>
                    <input 
                      type="text" 
                      value={watermarkText} 
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text..."
                      className="form-input"
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    />
                  </div>
                )}

                {((watermarkType === 'image' && watermark) || watermarkType === 'text') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="form-label" style={{ fontSize: '10px', marginBottom: 0 }}>Opacity</span>
                        <span style={{ background: 'rgba(77, 155, 34, 0.15)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>
                          {Math.round(watermarkOpacity * 100)}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={Math.round(watermarkOpacity * 100)} 
                        onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value) / 100)} 
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="form-label" style={{ fontSize: '10px', marginBottom: 0 }}>Size</span>
                        <span style={{ background: 'rgba(77, 155, 34, 0.15)', color: 'var(--primary-color)', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '10px' }}>
                          {watermarkSize}%
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="5" 
                        max="50" 
                        value={watermarkSize} 
                        onChange={(e) => handleSizeChange(parseInt(e.target.value))} 
                      />
                    </div>

                    <div>
                      <span className="form-label" style={{ fontSize: '9px', marginBottom: '4px' }}>Presets</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
                        {[
                          { value: 'top-left', label: 'T-L' },
                          { value: 'top-right', label: 'T-R' },
                          { value: 'center', label: 'Mid' },
                          { value: 'bottom-left', label: 'B-L' },
                          { value: 'bottom-right', label: 'B-R' }
                        ].map((pos) => (
                          <button
                            key={pos.value}
                            type="button"
                            onClick={() => setPlacementPreset(pos.value)}
                            className="btn-secondary"
                            style={{
                              padding: '4px 0',
                              fontSize: '9px',
                              justifyContent: 'center',
                              background: watermarkPosition === pos.value ? 'rgba(77, 155, 34, 0.15)' : 'transparent',
                              borderColor: watermarkPosition === pos.value ? 'var(--primary-color)' : 'var(--glass-border)',
                              fontWeight: watermarkPosition === pos.value ? 'bold' : 'normal'
                            }}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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

                <div style={{ marginTop: '10px' }}>
                  <span className="form-label" style={{ fontSize: '10px' }}>Save Action</span>
                  <div className="clean-preset-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <button
                      type="button"
                      className={`clean-preset-btn ${saveCopyMode === 'copy' ? 'active' : ''}`}
                      onClick={() => setSaveCopyMode('copy')}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      Add as Copy
                    </button>
                    <button
                      type="button"
                      className={`clean-preset-btn ${saveCopyMode === 'replace' ? 'active' : ''}`}
                      onClick={() => setSaveCopyMode('replace')}
                      style={{ padding: '6px 4px', fontSize: '9.5px' }}
                    >
                      Replace Original
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input 
                    type="checkbox" 
                    id="chk-wm-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-wm-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
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
            onClick={handleApplyWatermark}
            disabled={files.length === 0 || !watermark || processing}
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'PROCESSING...' : 'PROCESS SELECTED'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// VIDEO COMPRESSOR MODULE
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

  const [sectionFormatExpanded, setSectionFormatExpanded] = useState(true);
  const [sectionScaleExpanded, setSectionScaleExpanded] = useState(true);
  const [sectionSaveExpanded, setSectionSaveExpanded] = useState(true);
  
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

  useEffect(() => { localStorage.setItem('rfine_vid_format', format); }, [format]);
  useEffect(() => { localStorage.setItem('rfine_vid_qualitypercent', qualityPercent); }, [qualityPercent]);
  useEffect(() => { localStorage.setItem('rfine_vid_scale', scale); }, [scale]);
  useEffect(() => { localStorage.setItem('rfine_vid_muteaudio', muteAudio); }, [muteAudio]);
  useEffect(() => { localStorage.setItem('rfine_vid_open_on_complete', openOnComplete); }, [openOnComplete]);
  useEffect(() => { localStorage.setItem('rfine_vid_save_dest_mode', saveDestMode); }, [saveDestMode]);
  useEffect(() => { localStorage.setItem('rfine_vid_custom_dest_path', customDestPath); }, [customDestPath]);

  const handleBrowseDestFolder = () => {
    openFolderPicker(customDestPath, (selectedPath) => {
      setCustomDestPath(selectedPath);
      setSaveDestMode('custom');
    });
  }; 

  const handleAddVideo = (selected) => {
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
    setStatusMsg('');
    setSuccessResult(null);
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      alert('Please select files to compress first!');
      return;
    }
    setCompressing(true);
    setSuccessResult(null);
    setStatusMsg('Compressing offline...');

    const mappedCrf = Math.round(35 - ((qualityPercent - 10) / 90) * 17);
    let lastSavedFolder = '';
    const results = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        setGlobalProgress({ 
          active: true, 
          percent: Math.round((i / files.length) * 100), 
          label: `Compressing video ${i + 1}/${files.length}: ${currentFile.name}...` 
        });

        const targetDir = 
          saveDestMode === 'original' ? undefined :
          saveDestMode === 'default' ? (getDefaultOutputPath('rfine_def_video_dir') || undefined) :
          customDestPath || undefined;

        const res = await fetch(`${API_BASE}/video/compress-local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            localPath: currentFile.path,
            format,
            crf: mappedCrf,
            scale,
            outputFolder: targetDir,
            muteAudio 
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to start compression');
        lastSavedFolder = data.targetFolder || currentFile.path.substring(0, currentFile.path.lastIndexOf('\\'));
        
        results.push({
          name: currentFile.name,
          success: true,
          originalSize: currentFile.size,
          optimizedSize: data.optimizedSize || 0
        });

        if (addRecentProcess) {
          addRecentProcess(
            'Video Compressor',
            currentFile.name,
            currentFile.size,
            data.optimizedSize || null,
            lastSavedFolder
          );
        }
      }

      setGlobalProgress({ active: true, percent: 100, label: 'All video compression tasks finished!' });
      setTimeout(() => setGlobalProgress({ active: false, percent: 0, label: '' }), 3000);
      
      setSuccessResult({ targetFolder: lastSavedFolder, count: files.length, results });
      setStatusMsg(`Compression completed!`);

      if (openOnComplete && lastSavedFolder) {
        try {
          await fetch(`${API_BASE}/open-folder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath: lastSavedFolder })
          });
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      setGlobalProgress({ active: false, percent: 0, label: '' });
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setCompressing(false);
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
            onAddFiles={handleAddVideo} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov']} 
            maxListHeight={null} 
            onPreviewFile={(f) => {
              const fileObj = typeof f === 'string' ? { path: f, name: path.basename(f), size: 0 } : f;
              handleAddVideo([fileObj]);
              setActivePreviewFile(fileObj);
            }}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_video"
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
              Successfully compressed {successResult.count || 1} video files!
            </span>
            {successResult.savedDir && (
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

        {/* Main Workspace Video Player */}
        {videoSrc ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexShrink: 0, marginTop: '12px' }}>
            {/* Video Scrubber & Playback */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column', 
              padding: '16px', 
              background: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              minHeight: 0
            }}>
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
                style={{ width: '100%', maxHeight: '220px', borderRadius: '8px', border: '1px solid var(--glass-border)', objectFit: 'contain', cursor: 'pointer' }}
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
                    if (videoRef.current) {
                      videoRef.current.currentTime = val;
                    }
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
                    <span style={{ fontSize: '10.5px', color: 'var(--color-slate)' }}>{formatTime(currentTime)}</span>
                    <span style={{ 
                      background: 'var(--primary-color)', 
                      color: '#FFF', 
                      padding: '2px 6px', 
                      borderRadius: '8px', 
                      fontSize: '10px',
                      fontWeight: 'bold' 
                    }}>
                      {formatTimeWithFrames(currentTime)}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-slate)' }}>{formatTime(duration)}</span>
                  </div>
                </div>
              </div>

              {/* Camera Trigger */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5px' }}>
                <button 
                  onClick={handleCaptureFrame}
                  className="flex-center"
                  style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '50%', 
                    padding: 0,
                    boxShadow: '0 4px 15px rgba(77, 155, 34, 0.2)',
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Capture Current Frame"
                >
                  <Camera size={20} color="#FFF" />
                </button>
                <span style={{ fontSize: '8px', color: 'var(--color-slate)', marginTop: '6px', fontWeight: 'bold', letterSpacing: '1px' }}>
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
                  setFile(e.target.files[0].path || e.target.files[0].name);
                }
              }}
              style={{ display: 'none' }}
            />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>Select a video file to capture stills</span>
            <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports MP4, WebM, MKV, MOV</span>
          </div>
        )}
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Camera size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>Frame Extractor</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Extract high-quality frames.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Active Still Preview & Checker */}
          {activeStill && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <div style={{ padding: '0', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', border: '1px solid var(--glass-border)', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                {onOpenFullscreenPreview && (
                  <button
                    onClick={() => onOpenFullscreenPreview({ ...activeStill, name: activeStill.name || `frame_${activeStill.timestamp}.png` })}
                    className="btn-secondary"
                    style={{ position: 'absolute', top: '6px', right: '6px', padding: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', zIndex: 5 }}
                    title="Open Fullscreen Preview"
                  >
                    <Maximize2 size={12} color="#FFFFFF" />
                  </button>
                )}
                <img 
                  src={activeStill.dataUrl} 
                  style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }} 
                  alt="Selected still" 
                />
              </div>

              {/* Checkbox wrapper */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-light-gray)', justifyContent: 'center', margin: '4px 0', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={activeStill.selected} 
                  onChange={() => toggleSelectStill(activeStill.id)} 
                  style={{ width: '13px', height: '13px', cursor: 'pointer' }}
                />
                <span>Include in Export ({activeStill.timestamp})</span>
              </label>

              {/* Single Download button */}
              <button 
                onClick={() => handleSaveStillLocally(activeStill)} 
                className="btn-secondary flex-center"
                style={{ width: '100%', padding: '6px 0', borderRadius: '4px' }}
                title="Save current still to disk"
              >
                <Download size={13} color="var(--primary-color)" />
              </button>
            </div>
          )}

          {/* Captured Stills Grid */}
          {gallery.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0 10px 0', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <Camera size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Captured Stills ({gallery.length})
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                {gallery.map(still => (
                  <div 
                    key={still.id}
                    onClick={() => setActiveStill(still)}
                    style={{
                      position: 'relative',
                      aspectRatio: '16/9',
                      borderRadius: '4px',
                      border: activeStill && activeStill.id === still.id ? '2px solid var(--primary-color)' : '1px solid var(--glass-border)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      background: '#000',
                      opacity: still.selected ? 1 : 0.5,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={still.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    {/* Clickable Selection Circle Badge */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectStill(still.id);
                      }}
                      style={{ 
                        position: 'absolute', 
                        top: '3px', 
                        left: '3px', 
                        background: still.selected ? 'var(--primary-color)' : 'rgba(0,0,0,0.5)', 
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        borderRadius: '50%', 
                        width: '18px', 
                        height: '18px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 10,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                        transition: 'all 0.15s ease'
                      }}
                      title={still.selected ? "Deselect still" : "Select still"}
                    >
                      {still.selected && <Check size={11} color="#FFF" style={{ strokeWidth: 3 }} />}
                    </div>
                    <div style={{ position: 'absolute', bottom: '2px', left: '2px', right: '2px', background: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: '7.5px', textAlign: 'center', borderRadius: '2px', padding: '1px 0' }}>
                      {still.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



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
                    id="chk-ext-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-ext-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
                    Auto-Open Output Directory
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pinned Button Container */}
        {gallery.length > 0 && (
          <div style={{ paddingTop: '15px', borderTop: '1px solid var(--glass-border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button 
                onClick={handleDownloadAll}
                className="btn-secondary flex-center" 
                style={{ padding: '10px 0', fontSize: '11px', justifyContent: 'center', borderColor: 'var(--glass-border)' }}
              >
                SAVE ALL
              </button>
              <button 
                onClick={handleDownloadSelected}
                className="btn-primary flex-center" 
                style={{ padding: '10px 0', fontSize: '11px', justifyContent: 'center', color: '#FFFFFF' }}
              >
                SAVE SELECTED
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// BULK RENAMER MODULE (UNIFIED 2-COLUMN LAYOUT WITH DRAG-AND-DROP SORTING)
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
                <div 
                  key={f.path} 
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
                    borderBottomActive: dragOverIndex === idx && draggedIndex < idx ? '2px solid var(--primary-color)' : '',
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
function GIFCreator({ files, setFiles, setGlobalProgress, theme, openFolderPicker, isDraggingFile, explorerHeight, setExplorerHeight, addRecentProcess, isFileBrowserCollapsed, toggleFileBrowser }) {
  const [startTime, setStartTime] = useState('0.0');
  const [duration, setDuration] = useState('5.0');
  const [gifWidth, setGifWidth] = useState('480');
  const [gifFps, setGifFps] = useState('15');

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

  const handleAddVideo = (selected) => {
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

  const handleApplyGIF = async () => {
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
          label: `Creating GIF ${i + 1}/${files.length}: ${file.name}...` 
        });

        const destFolder = saveDestMode === 'original' ? path.dirname(file.path) :
                           saveDestMode === 'default' ? getDefaultOutputPath() :
                           customDestPath;
                           
        const outName = `${path.parse(file.path).name}_clip.gif`;
        const outputPath = path.join(destFolder || path.dirname(file.path), outName);

        const res = await fetch(`${API_BASE}/gif/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filePath: file.path,
            outputPath,
            startTime,
            duration,
            width: gifWidth,
            fps: gifFps
          })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'GIF creation failed');
        lastSavedFolder = destFolder || path.dirname(file.path);
        if (addRecentProcess) {
          addRecentProcess(
            'GIF Creator',
            `${path.parse(file.path).name}_clip.gif`,
            file.size || null,
            null,
            lastSavedFolder
          );
        }
      }

      setGlobalProgress({ active: true, percent: 100, label: 'All GIFs created successfully!' });
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
      alert('Error creating GIFs: ' + e.message);
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
            onAddFiles={handleAddVideo} 
            allowedExtensions={['.mp4', '.webm', '.mkv', '.mov', '.avi']}
            maxListHeight={null}
            onPreviewFile={(f) => {
              const fileObj = typeof f === 'string' ? { path: f, name: path.basename(f), size: 0 } : f;
              handleAddVideo([fileObj]);
              setActivePreviewFile(fileObj);
            }}
            theme={theme}
            defaultPath={localStorage.getItem('rfine_def_video_dir') || undefined}
            storageKey="rfine_last_dir_gif_creator"
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
              Animated GIFs created successfully!
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
                <div 
                  key={f.path} 
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
                    borderBottomActive: dragOverIndex === idx && draggedIndex < idx ? '2px solid var(--primary-color)' : '',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexGrow: 1 }}>
                    <span style={{ cursor: 'grab', color: 'var(--color-slate)', fontSize: '12px' }} onClick={(e) => e.stopPropagation()}>⋮⋮</span>
                    <div style={{ width: '36px', height: '36px', background: 'rgba(0,0,0,0.05)', border: '1px solid var(--glass-border)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                      <Video size={16} color="var(--primary-color)" />
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
            onClick={() => document.getElementById('gif-creator-add-file-input').click()}
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
              id="gif-creator-add-file-input"
              multiple
              accept=".mp4,.webm,.mkv,.mov,.avi"
              onChange={(e) => {
                if (e.target.files) {
                  const arr = Array.from(e.target.files).map(x => ({ path: x.path || x.name, name: x.name, size: x.size }));
                  handleAddVideo(arr);
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
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>+ Add video files or drag & drop</span>
                <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Supports MP4, WebM, MKV, MOV, AVI</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Sidebar: Refinement Settings */}
      <div className="right-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 4px 0' }}>
          <Image size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary-color)', margin: 0, textTransform: 'uppercase' }}>GIF Creator</h2>
        </div>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: '0 0 24px 0', lineHeight: '1.4' }}>Create animated GIFs.</p>

        {/* Inner Scrollable Settings Container */}
        <div className="sidebar-settings-content">
          {/* Active File info */}
          {activePreviewFile && (
            <div className="animate-fade-in" style={{ padding: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--glass-border)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={activePreviewFile.path}>
                🎬 {activePreviewFile.name}
              </span>
            </div>
          )}

          {/* Category 1: GIF Configuration */}
          <div style={{ marginBottom: '16px' }}>
            <div 
              onClick={() => setSectionConfigExpanded(!sectionConfigExpanded)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '6px 0', borderBottom: '1px solid var(--glass-border)', marginBottom: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={13} color="var(--primary-color)" />
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GIF Clipper Settings</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>{sectionConfigExpanded ? '▼' : '▶'}</span>
            </div>

            {sectionConfigExpanded && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '10px' }}>Start Time (s)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="form-input" 
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '10px' }}>Duration (s)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0.5"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="form-input" 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '10px' }}>Width</label>
                    <select 
                      className="form-input" 
                      value={gifWidth} 
                      onChange={(e) => setGifWidth(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      <option value="320">320px</option>
                      <option value="480">480px</option>
                      <option value="640">640px</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '10px' }}>Frame Rate</label>
                    <select 
                      className="form-input" 
                      value={gifFps} 
                      onChange={(e) => setGifFps(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12px' }}
                    >
                      <option value="10">10 fps</option>
                      <option value="15">15 fps</option>
                      <option value="24">24 fps</option>
                    </select>
                  </div>
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
                    id="chk-gif-open-folder"
                    checked={openOnComplete}
                    onChange={(e) => setOpenOnComplete(e.target.checked)}
                  />
                  <label htmlFor="chk-gif-open-folder" style={{ fontSize: '11px', color: 'var(--color-white)', cursor: 'pointer' }}>
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
            onClick={handleApplyGIF}
            disabled={processing || files.length === 0}
            style={{ width: '100%', color: '#FFFFFF', justifyContent: 'center', gap: '6px' }}
          >
            <Zap size={14} color="#FFFFFF" fill="#FFFFFF" />
            <span style={{ color: '#FFFFFF' }}>{processing ? 'CREATING...' : 'CREATE ANIMATED GIF'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// CASE CONVERTER MODULE (NEW 8TH TAB - SEPARATE TEXT TOOL)
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
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (color1, color2) => {
    const l1 = getLuminance(color1[0], color1[1], color1[2]);
    const l2 = getLuminance(color2[0], color2[1], color2[2]);
    const lightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (lightest + 0.05) / (darkest + 0.05);
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
      
      {/* MIDDLE: Canvas area for tools */}
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

      {/* RIGHT: Sidebar tools */}
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
              <span style={{ color: contrastWhite >= 4.5 ? '#FFFFFF' : '#FFFFFF', fontSize: '14px', fontWeight: 'bold' }}>White Text</span>
              <div style={{ marginTop: '8px', fontSize: '10px', background: 'rgba(255,255,255,0.2)', color: '#FFF', padding: '4px', borderRadius: '4px' }}>
                {contrastWhite.toFixed(2)}:1 ({contrastWhite >= 4.5 ? 'AA' : 'FAIL'})
              </div>
            </div>
            <div style={{ background: pickedColor, padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
              <span style={{ color: contrastBlack >= 4.5 ? '#000000' : '#000000', fontSize: '14px', fontWeight: 'bold' }}>Black Text</span>
              <div style={{ marginTop: '8px', fontSize: '10px', background: 'rgba(0,0,0,0.2)', color: '#000', padding: '4px', borderRadius: '4px' }}>
                {contrastBlack.toFixed(2)}:1 ({contrastBlack >= 4.5 ? 'AA' : 'FAIL'})
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SYSTEM SETTINGS STUDIO
// ----------------------------------------------------------------------------
function SettingsTab({ theme, setTheme, openFolderPicker }) {
  const [defSaveDir, setDefSaveDir] = useState(() => localStorage.getItem('rfine_def_save_dir') || '');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rfine_favorites')) || [];
    } catch {
      return [];
    }
  });

  const saveSettings = () => {
    localStorage.setItem('rfine_def_save_dir', defSaveDir);
    alert('Settings saved successfully!');
  };

  const removeFavorite = (pathToRemove) => {
    const updated = favorites.filter(f => f !== pathToRemove);
    setFavorites(updated);
    localStorage.setItem('rfine_favorites', JSON.stringify(updated));
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This will clear favorites and paths.')) {
      localStorage.clear();
      setDefSaveDir('');
      setFavorites([]);
      setTheme('dark');
      alert('All settings reset to defaults.');
    }
  };

  const handleOpenPicker = () => {
    openFolderPicker(defSaveDir, (selectedPath) => {
      setDefSaveDir(selectedPath);
    });
  };

  return (
    <div className="animate-fade-in animate-slide-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px', position: 'relative', padding: '24px 30px' }}>
      <div>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '900', color: 'var(--color-white)' }}>SYSTEM SETTINGS</h1>
        <p style={{ color: 'var(--color-slate)', fontSize: '11px', margin: 0 }}>Configure default output targets, favorite workspaces, and theme options.</p>
      </div>

      {/* Theme Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)', display: 'block' }}>Interface Theme</span>
          <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Toggle between light and dark visual aesthetics.</span>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        </button>
      </div>

      {/* Unified Default Save Folder */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>Default Save Folder</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="form-input"
            readOnly
            placeholder="No default folder configured"
            value={defSaveDir}
            style={{ padding: '8px', fontSize: '11px', flexGrow: 1, background: 'rgba(0,0,0,0.1)', cursor: 'default' }}
          />
          <button
            onClick={handleOpenPicker}
            className="btn-secondary"
            style={{ padding: '8px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
          >
            Browse...
          </button>
        </div>
      </div>

      {/* Favorite Workspaces */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', flexGrow: 1, minHeight: 0 }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-white)' }}>Favorite Workspaces</span>
        {favorites.length === 0 ? (
          <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--color-slate)', fontSize: '11px', fontStyle: 'italic' }}>
            No favorite folders saved yet. Star folders in the file explorer to add them here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
            {favorites.map((fav) => (
              <div key={fav} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1, marginRight: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fav.substring(fav.lastIndexOf('\\') + 1) || fav}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--color-slate)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={fav}>
                    {fav}
                  </span>
                </div>
                <button
                  onClick={() => removeFavorite(fav)}
                  style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save / Reset Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
        <button
          onClick={handleResetAll}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '11px', color: '#EF4444' }}
        >
          Reset All Defaults
        </button>
        <button
          onClick={saveSettings}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '11px' }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

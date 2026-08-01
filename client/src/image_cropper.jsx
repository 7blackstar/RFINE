// IMAGE CROPPER MODULE
function ImageCropper({ files, onFilesChange, toggleFileBrowser, isFileBrowserCollapsed, explorerHeight, handleDividerMouseDown, theme }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [mode, setMode] = useState('crop'); // 'crop' or 'perspective'
  
  // Crop state
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
  
  // Output options
  const [outputFormat, setOutputFormat] = useState('jpg');
  const [targetFolder, setTargetFolder] = useState('');
  
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0]);
    }
  }, [files]);

  useEffect(() => {
    if (selectedFile) {
      const img = new window.Image();
      img.src = `http://localhost:5001/api/file-stream?path=${encodeURIComponent(selectedFile.path)}`;
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
    }
  }, [selectedFile, rotation, tiltX, tiltY, padding, fillMode, fillColor, cropBox, corners, mode]);

  const drawCanvas = () => {
    if (!canvasRef.current || !imageRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    
    // Auto-fit logic
    const scale = Math.min((containerWidth - 40) / img.width, (containerHeight - 40) / img.height);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    // Rough simulation for skew (tilt)
    ctx.transform(1, Math.tan(tiltY * Math.PI/180), Math.tan(tiltX * Math.PI/180), 1, 0, 0);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Draw overlays based on mode
    if (mode === 'crop') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const cropX = (cropBox.x / 100) * canvas.width;
      const cropY = (cropBox.y / 100) * canvas.height;
      const cropW = (cropBox.width / 100) * canvas.width;
      const cropH = (cropBox.height / 100) * canvas.height;
      ctx.clearRect(cropX, cropY, cropW, cropH);
      ctx.strokeStyle = 'var(--primary-color)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);
    } else if (mode === 'perspective') {
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
    }
  };

  const handleDragPoint = (index, dx, dy) => {
    if (mode === 'perspective') {
      const newCorners = [...corners];
      newCorners[index].x += dx;
      newCorners[index].y += dy;
      setCorners(newCorners);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0, position: 'relative' }}>
      <div className="middle-canvas">
        {isFileBrowserCollapsed ? (
          <div 
            onClick={toggleFileBrowser}
            className="glass-panel hover-bright"
            style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '12px', flexShrink: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 'bold' }}>
              <FolderOpen size={14} color="var(--primary-color)" />
              <span>SHOW FILE EXPLORER</span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--color-slate)' }}>Click to expand</span>
          </div>
        ) : (
          <>
            <div style={{ height: \`\${explorerHeight}px\`, display: 'flex', flexDirection: 'column', minHeight: '150px', maxHeight: '600px', flexShrink: 0 }}>
              <FileExplorer 
                onAddFiles={(newFiles) => onFilesChange(prev => [...prev, ...newFiles])}
                allowedExtensions={['.png', '.jpg', '.jpeg', '.webp', '.avif', '.heic', '.heif']}
                theme={theme}
                defaultPath={localStorage.getItem('rfine_def_image_dir') || undefined}
                storageKey="rfine_last_dir_image"
                onCollapse={toggleFileBrowser}
              />
            </div>
            <div
              onMouseDown={handleDividerMouseDown}
              style={{
                height: '8px',
                cursor: 'row-resize',
                background: 'var(--glass-border)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 -16px',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              <div style={{ width: '30px', height: '3px', background: 'var(--color-slate)', borderRadius: '3px' }} />
            </div>
          </>
        )}

        {/* Cropper Canvas Area */}
        <div 
          ref={containerRef}
          style={{ flexGrow: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas-bg)', borderRadius: '12px', margin: '16px 0', border: '1px solid var(--glass-border)' }}
        >
          {selectedFile ? (
            <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} />
          ) : (
            <div style={{ color: 'var(--color-slate)', fontSize: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Image size={32} />
              <span>Select an image to crop</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        <h2 className="tool-header">
          <Scissors size={18} color="var(--primary-color)" />
          IMAGE CROPPER
        </h2>

        <div className="settings-panel">
          <div className="settings-group">
            <label className="settings-label">MODE</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={\`btn-secondary \${mode === 'crop' ? 'active' : ''}\`} onClick={() => setMode('crop')} style={{ flex: 1 }}>Crop</button>
              <button className={\`btn-secondary \${mode === 'perspective' ? 'active' : ''}\`} onClick={() => setMode('perspective')} style={{ flex: 1 }}>Perspective</button>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">ASPECT RATIO</label>
            <select className="form-input" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
              <option value="free">Free</option>
              <option value="1:1">1:1 Square</option>
              <option value="4:3">4:3 Standard</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="9:16">9:16 Portrait</option>
            </select>
          </div>

          <div className="settings-group">
            <label className="settings-label">ADJUSTMENTS</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px' }}>
                  <span>Straighten</span>
                  <span>{rotation}°</span>
                </div>
                <input type="range" min="-45" max="45" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px' }}>
                  <span>Horizontal Tilt (Keystone)</span>
                  <span>{tiltX}°</span>
                </div>
                <input type="range" min="-45" max="45" value={tiltX} onChange={(e) => setTiltX(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--color-slate)', marginBottom: '4px' }}>
                  <span>Vertical Tilt</span>
                  <span>{tiltY}°</span>
                </div>
                <input type="range" min="-45" max="45" value={tiltY} onChange={(e) => setTiltY(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">CANVAS EXPANSION (PADDING)</label>
            <select className="form-input" value={fillMode} onChange={(e) => setFillMode(e.target.value)} style={{ marginBottom: '8px' }}>
              <option value="solid">Solid Color</option>
              <option value="blur">Blurred Content</option>
              <option value="mirror">Mirror Edges</option>
            </select>
            {fillMode === 'solid' && (
              <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} style={{ width: '100%', height: '30px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }} />
            )}
          </div>

          <div className="settings-group">
            <label className="settings-label">OUTPUT</label>
            <select className="form-input" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={{ marginBottom: '8px' }}>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="webp">WEBP</option>
            </select>
          </div>
          
          <button className="btn-primary" style={{ width: '100%', marginTop: 'auto', padding: '12px' }} disabled={!selectedFile}>
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}

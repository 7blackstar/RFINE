const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'client/src/App.jsx');
let content = fs.readFileSync(appPath, 'utf8');

const oldNav = `<nav className="clean-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: isSidebarCollapsed ? '0 8px' : '0 12px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={\`clean-nav-item \${activeTab === 'dashboard' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Dashboard"
          >
            <LayoutDashboard size={16} />
            {!isSidebarCollapsed && "Dashboard"}
          </button>
          
          <button 
            onClick={() => setActiveTab('image')}
            className={\`clean-nav-item \${activeTab === 'image' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Image Resizer"
          >
            <Image size={16} />
            {!isSidebarCollapsed && "Image Resizer"}
          </button>
          
          <button 
            onClick={() => setActiveTab('video-compress')}
            className={\`clean-nav-item \${activeTab === 'video-compress' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Video Compressor"
          >
            <Video size={16} />
            {!isSidebarCollapsed && "Video Compressor"}
          </button>

          <button 
            onClick={() => setActiveTab('video-extract')}
            className={\`clean-nav-item \${activeTab === 'video-extract' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Frame Extractor"
          >
            <Camera size={16} />
            {!isSidebarCollapsed && "Frame Extractor"}
          </button>

          <button 
            onClick={() => setActiveTab('bulk-renamer')}
            className={\`clean-nav-item \${activeTab === 'bulk-renamer' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Bulk Renamer"
          >
            <Type size={16} />
            {!isSidebarCollapsed && "Bulk Renamer"}
          </button>

          <button 
            onClick={() => setActiveTab('watermark')}
            className={\`clean-nav-item \${activeTab === 'watermark' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Watermarker"
          >
            <Layers size={16} />
            {!isSidebarCollapsed && "Watermarker"}
          </button>


          <button 
            onClick={() => setActiveTab('audio-studio')}
            className={\`clean-nav-item \${activeTab === 'audio-studio' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Audio Converter"
          >
            <FileAudio size={16} />
            {!isSidebarCollapsed && "Audio Converter"}
          </button>

          <button 
            onClick={() => setActiveTab('gif-creator')}
            className={\`clean-nav-item \${activeTab === 'gif-creator' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="GIF Creator"
          >
            <Film size={16} />
            {!isSidebarCollapsed && "GIF Creator"}
          </button>

          <button 
            onClick={() => setActiveTab('case-converter')}
            className={\`clean-nav-item \${activeTab === 'case-converter' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Case Converter"
          >
            <CaseSensitive size={16} />
            {!isSidebarCollapsed && "Case Converter"}
          </button>
          
          <button 
            onClick={() => setActiveTab('color-studio')}
            className={\`clean-nav-item \${activeTab === 'color-studio' ? 'active' : ''}\`}
            style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }}
            title="Color Studio"
          >
            <Pipette size={16} />
            {!isSidebarCollapsed && "Color Studio"}
          </button>
        </nav>`;

const newNav = `<nav className="clean-nav-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: isSidebarCollapsed ? '0 8px' : '0 12px' }}>
          {/* CATEGORY 1: MAIN */}
          {!isSidebarCollapsed && <div className="sidebar-category-header">MAIN</div>}
          <button onClick={() => setActiveTab('dashboard')} className={\`clean-nav-item \${activeTab === 'dashboard' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Dashboard">
            <LayoutDashboard size={16} />
            {!isSidebarCollapsed && "Dashboard"}
          </button>

          {/* CATEGORY 2: IMAGE STUDIO */}
          {!isSidebarCollapsed && <div className="sidebar-category-header" style={{ marginTop: '12px' }}>IMAGE STUDIO</div>}
          <button onClick={() => setActiveTab('image')} className={\`clean-nav-item \${activeTab === 'image' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Image Resizer">
            <Image size={16} />
            {!isSidebarCollapsed && "Image Resizer"}
          </button>
          <button onClick={() => setActiveTab('watermark')} className={\`clean-nav-item \${activeTab === 'watermark' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Watermarker">
            <Layers size={16} />
            {!isSidebarCollapsed && "Watermarker"}
          </button>
          <button onClick={() => setActiveTab('color-studio')} className={\`clean-nav-item \${activeTab === 'color-studio' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Color Studio">
            <Pipette size={16} />
            {!isSidebarCollapsed && "Color Studio"}
          </button>
          <button onClick={() => setActiveTab('image-cropper')} className={\`clean-nav-item \${activeTab === 'image-cropper' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Image Cropper">
            <Scissors size={16} />
            {!isSidebarCollapsed && "Image Cropper"}
          </button>

          {/* CATEGORY 3: VIDEO & AUDIO */}
          {!isSidebarCollapsed && <div className="sidebar-category-header" style={{ marginTop: '12px' }}>VIDEO & AUDIO</div>}
          <button onClick={() => setActiveTab('video-compress')} className={\`clean-nav-item \${activeTab === 'video-compress' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Video Compressor">
            <Video size={16} />
            {!isSidebarCollapsed && "Video Compressor"}
          </button>
          <button onClick={() => setActiveTab('video-extract')} className={\`clean-nav-item \${activeTab === 'video-extract' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Frame Extractor">
            <Camera size={16} />
            {!isSidebarCollapsed && "Frame Extractor"}
          </button>
          <button onClick={() => setActiveTab('audio-studio')} className={\`clean-nav-item \${activeTab === 'audio-studio' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Audio Converter">
            <FileAudio size={16} />
            {!isSidebarCollapsed && "Audio Converter"}
          </button>
          <button onClick={() => setActiveTab('gif-creator')} className={\`clean-nav-item \${activeTab === 'gif-creator' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="GIF Creator">
            <Film size={16} />
            {!isSidebarCollapsed && "GIF Creator"}
          </button>

          {/* CATEGORY 4: UTILITIES */}
          {!isSidebarCollapsed && <div className="sidebar-category-header" style={{ marginTop: '12px' }}>UTILITIES</div>}
          <button onClick={() => setActiveTab('bulk-renamer')} className={\`clean-nav-item \${activeTab === 'bulk-renamer' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Bulk Renamer">
            <Type size={16} />
            {!isSidebarCollapsed && "Bulk Renamer"}
          </button>
          <button onClick={() => setActiveTab('case-converter')} className={\`clean-nav-item \${activeTab === 'case-converter' ? 'active' : ''}\`} style={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', padding: isSidebarCollapsed ? '10px 0' : '10px 16px' }} title="Case Converter">
            <CaseSensitive size={16} />
            {!isSidebarCollapsed && "Case Converter"}
          </button>
        </nav>`;

if (content.includes(oldNav)) {
  content = content.replace(oldNav, newNav);
} else {
  // Try finding and replacing the nav list generically.
  const navStart = '<nav className="clean-nav-list" style={{ display: \'flex\', flexDirection: \'column\', gap: \'4px\', padding: isSidebarCollapsed ? \'0 8px\' : \'0 12px\' }}>';
  const navEnd = '</nav>';
  const startIndex = content.indexOf(navStart);
  if (startIndex !== -1) {
    const endIndex = content.indexOf(navEnd, startIndex) + navEnd.length;
    content = content.substring(0, startIndex) + newNav + content.substring(endIndex);
  }
}

const cropperCard = `                <ToolCard 
                  title="Image Cropper"
                  desc="Interactive crop box & 4-point perspective warping."
                  icon={Scissors}
                  onClick={() => setActiveTab('image-cropper')}
                />`;

const dashboardGridEndTarget = `                <ToolCard 
                  title="GIF Creator"
                  desc="Generate optimized animated GIF clips from videos."
                  icon={Film}
                  onClick={() => setActiveTab('gif-creator')}
                />
              </div>`;

if (content.includes(dashboardGridEndTarget)) {
  content = content.replace(dashboardGridEndTarget, dashboardGridEndTarget.replace('</div>', cropperCard + '\n              </div>'));
}

fs.writeFileSync(appPath, content);
console.log('Sidebar categories and Image Cropper dashboard card added.');

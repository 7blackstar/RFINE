const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'client/src/App.jsx');
const cropperPath = path.join(__dirname, 'client/src/image_cropper.jsx');

let content = fs.readFileSync(appPath, 'utf8');
let cropperContent = fs.readFileSync(cropperPath, 'utf8');

if (!content.includes('function ImageCropper(')) {
  content = content.replace('export default function App() {', cropperContent + '\n\nexport default function App() {');
}

const renderCall = `          {activeTab === 'image-cropper' && (
            <ImageCropper 
              files={imageFiles}
              onFilesChange={setImageFiles}
              toggleFileBrowser={toggleFileBrowser}
              isFileBrowserCollapsed={isFileBrowserCollapsed}
              explorerHeight={explorerHeight}
              handleDividerMouseDown={handleDividerMouseDown}
              theme={theme}
            />
          )}`;

if (!content.includes("activeTab === 'image-cropper' &&")) {
  // Inject right after activeTab === 'image' ...
  const imageTarget = `{activeTab === 'image' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} className="animate-fade-in">`;
  
  if (content.includes(imageTarget)) {
    content = content.replace(imageTarget, renderCall + '\n\n          ' + imageTarget);
  }
}

fs.writeFileSync(appPath, content);
console.log('App.jsx modified with ImageCropper.');

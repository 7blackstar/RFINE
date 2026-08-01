import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import convert from 'heic-convert';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';

const ffmpegPath = ffmpegInstaller.path.replace('app.asar', 'app.asar.unpacked');
const ffprobePath = ffprobeInstaller.path.replace('app.asar', 'app.asar.unpacked');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

import { exec } from 'child_process';
import os from 'os';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5001;

// Setup upload and default output directories
const tempDir = path.join(process.cwd(), 'temp');
const defaultOutputDir = path.join(process.cwd(), 'output');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(defaultOutputDir)) fs.mkdirSync(defaultOutputDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve built client frontend statically if present
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Helper to check if ffmpeg is available
let ffmpegPathDetected = true;
console.log('FFmpeg initialized successfully with static bundled binaries.');

// Helper to get home directory or root drives on Windows
app.get('/api/explorer/roots', (req, res) => {
  try {
    const home = os.homedir();
    const drives = ['C:\\'];
    for (let charCode = 68; charCode <= 90; charCode++) {
      const drive = String.fromCharCode(charCode) + ':\\';
      if (fs.existsSync(drive)) {
        drives.push(drive);
      }
    }
    res.json({ home, drives });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan directory endpoint
app.get('/api/scan-dir', (req, res) => {
  let dirPath = req.query.path;
  if (!dirPath) {
    dirPath = os.homedir();
  }

  try {
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({ error: 'Directory does not exist' });
    }

    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const items = fs.readdirSync(dirPath);
    const resultItems = items
      .map(name => {
        try {
          const itemPath = path.join(dirPath, name);
          const itemStat = fs.statSync(itemPath);
          const isDir = itemStat.isDirectory();
          return {
            name,
            path: itemPath,
            isDir,
            size: isDir ? 0 : itemStat.size,
            ext: isDir ? '' : path.extname(name).toLowerCase(),
            createdAt: itemStat.birthtime,
            mtime: itemStat.mtime
          };
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    res.json({ 
      success: true, 
      currentPath: path.resolve(dirPath),
      parentPath: path.dirname(path.resolve(dirPath)),
      items: resultItems 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file info/stats for launched deep linked files
app.get('/api/file-info', (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  try {
    const stat = fs.statSync(filePath);
    res.json({
      name: path.basename(filePath),
      path: path.resolve(filePath),
      size: stat.size,
      ext: path.extname(filePath).toLowerCase()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Windows Explorer Folder opener (Normalizing Windows Path format)
app.post('/api/open-folder', (req, res) => {
  let { folderPath } = req.body;
  if (folderPath === 'downloads') {
    folderPath = path.join(os.homedir(), 'Downloads');
  }
  if (folderPath && fs.existsSync(folderPath)) {
    const normPath = path.normalize(folderPath);
    // Strip trailing slashes to prevent escaping the double quotes in exec command
    const cleanPath = normPath.replace(/[\\/]+$/, '');
    exec(`explorer "${cleanPath}"`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Folder path not found' });
});

// Windows File opener (Launches default Windows viewer for file)
app.post('/api/open-file', (req, res) => {
  let { filePath } = req.body;
  if (filePath && fs.existsSync(filePath)) {
    const normPath = path.normalize(filePath);
    exec(`start "" "${normPath}"`);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'File path not found' });
});

// Image Preview Stream Endpoint
app.get('/api/image-preview', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).send('Preview file not found');
  }

  try {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.heic' || ext === '.heif') {
      let buffer = fs.readFileSync(filePath);
      buffer = await convert({
        buffer,
        format: 'JPEG',
        quality: 1
      });
      res.set('Content-Type', 'image/jpeg');
      return res.send(buffer);
    }
    
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Rename files endpoint
app.post('/api/rename', (req, res) => {
  const { dirPath, files, rules, dryRun = true } = req.body;
  if (!files || !rules) {
    return res.status(400).json({ error: 'Files and rules are required' });
  }

  try {
    const results = [];
    let counter = parseInt(rules.numberingStart) || 1;
    let lastFileDir = dirPath || '';

    for (const file of files) {
      const parsedPath = path.parse(file.name);
      let newName = rules.discardOriginal ? '' : parsedPath.name;

      if (rules.find && !rules.discardOriginal) {
        const flags = rules.caseSensitive ? 'g' : 'gi';
        const regex = new RegExp(rules.find, flags);
        newName = newName.replace(regex, rules.replace || '');
      }

      if (rules.casing === 'lower') {
        newName = newName.toLowerCase();
      } else if (rules.casing === 'upper') {
        newName = newName.toUpperCase();
      } else if (rules.casing === 'title') {
        newName = newName.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      } else if (rules.casing === 'kebab') {
        newName = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      } else if (rules.casing === 'snake') {
        newName = newName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^-|-$)/g, '');
      }

      if (rules.prefix) {
        newName = rules.prefix + newName;
      }
      if (rules.suffix) {
        newName = newName + rules.suffix;
      }

      if (rules.numbering) {
        const numStr = String(counter).padStart(parseInt(rules.numberingDigits) || 2, '0');
        newName = `${newName}-${numStr}`;
        counter++;
      }

      const newFullName = newName + parsedPath.ext;
      const fileDir = dirPath || path.dirname(file.path || '');
      lastFileDir = fileDir;
      const oldPath = file.path || path.join(fileDir, file.name);
      const newPath = path.join(fileDir, newFullName);

      results.push({
        oldName: file.name,
        newName: newFullName,
        oldPath,
        newPath,
        changed: file.name !== newFullName
      });

      if (!dryRun && file.name !== newFullName && fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }

    res.json({ success: true, results, targetFolder: lastFileDir });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to apply watermark to sharp pipeline
async function applyWatermarkToPipeline(pipeline, metadata, body) {
  const { 
    watermark, 
    watermarkType = 'image', 
    watermarkSize = 15, 
    watermarkOpacity = 0.35, 
    watermarkPosition = 'bottom-right',
    watermarkX,
    watermarkY
  } = body;

  if (!watermark) return pipeline;

  const targetMeta = await pipeline.metadata();
  const targetWidth = targetMeta.width || metadata.width || 800;
  const targetHeight = targetMeta.height || metadata.height || 600;

  const wmClean = watermark.trim().replace(/^[\s'"\\]+|[\s'"\\]+$/g, '');

  if (watermarkType === 'text' || (!wmClean.startsWith('data:image/') && wmClean !== 'temp_watermark.png')) {
    // Process text watermark
    const fontSize = Math.round((targetWidth * 0.05) * (parseFloat(watermarkSize || 15) / 15));
    const opacityVal = parseFloat(watermarkOpacity || 0.35);
    
    let xPct = 82;
    let yPct = 82;

    if (watermarkX !== undefined && watermarkY !== undefined) {
      xPct = parseFloat(watermarkX);
      yPct = parseFloat(watermarkY);
    } else {
      if (watermarkPosition === 'top-left') {
        xPct = 3;
        yPct = 3;
      } else if (watermarkPosition === 'top-right') {
        xPct = 82;
        yPct = 3;
      } else if (watermarkPosition === 'center') {
        xPct = 40;
        yPct = 45;
      } else if (watermarkPosition === 'bottom-left') {
        xPct = 3;
        yPct = 82;
      } else if (watermarkPosition === 'bottom-right') {
        xPct = 82;
        yPct = 82;
      }
    }

    const escapedText = wmClean
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    const svgText = `
      <svg width="${targetWidth}" height="${targetHeight}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wm-text {
            fill: #ffffff;
            fill-opacity: ${opacityVal};
            font-size: ${fontSize}px;
            font-family: 'Segoe UI', -apple-system, sans-serif;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }
        </style>
        <text x="${xPct}%" y="${yPct}%" class="wm-text" dominant-baseline="hanging" text-anchor="start">${escapedText}</text>
      </svg>
    `;
    return pipeline.composite([{
      input: Buffer.from(svgText),
      top: 0,
      left: 0
    }]);
  } else {
    // Process image watermark
    let watermarkBuffer;
    if (wmClean === 'temp_watermark.png') {
      const tempPath = path.join(process.cwd(), 'temp', 'temp_watermark.png');
      if (fs.existsSync(tempPath)) {
        watermarkBuffer = fs.readFileSync(tempPath);
      } else {
        console.warn('Cached watermark temp_watermark.png not found');
        return pipeline;
      }
    } else if (wmClean.startsWith('data:image/')) {
      const base64Data = wmClean.replace(/^data:image\/\w+;base64,/, "");
      watermarkBuffer = Buffer.from(base64Data, 'base64');
    } else {
      return pipeline;
    }

    let wmSharp = sharp(watermarkBuffer);
    const wmMetadata = await wmSharp.metadata();
    
    const wmScale = parseFloat(watermarkSize || 15) / 100;
    const targetWmWidth = Math.round(targetWidth * wmScale);
    const targetWmHeight = Math.round(wmMetadata.height * (targetWmWidth / wmMetadata.width));
    
    let wmResized = await wmSharp
      .resize(targetWmWidth, targetWmHeight)
      .png()
      .toBuffer();
      
    const opacityVal = parseFloat(watermarkOpacity || 0.35);
    wmResized = await sharp(wmResized)
      .ensureAlpha()
      .linear([1, 1, 1, opacityVal], [0, 0, 0, 0])
      .toBuffer();
      
    let left = 0;
    let top = 0;
    
    if (watermarkX !== undefined && watermarkY !== undefined) {
      const xPct = parseFloat(watermarkX);
      const yPct = parseFloat(watermarkY);
      left = Math.max(0, Math.min(Math.round(targetWidth * (xPct / 100)), targetWidth - targetWmWidth));
      top = Math.max(0, Math.min(Math.round(targetHeight * (yPct / 100)), targetHeight - targetWmHeight));
    } else {
      const paddingX = Math.round(targetWidth * 0.03);
      const paddingY = Math.round(targetHeight * 0.03);
      
      if (watermarkPosition === 'top-left') {
        left = paddingX;
        top = paddingY;
      } else if (watermarkPosition === 'top-right') {
        left = targetWidth - targetWmWidth - paddingX;
        top = paddingY;
      } else if (watermarkPosition === 'bottom-left') {
        left = paddingX;
        top = targetHeight - targetWmHeight - paddingY;
      } else if (watermarkPosition === 'bottom-right') {
        left = targetWidth - targetWmWidth - paddingX;
        top = targetHeight - targetWmHeight - paddingY;
      } else if (watermarkPosition === 'center') {
        left = Math.round((targetWidth - targetWmWidth) / 2);
        top = Math.round((targetHeight - targetWmHeight) / 2);
      }
    }
    
    return pipeline.composite([{
      input: wmResized,
      top: Math.max(0, top),
      left: Math.max(0, left)
    }]);
  }
}

// Setup/cache watermark image route
app.post('/api/watermark/setup', (req, res) => {
  const { watermark } = req.body;
  if (!watermark) {
    return res.json({ success: true, message: 'No watermark data provided' });
  }

  try {
    const wmClean = watermark.trim().replace(/^[\s'"\\]+|[\s'"\\]+$/g, '');
    if (wmClean.startsWith('data:image/')) {
      const base64Data = wmClean.replace(/^data:image\/\w+;base64,/, "");
      const watermarkBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(path.join(tempDir, 'temp_watermark.png'), watermarkBuffer);
      return res.json({ success: true, cached: true });
    }
    res.json({ success: true, cached: false, message: 'Not an image data URL' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk image conversion endpoint
app.post('/api/image/convert-bulk', upload.array('imageFiles'), async (req, res) => {
  const { format, quality = 80, resizeMode, width, height, scalePercent, outputFolder, watermark, keepMetadata, watermarkOpacity, watermarkSize, watermarkPosition } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No images uploaded' });
  }

  let targetDir = outputFolder ? outputFolder.trim() : null;
  if (targetDir) {
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (e) {
      targetDir = null;
    }
  }

  const results = [];

  for (const file of req.files) {
    const inputPath = file.path;
    const parsed = path.parse(file.originalname);
    const targetFilename = `${parsed.name}_optimized.${format}`;
    const outputPath = targetDir ? path.join(targetDir, targetFilename) : null;

    try {
      let inputBuffer = fs.readFileSync(inputPath);

      const fileExt = parsed.ext.toLowerCase();
      if (fileExt === '.heic' || fileExt === '.heif') {
        inputBuffer = await convert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 1
        });
      }

      let pipeline = sharp(inputBuffer);
      const metadata = await pipeline.metadata();

      if (resizeMode === 'percentage' && scalePercent) {
        const factor = parseFloat(scalePercent) / 100;
        const newWidth = Math.round(metadata.width * factor);
        const newHeight = Math.round(metadata.height * factor);
        pipeline = pipeline.resize(newWidth, newHeight);
      } else if (resizeMode === 'resolution') {
        const w = width ? parseInt(width) : null;
        const h = height ? parseInt(height) : null;
        pipeline = pipeline.resize(w, h, { fit: 'inside' });
      }

      if (watermark) {
        try {
          pipeline = await applyWatermarkToPipeline(pipeline, metadata, req.body);
        } catch (e) {
          console.error("Watermark overlay error:", e);
        }
      }

      if (keepMetadata === true || keepMetadata === 'true') {
        pipeline = pipeline.withMetadata();
      }

      const q = parseInt(quality);
      if (format === 'webp') pipeline = pipeline.webp({ quality: q });
      else if (format === 'avif') pipeline = pipeline.avif({ quality: q });
      else if (format === 'jpeg' || format === 'jpg') pipeline = pipeline.jpeg({ quality: q });
      else if (format === 'png') pipeline = pipeline.png({ quality: q });

      let outBuffer;
      if (outputPath) {
        await pipeline.toFile(outputPath);
        const outStat = fs.statSync(outputPath);
        outBuffer = null;
        results.push({
          name: file.originalname,
          success: true,
          originalSize: file.size,
          optimizedSize: outStat.size,
          outputPath
        });
      } else {
        outBuffer = await pipeline.toBuffer();
        results.push({
          name: file.originalname,
          success: true,
          originalSize: file.size,
          optimizedSize: outBuffer.length,
          dataUrl: `data:image/${format};base64,${outBuffer.toString('base64')}`
        });
      }
    } catch (err) {
      results.push({
        name: file.originalname,
        success: false,
        error: err.message
      });
    } finally {
      if (fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
    }
  }

  res.json({ success: true, targetFolder: targetDir || 'Browser Memory/Client-Side API Saved', results });
});

// Bulk image conversion from direct local paths
app.post('/api/image/convert-local', async (req, res) => {
  const { files, format, quality = 80, resizeMode, width, height, scalePercent, outputFolder, watermark, keepMetadata, watermarkOpacity, watermarkSize, watermarkPosition, replaceOriginal = false, fileSuffix = '_optimized' } = req.body;
  
  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files specified' });
  }

  const results = [];

  for (const file of files) {
    const inputPath = file.path;
    if (!fs.existsSync(inputPath)) {
      results.push({ name: file.name, success: false, error: 'File not found' });
      continue;
    }

    const parsed = path.parse(file.path);
    let targetDir = outputFolder ? outputFolder.trim() : parsed.dir;
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (e) {
      targetDir = parsed.dir;
    }

    const actualFormat = format === 'jpg' ? 'jpeg' : format;
    const targetFilename = replaceOriginal ? parsed.base : `${parsed.name}${fileSuffix}.${format}`;
    const outputPath = path.join(targetDir, targetFilename);

    try {
      let inputBuffer = fs.readFileSync(inputPath);
      const fileExt = parsed.ext.toLowerCase();
      if (fileExt === '.heic' || fileExt === '.heif') {
        inputBuffer = await convert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 1
        });
      }

      let pipeline = sharp(inputBuffer);
      const metadata = await pipeline.metadata();

      if (resizeMode === 'percentage' && scalePercent) {
        const factor = parseFloat(scalePercent) / 100;
        const newWidth = Math.round(metadata.width * factor);
        const newHeight = Math.round(metadata.height * factor);
        pipeline = pipeline.resize(newWidth, newHeight);
      } else if (resizeMode === 'resolution') {
        const w = width ? parseInt(width) : null;
        const h = height ? parseInt(height) : null;
        pipeline = pipeline.resize(w, h, { fit: 'inside' });
      }

      if (watermark) {
        try {
          pipeline = await applyWatermarkToPipeline(pipeline, metadata, req.body);
        } catch (e) {
          console.error("Watermark overlay error:", e);
        }
      }

      if (keepMetadata === true || keepMetadata === 'true') {
        pipeline = pipeline.withMetadata();
      }

      const q = parseInt(quality);
      if (actualFormat === 'webp') pipeline = pipeline.webp({ quality: q });
      else if (actualFormat === 'avif') pipeline = pipeline.avif({ quality: q });
      else if (actualFormat === 'jpeg' || actualFormat === 'jpg') pipeline = pipeline.jpeg({ quality: q });
      else if (actualFormat === 'png') pipeline = pipeline.png({ quality: q });

      await pipeline.toFile(outputPath);
      const outStat = fs.statSync(outputPath);

      results.push({
        name: file.name,
        success: true,
        originalSize: file.size || outStat.size,
        optimizedSize: outStat.size,
        outputPath,
        targetFolder: targetDir
      });
    } catch (err) {
      results.push({
        name: file.name,
        success: false,
        error: err.message
      });
    }
  }

  res.json({ success: true, results });
});

// Local image cropping endpoint
app.post('/api/image/crop-local', async (req, res) => {
  const { 
    localPath, 
    cropBox, 
    mode = 'crop',
    corners,
    rotation = 0, 
    tiltX = 0, 
    tiltY = 0, 
    fillMode = 'solid', 
    fillColor = '#ffffff', 
    outputFormat = 'jpg', 
    outputFolder 
  } = req.body;

  if (!localPath || !fs.existsSync(localPath)) {
    return res.status(404).json({ error: 'Source file not found' });
  }

  try {
    const parsed = path.parse(localPath);
    let targetDir = outputFolder ? outputFolder.trim() : parsed.dir;
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (e) {
      targetDir = parsed.dir;
    }

    const actualFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
    const targetFilename = `${parsed.name}_cropped.${outputFormat}`;
    const outputPath = path.join(targetDir, targetFilename);

    let pipeline = sharp(localPath);
    const metadata = await pipeline.metadata();

    // Rotate first if needed
    if (rotation !== 0) {
      pipeline = pipeline.rotate(rotation, { background: fillColor });
    }

    // Apply crop extraction if in crop mode
    if (mode === 'crop' && cropBox) {
      const extractWidth = Math.round((cropBox.width / 100) * metadata.width);
      const extractHeight = Math.round((cropBox.height / 100) * metadata.height);
      const left = Math.round((cropBox.x / 100) * metadata.width);
      const top = Math.round((cropBox.y / 100) * metadata.height);

      const safeLeft = Math.max(0, Math.min(metadata.width - 1, left));
      const safeTop = Math.max(0, Math.min(metadata.height - 1, top));
      const safeWidth = Math.max(1, Math.min(metadata.width - safeLeft, extractWidth));
      const safeHeight = Math.max(1, Math.min(metadata.height - safeTop, extractHeight));

      pipeline = pipeline.extract({ left: safeLeft, top: safeTop, width: safeWidth, height: safeHeight });
    }

    // Format output
    if (actualFormat === 'webp') pipeline = pipeline.webp({ quality: 90 });
    else if (actualFormat === 'png') pipeline = pipeline.png();
    else pipeline = pipeline.jpeg({ quality: 90 });

    await pipeline.toFile(outputPath);
    const outStat = fs.statSync(outputPath);

    res.json({ 
      success: true, 
      outputPath, 
      targetFolder: targetDir, 
      optimizedSize: outStat.size,
      filename: targetFilename
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Video compression endpoint
app.post('/api/video/compress-upload', upload.single('videoFile'), (req, res) => {
  const { format = 'mp4', crf = 23, scale = '1280:720', outputFolder, preset = 'medium' } = req.body;

  if (!ffmpegPathDetected) {
    return res.status(500).json({ error: 'FFmpeg is not installed or available in path.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No video file uploaded' });
  }

  const inputPath = req.file.path;
  const parsed = path.parse(req.file.originalname);

  let targetDir = outputFolder ? outputFolder.trim() : defaultOutputDir;
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (e) {
    targetDir = defaultOutputDir;
  }

  const outputName = `${parsed.name}_compressed.${format}`;
  const outputPath = path.join(targetDir, outputName);

  try {
    let command = ffmpeg(inputPath)
      .output(outputPath)
      .outputOptions('-crf', String(crf))
      .outputOptions('-preset', preset)
      .on('start', (cmdLine) => {
        console.log('FFmpeg processing: ' + cmdLine);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      })
      .on('end', () => {
        console.log('FFmpeg finished successfully!');
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      });

    if (scale && scale !== 'original') {
      command = command.size(scale);
    }

    if (format === 'webm') {
      command = command.videoCodec('libvpx-vp9').audioCodec('libvorbis');
    } else {
      command = command.videoCodec('libx264').audioCodec('aac');
    }

    command.run();

    res.json({ 
      success: true, 
      message: 'Video compression has started.', 
      outputPath,
      targetFolder: targetDir
    });
  } catch (error) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: error.message });
  }
});

// Video compression from local Windows path directly
app.post('/api/video/compress-local', async (req, res) => {
  const { localPath, format = 'mp4', crf = 23, scale = '1280:720', outputFolder, muteAudio, preset = 'medium' } = req.body;

  if (!ffmpegPathDetected) {
    return res.status(500).json({ error: 'FFmpeg is not installed or available in path.' });
  }
  if (!localPath || !fs.existsSync(localPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const parsed = path.parse(localPath);
  let targetDir = outputFolder ? outputFolder.trim() : parsed.dir;
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (e) {
    targetDir = parsed.dir;
  }

  const outputName = `${parsed.name}_compressed.${format}`;
  const outputPath = path.join(targetDir, outputName);

    await new Promise((resolve, reject) => {
      let command = ffmpeg(localPath)
        .output(outputPath)
        .outputOptions('-crf', String(crf))
        .outputOptions('-preset', preset)
        .on('error', (err) => {
          console.error(err);
          reject(err);
        })
        .on('end', () => {
          console.log('Finished compressing local file!');
          resolve();
        });

      if (scale && scale !== 'original') {
        command = command.size(scale);
      }

      if (muteAudio) {
        command = command.noAudio(); // Removes audio track entirely
      }

      if (format === 'webm') {
        command = command.videoCodec('libvpx-vp9');
        if (!muteAudio) command = command.audioCodec('libvorbis');
      } else {
        command = command.videoCodec('libx264');
        if (!muteAudio) command = command.audioCodec('aac');
      }

      command.run();
    });

    const optimizedSize = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
    res.json({ success: true, outputPath, targetFolder: targetDir, optimizedSize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/settings', (req, res) => {
  const settingsPath = path.join(process.cwd(), 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      const data = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
      return res.json({ success: true, settings: data });
    }
    res.json({ success: true, settings: {} });
  } catch (e) {
    res.json({ success: true, settings: {} });
  }
});

app.post('/api/settings', (req, res) => {
  const settingsPath = path.join(process.cwd(), 'settings.json');
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post('/api/image/save-still', (req, res) => {
  const { dataUrl, filename, outputFolder } = req.body;
  if (!dataUrl || !filename) {
    return res.status(400).json({ error: 'Missing dataUrl or filename' });
  }
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');
  
  let targetDir = outputFolder ? outputFolder.trim() : path.join(process.cwd(), 'downloads');
  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } catch (e) {
    targetDir = process.cwd();
  }
  
  const outputPath = path.join(targetDir, filename);
  fs.writeFile(outputPath, buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, targetFolder: targetDir });
  });
});

// ----------------------------------------------------------------------------
// PDF SUITE ENDPOINTS
// ----------------------------------------------------------------------------

// Extract PDF pages count and basic details
app.get('/api/pdf/meta', async (req, res) => {
  const filePath = req.query.path;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      updateMetadata: false, 
      ignoreEncryption: true 
    });
    res.json({
      success: true,
      pageCount: pdfDoc.getPageCount(),
      title: pdfDoc.getTitle() || path.basename(filePath)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Merger Endpoint
app.post('/api/pdf/merge', async (req, res) => {
  const { files, outputPath } = req.body;
  if (!files || files.length === 0 || !outputPath) {
    return res.status(400).json({ error: 'Files and outputPath are required' });
  }
  try {
    const mergedPdf = await PDFDocument.create();
    for (const filePath of files) {
      if (fs.existsSync(filePath)) {
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
    }
    const mergedPdfBytes = await mergedPdf.save();
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, mergedPdfBytes);
    res.json({ success: true, path: outputPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Splitter Endpoint
app.post('/api/pdf/split', async (req, res) => {
  const { filePath, ranges, outputDir } = req.body;
  if (!filePath || !ranges || !outputDir) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Source PDF not found' });
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const srcBytes = fs.readFileSync(filePath);
    const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    const originalName = path.parse(filePath).name;
    const splitPaths = [];

    for (let idx = 0; idx < ranges.length; idx++) {
      const range = ranges[idx];
      const startPage = parseInt(range.start);
      const endPage = parseInt(range.end);
      
      const newDoc = await PDFDocument.create();
      const pageIndices = [];
      for (let i = startPage - 1; i <= endPage - 1; i++) {
        if (i >= 0 && i < srcDoc.getPageCount()) {
          pageIndices.push(i);
        }
      }
      
      if (pageIndices.length > 0) {
        const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
        copiedPages.forEach(p => newDoc.addPage(p));
        const newBytes = await newDoc.save();
        const splitFilename = `${originalName}_part_${idx + 1}.pdf`;
        const targetPath = path.join(outputDir, splitFilename);
        fs.writeFileSync(targetPath, newBytes);
        splitPaths.push(targetPath);
      }
    }

    res.json({ success: true, files: splitPaths, targetFolder: outputDir });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Page Organizer Endpoint
app.post('/api/pdf/organize', async (req, res) => {
  const { filePath, outputPath, pageOrder, rotations, deletions } = req.body;
  if (!filePath || !outputPath || !pageOrder) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Source PDF not found' });
    }
    
    const srcBytes = fs.readFileSync(filePath);
    const srcDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    const organizedDoc = await PDFDocument.create();
    
    // Copy select pages in defined order, skipping deletions
    const cleanOrder = pageOrder.filter(origIdx => !deletions || !deletions.includes(origIdx));
    
    for (let i = 0; i < cleanOrder.length; i++) {
      const origIdx = cleanOrder[i];
      const copied = await organizedDoc.copyPages(srcDoc, [origIdx]);
      const targetPage = organizedDoc.addPage(copied[0]);
      
      // Apply rotation if mapping present
      if (rotations && rotations[origIdx] !== undefined) {
        const deg = (rotations[origIdx] % 360 + 360) % 360;
        targetPage.setRotation({ angle: deg });
      }
    }
    
    const finalBytes = await organizedDoc.save();
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, finalBytes);
    res.json({ success: true, path: outputPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save replies and comments to a summary page at the end of the PDF
app.post('/api/pdf/save-comments', async (req, res) => {
  const { filePath, outputPath, comments } = req.body;
  if (!filePath || !outputPath || !comments) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Source PDF not found' });
    }
    const srcBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
    
    // Add a new page summarizing the comment logs
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const logPage = pdfDoc.addPage([600, 800]);
    
    logPage.drawText('RFINE PDF REVIEW LOG', { x: 50, y: 740, size: 18, font: fontBold, color: rgb(0, 0.5, 1) });
    logPage.drawText(`Document: ${path.basename(filePath)}`, { x: 50, y: 715, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });
    logPage.drawText(`Date Exported: ${new Date().toLocaleString()}`, { x: 50, y: 700, size: 10, font: font, color: rgb(0.5, 0.5, 0.5) });
    
    let yPos = 650;
    comments.forEach((c, idx) => {
      if (yPos < 100) return; // avoid drawing past page bounds
      
      const statusText = c.resolved ? '[RESOLVED]' : '[OPEN]';
      const statusColor = c.resolved ? rgb(0.1, 0.7, 0.3) : rgb(0.9, 0.2, 0.2);
      
      logPage.drawText(`${idx + 1}. Comment: "${c.text}"`, { x: 50, y: yPos, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
      logPage.drawText(`Status: ${statusText} | Author: ${c.author || 'User'}`, { x: 50, y: yPos - 15, size: 9, font: font, color: statusColor });
      
      yPos -= 35;
      
      if (c.replies && c.replies.length > 0) {
        c.replies.forEach((r) => {
          logPage.drawText(`  ↳ Reply: "${r.text}"`, { x: 70, y: yPos, size: 10, font: font, color: rgb(0.3, 0.3, 0.3) });
          logPage.drawText(`    - ${r.author || 'Reviewer'} (${new Date(r.date || Date.now()).toLocaleDateString()})`, { x: 70, y: yPos - 12, size: 8, font: font, color: rgb(0.6, 0.6, 0.6) });
          yPos -= 28;
        });
      }
      yPos -= 10;
    });
    
    const finalBytes = await pdfDoc.save();
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, finalBytes);
    res.json({ success: true, path: outputPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// AUDIO extractor & converter endpoint
// ----------------------------------------------------------------------------
app.post('/api/audio/extract', (req, res) => {
  const { filePath, outputPath, format, bitrate } = req.body;
  if (!filePath || !outputPath || !format) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Source media file not found' });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // To support Unicode filenames on Windows, copy to temp directory first
  const tempInputPath = path.join(tempDir, `temp_audio_in_${Date.now()}${path.extname(filePath)}`);
  const tempOutputPath = path.join(tempDir, `temp_audio_out_${Date.now()}.${format}`);

  try {
    fs.copyFileSync(filePath, tempInputPath);

    // Build FFmpeg command to extract/convert audio stream
    const cmd = ffmpeg(tempInputPath)
      .noVideo()
      .audioCodec(format === 'mp3' ? 'libmp3lame' : format === 'aac' ? 'aac' : 'pcm_s16le')
      .audioBitrate(bitrate || '192k')
      .format(format)
      .on('end', () => {
        try {
          fs.copyFileSync(tempOutputPath, outputPath);
          // Cleanup temp files
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          res.json({ success: true, path: outputPath });
        } catch (copyErr) {
          res.status(500).json({ error: 'Failed to write final output: ' + copyErr.message });
        }
      })
      .on('error', (err) => {
        // Cleanup temp files
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        res.status(500).json({ error: err.message });
      });

    cmd.save(tempOutputPath);
  } catch (err) {
    res.status(500).json({ error: 'Audio setup failed: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// Video-to-GIF palette-based render endpoint
// ----------------------------------------------------------------------------
app.post('/api/gif/create', (req, res) => {
  const { filePath, outputPath, startTime, duration, width, fps } = req.body;
  if (!filePath || !outputPath || width === undefined || fps === undefined) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Source video file not found' });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const ss = parseFloat(startTime) || 0;
  const t = parseFloat(duration) || 5;
  const w = parseInt(width) || 480;
  const f = parseInt(fps) || 15;

  const tempInputPath = path.join(tempDir, `temp_gif_in_${Date.now()}${path.extname(filePath)}`);
  const tempOutputPath = path.join(tempDir, `temp_gif_out_${Date.now()}.gif`);

  try {
    fs.copyFileSync(filePath, tempInputPath);

    // Use the advanced FFmpeg palettegen/paletteuse filters for high-quality GIFs
    const filterString = `[0:v] fps=${f},scale=${w}:-1:flags=lanczos,split [a][b];[a] palettegen [p];[b][p] paletteuse`;

    // Input seeking (-ss before -i) makes seeking near-instantaneous!
    const cmd = ffmpeg()
      .input(tempInputPath)
      .inputOptions([`-ss ${ss}`])
      .setDuration(t)
      .complexFilter(filterString)
      .on('end', () => {
        try {
          fs.copyFileSync(tempOutputPath, outputPath);
          if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
          if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
          res.json({ success: true, path: outputPath });
        } catch (copyErr) {
          res.status(500).json({ error: 'Failed to write final GIF: ' + copyErr.message });
        }
      })
      .on('error', (err) => {
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        res.status(500).json({ error: err.message });
      });

    cmd.save(tempOutputPath);
  } catch (err) {
    res.status(500).json({ error: 'GIF setup failed: ' + err.message });
  }
});

const server = app.listen(port, () => {
  console.log(`RFINE local server listening at http://localhost:${port}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} in use. Server is already running or using secondary listener.`);
  } else {
    console.error('Server error:', err);
  }
});

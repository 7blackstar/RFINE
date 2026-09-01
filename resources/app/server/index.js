import { traceImageToSvg } from './vector_tracer.js';
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

// Collision Policy Helper: 'auto_rename' | 'overwrite' | 'skip'
function resolveCollisionPath(targetFilePath, policy = 'auto_rename') {
  if (policy === 'overwrite' || !fs.existsSync(targetFilePath)) {
    return { path: targetFilePath, skip: false };
  }
  if (policy === 'skip') {
    return { path: targetFilePath, skip: true };
  }
  // auto_rename: e.g. "image (1).png"
  const dir = path.dirname(targetFilePath);
  const ext = path.extname(targetFilePath);
  const name = path.basename(targetFilePath, ext);
  let counter = 1;
  let newPath = path.join(dir, `${name} (${counter})${ext}`);
  while (fs.existsSync(newPath)) {
    counter++;
    newPath = path.join(dir, `${name} (${counter})${ext}`);
  }
  return { path: newPath, skip: false };
}

// Dynamic Tag Parser for File Renamer:
function parseDynamicTags(text, { index = 1, total = 1, originalName = '', parentFolder = '', ext = '' } = {}) {
  if (!text) return '';
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const mins = now.getMinutes().toString().padStart(2, '0');
  const secs = now.getSeconds().toString().padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${hours}${mins}${secs}`;

  return text
    .replace(/\{date\}/gi, dateStr)
    .replace(/\{year\}/gi, year)
    .replace(/\{month\}/gi, month)
    .replace(/\{day\}/gi, day)
    .replace(/\{time\}/gi, timeStr)
    .replace(/\{counter\}/gi, index.toString())
    .replace(/\{count\}/gi, index.toString().padStart(2, '0'))
    .replace(/\{total\}/gi, total.toString())
    .replace(/\{parent\}/gi, parentFolder)
    .replace(/\{ext\}/gi, ext.replace(/^\./, ''))
    .replace(/\{name\}/gi, originalName);
}

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
app.post('/api/rename', async (req, res) => {
  try {
    const { dirPath, files, rules, dryRun, collisionPolicy = 'auto_rename', customDestPath } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for renaming.' });
    }

    const {
      find = '',
      replace = '',
      prefix = '',
      suffix = '',
      casing = 'none',
      caseSensitive = false,
      numbering = false,
      numberingStart = 1,
      numberingDigits = 2,
      discardOriginal = false,
      useRegex = false
    } = rules || {};

    const results = [];
    let numCounter = numberingStart;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const origPath = f.path || (dirPath ? path.join(dirPath, f.name) : f.name);
      const originalFullName = f.name || path.basename(origPath);
      const fileExt = path.extname(originalFullName);
      let baseName = path.basename(originalFullName, fileExt);
      const parentDir = path.dirname(origPath);
      const parentFolderName = path.basename(parentDir);

      if (discardOriginal) {
        baseName = '';
      }

      // 1. Dynamic Tags & Find/Replace
      let newBase = baseName;
      if (find) {
        try {
          if (useRegex) {
            const regex = new RegExp(find, caseSensitive ? 'g' : 'gi');
            newBase = newBase.replace(regex, replace);
          } else {
            const flags = caseSensitive ? 'g' : 'gi';
            const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            newBase = newBase.replace(new RegExp(escapedFind, flags), replace);
          }
        } catch (rxErr) {
          console.warn('Regex replace error:', rxErr);
        }
      }

      // 2. Prefix & Suffix with Dynamic Tag Support
      const parsedPrefix = parseDynamicTags(prefix, { index: i + 1, total: files.length, originalName: baseName, parentFolder: parentFolderName, ext: fileExt });
      const parsedSuffix = parseDynamicTags(suffix, { index: i + 1, total: files.length, originalName: baseName, parentFolder: parentFolderName, ext: fileExt });

      newBase = `${parsedPrefix}${newBase}${parsedSuffix}`;

      // 3. Numbering
      if (numbering) {
        const pad = numCounter.toString().padStart(numberingDigits, '0');
        newBase = newBase ? `${newBase}-${pad}` : pad;
        numCounter++;
      }

      // 4. Casing
      if (casing === 'lower') {
        newBase = newBase.toLowerCase();
      } else if (casing === 'upper') {
        newBase = newBase.toUpperCase();
      } else if (casing === 'title') {
        newBase = newBase.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
      } else if (casing === 'kebab') {
        newBase = newBase.replace(/\s+/g, '-').toLowerCase();
      } else if (casing === 'snake') {
        newBase = newBase.replace(/\s+/g, '_').toLowerCase();
      }

      const finalFileName = `${newBase}${fileExt}`;
      const targetDir = customDestPath || parentDir;
      let targetPath = path.join(targetDir, finalFileName);

      // Collision policy check
      let isSkipped = false;
      if (!dryRun) {
        const resolved = resolveCollisionPath(targetPath, collisionPolicy);
        targetPath = resolved.path;
        isSkipped = resolved.skip;
      }

      const changed = finalFileName !== originalFullName || (customDestPath && customDestPath !== parentDir);

      if (!dryRun && !isSkipped && origPath !== targetPath) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.renameSync(origPath, targetPath);
      }

      results.push({
        original: origPath,
        oldName: originalFullName,
        newName: path.basename(targetPath),
        newPath: targetPath,
        changed,
        skipped: isSkipped
      });
    }

    const targetFolder = customDestPath || (files[0] && files[0].path ? path.dirname(files[0].path) : dirPath);
    return res.json({ success: true, results, targetFolder });
  } catch (err) {
    console.error('Rename error:', err);
    return res.status(500).json({ error: err.message });
  }
});

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
      const isLossless = req.body.lossless === true || req.body.lossless === 'true' || q === 100;
      const compressionEffort = req.body.effort ? parseInt(req.body.effort) : 6;

      if (actualFormat === 'webp') {
        pipeline = pipeline.webp({
          quality: isLossless ? 100 : q,
          lossless: isLossless,
          effort: compressionEffort,
          smartSubsample: true,
          reductionEffort: 6
        });
      } else if (actualFormat === 'avif') {
        pipeline = pipeline.avif({
          quality: isLossless ? 100 : q,
          lossless: isLossless,
          effort: compressionEffort,
          chromaSubsampling: isLossless ? '4:4:4' : '4:2:0'
        });
      } else if (actualFormat === 'jpeg' || actualFormat === 'jpg') {
        pipeline = pipeline.jpeg({
          quality: q,
          mozjpeg: true,
          progressive: true
        });
      } else if (actualFormat === 'png') {
        pipeline = pipeline.png({
          compressionLevel: 9,
          effort: compressionEffort,
          progressive: true
        });
      }

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
app.post('/api/audio/extract', async (req, res) => {
  try {
    const { files, format = 'mp3', bitrate = '192k', normalize = false, customDestPath, saveDestMode = 'original', collisionPolicy = 'auto_rename' } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No audio/video files provided.' });
    }

    const results = [];
    let lastTargetFolder = '';

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const filePath = f.path;
      if (!filePath || !fs.existsSync(filePath)) continue;

      let targetFolder = path.dirname(filePath);
      if (saveDestMode === 'custom' && customDestPath) {
        targetFolder = customDestPath;
      } else if (saveDestMode === 'default' && customDestPath) {
        targetFolder = customDestPath;
      }
      lastTargetFolder = targetFolder;

      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }

      const baseName = path.basename(filePath, path.extname(filePath));
      const outputFilename = `${baseName}.${format}`;
      let outputPath = path.join(targetFolder, outputFilename);

      const resolved = resolveCollisionPath(outputPath, collisionPolicy);
      if (resolved.skip) {
        results.push({ original: filePath, output: outputPath, skipped: true });
        continue;
      }
      outputPath = resolved.path;

      await new Promise((resolve, reject) => {
        let cmd = ffmpeg(filePath)
          .toFormat(format)
          .audioBitrate(bitrate || '192k');

        if (normalize) {
          cmd = cmd.audioFilters('loudnorm=I=-16:TP=-1.5:LRA=11');
        }

        cmd
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .save(outputPath);
      });

      results.push({ original: filePath, output: outputPath });
    }

    return res.json({ success: true, results, targetFolder: lastTargetFolder });
  } catch (err) {
    console.error('Audio convert error:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/gif/create', (req, res) => {
  const { filePath, outputPath, fullLength = false, startTime, duration, width, fps, qualityProfile = 'balanced' } = req.body;
  if (!filePath || !outputPath) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Source video file not found' });
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const isFull = fullLength === true || fullLength === 'true';
  const ss = parseFloat(startTime) || 0;
  const t = parseFloat(duration) || 5;
  const w = width === 'original' || !width || width === '-1' ? -1 : (parseInt(width) || 480);
  const f = parseInt(fps) || 15;

  const tempInputPath = path.join(tempDir, `temp_gif_in_${Date.now()}${path.extname(filePath)}`);
  const tempOutputPath = path.join(tempDir, `temp_gif_out_${Date.now()}.gif`);

  try {
    fs.copyFileSync(filePath, tempInputPath);

    // Dynamic scale filter
    const scaleFilter = w === -1 ? 'scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos' : `scale=${w}:-1:flags=lanczos`;

    // Quality profiles for palettegen and paletteuse:
    // 'high' = 256 colors, diff stats, sierra2_4a dithering (pristine gradients, zero banding)
    // 'balanced' = 192 colors, diff stats, rectangle diff mode (crisp + 45% smaller file size)
    // 'compact' = 128 colors, bayer dithering (ultra small file size for web / chat)
    let maxColors = 256;
    let ditherAlgorithm = 'sierra2_4a';
    let diffMode = 'rectangle';

    if (qualityProfile === 'compact') {
      maxColors = 128;
      ditherAlgorithm = 'bayer:bayer_scale=3';
    } else if (qualityProfile === 'balanced') {
      maxColors = 192;
      ditherAlgorithm = 'sierra2_4a';
    } else if (qualityProfile === 'high') {
      maxColors = 256;
      ditherAlgorithm = 'sierra2_4a';
    }

    const filterString = `[0:v] fps=${f},${scaleFilter},split [a][b];[a] palettegen=stats_mode=diff:max_colors=${maxColors}:reserve_transparent=0 [p];[b][p] paletteuse=dither=${ditherAlgorithm}:diff_mode=${diffMode}`;

    const cmd = ffmpeg().input(tempInputPath);

    if (!isFull) {
      cmd.inputOptions([`-ss ${ss}`]).setDuration(t);
    }

    cmd
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
      })
      .save(tempOutputPath);

  } catch (err) {
    if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
    if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/update/download-and-install', async (req, res) => {
  const { downloadUrl, version } = req.body;
  const targetUrl = downloadUrl || `https://github.com/7blackstar/RFINE/releases/download/v${version || '1.3.5'}/RFINE_Setup.exe`;

  try {
    const tempDir = os.tmpdir();
    const installerPath = path.join(tempDir, `RFINE_Setup_${Date.now()}.exe`);

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(500).json({ error: `Failed to download update binary (${response.statusText})` });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(installerPath, buffer);

    res.json({ success: true, message: 'Installer downloaded. Launching update...' });

    // Launch silent installer and terminate current instance cleanly:
    setTimeout(() => {
      try {
        const { spawn } = require('child_process');
        spawn(installerPath, ['/S'], { detached: true, stdio: 'ignore' }).unref();
        setTimeout(() => process.exit(0), 1000);
      } catch (e) {
        console.error('Launch installer error:', e);
      }
    }, 1500);

  } catch (err) {
    console.error('Download and install error:', err);
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// BITMAP IMAGE-TO-VECTOR (SVG) TRACER API
// ==========================================
app.post('/api/vector/trace', async (req, res) => {
  const { filePath, mode = 'single', steps = 4, threshold = 128, turdsize = 2, color = '#000000', background = 'transparent', invert = false, maxWidth = 1600 } = req.body;
  if (!filePath || !fs.existsSync(filePath)) {
    return res.status(400).json({ error: 'Valid filePath required' });
  }

  try {
    const svgString = await traceImageToSvg(filePath, {
      mode,
      steps: parseInt(steps) || 4,
      threshold: parseInt(threshold),
      turdsize: parseInt(turdsize),
      color,
      background,
      invert: invert === true || invert === 'true',
      maxWidth: parseInt(maxWidth) || 1600
    });

    res.json({
      success: true,
      svg: svgString
    });
  } catch (err) {
    console.error('Vector trace error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vector/convert-local', async (req, res) => {
  const { files, mode = 'single', steps = 4, threshold = 128, turdsize = 2, color = '#000000', background = 'transparent', invert = false, outputFolder, collisionPolicy = 'auto_rename', fileSuffix = '_vector' } = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files specified' });
  }

  const results = [];

  for (const file of files) {
    const inputPath = typeof file === 'string' ? file : file.path;
    if (!inputPath || !fs.existsSync(inputPath)) {
      results.push({ name: file.name || path.basename(inputPath || ''), success: false, error: 'File not found' });
      continue;
    }

    const parsed = path.parse(inputPath);
    let targetDir = outputFolder && outputFolder.trim() ? outputFolder.trim() : parsed.dir;
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } catch (e) {
      targetDir = parsed.dir;
    }

    const baseName = `${parsed.name}${fileSuffix}.svg`;
    const initialTargetPath = path.join(targetDir, baseName);
    const resolved = resolveCollisionPath(initialTargetPath, collisionPolicy);

    if (resolved.skip) {
      results.push({ name: file.name || parsed.base, success: true, skipped: true, outputPath: resolved.path, targetFolder: targetDir });
      continue;
    }

    const finalTargetPath = resolved.path;

    try {
      const svgString = await traceImageToSvg(inputPath, {
        mode,
        steps: parseInt(steps) || 4,
        threshold: parseInt(threshold),
        turdsize: parseInt(turdsize),
        color,
        background,
        invert: invert === true || invert === 'true'
      });

      fs.writeFileSync(finalTargetPath, svgString, 'utf8');
      const outStat = fs.statSync(finalTargetPath);

      results.push({
        name: file.name || parsed.base,
        success: true,
        originalSize: file.size || outStat.size,
        optimizedSize: outStat.size,
        outputPath: finalTargetPath,
        targetFolder: targetDir
      });
    } catch (err) {
      console.error('Vector tracing error on file:', inputPath, err);
      results.push({ name: file.name || parsed.base, success: false, error: err.message });
    }
  }

  res.json({ results });
});

function startListening() {
  const srv = app.listen(port, () => {
    console.log(`RFINE local server listening at http://localhost:${port}`);
  });

  srv.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use. Clearing port 5001...`);
      try {
        const { execSync } = require('child_process');
        if (process.platform === 'win32') {
          execSync(`cmd /c "for /f \\\"tokens=5\\\" %a in ('netstat -aon ^| findstr :5001') do taskkill /f /pid %a"`, { stdio: 'ignore' });
        }
      } catch (e) {}
      setTimeout(() => startListening(), 500);
    } else {
      console.error('Server error:', err);
    }
  });
}

startListening();

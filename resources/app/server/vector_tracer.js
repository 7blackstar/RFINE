import potrace from 'potrace';
import sharp from 'sharp';

/**
 * Advanced Potrace Vector Tracer for RFINE
 * Supports:
 * - Single-Color Silhouettes with Custom Color Picker / Hex / Preset
 * - Original Multi-Color Posterized Vector Tracing (Layered SVGs)
 * - Grayscale & Invert modes
 */

export async function traceImageToSvg(inputPathOrBuffer, options = {}) {
  const threshold = options.threshold !== undefined ? parseInt(options.threshold) : 128;
  const turdSize = options.turdsize !== undefined ? parseInt(options.turdsize) : 2;
  const optCurve = options.optCurve !== undefined ? options.optCurve : true;
  const mode = options.mode || 'single'; // 'single' | 'original_color'
  const color = options.color || '#000000';
  const background = options.background || 'transparent';
  const invert = options.invert === true || options.invert === 'true';
  const steps = options.steps ? parseInt(options.steps) : 4; // for multi-color posterize

  if (mode === 'original_color') {
    // Multi-color posterized layered SVG tracing
    return new Promise(async (resolve, reject) => {
      try {
        const params = {
          steps: steps,
          turdSize: turdSize,
          optCurve: optCurve,
          background: background
        };
        potrace.posterize(inputPathOrBuffer, params, (err, svg) => {
          if (err) return reject(err);
          resolve(svg);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  // Single-color trace with Sharp preprocessing:
  let pipeline = sharp(inputPathOrBuffer).rotate().grayscale();
  if (options.maxWidth) {
    pipeline = pipeline.resize(options.maxWidth, null, { fit: 'inside' });
  }

  const pngBuffer = await pipeline.png().toBuffer();

  const params = {
    threshold: threshold,
    turdSize: turdSize,
    optCurve: optCurve,
    color: color,
    background: background,
    blackOnWhite: !invert
  };

  return new Promise((resolve, reject) => {
    potrace.trace(pngBuffer, params, (err, svg) => {
      if (err) return reject(err);
      resolve(svg);
    });
  });
}

export default {
  traceImageToSvg
};

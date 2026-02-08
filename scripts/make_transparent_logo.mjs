import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const args = process.argv.slice(2);

function getArgValue(flag, fallback) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return fallback;
  }
  return args[index + 1];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function idxFor(x, y, width) {
  return (y * width + x) * 4;
}

function colorDistance(r, g, b, target) {
  const dr = r - target.r;
  const dg = g - target.g;
  const db = b - target.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function estimateBackgroundColor(png) {
  const { width, height, data } = png;
  const inset = 1;
  const stride = Math.max(1, Math.floor(Math.min(width, height) / 90));
  const rs = [];
  const gs = [];
  const bs = [];

  const sample = (x, y) => {
    const index = idxFor(x, y, width);
    rs.push(data[index]);
    gs.push(data[index + 1]);
    bs.push(data[index + 2]);
  };

  for (let x = inset; x < width - inset; x += stride) {
    sample(x, inset);
    sample(x, height - 1 - inset);
  }
  for (let y = inset; y < height - inset; y += stride) {
    sample(inset, y);
    sample(width - 1 - inset, y);
  }

  sample(0, 0);
  sample(width - 1, 0);
  sample(0, height - 1);
  sample(width - 1, height - 1);

  return {
    r: median(rs),
    g: median(gs),
    b: median(bs),
  };
}

function removeBackgroundWithFeather(png, background, threshold, feather) {
  const { width, height, data } = png;
  const out = new PNG({ width, height, colorType: 6 });
  const upper = threshold + feather;
  let transparentPixels = 0;
  let featherPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = idxFor(x, y, width);
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const d = colorDistance(r, g, b, background);

      let alpha;
      if (d <= threshold) {
        alpha = 0;
        transparentPixels += 1;
      } else if (d >= upper) {
        alpha = 255;
      } else {
        alpha = Math.round(((d - threshold) / feather) * 255);
        featherPixels += 1;
      }

      let outR = r;
      let outG = g;
      let outB = b;

      if (alpha === 0) {
        outR = 0;
        outG = 0;
        outB = 0;
      } else if (alpha < 255) {
        // Decontaminate edge pixels to avoid a pale halo on dark backgrounds.
        const a = alpha / 255;
        outR = clamp(Math.round((r - (1 - a) * background.r) / a), 0, 255);
        outG = clamp(Math.round((g - (1 - a) * background.g) / a), 0, 255);
        outB = clamp(Math.round((b - (1 - a) * background.b) / a), 0, 255);
      }

      out.data[index] = outR;
      out.data[index + 1] = outG;
      out.data[index + 2] = outB;
      out.data[index + 3] = alpha;
    }
  }

  return { png: out, transparentPixels, featherPixels };
}

const inputFile = getArgValue("--in", "public/team/logo2_wide.png");
const outputFile = getArgValue("--out", "public/team/logo2_wide.transparent.png");
const threshold = Number(getArgValue("--threshold", "24"));
const feather = Number(getArgValue("--feather", "14"));

if (!Number.isFinite(threshold) || threshold <= 0) {
  throw new Error("Invalid threshold value. Use a positive number.");
}
if (!Number.isFinite(feather) || feather <= 0) {
  throw new Error("Invalid feather value. Use a positive number.");
}

const inputPath = path.resolve(process.cwd(), inputFile);
const outputPath = path.resolve(process.cwd(), outputFile);

if (!fs.existsSync(inputPath)) {
  throw new Error(`Input file not found: ${inputPath}`);
}

const inputBuffer = fs.readFileSync(inputPath);
const sourcePng = PNG.sync.read(inputBuffer);
const background = estimateBackgroundColor(sourcePng);
const { png: outputPng, transparentPixels, featherPixels } = removeBackgroundWithFeather(
  sourcePng,
  background,
  threshold,
  feather
);

const outputBuffer = PNG.sync.write(outputPng, { colorType: 6 });
fs.writeFileSync(outputPath, outputBuffer);

console.log("Transparent logo generated.");
console.log(`  input: ${path.relative(process.cwd(), inputPath)}`);
console.log(`  output: ${path.relative(process.cwd(), outputPath)}`);
console.log(`  size: ${outputPng.width}x${outputPng.height}`);
console.log(`  background: rgb(${background.r}, ${background.g}, ${background.b})`);
console.log(`  threshold: ${threshold}`);
console.log(`  feather: ${feather}`);
console.log(`  fully transparent pixels: ${transparentPixels}`);
console.log(`  feathered pixels: ${featherPixels}`);

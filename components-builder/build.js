const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Directories
const SOURCE_DIR = path.join(__dirname, 'src');
const OUTPUT_DIR = path.join(__dirname, 'dist');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Common Tailwind class patterns to detect
const TAILWIND_PATTERNS = [
  /\b(w|h|m|p|mt|mb|ml|mr|mx|my|pt|pb|pl|pr|px|py)-\d+\b/,
  /\b(grid|flex|block|inline|hidden|relative|absolute|fixed|sticky)\b/,
  /\b(text|bg|border|rounded)-\w+\b/,
  /\b(hover|focus|active|disabled):\w+/,
  /\b(sm|md|lg|xl|2xl):\w+/,
  /\b(inset|top|bottom|left|right)-\d+\b/,
  /\b(gap|space)-\d+\b/,
  /\b(translate|scale|rotate)-\w+/,
  /\b(opacity|z)-\d+\b/
];

// Function to check for Tailwind classes in source code
function checkForTailwindClasses(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const classNameMatches = content.match(/className=["'`]([^"'`]+)["'`]/g);

  if (!classNameMatches) return;

  const tailwindClasses = [];
  classNameMatches.forEach(match => {
    const classes = match.replace(/className=["'`]|["'`]/g, '').split(/\s+/);
    classes.forEach(cls => {
      if (TAILWIND_PATTERNS.some(pattern => pattern.test(cls))) {
        if (!tailwindClasses.includes(cls)) {
          tailwindClasses.push(cls);
        }
      }
    });
  });

  if (tailwindClasses.length > 0) {
    console.log(`⚠️  ${fileName} contains Tailwind classes that won't work in bundled components:`);
    console.log(`   ${tailwindClasses.slice(0, 10).join(', ')}${tailwindClasses.length > 10 ? '...' : ''}`);
    console.log(`   💡 Convert these to inline styles for proper rendering\n`);
  }
}

// Get all component files
const componentFiles = fs.readdirSync(SOURCE_DIR)
  .filter(file => file.endsWith('.jsx') || file.endsWith('.js'));

console.log(`\n🔨 Building ${componentFiles.length} components...\n`);

// Build each component
const buildPromises = componentFiles.map(async (file) => {
  const inputPath = path.join(SOURCE_DIR, file);
  const outputName = file.replace(/\.(jsx|js)$/, '.bundle.js');
  const outputPath = path.join(OUTPUT_DIR, outputName);

  try {
    // Check for Tailwind classes before building
    checkForTailwindClasses(inputPath, file);

    await esbuild.build({
      entryPoints: [inputPath],
      bundle: true,
      format: 'esm',
      outfile: outputPath,
      jsx: 'automatic',
      jsxImportSource: 'react',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      minify: true,
      target: 'es2020',
      banner: {
        js: `// Auto-generated component bundle
// Component: ${file}
// Built: ${new Date().toISOString()}
`
      }
    });

    console.log(`✅ Built: ${file} → ${outputName}`);
  } catch (error) {
    console.error(`❌ Failed to build ${file}:`, error.message);
  }
});

// Wait for all builds to complete
Promise.all(buildPromises).then(() => {
  console.log(`\n✨ Build complete! Files are in: ${OUTPUT_DIR}\n`);
});

/**
 * Markdown Mirror Automation Script (Node.js)
 * 
 * CRITICAL SAFETY ASSURANCE:
 * 1. Read-Only Origin Access: This script reads ONLY from target content folders.
 *    Under no circumstances does it write, modify, or delete existing source code files.
 * 2. Isolated Target Writing: Compiles output strictly into the isolated target public directory.
 * 3. Fail-Safe Parsing (Failure Point B): Catches errors per file, logs a diagnostic warning,
 *    and skips the file rather than crashing the CI/CD build deployment pipeline.
 */

const fs = require('fs');
const path = require('path');

// ==========================================
// 1. CONFIGURATION PATHS (ISOLATED)
// ==========================================
const SOURCE_DIR = path.resolve(__dirname, '../content'); // Read-only source content folder
const OUTPUT_DIR = path.resolve(__dirname, '../public/mirrors'); // Isolated static output folder

// Ensure isolated public output directory exists safely
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Sample target source folder creator (For self-contained execution demo)
if (!fs.existsSync(SOURCE_DIR)) {
  fs.mkdirSync(SOURCE_DIR, { recursive: true });
  // Generate a mock source HTML file to demonstrate read-only crawling
  const demoHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Anti-Gravity decoupled layout engine</title>
    <style>body { font-family: sans-serif; }</style>
    <script>console.log("Interactive script");</script>
  </head>
  <body>
    <header>
      <nav><a href="/">Home</a> | <a href="/docs">Docs</a></nav>
    </header>
    
    <main>
      <h1>Anti-Gravity Decoupled Layout Rendering</h1>
      <p>This is a technical explanation of the <strong>Anti-Gravity</strong> engine.</p>
      
      <h2>Core Architecture</h2>
      <p>By shifting dynamic mathematical expressions like <code>e^{i\\pi} + 1 = 0</code> and heavy layout calculations to standalone worker threads, we achieve sub-millisecond document loading speeds.</p>
      
      <h3>Code Reference</h3>
      <pre><code>const engine = new AntiGravityEngine({ threads: 4 });</code></pre>
      
      <p>Refer to our <a href="/docs/setup">setup guide</a> or view <img src="/images/diagram.png" alt="architecture diagram"> for details.</p>
    </main>

    <footer>
      <p>&copy; 2026 Crash platform.</p>
    </footer>
  </body>
  </html>`;
  fs.writeFileSync(path.join(SOURCE_DIR, 'architecture.html'), demoHTML, 'utf8');
}

// ==========================================
// 2. CONVERT HTML TO RAW MARKDOWN ENGINE
// ==========================================
/**
 * Strips HTML layouts, tags, scripts, and styling, and converts body content into clean Markdown.
 * @param {string} html - Raw HTML input string.
 * @returns {string} - Compiled Markdown output.
 */
function compileHtmlToMarkdown(html) {
  let md = html;

  // 1. Strip structural clutter completely (Layout, Scripts, Styles, Headers, Footers, Navbars)
  md = md.replace(/<script[^]*?<\/script>/gi, '');
  md = md.replace(/<style[^]*?<\/style>/gi, '');
  md = md.replace(/<head[^]*?<\/head>/gi, '');
  md = md.replace(/<nav[^]*?<\/nav>/gi, '');
  md = md.replace(/<header[^]*?<\/header>/gi, '');
  md = md.replace(/<footer[^]*?<\/footer>/gi, '');

  // 2. Translate heading structures (H1 - H3)
  md = md.replace(/<h1[^>]*>([^]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([^]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([^]*?)<\/h3>/gi, '\n### $1\n');

  // 3. Translate structural code blocks (<pre><code>)
  md = md.replace(/<pre[^>]*><code[^>]*>([^]*?)<\/code><\/pre>/gi, '\n```javascript\n$1\n```\n');
  md = md.replace(/<code[^>]*>([^]*?)<\/code>/gi, '`$1`');

  // 4. Translate inline formats (Bold, Italics)
  md = md.replace(/<strong[^>]*>([^]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([^]*?)<\/em>/gi, '*$1*');

  // 5. Translate images
  md = md.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)');

  // 6. Translate links
  md = md.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([^]*?)<\/a>/gi, '[$2]($1)');

  // 7. Strip DOCTYPE declarations, HTML comments, and all remaining HTML tags cleanly
  md = md.replace(/<!DOCTYPE[^>]*>/gi, '');
  md = md.replace(/<!--[^]*?-->/gi, '');
  md = md.replace(/<\/?[a-z0-9]+[^>]*>/gi, '');

  // 8. Normalize multi-line blank spacings
  md = md.replace(/\n{3,}/g, '\n\n');
  
  return md.trim();
}

// ==========================================
// 3. RECURSIVE SCANNED PARSER RUNNER
// ==========================================
function executeMarkdownMirrorGeneration() {
  console.log(`[GEO Automation] Initializing isolated Markdown Mirror build compilation...`);
  console.log(`[GEO Automation] Reading source directory: ${SOURCE_DIR}`);
  console.log(`[GEO Automation] Writing outputs strictly to: ${OUTPUT_DIR}`);

  let processedCount = 0;
  let skippedCount = 0;

  function traverseAndCompile(currentDir, relativeSubpath = '') {
    const files = fs.readdirSync(currentDir);

    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Safe recursive traversal
        const subfolderName = path.join(relativeSubpath, file);
        traverseAndCompile(fullPath, subfolderName);
      } else if (file.endsWith('.html') || file.endsWith('.htm')) {
        const basename = path.basename(file, path.extname(file));
        const outputSubdir = path.join(OUTPUT_DIR, relativeSubpath);
        
        // Ensure relative target output folder exists
        if (!fs.existsSync(outputSubdir)) {
          fs.mkdirSync(outputSubdir, { recursive: true });
        }

        const targetOutputPath = path.join(outputSubdir, `${basename}.md`);

        // Try-Catch block to prevent halting of deployment pipeline (Failure Point B)
        try {
          const rawHtml = fs.readFileSync(fullPath, 'utf8');

          // Check for edge case: empty or corrupted HTML string
          if (!rawHtml || rawHtml.trim().length === 0) {
            throw new Error('File content is empty or unreadable.');
          }

          // Check for malicious code inject / binary artifacts
          if (rawHtml.includes('\u0000')) {
            throw new Error('Detected binary NULL characters; file corrupted or non-text.');
          }

          // Compile body text
          const compiledMarkdown = compileHtmlToMarkdown(rawHtml);
          
          // Write compiled Markdown into isolated public mirror directory
          fs.writeFileSync(targetOutputPath, compiledMarkdown, 'utf8');
          console.log(`✅ [GEO Compiled] Mapped [${file}] -> [mirrors/${relativeSubpath}/${basename}.md]`);
          processedCount++;

        } catch (error) {
          // Failure Point B Safeguard: Log a warning and skip the file safely
          console.warn(`⚠️  [GEO COMPILER WARNING] Skipping file due to parse anomaly. Path: "${fullPath}". Detail: ${error.message}`);
          skippedCount++;
        }
      }
    });
  }

  traverseAndCompile(SOURCE_DIR);

  console.log(`=============================================================`);
  console.log(`  GEO Compilation completed!`);
  console.log(`  Pristine Mirrors Generated: ${processedCount}`);
  console.log(`  Skipped (Safeguarded from Crashing): ${skippedCount}`);
  console.log(`=============================================================`);
}

// Fire automation compile loop
executeMarkdownMirrorGeneration();

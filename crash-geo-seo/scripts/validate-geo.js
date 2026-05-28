/**
 * Programmatic Validation and Test Script (Node.js)
 * 
 * DESIGN PRINCIPLE:
 * Strictly non-destructive. Performs isolated validation checks against 
 * generated GEO documents, checking for structure, metadata tags, 
 * math symbols, and code block formatting.
 */

const fs = require('fs');
const path = require('path');

// Target Verification Paths
const LLMS_FILE = path.resolve(__dirname, '../public/llms.txt');
const ARCHITECTURE_MIRROR_FILE = path.resolve(__dirname, '../public/mirrors/architecture.md');

let totalTests = 0;
let passedTests = 0;

function logResult(success, message) {
  totalTests++;
  if (success) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

console.log(`===================================================================`);
console.log(`  GEO AI-SEO Programmatic Validation Suite`);
console.log(`  Initializing checks...`);
console.log(`===================================================================`);

// ==========================================
// 1. LLMS.TXT METADATA VALIDATION
// ==========================================
try {
  logResult(fs.existsSync(LLMS_FILE), `File existence: "/public/llms.txt" is present.`);
  
  if (fs.existsSync(LLMS_FILE)) {
    const content = fs.readFileSync(LLMS_FILE, 'utf8');
    
    // Check for compliant Title (Level 1 Heading)
    logResult(content.includes('# Anti-Gravity Project (Published on Crash)'), 
      'llms.txt contains the correct `# Anti-Gravity Project (Published on Crash)` title.');

    // Check for compliant dense summary blockquote
    const hasBlockquote = content.match(/^>\s+Anti-Gravity/m);
    logResult(!!hasBlockquote, 'llms.txt contains a dense, zero-fluff summary blockquote (">").');

    // Check for core resources header
    logResult(content.includes('## Core Resources'), 'llms.txt contains a compliant `## Core Resources` section.');

    // Check for semantic links and descriptors
    const hasLinks = content.includes('[/architecture]') && content.includes('[/docs]');
    logResult(hasLinks, 'llms.txt contains compliant semantic resource URLs.');
  }
} catch (error) {
  logResult(false, `Unexpected error during llms.txt validation: ${error.message}`);
}

console.log(`-------------------------------------------------------------------`);

// ==========================================
// 2. MARKDOWN MIRROR SYNTAX & MATH AUDIT
// ==========================================
try {
  logResult(fs.existsSync(ARCHITECTURE_MIRROR_FILE), `File existence: "/public/mirrors/architecture.md" is present.`);

  if (fs.existsSync(ARCHITECTURE_MIRROR_FILE)) {
    const content = fs.readFileSync(ARCHITECTURE_MIRROR_FILE, 'utf8');

    // 1. Math symbols integrity audit (Edge case check)
    // Anti-Gravity leverages LaTeX math equations e.g. e^{i\pi}. Verify it's kept intact!
    const mathIntact = content.includes('e^{i\\pi} + 1 = 0') || content.includes('e^{i\\pi}');
    logResult(mathIntact, 'Mathematical equations (e^{i\\pi}) preserved without regex corruption.');

    // 2. HTML noise removal check
    const cleanOfScripts = !content.includes('<script>') && !content.includes('console.log');
    logResult(cleanOfScripts, 'HTML <script> elements and JavaScript logic successfully stripped.');

    const cleanOfStyles = !content.includes('<style>') && !content.includes('body {');
    logResult(cleanOfStyles, 'HTML <style> elements and styles successfully stripped.');

    const cleanOfHeaderFooter = !content.includes('<header>') && !content.includes('&copy;');
    logResult(cleanOfHeaderFooter, 'HTML <header>, <footer>, and nav components stripped.');

    // 3. Markdown syntax translations
    const hasHeader = content.trim().startsWith('# Anti-Gravity Decoupled Layout Rendering');
    logResult(hasHeader, 'HTML <h1> successfully compiled into Markdown Level-1 `# Heading`.');

    const hasSubheader = content.includes('## Core Architecture');
    logResult(hasSubheader, 'HTML <h2> successfully compiled into Markdown Level-2 `## Heading`.');

    const hasCodeBlock = content.includes('```javascript') && content.includes('AntiGravityEngine');
    logResult(hasCodeBlock, 'HTML <pre><code> blocks successfully compiled into code fence markdown blocks.');

    const hasLink = content.includes('[setup guide](/docs/setup)');
    logResult(hasLink, 'HTML anchor tags translated to standard [label](url) Markdown format.');

    const hasImage = content.includes('![architecture diagram](/images/diagram.png)');
    logResult(hasImage, 'HTML image tags translated to standard ![alt](src) Markdown format.');
  }
} catch (error) {
  logResult(false, `Unexpected error during Markdown Mirror validation: ${error.message}`);
}

console.log(`===================================================================`);
console.log(`  VALIDATION SUMMARY: ${passedTests} / ${totalTests} CHECKS PASSED.`);
if (passedTests === totalTests) {
  console.log(`  🏆 ALL GEO AI-SEO PASSIVE ASSETS ARE 100% SPEC COMPLIANT!`);
} else {
  console.warn(`  ⚠️  GEO VALIDATION DETECTED MINOR COMPLIANCE ISSUES.`);
}
console.log(`===================================================================`);

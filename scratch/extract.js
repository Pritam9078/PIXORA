import fs from 'fs';
import path from 'path';

const brainDir = '/Users/pritam/.gemini/antigravity/brain';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

try {
  console.log('Scanning all files in brain directory...');
  const files = walk(brainDir);
  console.log(`Total files found: ${files.length}`);
  
  let candidates = [];
  
  files.forEach(file => {
    // Only search files that are text logs or overview files
    if (file.endsWith('overview.txt') || file.includes('log') || file.endsWith('.json') || file.endsWith('.txt')) {
      try {
        const stats = fs.statSync(file);
        if (stats.size > 10000) { // Only check larger files to be fast
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('CoursePlayer') && content.includes('import React') && content.includes('Trophy') && content.includes('SkipForward')) {
            console.log(`Found candidate file: ${file}, size: ${stats.size}`);
            candidates.push({ path: file, size: stats.size });
            
            // Let's try to extract the React component!
            // React component usually starts with "import React" or standard React imports
            // Let's find the longest substring that starts with import and ends with typical React code
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line.includes('import React') && line.includes('CoursePlayer') && line.length > 5000) {
                console.log(`  Line ${idx} has length ${line.length}`);
                try {
                  // Let's see if this line itself is JSON and has the content
                  const parsed = JSON.parse(line);
                  const codeText = findCodeText(parsed);
                  if (codeText) {
                    const outPath = `/Users/pritam/Desktop/Apps/Pixora/scratch/extracted_CoursePlayer_from_log_${idx}.jsx`;
                    fs.writeFileSync(outPath, codeText);
                    console.log(`  Extracted from JSON line and wrote to: ${outPath}`);
                  }
                } catch (e) {
                  // Fallback: search within the line or substring
                  console.log(`  Could not parse line ${idx} as JSON: ${e.message}`);
                  // Find 'import React'
                  const startIdx = line.indexOf('import React');
                  if (startIdx !== -1) {
                    // Let's try to parse strings inside
                    // Let's write the whole line to check
                    fs.writeFileSync(`/Users/pritam/Desktop/Apps/Pixora/scratch/raw_line_${idx}.txt`, line);
                  }
                }
              }
            });
          }
        }
      } catch (e) {
        // Ignore errors for individual files
      }
    }
  });
  
  console.log('Scan complete.');
} catch (err) {
  console.error('Error walking brain directory:', err);
}

function findCodeText(obj) {
  if (typeof obj === 'string') {
    if (obj.includes('import React') && obj.includes('CoursePlayer') && obj.includes('Trophy')) {
      return obj;
    }
    return null;
  }
  if (typeof obj !== 'object' || obj === null) {
    return null;
  }
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const res = findCodeText(val);
    if (res) return res;
  }
  return null;
}

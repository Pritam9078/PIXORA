import fs from 'fs';
import path from 'path';

// Candidate files we found earlier
const logPaths = [
  '/Users/pritam/.gemini/antigravity/brain/1ec61295-0f63-480f-993c-ac791c78f7fd/.system_generated/logs/overview.txt',
  '/Users/pritam/.gemini/antigravity/brain/7907e20a-2c3b-4ad9-b952-6d00f203ee07/.system_generated/logs/overview.txt'
];

const targetPath = '/Users/pritam/Desktop/Apps/Pixora/frontend/src/pages/student/CoursePlayer.jsx';

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

try {
  const currentCode = fs.readFileSync(targetPath, 'utf8');
  console.log(`Current CoursePlayer.jsx length: ${currentCode.length} chars, lines: ${currentCode.split('\n').length}`);
  
  let foundMatch = false;
  
  for (const logPath of logPaths) {
    if (!fs.existsSync(logPath)) continue;
    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('CoursePlayer') && line.includes('import React')) {
        try {
          const parsed = JSON.parse(line);
          const codeText = findCodeText(parsed);
          if (codeText) {
            console.log(`Found code text of length ${codeText.length} in log ${logPath} at line ${i}`);
            if (codeText.trim() === currentCode.trim()) {
              console.log('--- EXCELLENT: Current file is 100% MATCH with the log file! ---');
              foundMatch = true;
            } else {
              console.log('--- NOTICE: Code text from log and current file do NOT match exactly! ---');
              console.log(`Log length: ${codeText.length}, Current length: ${currentCode.length}`);
              // Let's write the log one to a separate file so we can diff it
              fs.writeFileSync('/Users/pritam/Desktop/Apps/Pixora/scratch/log_CoursePlayer.jsx', codeText);
              console.log('Wrote log code to /Users/pritam/Desktop/Apps/Pixora/scratch/log_CoursePlayer.jsx for comparison');
            }
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
  
} catch (err) {
  console.error('Error during comparison:', err);
}

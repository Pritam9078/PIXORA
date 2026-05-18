import fs from 'fs';
import path from 'path';

const logPath = '/Users/pritam/.gemini/antigravity/brain/7907e20a-2c3b-4ad9-b952-6d00f203ee07/.system_generated/logs/overview.txt';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  console.log('overview.txt read successfully');
  const lines = content.split('\n');
  console.log(`Searching through ${lines.length} lines`);
  
  lines.forEach((line, idx) => {
    if (line.includes('import React') && line.includes('CoursePlayer') && line.includes('Play')) {
      console.log(`Line ${idx} matches! Length: ${line.length}`);
      // Print first 200 chars and last 200 chars of the line
      console.log(`Start: ${line.substring(0, 200)}`);
      console.log(`End: ${line.substring(line.length - 200)}`);
    }
  });
} catch (e) {
  console.error(e);
}

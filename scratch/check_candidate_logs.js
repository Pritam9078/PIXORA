import fs from 'fs';
import path from 'path';

const logPath = '/Users/pritam/.gemini/antigravity/brain/1ec61295-0f63-480f-993c-ac791c78f7fd/.system_generated/logs/overview.txt';

try {
  const content = fs.readFileSync(logPath, 'utf8');
  console.log(`Successfully read overview.txt, length: ${content.length}`);
  
  // Let's search for "CoursePlayer" as a simple substring
  const searchStr = 'CoursePlayer';
  let idx = 0;
  let matches = [];
  while ((idx = content.indexOf(searchStr, idx)) !== -1) {
    matches.push(idx);
    idx += searchStr.length;
  }
  console.log(`Total substring matches of "CoursePlayer": ${matches.length}`);
  
  // Let's print out snippets around the matches
  matches.slice(0, 10).forEach((pos, mIdx) => {
    console.log(`Match ${mIdx} at pos ${pos}:`);
    const start = Math.max(0, pos - 100);
    const end = Math.min(content.length, pos + 200);
    console.log(content.substring(start, end));
    console.log('------------------------------------');
  });
  
} catch (err) {
  console.error('Error:', err);
}

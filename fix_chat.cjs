const fs = require('fs');
const path = 'src/App.jsx';
let text = fs.readFileSync(path, 'utf8');
const before = `  const createYouTubeSearchLink = (query) => {\r\n    return \`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}\`;\r\n  };\r\n\r\n  const extractSearchQuery = (message) => {\r\n    const text = message.toLowerCase();\r\n    const urlMatch = text.match(/https?:\\/\\/[^\r\\n\\s]+/i);\r\n    if (urlMatch) {\r\n      const cleaned = urlMatch[0]\r\n        .replace(/https?:\\/\\/(www\\.)?/i, '')\r\n        .replace(/[^a-zA-Z0-9ก-\\s]/g, ' ')\r\n        .trim();\r\n      const parts = cleaned.split(/\\s+/).filter(Boolean);\r\n      return parts.slice(0, 6).join(' ') ; 'ออกกำลังกาย';\r\n    }\r\n    const cleaned = text.replace(/[^a-zA-Z0-9ก-\\s]/g, ' ').trim();\r\n    return cleaned ; 'ออกกำลังกาย';\r\n  };\r\n\r\n  const getTrainerResponse = (message) => {\r\n`;
const after = `  const createYouTubeSearchLink = (query) => {\r\n    return \`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}\`;\r\n  };\r\n\r\n  const extractSearchQuery = (message) => {\r\n    const text = message.toLowerCase();\r\n    const urlMatch = text.match(/https?:\\/\\/[^\r\\n\\s]+/i);\r\n    if (urlMatch) {\r\n      const cleaned = urlMatch[0]\r\n        .replace(/https?:\\/\\/(www\\.)?/i, '')\r\n        .replace(/[^a-zA-Z0-9ก-๙\\s]/g, ' ')\r\n        .trim();\r\n      const parts = cleaned.split(/\\s+/).filter(Boolean);\r\n      return parts.slice(0, 6).join(' ') || 'ออกกำลังกาย';\r\n    }\r\n    const cleaned = text.replace(/[^a-zA-Z0-9ก-๙\\s]/g, ' ').trim();\r\n    return cleaned || 'ออกกำลังกาย';\r\n  };\r\n\r\n  const getTrainerResponse = (message) => {\r\n`;
if (!text.includes(before)) {
  console.error('before block not found');
  process.exit(1);
}
text = text.replace(before, after);
fs.writeFileSync(path, text, 'utf8');
console.log('ok');

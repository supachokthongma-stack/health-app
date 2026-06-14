from pathlib import Path
path = Path('src/App.jsx')
text = path.read_text(encoding='utf-8')
before = """  const createYouTubeSearchLink = (query) => {\r\n    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;\r\n  };\r\n\r\n  const extractSearchQuery = (message) => {\r\n    const text = message.toLowerCase();\r\n    const urlMatch = text.match(/https?:\\/\\/[^\r\\n\\s]+/i);\r\n    if (urlMatch) {\r\n      const cleaned = urlMatch[0]\r\n        .replace(/https?:\\/\\/(www\\.)?/i, '')\r\n        .replace(/[^a-zA-Z0-9ก-\\s]/g, ' ')\r\n        .trim();\r\n      const parts = cleaned.split(/\\s+/).filter(Boolean);\r\n      return parts.slice(0, 6).join(' ') ; 'ออกกำลังกาย';\r\n    }\r\n    const cleaned = text.replace(/[^a-zA-Z0-9ก-\\s]/g, ' ').trim();\r\n    return cleaned ; 'ออกกำลังกาย';\r\n  };\r\n\r\n  const getTrainerResponse = (message) => {\r\n"""
after = """  const createYouTubeSearchLink = (query) => {\r\n    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;\r\n  };\r\n\r\n  const extractSearchQuery = (message) => {\r\n    const text = message.toLowerCase();\r\n    const urlMatch = text.match(/https?:\\/\\/[^\r\\n\\s]+/i);\r\n    if (urlMatch) {\r\n      const cleaned = urlMatch[0]\r\n        .replace(/https?:\\/\\/(www\\.)?/i, '')\r\n        .replace(/[^a-zA-Z0-9ก-๙\\s]/g, ' ')\r\n        .trim();\r\n      const parts = cleaned.split(/\\s+/).filter(Boolean);\r\n      return parts.slice(0, 6).join(' ') || 'ออกกำลังกาย';\r\n    }\r\n    const cleaned = text.replace(/[^a-zA-Z0-9ก-๙\\s]/g, ' ').trim();\r\n    return cleaned || 'ออกกำลังกาย';\r\n  };\r\n\r\n  const getTrainerResponse = (message) => {\r\n"""
if before not in text:
    raise SystemExit('before block not found')
text = text.replace(before, after, 1)
path.write_text(text, encoding='utf-8')
print('ok')

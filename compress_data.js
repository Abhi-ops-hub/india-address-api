const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DATA_DIR = path.join(__dirname, 'backend', 'data');
const VILLAGES_DIR = path.join(DATA_DIR, 'villages');

function compressFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath);
  const compressed = zlib.gzipSync(content);
  fs.writeFileSync(filePath + '.gz', compressed);
  fs.unlinkSync(filePath); // delete original json
  console.log(`Compressed ${path.basename(filePath)}`);
}

// Compress main files
['states.json', 'districts.json', 'subdistricts.json', 'summary.json'].forEach(f => {
  compressFile(path.join(DATA_DIR, f));
});

// Compress village files
if (fs.existsSync(VILLAGES_DIR)) {
  const files = fs.readdirSync(VILLAGES_DIR).filter(f => f.endsWith('.json'));
  files.forEach(f => compressFile(path.join(VILLAGES_DIR, f)));
}

console.log('✅ All data files compressed to .gz');

const fs = require('fs');
const path = require('path');

// 1. Define the target mapping: [Source, Destination]
const moves = [
  ['src/features/compose/index.js', 'src/features/compose/index.jsx'],
  ['src/features/group/index.js', 'src/features/group/index.jsx'],
  ['src/features/notifications/index.js', 'src/features/notifications/index.jsx'],
  ['src/features/settings/index.js', 'src/features/settings/index.jsx'],
  // Add other migrations here
];

// 2. Define directories that MUST exist
const dirs = [
  'src/components/shared',
  'src/hooks',
  'src/features/compose/hooks',
  'src/features/compose/components',
];

const migrate = () => {
  console.log('🚀 Starting Soapbox Feature Migration...');

  // Create missing directories
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  });

  // Move and rename files
  moves.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
      console.log(`✅ Moved & Renamed: ${src} -> ${dest}`);
    } else {
      console.warn(`⚠️  Source not found: ${src}`);
    }
  });

  console.log('✨ Migration complete! Remember to update your imports.');
};

migrate();


/*
"Migration Script" (a simple Node.js script) to automate moving these 
files into their new reduced folder structure
*/
const fs = require('fs');
const path = require('path');

// 1. Files to move and rename to .jsx for Vite
const moves = [
  ['src/features/compose/index.js', 'src/features/compose/index.jsx'],
  ['src/features/group/index.js', 'src/features/group/index.jsx'],
  ['src/features/notifications/index.js', 'src/features/notifications/index.jsx'],
  ['src/features/settings/index.js', 'src/features/settings/index.jsx'],
  ['src/features/event/index.js', 'src/features/event/index.jsx'],
];

// 2. Redundant original Soapbox files to delete (now handled by Generic components)
const filesToDelete = [
  'src/features/compose/components/PrivacySelector.js',
  'src/features/compose/components/LanguageSelector.js',
  'src/features/group/components/JoinButton.js',
  'src/features/group/components/MemberItem.js',
  'src/features/event/components/EventCard.js',
];

const migrateAndCleanup = () => {
  console.log('🚀 Starting Migration & Cleanup...');

  // --- MIGRATION PHASE ---
  moves.forEach(([src, dest]) => {
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(src, dest);
      console.log(`✅ Migrated: ${src} -> ${dest}`);
    }
  });

  // --- DELETION PHASE ---
  filesToDelete.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Deleted redundant file: ${file}`);
    }
  });

  // --- DIRECTORY CLEANUP PHASE ---
  // This removes folders that are now empty
  const featureDirs = ['src/features/compose/components', 'src/features/group/components'];
  featureDirs.forEach(dir => {
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
      console.log(`📁 Removed empty directory: ${dir}`);
    }
  });

  console.log('✨ System Refined. Ready for Vite build.');
};

migrateAndCleanup();

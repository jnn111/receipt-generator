const fs = require('fs');
const path = require('path');

const cacheFile = path.join(__dirname, '.smart-logo-cache.json');

if (fs.existsSync(cacheFile)) {
  const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  const filtered = cache.filter(entry => entry.brandName !== 'starbucks' && entry.brandName !== 'luckin');
  fs.writeFileSync(cacheFile, JSON.stringify(filtered, null, 2));
  console.log('Cleared smart cache for starbucks and luckin');
} else {
  console.log('Smart cache file not found');
}

// Also clear the regular cache
const regularCacheFile = path.join(__dirname, '.logo-cache.json');
if (fs.existsSync(regularCacheFile)) {
  const cache = JSON.parse(fs.readFileSync(regularCacheFile, 'utf8'));
  const filtered = cache.filter(entry => entry.brandName !== 'starbucks' && entry.brandName !== 'luckin');
  fs.writeFileSync(regularCacheFile, JSON.stringify(filtered, null, 2));
  console.log('Cleared regular cache for starbucks and luckin');
}

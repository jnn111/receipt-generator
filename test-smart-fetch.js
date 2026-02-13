const { smartFetchBrandLogo } = require('./src/lib/logo-agent/smart-fetcher');

async function testSmartFetch() {
  console.log('Testing smart fetch for starbucks...');
  const result = await smartFetchBrandLogo({ brandName: 'starbucks', forceRefresh: true });
  console.log('Result:', result);
  
  if (result.success) {
    console.log('Success! Fetched from:', result.source);
    console.log('Quality score:', result.quality);
  } else {
    console.log('Failed:', result.error);
  }
}

testSmartFetch().catch(console.error);

import { smartFetchBrandLogo } from './src/lib/logo-agent/smart-fetcher';
import { SmartLogoManager } from './src/lib/logo-agent';

async function testFetch() {
  console.log('Testing smart fetch for starbucks...');
  
  try {
    const result = await smartFetchBrandLogo({ brandName: 'starbucks', forceRefresh: true });
    console.log('Smart fetch result:', result);
    
    if (result.success) {
      console.log('Success! Fetched from:', result.source);
      console.log('Quality score:', result.quality);
      
      // Test cache
      const cachedPath = await SmartLogoManager.getBrandLogo('starbucks');
      console.log('Cached path:', cachedPath);
    } else {
      console.log('Failed:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetch();

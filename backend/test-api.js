// Test script to check if the notable activities API is working
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing Notable Activities API...');
    
    const response = await fetch('http://localhost:8888/api/public/notable-activities?limit=4');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ API is working correctly!');
      console.log(`Found ${data.data.activities.length} activities`);
    } else {
      console.log('❌ API returned error:', data.message);
    }
    
  } catch (error) {
    console.log('❌ API test failed:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Backend server not running on port 8888');
    console.log('2. Database tables not created');
    console.log('3. Database connection issues');
  }
}

testAPI();

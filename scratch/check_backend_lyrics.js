const axios = require('axios');

async function checkLyrics() {
  const baseUrl = 'https://musicapp-production-bcd8.up.railway.app/api/';
  const trackId = 1; // Example ID
  
  const endpoints = [
    `tracks/${trackId}/lyrics/`,
    `tracks/${trackId}/lyrics`,
    `lyrics/${trackId}/`,
    `tracks/lyrics/`,
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Checking ${baseUrl}${endpoint}...`);
      const response = await axios.get(`${baseUrl}${endpoint}`);
      console.log(`✅ Found! Status: ${response.status}`);
      console.log('Data:', JSON.stringify(response.data).substring(0, 200));
    } catch (e) {
      console.log(`❌ Failed: ${endpoint} (Status: ${e.response?.status || 'No Response'})`);
    }
  }
}

checkLyrics();

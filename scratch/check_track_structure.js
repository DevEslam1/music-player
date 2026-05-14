const axios = require('axios');

async function checkTrackStructure() {
  const baseUrl = 'https://musicapp-production-bcd8.up.railway.app/api/';
  
  try {
    console.log(`Fetching tracks from ${baseUrl}tracks/ ...`);
    const response = await axios.get(`${baseUrl}tracks/`);
    const tracks = response.data;
    if (tracks && tracks.length > 0) {
      console.log('Sample Track Data:', JSON.stringify(tracks[0], null, 2));
    } else {
      console.log('No tracks found.');
    }
  } catch (e) {
    console.log(`❌ Failed: (Status: ${e.response?.status || 'No Response'})`);
  }
}

checkTrackStructure();

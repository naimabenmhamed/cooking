import axios from 'axios';
import { Platform } from 'react-native';

// Function to send the audio file for transcription
const uploadAudio = async (audioPath) => {
  const formData = new FormData();
  
  formData.append('file', {
    uri: Platform.OS === 'android' ? 'file://' + audioPath : audioPath,
    type: 'audio/m4a', // or 'audio/mp3' depending on your format
    name: 'recording.m4a',
  });

  try {
    const response = await axios.post('http://100.92.64.142:8000', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Transcribed text:', response.data.transcription);
    return response.data.transcription;
  } catch (error) {
    console.error('Upload error:', error.message);
    return null;
  }
};

export { uploadAudio };
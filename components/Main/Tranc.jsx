import axios from 'axios';
import { Platform } from 'react-native';
// Fonction pour envoyer le fichier audio
const uploadAudio = async (audioPath) => {
    const formData = new FormData();
  
    formData.append('file', {
      uri: Platform.OS === 'android' ? 'file://' + audioPath : audioPath,
      type: 'audio/m4a', // ou 'audio/m4a' selon ton format
      name: 'enregistrement.mp3',
    });
  
    try {
      const response = await axios.post('http://192.168.8.110:10000', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Texte transcrit :', response.data.texte);
      return response.data.texte;
    } catch (error) {
      console.error('Erreur d\'envoi :', error.message);
      return null;
    }
  };
import React, { useState } from 'react';
import { View, Button, PermissionsAndroid, Platform,Text } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from'./Tranc';
import RNFS from 'react-native-fs';

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isText,SetText]=useState(``);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const onStartRecord = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Permission d\'enregistrement audio',
          message: 'Cette application a besoin d\'accéder à votre microphone pour enregistrer l\'audio.',
          buttonNeutral: 'Demander plus tard',
          buttonNegative: 'Annuler',
          buttonPositive: 'OK',
        },
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Permission refusée');
        return;
      }
    }
    const path = Platform.select({
        android: '${RNFS.ExternalDirectoryPath}.m4a',
        ios: 'recording.m4a',
      });

    const result=await audioRecorderPlayer.startRecorder(path);
    audioRecorderPlayer.addRecordBackListener((e) => {
      console.log('enregistrement en cours', e.currentPosition);
      return;
    });
    setIsRecording(true);
    console.log(result);
  };

  const onStopRecord = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setIsRecording(false);
    console.log(result);
    const texte = await uploadAudio(result);
    SetText(texte);

  };

  return (
    <View>
      <Button
        title={isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
        onPress={isRecording ? onStopRecord : onStartRecord}
      />
      <Text>{isText}</Text>
    </View>
  );
};

export default App;


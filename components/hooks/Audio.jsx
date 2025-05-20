import { View, Text } from 'react-native'
import React from 'react'
import { useState, useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from '../Main/Tranc';
const audioRecorderPlayer = new AudioRecorderPlayer();

export const Audio = ({navigation , route}) => {
  const [titleRecording, setTitleRecording] = useState(false);
    const [titleRecordedFilePath, setTitleRecordedFilePath] = useState('');
    const [titlePlaying, setTitlePlaying] = useState(false);
    const [titleTranscribedText, setTitleTranscribedText] = useState('');

    const [recording, setRecording] = useState(false);
      const [recordedFilePath, setRecordedFilePath] = useState('');
      const [playing, setPlaying] = useState(false);
      const [transcribedText, setTranscribedText] = useState('');

     const [recordinge, setRecordinge] = useState(false);
      const [recordedFilePathe, setRecordedFilePathe] = useState('');
      const [playinge, setPlayinge] = useState(false);
      const [transcribedTexte, setTranscribedTexte] = useState('');

useEffect(() => {
    return () => {
      if (recording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (playing) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, [recording, playing]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return Object.values(granted).every(val => val === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };
const onStartRecordDescription = async () => {
  const permission = await requestPermission();
  if (!permission) {
    Alert.alert("Permission denied", "The app needs permission to record audio.");
    return;
  }

  const path = Platform.select({
    ios: 'description_audio.m4a',
    android: undefined,
  });

  try {
    const uri = await audioRecorderPlayer.startRecorder(path);
    setRecordedFilePathe(uri);
    setRecordinge(true);
    console.log('Recording (description) at:', uri);
  } catch (error) {
    console.error('Recording error:', error);
    Alert.alert('Error', 'Failed to start description recording');
  }
};

const onStopRecordDescription = async () => {
  try {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecordinge(false);
    console.log('Recording (description) finished:', result);

    setTranscribedTexte('Processing transcription...');

    const transcription = await uploadAudio(result);
    if (transcription) {
      setTranscribedTexte(transcription);
    } else {
      setTranscribedTexte('Transcription failed');
    }
  } catch (error) {
    console.error('Stop recording error:', error);
    Alert.alert('Error', 'Failed to stop description recording');
  }
};

const onStartPlayDescription = async () => {
  try {
    await audioRecorderPlayer.startPlayer(recordedFilePathe);
    audioRecorderPlayer.addPlayBackListener((e) => {
      if (e.currentPosition === e.duration) {
        audioRecorderPlayer.removePlayBackListener();
        setPlayinge(false);
      }
    });
    setPlayinge(true);
    console.log('Playing description:', recordedFilePathe);
  } catch (error) {
    console.error('Playback error:', error);
    Alert.alert('Error', 'Failed to play description recording');
  }
};

const onStopPlayDescription = async () => {
  try {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setPlayinge(false);
  } catch (error) {
    console.error('Stop playback error:', error);
  }
};

  const onStartRecord = async () => {
    const permission = await requestPermission();
    if (!permission) {
      Alert.alert("Permission denied", "The app needs permission to record audio.");
      return;
    }

    const path = Platform.select({
      ios: 'audio.m4a',
      android: undefined, // Android will use default path
    });

    try {
      const uri = await audioRecorderPlayer.startRecorder(path);
      setRecordedFilePath(uri);
      setRecording(true);
      console.log('Recording at:', uri);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const onStopRecord = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecording(false);
      console.log('Recording finished:', result);
      
      // Show loading message
      setTranscribedText('Processing transcription...');
      
      // Upload and transcribe
      const transcription = await uploadAudio(result);
      if (transcription) {
        setTranscribedText(transcription);
      } else {
        setTranscribedText('Transcription failed');
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const onStartPlay = async () => {
    try {
      await audioRecorderPlayer.startPlayer(recordedFilePath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.removePlayBackListener();
          setPlaying(false);
        }
      });
      setPlaying(true);
      console.log('Playing from:', recordedFilePath);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setPlaying(false);
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  return {
  titleRecording, 
  setTitleRecording,
  titleRecordedFilePath, 
  setTitleRecordedFilePath,
  titlePlaying, 
  setTitlePlaying, 
  titleTranscribedText, 
  setTitleTranscribedText,
  recording, 
  setRecording,
  recordedFilePath, 
  setRecordedFilePath,
  playing, 
  setPlaying,
  transcribedText, 
  setTranscribedText,
  recordinge, 
  setRecordinge,
  recordedFilePathe, 
  setRecordedFilePathe,
  playinge, 
  setPlayinge,
  transcribedTexte, 
  setTranscribedTexte,
  onStopPlay,
  onStartPlay,
  onStopRecord,
  onStartRecord,
  requestPermission,
  onStartRecordDescription,
  onStopRecordDescription,
  onStartPlayDescription,
  onStopPlayDescription
};

}

export default Audio
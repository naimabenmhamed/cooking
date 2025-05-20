import React, { useState, useEffect } from 'react';
import { View, Button, Text, Platform, PermissionsAndroid, Alert, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from './Tranc';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioScreen = () => {
  const [recording, setRecording] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState('');
  const [playing, setPlaying] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  // Cleanup resources when component unmounts
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

  const onStartRecord = async () => {
    const permission = await requestPermission();
    if (!permission) {
      Alert.alert("Permission denied", "The app needs permission to record audio.");
      return;
    }

    const path = Platform.select({
      ios: 'audio.mp3',
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Recorder</Text>
      
      {!recording ? (
        <Button title="🎤 Start Recording" onPress={onStartRecord} />
      ) : (
        <Button title="⏹ Stop Recording" onPress={onStopRecord} />
      )}

      <View style={styles.spacer} />

      {recordedFilePath !== '' && !playing && (
        <Button title="▶ Play Recording" onPress={onStartPlay} />
      )}
      
      {playing && (
        <Button title="⏹ Stop Playback" onPress={onStopPlay} />
      )}

      {recordedFilePath !== '' && (
        <Text style={styles.fileInfo}>Audio file: {recordedFilePath}</Text>
      )}
      
      {transcribedText && (
        <View style={styles.transcriptionContainer}>
          <Text style={styles.transcriptionTitle}>Transcription:</Text>
          <Text style={styles.transcriptionText}>{transcribedText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: 'bold',
  },
  spacer: {
    height: 15,
  },
  fileInfo: {
    marginTop: 15,
    fontSize: 12,
    color: '#666',
  },
  transcriptionContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  transcriptionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transcriptionText: {
    fontSize: 16,
  }
});

export default AudioScreen;
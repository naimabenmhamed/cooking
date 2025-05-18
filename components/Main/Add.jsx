import React, { Component ,useState,useEffect} from 'react'
import { StyleSheet ,Button,Text,View,TextInput,TouchableOpacity,ScrollView ,Platform, PermissionsAndroid , Alert} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from './Tranc';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function Add() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // États séparés pour le titre
  const [titleRecording, setTitleRecording] = useState(false);
  const [titleRecordedFilePath, setTitleRecordedFilePath] = useState('');
  const [titlePlaying, setTitlePlaying] = useState(false);
  const [titleTranscribedText, setTitleTranscribedText] = useState('');
  
  // États séparés pour la description
  const [descRecording, setDescRecording] = useState(false);
  const [descRecordedFilePath, setDescRecordedFilePath] = useState('');
  const [descPlaying, setDescPlaying] = useState(false);
  const [descTranscribedText, setDescTranscribedText] = useState('');

  useEffect(() => {
    return () => {
      if (titleRecording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (titlePlaying) {
        audioRecorderPlayer.stopPlayer();
      }
      if (descRecording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (descPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, [titleRecording, titlePlaying, descRecording, descPlaying]);

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

  const onStartRecord = async (forTitle) => {
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
      if (forTitle) {
        setTitleRecordedFilePath(uri);
        setTitleRecording(true);
      } else {
        setDescRecordedFilePath(uri);
        setDescRecording(true);
      }
      console.log('Recording at:', uri);
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const onStopRecord = async (forTitle) => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      if (forTitle) {
        setTitleRecording(false);
        setTitleTranscribedText('Processing transcription...');
        const transcription = await uploadAudio(result);
        setTitleTranscribedText(transcription || 'Transcription failed');
      } else {
        setDescRecording(false);
        setDescTranscribedText('Processing transcription...');
        const transcription = await uploadAudio(result);
        setDescTranscribedText(transcription || 'Transcription failed');
      }
      console.log('Recording finished:', result);
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const onStartPlay = async (forTitle) => {
    try {
      const filePath = forTitle ? titleRecordedFilePath : descRecordedFilePath;
      await audioRecorderPlayer.startPlayer(filePath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          audioRecorderPlayer.removePlayBackListener();
          if (forTitle) {
            setTitlePlaying(false);
          } else {
            setDescPlaying(false);
          }
        }
      });
      if (forTitle) {
        setTitlePlaying(true);
      } else {
        setDescPlaying(true);
      }
      console.log('Playing from:', filePath);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  const onStopPlay = async (forTitle) => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      if (forTitle) {
        setTitlePlaying(false);
      } else {
        setDescPlaying(false);
      }
    } catch (error) {
      console.error('Stop playback error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>أضف وصفة جديدة</Text>
        <View style={styles.from}>
          {/* Section Titre */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>عنوان</Text>
            {titleRecordedFilePath !== '' && !titlePlaying && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStartPlay(true)}>
                <Icon name="volume-mute-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {titlePlaying && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={() => onStopPlay(true)}>
                <Icon name="volume-high-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {!titleRecording ? (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStartRecord(true)}>
                <Icon name="mic-outline" size={43} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStopRecord(true)}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="أدخل عنوانًا"
          />

          {/* Section Description */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>وصف</Text>
            {descRecordedFilePath !== '' && !descPlaying && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStartPlay(false)}>
                <Icon name="volume-mute-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {descPlaying && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={() => onStopPlay(false)}>
                <Icon name="volume-high-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {!descRecording ? (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStartRecord(false)}>
                <Icon name="mic-outline" size={43} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStopRecord(false)}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="أدخل وصفًا"
            multiline
            numberOfLines={5}
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>يضيف</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  from: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 578,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#E1B055',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
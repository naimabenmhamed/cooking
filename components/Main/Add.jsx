import React, { Component ,useState,useEffect} from 'react'
import { StyleSheet ,Button,Text,View,TextInput,TouchableOpacity,ScrollView ,Platform, PermissionsAndroid , Alert} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from './Tranc';


const audioRecorderPlayer = new AudioRecorderPlayer();

export default function  Add (){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedFilePath, setRecordedFilePath] = useState('');
  const [playing, setPlaying] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

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


    return (
      <View  style={styles.container}>
        <ScrollView>
        <Text  style={styles.title} >أضف وصفة جديدة</Text>
      <View style={styles.from}>
       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={styles.label}>عنوان</Text>
        {recordedFilePath !== '' && !playing && (
                <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
             height: 50}}  onPress={onStartPlay}>
       <Icon name="volume-mute-outline" size={43} color="#999"/>
       
        </TouchableOpacity>
              )}
              
              {playing && (
                 <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
             height: 50}} onPress={onStopPlay}>
       <Icon name="volume-high-outline" size={43} color="#999"/>
        </TouchableOpacity>
              )}

        {!recording ? (
        <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
           height: 50}}  onPress={onStartRecord}>
          <Icon name="mic-outline" size={43} color="#999" />
        </TouchableOpacity>

              ) : (

        <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
           height: 50}}  onPress={onStopRecord}>
        <Icon name="ellipsis-horizontal-outline"size={43} color="#999" />
        </TouchableOpacity>

              )}
       
        </View>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="أدخل عنوانًا"
        />

         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={styles.label}>وصف</Text>
        
          {recordedFilePath !== '' && !playing && (
                <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
             height: 50}}  onPress={onStartPlay}>
       <Icon name="volume-mute-outline" size={43} color="#999"/>
       
        </TouchableOpacity>
              )}
              
              {playing && (
                 <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
             height: 50}} onPress={onStopPlay}>
       <Icon name="volume-high-outline" size={43} color="#999"/>
        </TouchableOpacity>
              )}

        {!recording ? (
        <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
           height: 50}}  onPress={onStartRecord}>
          <Icon name="mic-outline" size={43} color="#999" />
        </TouchableOpacity>

              ) : (

        <TouchableOpacity style={{backgroundColor:"#FBD38D" ,borderRadius: 20, padding: 4,  width: 50,
           height: 50}}  onPress={onStopRecord}>
        <Icon name="ellipsis-horizontal-outline"size={43} color="#999" />
        </TouchableOpacity>

              )}
        </View>
        <TextInput
          style={[styles.input ,styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="أدخل وصفًا"
          multiline
          numberOfLines={5}
        />
        <TouchableOpacity 
          style={styles.button}
         >
          <Text style={styles.buttonText}>يضيف</Text>

            
        </TouchableOpacity>
        
      </View>
      </ScrollView>
        </View>
    )
  }
const styles=StyleSheet.create({
  container:{
    flex:1,
    padding:14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  from:{
    backgroundColor:'#f8f8f8',
    padding:15 ,
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


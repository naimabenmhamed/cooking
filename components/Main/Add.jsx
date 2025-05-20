import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, PermissionsAndroid, Alert, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { uploadAudio } from './Tranc';
import { CommonActions } from '@react-navigation/native';
import { saveNotes } from '../services/saveNotes';
import {Audio } from '../hooks/Audio';
const audioRecorderPlayer = new AudioRecorderPlayer();

export default function Add({ navigation, route }) {
  


  const {
     idToUpdate,
    title,
    setTitle,
    description,
    setDescription,
    setIdToUpdate,
    initialTitle,
    setInitialTitle,
    initialDescription,
    setInitialDescription,
    handleAddOrUpdate,
    loading,
  } = saveNotes(route, navigation);
  // États pour l'audio
 

 const {
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
  } = Audio(route, navigation);

const handleCancelEdit = () => {
  setIdToUpdate(null);
  setTitle('');
  setDescription('');
  setInitialTitle('');
  setInitialDescription('');
  navigation.goBack(); // ou navigation.navigate('ToNotes') si vous voulez rediriger
};

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>أضف وصفة جديدة</Text>
        <View style={styles.from}>
          {/* Section Titre */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>عنوان</Text>
            {recordedFilePath !== '' && !playing &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlay}>
                <Icon name="volume-mute-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {playing &&(
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlay}>
                <Icon name="volume-high-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {!recording ? (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecord}>
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
            {recordedFilePathe !== '' && !playinge &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlayDescription}>
                <Icon name="volume-mute-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {playinge && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlayDescription}>
                <Icon name="volume-high-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {!recordinge ?  (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecordDescription}>
                <Icon name="mic-outline" size={43} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStopRecordDescription}>
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
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAddOrUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'جاري الحفظ...' : (idToUpdate ? 'تعديل' : 'إضافة')}
            </Text>
          </TouchableOpacity>
          { idToUpdate && (
           <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancelEdit}
          >
           <Text style={styles.cancelButtonText}>إلغاء</Text>
             </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
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
  cancelButton: {
  backgroundColor: '#ccc',
  marginTop: 10,
},
cancelButtonText: {
  color: '#333',
  fontWeight: 'bold',
  fontSize: 16,
},
});
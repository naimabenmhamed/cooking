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
import styles from '../Styles/Add.styles';
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
    ingredient,
    setIngredient,
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
  onStopPlayDescription,
  onStartRecordIngredient,
  onStopRecordIngredient,
  onStartPlayIngredient,
  onStopPlayIngredient,
  recordinges, 
  setRecordinges,
  recordedFilePathes, 
  setRecordedFilePathes,
  playinges, 
  setPlayinges,
  transcribedTextes, 
  setTranscribedTextes,
  visibility,            // <= ajoute ceci
  setVisibility 
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
             placeholderTextColor="#999" 
          />

          {/* Section ingredient */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>مكونات</Text>
            {recordedFilePathes !== '' && !playinges &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlayIngredient}>
                <Icon name="volume-mute-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {playinges && (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlayIngredient}>
                <Icon name="volume-high-outline" size={43} color="#999"/>
              </TouchableOpacity>
            )}
            {!recordinges ?  (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecordIngredient}>
                <Icon name="mic-outline" size={43} color="#999" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#FBD38D", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStopRecordIngredient}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ingredient}
            onChangeText={setIngredient}
            placeholder="أدخل وصفًا"
             placeholderTextColor="#999" 
            multiline
            numberOfLines={5}
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
             placeholderTextColor="#999" 
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
          { (idToUpdate || title.trim() !== '' || ingredient.trim() !== '' || description.trim() !== '') && (
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancelEdit}
  >
         <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
)}
<Text style={styles.label}>الخصوصية</Text>
<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibility === 'private' && styles.visibilityButtonSelected,
    ]}
    onPress={() => setVisibility('private')}
  >
    <Text style={visibility === 'private' ? styles.visibilityTextSelected : styles.visibilityText}>
      خاصة
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibility === 'public' && styles.visibilityButtonSelected,
    ]}
    onPress={() => setVisibility('public')}
  >
    <Text style={visibility === 'public' ? styles.visibilityTextSelected : styles.visibilityText}>
      عامة
    </Text>
  </TouchableOpacity>
</View>


        </View>
      </ScrollView>
    </View>
  );
}


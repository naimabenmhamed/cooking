import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, PermissionsAndroid, Alert, Keyboard, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
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
    imageBase64,
    setImageBase64,
    selectImage

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
        <Text style={styles.title}>Nouvelle lesson</Text>
        <View style={styles.from}>
          {/* Section Titre */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>Titre</Text>
            {recordedFilePath !== '' && !playing &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlay}>
                <Icon name="volume-mute-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {playing &&(
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlay}>
                <Icon name="volume-high-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {!recording ? (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecord}>
                <Icon name="mic-outline" size={43} color="#444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={() => onStopRecord(true)}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#444" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Entrer le Titre"
             placeholderTextColor="#999" 
          />

          {/* Section ingredient */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>Leçon</Text>
            {recordedFilePathes !== '' && !playinges &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlayIngredient}>
                <Icon name="volume-mute-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {playinges && (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlayIngredient}>
                <Icon name="volume-high-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {!recordinges ?  (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecordIngredient}>
                <Icon name="mic-outline" size={43} color="#444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStopRecordIngredient}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#444" />
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={ingredient}
            onChangeText={setIngredient}
            placeholder="Entrer le Leçon"
             placeholderTextColor="#999" 
            multiline
            numberOfLines={5}
          />

             {/* Section Description */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={styles.label}>résumé</Text>
            {recordedFilePathe !== '' && !playinge &&  (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartPlayDescription}>
                <Icon name="volume-mute-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {playinge && (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}} 
                onPress={onStopPlayDescription}>
                <Icon name="volume-high-outline" size={43} color="#555"/>
              </TouchableOpacity>
            )}
            {!recordinge ?  (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStartRecordDescription}>
                <Icon name="mic-outline" size={43} color="#444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={{backgroundColor:"#1E90FF", borderRadius: 20, padding: 4, width: 50, height: 50}}  
                onPress={onStopRecordDescription}>
                <Icon name="ellipsis-horizontal-outline" size={43} color="#444" />
              </TouchableOpacity>
            )}
          </View>
            <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Entrer le résumé"
             placeholderTextColor="#999" 
            multiline
            numberOfLines={5}
          />

            <TouchableOpacity onPress={selectImage} style={[styles.button, { marginTop: 10 }]}>
                <Text style={styles.buttonText}> Choisir la photo </Text>
            </TouchableOpacity>

          {imageBase64 && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
            style={{ width: '100%', height: 200, marginTop: 10, borderRadius: 10 }}
            resizeMode="cover"
          />
          )}



          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAddOrUpdate}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Enregistrement en cours...' : (idToUpdate ? 'Modifier' : 'Ajouter')}
            </Text>
          </TouchableOpacity>
          { (idToUpdate || title.trim() !== '' || ingredient.trim() !== '' || description.trim() !== '') && (
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancelEdit}
  >
         <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
)}
<Text style={styles.label}>Confidentialité</Text>
<View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibility === 'private' && styles.visibilityButtonSelected,
    ]}
    onPress={() => setVisibility('private')}
  >
    <Text style={visibility === 'private' ? styles.visibilityTextSelected : styles.visibilityText}>
Privée    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.visibilityButton,
      visibility === 'public' && styles.visibilityButtonSelected,
    ]}
    onPress={() => setVisibility('public')}
  >
    <Text style={visibility === 'public' ? styles.visibilityTextSelected : styles.visibilityText}>
     Publique 
    </Text>
  </TouchableOpacity>
</View>


        </View>
      </ScrollView>
    </View>
  );
}


import React,{useState} from 'react'
import firestore from '@react-native-firebase/firestore'
import auth from '@react-native-firebase/auth'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, PermissionsAndroid, Alert, Keyboard,Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Add from './Add';

export default function AfficherNotes ({route,navigation}){

  const { note, fromHome } = route.params;
  const currentUser = auth().currentUser;
  
  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Aucune donnée à afficher</Text>
      </View>
    );
  }

  // Vérifier si l'utilisateur actuel est le propriétaire de la note
  const isOwner = currentUser && (note.userId === currentUser.uid || note.sharedBy === currentUser.uid);

  const handleDeleteText = async (id) => {
    try {
      await firestore().collection('notes').doc(id).delete();
      Alert.alert("Supprimé", "La note a été supprimée.");
      navigation.goBack(); // Retour à la liste
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handlePublish = async () => {
    try {
      await firestore().collection('notes').doc(note.id).update({
        visibility: 'public',
      });
      Alert.alert('Publication réussie', 'La recette a été publiée avec succès.');
      navigation.goBack();
      } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite lors de la publication.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {note.userName && (
  <Text style={[styles.label, { fontSize: 20, textAlign: 'center', marginBottom: 10 }]}>
    {note.userName}
  </Text>
)}

    <Text style={styles.label}>Titre</Text>
    <Text style={styles.text}>{note.title}</Text>

    <Text style={styles.label}>Leçon</Text>
    <Text style={styles.text}>{note.ingredient || 'Aucun ingrédient'}</Text>

    {/* Afficher le bouton "Publier" seulement si l'utilisateur est le propriétaire et la note n'est pas publique */}
    {isOwner && note.visibility !== 'public' && (
      <TouchableOpacity style={styles.button} onPress={handlePublish}>
        <Text style={styles.buttonText}>Publier la recette</Text>
      </TouchableOpacity>
    )}
      
    {note.image && (
      <Image
        source={{ uri: `data:image/jpeg;base64,${note.image}` }}
        style={{ width: '100%', height: 200, marginTop: 20, borderRadius: 10 }}
        resizeMode="cover"
      />
    )}

    {/* Afficher le bouton "Modifier" seulement si l'utilisateur est le propriétaire et pas depuis Home */}
    {isOwner && !fromHome && (
      <TouchableOpacity
        onPress={() => navigation.navigate('Add', {
          id: note.id,
          title: note.title,
          description: note.description
        })}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Modifier</Text>
      </TouchableOpacity>
    )}

    <Text style={styles.noteDate}>
      {note.createdAt?.toDate?.().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) ?? ''}
    </Text>
    
    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>PDF</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>ZIP</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button}>
      <Text style={styles.buttonText}>Resumer</Text>
    </TouchableOpacity>

    {/* Afficher le bouton "Supprimer" seulement si l'utilisateur est le propriétaire */}
    {isOwner && (
      <TouchableOpacity
        onPress={() => handleDeleteText(note.id)}
        style={styles.deleteButton}
      >
        <Icon name="trash-outline" size={19} color="#999" />
      </TouchableOpacity>
    )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
    lineHeight: 24,
    backgroundColor: '#f6f6f6',
    padding: 10,
    borderRadius: 8,
  },
  noteView: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: -9, 
    padding: 45,
    borderRadius: 10,
    shadowColor: '#FBD38D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 10,
     width: '100%',
     marginHorizontal: 0,
  },

  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    flexShrink: 1
  },
  noteText: {
    fontSize: 14,
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
    position :'absolute',
    bottom: 10, 
    left: '50%',
    transform: [{ translateX: -50 }],
  },
  deleteButton: {
    backgroundColor: '#E0FFFF',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
    width: '20%',
  },
  fletlisteStyle:{
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
     flex: 1,
    padding: 10,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
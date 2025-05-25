import React,{useState} from 'react'
import firestore from '@react-native-firebase/firestore'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Platform, PermissionsAndroid, Alert, Keyboard,Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Add from './Add';
export default function AfficherNotes ({route,navigation}){

  const { note } = route.params;
  

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red' }}>Aucune donnée à afficher</Text>
      </View>
    );
  }

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
      Alert.alert('تم النشر', 'تم نشر الوصفة بنجاح.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء النشر.');
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>العنوان</Text>
      <Text style={styles.text}>{note.title}</Text>

      <Text style={styles.label}>المكونات</Text>
      <Text style={styles.text}>{note.ingredient || 'لا توجد مكونات'}</Text>

      <Text style={styles.label}>الوصف</Text>
      <Text style={styles.text}>{note.description || 'لا يوجد وصف'}</Text>

      {note.visibility !== 'public' && (
        <TouchableOpacity style={styles.button} onPress={handlePublish}>
          <Text style={styles.buttonText}>نشر الوصفة</Text>
        </TouchableOpacity>
      )}
      
        {note.image && (
  <Image
    source={{ uri: `data:image/jpeg;base64,${note.image}` }}
    style={{ width: '100%', height: 200, marginTop: 20, borderRadius: 10 }}
    resizeMode="cover"
  />
)}




       <TouchableOpacity
      onPress={() => navigation.navigate('Add', {
      id: note.id,
      title: note.title,
      description: note.description
      })}
      style={styles.button}
      >
        <Text  style={styles.buttonText}> تعديل</Text>
      </TouchableOpacity>
      <Text style={styles.noteDate}>
      {note.createdAt?.toDate?.().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) ?? ''}
    </Text>
    <TouchableOpacity
      onPress={() => handleDeleteText(note.id)}
      style={styles.deleteButton}
    >
      <Icon name="trash-outline" size={19} color="#999" />
    </TouchableOpacity>
     


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
    marginHorizontal: 8, // Espace entre les colonnes (horizontal)
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
    left: '50%',      // positionne le coin gauche du texte au milieu
    transform: [{ translateX: -50 }],
  },
  deleteButton: {
    backgroundColor: '#FBD38D',
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
    backgroundColor: '#F6AD55',
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
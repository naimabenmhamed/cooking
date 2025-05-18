import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export default function ToNotes() {
  const [texts, setTexts] = useState([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserTexts = async () => {
      const currentUser = auth().currentUser;

      if (currentUser) {
        try {
          const querySnapshot = await firestore()
  .collection('notes')
  .where('userId', '==', currentUser.uid)
  .get();

            
          const userTexts = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })).sort((a, b) => b.createdAt - a.createdAt);
          setTexts(userTexts);
        } catch (error) {
          console.error("Erreur lors de la récupération :", error);
        }
      }
    };

    if (isFocused) {
      fetchUserTexts();
    }
  }, [isFocused]);

  const handleDeleteText = async (id) => {
    try {
      await firestore().collection('notes').doc(id).delete();
      setTexts(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const formatDate = (firebaseDate) => {
    if (!firebaseDate || !firebaseDate.toDate) return '';
    const d = firebaseDate.toDate();
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={texts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Add', {
              id: item.id,
              title: item.title,
              description: item.description
            })}
          >
            <View style={styles.noteView}>
              <Text style={styles.noteTitle}>{item.title}</Text>
              <Text style={styles.noteText}>{item.description}</Text>
              <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteText(item.id)}
                style={styles.deleteButton}
              >
                <Text style={{ color: 'white' }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#c9f5d9',
    padding: 10,
  },
  noteView: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    elevation: 4,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    marginBottom: 5,
  },
  noteDate: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: 'crimson',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
    width: '30%',
  },
});
// Home.js - Composant pour afficher les notes publiques aléatoires
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React, { useEffect, useState } from "react";
import Icon from 'react-native-vector-icons/Ionicons';

export default function Home({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const openNote = (note) => {
  navigation.navigate('AfficherNotes', { note, fromHome: true });
};

  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('CreatAccont');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  useEffect(() => {
  const unsubscribe = firestore()
    .collection('notes')
    .where('visibility', '==', 'public')
    .onSnapshot(snapshot => {
      let fetchedNotes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Mélanger les notes aléatoirement
      fetchedNotes = fetchedNotes.sort(() => 0.5 - Math.random());

      setNotes(fetchedNotes);
      setLoading(false);
    }, error => {
      console.error('Erreur lors de l’écoute des notes :', error);
      Alert.alert('Erreur', 'Impossible de charger les notes publiques');
      setLoading(false);
    });

  // Nettoyage du listener lors du démontage du composant
  return () => unsubscribe();
}, []);



const renderItem = ({ item }) => {
  const currentUser = auth().currentUser;
  const hasLiked = item.likes?.includes(currentUser?.uid);

  const toggleLike = async () => {
    if (!currentUser) return;

    const noteRef = firestore().collection('notes').doc(item.id);

    try {
      await firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(noteRef);
        if (!doc.exists) return;

        const data = doc.data();
        const likes = data.likes || [];

        if (likes.includes(currentUser.uid)) {
          // retirer like
          transaction.update(noteRef, {
            likes: firestore.FieldValue.arrayRemove(currentUser.uid),
          });
        } else {
          // ajouter like
          transaction.update(noteRef, {
            likes: firestore.FieldValue.arrayUnion(currentUser.uid),
          });
        }
      });

      // mettre à jour localement
      setNotes(prev =>
        prev.map(n =>
          n.id === item.id
            ? {
                ...n,
                likes: hasLiked
                  ? n.likes.filter(id => id !== currentUser.uid)
                  : [...(n.likes || []), currentUser.uid],
              }
            : n
        )
      );
    } catch (error) {
      console.error("Erreur lors du like :", error);
    }
  };

  return (
    <TouchableOpacity onPress={() => openNote(item)} style={styles.noteItem}>
      <Text style={styles.userName}>{item.userName || "Utilisateur inconnu"}</Text>
      <Text style={styles.noteTitle}>{item.title}</Text>
      {/* <Text style={styles.noteContent}>{item.description}</Text> */}
      {item.ingredient && (
        <Text style={styles.noteIngredient}>{item.leçon}</Text>
      )}

      {/* Bouton Like */}
      <TouchableOpacity onPress={toggleLike} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Icon name={hasLiked ? "heart" : "heart-outline"} size={18} color="red" />
        <Text style={{ marginLeft: 5 }}>{item.likes?.length || 0}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
const filteredNotes = notes.filter(note =>
  note.title?.toLowerCase().includes(searchQuery.toLowerCase())
);



  return (
    <View style={styles.container}>
      <TextInput
  placeholder="Trouver le titre de la note"
  placeholderTextColor="#999"
  style={styles.input}
  value={searchQuery}
  onChangeText={setSearchQuery}
/>


      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" />
      ) : notes.length > 0 ? (
       <FlatList
  data={filteredNotes}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  showsVerticalScrollIndicator={false}
/>

      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune note publique disponible</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: '#E0FFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderColor: '#3B82F6',
    borderWidth: 1,
    color: '#000',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noteItem: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userName: {
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 5,
    fontSize: 14,
  },
  noteTitle: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    fontSize: 16,
  },
  noteContent: {
    color: '#333',
    lineHeight: 20,
    marginBottom: 5,
  },
  noteIngredient: {
    color: '#6B7280',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
  },
});
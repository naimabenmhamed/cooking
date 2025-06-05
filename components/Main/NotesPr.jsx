import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React,{useState,useEffect} from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import AfficherNotes from './AfficherNotes'
export default function  NotesPr() {
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
          })).filter(note => note.visibility === 'public').sort((a, b) => b.createdAt - a.createdAt);
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
        style={{paddingBottom: 80}}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AfficherNotes',  { note: item })}
            style={styles.fletlisteStyle}
          >
            <View style={styles.noteView}>
              <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
              {/* <Text style={styles.noteText} numberOfLines={2}>{item.description}</Text> */}
              <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteText(item.id)}
                style={styles.deleteButton}
              >
                {/* <Text style={{ color: 'white' }}>Supprimer</Text> */}
                <Icon name="trash-outline" size={19} color="#999" />
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
    paddingHorizontal: 10,
    
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
  }
});

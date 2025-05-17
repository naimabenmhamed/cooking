import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function AddToChat() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  const fetchUsers = async (search) => {
    if (search.trim() === '') {
      setUsers([]);
      return;
    }
    
    try {
      const snapshot = await Firestore()
        .collection('users')
        .where('nom', '>=', search)
        .where('nom', '<=', search + '\uf8ff')
        .get();

      const usersData = snapshot.docs
        .filter(doc => doc.id !== currentUser?.uid)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const startChat = async (user) => {
    try {
      // Créez un ID de chat standardisé
      const ids = [currentUser.uid, user.id].sort();
      const chatId = `chat_${ids.join('_')}`;
      
      const db = Firestore();
      const chatRef = db.collection('chats').doc(chatId);

      // Vérifiez si le chat existe déjà
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        await chatRef.set({
          participants: [currentUser.uid, user.id],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'Moi',
            [user.id]: user.nom
          },
          createdAt: Firestore.FieldValue.serverTimestamp(),
          updatedAt: Firestore.FieldValue.serverTimestamp(),
          lastMessage: "",
          lastMessageSender: ""
        });
      }

      // Naviguez vers le chat
      navigation.navigate('Chat2p', { 
        recipientId: user.id,
        recipientName: user.nom 
      });

    } catch (error) {
      console.error("Error starting chat:", error);
      Alert.alert("Erreur", "Impossible de démarrer la conversation");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder='Rechercher un utilisateur...' 
        onChangeText={fetchUsers}
      />
      
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => startChat(item)}
          >
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.nom?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.userName}>{item.nom}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucun utilisateur trouvé
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    backgroundColor: '#FFF5F0',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderColor: '#E1B055',
    borderWidth: 1,
    color: '#000',
    fontSize: 14,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1B055',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
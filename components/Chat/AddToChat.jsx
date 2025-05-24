import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function AddToChat() {
  const [users, setUsers] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  useEffect(() => {
    // Charger des utilisateurs aléatoires au démarrage
    const fetchRandomUsers = async () => {
      try {
        const snapshot = await Firestore().collection('users').get();
        const userList = snapshot.docs
          .filter(doc => doc.id !== currentUser?.uid)
          .map(doc => ({ id: doc.id, ...doc.data() }));
        const shuffled = userList.sort(() => 0.5 - Math.random());
        setRandomUsers(shuffled.slice(0, 10)); // max 10 aléatoires
      } catch (error) {
        console.error("Erreur chargement utilisateurs aléatoires :", error);
      }
    };

    fetchRandomUsers();
  }, []);

  const fetchUsers = async (searchText) => {
    setSearch(searchText);

    if (searchText.trim() === '') {
      setUsers([]);
      return;
    }

    try {
      const snapshot = await Firestore()
        .collection('users')
        .where('nom', '>=', searchText)
        .where('nom', '<=', searchText + '\uf8ff')
        .get();

      const usersData = snapshot.docs
        .filter(doc => doc.id !== currentUser?.uid)
        .map(doc => ({ id: doc.id, ...doc.data() }));

      setUsers(usersData);
    } catch (error) {
      console.error("Erreur recherche utilisateurs :", error);
    }
  };

  const startChat = async (user) => {
    try {
      const ids = [currentUser.uid, user.id].sort();
      const chatId = `chat_${ids.join('_')}`;
      const chatRef = Firestore().collection('chats').doc(chatId);
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

      navigation.navigate('Chat2p', {
        recipientId: user.id,
        recipientName: user.nom
      });

    } catch (error) {
      console.error("Erreur démarrage chat :", error);
      Alert.alert("Erreur", "Impossible de démarrer la conversation");
    }
  };

  const dataToDisplay = search.trim() === '' ? randomUsers : users;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder='Rechercher un utilisateur...'
        onChangeText={fetchUsers}
      />

      <FlatList
        data={dataToDisplay}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
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
            Chargement...
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

import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function AddToChat() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  // Fonction pour vérifier et récupérer les amis
  const fetchFriends = async () => {
    try {
      const friendsSnapshot = await Firestore()
        .collection('friends')
        .where('users', 'array-contains', currentUser?.uid)
        .get();

      const friendsList = await Promise.all(
        friendsSnapshot.docs.map(async (doc) => {
          const friendData = doc.data();
          const friendId = friendData.users.find(uid => uid !== currentUser?.uid);
          
          // Récupérer les infos de l'ami
          try {
            const userDoc = await Firestore().collection('users').doc(friendId).get();
            if (userDoc.exists) {
              return {
                id: friendId,
                ...userDoc.data()
              };
            }
          } catch (error) {
            console.error("Erreur récupération ami:", error);
          }
          return null;
        })
      );

      const validFriends = friendsList.filter(friend => friend !== null);
      setFriends(validFriends);
    } catch (error) {
      console.error("Erreur chargement amis :", error);
    }
  };

  useEffect(() => {
    fetchFriends();
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

  // Fonction pour vérifier si un utilisateur est ami
  const checkIsFriend = async (userId) => {
    try {
      const friendDoc = await Firestore()
        .collection('friends')
        .doc(`${currentUser.uid}_${userId}`)
        .get();
      
      return friendDoc.exists;
    } catch (error) {
      console.error("Erreur vérification ami:", error);
      return false;
    }
  };

  // Fonction pour ajouter un ami
  const addFriend = async (user) => {
    try {
      const ids = [currentUser.uid, user.id].sort();
      const friendId = `${ids.join('_')}`;
      
      await Firestore().collection('friends').doc(friendId).set({
        users: [currentUser.uid, user.id],
        userNames: {
          [currentUser.uid]: currentUser.displayName || 'Moi',
          [user.id]: user.nom
        },
        createdAt: Firestore.FieldValue.serverTimestamp()
      });

      Alert.alert("Succès", `${user.nom} a été ajouté à vos amis!`);
      fetchFriends(); // Actualiser la liste des amis
    } catch (error) {
      console.error("Erreur ajout ami:", error);
      Alert.alert("Erreur", "Impossible d'ajouter cet ami");
    }
  };

  const startChat = async (user) => {
    try {
      // Vérifier si l'utilisateur est ami
      const isFriend = await checkIsFriend(user.id);
      
      if (!isFriend) {
        Alert.alert(
          "Utilisateur non ami", 
          `${user.nom} n'est pas dans votre liste d'amis. Voulez-vous l'ajouter?`,
          [
            { text: "Annuler", style: "cancel" },
            { text: "Ajouter", onPress: () => addFriend(user) }
          ]
        );
        return;
      }

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

  const dataToDisplay = search.trim() === '' ? friends : users;

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChat(item)}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {item.nom?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.nom}</Text>
        {search.trim() !== '' && (
          <TouchableOpacity 
            style={styles.addFriendButton}
            onPress={() => addFriend(item)}
          >
            <Icon name="person-add-outline" size={20} color="#1E90FF" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={search.trim() === '' ? 'Rechercher un utilisateur...' : 'Rechercher pour ajouter un ami...'}
        onChangeText={fetchUsers}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {search.trim() === '' ? 'Mes Amis' : 'Résultats de recherche'}
        </Text>
      </View>

      <FlatList
        data={dataToDisplay}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {search.trim() === '' ? 'Aucun ami trouvé' : 'Chargement...'}
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
    backgroundColor: ' #E0FFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderColor: '#1E90FF',
    borderWidth: 1,
    color: '#000',
    fontSize: 14,
  },
  sectionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  addFriendButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
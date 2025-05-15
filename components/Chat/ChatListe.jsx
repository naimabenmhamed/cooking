import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  // Charger les conversations existantes
  useEffect(() => {
    const unsubscribe = Firestore()
      .collection('users')
      .doc(currentUser.uid)
      .collection('chats')
      .orderBy('updatedAt', 'desc')
      .onSnapshot(snapshot => {
        const chatsData = [];
        snapshot.forEach(doc => {
          chatsData.push({ id: doc.id, ...doc.data() });
        });
        setChats(chatsData);
      });

    return unsubscribe;
  }, []);

  const fetchUsers = (search) => {
    if (search.trim() === '') {
      setUsers([]);
      setSearchMode(false);
      return;
    }
    
    setSearchMode(true);
    Firestore()
      .collection('users')
      .where('nom', '>=', search)
      .where('nom', '<=', search + '\uf8ff')
      .get()
      .then((snapshot) => {
        const usersData = snapshot.docs
          .filter(doc => doc.id !== currentUser.uid) // Exclure l'utilisateur courant
          .map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersData);
      });
  };

  const startChat = (user) => {
    navigation.navigate('Chat2p', { 
      recipientId: user.id,
      recipientName: user.nom 
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat2p', {
        recipientId: item.withUserId,
        recipientName: item.withUserName
      })}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {item.withUserName.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatContent}>
        <Text style={styles.chatName}>{item.withUserName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      
      <View style={styles.chatMeta}>
        <Text style={styles.chatTime}>
          {item.updatedAt?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
        </Text>
        {item.lastMessage && <View style={styles.readIndicator} />}
      </View>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => startChat(item)}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {item.nom.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.userName}>{item.nom}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder='Rechercher un utilisateur...' 
        onChangeText={fetchUsers}
      />
      
      <FlatList
        data={searchMode ? users : chats}
        keyExtractor={(item) => item.id}
        renderItem={searchMode ? renderUserItem : renderChatItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchMode ? 'Aucun utilisateur trouvé' : 'Aucune conversation'}
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
    marginBottom: 16,
    borderColor: '#E1B055',
    borderWidth: 1,
    fontSize: 14,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  chatContent: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
  },
  readIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
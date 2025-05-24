import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  StatusBar,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AddToChat from './AddToChat';
const ChatList = () => {
  const [chats, setChats] = useState([]);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = firestore()
        .collection('chats')
        .where('users', 'array-contains', currentUser.uid)
        .onSnapshot(async (snapshot) => {
          const chatData = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();
            const otherUserId = data.users.find(uid => uid !== currentUser.uid);

            let otherUserInfo = { 
              displayName: 'Utilisateur inconnu',
              photoURL: null,
              status: 'en ligne' 
            };
            try {
              const userDoc = await firestore().collection('users').doc(otherUserId).get();
              if (userDoc.exists) {
                otherUserInfo = {
                  displayName: userDoc.data().displayName || otherUserInfo.displayName,
                  photoURL: userDoc.data().photoURL,
                  status: userDoc.data().status || otherUserInfo.status
                };
              }
            } catch (e) {
              console.log('Erreur en récupérant les infos utilisateur:', e);
            }

            return {
              id: doc.id,
              otherUserId,
              otherUserName: otherUserInfo.displayName,
              otherUserAvatar: otherUserInfo.photoURL,
              otherUserStatus: otherUserInfo.status,
              lastMessage: data.lastMessage || 'Pas encore de messages',
              timestamp: data.lastMessageTimestamp?.toDate() || new Date()
            };
          }));

          // Trier les chats par date du dernier message (du plus récent au plus ancien)
          chatData.sort((a, b) => b.timestamp - a.timestamp);
          setChats(chatData);
        });

      return () => unsubscribe();
    }, [currentUser.uid])
  );

  const goToChat = (chatId, otherUserId, otherUserName, otherUserAvatar) => {
    navigation.navigate('Chat2p', {
      chatId,
      otherUserId,
      otherUserName,
      otherUserAvatar
    });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Hier';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => goToChat(item.id, item.otherUserId, item.otherUserName, item.otherUserAvatar)}
    >
      <View style={styles.avatarContainer}>
        {item.otherUserAvatar ? (
          <Image source={{ uri: item.otherUserAvatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.otherUserName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={item.otherUserStatus === 'en ligne' ? styles.onlineBadge : styles.offlineBadge} />
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.otherUserName}</Text>
          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={chats.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Aucune conversation</Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('AddToChat')}>
        <Icon name="add-outline" size={30} color="#999" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    ...Platform.select({
      android: {
        elevation: 2,
      },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
    }),
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  offlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#9E9E9E',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#888',
  },
   chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FBD38D',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});

export default ChatList;
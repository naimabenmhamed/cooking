import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const ChatList = () => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = firestore()
      .collection('friends')
      .where('users', 'array-contains', currentUser.uid)
      .onSnapshot(async (snapshot) => {
        const friendsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const friendId = data.users.find(uid => uid !== currentUser.uid);
            
            // Récupérer les infos de l'ami
            const userDoc = await firestore().collection('users').doc(friendId).get();
            if (userDoc.exists) {
              return {
                id: friendId,
                name: userDoc.data().nom || userDoc.data().displayName || 'Ami',
                avatar: userDoc.data().photoURL || null,
                isOnline: userDoc.data().isOnline || false
              };
            }
            return null;
          })
        );

        setFriends(friendsData.filter(friend => friend !== null));
        setLoading(false);
      }, error => {
        console.error("Error fetching friends:", error);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const startChat = (friend) => {
    navigation.navigate('Chat2p', {
      recipientId: friend.id,
      recipientName: friend.name,
      otherUserAvatar: friend.avatar
    });
  };

  const renderFriend = ({ item }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => startChat(item)}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={item.isOnline ? styles.onlineBadge : styles.offlineBadge} />
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>
          {item.isOnline ? 'En ligne' : 'Hors ligne'}
        </Text>
      </View>
      
      <Icon name="chatbox-ellipses-outline" size={24} color="#E1B055" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement des amis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Amis</Text>
        <Text style={styles.subtitle}>
          {friends.length} ami{friends.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
     <FlatList
  data={friends}
  renderItem={renderFriend}
  keyExtractor={item => item.id}
  contentContainerStyle={friends.length === 0 ? styles.emptyContainer : null}
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Aucun ami trouvé</Text>
      <Text style={styles.emptySubText}>
        Ajoutez des amis pour commencer à chatter
      </Text>
    </View>
  }
/>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('AddToChat')}
      >
        <Icon name="person-add-outline" size={30} color="white" />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: '#E1B055',
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
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
  },
  friendStatus: {
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
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#aaa',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1E90FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default ChatList;
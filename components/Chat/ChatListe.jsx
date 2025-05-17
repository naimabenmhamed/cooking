import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const currentUser = auth().currentUser;
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!currentUser || !isFocused) return;

    setLoading(true);
    
    const unsubscribe = Firestore()
      .collection('chats')
      .where('participants', 'array-contains', currentUser.uid)
      .orderBy('updatedAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const chatsData = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Trouver l'autre participant (celui qui n'est pas l'utilisateur actuel)
            const otherParticipantId = data.participants.find(id => id !== currentUser.uid);
            
            if (otherParticipantId) {
              chatsData.push({ 
                id: doc.id,
                chatId: doc.id,
                otherUserId: otherParticipantId,
                otherUserName: data.participantNames?.[otherParticipantId] || 'Inconnu',
                lastMessage: data.lastMessage || '',
                updatedAt: data.updatedAt?.toDate() || new Date()
              });
            }
          });
          setChats(chatsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching chats:", error);
          setLoading(false);
          if (error.code === 'failed-precondition') {
            console.log("Vous devez créer un index dans Firebase Console pour cette requête");
          }
        }
      );

    return unsubscribe;
  }, [currentUser, isFocused]);

  const formatDate = (date) => {
    if (!date) return '';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'numeric'
      });
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat2p', {
        recipientId: item.otherUserId,
        recipientName: item.otherUserName,
        chatId: item.chatId
      })}
    >
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {item.otherUserName?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName}>{item.otherUserName}</Text>
          <Text style={styles.chatDate}>{formatDate(item.updatedAt)}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || 'Aucun message'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E1B055" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <Text style={styles.emptySubText}>Commencez une nouvelle discussion</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#dbdbdb',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1B055',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  chatDate: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  lastMessage: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#262626',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
});
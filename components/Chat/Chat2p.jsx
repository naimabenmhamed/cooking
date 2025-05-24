import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import ChatList from './ChatListe';
const Chat2p = ({ route , navigation }) => {
  const { recipientId, recipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const currentUser = auth().currentUser;
  const flatListRef = useRef(null);

  const getChatId = () => {
    const ids = [currentUser.uid, recipientId].sort();
    return `chat_${ids.join('_')}`;
  };

  const chatId = getChatId();

const initializeChat = async () => {
    try {
      const chatRef = Firestore().collection('chats').doc(chatId);
      const chatDoc = await chatRef.get();

      if (!chatDoc.exists) {
        await chatRef.set({
          
          participants: [currentUser.uid, recipientId],
          participantNames: {
            [currentUser.uid]: currentUser.displayName || 'User',
            [recipientId]: recipientName
          },
          createdAt: Firestore.FieldValue.serverTimestamp(),
          updatedAt: Firestore.FieldValue.serverTimestamp(),
          lastMessage: "",
          lastMessageSender: ""
        });
      }
    } catch (error) {
      console.error("Chat initialization error:", error);
      Alert.alert("Error", "Could not initialize chat");
    }
  };
  const markMessagesAsRead = async () => {
  const messagesRef = Firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages');

  const snapshot = await messagesRef
    .where('readBy', 'not-in', [currentUser.uid]) // messages non encore lus
    .get();

  const batch = Firestore().batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, {
      readBy: Firestore.FieldValue.arrayUnion(currentUser.uid)
    });
  });

  await batch.commit();
};


 const setupChatListener = () => {
  return Firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      async (snapshot) => { // ✅ marquer cette fonction comme async
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setMessages(messages);

        await markMessagesAsRead(); // ✅ maintenant c'est autorisé
      },
      (error) => {
        console.error("Message listener error:", error);
        Alert.alert("Erreur", "Impossible de charger les messages");
      }
    );
};

  const [isRecipientOnline, setIsRecipientOnline] = useState(false);

useEffect(() => {
  const unsubscribe = Firestore()
    .collection('users')
    .doc(recipientId)
    .onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        setIsRecipientOnline(data.isOnline || false);
      }
    });

  return () => unsubscribe();
}, [recipientId]);


  useEffect(() => {
    if (!currentUser) return;

    const init = async () => {
      await initializeChat();
      return setupChatListener();
    };

    let unsubscribe;
    init().then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, chatId]);

 const sendMessage = async () => {
  if (!messageText.trim() || !currentUser) return;

  try {
    const db = Firestore();
    const chatRef = db.collection('chats').doc(chatId);
    
    // Vérifier si le chat existe, sinon le créer
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) {
      await chatRef.set({
        participants: [currentUser.uid, recipientId],
        participantNames: {
          [currentUser.uid]: currentUser.displayName || 'Moi',
          [recipientId]: recipientName
        },
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
        lastMessage: messageText,
        lastMessageSender: currentUser.uid
      });
    }

    // Envoyer le message
    await chatRef.collection('messages').add({
      text: messageText,
      senderId: currentUser.uid,
      createdAt: Firestore.FieldValue.serverTimestamp(),
       isRead: false, 
        readBy: [currentUser.uid],
    });

    // Mettre à jour le chat
    await chatRef.update({
      lastMessage: messageText,
      lastMessageSender: currentUser.uid,
      updatedAt: Firestore.FieldValue.serverTimestamp()
    });

    setMessageText('');
    navigation.navigate('ChatList');
  } catch (error) {
    // console.error("Send message error:", error);
    Alert.alert("Erreur", "Impossible d'envoyer le message");
  }
};

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    const messageDate = item.createdAt?.toDate() || new Date();
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        
  
        <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
          {item.text}
        </Text>
        <Text style={[
          styles.messageTime,
          isCurrentUser ? styles.currentUserTime : styles.otherUserTime
        ]}>
          {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.statusText}>
  {item.senderId === currentUser.uid ? (
    item.readBy?.length > 1 ? <Icon name="checkmark-done-outline"></Icon> : <Icon name="checkmark-outline"></Icon>
  ) : null}
</Text>

      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'Android' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Discussion avec {recipientName}</Text>
        <Text style={styles.statusText}>
    {isRecipientOnline ?  'en ligne': 'pas en ligne'}
  </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Écrivez un message..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          {/* <Text style={styles.sendButtonText}>Envoyer</Text> */}
        <Icon  name="send-outline" style={styles.sendButtonText}  size={23}/>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#E1B055',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1B055',
    borderTopRightRadius: 0,
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherUserTime: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#E1B055',
    borderRadius: 20,
  },
  statusText: {
  color: 'white',
  fontSize: 14,
  fontStyle: 'italic',
  marginTop: 4,
},

  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chat2p;  

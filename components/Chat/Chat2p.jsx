import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

const Chat2p = ({ route , navigation }) => {
  const { recipientId, recipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const currentUser = auth().currentUser;
  const flatListRef = useRef(null);

  // Fonction pour générer l'ID du chat avec les deux UIDs triés
  const getChatId = () => {
    const ids = [currentUser.uid, recipientId].sort();
    return `chat_${ids.join('_')}`;
  };

  const chatId = getChatId();

  // Initialise le chat si n'existe pas encore
// In your initializeChat function:
const initializeChat = async () => {
  try {
    const participants = [currentUser.uid, recipientId].sort();
    const chatRef = Firestore().collection('chats').doc(chatId);
    
    await chatRef.set({
      participants: participants,
      participantNames: {
        [participants[0]]: participants[0] === currentUser.uid 
          ? (currentUser.displayName || 'User') 
          : recipientName,
        [participants[1]]: participants[1] === currentUser.uid 
          ? (currentUser.displayName || 'User') 
          : recipientName
      },
      createdAt: Firestore.FieldValue.serverTimestamp(),
      updatedAt: Firestore.FieldValue.serverTimestamp(),
      lastMessage: "",
      lastMessageSender: ""
    }, { merge: true }); // Utilisez merge: true pour éviter d'écraser le document s'il existe déjà

  } catch (error) {
    console.error("Chat initialization error:", error);
    Alert.alert("Error", "Could not initialize chat");
  }
};

  // Marquer les messages non lus comme lus
  const markMessagesAsRead = async () => {
    const messagesRef = Firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages');

    const snapshot = await messagesRef
      .where('readBy', 'not-in', [currentUser.uid])
      .get();

    const batch = Firestore().batch();

    snapshot.forEach((doc) => {
      batch.update(doc.ref, {
        readBy: Firestore.FieldValue.arrayUnion(currentUser.uid)
      });
    });

    await batch.commit();
  };

  // Configurer le listener sur les messages
 const setupChatListener = () => {
  return Firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(
      (snapshot) => {
        const msgs = [];
        snapshot.forEach((doc) => {
          msgs.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setMessages(msgs);
      },
      (error) => {
        console.error("Message listener error:", error);
        if (error.code === 'permission-denied') {
          Alert.alert("Permission Error", "You don't have permission to view this chat");
        } else {
          Alert.alert("Error", "Failed to load messages");
        }
      }
    );
};

  // État de la disponibilité de l'autre utilisateur
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

  // Fonction pour envoyer un message
// In your sendMessage function:
const sendMessage = async () => {
  if (!messageText.trim() || !currentUser) return;

  try {
    const chatRef = Firestore().collection('chats').doc(chatId);
    
    // Check if chat exists
    const chatDoc = await chatRef.get();
    if (!chatDoc.exists) {
      const participants = [currentUser.uid, recipientId].sort();
      await chatRef.set({
        participants: participants,
        participantNames: {
          [participants[0]]: participants[0] === currentUser.uid 
            ? (currentUser.displayName || 'User') 
            : recipientName,
          [participants[1]]: participants[1] === currentUser.uid 
            ? (currentUser.displayName || 'User') 
            : recipientName
        },
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
        lastMessage: messageText,
        lastMessageSender: currentUser.uid
      });
    }

    // Add message
    await chatRef.collection('messages').add({
      text: messageText,
      senderId: currentUser.uid,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      isRead: false,
      readBy: [currentUser.uid]
    });

    // Update chat
    await chatRef.update({
      lastMessage: messageText,
      lastMessageSender: currentUser.uid,
      updatedAt: Firestore.FieldValue.serverTimestamp()
    });

    setMessageText('');
  } catch (error) {
    console.error("Send message error:", error);
    Alert.alert("Erreur", "Impossible d'envoyer le message");
  }
};

  // Rendu d'un message dans la liste
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
          {isCurrentUser ? (
            item.readBy?.length > 1 
              ? <Icon name="checkmark-done-outline" /> 
              : <Icon name="checkmark-outline" />
          ) : null}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Discussion avec {recipientName}</Text>
        <Text style={styles.statusText}>
          {isRecipientOnline ?  'en ligne' : 'pas en ligne'}
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
          <Icon name="send-outline" style={styles.sendButtonText} size={23} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

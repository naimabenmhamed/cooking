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
        const participants = [currentUser.uid, recipientId].sort();

        await chatRef.set({
          participants,
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
          // Marquer comme lus dès réception
          markMessagesAsRead();
          // Scroll vers le dernier message
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 200);
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
      const chatRef = Firestore().collection('chats').doc(chatId);
      
      const chatDoc = await chatRef.get();
      if (!chatDoc.exists) {
        const participants = [currentUser.uid, recipientId].sort();
        await chatRef.set({
          participants,
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

      await chatRef.collection('messages').add({
        text: messageText,
        senderId: currentUser.uid,
        createdAt: Firestore.FieldValue.serverTimestamp(),
        isRead: false,
        readBy: [currentUser.uid]
      });

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

  // Message rendu avec style “WhatsApp-like” :
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser?.uid;
    const messageDate = item.createdAt?.toDate() || new Date();

    return (
      <View
        style={[
          styles.messageWrapper,
          isCurrentUser ? styles.messageRight : styles.messageLeft
        ]}
      >
        <View style={[
          styles.bubble,
          isCurrentUser ? styles.bubbleRight : styles.bubbleLeft
        ]}>
          <Text style={[styles.messageText, isCurrentUser ? styles.textRight : styles.textLeft]}>
            {item.text}
          </Text>
          <View style={styles.metaInfo}>
            <Text style={[styles.timeText, isCurrentUser ? styles.textRight : styles.textLeft]}>
              {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isCurrentUser && (
              <Icon
                name={item.readBy?.length > 1 ? "checkmark-done" : "checkmark"}
                size={16}
                color={item.readBy?.length > 1 ? "#4FC3F7" : "white"}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          {/* Triangle (tail) */}
          <View style={[
            styles.tail,
            isCurrentUser ? styles.tailRight : styles.tailLeft
          ]} />
        </View>
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
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
          style={[styles.sendButton, !messageText.trim() && {opacity: 0.5}]}
          onPress={sendMessage}
          disabled={!messageText.trim()}
        >
          <Icon name="send" style={styles.sendButtonText} size={23} />
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
    backgroundColor: '#1E90FF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontStyle: 'italic',
  },
  messagesList: {
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  messageWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'relative',
  },
  bubbleLeft: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleRight: {
    backgroundColor: '#1E90FF',
    borderTopRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
  },
  textLeft: {
    color: '#333',
  },
  textRight: {
    color: 'white',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: {
    fontSize: 11,
    opacity: 0.7,
  },
  // Triangle "tail" sous forme de petit triangle CSS-like
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
    borderTopWidth: 15,
    borderTopColor: 'transparent',
  },
  tailLeft: {
    left: -8,
    borderRightWidth: 10,
    borderRightColor: '#fff',
    borderBottomWidth: 15,
    borderBottomColor: 'transparent',
  },
  tailRight: {
    right: -8,
    borderLeftWidth: 10,
    borderLeftColor: '#1E90FF',
    borderBottomWidth: 15,
    borderBottomColor: 'transparent',
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
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#1E90FF',
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chat2p;

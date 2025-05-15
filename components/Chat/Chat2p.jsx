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

const Chat2p = ({ route }) => {
  const { recipientId, recipientName } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const currentUser = auth().currentUser;
  const flatListRef = useRef(null);

  // Générer un ID de conversation standardisé
  const getChatId = () => {
    const ids = [currentUser.uid, recipientId].sort();
    return `chat_${ids.join('_')}`;
  };

  const chatId = getChatId();

  useEffect(() => {
    const initializeChat = async () => {
      const db = Firestore();
      const batch = db.batch();

      // Références aux chats des deux utilisateurs
      const currentUserChatRef = db.collection('users')
        .doc(currentUser.uid)
        .collection('chats')
        .doc(chatId);

      const recipientChatRef = db.collection('users')
        .doc(recipientId)
        .collection('chats')
        .doc(chatId);

      // Données du chat
      const chatData = {
        participants: [currentUser.uid, recipientId],
        participantNames: {
          [currentUser.uid]: currentUser.displayName || 'Moi',
          [recipientId]: recipientName
        },
        lastMessage: '',
        updatedAt: Firestore.FieldValue.serverTimestamp(),
        createdAt: Firestore.FieldValue.serverTimestamp()
      };

      // Vérifier et créer les entrées de chat si nécessaire
      const [currentChat, recipientChat] = await Promise.all([
        currentUserChatRef.get(),
        recipientChatRef.get()
      ]);

      if (!currentChat.exists) {
        batch.set(currentUserChatRef, chatData);
      }

      if (!recipientChat.exists) {
        batch.set(recipientChatRef, chatData);
      }

      await batch.commit();
    };

    initializeChat();

    // Écoute des messages
    const unsubscribe = Firestore()
      .collection('messages')
      .doc(chatId)
      .collection('conversation')
      .orderBy('createdAt', 'asc')
      .onSnapshot(querySnapshot => {
        const msgs = [];
        querySnapshot?.forEach(doc => {
          if (doc.exists) {
            msgs.push({
              id: doc.id,
              ...doc.data()
            });
          }
        });
        setMessages(msgs);
        
        if (flatListRef.current && msgs.length > 0) {
          setTimeout(() => flatListRef.current.scrollToEnd({ animated: true }), 100);
        }
      });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const db = Firestore();
      const batch = db.batch();
      const timestamp = Firestore.FieldValue.serverTimestamp();

      // Références
      const messageRef = db.collection('messages')
        .doc(chatId)
        .collection('conversation')
        .doc();

      const currentUserChatRef = db.collection('users')
        .doc(currentUser.uid)
        .collection('chats')
        .doc(chatId);

      const recipientChatRef = db.collection('users')
        .doc(recipientId)
        .collection('chats')
        .doc(chatId);

      // Ajouter le message
      batch.set(messageRef, {
        text: messageText,
        senderId: currentUser.uid,
        createdAt: timestamp
      });

      // Mettre à jour les métadonnées des chats
      const updateData = {
        lastMessage: messageText,
        lastMessageSender: currentUser.uid,
        updatedAt: timestamp
      };

      batch.update(currentUserChatRef, updateData);
      batch.update(recipientChatRef, updateData);

      await batch.commit();
      setMessageText('');
    } catch (error) {
      console.error("Erreur d'envoi:", error);
    }
  };

  // ... (renderMessage et le reste du code reste inchangé)
  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUser.uid;
    const messageDate = item.createdAt?.toDate() || new Date();
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>Discussion avec {recipientName}</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Écrivez un message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
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
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    textAlign: 'right',
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
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Chat2p;
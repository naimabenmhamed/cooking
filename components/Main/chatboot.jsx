import React, { useState, useEffect, useCallback } from 'react';
import { GiftedChat, Message, Bubble } from 'react-native-gifted-chat';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function App() {
  const [messages, setMessages] = useState([]);

  // Affiche un message au démarrage de l'application
  useEffect(() => {
    const welcomeMessage = {
      _id: 1,
      text: '👋 Bienvenue sur votre chatbot !\n\nChoisissez un numéro :\n1️⃣ Info sur l’application\n2️⃣ Accueil\n3️⃣ Ajouter\n4️⃣ Profil',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Bot',
      },
    };
    setMessages([welcomeMessage]);
  }, []);

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        renderMessage={(props) => {
          const { key, ...rest } = props;
          return <Message key={key || rest.currentMessage._id} {...rest} />;
        }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: '#003366',
              },
              right: {
                backgroundColor: '#99CCFF',
              },
            }}
            textStyle={{
              left: {
                color: '#FFFFFF',
              },
              right: {
                color: '#000000',
              },
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },
});



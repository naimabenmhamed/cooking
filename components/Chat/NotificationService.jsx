import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { db } from '../config/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth } from '../config/firebase';

export const requestUserPermission = async () => {
  if (Platform.OS === 'ios') {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  } else if (Platform.OS === 'android') {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
};

export const getFCMToken = async (userId) => {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Your Firebase Token is:', fcmToken);
      
      // Enregistrer le token dans Firestore
      if (userId) {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          fcmToken: fcmToken,
          fcmTokenUpdatedAt: new Date()
        });
      }
      
      return fcmToken;
    } else {
      console.log('Failed', 'No token received');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

export const setupNotifications = async (userId) => {
  await requestUserPermission();
  await getFCMToken(userId);

  // Gestion des notifications en foreground
  messaging().onMessage(async remoteMessage => {
    console.log('Notification in foreground:', remoteMessage);
    // Vous pouvez afficher une alerte ou une notification locale ici
  });

  // Gestion des notifications qui ouvrent l'app
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('App opened from notification:', remoteMessage);
    // Navigation vers l'écran approprié
  });

  // Vérifier si l'app a été ouverte par une notification
  messaging().getInitialNotification().then(remoteMessage => {
    if (remoteMessage) {
      console.log('App opened from quit state by notification:', remoteMessage);
      // Navigation vers l'écran approprié
    }
  });
};

export const sendPushNotification = async (recipientId, message, senderName) => {
  try {
    // Récupérer le token FCM du destinataire
    const recipientRef = doc(db, 'users', recipientId);
    const recipientDoc = await getDoc(recipientRef);
    
    if (!recipientDoc.exists() || !recipientDoc.data().fcmToken) {
      console.log('Recipient has no FCM token');
      return;
    }
    
    const fcmToken = recipientDoc.data().fcmToken;
    
    // Envoyer la notification via votre serveur ou directement avec Firebase
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=YOUR_SERVER_KEY'
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: senderName,
          body: message,
          sound: 'default'
        },
        data: {
          senderId: auth.currentUser?.uid,
          type: 'chat_message'
        }
      })
    });
    
    console.log('Notification sent:', await response.json());
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};
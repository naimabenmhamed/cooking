import { useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // ✅ Ajouté ici

export default function useNomUtilisateur() {
  const [nom, setNom] = useState('');
  const [userId, setUserId] = useState(null);
  const navigation = useNavigation(); // ✅ Maintenant ça fonctionne

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setNom('');
        navigation.navigate('Login');
      }
    });

    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!userId) return;

    const unsubscribeUser = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot(
        (doc) => {
          const data = doc.data();
          setNom(data?.nom || '');
        },
        (error) => {
          console.error('Erreur de Firestore:', error);
        }
      );

    return unsubscribeUser;
  }, [userId]);

  return { nom, setNom, userId };
}

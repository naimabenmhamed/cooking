import { useState, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const saveNotes= (route, navigation) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [idToUpdate, setIdToUpdate] = useState(null);
    const [initialTitle, setInitialTitle] = useState('');
    const [initialDescription, setInitialDescription] = useState('');
    const [ingredient, setIngredient] = useState('');
    const [initialIngredient, setInitialIngredient] = useState('');
    const [visibility, setVisibility] = useState('private'); // par défaut privée

  useEffect(() => {
   // Nettoyer quand le composant est démonté
   return () => {
     setIdToUpdate(null);
     setTitle('');
     setDescription('');
     setIngredient('');
   };
 }, []);
   // Effet pour gérer les paramètres de navigation
   useEffect(() => {
     if (route.params?.id) {
       // Mode édition - charger les données existantes
       setIdToUpdate(route.params.id);
       setTitle(route.params.title || '');
       setDescription(route.params.description || '');
       setIngredient(route.params.ingredient || '');
     } else {
       // Mode création - réinitialiser
       setIdToUpdate(null);
       setTitle('');
       setDescription('');
        setInitialTitle('');
     setInitialDescription('');
     setIngredient('');
     }
   }, [route.params]);
 
   const handleAddOrUpdate = async () => {
     const currentUser = auth().currentUser;
 
     if (!currentUser) {
       Alert.alert('Erreur', 'Utilisateur non connecté.');
       return;
     }
 
     if (!title.trim()) {
       Alert.alert('Erreur', 'Le titre est obligatoire');
       return;
     }
     if (idToUpdate && title.trim() === initialTitle.trim() && description.trim() === initialDescription.trim() && ingredient.trim() === initialIngredient.trim()) {
     Alert.alert('تنبيه', 'لم يتم أي تعديل'); // Pas de modifications
     navigation.goBack(); // Retourner sans modifier
     return;
   }
     try {
       setLoading(true);
       const userDoc = await firestore()
         .collection('users')
         .doc(currentUser.uid)
         .get();
 
       if (!userDoc.exists) {
         Alert.alert('Erreur', 'Profil utilisateur non trouvé.');
         return;
       }
 
       const userData = userDoc.data();
       const userName = userData.nom;
 
       if (idToUpdate) {
         // Mise à jour de la note existante
         await firestore()
           .collection('notes')
           .doc(idToUpdate)
           .update({
             title,
             description,
             ingredient,
              visibility,
             updatedAt: firestore.FieldValue.serverTimestamp(),
             userName,
           });
       } else {
         // Création d'une nouvelle note
         await firestore()
           .collection('notes')
           .add({
             title,
             description,
             ingredient ,
             userId: currentUser.uid,
             userName,
              visibility,
             createdAt: firestore.FieldValue.serverTimestamp(),
             updatedAt: firestore.FieldValue.serverTimestamp(),
           });
       }
 
       // Réinitialiser et naviguer vers ToNotes
          // Réinitialisation complète
     setIdToUpdate(null);
     setTitle('');
     setDescription('');
     setIngredient('');
     Keyboard.dismiss();
     
     // Naviguer vers ToNotes et nettoyer l'historique
     navigation.reset({
       index: 0,
       routes: [{ name: 'ToNotes' }],
     });
     } catch (error) {
       Alert.alert('Erreur', error.message);
     } finally {
       setLoading(false);
     }
   };
 

  return {
    idToUpdate,
    title,
    setTitle,
    description,
    setDescription,
    setIdToUpdate,
    initialTitle,
    setInitialTitle,
    initialDescription,
    setInitialDescription,
    handleAddOrUpdate,
    loading,
    ingredient,
    setIngredient,
    visibility,            // <= ajoute ceci
  setVisibility 
  };
};

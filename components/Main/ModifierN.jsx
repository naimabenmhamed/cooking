import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Dialog from 'react-native-dialog';
import Toast from 'react-native-toast-message';
import firestore from '@react-native-firebase/firestore';

const ModifierNomComponent = ({ userId, visible, onClose }) => {
  const [nouveauNom, setNouveauNom] = useState('');

  const handleModifier = async () => {
    try {
      // Mise à jour dans Firestore
      await firestore().collection('users').doc(userId).update({
        nom: nouveauNom,
      });
      
      // Toast de confirmation
      Toast.show({
        type: 'success',
        text1: 'Nom modifié',
        text2: 'Le nom a été mis à jour avec succès 👌',
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du nom :', error);
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Une erreur est survenue lors de la modification',
      });
    }
    onClose();
  };

  return (
    <Dialog.Container visible={visible}>
      <Dialog.Title>Modifier le nom</Dialog.Title>
      <Dialog.Input
        placeholder="Nouveau nom"
        onChangeText={setNouveauNom}
        value={nouveauNom}
      />
      <Dialog.Button label="Annuler" onPress={onClose} />
      <Dialog.Button label="Modifier" onPress={handleModifier} />
    </Dialog.Container>
  );
};

export default ModifierNomComponent;
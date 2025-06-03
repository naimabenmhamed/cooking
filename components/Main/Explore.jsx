import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Notes from './Notes';
import NotesPr from './NotesPr';
import styles from '../Styles/Explore.styles';
import Toast from 'react-native-toast-message';
import ModifierNomComponent from './ModifierN';
import ChatList from '../Chat/ChatListe';
import useNomUtilisateur from '../hooks/Nomutillisateur'
import Recorde from './Recorde'
export default function Explore({ navigation }) {
  const [activeTab, setActiveTab] = useState(0);
  // const [nom, setNom] = useState('');
  const [showDialog, setShowDialog] = useState(false);

const { nom, setNom, userId } = useNomUtilisateur(); // ✅ AVEC setNom


useEffect(() => {
  async function ajouterNomParDefaut() {
    const usersSnapshot = await firestore().collection('users').get();
    usersSnapshot.forEach(async (doc) => {
      const data = doc.data();
      if (!data.nom) {
        await firestore().collection('users').doc(doc.id).update({
          nom: 'Hi!',
        });
      }
    });
  }
  
  ajouterNomParDefaut();
}, []);



  const ouvrirModifNom = () => {
    setShowDialog(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Section supérieure avec photo et nom */}
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <Icon name="person" size={50} color="#555" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.userName}>{nom}</Text>
          <TouchableOpacity onPress={ouvrirModifNom} style={styles.buttonStyle}>
            {/* <Icon name="id-card-outline" size={30} color="#999" /> */}
            <Text>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Icon name="grid" size={24} color={activeTab === 0 ? "#1E90FF" : "#7f8c8d"} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Icon name="person" size={24} color={activeTab === 1 ? "#1E90FF" : "#7f8c8d"} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {activeTab === 0 && <Notes />}
        {activeTab === 1 && <NotesPr />}
      </View>

      {/* Bouton de chat */}
      <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatListe')}>
        <Icon name="chatbox" size={30} color="#777" />
      </TouchableOpacity>
       {/* <Button title='hi' onPress={()=> navigation.navigate('Recorde')} /> */}
      {/* // Le composant de dialogue */}
{showDialog && (
  <ModifierNomComponent 
    userId={userId} 
    visible={showDialog} 
    onClose={() => setShowDialog(false)} 
    onNameUpdated={(newName) => { 
    setNom(newName); // Mise à jour locale
  }}
  />
)}
      <Toast />
    </SafeAreaView>
  );
};

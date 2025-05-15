import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Notes from './Notes';
import Toast from 'react-native-toast-message';
import ModifierNomComponent from './ModifierN';
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
          nom: 'Utilisateur',
        });
      }
    });
  }
  
  ajouterNomParDefaut();
}, []);

// const [userId, setUserId] = useState(null);
// useEffect(() => {
//   const authSubscriber = auth().onAuthStateChanged(user => {
//     if (user) {
//       setUserId(user.uid);
//     } else {
//       setUserId(null);
//       setNom(''); // Réinitialisation explicite
//       navigation.navigate('Login');
//     }
//   });

//   return authSubscriber;
// }, [navigation]);
//   useEffect(() => {
//   // Vérifier d'abord si userId est valide
//   if (!userId) {
//     setNom(''); // Réinitialiser si userId est null
//     return;
//   }

//   console.log(`Subscribing to user data for: ${userId}`); // Debug

//   const unsubscribe = firestore()
//     .collection('users')
//     .doc(userId)
//     .onSnapshot(
//       (documentSnapshot) => {
//         console.log('Snapshot received:', documentSnapshot.exists); // Debug
        
//         if (documentSnapshot.exists) {
//           const userData = documentSnapshot.data();
//           console.log('User data:', userData); // Debug
          
//           if (userData?.nom) {
//             setNom(userData.nom);
//           } else {
//             console.warn("Le champ 'nom' est manquant dans le document");
//             setNom(''); // Explicitement réinitialiser si le champ est absent
//           }
//         } else {
//           console.warn("Le document utilisateur n'existe pas");
//           setNom('');
//         }
//       },
//       (error) => {
//         console.error("Erreur Firestore:", error);
//         Toast.show({
//           type: 'error',
//           text1: 'Erreur de chargement',
//           text2: 'Impossible de charger le profil'
//         });
//       }
//     );

//   return () => {
//     console.log(`Unsubscribing from user data for: ${userId}`); // Debug
//     unsubscribe();
//   };
// }, [userId]); // Dépendance sur userId

  const ouvrirModifNom = () => {
    setShowDialog(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Section supérieure avec photo et nom */}
      <View style={styles.profileHeader}>
        <View style={styles.profileIconContainer}>
          <Icon name="person" size={50} color="#999" />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.userName}>{nom}</Text>
          <TouchableOpacity onPress={ouvrirModifNom} style={styles.buttonStyle}>
            <Icon name="id-card-outline" size={30} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 0 && styles.activeTab]}
          onPress={() => setActiveTab(0)}
        >
          <Icon name="grid" size={24} color={activeTab === 0 ? "#FBD38D" : "#7f8c8d"} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 1 && styles.activeTab]}
          onPress={() => setActiveTab(1)}
        >
          <Icon name="person" size={24} color={activeTab === 1 ? "#FBD38D" : "#7f8c8d"} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {activeTab === 0 && <Notes />}
        {activeTab === 1 && (
          <View style={styles.profileContent}>
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
        )}
      </View>

      {/* Bouton de chat */}
      <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('Chat')}>
        <Icon name="chatbox" size={30} color="#999" />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  profileIconContainer: {
    backgroundColor: '#FBD38D',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 60,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#7f8c8d',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FBD38D',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  profileContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FBD38D',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonStyle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#FBD38D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

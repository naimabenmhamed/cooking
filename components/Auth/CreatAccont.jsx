import LottieView from 'lottie-react-native';
import React ,{useState}from 'react';
import { SafeAreaView, View, StyleSheet, TextInput, TouchableOpacity, Text,Alert } from 'react-native';
import Login from './Login';
import auth from '@react-native-firebase/auth';
import Home from '../Main/Home';
import firestore from '@react-native-firebase/firestore';

export default function CreatAccount({navigation}) {
  const[email,setEmail]= useState('');
  const[password,setPassword]= useState('');
const [nom, setNom] = useState('');

  const handleSignup = async () => {
    if (password.length < 6) {
      Alert.alert('خطأ', 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل');
      return;
    }
    try {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  Alert.alert('Succès', 'Compte créé avec succès');
  navigation.navigate('Home');

  const userId = userCredential.user.uid;

  await firestore()
    .collection('users')
    .doc(userId)
    .set({
      nom: nom, // attention : "nom" n'est pas défini non plus dans ton code actuel !
      email: email,
      createdAt: firestore.FieldValue.serverTimestamp()
    });

  console.log('✅ Utilisateur enregistré avec succès !');
} catch (error) {
  Alert.alert('Erreur', error.message);
}

  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Zone blanche supérieure */}
      <View style={styles.topSection}>
        <LottieView 
          source={require('../../assets/animations/Animation - 1745940456888.json')}
          autoPlay
          loop
          style={{ width: 280, height: 280 }}
          resizeMode="contain"
        />
      </View>
      
      {/* Zone orange inférieure */}
      <View style={styles.bottomSection}>
        <TextInput
  placeholder="الاسم"
  placeholderTextColor="#999"
  style={styles.input}
  value={nom}
  onChangeText={setNom}
/>

        <TextInput
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        
        <TextInput
          placeholder="كلمة المرور"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.roundButton} onPress={handleSignup}  >
          <Text style={styles.buttonText}>تسجيل</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.orangeButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}




  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    topSection: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
    bottomSection: {
      backgroundColor: '#E1B055', // Couleur dorée/jaune
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      padding: 20,
      paddingBottom: 40,
      justifyContent: 'space-evenly',
      height: '65%',
    },
    rectangleButton: {
      backgroundColor: '#FFF5F0', // Teinte très légèrement rosée pour les boutons blancs
      borderRadius: 15,
      padding: 15,
      marginVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
      color: '#000', 
    },
    input: {
      backgroundColor: '#FFF5F0',
      borderRadius: 15,
      padding: 15,
      marginVertical: 8,
      borderColor: '#FFF5F0',
      borderWidth: 1,
      marginBottom: 12,
      paddingLeft: 8,
      height: 50,
      color: '#000',
      fontSize: 14,  
    },
    roundButton: {
      backgroundColor: '#FFF5F0', // Teinte très légèrement rosée pour les boutons blancs
      borderRadius: 25,
      padding: 15,
      marginVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
    },
    orangeButton: {
      backgroundColor: '#FF5722', // Couleur orange
      borderRadius: 25,
      padding: 15,
      marginVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      height: 50,
    },
    buttonText: {
      color: '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
      flexShrink: 1,
     
    },
  });
  


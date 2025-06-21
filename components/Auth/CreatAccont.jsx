import LottieView from 'lottie-react-native';
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import Login from './Login';
import auth from '@react-native-firebase/auth';
import Home from '../Main/Home';
import firestore from '@react-native-firebase/firestore';

export default function CreatAccount({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit comporter au moins 6 caractères');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await user.sendEmailVerification();

      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          email: email,
          emailVerified: false,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

      Alert.alert(
        'Compte créé avec succès',
        'Un email de vérification a été envoyé à votre adresse. Veuillez vérifier votre email avant de vous connecter.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );

    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      let errorMessage = 'Une erreur est survenue';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cette adresse email est déjà utilisée';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Adresse email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Le mot de passe est trop faible';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <LottieView 
          source={require('../../assets/animations/Animation - 1748192301295.json')}
          autoPlay
          loop
          style={{ width: 280, height: 280 }}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.bottomSection}>
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#999"
          style={styles.input}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        
        <TextInput
          placeholder="Mot de passe"
          placeholderTextColor="#999"
          style={styles.input}
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity 
          style={[styles.roundButton, isLoading && styles.disabledButton]} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Inscription...' : 'Inscription'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.orangeButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Connexion</Text>
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
    backgroundColor: '#1E90FF', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'space-evenly',
    height: '65%',
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
    backgroundColor: '#FFF5F0',
    borderRadius: 25,
    padding: 15,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  orangeButton: {
    backgroundColor: '#B0C4DE',
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
  disabledButton: {
    opacity: 0.6,
  },
});


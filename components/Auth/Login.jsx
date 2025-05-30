import LottieView from 'lottie-react-native'
import React, { Component,useState } from 'react'
import { View ,SafeAreaView,StatusBar ,StyleSheet, TextInput, TouchableOpacity,Text ,Alert} from 'react-native'
import auth from '@react-native-firebase/auth';
import Home from '../Main/Home';
export default function Login({navigation})  {
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const handleLogin = async () => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
    Alert.alert('Succès', 'Connexion réussie');
    navigation.navigate('Home');
  } catch (error) {
    Alert.alert('Erreur', error.message);
  }
};
    return (
      <SafeAreaView style={styles.container}>
        {/* zon on blanche avec view */}
        <View style={styles.topsection}>
          <LottieView source= {require('../../assets/animations/Animation - 1745956545417.json')}  autoPlay  loop 
          style={{ width:400, height :500}} 
          resizeMode="contain"/>
        </View>
        {/* zon orange avec view */}
        <View style={styles.bottomSection}>
            <TextInput  placeholder="البريد الإلكتروني"  placeholderTextColor="#999"  style={styles.input} keyboardType="email-address"   value={email}
          onChangeText={setEmail}></TextInput>
            <TextInput  placeholder="كلمة المرور " placeholderTextColor="#999"  style={styles.input} secureTextEntry={true}  value={password}
          onChangeText={setPassword} ></TextInput>
           
            <TouchableOpacity style={styles.roundButton}  onPress={handleLogin}>
            <Text style={styles.buttonText}>تسجيل الدخول</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  
};

const styles = StyleSheet.create({
    container:{
         flex:1,
         backgroundColor:'#FFFFFF',
    },
    topsection:{
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

   

})
import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import auth from '@react-native-firebase/auth';
export default function Home({ navigation }) {  
  // Ajoutez navigation dans les props
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('Login');  // Navigation vers l'écran de connexion
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="البحث" 
        placeholderTextColor="#999" 
        style={styles.input} 
      />
      
      {/* Bouton de déconnexion stylisé */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        
      >
        <Text style={styles.logoutText}>تسجيل الخروج</Text>  {/* "Déconnexion" en arabe */}
        
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFF5F0',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderColor: '#E1B055',
    borderWidth: 1,
    color: '#000',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#FF5722',
    borderRadius: 25,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
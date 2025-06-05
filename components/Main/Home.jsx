import { StyleSheet, View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';

export default function Home({ navigation }) {  
 
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.navigate('CreatAccont');  
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
      
     
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
        
      >
        <Text style={styles.logoutText}>تسجيل الخروج</Text>
      </TouchableOpacity>
       <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatListe')}>
        <Icon name="chatbox" size={30} color="#777" />
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
    backgroundColor: '#E0FFFF',
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    borderColor: '#3B82F6',
    borderWidth: 1,
    color: '#000',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#3B82F6',
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
  chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1E90FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  }
});
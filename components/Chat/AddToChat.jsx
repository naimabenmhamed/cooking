import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function AddToChat() {
  const [users, setUsers] = useState([]);
  const navigation = useNavigation();

  const fetchUsers = (search) => {
    if (search.trim() === '') {
      setUsers([]);
      return;
    }
    
    Firestore()
      .collection('users')
      .where('nom', '>=', search)
      .where('nom', '<=', search + '\uf8ff')
      .get()
      .then((snapshot) => {
        let users = snapshot.docs.map(doc => {
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        setUsers(users);
      })
      .catch(error => {
        console.error("Error fetching users:", error);
      });
  };

  const startChat = (user) => {
    navigation.navigate('Chat2p', { 
      recipientId: user.id,
      recipientName: user.nom 
    });
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder='Rechercher un utilisateur...' 
        onChangeText={(search) => fetchUsers(search)}
      />
      
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.userItem}
            onPress={() => startChat(item)}
          >
            <Text style={styles.userName}>{item.nom}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
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
  userItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
});
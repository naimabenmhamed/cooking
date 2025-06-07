import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  Image,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const CreateGroup = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = Firestore()
      .collection('friends')
      .where('users', 'array-contains', currentUser.uid)
      .onSnapshot(async (snapshot) => {
        const friendsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const friendId = data.users.find(uid => uid !== currentUser.uid);
            const userDoc = await Firestore().collection('users').doc(friendId).get();
            if (userDoc.exists) {
              return {
                id: friendId,
                name: userDoc.data().nom || userDoc.data().displayName || 'Ami',
                avatar: userDoc.data().photoURL || null,
              };
            }
            return null;
          })
        );
        setFriends(friendsData.filter(f => f !== null));
      });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId) 
        : [...prev, friendId]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Erreur", "Veuillez donner un nom au groupe");
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins un ami");
      return;
    }

    try {
      // Créer le groupe
      const groupRef = await Firestore()
        .collection('groups')
        .add({
          name: groupName.trim(),
          members: [currentUser.uid, ...selectedFriends],
          createdBy: currentUser.uid,
          createdAt: Firestore.FieldValue.serverTimestamp(),
          lastMessage: "",
          lastMessageSender: ""
        });

      // Ajouter le groupe à chaque membre
      const batch = Firestore().batch();
      [currentUser.uid, ...selectedFriends].forEach(userId => {
        const userRef = Firestore().collection('users').doc(userId);
        batch.update(userRef, {
          groups: Firestore.FieldValue.arrayUnion(groupRef.id)
        });
      });
      await batch.commit();

      navigation.navigate('GroupChat', {
        groupId: groupRef.id,
        groupName: groupName.trim()
      });
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert("Erreur", "Impossible de créer le groupe");
    }
  };

  const renderFriend = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.friendItem,
        selectedFriends.includes(item.id) && styles.selectedFriend
      ]}
      onPress={() => toggleFriendSelection(item.id)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text style={styles.friendName}>{item.name}</Text>
      {selectedFriends.includes(item.id) && (
        <Icon name="checkmark-circle" size={24} color="#1E90FF" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau groupe</Text>
        <TouchableOpacity onPress={createGroup}>
          <Text style={styles.createButton}>Créer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <TextInput
          style={styles.input}
          placeholder="Nom du groupe"
          value={groupName}
          onChangeText={setGroupName}
        />
      </View>

      <Text style={styles.sectionTitle}>Sélectionnez des membres</Text>

      <FlatList
        data={friends}
        renderItem={renderFriend}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.friendsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E90FF',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
    color: '#333',
  },
  friendsList: {
    paddingHorizontal: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedFriend: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  friendName: {
    flex: 1,
    fontSize: 16,
  },
});

export default CreateGroup;
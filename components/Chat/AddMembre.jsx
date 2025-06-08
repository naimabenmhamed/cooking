import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const AddMember = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [groupMembers, setGroupMembers] = useState([]);
  const currentUser = auth().currentUser;

  // Fonction pour gérer les différents formats d'avatar (identique à ChatList)
  const getAvatarUrl = (userData) => {
    let avatarUrl = null;
    if (userData?.photoURL) {
      avatarUrl = userData.photoURL;
    } else if (userData?.photoProfil) {
      // Si photoProfil est une string base64
      if (userData.photoProfil.startsWith('data:image')) {
        avatarUrl = userData.photoProfil;
      } else if (userData.photoProfil.startsWith('/9j/')) {
        avatarUrl = `data:image/jpeg;base64,${userData.photoProfil}`;
      } else {
        avatarUrl = userData.photoProfil;
      }
    } else if (userData?.avatar) {
      avatarUrl = userData.avatar;
    }
    return avatarUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les membres actuels du groupe
        const groupDoc = await Firestore().collection('groups').doc(groupId).get();
        const groupData = groupDoc.data();
        setGroupMembers(groupData.members || []);

        // Récupérer tous les utilisateurs sauf l'utilisateur courant et ceux déjà dans le groupe
        const usersSnapshot = await Firestore().collection('users').get();
        
        const allUsers = [];
        usersSnapshot.forEach(doc => {
          const userData = doc.data();
          if (doc.id !== currentUser.uid && !groupData.members?.includes(doc.id)) {
            allUsers.push({
              id: doc.id,
              name: userData.nom || userData.displayName || 'Utilisateur',
              email: userData.email,
              avatar: getAvatarUrl(userData) // Utiliser la fonction pour récupérer l'avatar
            });
          }
        });

        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        Alert.alert("Erreur", "Impossible de charger les utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, currentUser.uid]);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchText, users]);

  const addUserToGroup = async (userId) => {
    try {
      // Ajouter l'utilisateur au groupe
      await Firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          members: Firestore.FieldValue.arrayUnion(userId)
        });

      // Ajouter le groupe à la liste des groupes de l'utilisateur
      await Firestore()
        .collection('users')
        .doc(userId)
        .update({
          groups: Firestore.FieldValue.arrayUnion(groupId)
        });

      // Mettre à jour la liste des utilisateurs affichés
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      Alert.alert("Succès", "Membre ajouté au groupe");
    } catch (error) {
      console.error("Error adding user to group:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le membre au groupe");
    }
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => addUserToGroup(item.id)}
    >
      {item.avatar ? (
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.avatar}
          onError={(e) => {
            console.log("Erreur de chargement de l'avatar:", e.nativeEvent.error);
            // Vous pourriez ici mettre à jour l'état pour afficher l'avatar par défaut
          }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.name ? item.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
      )}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Icon name="person-add" size={24} color="#1E90FF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter des membres</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher des utilisateurs..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredUsers.length === 0 && styles.emptyList}
        ListEmptyComponent={
          <View style={styles.emptyUsers}>
            <Icon name="people-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchText.trim() === '' 
                ? "Aucun utilisateur disponible à ajouter"
                : "Aucun résultat trouvé"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  emptyList: {
    flex: 1,
  },
  emptyUsers: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
});

export default AddMember;
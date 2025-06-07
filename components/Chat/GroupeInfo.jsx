import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GroupInfo = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const unsubscribeGroup = Firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setGroup(doc.data());
        }
      });

    const unsubscribeMembers = Firestore()
      .collection('users')
      .where('groups', 'array-contains', groupId)
      .onSnapshot((snapshot) => {
        const membersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMembers(membersData);
      });

    return () => {
      unsubscribeGroup();
      unsubscribeMembers();
    };
  }, [groupId]);

  const leaveGroup = async () => {
    try {
      // Supprimer l'utilisateur du groupe
      await Firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          members: Firestore.FieldValue.arrayRemove(currentUser.uid)
        });

      // Supprimer le groupe de la liste des groupes de l'utilisateur
      await Firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          groups: Firestore.FieldValue.arrayRemove(groupId)
        });

      navigation.goBack();
      Alert.alert("Succès", "Vous avez quitté le groupe");
    } catch (error) {
      console.error("Error leaving group:", error);
      Alert.alert("Erreur", "Impossible de quitter le groupe");
    }
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberItem}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.displayName?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.displayName || 'Utilisateur'}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {item.id === group?.createdBy && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!group) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Informations du groupe</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.groupInfo}>
        {group.avatar ? (
          <Image source={{ uri: group.avatar }} style={styles.groupAvatar} />
        ) : (
          <View style={[styles.groupAvatar, styles.groupAvatarPlaceholder]}>
            <Text style={styles.groupAvatarText}>
              {group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.memberCount}>{members.length} membres</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Membres</Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.membersList}
        />
      </View>

      {currentUser.uid !== group.createdBy && (
        <TouchableOpacity 
          style={styles.leaveButton}
          onPress={() => {
            Alert.alert(
              "Quitter le groupe",
              "Êtes-vous sûr de vouloir quitter ce groupe?",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Quitter", onPress: leaveGroup, style: "destructive" }
              ]
            );
          }}
        >
          <Text style={styles.leaveButtonText}>Quitter le groupe</Text>
        </TouchableOpacity>
      )}
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
  groupInfo: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  groupAvatarPlaceholder: {
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupAvatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberCount: {
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  membersList: {
    paddingBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 14,
    color: '#666',
  },
  adminBadge: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
  },
  leaveButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default GroupInfo;
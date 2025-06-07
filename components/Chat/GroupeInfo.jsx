import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const GroupInfo = ({ route, navigation }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupDoc = await Firestore().collection('groups').doc(groupId).get();
        
        if (!groupDoc.exists) {
          Alert.alert("Erreur", "Ce groupe n'existe pas");
          navigation.goBack();
          return;
        }

        const groupData = groupDoc.data();
        setGroup(groupData);

        // Récupération des membres avec leurs vrais noms
        const memberPromises = groupData.members.map(memberId => 
          Firestore().collection('users').doc(memberId).get()
        );

        const memberSnapshots = await Promise.all(memberPromises);
        const membersData = memberSnapshots
          .filter(doc => doc.exists)
          .map(doc => {
            const userData = doc.data();
            return {
              id: doc.id,
              name: userData.nom || userData.displayName || 'Membre', // Utilise 'nom' ou 'displayName'
              email: userData.email,
              photoURL: userData.photoURL
            };
          });

        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching group data:", error);
        Alert.alert("Erreur", "Impossible de charger les informations du groupe");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();

    const unsubscribe = Firestore()
      .collection('groups')
      .doc(groupId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setGroup(doc.data());
        }
      });

    return () => unsubscribe();
  }, [groupId, navigation]);

  const leaveGroup = async () => {
    try {
      await Firestore()
        .collection('groups')
        .doc(groupId)
        .update({
          members: Firestore.FieldValue.arrayRemove(currentUser.uid)
        });

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

  const handleAddMember = () => {
    navigation.navigate('AddMember', { groupId });
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberItem}>
      {item.photoURL ? (
        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
      </View>
      {item.id === group?.createdBy && (
        <View style={styles.adminBadge}>
          <Icon name="shield-checkmark" size={16} color="white" />
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Chargement des informations...</Text>
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
        <Text style={styles.memberCount}>{members.length} membre{members.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membres du groupe</Text>
          {group.createdBy === currentUser.uid && (
            <TouchableOpacity onPress={handleAddMember}>
              <Icon name="person-add" size={24} color="#1E90FF" />
            </TouchableOpacity>
          )}
        </View>
        
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id}
          contentContainerStyle={members.length === 0 && styles.emptyList}
          ListEmptyComponent={
            <View style={styles.emptyMembers}>
              <Icon name="people-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Aucun membre dans ce groupe</Text>
            </View>
          }
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
    textAlign: 'center',
  },
  memberCount: {
    color: '#666',
    fontSize: 16,
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyList: {
    flex: 1,
  },
  emptyMembers: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 8,
    color: '#888',
    fontSize: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E90FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  adminText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
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
    fontSize: 16,
  },
});

export default GroupInfo;
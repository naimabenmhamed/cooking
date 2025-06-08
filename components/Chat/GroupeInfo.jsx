import React, { useState, useEffect, useRef } from 'react';
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
  const [isDeleting, setIsDeleting] = useState(false); // Nouvel état pour tracker la suppression
  const currentUser = auth().currentUser;
  const unsubscribeRef = useRef(null); // Référence pour le listener

  useEffect(() => {
    if (!groupId) {
      Alert.alert("Erreur", "ID de groupe manquant");
      navigation.goBack();
      return;
    }

    const fetchGroupData = async () => {
      try {
        const groupDoc = await Firestore().collection('groups').doc(groupId).get();
        
        if (!groupDoc || !groupDoc.exists) {
          Alert.alert("Erreur", "Ce groupe n'existe pas");
          navigation.goBack();
          return;
        }

        const groupData = groupDoc.data();
        if (!groupData) {
          Alert.alert("Erreur", "Données du groupe introuvables");
          navigation.goBack();
          return;
        }

        setGroup({
          ...groupData,
          id: groupDoc.id
        });

        // Récupération des membres avec leurs vrais noms
        if (groupData.members && Array.isArray(groupData.members)) {
          const memberPromises = groupData.members.map(memberId => 
            Firestore().collection('users').doc(memberId).get()
          );

          const memberSnapshots = await Promise.all(memberPromises);
          const membersData = memberSnapshots
            .filter(doc => doc && doc.exists)
            .map(doc => {
              const userData = doc.data();
              return {
                id: doc.id,
                name: userData?.nom || userData?.displayName || 'Membre',
                email: userData?.email || '',
                photoURL: userData?.photoURL || userData?.avatar || null
              };
            });

          setMembers(membersData);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
        let errorMessage = "Impossible de charger les informations du groupe";
        
        if (error.code === 'permission-denied') {
          errorMessage = "Permissions insuffisantes pour accéder à ce groupe";
        } else if (error.code === 'not-found') {
          errorMessage = "Ce groupe n'existe pas";
        }
        
        Alert.alert("Erreur", errorMessage);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();

    // Set up real-time listener avec nettoyage amélioré
    const setupListener = () => {
      const unsubscribe = Firestore()
        .collection('groups')
        .doc(groupId)
        .onSnapshot(
          (doc) => {
            // Ignorer les mises à jour si on est en train de supprimer
            if (isDeleting) return;
            
            if (doc && doc.exists) {
              const data = doc.data();
              if (data) {
                setGroup({
                  ...data,
                  id: doc.id
                });
              }
            } else {
              // Le document n'existe plus (supprimé)
              console.log("Group document no longer exists");
              // Nettoyer le listener
              if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
              }
            }
          },
          (error) => {
            // Ignorer les erreurs si on est en train de supprimer ou si le composant est démonté
            if (isDeleting) return;
            
            console.error("Group listener error:", error);
            if (error.code === 'permission-denied') {
              console.log("Permission denied for group listener - cleaning up");
              // Nettoyer le listener en cas d'erreur de permission
              if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
              }
            }
          }
        );
      
      unsubscribeRef.current = unsubscribe;
      return unsubscribe;
    };

    const unsubscribe = setupListener();

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [groupId, navigation, isDeleting]);

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
      let errorMessage = "Impossible de quitter le groupe";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permissions insuffisantes pour quitter le groupe";
      }
      
      Alert.alert("Erreur", errorMessage);
    }
  };

  const deleteGroup = async () => {
    try {
      // Marquer qu'on est en train de supprimer
      setIsDeleting(true);
      
      // Nettoyer le listener avant la suppression
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      // 1. Vérifiez d'abord que l'utilisateur est bien le créateur
      const groupDoc = await Firestore().collection('groups').doc(groupId).get();
      
      if (!groupDoc || !groupDoc.exists) {
        Alert.alert("Erreur", "Ce groupe n'existe pas");
        return;
      }

      const groupData = groupDoc.data();
      if (!groupData) {
        Alert.alert("Erreur", "Données du groupe introuvables");
        return;
      }

      if (groupData.createdBy !== currentUser.uid) {
        Alert.alert("Erreur", "Seul le créateur peut supprimer le groupe");
        return;
      }

      // 2. Supprimer le groupe
      await Firestore().collection('groups').doc(groupId).delete();
      
      // 3. Nettoyer la référence dans le profil utilisateur
      try {
        await Firestore()
          .collection('users')
          .doc(currentUser.uid)
          .update({
            groups: Firestore.FieldValue.arrayRemove(groupId)
          });
      } catch (error) {
        console.log("Erreur lors de la mise à jour du profil (non critique):", error);
      }

      // 4. Navigation immédiate
      navigation.goBack();
      
      // 5. Alerte après navigation
      setTimeout(() => {
        Alert.alert("Succès", "Groupe supprimé avec succès");
      }, 100);
      
    } catch (error) {
      console.error("Error deleting group:", error);
      let errorMessage = "Impossible de supprimer le groupe";
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permissions insuffisantes pour supprimer le groupe";
      } else if (error.code === 'not-found') {
        errorMessage = "Ce groupe n'existe plus";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddMember = () => {
    navigation.navigate('AddMember', { groupId });
  };

  const renderMember = ({ item }) => (
    <TouchableOpacity style={styles.memberItem}>
      {item.photoURL ? (
        <Image 
          source={{ uri: item.photoURL }} 
          style={styles.avatar}
          onError={() => console.log("Erreur de chargement de l'avatar")}
        />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarText}>
            {item.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item.email && <Text style={styles.memberEmail}>{item.email}</Text>}
      </View>
      {item.id === group?.createdBy && (
        <View style={styles.adminBadge}>
          <Icon name="shield-checkmark" size={16} color="white" />
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading || !group) {
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
        {group?.avatar ? (
          <Image 
            source={{ uri: group.avatar }} 
            style={styles.groupAvatar}
            onError={() => console.log("Erreur de chargement de l'avatar du groupe")}
          />
        ) : (
          <View style={[styles.groupAvatar, styles.groupAvatarPlaceholder]}>
            <Text style={styles.groupAvatarText}>
              {group?.name?.charAt(0)?.toUpperCase() || 'G'}
            </Text>
          </View>
        )}
        <Text style={styles.groupName}>{group?.name || 'Groupe sans nom'}</Text>
        <Text style={styles.memberCount}>{members.length} membre{members.length !== 1 ? 's' : ''}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Membres du groupe</Text>
          {group?.createdBy === currentUser.uid && (
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

      {currentUser.uid === group?.createdBy ? (
        <TouchableOpacity 
          style={[styles.leaveButton, styles.deleteButton]}
          onPress={() => {
            Alert.alert(
              "Supprimer le groupe",
              "Êtes-vous sûr de vouloir supprimer définitivement ce groupe? Cette action est irréversible.",
              [
                { text: "Annuler", style: "cancel" },
                { text: "Supprimer", onPress: deleteGroup, style: "destructive" }
              ]
            );
          }}
          disabled={isDeleting}
        >
          <Icon name="trash-outline" size={19} color="#999" />
        </TouchableOpacity>
      ) : (
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
           <Icon name="log-out-outline" size={19} color="#999" />
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
   backgroundColor: '#E0FFFF',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
    width: '20%',
  },
  deleteButton: {
    backgroundColor: '#E0FFFF',
    padding: 5,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
    width: '20%',
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GroupInfo;
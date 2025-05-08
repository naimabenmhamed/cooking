
import React, { Component } from 'react'
import {  SafeAreaView,View ,StyleSheet,Text ,TouchableOpacity,ScrollView} from 'react-native' 
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";
import Icon from 'react-native-vector-icons/Ionicons';
import Chat from '../Chat/Chat';

export default function  Explore ({navigation}) {


   return (
         < SafeAreaView style={styles.container}>
        <View style={styles.topSection}>
        <TouchableOpacity style={styles.chatButton1}>
          <Text style={styles.chatText}>
          <Icon name="person" size={43} color="#999" />
          </Text>
        </TouchableOpacity>
      <View style={styles.middlePart}>
        {/* <ScrollView 
      horizontal={true} 
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
     {[1,2,3,4,5].map((item) => (
              <View key={item} style={[styles.item, { backgroundColor: ['red','green','blue','yellow','gray'][item-1] }]}>
                <Text>Item {item}</Text>
              </View>
            ))}
    
    </ScrollView> */}
      </View>
        </View>
         
          <TouchableOpacity  style={styles.chatButton}  onPress={() => navigation.navigate('Chat')}>
            <Text   style={styles.chatText}>
            <Icon name="chatbox" size={30} style={styles.buttonIcon} />
            </Text>
          </TouchableOpacity>
          
          </ SafeAreaView>
          
       )
     }
   const styles=StyleSheet.create({
     container:{
       flex:1,
       backgroundColor: '#FFFFFF',
     },
     scrollContent:{
      flexGrow :1,
     },
     iconStyle:{
      backgroundColor :"#FBD38D",
     },
     topSection: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
    },
     chatText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    chatButton: {
      position: 'absolute',
      right: 15,       
      bottom: 15,     
      backgroundColor: '#FBD38D', // iOS blue - change as desired
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5, // For Android
    },
    chatButton1: {
      position: 'absolute',
      right: 15,      
      bottom: 500,     
      backgroundColor: '#FBD38D', 
      width: 80,
      height: 80,
      borderRadius: 50,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5, // For Android
    },

    buttonIcon:{
     color :'#999',
     fontSize : 28 ,
     fontWeight :'bold',
    },
   containerView:{
    flex:1 ,
    backgroundColor: '#FFFFFF',
    
   },
   containerView1: {
    backgroundColor: '#E1B055', // Couleur dorée/jaune
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    justifyContent: 'space-evenly',
    height: '65%',
  },
 buttonshose:{

 },
 topPart: {
  flex: 0.3, // 30% of the screen
  justifyContent: 'center',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'black',
  borderBottomColor: '#ccc',
},
middlePart: {
  flex: 0.5, // 70% of the screen
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'white', // Optional color
},
text: {
  fontSize: 20,
  fontWeight: 'bold',
},
scrollView: {
  marginVertical: 20,
},
item: {
  width: 100,
  height: 100, 
  marginHorizontal: 10,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
},
   

     
    
   })

   

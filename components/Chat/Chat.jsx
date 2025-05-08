import React, { Component } from 'react'
import {View , Text, StyleSheet } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from "react-native-vector-icons/Ionicons"
import ChatListe from './ChatListe';
import AddToChat from './AddToChat';
import { SafeAreaProvider } from 'react-native-safe-area-context';
const Tab = createMaterialTopTabNavigator();

function TopBar (){
  return(
    <Tab.Navigator initialRouteName="ChatListe"
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
switch (route.name){
  case 'ChatListe':
    iconName='chatbubbles';
    break;
    case 'AddToChat' :
      iconName='person-add';
      break;
      
}
        return <Icon name={iconName} size={size} color={color} />;
      },
      
      tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarShowIcon: true,
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: {
          backgroundColor: '#FBD38D',
          height: 79,
          borderBottomLeftRadius: 10, // Changed from borderTop
          borderBottomRightRadius: 10,
        },
        tabBarIndicatorStyle: {
            backgroundColor: '#000',
          },
      })}
      >
        
        <Tab.Screen 
        name="ChatListe" 
        component={ChatListe} 
        options={{ tabBarLabel: 'Messages' }}
      />
      <Tab.Screen 
        name="AddToChat" 
        component={AddToChat} 
        options={{ tabBarLabel: 'Ajouter' }}
      />

      </Tab.Navigator>
  )
}
export default function Chat (){
  
    return (
        <SafeAreaProvider>
     <View style={styles.container}>
        <TopBar/>
     </View>
      </SafeAreaProvider>
    )
  }
const styles=StyleSheet.create({
    container :{
        flex:1,
    },
    
})


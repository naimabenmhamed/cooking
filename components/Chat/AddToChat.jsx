import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function AddToChat (){
  return(
    <View style={styles.container}>
      <Text style={styles.styleText}>
     AddToChat
      </Text>
    </View>
  )
}
const styles=StyleSheet.create({
  container:{
    flex: 1 ,
    justifyContent: 'center',  // centre verticalement
    alignItems: 'center', 
  },
  styleText :{
    fontSize: 56,
    fontWeight: 'bold',
    color :'#999',
   
  }
})
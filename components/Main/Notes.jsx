import { View, Text ,StyleSheet,Button} from 'react-native'
import React from 'react'

export default function Notes () {
  return (
    <View style={styles.container}>
      <Text style={styles.styleText}>
        Notes </Text>
        
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
    // fontSize: 56,
    fontWeight: 'bold',
    color :'#999',
   
  }
})
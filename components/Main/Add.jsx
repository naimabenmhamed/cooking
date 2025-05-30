import React, { Component ,useState} from 'react'
import { StyleSheet ,Text,View,TextInput,TouchableOpacity,ScrollView } from 'react-native'


export default function  Add (){
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

    return (
      <View  style={styles.container}>
        <ScrollView>
        <Text  style={styles.title} >أضف وصفة جديدة</Text>
      <View style={styles.from}>
        <Text style={styles.label}>عنوان</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="أدخل عنوانًا"
        />
        <Text style={styles.label}>وصف</Text>
        <TextInput
          style={[styles.input ,styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="أدخل وصفًا"
          multiline
          numberOfLines={5}
        />
        <TouchableOpacity 
          style={styles.button}
         >
          <Text style={styles.buttonText}>يضيف</Text>

            
        </TouchableOpacity>
        
      </View>
      </ScrollView>
        </View>
    )
  }
const styles=StyleSheet.create({
  container:{
    flex:1,
    padding:14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  from:{
    backgroundColor:'#f8f8f8',
    padding:15 ,
    borderRadius: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 578,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#E1B055',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  from: {
    backgroundColor: '#f8f8f8',
    padding: 15,
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
    borderColor: '#999',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  textArea: {
    height: 578,
    textAlignVertical: 'top',
    
  },
  button: {
    backgroundColor: '#1E90FF',
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
  cancelButton: {
  backgroundColor: '#ccc',
  marginTop: 10,
},
cancelButtonText: {
  color: '#333',
  fontWeight: 'bold',
  fontSize: 16,
},
visibilityButton: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#1E90FF',
  padding: 10,
  borderRadius: 10,
  alignItems: 'center',
  marginHorizontal: 5,
  backgroundColor: '#fff',
},
visibilityButtonSelected: {
  backgroundColor: '#1E90FF',
},
visibilityText: {
    color: '#1E90FF',
  fontWeight: 'bold',
},
visibilityTextSelected: {
   color: '#fff',
  fontWeight: 'bold',
},

});
export default styles;
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Resumer({ route }) {
  const { résumé } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Résumé Généré</Text>
      <Text style={styles.text}>{résumé}</Text>
    </ScrollView>
  );
}

// Déclarer les styles **en dehors** de la fonction ou **avant le return**
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
  },
});


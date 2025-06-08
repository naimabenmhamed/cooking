import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ResumeResult({ route }) {
  const { resumeText } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Résumé :</Text>
      <Text style={styles.resume}>{resumeText}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  resume: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
});


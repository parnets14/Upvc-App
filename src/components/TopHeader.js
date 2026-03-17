// components/TopHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const TopHeader = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>{route.name}</Text>

      {/* Example: button on top right */}
      <TouchableOpacity onPress={() => alert('Button pressed')}>
        <Text style={styles.button}>⚙️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#1e90ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    color: '#fff',
    fontSize: 24,
  },
});

export default TopHeader;

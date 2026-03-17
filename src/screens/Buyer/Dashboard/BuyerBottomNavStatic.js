// BuyerBottomNavStatic.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../components/AppText';

const BuyerBottomNavStatic = () => {
  const navigation = useNavigation();

  const tabs = [
    { name: 'BuyerHome', label: 'Home', icon: <MaterialIcons name="home" size={24} /> },
    { name: 'BuyerInsights', label: 'Category', icon: <FontAwesome name="bar-chart" size={20} /> },
    { name: 'ActiveLeads', label: 'History', icon: <MaterialCommunityIcons name="account-search" size={24} /> },
    { name: 'BuyerAccount', label: 'Account', icon: <MaterialIcons name="account-circle" size={24} /> },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          onPress={() => navigation.navigate(tab.name)}
          style={styles.tabButton}
        >
          <View style={styles.iconContainer}>
            {tab.icon}
            <AppText weight='Bold' style={styles.label}>{tab.label}</AppText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BuyerBottomNavStatic;

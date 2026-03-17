// BuyerBottomNav.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'; 

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; 
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../../../components/AppText';

const BuyerTopNav = ({ state, descriptors, navigation }) => {
  // Add safety checks for navigation state
  if (!state || !state.routes || !Array.isArray(state.routes)) {
    console.warn('BuyerTopNav: Invalid navigation state or routes not an array:', state);
    return null;
  }

  // Additional validation for navigation object
  if (!navigation) {
    console.warn('BuyerTopNav: Navigation object is missing');
    return null;
  }

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        // Add safety checks for route and descriptors
        if (!route || !route.key || !descriptors || !descriptors[route.key]) {
          return null;
        }
        
        const { options } = descriptors[route.key];
        const label = options?.tabBarLabel || options?.title || route.name;

        const isFocused = state?.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event?.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconColor = isFocused ? '#080000' : '#9E9E9E';
        const textColor = isFocused ? '#080000' : '#9E9E9E';

        let iconComponent;
        switch (route?.name) {
          case 'BuyerHome':
            iconComponent = <MaterialIcons name="home" size={24} color={iconColor} />;
            break;
          case 'ActiveLeads':
            // iconComponent = <Ionicons name="ios-list-circle" size={24} color={iconColor} />;
            iconComponent = <MaterialCommunityIcons name="account-search" size={24} color={iconColor}/>
            break;
          case 'BuyerInsights':
            iconComponent = <FontAwesome name="bar-chart" size={20} color={iconColor} />;
            break;
          case 'BuyerAccount':
            iconComponent = <MaterialIcons name="account-circle" size={24} color={iconColor} />;
            break;
          default:
            iconComponent = <MaterialIcons name="help" size={24} color={iconColor} />;
        }

        return (
          <TouchableOpacity
            key={route?.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              {iconComponent}
              <AppText weight='Regular' style={[styles.label, { color: textColor }]}>
                {label}
              </AppText>
            </View>
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
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
    // fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    // backgroundColor: '#3F51B5',
    backgroundColor: '#080000',
    borderRadius: 2,
  },
});

export default BuyerTopNav;
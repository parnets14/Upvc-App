import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const SellerBottomNav = ({ state, descriptors, navigation }) => {
  // Add comprehensive safety checks for navigation state
  if (!state || typeof state.index !== 'number' || !navigation) {
    console.warn('SellerBottomNav: Invalid navigation state or navigation object');
    return null;
  }

  // Ensure state.routes is an array
  if (!Array.isArray(state.routes)) {
    console.warn('SellerBottomNav: state.routes is not an array:', state.routes);
    return null;
  }

  const tabs = [
    {
      name: 'LeadDetails',
      label: 'Home',
      Icon: Ionicons,
      iconName: 'home-outline',
      activeIconName: 'home',
    },
    {
      name: 'SellerDashboard',
      label: 'Upload Video',
      Icon: MaterialCommunityIcons,
      // iconName: 'account-search-outline',
      iconName: 'upload',
      // activeIconName: 'account-search',
      activeIconName: 'upload',
    },
    {
      name: 'MarketInsights',
      label: 'Insights',
      Icon: Feather,
      iconName: 'bar-chart-2',
      activeIconName: 'bar-chart-2',
    },
    {
      name: 'SellerAccount',
      label: 'Account',
      Icon: FontAwesome,
      iconName: 'user-o',
      activeIconName: 'user',
    }
  ];

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="light"
        blurAmount={20}
        reducedTransparencyFallbackColor="white"
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
        style={styles.gradient}
      />
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const IconComponent = tab.Icon;

          const onPress = () => {
            try {
              const event = navigation.emit({
                type: 'tabPress',
                target: tab.name,
                canPreventDefault: true,
              });

              if (!isFocused && !event?.defaultPrevented) {
                navigation.navigate(tab.name);
              }
            } catch (error) {
              console.error('Navigation error:', error);
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tab}
            >
              <IconComponent
                name={isFocused ? tab.activeIconName : tab.iconName}
                size={24}
                color={isFocused ? 'black' : '#95A5A6'}
              />
              <Text style={[
                styles.label,
                { color: isFocused ? 'black' : '#95A5A6' }
              ]}>
                {tab.label}
              </Text>
              {isFocused && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  tabContainer: {
    flexDirection: 'row',
    height: '100%',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0, 
    width:'60%',
    height: 3,
    backgroundColor: 'black', 
  },
});

export default SellerBottomNav;

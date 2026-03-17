import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AppText from '../AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const getToken = async () => {
    const sellerToken = await AsyncStorage.getItem('sellerToken');
    const buyerToken = await AsyncStorage.getItem('buyerToken');
 
    if (sellerToken){
      navigation.replace("SellerMain")
    }
    else if (buyerToken){
      navigation.replace('BuyerMain')
    }
    else{
      navigation.replace('UserTypeSelection');
    }
  }

  useEffect(()=> {
    getToken()
  }, []) 

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <View style={styles.container}>
        <Image 
          source={require('../../assets/logo.png')}  
          style={styles.logo}
        />
        <AppText weight='Inter' style={styles.tagline}>Your Window to Better Deals</AppText>
        <ActivityIndicator size="large" color="#000000" style={styles.loader} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain', 
  },
  tagline: {
    fontSize: 20,
    color: '#000000', 
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 10,
  },
});

export default SplashScreen;

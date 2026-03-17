import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { styles } from './styles';
import InputField from '../../../components/FormElements/InputField';
import SelectDropdown from '../../../components/FormElements/SelectDropdown';
import PrimaryButton from '../../../components/UI/PrimaryButton';

const BuyerOnboarding = ({ navigation }) => {
  const [formData, setFormData] = useState({
    windowType: '',
    size: '',
    budget: '',
    pinCode: '',
    preferences: [],
    deliveryTime: '',
    name: '',
    phone: '',
  });

  const windowTypes = [
    'Casement Windows',
    'Sliding Windows',
    'Tilt & Turn Windows',
    'French Doors',
    'Sliding Doors',
    'Other',
  ];

  const handleSubmit = () => {
    if (!formData?.phone || formData.phone?.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    console.log("formData : ", formData)
    navigation.navigate('OTPVerification', { phone: formData.phone });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Welcome to UPVC Connect</Text>
      <Text style={styles.subHeader}>Your Window to the Best Deals!</Text>
      <Text style={styles.description}>
        Tell us what you need—free quotes from up to 6 trusted sellers in 24 hours!
      </Text>

      <View style={styles.formContainer}>
        <SelectDropdown
          label="Window/Door Type"
          options={windowTypes}
          onSelect={(value) => setFormData({ ...formData, windowType: value })}
        />
        
        <InputField
          label="Size (in sq.ft)"
          placeholder="Enter approximate size"
          keyboardType="numeric"
          value={formData.size}
          onChangeText={(text) => setFormData({ ...formData, size: text })}
        />

        <InputField
          label="Budget (₹)"
          placeholder="Enter your budget"
          keyboardType="numeric"
          value={formData.budget}
          onChangeText={(text) => setFormData({ ...formData, budget: text })}
        />

        <InputField
          label="Pin Code"
          placeholder="Enter your location pin code"
          keyboardType="numeric"
          maxLength={6}
          value={formData.pinCode}
          onChangeText={(text) => setFormData({ ...formData, pinCode: text })}
        />

        <InputField
          label="Full Name"
          placeholder="Enter your name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <InputField
          label="Phone Number"
          placeholder="Enter 10-digit mobile number"
          keyboardType="phone-pad"
          maxLength={10}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
        />

        <PrimaryButton 
          title="Send OTP" 
          onPress={handleSubmit} 
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

export default BuyerOnboarding;
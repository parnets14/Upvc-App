import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RNPickerSelect from 'react-native-picker-select';
import { pick, types, isCancel } from '@react-native-documents/picker';
import AppText from '../../components/AppText';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PermissionManager from '../../utils/PermissionManager';
import { API_ENDPOINTS } from '../../config/api';
import NotificationService from '../../utils/NotificationService';
const INDIAN_CITIES = [
  { label: 'Mumbai', value: 'Mumbai' },
  { label: 'Delhi', value: 'Delhi' },
  { label: 'Bangalore', value: 'Bangalore' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Ahmedabad', value: 'Ahmedabad' },
  { label: 'Chennai', value: 'Chennai' },
  { label: 'Kolkata', value: 'Kolkata' },
  { label: 'Surat', value: 'Surat' },
  { label: 'Pune', value: 'Pune' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Lucknow', value: 'Lucknow' },
  { label: 'Kanpur', value: 'Kanpur' },
  { label: 'Nagpur', value: 'Nagpur' },
  { label: 'Indore', value: 'Indore' },
  { label: 'Thane', value: 'Thane' },
  { label: 'Bhopal', value: 'Bhopal' },
  { label: 'Visakhapatnam', value: 'Visakhapatnam' },
  { label: 'Pimpri-Chinchwad', value: 'Pimpri-Chinchwad' },
  { label: 'Patna', value: 'Patna' },
  { label: 'Vadodara', value: 'Vadodara' },
  { label: 'Ghaziabad', value: 'Ghaziabad' },
  { label: 'Ludhiana', value: 'Ludhiana' },
  { label: 'Agra', value: 'Agra' },
  { label: 'Nashik', value: 'Nashik' },
  { label: 'Faridabad', value: 'Faridabad' },
];

const WelcomeProfileSetup = ({ navigation }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    city: '',
    yearsInBusiness: '',
    pinCode: '',
    email: '',
    website: '',
    gstNumber: '',
    contactPerson: '',
    phoneNumber: '',
    brandOfProfileUsed: '',
    gstCertificate: null,
    visitingCard: null,
    businessProfileVideo: null,
  });
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  
  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.BRANDS_ALL);
        if (response.data.success && response.data.brands) {
          const brandItems = response.data.brands.map(brand => ({
            label: brand.name,
            value: brand.name
          }));
          setBrands(brandItems);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        // Fallback to empty array if fetch fails
        setBrands([]);
      }
    };
    
    fetchBrands();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simplified document picker - no permission rationale needed
  const pickDocument = async (field, fileType, isMandatory = false) => {
    console.log('pickDocument called:', { field, fileType, isMandatory });
    try {
      let pickerTypes = [];
      
      // Set appropriate file types based on the upload field
      if (fileType === 'image') {
        pickerTypes = [types.images];
      } else if (fileType === 'video') {
        pickerTypes = [types.video];
      } else if (fileType === 'pdf') {
        pickerTypes = [types.pdf];
      } else {
        // Default fallback
        pickerTypes = [types.pdf, types.images];
      }
      
      console.log('Opening document picker with types:', pickerTypes);
      const [res] = await pick({
        types: pickerTypes,
        allowMultiSelection: false
      });
      
      console.log('Document picked successfully:', res);
      handleChange(field, res);
      
      // Mark that user has successfully used document picker (permissions granted)
      // This ensures permission dialogs won't show again
      await AsyncStorage.setItem('document_picker_used', 'true');
    } catch (err) {
      if (isCancel(err)) {
        console.log('Document picker cancelled by user');
        if (isMandatory) {
          Alert.alert('Required', 'GST Certificate upload is mandatory');
        }
      } else {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  }
  const validateForm = () => {
    const requiredFields = [
      'companyName', 'address', 'city', 'yearsInBusiness', 'pinCode',
      'email', 'gstNumber', 'contactPerson', 'phoneNumber', 'brandOfProfileUsed'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return `Please fill ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`;
      }
    }

    // Check for GST certificate
    if (!formData.gstCertificate) {
      return 'GST Certificate upload is mandatory';
    }

    if (formData.phoneNumber.length !== 10) {
      return 'Please enter a valid 10-digit phone number';
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      return 'Invalid email address';
    }

    if (!/^[0-9]{6}$/.test(formData.pinCode)) {
      return 'Invalid 6-digit PIN code';
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setLoading(true);

    try {
      // Get FCM token before registration
      let fcmToken = null;
      try {
        fcmToken = await NotificationService.getFCMToken();
        console.log('FCM Token obtained:', fcmToken);
      } catch (fcmError) {
        console.warn('Could not get FCM token:', fcmError);
        // Continue with registration even if FCM token fails
      }

      const formDataToSend = new FormData();
      console.log("formData : ", formData)
      
      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'gstCertificate' && key !== 'visitingCard' && key !== 'businessProfileVideo') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add FCM token if available
      if (fcmToken) {
        formDataToSend.append('fcmToken', fcmToken);
      }

      // Helper function to append files with proper type detection
      const appendFile = (fieldName, file) => {
        if (file) {
          // Use the file's native type or type property
          let fileType = file.type || file.mimeType || file.nativeType;
          
          // Fallback type detection if not provided
          if (!fileType) {
            if (fieldName.includes('video')) {
              fileType = 'video/mp4';
            } else if (fieldName === 'visitingCard') {
              fileType = 'image/jpeg';
            } else if (fieldName === 'gstCertificate') {
              // Check file extension for PDF
              const fileName = file.name || '';
              fileType = fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
            }
          }
          
          // Determine file name
          let fileName = file.name;
          if (!fileName) {
            if (fieldName.includes('video')) {
              fileName = 'businessProfileVideo.mp4';
            } else if (fieldName === 'visitingCard') {
              fileName = 'visitingCard.jpg';
            } else if (fieldName === 'gstCertificate') {
              fileName = 'gstCertificate.pdf';
            }
          }

          console.log(`Appending ${fieldName}:`, { uri: file.uri, type: fileType, name: fileName });
          
          formDataToSend.append(fieldName, {
            uri: file.uri,
            type: fileType,
            name: fileName
          });
        }
      };

      // Add files
      appendFile('gstCertificate', formData.gstCertificate);
      appendFile('visitingCard', formData.visitingCard);
      appendFile('businessProfileVideo', formData.businessProfileVideo);

      console.log('Submitting form data to:', API_ENDPOINTS.SELLER_REGISTER);
      
      const response = await axios.post(API_ENDPOINTS.SELLER_REGISTER, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 60000, // 60 second timeout for large file uploads
        transformRequest: (data) => data,
      });

      console.log('Response received:', response.data);

      if (response.data.success) {
        await AsyncStorage.setItem('sellerToken', response.data.token);
        console.log("response.data.token welcome : ", response.data.token)
        navigation.replace('SellerMain');
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to register. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to server. Please check:\n1. Your internet connection\n2. Server is running\n3. Server URL is correct';
      } else if (error.response) {
        console.log('Error response data:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          {/* Business Info */}
          <AppText weight='Inter' style={styles.header}></AppText>
          <Input
            label="Company Name*"
            value={formData.companyName}
            onChange={(val) => handleChange('companyName', val)}
          />

          <Input
            label="Address*"
            value={formData.address}
            onChange={(val) => handleChange('address', val)}
            multiline={true}
            numberOfLines={4}
            style={styles.addressInput}
          />

          <AppText weight='Inter' style={styles.label}>City*</AppText>
          <RNPickerSelect
            placeholder={{ label: 'Select your city...', value: null }}
            value={formData.city}
            onValueChange={(val) => handleChange('city', val)}
            items={INDIAN_CITIES}
            style={{
              inputIOS: styles.pickerInput,
              inputAndroid: styles.pickerInput,
              iconContainer: styles.pickerIcon,
            }}
            Icon={() => <Icon name="arrow-drop-down" size={24} color="#000" />}
          />

          <Input
            label="PIN Code*"
            value={formData.pinCode}
            onChange={(val) => handleChange('pinCode', val)}
            placeholder="6-digit"
            keyboardType="number-pad"
            maxLength={6}
          />

          <Input
            label="Years in Business*"
            value={formData.yearsInBusiness}
            onChange={(val) => handleChange('yearsInBusiness', val)}
            keyboardType="numeric"
          />

          {/* Contact Info */}
          <AppText weight='Inter' style={styles.header}>CONTACT INFORMATION</AppText>
          <Input
            label="Email*"
            value={formData.email}
            onChange={(val) => handleChange('email', val)}
            keyboardType="email-address"
          />

          <Input
            label="Website"
            value={formData.website}
            onChange={(val) => handleChange('website', val)}
            keyboardType="url"
          />

          <Input
            label="GST Number*"
            value={formData.gstNumber}
            onChangeText={(val) => {
              const cleanedValue = val.replace(/[^a-zA-Z0-9]/g, '');
              if (cleanedValue.length <= 15) {
                handleChange('gstNumber', cleanedValue);
              }
            }}
            keyboardType="default"
            maxLength={15}
          />

          <Input
            label="Contact Person*"
            value={formData.contactPerson}
            onChange={(val) => handleChange('contactPerson', val)}
          />

          <Input
            label="Contact Number*"
            value={formData.phoneNumber}
            onChange={(val) => handleChange('phoneNumber', val)}
            keyboardType="phone-pad"
            maxLength={10}
          />

          {/* Document Uploads */}
          <UploadField
            label="GST Certificate*"
            file={formData.gstCertificate}
            onUpload={() => pickDocument('gstCertificate', 'pdf', true)}
            iconName="upload-file"
          />

          <UploadField
            label="Visiting Card"
            file={formData.visitingCard}
            onUpload={() => pickDocument('visitingCard', 'image')}
            iconName="image"
          />

          {/* Video Upload */}
          <AppText weight='Inter' style={styles.header}>BUSINESS PROFILE VIDEO</AppText>
          <UploadField
            label="Business Profile Video"
            file={formData.businessProfileVideo}
            onUpload={() => pickDocument('businessProfileVideo', 'video')}
            iconName="videocam"
          />
          {!formData.businessProfileVideo && (
            <AppText style={styles.videoHint}>
              Upload a 60-second video to get lead priority!
            </AppText>
          )}
          
          <AppText weight='Inter' style={styles.label}>Brand of Profile Used*</AppText>
          <RNPickerSelect
            placeholder={{ label: 'Select a brand...', value: null }}
            value={formData.brandOfProfileUsed}
            onValueChange={(val) => handleChange('brandOfProfileUsed', val)}
            items={brands}
            style={{
              inputIOS: styles.pickerInput,
              inputAndroid: styles.pickerInput,
              iconContainer: styles.pickerIcon,
            }}
            Icon={() => <Icon name="arrow-drop-down" size={24} color="#000" />}
          />
          {brands.length === 0 && (
            <AppText style={styles.hint}>Loading brands...</AppText>
          )}
          
          <TouchableOpacity
            style={[styles.submit, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <AppText weight='Inter' style={styles.submitText}>
              {loading ? 'PROCESSING...' : 'COMPLETE REGISTRATION'}
            </AppText>
            {!loading && <Icon name="arrow-forward" size={24} color="#fff" />}
          </TouchableOpacity> 
          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const Input = ({ label, value, onChange, style, ...props }) => (
  <View style={styles.inputGroup}>
    <AppText weight='Inter' style={styles.label}>{label}</AppText>
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChange}
      {...props}
    />
  </View>
);

const UploadField = ({ label, file, onUpload, iconName }) => (
  <View style={styles.uploadGroup}>
    <AppText weight='Inter' style={styles.label}>{label}</AppText>
    <TouchableOpacity style={styles.uploadBtn} onPress={onUpload}>
      <Icon name={iconName} size={20} color="#000" />
      <AppText style={styles.uploadText}>
        {file ? file.name || file.uri.split('/').pop() : 'Upload'}
      </AppText>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 40 },
  logoWrap: { alignItems: 'center', paddingTop: 35 },
  logo: { width: 140, height: 80 },
  form: { paddingHorizontal: 25 },
  header: { fontSize: 14, color: '#000', marginTop: 20, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9'
  },
  addressInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#f9f9f9',
    height: 100,
    textAlignVertical: 'top' // For Android to align text at the top
  },
  uploadGroup: { marginBottom: 16 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8
  },
  uploadText: { marginLeft: 8, fontSize: 14, color: '#000' },
  pickerInput: {
    fontSize: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#000',
    backgroundColor: '#f9f9f9',
    marginBottom: 16
  },
  pickerIcon: { top: 20, right: 12 },
  videoHint: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  submit: {
    backgroundColor: '#000',
    padding: 18,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20
  },
  submitDisabled: {
    opacity: 0.7
  },
  submitText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
    letterSpacing: 2
  },
});

export default WelcomeProfileSetup;
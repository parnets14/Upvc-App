import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Share,
  Platform,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../components/AppText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { CommonActions } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNShare from 'react-native-share';
import ContactUsModal from '../../components/ContactUsModal';
import AboutUsModal from '../../components/AboutUsModal';
import TermsAndPrivacyModal from '../../components/TermsAndPrivacyModal';

const SellerAccountPage = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('purchase');
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const modalRef = useRef(null);
  const scrollRef = useRef(null);
  const [modalReady, setModalReady] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  console.log("selectedPurchase : " , selectedPurchase)

  // Clear modal state function
  const clearModalState = () => {
    setSelectedPurchase(null);
    setModalReady(false);
    // Reset scroll position when closing
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: false });
    }
  };

  // Handle opening invoice modal
  const handleOpenInvoice = (purchase) => {
    setSelectedPurchase(purchase);
    setInvoiceVisible(true);
    // Delay rendering ScrollView until after modal mount
    setTimeout(() => setModalReady(true), 300);
  };

  // Handle closing invoice modal
  const handleCloseInvoice = () => {
    setInvoiceVisible(false);
    setModalReady(false);
    setSelectedPurchase(null);
  };

  // Seller information
  const [sellerInfo, setSellerInfo] = useState({
    company: '',
    address: '',
    city: '',
    pinCode: '',
    email: '',
    gst: '',
    contactPerson: '',
    contactNumber: '',
    brandProfile: '',
    yearsInBusiness: '',
    website: ''
  });

  // Purchase history
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [token, setToken] = useState(null);

  useEffect(() => {
    fetchSellerData();
    requestStoragePermissionOnStartup();
  }, []);

  // Request storage permission on app startup
  const requestStoragePermissionOnStartup = async () => {
    if (Platform.OS !== 'android') {
      return; // iOS doesn't need this permission
    }

    try {
      // Check if permission is already granted
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );

      if (!hasPermission) {
        // Show permission request dialog
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'UPVC Connect needs access to your storage to save invoice PDFs and documents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Allow',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({
            type: 'success',
            position: 'top',
            text1: 'Permission Granted',
            text2: 'You can now download and share invoices',
            visibilityTime: 3000,
          });
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Toast.show({
            type: 'info',
            position: 'top',
            text1: 'Permission Denied',
            text2: 'You can enable it later in Settings',
            visibilityTime: 3000,
          });
        }
      }
    } catch (err) {
      console.warn('Startup permission request error:', err);
    }
  };

  const fetchSellerData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('sellerToken');
      setToken(storedToken);
      if (!storedToken) {
        return;
      }
      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      if (response.data.success) {
        const seller = response.data.seller;
        setSellerInfo({
          company: seller.companyName || '',
          address: seller.address || '',
          city: seller.city || '',
          pinCode: seller.pinCode || '',
          email: seller.email || '',
          gst: seller.gstNumber || '',
          contactPerson: seller.contactPerson || '',
          contactNumber: seller.phoneNumber || '',
          brandProfile: seller.brandOfProfileUsed || '',
          yearsInBusiness: seller.yearsInBusiness?.toString() || '',
          website: seller.website || ''
        });

        // Format purchase history from leads
        if (seller.leads && seller.leads.length > 0) {
          const formattedPurchases = seller.leads
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(lead => ({
              id: lead._id,
              rawData: lead,
              date: (() => { const d = new Date(lead.createdAt); const dd = String(d.getDate()).padStart(2, '0'); const mm = String(d.getMonth() + 1).padStart(2, '0'); const yyyy = d.getFullYear(); return `${dd}/${mm}/${yyyy}`; })(),
              customerName: lead.contactInfo.name,
              amount: lead.price,
              details: {
                personal: {
                  fullName: lead.contactInfo.name,
                  contactNumber: lead.contactInfo.contactNumber,
                  whatsappNumber: lead.contactInfo.whatsappNumber,
                  email: lead.contactInfo.email,
                },
                project: {
                  name: lead.projectInfo.name,
                  address: lead.projectInfo.address,
                  pinCode: lead.projectInfo.pincode,
                  stage: lead.projectInfo.stage,
                  timeline: lead.projectInfo.timeline,
                  totalSqFt: `${lead.totalSqft} sq ft`,
                  category: lead.category?.name || 'Not specified',
                },
              }
            }));
          setPurchaseHistory(formattedPurchases);
        }
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      Alert.alert('Error', 'Failed to fetch seller data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true);
    await fetchSellerData();
    setRefreshing(false);
  };

  const handleInputChange = (field, value) => {
    setSellerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) {
        Alert.alert("Please Login");
        return;
      }

      const updateData = {
        companyName: sellerInfo.company,
        address: sellerInfo.address,
        city: sellerInfo.city,
        pinCode: sellerInfo.pinCode,
        email: sellerInfo.email,
        gstNumber: sellerInfo.gst,
        contactPerson: sellerInfo.contactPerson,
        phoneNumber: sellerInfo.contactNumber,
        brandOfProfileUsed: sellerInfo.brandProfile,
        yearsInBusiness: parseInt(sellerInfo.yearsInBusiness) || 0,
        website: sellerInfo.website
      };
      alert("Your request for verification has been submited");
      setIsEditing(false);
      return;
      const response = await axios.put(
        'https://upvcconnect.com/api/sellers',
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating seller profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const hasBusinessInfo = Object.values(sellerInfo).some(val => val !== '');

  const renderPersonalDetails = () => {
    if (!hasBusinessInfo) {
      return <AppText style={styles.noPurchasesText}>No business information available</AppText>;
    }
    return (
      <View style={styles.section}>
        <AppText style={styles.sectionTitle}>BUSINESS INFORMATION</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Company*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.company}
                onChangeText={(text) => handleInputChange('company', text)}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.company}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Address*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.address}
                onChangeText={(text) => handleInputChange('address', text)}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.address}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 0.7 }]}>
            <AppText style={styles.label}>City*</AppText>
            <View style={styles.inputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={sellerInfo.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                />
              ) : (
                <AppText style={styles.valueText}>{sellerInfo.city}</AppText>
              )}
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 0.3, marginLeft: 10 }]}>
            <AppText style={styles.label}>PIN Code*</AppText>
            <View style={styles.inputContainer}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={sellerInfo.pinCode}
                  onChangeText={(text) => handleInputChange('pinCode', text)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              ) : (
                <AppText style={styles.valueText}>{sellerInfo.pinCode}</AppText>
              )}
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Years in Business</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.yearsInBusiness}
                onChangeText={(text) => handleInputChange('yearsInBusiness', text)}
                keyboardType="number-pad"
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.yearsInBusiness}</AppText>
            )}
          </View>
        </View>

        <AppText style={styles.sectionTitle}>CONTACT INFORMATION</AppText>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Email*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.email}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Website</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.website}
                onChangeText={(text) => handleInputChange('website', text)}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.website || 'Not specified'}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>GST Number*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.gst}
                onChangeText={(text) => handleInputChange('gst', text)}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.gst}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Contact Person*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.contactPerson}
                onChangeText={(text) => handleInputChange('contactPerson', text)}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.contactPerson}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Contact Number*</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.contactNumber}
                onChangeText={(text) => handleInputChange('contactNumber', text)}
                keyboardType="phone-pad"
                maxLength={10}
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.contactNumber}</AppText>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <AppText style={styles.label}>Brand of Profile Used</AppText>
          <View style={styles.inputContainer}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={sellerInfo.brandProfile}
                editable={false}
                placeholder="e.g., Veka, Aluplast"
              />
            ) : (
              <AppText style={styles.valueText}>{sellerInfo.brandProfile || 'Not specified'}</AppText>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
          disabled={isLoading}
        >
          <AppText style={styles.editButtonText}>
            {isEditing ? 'SAVE CHANGES' : 'EDIT DETAILS'}
          </AppText>
          <Icon
            name={isEditing ? 'save' : 'edit'}
            size={20}
            color="#000"
            style={styles.editIcon}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPurchaseHistory = () => (
    <View style={styles.section}>
      {purchaseHistory.length > 0 ? (
        purchaseHistory.map((purchase) => (
          <View key={purchase.id} style={styles.purchaseCard}>
            <View style={styles.purchaseHeader}>
              <AppText style={styles.purchaseDate}>{purchase.date}</AppText>
            </View>
            <AppText style={styles.purchaseCustomer}>{purchase.customerName}</AppText>

            <View style={styles.purchaseDetails}>
              <AppText style={styles.detailLabel}>Project: {purchase.details.project.name}</AppText>
              <AppText style={styles.detailLabel}>Location: {purchase.details.project.address}</AppText>
              <AppText style={styles.detailLabel}>Area: {purchase.details.project.totalSqFt}</AppText>
            </View>

            <TouchableOpacity
              style={styles.invoiceButton}
              onPress={() => handleOpenInvoice(purchase)}
            >
              <AppText style={styles.invoiceButtonText}>VIEW INVOICE</AppText>
              <Icon name="receipt" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('ContactBuyer', { lead: purchase })}
            >
              <AppText style={styles.invoiceButtonText}>VIEW DETAILS</AppText>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <AppText style={styles.noPurchasesText}>No purchase history available</AppText>
      )}
    </View>
  );
 
  // Calculate GST based on location
  const calculateGST = (amount, customerPinCode, sellerPinCode) => {
    const isIntraState = customerPinCode && sellerPinCode && 
                         customerPinCode.substring(0, 2) === sellerPinCode.substring(0, 2);
    
    if (isIntraState) {
    // if (true) {
      // Intra-state (Within Karnataka) - CGST + SGST @ 9% each
      const gstAmount = amount * 0.18;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;
      return {
        type: 'intra',
        cgst: cgst,
        sgst: sgst,
        total: amount + gstAmount
      };
    } else {
      // Inter-state - IGST @ 18%
      const igst = amount * 0.18;
      return {
        type: 'inter',
        igst: igst,
        total: amount + igst
      };
    }
  };

  // Enhanced convertNumberToWords function for Indian numbering system
const convertNumberToWords = (num) => {
  if (num === 0) return 'Zero Rupees Only';
  
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  
  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];
  
  const convertHundreds = (n) => {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += ones[n] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  };
  
  let result = '';
  let crores = Math.floor(num / 10000000);
  num %= 10000000;
  
  let lakhs = Math.floor(num / 100000);
  num %= 100000;
  
  let thousands = Math.floor(num / 1000);
  num %= 1000;
  
  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
  }
  
  if (thousands > 0) {
    result += convertHundreds(thousands) + 'Thousand ';
  }
  
  if (num > 0) {
    result += convertHundreds(num);
  }
  
  return result.trim() + ' Rupees Only';
};

// Generate unique 4-digit SAC number
const generateSACNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const renderInvoiceModal = () => {
  if (!selectedPurchase) return null;
  
  const totalAmount = selectedPurchase.amount || 0;
  const customerPinCode = selectedPurchase.details.project.pinCode;
  const sellerPinCode = sellerInfo.pinCode;
  
  // Calculate GST inclusive breakdown
  const calculateGSTInclusive = (totalAmount, customerPinCode, sellerPinCode) => {
    const isIntraState = customerPinCode && sellerPinCode && 
                         customerPinCode.substring(0, 2) === sellerPinCode.substring(0, 2);
    
    // Total amount is inclusive of GST (18%)
    const baseAmount = totalAmount / 1.18;
    const totalGST = totalAmount - baseAmount;
    
    // if (isIntraState) {
    if (true) {
      // Intra-state: CGST + SGST @ 9% each
      return {
        type: 'intra',
        baseAmount: baseAmount,
        cgst: totalGST / 2,
        sgst: totalGST / 2,
        totalGST: totalGST,
        total: totalAmount
      };
    } else {
      // Inter-state: IGST @ 18%
      return {
        type: 'inter',
        baseAmount: baseAmount,
        igst: totalGST,
        totalGST: totalGST,
        total: totalAmount
      };
    }
  };
  
  const gstDetails = calculateGSTInclusive(totalAmount, customerPinCode, sellerPinCode);
  const amountInWords = convertNumberToWords(Math.round(gstDetails.total));
  const sacNumber = generateSACNumber();
  
  return (
    <Modal
      visible={invoiceVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCloseInvoice}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <View style={styles.invoiceContainer}>
            {modalReady ? (
              <>
                {/* Modern Header */}
                <View style={styles.modernHeader}>
                  <View style={styles.headerLeft}>
                    <View style={styles.logoContainer}>
                      <Image
                        source={require('../../assets/logo.png')}
                        style={styles.modalLogo}
                        resizeMode="contain"
                      />
                      <View style={styles.companyInfo}>
                        <AppText style={styles.companyName}>UPVC CONNECT</AppText>
                        {/* <AppText style={styles.companyTagline}>Premium Lead Services</AppText> */}
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={handleCloseInvoice}
                    style={styles.closeBtn}
                  >
                    <Icon name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <ScrollView 
                  key={modalKey}
                  ref={scrollRef}
                  style={styles.invoiceScrollView} 
                  showsVerticalScrollIndicator={true}
                  scrollEnabled={true}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.scrollContentContainer}
                  bounces={true}
                  alwaysBounceVertical={false}
                  removeClippedSubviews={false}
                >
            {/* Invoice Title */}
            <View style={styles.titleSection}>
              <AppText style={styles.invoiceTitle}>TAX INVOICE</AppText>
              <View style={styles.titleDivider} />
            </View>

            {/* Invoice Meta Information */}
            <View style={styles.metaGrid}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaLabel}>Invoice Number</AppText>
                  <AppText style={styles.metaValue}>INV-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</AppText>
                </View>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaLabel}>Invoice Date</AppText>
                  <AppText style={styles.metaValue}>{selectedPurchase.date}</AppText>
                </View>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaLabel}>Place of Supply</AppText>
                  <AppText style={styles.metaValue}>
                    {customerPinCode && customerPinCode.substring(0, 2) === '29' ? 'Karnataka' : 'Other State'}
                  </AppText>
                </View>
                <View style={styles.metaItem}>
                  <AppText style={styles.metaLabel}>Supply Type</AppText>
                  <AppText style={styles.metaValue}>
                    {gstDetails.type === 'intra' ? 'Intra-State' : 'Inter-State'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Company Details Card */}
            <View style={styles.detailsCard}>
              <View style={styles.detailsRow}>
                <View style={styles.detailsColumn}>
                  <AppText style={styles.detailsLabel}>FROM</AppText>
                  <AppText style={styles.companyNameBold}>UPVC Connect Pvt Ltd</AppText>
                  <AppText style={styles.detailsText}>14, 1st Main Road, Bank Avenue</AppText>
                  <AppText style={styles.detailsText}>Bengaluru, Karnataka - 560043</AppText>
                  <AppText style={styles.detailsText}>GSTIN: 29AKWPS1667B1ZL</AppText>
                  <AppText style={styles.detailsText2}>Email: contact@upvcconnect.com</AppText>
                </View>
                
                <View style={styles.dividerLine} />
                
                <View style={styles.detailsColumn}>
                  <AppText style={styles.detailsLabel}>BILL TO</AppText>
                  <AppText style={styles.companyNameBold}>{sellerInfo.company}</AppText>
                  <AppText style={styles.detailsText}>{sellerInfo.address}</AppText>
                  <AppText style={styles.detailsText}>{sellerInfo.city} - {sellerInfo.pinCode}</AppText>
                  <AppText style={styles.detailsText}>GSTIN: {sellerInfo.gst}</AppText>
                </View>
              </View>
            </View>

            {/* Services Table with detailsCard UI */}
            <View style={[styles.detailsCard, styles.servicesTable]}>
              <View style={styles.tableHeader}>
                {/* <AppText style={[styles.tableHeaderText, { flex: 3 }]}>Description</AppText> */}
                <AppText style={[styles.tableHeaderText, { flex: 1 }]}>SAC</AppText>
                <AppText style={[styles.tableHeaderText, { flex: 1 }]}>Qty</AppText>
                <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>Rate (₹)</AppText>
                <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>Amount (₹)</AppText>
              </View>
              
              <View style={styles.tableRow}>
                {/* <View style={{ flex: 3 }}>
                  <AppText style={styles.serviceDescription}>Lead Generation Services</AppText>
                  <AppText style={styles.serviceSubtext}>Project: {selectedPurchase.details.project.name}</AppText>
                  <AppText style={styles.serviceSubtext}>Area: {selectedPurchase.details.project.totalSqFt}</AppText>
                </View> */}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <AppText style={styles.tableData}>{sacNumber}</AppText>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <AppText style={styles.tableData}>{selectedPurchase.rawData?.totalQuantity || 1}</AppText>
                </View>
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <AppText style={styles.tableData}>{gstDetails.baseAmount.toFixed(2)}</AppText>
                </View>
                <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                  <AppText style={styles.tableData}>{gstDetails.baseAmount.toFixed(2)}</AppText>
                </View>
              </View>
            </View>

            {/* Totals Section */}
            <View style={styles.totalsSection}>
              <View style={styles.totalsContainer}>
                <View style={styles.totalLine}>
                  <AppText style={styles.totalLabel}>Subtotal</AppText>
                  <AppText style={styles.totalValue}>₹{gstDetails.baseAmount.toFixed(2)}</AppText>
                </View>
                
                {/* {gstDetails.type === 'intra' ? ( */}
                {true ? (
                  <>
                    <View style={styles.totalLine}>
                      <AppText style={styles.totalLabel}>CGST @ 9%</AppText>
                      <AppText style={styles.totalValue}>₹{gstDetails?.cgst?.toFixed(2)}</AppText>
                    </View>
                    <View style={styles.totalLine}>
                      <AppText style={styles.totalLabel}>SGST @ 9%</AppText>
                      <AppText style={styles.totalValue}>₹{gstDetails?.sgst?.toFixed(2)}</AppText>
                    </View>
                  </>
                ) : (
                  <View style={styles.totalLine}>
                    <AppText style={styles.totalLabel}>IGST @ 18%</AppText>
                    <AppText style={styles.totalValue}>₹{gstDetails?.igst?.toFixed(2)}</AppText>
                  </View>
                )}
                
                <View style={styles.totalGSTLine}>
                  <AppText style={styles.totalGSTLabel}>Total Tax</AppText>
                  <AppText style={styles.totalGSTValue}>₹{gstDetails.totalGST.toFixed(2)}</AppText>
                </View>
                
                <View style={styles.grandTotalLine}>
                  <AppText style={styles.grandTotalLabel}>Total Amount</AppText>
                  <AppText style={styles.grandTotalValue}>₹{gstDetails.total.toFixed(2)}</AppText>
                </View>
              </View>
            </View>

            {/* Amount in Words */}
            <View style={styles.amountInWordsSection}>
              <AppText style={styles.amountInWordsLabel}>Amount in Words:</AppText>
              <AppText style={styles.amountInWordsValue}>{amountInWords}</AppText>
            </View>

            {/* Payment Terms */}
            <View style={styles.termsSection}>
              <AppText style={styles.termsTitle}>Payment Terms & Conditions</AppText>
              <View style={styles.termsList}>
                <AppText style={styles.termsItem}>• Payment due upon receipt of invoice</AppText>
                <AppText style={styles.termsItem}>• All prices are inclusive of applicable GST</AppText>
                <AppText style={styles.termsItem}>• Service provided as per agreed terms</AppText>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.modernFooter}>
              <View style={styles.footerDivider} />
              <AppText style={styles.footerTitle}>Thank you for choosing UPVC Connect</AppText>
              {/* <AppText style={styles.footerSubtitle}>Your trusted partner in premium lead generation</AppText> */}
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          {/* Action Buttons - Outside ScrollView */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              onPress={downloadInvoicePDF}
              style={styles.actionButtonBottom}
            >
              <Icon name="get-app" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={printInvoice}
              style={styles.actionButtonBottom}
            >
              <Icon name="print" size={28} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={shareInvoice}
              style={styles.actionButtonBottom}
            >
              <Icon name="share" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
              </>
            ) : (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <AppText>Loading...</AppText>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Logged out',
        text2: 'You have been logged out successfully',
        visibilityTime: 1000,
        onHide: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'UserTypeSelection' }],
            })
          );
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Logout Failed',
        text2: 'Something went wrong while logging out',
        visibilityTime: 1000,
      });
    }
  };

  const handleSwitchUserType = async () => {
    try {
      // Clear all stored data
      await AsyncStorage.clear();

      // Navigate to user type selection
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'UserTypeSelection'}],
        }),
      );

      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Switched Mode',
        text2: 'Please select your user type',
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error('Switch user type error:', error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Error',
        text2: 'Failed to switch user type',
        visibilityTime: 3000,
      });
    }
  };

  // PDF Generation and Sharing Functions
  
  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') {
      return true; // iOS doesn't need this permission
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'UPVC Connect needs access to your storage to save invoice PDFs.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  const generateInvoiceHTML = (purchase) => {
    const totalAmount = purchase.amount || 0;
    const customerPinCode = purchase.details.project.pinCode;
    const sellerPinCode = sellerInfo.pinCode;
    
    // Calculate GST inclusive breakdown
    const calculateGSTInclusive = (totalAmount, customerPinCode, sellerPinCode) => {
      const isIntraState = customerPinCode && sellerPinCode && 
                           customerPinCode.substring(0, 2) === sellerPinCode.substring(0, 2);
      
      const baseAmount = totalAmount / 1.18;
      const totalGST = totalAmount - baseAmount;
      
      return {
        type: 'intra',
        baseAmount: baseAmount,
        cgst: totalGST / 2,
        sgst: totalGST / 2,
        totalGST: totalGST,
        total: totalAmount
      };
    };
    
    const gstDetails = calculateGSTInclusive(totalAmount, customerPinCode, sellerPinCode);
    const amountInWords = convertNumberToWords(Math.round(gstDetails.total));
    const sacNumber = generateSACNumber();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tax Invoice</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #fff;
                color: #000;
            }
            .header {
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .company-name {
                font-size: 24px;
                font-weight: bold;
            }
            .invoice-title {
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                margin: 30px 0;
            }
            .meta-info {
                margin-bottom: 30px;
            }
            .meta-row {
                display: table;
                width: 100%;
                margin-bottom: 10px;
            }
            .meta-item {
                display: table-cell;
                width: 50%;
                vertical-align: top;
                padding-right: 20px;
            }
            .meta-label {
                font-weight: bold;
                font-size: 12px;
                color: #666;
            }
            .meta-value {
                font-size: 14px;
                margin-top: 2px;
            }
            .details-section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #ddd;
            }
            .details-row {
                display: table;
                width: 100%;
            }
            .details-column {
                display: table-cell;
                width: 50%;
                vertical-align: top;
                padding-right: 30px;
            }
            .details-label {
                font-weight: bold;
                font-size: 12px;
                color: #666;
                margin-bottom: 10px;
            }
            .company-name-bold {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 5px;
            }
            .details-text {
                font-size: 14px;
                margin-bottom: 3px;
            }
            .table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .table th, .table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .table th {
                background-color: #f5f5f5;
                font-weight: bold;
                font-size: 12px;
            }
            .table td {
                font-size: 14px;
            }
            .totals-section {
                margin-bottom: 30px;
            }
            .total-line {
                margin-bottom: 8px;
                padding: 5px 0;
            }
            .total-label {
                font-size: 14px;
                float: left;
            }
            .total-value {
                font-size: 14px;
                font-weight: bold;
                float: right;
            }
            .grand-total-line {
                border-top: 2px solid #000;
                padding-top: 10px;
                margin-top: 10px;
                clear: both;
            }
            .grand-total-label {
                font-size: 16px;
                font-weight: bold;
                float: left;
            }
            .grand-total-value {
                font-size: 16px;
                font-weight: bold;
                float: right;
            }
            .amount-words {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f9f9f9;
                clear: both;
            }
            .amount-words-label {
                font-weight: bold;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .amount-words-value {
                font-size: 14px;
                font-style: italic;
            }
            .terms-section {
                margin-bottom: 30px;
            }
            .terms-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
            }
            .terms-item {
                font-size: 14px;
                margin-bottom: 5px;
            }
            .footer {
                text-align: center;
                border-top: 1px solid #ddd;
                padding-top: 20px;
            }
            .footer-title {
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">UPVC CONNECT</div>
        </div>

        <div class="invoice-title">TAX INVOICE</div>

        <div class="meta-info">
            <div class="meta-row">
                <div class="meta-item">
                    <div class="meta-label">Invoice Number</div>
                    <div class="meta-value">${invoiceNumber}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Invoice Date</div>
                    <div class="meta-value">${purchase.date}</div>
                </div>
            </div>
            <div class="meta-row">
                <div class="meta-item">
                    <div class="meta-label">Place of Supply</div>
                    <div class="meta-value">${customerPinCode && customerPinCode.substring(0, 2) === '29' ? 'Karnataka' : 'Other State'}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Supply Type</div>
                    <div class="meta-value">${gstDetails.type === 'intra' ? 'Intra-State' : 'Inter-State'}</div>
                </div>
            </div>
        </div>

        <div class="details-section">
            <div class="details-row">
                <div class="details-column">
                    <div class="details-label">FROM</div>
                    <div class="company-name-bold">UPVC Connect Pvt Ltd</div>
                    <div class="details-text">14, 1st Main Road, Bank Avenue</div>
                    <div class="details-text">Bengaluru, Karnataka - 560043</div>
                    <div class="details-text">GSTIN: 29AKWPS1667B1ZL</div>
                    <div class="details-text">Email: contact@upvcconnect.com</div>
                </div>
                <div class="details-column">
                    <div class="details-label">BILL TO</div>
                    <div class="company-name-bold">${sellerInfo.company}</div>
                    <div class="details-text">${sellerInfo.address}</div>
                    <div class="details-text">${sellerInfo.city} - ${sellerInfo.pinCode}</div>
                    <div class="details-text">GSTIN: ${sellerInfo.gst}</div>
                </div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>SAC</th>
                    <th>Qty</th>
                    <th>Rate (₹)</th>
                    <th>Amount (₹)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${sacNumber}</td>
                    <td>${purchase.rawData?.totalQuantity || 1}</td>
                    <td>${gstDetails.baseAmount.toFixed(2)}</td>
                    <td>${gstDetails.baseAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals-section">
            <div class="total-line">
                <span class="total-label">Subtotal</span>
                <span class="total-value">₹${gstDetails.baseAmount.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span class="total-label">CGST @ 9%</span>
                <span class="total-value">₹${gstDetails.cgst.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span class="total-label">SGST @ 9%</span>
                <span class="total-value">₹${gstDetails.sgst.toFixed(2)}</span>
            </div>
            <div class="total-line">
                <span class="total-label">Total Tax</span>
                <span class="total-value">₹${gstDetails.totalGST.toFixed(2)}</span>
            </div>
            <div class="grand-total-line">
                <span class="grand-total-label">Total Amount</span>
                <span class="grand-total-value">₹${gstDetails.total.toFixed(2)}</span>
            </div>
        </div>

        <div class="amount-words">
            <div class="amount-words-label">Amount in Words:</div>
            <div class="amount-words-value">${amountInWords}</div>
        </div>

        <div class="terms-section">
            <div class="terms-title">Payment Terms & Conditions</div>
            <div class="terms-item">• Payment due upon receipt of invoice</div>
            <div class="terms-item">• All prices are inclusive of applicable GST</div>
            <div class="terms-item">• Service provided as per agreed terms</div>
        </div>

        <div class="footer">
            <div class="footer-title">Thank you for choosing UPVC Connect</div>
        </div>
    </body>
    </html>
    `;
  };

  const downloadInvoicePDF = async () => {
    if (!selectedPurchase) return null;

    try {
      Toast.show({
        type: 'info',
        position: 'top',
        text1: 'Generating PDF',
        text2: 'Please wait...',
        visibilityTime: 2000,
      });

      const htmlContent = generateInvoiceHTML(selectedPurchase);
      
      // Simplified options for better PDF generation
      const options = {
        html: htmlContent,
        fileName: `Invoice_${selectedPurchase.date.replace(/\//g, '-')}`,
        directory: 'Downloads',
        base64: false, // Set to false for better file generation
        width: 595,
        height: 842,
        padding: 20,
        bgColor: '#FFFFFF',
      };

      console.log('Starting PDF generation...');
      const pdf = await RNHTMLtoPDF.convert(options);
      console.log('PDF generation result:', pdf);
      
      if (pdf && pdf.filePath) {
        const pdfPath = `file://${pdf.filePath}`;
        
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'PDF Downloaded Successfully!',
          text2: `Saved to: ${pdf.filePath}`,
          visibilityTime: 5000,
        });
        
        return pdfPath;
      } else {
        console.log('PDF generation failed - no file path');
        throw new Error('PDF generation failed - no file path returned');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error details:', error.message);
      
      // Check if it's a permission error
      if (error.message.includes('permission') || error.message.includes('Permission')) {
        // Request permission only when there's an error
        const hasPermission = await requestStoragePermission();
        if (hasPermission) {
          // Retry PDF generation after permission is granted
          Toast.show({
            type: 'info',
            position: 'top',
            text1: 'Retrying PDF Generation',
            text2: 'Please wait...',
            visibilityTime: 2000,
          });
          
          // Retry the PDF generation
          try {
            const retryPdf = await RNHTMLtoPDF.convert(options);
            if (retryPdf && retryPdf.filePath) {
              const pdfPath = `file://${retryPdf.filePath}`;
              
              Toast.show({
                type: 'success',
                position: 'top',
                text1: 'PDF Downloaded Successfully',
                text2: `Saved to: ${retryPdf.filePath}`,
                visibilityTime: 5000,
              });
              
              return pdfPath;
            }
          } catch (retryError) {
            console.error('Retry PDF generation error:', retryError);
          }
        } else {
          Alert.alert(
            'Permission Required', 
            'Storage permission is needed to save PDF files. Please allow permission and try again.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // Show a more helpful error message
      let errorMessage = 'Unable to generate PDF. Please try again.';
      if (error.message.includes('couldn\'t load object')) {
        errorMessage = 'PDF generation failed. Please check your device storage and try again.';
      }
      
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'PDF Generation Failed',
        text2: errorMessage,
        visibilityTime: 4000,
      });
      
      return null;
    }
  };

  const printInvoice = async () => {
    try {
      const pdfPath = await downloadInvoicePDF();
      if (pdfPath) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (Platform.OS === 'android') {
          try {
            await Linking.openURL(pdfPath);
          } catch (error) {
            Alert.alert(
              'Print Invoice',
              `PDF has been downloaded successfully!\n\nFile location: ${pdfPath}\n\nYou can now open this file with any PDF viewer to print.`,
              [{ text: 'OK' }]
            );
          }
        } else {
          await shareInvoice();
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      Alert.alert('Print Failed', 'Unable to open PDF for printing');
    }
  };

  const shareInvoice = async () => {
    try {
      const pdfPath = await downloadInvoicePDF();
      if (pdfPath) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const shareOptions = {
          title: 'Share Invoice',
          message: `Invoice for ${selectedPurchase.customerName}`,
          url: pdfPath,
          type: 'application/pdf',
          subject: `Invoice - ${selectedPurchase.customerName}`,
          filename: `Invoice_${selectedPurchase.date.replace(/\//g, '-')}.pdf`,
        };
        
        await RNShare.open(shareOptions);
      }
    } catch (error) {
      console.error('Share error:', error);
      
      if (error.message && error.message.includes('User did not share')) {
        return;
      }
      
      Alert.alert('Share Failed', 'Unable to share invoice');
    }
  };

  if (isLoading) {
    return (
      <View style={{ paddingTop: insets.top, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <AppText>Loading...</AppText>
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.loginPromptContainer}>
        <View style={styles.loginCard}>
          <Icon name="lock" size={40} color="#333" style={{ marginBottom: 10 }} />
          <AppText style={styles.loginTitle}>
            Login Required
          </AppText>
          <AppText style={styles.loginMessage}>
            Please log in to view your details and purchase history.
          </AppText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('SellerLoginScreen')}
          >
            <AppText style={styles.loginButtonText}>
              GO TO LOGIN
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'purchase' && styles.activeTab]}
            onPress={() => setActiveTab('purchase')}
          >
            <AppText style={[styles.tabText, activeTab === 'purchase' && styles.activeTabText]}>
              PURCHASE HISTORY
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'personal' && styles.activeTab]}
            onPress={() => setActiveTab('personal')}
          >
            <AppText style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
              BUSINESS INFORMATION
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.contentContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'personal' ? (
            <>
              {renderPersonalDetails()}

              {/* Additional Sections */}
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowTermsModal(true)}
              >
                <AppText style={styles.menuText}>TERMS & CONDITIONS</AppText>
                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowAboutModal(true)}
              >
                <AppText style={styles.menuText}>ABOUT US</AppText>
                <Icon name="chevron-right" size={24} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setShowContactModal(true)}
              >
                <AppText style={styles.menuText}>CONTACT US</AppText>
                <Icon name="chevron-right" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.switchItem]}
                onPress={handleSwitchUserType}
              >
                <AppText style={[styles.menuText, styles.switchText]}>SWITCH TO BUYER MODE</AppText>
                <Icon name="swap-horiz" size={24} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.logoutItem]}
                onPress={handleLogout}
              >
                <AppText style={[styles.menuText, styles.logoutText]}>LOGOUT</AppText>
                <Icon name="exit-to-app" size={24} color="#f44336" />
              </TouchableOpacity>
            </>
          ) : (
            renderPurchaseHistory()
          )}
        </ScrollView>

        {renderInvoiceModal()}
        <ContactUsModal
          visible={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
        <AboutUsModal
          visible={showAboutModal}
          onClose={() => setShowAboutModal(false)}
        />
        <TermsAndPrivacyModal
          visible={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 50,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 1
  },
  activeTabText: {
    color: '#000',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#f9f9f9',
  },
  input: {
    fontSize: 14,
    color: '#000',
  },
  valueText: {
    fontSize: 14,
    color: '#000',
  },
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  editButtonText: {
    fontSize: 14,
    color: '#000',
    marginRight: 10,
    letterSpacing: 2,
  },
  editIcon: {
    marginTop: 2,
  },
  purchaseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  purchaseDate: {
    fontSize: 14,
    color: '#666',
  },
  purchaseCustomer: {
    fontSize: 15,
    color: '#000',
    marginBottom: 12,
  },
  purchaseDetails: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  invoiceButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
  },
  invoiceButtonText: {
    fontSize: 12,
    color: '#000',
    marginRight: 8,
    letterSpacing: 2
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 14,
    color: '#000',
    letterSpacing: 2,
  },
  switchItem: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchText: {
    color: '#000',
  },
  logoutItem: {
    marginTop: 20,
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#f44336',
  },
  noPurchasesText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loginPromptContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#f9f9f9',
    padding: 25,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: '90%',
  },
  loginTitle: {
    fontSize: 20,
    color: '#222',
    marginBottom: 10,
  },
  loginMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  invoiceContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'column',
  },
  
  // Modern Header Styles
  modernHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalLogo: {
    width: 100,
    height: 50,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 1,
  },
  companyTagline: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },

  // Content Styles
  invoiceScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: { 
    paddingBottom: 2,
  },
  
  // Title Section
  titleSection: {
    alignItems: 'center',
    paddingVertical: 23,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
  },
  titleDivider: {
    width: 80,
    height: 3,
    backgroundColor: '#000',
    marginTop: 8,
  },

  // Meta Information Grid
  metaGrid: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },

  // Details Card
  detailsCard: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  servicesTable: {
    padding: 0,
    overflow: 'visible',
  },
  detailsRow: {
    flexDirection: 'col',
  },
  detailsColumn: {
    flex: 1,
  },
  dividerLine: {
    width: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 16,
  },
  detailsLabel: { 
    fontSize: 12,
    color: '#6c757d',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  companyNameBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 2,
    lineHeight: 18,
  },
  detailsText2: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 10,
    lineHeight: 18,
  },

  // Table Styles with detailsCard UI
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    minHeight: 80,
  },
  serviceDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  serviceSubtext: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  tableData: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },

  // Totals Section
  totalsSection: {
    marginBottom: 24,
  },
  totalsContainer: {
    minWidth: 280,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  totalGSTLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 2,
    borderTopColor: '#dee2e6',
    borderBottomColor: '#000',
    marginTop: 8,
    marginBottom: 8,
  },
  totalGSTLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '600',
  },
  totalGSTValue: {
    fontSize: 15,
    color: '#000',
    fontWeight: '700',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#000',
    marginHorizontal: -20,
    marginBottom: -20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  grandTotalValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  // Amount in Words
  amountInWordsSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  amountInWordsLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  amountInWordsValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Terms Section
  termsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  termsList: {
    marginLeft: 8,
  },
  termsItem: {
    fontSize: 13,
    color: '#495057',
    marginBottom: 6,
    lineHeight: 18,
  },

  // Modern Footer
  modernFooter: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerDivider: {
    width: '100%',
    height: 2,
    backgroundColor: '#e9ecef',
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerSubtitle: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },

  // Action Buttons at Bottom
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#f8f8f8',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginHorizontal: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonBottom: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default SellerAccountPage;
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Image,
//   Modal,
//   TextInput,
//   Alert,
//   RefreshControl,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import AppText from '../../components/AppText';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import axios from 'axios';
// import Toast from 'react-native-toast-message';

// const SellerAccountPage = ({ navigation }) => {
//   const insets = useSafeAreaInsets();
//   const [activeTab, setActiveTab] = useState('purchase');
//   const [isEditing, setIsEditing] = useState(false);
//   const [invoiceVisible, setInvoiceVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedPurchase, setSelectedPurchase] = useState(null);

//   console.log("selectedPurchase : " , selectedPurchase)

//   // Seller information
//   const [sellerInfo, setSellerInfo] = useState({
//     company: '',
//     address: '',
//     city: '',
//     pinCode: '',
//     email: '',
//     gst: '',
//     contactPerson: '',
//     contactNumber: '',
//     brandProfile: '',
//     yearsInBusiness: '',
//     website: ''
//   });

//   // Purchase history
//   const [purchaseHistory, setPurchaseHistory] = useState([]);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     fetchSellerData();
//   }, []);

//   const fetchSellerData = async () => {
//     try {
//       const storedToken = await AsyncStorage.getItem('sellerToken');
//       setToken(storedToken);
//       if (!storedToken) {
//         return;
//       }
//       const response = await axios.get('https://upvcconnect.com/api/sellers', {
//         headers: {
//           Authorization: `Bearer ${storedToken}`,
//         },
//       });
//       if (response.data.success) {
//         const seller = response.data.seller;
//         setSellerInfo({
//           company: seller.companyName || '',
//           address: seller.address || '',
//           city: seller.city || '',
//           pinCode: seller.pinCode || '',
//           email: seller.email || '',
//           gst: seller.gstNumber || '',
//           contactPerson: seller.contactPerson || '',
//           contactNumber: seller.phoneNumber || '',
//           brandProfile: seller.brandOfProfileUsed || '',
//           yearsInBusiness: seller.yearsInBusiness?.toString() || '',
//           website: seller.website || ''
//         });

//         // Format purchase history from leads
//         if (seller.leads && seller.leads.length > 0) {
//           const formattedPurchases = seller.leads
//             .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//             .map(lead => ({
//               id: lead._id,
//               rawData: lead,
//               date: new Date(lead.createdAt).toISOString().split('T')[0],
//               customerName: lead.contactInfo.name,
//               amount: lead.price,
//               details: {
//                 personal: {
//                   fullName: lead.contactInfo.name,
//                   contactNumber: lead.contactInfo.contactNumber,
//                   whatsappNumber: lead.contactInfo.whatsappNumber,
//                   email: lead.contactInfo.email,
//                 },
//                 project: {
//                   name: lead.projectInfo.name,
//                   address: lead.projectInfo.address,
//                   pinCode: lead.projectInfo.pincode,
//                   stage: lead.projectInfo.stage,
//                   timeline: lead.projectInfo.timeline,
//                   totalSqFt: `${lead.totalSqft} sq ft`,
//                   category: lead.category?.name || 'Not specified',
//                 },
//               }
//             }));
//           setPurchaseHistory(formattedPurchases);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching seller data:', error);
//       Alert.alert('Error', 'Failed to fetch seller data');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     setIsLoading(true);
//     await fetchSellerData();
//     setRefreshing(false);
//   };

//   const handleInputChange = (field, value) => {
//     setSellerInfo(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSaveChanges = async () => {
//     try {
//       setIsLoading(true);
//       const token = await AsyncStorage.getItem('sellerToken');
//       if (!token) {
//         Alert.alert("Please Login");
//         return;
//       }

//       const updateData = {
//         companyName: sellerInfo.company,
//         address: sellerInfo.address,
//         city: sellerInfo.city,
//         pinCode: sellerInfo.pinCode,
//         email: sellerInfo.email,
//         gstNumber: sellerInfo.gst,
//         contactPerson: sellerInfo.contactPerson,
//         phoneNumber: sellerInfo.contactNumber,
//         brandOfProfileUsed: sellerInfo.brandProfile,
//         yearsInBusiness: parseInt(sellerInfo.yearsInBusiness) || 0,
//         website: sellerInfo.website
//       };
//       alert("Your request for verification has been submited");
//       setIsEditing(false);
//       return;
//       const response = await axios.put(
//         'https://upvcconnect.com/api/sellers',
//         updateData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       if (response.data.success) {
//         Alert.alert('Success', 'Profile updated successfully');
//         setIsEditing(false);
//       } else {
//         throw new Error(response.data.message || 'Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Error updating seller profile:', error);
//       Alert.alert('Error', error.message || 'Failed to update profile');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const hasBusinessInfo = Object.values(sellerInfo).some(val => val !== '');

//   const renderPersonalDetails = () => {
//     if (!hasBusinessInfo) {
//       return <AppText style={styles.noPurchasesText}>No business information available</AppText>;
//     }
//     return (
//       <View style={styles.section}>
//         <AppText style={styles.sectionTitle}>BUSINESS INFORMATION</AppText>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Company*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.company}
//                 onChangeText={(text) => handleInputChange('company', text)}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.company}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Address*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.address}
//                 onChangeText={(text) => handleInputChange('address', text)}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.address}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputRow}>
//           <View style={[styles.inputGroup, { flex: 0.7 }]}>
//             <AppText style={styles.label}>City*</AppText>
//             <View style={styles.inputContainer}>
//               {isEditing ? (
//                 <TextInput
//                   style={styles.input}
//                   value={sellerInfo.city}
//                   onChangeText={(text) => handleInputChange('city', text)}
//                 />
//               ) : (
//                 <AppText style={styles.valueText}>{sellerInfo.city}</AppText>
//               )}
//             </View>
//           </View>
//           <View style={[styles.inputGroup, { flex: 0.3, marginLeft: 10 }]}>
//             <AppText style={styles.label}>PIN Code*</AppText>
//             <View style={styles.inputContainer}>
//               {isEditing ? (
//                 <TextInput
//                   style={styles.input}
//                   value={sellerInfo.pinCode}
//                   onChangeText={(text) => handleInputChange('pinCode', text)}
//                   keyboardType="number-pad"
//                   maxLength={6}
//                 />
//               ) : (
//                 <AppText style={styles.valueText}>{sellerInfo.pinCode}</AppText>
//               )}
//             </View>
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Years in Business</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.yearsInBusiness}
//                 onChangeText={(text) => handleInputChange('yearsInBusiness', text)}
//                 keyboardType="number-pad"
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.yearsInBusiness}</AppText>
//             )}
//           </View>
//         </View>

//         <AppText style={styles.sectionTitle}>CONTACT INFORMATION</AppText>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Email*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.email}
//                 onChangeText={(text) => handleInputChange('email', text)}
//                 keyboardType="email-address"
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.email}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Website</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.website}
//                 onChangeText={(text) => handleInputChange('website', text)}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.website || 'Not specified'}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>GST Number*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.gst}
//                 onChangeText={(text) => handleInputChange('gst', text)}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.gst}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Contact Person*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.contactPerson}
//                 onChangeText={(text) => handleInputChange('contactPerson', text)}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.contactPerson}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Contact Number*</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.contactNumber}
//                 onChangeText={(text) => handleInputChange('contactNumber', text)}
//                 keyboardType="phone-pad"
//                 maxLength={10}
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.contactNumber}</AppText>
//             )}
//           </View>
//         </View>

//         <View style={styles.inputGroup}>
//           <AppText style={styles.label}>Brand of Profile Used</AppText>
//           <View style={styles.inputContainer}>
//             {isEditing ? (
//               <TextInput
//                 style={styles.input}
//                 value={sellerInfo.brandProfile}
//                 editable={false}
//                 placeholder="e.g., Veka, Aluplast"
//               />
//             ) : (
//               <AppText style={styles.valueText}>{sellerInfo.brandProfile || 'Not specified'}</AppText>
//             )}
//           </View>
//         </View>

//         <TouchableOpacity
//           style={styles.editButton}
//           onPress={() => isEditing ? handleSaveChanges() : setIsEditing(true)}
//           disabled={isLoading}
//         >
//           <AppText style={styles.editButtonText}>
//             {isEditing ? 'SAVE CHANGES' : 'EDIT DETAILS'}
//           </AppText>
//           <Icon
//             name={isEditing ? 'save' : 'edit'}
//             size={20}
//             color="#000"
//             style={styles.editIcon}
//           />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   const renderPurchaseHistory = () => (
//     <View style={styles.section}>
//       {purchaseHistory.length > 0 ? (
//         purchaseHistory.map((purchase) => (
//           <View key={purchase.id} style={styles.purchaseCard}>
//             <View style={styles.purchaseHeader}>
//               <AppText style={styles.purchaseDate}>{purchase.date}</AppText>
//             </View>
//             <AppText style={styles.purchaseCustomer}>{purchase.customerName}</AppText>

//             <View style={styles.purchaseDetails}>
//               <AppText style={styles.detailLabel}>Project: {purchase.details.project.name}</AppText>
//               <AppText style={styles.detailLabel}>Location: {purchase.details.project.address}</AppText>
//               <AppText style={styles.detailLabel}>Area: {purchase.details.project.totalSqFt}</AppText>
//             </View>

//             <TouchableOpacity
//               style={styles.invoiceButton}
//               onPress={() => {
//                 setSelectedPurchase(purchase);
//                 setInvoiceVisible(true);
//               }}
//             >
//               <AppText style={styles.invoiceButtonText}>VIEW INVOICE</AppText>
//               <Icon name="receipt" size={20} color="#000" />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.detailsButton}
//               onPress={() => navigation.navigate('ContactBuyer', { lead: purchase })}
//             >
//               <AppText style={styles.invoiceButtonText}>VIEW DETAILS</AppText>
//             </TouchableOpacity>
//           </View>
//         ))
//       ) : (
//         <AppText style={styles.noPurchasesText}>No purchase history available</AppText>
//       )}
//     </View>
//   );
 
//   // Calculate GST based on location
//   const calculateGST = (amount, customerPinCode, sellerPinCode) => {
//     const isIntraState = customerPinCode && sellerPinCode && 
//                          customerPinCode.substring(0, 2) === sellerPinCode.substring(0, 2);
    
//     if (isIntraState) {
//       // Intra-state (Within Karnataka) - CGST + SGST @ 9% each
//       const gstAmount = amount * 0.18;
//       const cgst = gstAmount / 2;
//       const sgst = gstAmount / 2;
//       return {
//         type: 'intra',
//         cgst: cgst,
//         sgst: sgst,
//         total: amount + gstAmount
//       };
//     } else {
//       // Inter-state - IGST @ 18%
//       const igst = amount * 0.18;
//       return {
//         type: 'inter',
//         igst: igst,
//         total: amount + igst
//       };
//     }
//   };

//   // Enhanced convertNumberToWords function for Indian numbering system
// const convertNumberToWords = (num) => {
//   if (num === 0) return 'Zero Rupees Only';
  
//   const ones = [
//     '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
//     'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 
//     'Seventeen', 'Eighteen', 'Nineteen'
//   ];
  
//   const tens = [
//     '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
//   ];
  
//   const convertHundreds = (n) => {
//     let result = '';
    
//     if (n >= 100) {
//       result += ones[Math.floor(n / 100)] + ' Hundred ';
//       n %= 100;
//     }
    
//     if (n >= 20) {
//       result += tens[Math.floor(n / 10)] + ' ';
//       n %= 10;
//     } else if (n >= 10) {
//       result += ones[n] + ' ';
//       return result;
//     }
    
//     if (n > 0) {
//       result += ones[n] + ' ';
//     }
    
//     return result;
//   };
  
//   let result = '';
//   let crores = Math.floor(num / 10000000);
//   num %= 10000000;
  
//   let lakhs = Math.floor(num / 100000);
//   num %= 100000;
  
//   let thousands = Math.floor(num / 1000);
//   num %= 1000;
  
//   if (crores > 0) {
//     result += convertHundreds(crores) + 'Crore ';
//   }
  
//   if (lakhs > 0) {
//     result += convertHundreds(lakhs) + 'Lakh ';
//   }
  
//   if (thousands > 0) {
//     result += convertHundreds(thousands) + 'Thousand ';
//   }
  
//   if (num > 0) {
//     result += convertHundreds(num);
//   }
  
//   return result.trim() + ' Rupees Only';
// };

// const renderInvoiceModal = () => {
//   if (!selectedPurchase) return null;
  
//   const totalAmount = selectedPurchase.amount || 0;
//   const customerPinCode = selectedPurchase.details.project.pinCode;
//   const sellerPinCode = sellerInfo.pinCode;
  
//   // Calculate GST inclusive breakdown
//   const calculateGSTInclusive = (totalAmount, customerPinCode, sellerPinCode) => {
//     const isIntraState = customerPinCode && sellerPinCode && 
//                          customerPinCode.substring(0, 2) === sellerPinCode.substring(0, 2);
    
//     // Total amount is inclusive of GST (18%)
//     const baseAmount = totalAmount / 1.18;
//     const totalGST = totalAmount - baseAmount;
    
//     if (isIntraState) {
//       // Intra-state: CGST + SGST @ 9% each
//       return {
//         type: 'intra',
//         baseAmount: baseAmount,
//         cgst: totalGST / 2,
//         sgst: totalGST / 2,
//         totalGST: totalGST,
//         total: totalAmount
//       };
//     } else {
//       // Inter-state: IGST @ 18%
//       return {
//         type: 'inter',
//         baseAmount: baseAmount,
//         igst: totalGST,
//         totalGST: totalGST,
//         total: totalAmount
//       };
//     }
//   };
  
//   const gstDetails = calculateGSTInclusive(totalAmount, customerPinCode, sellerPinCode);
//   const amountInWords = convertNumberToWords(Math.round(gstDetails.total));
  
//   return (
//     <Modal
//       visible={invoiceVisible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => setInvoiceVisible(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.invoiceContainer}>
//           {/* Modern Header */}
//           <View style={styles.modernHeader}>
//             <View style={styles.headerLeft}>
//               <View style={styles.logoContainer}>
//                 <View style={styles.logoIcon}>
//                   <AppText style={styles.logoText}>U</AppText>
//                 </View>
//                 <View style={styles.companyInfo}>
//                   <AppText style={styles.companyName}>UPVC CONNECT</AppText>
//                   <AppText style={styles.companyTagline}>Premium Lead Services</AppText>
//                 </View>
//               </View>
//             </View>
//             <TouchableOpacity 
//               onPress={() => setInvoiceVisible(false)}
//               style={styles.closeBtn}
//             >
//               <Icon name="close" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>

//           <ScrollView style={styles.invoiceScrollView} showsVerticalScrollIndicator={false}>
//             {/* Invoice Title */}
//             <View style={styles.titleSection}>
//               <AppText style={styles.invoiceTitle}>TAX INVOICE</AppText>
//               <View style={styles.titleDivider} />
//             </View>

//             {/* Invoice Meta Information */}
//             <View style={styles.metaGrid}>
//               <View style={styles.metaRow}>
//                 <View style={styles.metaItem}>
//                   <AppText style={styles.metaLabel}>Invoice Number</AppText>
//                   <AppText style={styles.metaValue}>INV-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}</AppText>
//                 </View>
//                 <View style={styles.metaItem}>
//                   <AppText style={styles.metaLabel}>Invoice Date</AppText>
//                   <AppText style={styles.metaValue}>{selectedPurchase.date}</AppText>
//                 </View>
//               </View>
//               <View style={styles.metaRow}>
//                 <View style={styles.metaItem}>
//                   <AppText style={styles.metaLabel}>Place of Supply</AppText>
//                   <AppText style={styles.metaValue}>
//                     {customerPinCode && customerPinCode.substring(0, 2) === '29' ? 'Karnataka' : 'Other State'}
//                   </AppText>
//                 </View>
//                 <View style={styles.metaItem}>
//                   <AppText style={styles.metaLabel}>Supply Type</AppText>
//                   <AppText style={styles.metaValue}>
//                     {gstDetails.type === 'intra' ? 'Intra-State' : 'Inter-State'}
//                   </AppText>
//                 </View>
//               </View>
//             </View>

//             {/* Company Details Card */}
//             <View style={styles.detailsCard}>
//               <View style={styles.detailsRow}>
//                 <View style={styles.detailsColumn}>
//                   <AppText style={styles.detailsLabel}>FROM</AppText>
//                   <AppText style={styles.companyNameBold}>UPVC Connect Pvt Ltd</AppText>
//                   <AppText style={styles.detailsText}>14, 1st Main Road, Bank Avenue</AppText>
//                   <AppText style={styles.detailsText}>Bengaluru, Karnataka - 560043</AppText>
//                   <AppText style={styles.detailsText}>GSTIN: 29AKWPS1667B1ZL</AppText>
//                   <AppText style={styles.detailsText2}>Email: contact@upvcconnect.com</AppText>
//                 </View>
                
//                 <View style={styles.dividerLine} />
                
//                 <View style={styles.detailsColumn}>
//                   <AppText style={styles.detailsLabel}>BILL TO</AppText>
//                   <AppText style={styles.companyNameBold}>{sellerInfo.company}</AppText>
//                   <AppText style={styles.detailsText}>{sellerInfo.address}</AppText>
//                   <AppText style={styles.detailsText}>{sellerInfo.city} - {sellerInfo.pinCode}</AppText>
//                   <AppText style={styles.detailsText}>GSTIN: {sellerInfo.gst}</AppText>
//                 </View>
//               </View>
//             </View>

//             {/* Services Table */}
//             <View style={styles.modernTable}>
//               <View style={styles.tableHeader}>
//                 <AppText style={[styles.tableHeaderText, { flex: 3 }]}>Description</AppText>
//                 <AppText style={[styles.tableHeaderText, { flex: 1 }]}>SAC</AppText>
//                 <AppText style={[styles.tableHeaderText, { flex: 1 }]}>Qty</AppText>
//                 <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>Rate (₹)</AppText>
//                 <AppText style={[styles.tableHeaderText, { flex: 1.5 }]}>Amount (₹)</AppText>
//               </View>
              
//               <View style={styles.tableRow}>
//                 <View style={{ flex: 3 }}>
//                   <AppText style={styles.serviceDescription}>Lead Generation Services</AppText>
//                   <AppText style={styles.serviceSubtext}>Project: {selectedPurchase.details.project.name}</AppText>
//                   <AppText style={styles.serviceSubtext}>Area: {selectedPurchase.details.project.totalSqFt}</AppText>
//                 </View>
//                 <View style={{ flex: 1, alignItems: 'center' }}>
//                   <AppText style={styles.tableData}>9983</AppText>
//                 </View>
//                 <View style={{ flex: 1, alignItems: 'center' }}>
//                   <AppText style={styles.tableData}>{selectedPurchase.rawData?.totalQuantity || 1}</AppText>
//                 </View>
//                 <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
//                   <AppText style={styles.tableData}>{gstDetails.baseAmount.toFixed(2)}</AppText>
//                 </View>
//                 <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
//                   <AppText style={styles.tableData}>{gstDetails.baseAmount.toFixed(2)}</AppText>
//                 </View>
//               </View>
//             </View>

//             {/* Totals Section */}
//             <View style={styles.totalsSection}>
//               <View style={styles.totalsContainer}>
//                 <View style={styles.totalLine}>
//                   <AppText style={styles.totalLabel}>Subtotal</AppText>
//                   <AppText style={styles.totalValue}>₹{gstDetails.baseAmount.toFixed(2)}</AppText>
//                 </View>
                
//                 {gstDetails.type === 'intra' ? (
//                   <>
//                     <View style={styles.totalLine}>
//                       <AppText style={styles.totalLabel}>CGST @ 9%</AppText>
//                       <AppText style={styles.totalValue}>₹{gstDetails.cgst.toFixed(2)}</AppText>
//                     </View>
//                     <View style={styles.totalLine}>
//                       <AppText style={styles.totalLabel}>SGST @ 9%</AppText>
//                       <AppText style={styles.totalValue}>₹{gstDetails.sgst.toFixed(2)}</AppText>
//                     </View>
//                   </>
//                 ) : (
//                   <View style={styles.totalLine}>
//                     <AppText style={styles.totalLabel}>IGST @ 18%</AppText>
//                     <AppText style={styles.totalValue}>₹{gstDetails.igst.toFixed(2)}</AppText>
//                   </View>
//                 )}
                
//                 <View style={styles.totalGSTLine}>
//                   <AppText style={styles.totalGSTLabel}>Total Tax</AppText>
//                   <AppText style={styles.totalGSTValue}>₹{gstDetails.totalGST.toFixed(2)}</AppText>
//                 </View>
                
//                 <View style={styles.grandTotalLine}>
//                   <AppText style={styles.grandTotalLabel}>Total Amount</AppText>
//                   <AppText style={styles.grandTotalValue}>₹{gstDetails.total.toFixed(2)}</AppText>
//                 </View>
//               </View>
//             </View>

//             {/* Amount in Words */}
//             <View style={styles.amountInWordsSection}>
//               <AppText style={styles.amountInWordsLabel}>Amount in Words:</AppText>
//               <AppText style={styles.amountInWordsValue}>{amountInWords}</AppText>
//             </View>

//             {/* Payment Terms */}
//             <View style={styles.termsSection}>
//               <AppText style={styles.termsTitle}>Payment Terms & Conditions</AppText>
//               <View style={styles.termsList}>
//                 <AppText style={styles.termsItem}>• Payment due upon receipt of invoice</AppText>
//                 <AppText style={styles.termsItem}>• All prices are inclusive of applicable GST</AppText>
//                 <AppText style={styles.termsItem}>• Service provided as per agreed terms</AppText>
//               </View>
//             </View>

//             {/* Footer */}
//             <View style={styles.modernFooter}>
//               <View style={styles.footerDivider} />
//               <AppText style={styles.footerTitle}>Thank you for choosing UPVC Connect</AppText>
//               <AppText style={styles.footerSubtitle}>Your trusted partner in premium lead generation</AppText>
              
//               <TouchableOpacity 
//                 style={styles.downloadButton}
//                 onPress={() => alert('Downloading invoice...')}
//               >
//                 <Icon name="get-app" size={20} color="#fff" />
//                 <AppText style={styles.downloadButtonText}>Download PDF</AppText>
//               </TouchableOpacity>
//             </View>

//             <View style={styles.bottomSpacer} />
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

//   const handleLogout = async () => {
//     try {
//       await AsyncStorage.clear();
//       Toast.show({
//         type: 'success',
//         position: 'top',
//         text1: 'Logged out',
//         text2: 'You have been logged out successfully',
//         visibilityTime: 1000,
//         onHide: () => {
//           navigation.replace('SellerMain');
//         }
//       });
//     } catch (error) {
//       console.error('Error during logout:', error);
//       Toast.show({
//         type: 'error',
//         position: 'top',
//         text1: 'Logout Failed',
//         text2: 'Something went wrong while logging out',
//         visibilityTime: 1000,
//       });
//     }
//   };

//   if (isLoading) {
//     return (
//       <View style={{ paddingTop: insets.top, flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
//         <AppText>Loading...</AppText>
//       </View>
//     );
//   }

//   if (!token) {
//     return (
//       <View style={styles.loginPromptContainer}>
//         <View style={styles.loginCard}>
//           <Icon name="lock" size={40} color="#333" style={{ marginBottom: 10 }} />
//           <AppText style={styles.loginTitle}>
//             Login Required
//           </AppText>
//           <AppText style={styles.loginMessage}>
//             Please log in to view your details and purchase history.
//           </AppText>
//           <TouchableOpacity
//             style={styles.loginButton}
//             onPress={() => navigation.navigate('SellerLoginScreen')}
//           >
//             <AppText style={styles.loginButtonText}>
//               GO TO LOGIN
//             </AppText>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1, backgroundColor: 'white' }}>
//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Image
//             source={require('../../assets/logo.png')}
//             style={styles.logo}
//             resizeMode="contain"
//           />
//         </View>

//         {/* Tabs */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'purchase' && styles.activeTab]}
//             onPress={() => setActiveTab('purchase')}
//           >
//             <AppText style={[styles.tabText, activeTab === 'purchase' && styles.activeTabText]}>
//               PURCHASE HISTORY
//             </AppText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.tabButton, activeTab === 'personal' && styles.activeTab]}
//             onPress={() => setActiveTab('personal')}
//           >
//             <AppText style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>
//               BUSINESS INFORMATION
//             </AppText>
//           </TouchableOpacity>
//         </View>

//         {/* Content */}
//         <ScrollView
//           style={styles.contentContainer}
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         >
//           {activeTab === 'personal' ? (
//             <>
//               {renderPersonalDetails()}

//               {/* Additional Sections */}
//               <TouchableOpacity style={styles.menuItem}>
//                 <AppText style={styles.menuText}>TERMS & CONDITIONS</AppText>
//                 <Icon name="chevron-right" size={24} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem}>
//                 <AppText style={styles.menuText}>ABOUT US</AppText>
//                 <Icon name="chevron-right" size={24} />
//               </TouchableOpacity>

//               <TouchableOpacity style={styles.menuItem}>
//                 <AppText style={styles.menuText}>CONTACT US</AppText>
//                 <Icon name="chevron-right" size={24} color="#000" />
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[styles.menuItem, styles.logoutItem]}
//                 onPress={handleLogout}
//               >
//                 <AppText style={[styles.menuText, styles.logoutText]}>LOGOUT</AppText>
//                 <Icon name="exit-to-app" size={24} color="#f44336" />
//               </TouchableOpacity>
//             </>
//           ) : (
//             renderPurchaseHistory()
//           )}
//         </ScrollView>

//         {renderInvoiceModal()}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingBottom: 100,
//   },
//   header: {
//     alignItems: 'center',
//   },
//   logo: {
//     width: 100,
//     height: 50,
//   },
//   tabContainer: {
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#000',
//   },
//   tabText: {
//     fontSize: 12,
//     color: '#666',
//     letterSpacing: 1
//   },
//   activeTabText: {
//     color: '#000',
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   section: {
//     paddingVertical: 20,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     color: '#000',
//     marginBottom: 20,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 12,
//     color: '#333',
//     marginBottom: 8,
//   },
//   inputContainer: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 14,
//     backgroundColor: '#f9f9f9',
//   },
//   input: {
//     fontSize: 14,
//     color: '#000',
//   },
//   valueText: {
//     fontSize: 14,
//     color: '#000',
//   },
//   editButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//     padding: 14,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   editButtonText: {
//     fontSize: 14,
//     color: '#000',
//     marginRight: 10,
//     letterSpacing: 2,
//   },
//   editIcon: {
//     marginTop: 2,
//   },
//   purchaseCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#f0f0f0',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     elevation: 2,
//   },
//   purchaseHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   purchaseDate: {
//     fontSize: 14,
//     color: '#666',
//   },
//   purchaseCustomer: {
//     fontSize: 15,
//     color: '#000',
//     marginBottom: 12,
//   },
//   purchaseDetails: {
//     marginBottom: 16,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 4,
//   },
//   invoiceButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     borderWidth: 1,
//     borderColor: '#000',
//     borderRadius: 8,
//   },
//   detailsButton: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 12,
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: '#000',
//     borderRadius: 8,
//   },
//   invoiceButtonText: {
//     fontSize: 12,
//     color: '#000',
//     marginRight: 8,
//     letterSpacing: 2
//   },
//   menuItem: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 18,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   menuText: {
//     fontSize: 14,
//     color: '#000',
//     letterSpacing: 2,
//   },
//   logoutItem: {
//     marginTop: 20,
//     borderBottomWidth: 0,
//   },
//   logoutText: {
//     color: '#f44336',
//   },
//   noPurchasesText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#666',
//   },
//   loginPromptContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   loginCard: {
//     backgroundColor: '#f9f9f9',
//     padding: 25,
//     borderRadius: 16,
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     width: '90%',
//   },
//   loginTitle: {
//     fontSize: 20,
//     color: '#222',
//     marginBottom: 10,
//   },
//   loginMessage: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   loginButton: {
//     backgroundColor: '#000',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 8,
//   },
//   loginButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     letterSpacing: 2,
//   },
//     modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.7)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   invoiceContainer: {
//     height: '95%',
//     width: '95%',
//     backgroundColor: '#ffffff',
//     borderRadius: 16,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//   },
  
//   // Modern Header Styles
//   modernHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 2,
//     borderBottomColor: '#000',
//     backgroundColor: '#ffffff',
//     borderTopLeftRadius: 16,
//     borderTopRightRadius: 16,
//   },
//   headerLeft: {
//     flex: 1,
//   },
//   logoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   logoIcon: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   logoText: {
//     color: '#fff',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   companyInfo: {
//     flex: 1,
//   },
//   companyName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#000',
//     letterSpacing: 1,
//   },
//   companyTagline: {
//     fontSize: 12,
//     color: '#666',
//     marginTop: 2,
//     letterSpacing: 0.5,
//   },
//   closeBtn: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f5f5f5',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 16,
//   },

//   // Content Styles
//   invoiceScrollView: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
  
//   // Title Section
//   titleSection: {
//     alignItems: 'center',
//     paddingVertical: 24,
//   },
//   invoiceTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#000',
//     letterSpacing: 2,
//   },
//   titleDivider: {
//     width: 80,
//     height: 3,
//     backgroundColor: '#000',
//     marginTop: 8,
//   },

//   // Meta Information Grid
//   metaGrid: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   metaRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 12,
//   },
//   metaItem: {
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   metaLabel: {
//     fontSize: 11,
//     color: '#6c757d',
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 4,
//   },
//   metaValue: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '500',
//   },

//   // Details Card
//   detailsCard: {
//     backgroundColor: '#fff',
//     borderWidth: 2,
//     borderColor: '#000',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 24,
//   },
//   detailsRow: {
//     flexDirection: 'col',
//   },
//   detailsColumn: {
//     flex: 1,
//   },
//   dividerLine: {
//     width: 2,
//     backgroundColor: '#e9ecef',
//     marginHorizontal: 16,
//   },
//   detailsLabel: {
//     fontSize: 12,
//     color: '#6c757d',
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//     marginBottom: 8,
//   },
//   companyNameBold: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 4,
//   },
//   detailsText: {
//     fontSize: 13,
//     color: '#495057',
//     marginBottom: 2,
//     lineHeight: 18,
//   },
//   detailsText2: {
//     fontSize: 13,
//     color: '#495057',
//     marginBottom: 10,
//     lineHeight: 18,
//   },

//   // Modern Table
//   modernTable: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     borderWidth: 2,
//     borderColor: '#000',
//     marginBottom: 24,
//     overflow: 'hidden',
//   },
//   tableHeader: {
//     flexDirection: 'row',
//     backgroundColor: '#000',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//   },
//   tableHeaderText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     textAlign: 'center',
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     minHeight: 80,
//   },
//   serviceDescription: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#000',
//     marginBottom: 4,
//   },
//   serviceSubtext: {
//     fontSize: 12,
//     color: '#6c757d',
//     marginBottom: 2,
//   },
//   tableData: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '500',
//   },

//   // Totals Section
//   totalsSection: {
//     // alignItems: 'flex-end',
//     marginBottom: 24,
//   },
//   totalsContainer: {
//     minWidth: 280,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   totalLine: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e9ecef',
//     marginBottom: 4,
//   },
//   totalLabel: {
//     fontSize: 14,
//     color: '#495057',
//     fontWeight: '500',
//   },
//   totalValue: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '600',
//   },
//   totalGSTLine: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderTopWidth: 1,
//     borderBottomWidth: 2,
//     borderTopColor: '#dee2e6',
//     borderBottomColor: '#000',
//     marginTop: 8,
//     marginBottom: 8,
//   },
//   totalGSTLabel: {
//     fontSize: 15,
//     color: '#000',
//     fontWeight: '600',
//   },
//   totalGSTValue: {
//     fontSize: 15,
//     color: '#000',
//     fontWeight: '700',
//   },
//   grandTotalLine: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     backgroundColor: '#000',
//     marginHorizontal: -20,
//     marginBottom: -20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//   },
//   grandTotalLabel: {
//     fontSize: 16,
//     color: '#fff',
//     fontWeight: 'bold',
//     letterSpacing: 0.5,
//   },
//   grandTotalValue: {
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//   },

//   // Amount in Words
//   amountInWordsSection: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: '#000',
//   },
//   amountInWordsLabel: {
//     fontSize: 12,
//     color: '#6c757d',
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//     marginBottom: 6,
//   },
//   amountInWordsValue: {
//     fontSize: 14,
//     color: '#000',
//     fontWeight: '500',
//     fontStyle: 'italic',
//     lineHeight: 20,
//   },

//   // Terms Section
//   termsSection: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     marginBottom: 24,
//     borderWidth: 1,
//     borderColor: '#e9ecef',
//   },
//   termsTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#000',
//     marginBottom: 12,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   termsList: {
//     marginLeft: 8,
//   },
//   termsItem: {
//     fontSize: 13,
//     color: '#495057',
//     marginBottom: 6,
//     lineHeight: 18,
//   },

//   // Modern Footer
//   modernFooter: {
//     alignItems: 'center',
//     paddingVertical: 24,
//   },
//   footerDivider: {
//     width: '100%',
//     height: 2,
//     backgroundColor: '#e9ecef',
//     marginBottom: 20,
//   },
//   footerTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#000',
//     textAlign: 'center',
//     marginBottom: 4,
//   },
//   footerSubtitle: {
//     fontSize: 12,
//     color: '#6c757d',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   downloadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#000',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 25,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   downloadButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//     marginLeft: 8,
//     letterSpacing: 0.5,
//   },
//   bottomSpacer: {
//     height: 40,
//   },
// });

// export default SellerAccountPage;
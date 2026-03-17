import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import AppText from '../../../components/AppText';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import EditQuoteModal from './EditQuoteModal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PremiumLoginModal from '../../../components/PremiumLoginModal';

const {width, height} = Dimensions.get('window');
const FORM_STORAGE_KEY = 'quoteRequestFormData';

const QuoteRequestPage = ({navigation, route}) => {
  const [quotes, setQuotes] = useState([]);
  const [user, setUser] = useState(null);
  const [selectMore, setSelectMore] = useState(false); 

  // Get form data from params if available
  const {selectedCategory, formData: initialFormData} = route.params || {};

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [SelectedCategory, setSelectedCategoryl] = useState(selectedCategory?.name);
  const [selectedCategoryId, setSelectedCategoryId] = useState(selectedCategory?._id);
  const [showCategorySelection, setShowCategorySelection] = useState(false); 

  // Default form structure
  const getDefaultFormData = () => ({
    name: '',
    contact: '',
    whatsapp: '',
    email: '',
    projectName: '',
    projectAddress: '',
    projectArea: '',
    pincode: '',
    gmapLocation: '',
    projectStage: '',
    timeline: '',
    totalSqft: '', 
    category: selectedCategory?.name || 'Please select category',
    categoryId: selectedCategory?._id || null,
  });

  const [formData, setFormData] = useState(getDefaultFormData());

  // Load form data from storage on component mount
  const loadFormFromStorage = async () => {
    try {
      console.log('🔄 Loading form data from storage...');
      const storedForm = await AsyncStorage.getItem(FORM_STORAGE_KEY);
      
      if (storedForm) {
        const parsedForm = JSON.parse(storedForm);
        console.log('📦 Found stored form data:', parsedForm);
        
        // Merge with default form data
        let finalFormData = { ...getDefaultFormData(), ...parsedForm };
        
        // Override with route params if available (highest priority)
        if (route.params?.formData) {
          console.log('🔄 Overriding with route params:', route.params.formData);
          finalFormData = { ...finalFormData, ...route.params.formData };
        }
        
        // Override category if passed via route params
        if (route.params?.selectedCategory?.name) {
          finalFormData.category = route.params.selectedCategory.name;
          finalFormData.categoryId = route.params.selectedCategory._id;
          setSelectedCategoryl(route.params.selectedCategory.name);
          setSelectedCategoryId(route.params.selectedCategory._id);
        }
        
        console.log('✅ Setting form data:', finalFormData);
        setFormData(finalFormData);
        
        // Set dropdown values from stored data
        if (finalFormData.projectStage) {
          setStageValue(finalFormData.projectStage);
        }
        if (finalFormData.timeline) {
          setTimelineValue(finalFormData.timeline);
        }
        
        return finalFormData;
      } else if (route.params?.formData) {
        // If no stored data but form data exists in params
        console.log('📦 No stored data, using route params:', route.params.formData);
        const finalFormData = { ...getDefaultFormData(), ...route.params.formData };
        setFormData(finalFormData);
        return finalFormData;
      } else {
        console.log('📦 No stored data or route params, using defaults');
        const defaultData = getDefaultFormData();
        setFormData(defaultData);
        return defaultData;
      }
    } catch (error) {
      console.error('❌ Error loading form from storage:', error);
      const defaultData = getDefaultFormData();
      setFormData(defaultData);
      return defaultData;
    }
  };

  // Save form data to storage
  const saveFormToStorage = async (newFormData) => {
    try {
      await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(newFormData));
    } catch (error) {
      console.error('Error saving form to storage:', error);
    }
  };

  // Clear form data from storage
  const clearFormFromStorage = async () => {
    try {
      await AsyncStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing form from storage:', error);
    }
  };

  const fetchData = async (currentFormData) => { 
    // Only show selectMore modal if there are no quotes
    if (!quotes?.quotes || quotes.quotes.length === 0) {
      setSelectMore(true);
    }
    
    if (selectedCategory?.name) setSelectedCategoryl(selectedCategory?.name);
    if (selectedCategory?._id) {
      setSelectedCategoryId(selectedCategory?._id);
      // Also update formData with categoryId
      setFormData(prev => ({...prev, categoryId: selectedCategory._id}));
    }
    
    try {
      const token = await AsyncStorage.getItem('buyerToken');
      if (!token) {
        setShowLoginModal(true);
        return;
      }

      // Check for active leads (within 48 hours)
      const leadsResponse = await axios.get(
        'https://upvcconnect.com/api/buyer/leads',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('📊 Leads API Response:', JSON.stringify(leadsResponse.data, null, 2));

      if (leadsResponse.data && leadsResponse.data.leads) {
        const now = new Date();
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
        
        console.log('⏰ Current time:', now);
        console.log('⏰ 48 hours ago:', fortyEightHoursAgo);
        console.log('📋 Total leads:', leadsResponse.data.leads.length);
        
        // Find any lead created within last 48 hours
        const activeLead = leadsResponse.data.leads.find(lead => {
          const leadCreatedAt = new Date(lead.createdAt);
          const isActive = leadCreatedAt > fortyEightHoursAgo;
          console.log(`🔍 Lead ${lead._id}: Created ${leadCreatedAt}, Active: ${isActive}`);
          return isActive;
        });

        if (activeLead) {
          const leadCreatedAt = new Date(activeLead.createdAt);
          const hoursRemaining = Math.ceil((48 - (now - leadCreatedAt) / (1000 * 60 * 60)));
          
          console.log('🚫 ACTIVE LEAD FOUND! Blocking user.');
          console.log('Category:', activeLead.category?.name);
          console.log('Hours remaining:', hoursRemaining);
          
          setActiveLeadInfo({
            category: activeLead.category?.name || 'Unknown',
            createdAt: leadCreatedAt,
            hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0,
          });
          setShowActiveLeadBlockModal(true);
          return; // Block further execution
        } else {
          console.log('✅ No active leads found. User can proceed.');
        }
      }

      const responseQuotes = await axios.get(
        'https://upvcconnect.com/api/quotes/buyer',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const userRes = await axios.get('https://upvcconnect.com/api/buyer', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }); 
      
      const filtered = responseQuotes?.data?.quotes?.filter(item => !item.isGenerated);
      const quotesData = {
        ...responseQuotes?.data,
        quotes: filtered
      };
      
      setQuotes(quotesData);
      setUser(userRes?.data?.user);
      
      const filteredTotalSqft = filtered?.reduce((sum, item) => sum + (item.sqft || 0), 0);
      
      // Update form data with calculated values and save to storage
      const updatedFormData = {
        ...currentFormData,
        totalSqft: filteredTotalSqft,
        contact: userRes?.data?.user?.mobileNumber || currentFormData.contact,
      };
      
      setFormData(updatedFormData);
      await saveFormToStorage(updatedFormData);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeData = async () => {
      // First check for active leads before loading anything
      const token = await AsyncStorage.getItem('buyerToken');
      if (!token) {
        setShowLoginModal(true);
        return;
      }

      try {
        const leadsResponse = await axios.get(
          'https://upvcconnect.com/api/buyer/leads',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (leadsResponse.data && leadsResponse.data.leads) {
          const now = new Date();
          const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
          
          const activeLead = leadsResponse.data.leads.find(lead => {
            const leadCreatedAt = new Date(lead.createdAt);
            return leadCreatedAt > fortyEightHoursAgo;
          });

          if (activeLead) {
            const leadCreatedAt = new Date(activeLead.createdAt);
            const hoursRemaining = Math.ceil((48 - (now - leadCreatedAt) / (1000 * 60 * 60)));
            
            setActiveLeadInfo({
              category: activeLead.category?.name || 'Unknown',
              createdAt: leadCreatedAt,
              hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0,
            });
            setShowActiveLeadBlockModal(true);
            return; // Block further execution
          }
        }
      } catch (error) {
        console.error('Error checking active leads:', error);
      }

      // If no active lead, proceed with normal data loading
      const loadedFormData = await loadFormFromStorage();
      if (isMounted) {
        await fetchData(loadedFormData);
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add a focus listener to handle when returning to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // Check for active leads first
      const token = await AsyncStorage.getItem('buyerToken');
      if (!token) return;

      try {
        const leadsResponse = await axios.get(
          'https://upvcconnect.com/api/buyer/leads',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        if (leadsResponse.data && leadsResponse.data.leads) {
          const now = new Date();
          const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
          
          const activeLead = leadsResponse.data.leads.find(lead => {
            const leadCreatedAt = new Date(lead.createdAt);
            return leadCreatedAt > fortyEightHoursAgo;
          });

          if (activeLead) {
            const leadCreatedAt = new Date(activeLead.createdAt);
            const hoursRemaining = Math.ceil((48 - (now - leadCreatedAt) / (1000 * 60 * 60)));
            
            setActiveLeadInfo({
              category: activeLead.category?.name || 'Unknown',
              createdAt: leadCreatedAt,
              hoursRemaining: hoursRemaining > 0 ? hoursRemaining : 0,
            });
            setShowActiveLeadBlockModal(true);
            return; // Block further execution
          }
        }
      } catch (error) {
        console.error('Error checking active leads on focus:', error);
      }

      // Always reload the form data when screen comes into focus
      const loadedFormData = await loadFormFromStorage();
      
      // Only update if we have new data from params
      if (route.params?.formData || route.params?.selectedCategory) {
        let updatedFormData = { ...loadedFormData };
        
        if (route.params?.formData) {
          updatedFormData = { ...updatedFormData, ...route.params.formData };
        }
        
        if (route.params?.selectedCategory) {
          updatedFormData.category = route.params.selectedCategory.name;
          updatedFormData.categoryId = route.params.selectedCategory._id;
          setSelectedCategoryl(route.params.selectedCategory.name);
          setSelectedCategoryId(route.params.selectedCategory._id);
        }
        
        setFormData(updatedFormData);
        await saveFormToStorage(updatedFormData);
        
        // Refresh quotes data
        await fetchData(updatedFormData);
      }
    });

    return unsubscribe;
  }, [navigation, route.params]);

  // Enhanced form persistence with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Screen focused - reloading form data...');
      
      const reloadFormData = async () => {
        try {
          const loadedFormData = await loadFormFromStorage();
          console.log('✅ Form data reloaded on focus:', loadedFormData);
          
          // Update dropdown values if they exist in loaded data
          if (loadedFormData.projectStage) {
            setStageValue(loadedFormData.projectStage);
          }
          if (loadedFormData.timeline) {
            setTimelineValue(loadedFormData.timeline);
          }
        } catch (error) {
          console.error('❌ Error reloading form data on focus:', error);
        }
      };
      
      reloadFormData();
    }, [])
  );

  // Save form data when component unmounts or when form data changes
  useEffect(() => {
    const saveFormData = async () => {
      if (formData && Object.keys(formData).length > 0) {
        try {
          await saveFormToStorage(formData);
          console.log('💾 Form data auto-saved:', formData);
        } catch (error) {
          console.error('❌ Error auto-saving form data:', error);
        }
      }
    };

    // Debounce the save operation to avoid too frequent saves
    const timeoutId = setTimeout(saveFormData, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      // Save immediately on cleanup
      saveFormData();
    };
  }, [formData]);

  // If there's an active lead, only show the block modal
  if (showActiveLeadBlockModal) {
    return (
      <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
        <Modal
          transparent
          visible={showActiveLeadBlockModal}
          animationType="fade"
          onRequestClose={() => {
            // Prevent closing - force user to go back
            navigation.goBack();
          }}>
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              // Prevent closing by tapping outside
            }}>
            <View style={[styles.modalContainer, {maxWidth: width * 0.85}]}>
              <View style={{alignItems: 'center', marginBottom: 15}}>
                <AppText weight="Bold" style={[styles.modalTitle, {fontSize: 20, marginBottom: 10, color: '#ff6b6b'}]}>
                  🚫 Active Lead Exists
                </AppText>
              </View>
              <AppText weight="Inter" style={[styles.modalMessage, {fontSize: 16, lineHeight: 24, textAlign: 'center'}]}>
                You already have an active lead in the{' '}
                <AppText weight="Bold" style={{color: '#000'}}>
                  {activeLeadInfo?.category}
                </AppText>{' '}
                category.
              </AppText>
              <AppText weight="Inter" style={[styles.modalMessage, {fontSize: 14, marginTop: 10, color: '#666', textAlign: 'center'}]}>
                You cannot submit another enquiry until this one is closed or expires.
              </AppText>
              <AppText weight="Inter" style={[styles.modalMessage, {fontSize: 14, marginTop: 10, color: '#000', textAlign: 'center', fontWeight: 'bold'}]}>
                Time remaining: {activeLeadInfo?.hoursRemaining} hours
              </AppText>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.deleteConfirmButton, {backgroundColor: '#000', flex: 1}]}
                  onPress={() => {
                    setShowActiveLeadBlockModal(false);
                    navigation.goBack();
                  }}>
                  <AppText weight="Inter" style={[styles.deleteText, {color: '#fff'}]}>Go Back</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Update the category selection handler to preserve form data
  const handleSelectCategory = async () => {
    // Save current form data before navigating
    await saveFormToStorage(formData);
    
    // Navigate to category screen with current form data
    navigation.navigate('BuyerMain', {
      screen: 'BuyerInsights',
      params: {
        formData: formData,
        returnScreen: 'QuoteRequest'
      }
    });
  };

  const handleAddMore = async () => {
    // Save form data before navigating
    await saveFormToStorage(formData);
    setSelectMore(false);
    navigation.navigate('BuyNowScreen', {});
  };

  const handleCancelAddMore = () => {
    setSelectMore(false);
  };
 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; 
  const [isLoading, setIsLoading] = useState(false);

  // State for dropdowns
  const [stageOpen, setStageOpen] = useState(false);
  const [stageValue, setStageValue] = useState(null);
  const [stageItems, setStageItems] = useState([
    {label: 'Planning', value: 'planning'},
    {label: 'Under Construction', value: 'under construction'},
    {label: 'Ready to Move', value: 'ready to move'},
    {label: 'Other', value: 'other'},
  ]);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineValue, setTimelineValue] = useState(null);
  const [timelineItems, setTimelineItems] = useState([
    {label: '0-30 days', value: '0-30 days'},
    {label: '31-60 days', value: '31-60 days'},
    {label: 'above 60 days', value: 'above 60 days'}, 
  ]);

  // Initialize dropdown values from formData when component mounts
  useEffect(() => {
    if (formData.projectStage) {
      setStageValue(formData.projectStage);
    }
    if (formData.timeline) {
      setTimelineValue(formData.timeline);
    }
  }, [formData.projectStage, formData.timeline]);

  useEffect(() => {
    if (stageValue !== null || timelineValue !== null) {
      const updatedFormData = {
        ...formData,
        projectStage: stageValue,
        timeline: timelineValue,
      };
      setFormData(updatedFormData);
      saveFormToStorage(updatedFormData);
    }
  }, [stageValue, timelineValue]);

  const handleInputChange = async (name, value) => {
    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(updatedFormData);
    
    // Save to storage on every input change
    await saveFormToStorage(updatedFormData);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      'name',
      'contact',
      'email',
      'projectName',
      'projectAddress',
      'projectArea',
      'pincode',
      'gmapLocation',
      'whatsapp',
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        Alert.alert( `Please fill in the ${field} field`); 
        return;
      }
    }
    
    if (!quotes?.quotes || quotes.quotes.length === 0) { 
      Alert.alert(
        'No products added',
        'Please add at least one product to your quote',
        [{ text: 'OK' }]
      );
      return;
    }

    const filteredQuotes = quotes?.quotes?.filter(item => item.isGenerated === false);
    
    if(filteredQuotes?.length === 0){
      Alert.alert('Error','Please add at least one product to your quote'); 
      return;
    }

    // Show category confirmation modal before submitting
    setShowCategoryConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowCategoryConfirmModal(false);

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('buyerToken');
      const leadData = {
        quotes: quotes.quotes.map(q => ({
          productType: q.productType,
          product: q.product?._id,
          color: q.color,
          installationLocation: q.installationLocation,
          height: q.height,
          width: q.width,
          quantity: q.quantity,
          remark: q.remark || '',
          sqft: q.sqft,
          isGenerated : true,
          _id : q._id
        })),
        contactInfo: {
          name: formData.name,
          contactNumber: formData.contact,
          whatsappNumber: formData.whatsapp || formData.contact,
          email: formData.email,
        },
        projectInfo: {
          name: formData.projectName,
          address: formData.projectAddress,
          area: formData.projectArea,
          pincode: formData.pincode,
          googleMapLink: formData.gmapLocation,
          stage: formData.projectStage,
          timeline: formData.timeline,
        },
        totalSqft: parseFloat(formData.totalSqft),
        categoryId: formData.categoryId || selectedCategoryId || selectedCategory?._id,
      };
      
      const response = await axios.post(
        'https://upvcconnect.com/api/seller/lead',
        leadData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 201) {
        // Clear the quotes after successful submission
        setQuotes({quotes: [], totalSqft: 0, totalQuantity: 0});

        // Reset form data and clear from storage
        const resetFormData = getDefaultFormData();
        
        setFormData(resetFormData);
        await clearFormFromStorage();
        setStageValue(null);
        setTimelineValue(null);

        setIsSubmitted(true);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error(
        'Error creating lead:',
        error.response?.data || error.message,
      );
      
      // Check if it's the 48-hour blocking error
      if (error.response?.data?.hoursRemaining) {
        const hoursRemaining = error.response.data.hoursRemaining;
        Alert.alert(
          '⏳ Active Lead Exists',
          `You already have an active lead. Please wait ${hoursRemaining} hours before creating a new one.\n\nYou can only submit one enquiry every 48 hours.`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message ||
            'Failed to submit lead. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = async () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setIsSubmitted(false);
      navigation.navigate('BuyerMain');
    });
  };

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCategoryConfirmModal, setShowCategoryConfirmModal] = useState(false);
  const [showActiveLeadBlockModal, setShowActiveLeadBlockModal] = useState(false);
  const [activeLeadInfo, setActiveLeadInfo] = useState(null);
  
  const insets = useSafeAreaInsets();

  const handleEditItem = quote => {
    setCurrentQuote(JSON.parse(JSON.stringify(quote)));
    setIsEditModalVisible(true);
  };

  const handleUpdateQuote = async updatedQuote => {
    try {
      setIsUpdating(true);
      const token = await AsyncStorage.getItem('buyerToken');

      const response = await axios.put(
        `https://upvcconnect.com/api/quotes/${updatedQuote._id}`,
        updatedQuote,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        setIsEditModalVisible(false);
        const updatedQuotes = await axios.get(
          'https://upvcconnect.com/api/quotes/buyer',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setQuotes(updatedQuotes?.data);
        // Refresh the data to update totals
        await fetchData(formData);
        Alert.alert('Success', 'Quote updated successfully');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      Alert.alert('Failed to update quote');
    } finally {
      setIsUpdating(false);
    }
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);

  const confirmDeleteItem = (quoteId) => {
    setSelectedQuoteId(quoteId);
    setShowConfirm(true);
  };

  const handleDeleteConfirmed = async () => {
    setShowConfirm(false);
    await handleDeleteItem(selectedQuoteId);
  };

  const handleDeleteItem = async quoteId => { 
    try {
      const token = await AsyncStorage.getItem('buyerToken');
      await axios.delete(`https://upvcconnect.com/api/quotes/${quoteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Refresh quotes after deletion
      const response = await axios.get(
        'https://upvcconnect.com/api/quotes/buyer',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setQuotes(response?.data);
      // Refresh the data to update totals
      await fetchData(formData);
      Alert.alert('Success', 'Quote deleted successfully');
    } catch (error) {
      console.error('Error deleting quote:', error);
      Alert.alert('Error', 'Failed to delete quote');
    }
  };
  
  const renderSelectedItems = () => {
    const navigation = useNavigation();
    return (
      <View style={styles.sectionContainer}>
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={async () => {
              await saveFormToStorage(formData);
              navigation.goBack();
            }}>
            <Icon name="arrow-back" size={30} color="#000" />
          </TouchableOpacity>

          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
        </View>
        <AppText weight="Inter" style={styles.sectionTopHeader}>
          YOUR SELECTIONS
        </AppText>
        <View style={styles.itemsContainer}>
          {quotes?.quotes
          ?.filter(item => item.isGenerated === false)
          .map((item, ind) => (
            <View key={ind} style={styles.itemCard}>
              <LinearGradient
                colors={['#f5f5f5', '#ffffff']}
                style={styles.cardGradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <View style={styles.cardHeader}>
                  <View style={styles.serialBadge}>
                    <AppText weight="Inter" style={styles.serialBadgeText}>
                      {ind + 1}
                    </AppText>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEditItem(item)}>
                      <Icon name="edit" size={18} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton} 
                      onPress={() => confirmDeleteItem(item._id)}>
                      <Icon name="delete" size={18} color="#ff0000" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.cardHeader}>
                  <AppText weight="Inter" style={styles.cardTitle}>
                    {item?.product?.title}
                  </AppText>
                </View>

                <View style={styles.itemGrid}>
                  <View style={styles.itemColumn}>
                    <View style={styles.itemField}>
                      <AppText weight="Inter" style={styles.itemLabel}>
                        COLOR
                      </AppText>
                      <AppText weight="Inter" style={styles.itemValue}>
                        {item.color}
                      </AppText>
                    </View>
                    <View style={styles.itemField}>
                      <AppText weight="Inter" style={styles.itemLabel}>
                        HEIGHT
                      </AppText>
                      <AppText weight="Inter" style={styles.itemValue}>
                        {item.height} ft
                      </AppText>
                    </View>
                    <View style={styles.itemField}>
                      <AppText weight="Inter" style={styles.itemLabel}>
                        WIDTH
                      </AppText>
                      <AppText weight="Inter" style={styles.itemValue}>
                        {item.width} ft
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.itemColumn}>
                    <View style={styles.itemField}>
                      <AppText weight="Inter" style={styles.itemLabel}>
                        LOCATION
                      </AppText>
                      <AppText weight="Inter" style={styles.itemValue}>
                        {item.installationLocation}
                      </AppText>
                    </View>
                    <View style={styles.itemField}>
                      <AppText weight="Inter" style={styles.itemLabel}>
                        QUANTITY
                      </AppText>
                      <AppText weight="Inter" style={styles.itemValue}>
                        {item.quantity}
                      </AppText>
                    </View>
                  </View>
                </View>

                <View style={styles.remarkContainer}>
                  <AppText weight="Inter" style={styles.totalLabel}>
                    Remarks
                  </AppText>
                  <AppText weight="Inter" style={styles.remarkValue}>
                    {item.remark || "NA"}
                  </AppText>
                </View>
                <View style={styles.totalContainer}>
                  <AppText weight="Inter" style={styles.totalLabel}>
                    TOTAL
                  </AppText>
                  <AppText weight="Inter" style={styles.totalValue}>
                    {item.sqft} sqft
                  </AppText>
                </View>
              </LinearGradient>
            </View>
          ))}
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Icon
                name="straighten"
                size={20}
                color="#000"
                style={styles.summaryIcon}
              />
              <AppText weight="Inter" style={styles.summaryLabel}>
                TOTAL SQ FT
              </AppText>
              <AppText weight="Inter" style={styles.summaryValue}>
                {formData?.totalSqft}
              </AppText>
            </View>
 
            <View style={styles.summaryItem}>
              <Icon
                name="format-list-numbered"
                size={20}
                color="#000"
                style={styles.summaryIcon}
              />
              <AppText weight="Inter" style={styles.summaryLabel}>
                TOTAL QUANTITY
              </AppText>
              <AppText weight="Inter" style={styles.summaryValue}>
                {quotes?.quotes
                  ?.filter(item => item.isGenerated === false)
                  .reduce((sum, item) => sum + (item.quantity || 0), 0)
                }
              </AppText>
            </View>
          </View>
        </View>
        
        <Modal
          transparent
          visible={showConfirm}
          animationType="fade"
          onRequestClose={() => setShowConfirm(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <AppText weight="Inter" style={styles.modalTitle}>
                Confirm Deletion
              </AppText>
              <AppText weight="Inter" style={styles.modalMessage}>
                Are you sure you want to delete this item from your cart?
              </AppText>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirm(false)}>
                  <AppText weight="Inter" style={styles.cancelText}>Cancel</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteConfirmButton}
                  onPress={handleDeleteConfirmed}>
                  <AppText weight="Inter" style={styles.deleteText}>Delete</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Category Confirmation Modal */}
        <Modal
          transparent
          visible={showCategoryConfirmModal}
          animationType="fade"
          onRequestClose={() => setShowCategoryConfirmModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, {maxWidth: width * 0.85}]}>
              <View style={{alignItems: 'center', marginBottom: 15}}>
                <AppText weight="Bold" style={[styles.modalTitle, {fontSize: 20, marginBottom: 10}]}>
                  ⚠️ Important Notice
                </AppText>
              </View>
              <AppText weight="Inter" style={[styles.modalMessage, {fontSize: 16, lineHeight: 24, textAlign: 'center'}]}>
                Great! You have chosen to seek quotes from the{' '}
                <AppText weight="Bold" style={{color: '#000'}}>
                  {SelectedCategory || formData.category}
                </AppText>{' '}
                category.
              </AppText>
              <AppText weight="Inter" style={[styles.modalMessage, {fontSize: 14, marginTop: 10, color: '#ff6b6b', textAlign: 'center'}]}>
                It cannot be changed after submission and you cannot submit another enquiry for 48 hours until this one is closed.
              </AppText>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, {flex: 1, marginRight: 8}]}
                  onPress={() => setShowCategoryConfirmModal(false)}>
                  <AppText weight="Inter" style={styles.cancelText}>Go Back to Category</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteConfirmButton, {flex: 1, marginLeft: 8, backgroundColor: '#000'}]}
                  onPress={handleConfirmSubmit}>
                  <AppText weight="Inter" style={[styles.deleteText, {color: '#fff'}]}>Confirm & Submit</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const renderForm = () => {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.formContainer}>
          <AppText weight="Inter" style={styles.sectionHeader}>
            PERSONAL DETAILS
          </AppText>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="person" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={text => handleInputChange('name', text)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="phone" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.contact}
                onChangeText={text => handleInputChange('contact', text)}
              />
            </View>

            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="chat" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="WhatsApp"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={formData.whatsapp}
                onChangeText={text => handleInputChange('whatsapp', text)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="email" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={text => handleInputChange('email', text)}
              />
            </View>
          </View>

          <AppText weight="Inter" style={styles.sectionHeader}>
            PROJECT DETAILS
          </AppText>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="business" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Project Name"
                placeholderTextColor="#999"
                value={formData.projectName}
                onChangeText={text => handleInputChange('projectName', text)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="location-on" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Project Address"
                placeholderTextColor="#999"
                multiline
                value={formData.projectAddress}
                onChangeText={text => handleInputChange('projectAddress', text)}
              />
            </View>
          </View>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, styles.inputWithIcon]}>
              <Icon name="location-on" size={20} color="#000" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Project Area"
                placeholderTextColor="#999"
                multiline
                value={formData.projectArea}
                onChangeText={text => handleInputChange('projectArea', text)}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Pin Code"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={formData.pincode}
                onChangeText={text => handleInputChange('pincode', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Google Map Link"
                placeholderTextColor="#999"
                value={formData.gmapLocation}
                onChangeText={text => handleInputChange('gmapLocation', text)}
              />
            </View>
          </View>

          <View style={styles.dropdownInputRow}>
            <View style={[styles.dropdownContainer, {zIndex: 2000}]}>
              <AppText weight="Inter" style={styles.dropdownLabel}>
                PROJECT STAGE
              </AppText>
              <DropDownPicker
                open={stageOpen}
                value={stageValue}
                items={stageItems}
                setOpen={setStageOpen}
                setValue={setStageValue}
                setItems={setStageItems}
                placeholder="Select project stage"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>

            <View style={[styles.dropdownContainer, {zIndex: 1000}]}>
              <AppText weight="Inter" style={styles.dropdownLabel}>
                TIMELINE
              </AppText>
              <DropDownPicker
                open={timelineOpen}
                value={timelineValue}
                items={timelineItems}
                setOpen={setTimelineOpen}
                setValue={setTimelineValue}
                setItems={setTimelineItems}
                placeholder="Select timeline"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownList}
                textStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownPlaceholder}
                zIndex={1000}
                zIndexInverse={2000}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Total Sq. Feet"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={`${formData.totalSqft?.toString()} sqft` || ''}
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              {formData.category === 'Please select category' ?
               <TouchableOpacity
                style={styles.deleteConfirmButton}
                 onPress={handleSelectCategory}>
                <AppText weight="Inter" style={styles.deleteText}>Select category</AppText>
              </TouchableOpacity>
               :
                <TextInput
                style={styles.input}
                placeholder="Category"
                placeholderTextColor="#999"
                value={formData.category}
                editable={false}
              />
              }
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}>
            <LinearGradient
              colors={['#000000', '#000000']}
              style={styles.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              {isLoading && <ActivityIndicator color="#fff" />}
              <AppText weight="Inter" style={styles.submitButtonText}>
                GENERATE LEAD
              </AppText>
              <Icon
                name="arrow-forward"
                size={22}
                color="#fff"
                style={styles.buttonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuccessMessage = () => {
    return (
      <Animated.View style={[styles.successContainer, {opacity: fadeAnim}]}>
        <View style={styles.successOverlay} />
        <View style={styles.successCard}>
          <LinearGradient
            colors={['#ffffff', '#f9f9f9']}
            style={styles.successGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseSuccess}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>

            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={60} color="#000" />
            </View>

            <AppText weight="Inter" style={styles.successTitle}>
              THANK YOU!
            </AppText>

            <View style={styles.successMessageContainer}>
              <AppText weight="Inter" style={styles.successText}>
                Your quote request has been
              </AppText>
              <AppText weight="Inter" style={styles.successText}>
                successfully submitted
              </AppText>
            </View> 
          </LinearGradient>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {renderSelectedItems()}
          {!isSubmitted ? renderForm() : null}
        </ScrollView>
        {isSubmitted && renderSuccessMessage()}
        {currentQuote && (
          <EditQuoteModal
            visible={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false);
              setCurrentQuote(null);
            }}
            quote={currentQuote}
            onUpdate={handleUpdateQuote}
            isLoading={isUpdating}
            key={currentQuote?._id}
          />
        )}
      </View>

      <Modal
        transparent
        visible={selectMore}
        animationType="fade"
        onRequestClose={handleCancelAddMore}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <AppText weight="Inter" style={styles.modalTitle}>
              Want to Add More?
            </AppText> 
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelAddMore}>
                <AppText weight="Inter" style={styles.cancelText}>Cancel</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmButton} 
                onPress={handleAddMore}>
                <AppText weight="Inter" style={styles.deleteText}>Add</AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <PremiumLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        navigation={navigation}
      />
    </View>
  );
};
 
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: '30%',
    transform: [{translateY: -12}],
    padding: 5,
  },

  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 100,
    height: 50,
  },
  sectionTopHeader: {
    fontSize: 18,
    color: '#000',
    paddingBottom: 30,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubHeader: {
    fontSize: 16,
    color: '#000',
    marginVertical: 15,
    marginTop: 25,
    letterSpacing: 0.5,
  },
  itemsContainer: {
    marginBottom: 15,
  },
  itemCard: {
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardGradient: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    color: '#000',
    letterSpacing: 0.5,
    marginBottom: 15,
    marginTop: 5,
  },
  editButton: {
    padding: 5,
    marginLeft: 10,
  },
  deleteButton: {
    padding: 5,
    marginLeft: 10,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemColumn: {
    width: '48%',
  },
  itemField: {
    marginBottom: 12,
  },
  itemLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  itemValue: {
    fontSize: 14,
    color: '#000',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  remarkContainer: {
    flexDirection: 'col',
    justifyContent: 'space-between',
    alignItems: 'center', 
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    fontSize: 14,
    color: '#000',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 16,
    color: '#000',
  },
  remarkValue: {
    // fontSize: 16,
    color: '#545353ff',
  },
  remarksContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  remarksLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  remarksValue: {
    fontSize: 13,
    color: '#000',
    fontStyle: 'italic',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dropdownInputRow: {
    flexDirection: 'col',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 8,
  },
  submitButton: {
    marginTop: 25,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    letterSpacing: 2,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  successCard: {
    width: width - 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  successGradient: {
    padding: 30,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  successMessageContainer: {
    marginBottom: 15,
  },
  successText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 24,
  },
  successDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
    justifyContent: 'center',
  },
  dividerLine: {
    height: 1,
    width: 40,
    backgroundColor: '#000',
    marginHorizontal: 10,
  },
  successFooter: {
    marginBottom: 25,
  },
  successFooterText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  successActionButton: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  successActionText: {
    fontSize: 14,
    color: '#000',
    letterSpacing: 0.5,
  },
  serialBadge: {
    backgroundColor: '#000',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serialBadgeText: {
    color: '#fff',
    fontSize: 12,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryGradient: {
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    color: '#000',
  },
//new delete styles :
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    marginRight: 5,
  },
  cancelText: {
    fontSize: 14,
    color: '#000',
  },
  deleteConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    marginLeft: 5,
  },
  deleteText: {
    fontSize: 14,
    color: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'space-between',
  },
  summaryIcon: {
    marginBottom: 5,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dropdown: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 0,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  dropdownList: {
    borderWidth: 0,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
});

export default QuoteRequestPage;




























// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   Animated,
//   Platform,
//   Alert,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import {useNavigation} from '@react-navigation/native';
// import AppText from '../../../components/AppText';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import DropDownPicker from 'react-native-dropdown-picker';
// import EditQuoteModal from './EditQuoteModal';
// import {useSafeAreaInsets} from 'react-native-safe-area-context';
// import PremiumLoginModal from '../../../components/PremiumLoginModal';

// const {width, height} = Dimensions.get('window');

// const QuoteRequestPage = ({navigation, route}) => {
//   const [cart, setCart] = useState({
//     items: [],
//     totalSqft: 0,
//     totalQuantity: 0
//   });
//   const [user, setUser] = useState(null);
//   const {selectedCategory} = route.params;
//   const [showLoginModal, setShowLoginModal] = useState(false);

//   const fetchData = async () => {
//     try {
//       const token = await AsyncStorage.getItem('buyerToken');
//       if (!token) {
//         setShowLoginModal(true);
//         return;
//       }

//       // Fetch cart data
//       const response = await axios.get(
//         'https://upvcconnect.com/api/buyer',
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       console.log(response,".......................................")

//       // If no cart exists, create one
//       if (!response.data) {
//         await axios.post(
//           'https://upvcconnect.com/api/buyer',
//           { buyer: user._id },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               'Content-Type': 'application/json',
//             },
//           },
//         );
//         setCart({ items: [], totalSqft: 0, totalQuantity: 0 });
//       } else {
//         console.log("response.data : " , response.data)
//         setCart(response.data);
//       }

//       // Fetch user data
//       const userRes = await axios.get('https://upvcconnect.com/api/buyer', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       setUser(userRes?.data?.user);
//       setFormData(prev => ({
//         ...prev,
//         totalSqft: response.data?.totalSqft || 0,
//         contact: userRes?.data?.user?.mobileNumber,
//       }));
//     } catch (err) {
//       console.error('Error fetching data:', err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const [formData, setFormData] = useState({
//     name: '',
//     contact: '',
//     whatsapp: '',
//     email: '',
//     projectName: '',
//     projectAddress: '',
//     pincode: '',
//     gmapLocation: '',
//     projectStage: '',
//     timeline: '',
//     totalSqft: '',
//     category: selectedCategory?.name || 'Please select category',
//   });

//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const fadeAnim = useState(new Animated.Value(0))[0];
//   const [isLoading, setIsLoading] = useState(false);

//   // State for dropdowns
//   const [stageOpen, setStageOpen] = useState(false);
//   const [stageValue, setStageValue] = useState(null);
//   const [stageItems, setStageItems] = useState([
//     {label: 'Planning', value: 'planning'},
//     {label: 'Under Construction', value: 'under construction'},
//     {label: 'Ready to Move', value: 'ready to move'},
//     {label: 'Other', value: 'other'},
//   ]);

//   const [timelineOpen, setTimelineOpen] = useState(false);
//   const [timelineValue, setTimelineValue] = useState(null);
//   const [timelineItems, setTimelineItems] = useState([
//     {label: '0-30 days', value: '0-30 days'},
//     {label: '31-60 days', value: '31-60 days'},
//     {label: 'above 60 days', value: 'above 60 days'},
//   ]);

//   useEffect(() => {
//     setFormData(prev => ({
//       ...prev,
//       projectStage: stageValue,
//       timeline: timelineValue,
//     }));
//   }, [stageValue, timelineValue]);

//   const handleInputChange = (name, value) => {
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   const handleSubmit = async () => {
//     const requiredFields = [
//       'name',
//       'contact',
//       'email',
//       'projectName',
//       'projectAddress',
//       'pincode',
//       'gmapLocation',
//       'whatsapp',
//     ];

//     for (const field of requiredFields) {
//       if (!formData[field] || formData[field].trim() === '') {
//         Alert.alert('Error', `Please fill in the ${field} field`);
//         return;
//       }
//     }

//     if (cart.items.length === 0) {
//       Alert.alert('Error', 'Please add at least one product to your cart');
//       return;
//     }

//     try {
//       setIsLoading(true);
//       const token = await AsyncStorage.getItem('buyerToken');
//       const leadData = {
//         quotes: cart.items.map(item => ({
//           productType: item.productType,
//           product: item.product?._id,
//           color: item.color,
//           installationLocation: item.installationLocation,
//           height: item.height,
//           width: item.width,
//           quantity: item.quantity,
//           remark: item.remark || '',
//           sqft: item.sqft,
//         })),
//         contactInfo: {
//           name: formData.name,
//           contactNumber: formData.contact,
//           whatsappNumber: formData.whatsapp || formData.contact,
//           email: formData.email,
//         },
//         projectInfo: {
//           name: formData.projectName,
//           address: formData.projectAddress,
//           pincode: formData.pincode,
//           googleMapLink: formData.gmapLocation,
//           stage: formData.projectStage,
//           timeline: formData.timeline,
//         },
//         totalSqft: cart.totalSqft,
//         categoryId: selectedCategory._id,
//       };

//       const response = await axios.post(
//         'https://upvcconnect.com/api/seller/lead',
//         leadData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       if (response.status === 201) {
//         // Clear the cart after successful submission
//         await axios.delete('https://upvcconnect.com/api/buyer/cart', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
        
//         setCart({ items: [], totalSqft: 0, totalQuantity: 0 });
        
//         // Reset form data
//         setFormData({
//           name: '',
//           contact: user?.mobileNumber || '',
//           whatsapp: '',
//           email: '',
//           projectName: '',
//           projectAddress: '',
//           pincode: '',
//           gmapLocation: '',
//           projectStage: '',
//           timeline: '',
//           totalSqft: '0',
//           category: selectedCategory?.name || 'Please select category',
//         });

//         setIsSubmitted(true);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }).start();
//       }
//     } catch (error) {
//       console.error('Error creating lead:', error);
//       Alert.alert(
//         'Error',
//         error.response?.data?.message ||
//           'Failed to submit lead. Please try again.',
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCloseSuccess = () => {
//     Animated.timing(fadeAnim, {
//       toValue: 0,
//       duration: 500,
//       useNativeDriver: true,
//     }).start(() => {
//       setIsSubmitted(false);
//       navigation.navigate('BuyerMain');
//       fetchData();
//     });
//   };

//   const [isEditModalVisible, setIsEditModalVisible] = useState(false);
//   const [currentItem, setCurrentItem] = useState(null);
//   const [isUpdating, setIsUpdating] = useState(false);

//   const handleEditItem = (item) => {
//     setCurrentItem(JSON.parse(JSON.stringify(item)));
//     setIsEditModalVisible(true);
//   };

//   const handleUpdateItem = async (updatedItem) => {
//     try {
//       setIsUpdating(true);
//       const token = await AsyncStorage.getItem('buyerToken');

//       // Update the item in the cart
//       const response = await axios.put(
//         `https://upvcconnect.com/api/buyer/cart/item/${updatedItem._id}`,
//         updatedItem,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         },
//       );

//       if (response.status === 200) {
//         setIsEditModalVisible(false);
//         fetchData(); // Refresh cart data
//         Alert.alert('Success', 'Item updated successfully');
//       }
//     } catch (error) {
//       console.error('Error updating item:', error);
//       Alert.alert('Error', 'Failed to update item');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   const handleDeleteItem = async (itemId) => {
//     try {
//       const token = await AsyncStorage.getItem('buyerToken');
//       await axios.delete(
//         `https://upvcconnect.com/api/buyer/cart/item/${itemId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       fetchData(); // Refresh cart data
//       Alert.alert('Success', 'Item removed successfully');
//     } catch (error) {
//       console.error('Error deleting item:', error);
//       Alert.alert('Error', 'Failed to remove item');
//     }
//   };

//   const renderSelectedItems = () => {
//     return (
//       <View style={styles.sectionContainer}>
//         <View>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={30} color="#000" />
//           </TouchableOpacity>

//           <View style={styles.logoContainer}>
//             <Image
//               source={require('../../../assets/logo.png')}
//               style={styles.logo}
//             />
//           </View>
//         </View>
//         <AppText weight="Inter" style={styles.sectionTopHeader}>
//           YOUR CART ITEMS
//         </AppText>
//         <View style={styles.itemsContainer}>
//           {cart.items?.map((item, ind) => (
//             <View key={item._id} style={styles.itemCard}>
//               <LinearGradient
//                 colors={['#f5f5f5', '#ffffff']}
//                 style={styles.cardGradient}
//                 start={{x: 0, y: 0}}
//                 end={{x: 1, y: 1}}>
//                 <View style={styles.cardHeader}>
//                   <View style={styles.serialBadge}>
//                     <AppText weight="Inter" style={styles.serialBadgeText}>
//                       {ind + 1}
//                     </AppText>
//                   </View>
//                   <View style={styles.cardActions}>
//                     <TouchableOpacity
//                       style={styles.editButton}
//                       onPress={() => handleEditItem(item)}>
//                       <Icon name="edit" size={18} color="#000" />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                       style={styles.deleteButton}
//                       onPress={() => handleDeleteItem(item._id)}>
//                       <Icon name="delete" size={18} color="#ff0000" />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//                 <View style={styles.cardHeader}>
//                   <AppText weight="Inter" style={styles.cardTitle}>
//                     {item?.product?.title}
//                   </AppText>
//                 </View>

//                 <View style={styles.itemGrid}>
//                   <View style={styles.itemColumn}>
//                     <View style={styles.itemField}>
//                       <AppText weight="Inter" style={styles.itemLabel}>
//                         COLOR
//                       </AppText>
//                       <AppText weight="Inter" style={styles.itemValue}>
//                         {item.color}
//                       </AppText>
//                     </View>
//                     <View style={styles.itemField}>
//                       <AppText weight="Inter" style={styles.itemLabel}>
//                         HEIGHT
//                       </AppText>
//                       <AppText weight="Inter" style={styles.itemValue}>
//                         {item.height} ft
//                       </AppText>
//                     </View>
//                     <View style={styles.itemField}>
//                       <AppText weight="Inter" style={styles.itemLabel}>
//                         WIDTH
//                       </AppText>
//                       <AppText weight="Inter" style={styles.itemValue}>
//                         {item.width} ft
//                       </AppText>
//                     </View>
//                   </View>

//                   <View style={styles.itemColumn}>
//                     <View style={styles.itemField}>
//                       <AppText weight="Inter" style={styles.itemLabel}>
//                         LOCATION
//                       </AppText>
//                       <AppText weight="Inter" style={styles.itemValue}>
//                         {item.installationLocation}
//                       </AppText>
//                     </View>
//                     <View style={styles.itemField}>
//                       <AppText weight="Inter" style={styles.itemLabel}>
//                         QUANTITY
//                       </AppText>
//                       <AppText weight="Inter" style={styles.itemValue}>
//                         {item.quantity}
//                       </AppText>
//                     </View>
//                   </View>
//                 </View>

//                 <View style={styles.totalContainer}>
//                   <AppText weight="Inter" style={styles.totalLabel}>
//                     TOTAL
//                   </AppText>
//                   <AppText weight="Inter" style={styles.totalValue}>
//                     {item.sqft} sqft
//                   </AppText>
//                 </View>

//                 {item.remark && (
//                   <View style={styles.remarksContainer}>
//                     <AppText weight="Inter" style={styles.remarksLabel}>
//                       REMARKS
//                     </AppText>
//                     <AppText weight="Inter" style={styles.remarksValue}>
//                       {item.remark}
//                     </AppText>
//                   </View>
//                 )}
//               </LinearGradient>
//             </View>
//           ))}
//           <View style={styles.summaryCard}>
//             <View style={styles.summaryItem}>
//               <Icon
//                 name="straighten"
//                 size={20}
//                 color="#000"
//                 style={styles.summaryIcon}
//               />
//               <AppText weight="Inter" style={styles.summaryLabel}>
//                 TOTAL SQ FT
//               </AppText>
//               <AppText weight="Inter" style={styles.summaryValue}>
//                 {cart.totalSqft}
//               </AppText>
//             </View>

//             <View style={styles.summaryItem}>
//               <Icon
//                 name="format-list-numbered"
//                 size={20}
//                 color="#000"
//                 style={styles.summaryIcon}
//               />
//               <AppText weight="Inter" style={styles.summaryLabel}>
//                 TOTAL QUANTITY
//               </AppText>
//               <AppText weight="Inter" style={styles.summaryValue}>
//                 {cart.totalQuantity}
//               </AppText>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   const renderForm = () => {
//     return (
//       <View style={styles.sectionContainer}>
//         <View style={styles.formContainer}>
//           <AppText weight="Inter" style={styles.sectionHeader}>
//             PERSONAL DETAILS
//           </AppText>
//           <View style={styles.inputRow}>
//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="person"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Full Name"
//                 placeholderTextColor="#999"
//                 value={formData.name}
//                 onChangeText={text => handleInputChange('name', text)}
//               />
//             </View>
//           </View>

//           <View style={styles.inputRow}>
//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="phone"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Contact Number"
//                 placeholderTextColor="#999"
//                 keyboardType="phone-pad"
//                 value={formData.contact}
//               />
//             </View>

//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="chat"
//                 type="font-awesome"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="WhatsApp"
//                 placeholderTextColor="#999"
//                 keyboardType="phone-pad"
//                 value={formData.whatsapp}
//                 onChangeText={text => handleInputChange('whatsapp', text)}
//               />
//             </View>
//           </View>

//           <View style={styles.inputRow}>
//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="email"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Email Address"
//                 placeholderTextColor="#999"
//                 keyboardType="email-address"
//                 value={formData.email}
//                 onChangeText={text => handleInputChange('email', text)}
//               />
//             </View>
//           </View>

//           <AppText weight="Inter" style={styles.sectionHeader}>
//             PROJECT DETAILS
//           </AppText>
//           <View style={styles.inputRow}>
//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="business"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Project Name"
//                 placeholderTextColor="#999"
//                 value={formData.projectName}
//                 onChangeText={text => handleInputChange('projectName', text)}
//               />
//             </View>
//           </View>

//           <View style={styles.inputRow}>
//             <View style={[styles.inputContainer, styles.inputWithIcon]}>
//               <Icon
//                 name="location-on"
//                 size={20}
//                 color="#000"
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 style={styles.input}
//                 placeholder="Project Address"
//                 placeholderTextColor="#999"
//                 multiline
//                 value={formData.projectAddress}
//                 onChangeText={text => handleInputChange('projectAddress', text)}
//               />
//             </View>
//           </View>

//           <View style={styles.inputRow}>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Pin Code"
//                 placeholderTextColor="#999"
//                 keyboardType="number-pad"
//                 value={formData.pincode}
//                 onChangeText={text => handleInputChange('pincode', text)}
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Google Map Link"
//                 placeholderTextColor="#999"
//                 value={formData.gmapLocation}
//                 onChangeText={text => handleInputChange('gmapLocation', text)}
//               />
//             </View>
//           </View>

//           <View style={styles.dropdownInputRow}>
//             <View style={[styles.dropdownContainer, {zIndex: 2000}]}>
//               <AppText weight="Inter" style={styles.dropdownLabel}>
//                 PROJECT STAGE
//               </AppText>
//               <DropDownPicker
//                 open={stageOpen}
//                 value={stageValue}
//                 items={stageItems}
//                 setOpen={setStageOpen}
//                 setValue={setStageValue}
//                 setItems={setStageItems}
//                 placeholder="Select project stage"
//                 style={styles.dropdown}
//                 dropDownContainerStyle={styles.dropdownList}
//                 textStyle={styles.dropdownText}
//                 placeholderStyle={styles.dropdownPlaceholder}
//                 zIndex={2000}
//                 zIndexInverse={1000}
//               />
//             </View>

//             <View style={[styles.dropdownContainer, {zIndex: 1000}]}>
//               <AppText weight="Inter" style={styles.dropdownLabel}>
//                 TIMELINE
//               </AppText>
//               <DropDownPicker
//                 open={timelineOpen}
//                 value={timelineValue}
//                 items={timelineItems}
//                 setOpen={setTimelineOpen}
//                 setValue={setTimelineValue}
//                 setItems={setTimelineItems}
//                 placeholder="Select timeline"
//                 style={styles.dropdown}
//                 dropDownContainerStyle={styles.dropdownList}
//                 textStyle={styles.dropdownText}
//                 placeholderStyle={styles.dropdownPlaceholder}
//                 zIndex={1000}
//                 zIndexInverse={2000}
//               />
//             </View>
//           </View>

//           <View style={styles.inputRow}>
//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Total Sq. Feet"
//                 placeholderTextColor="#999"
//                 keyboardType="number-pad"
//                 value={`${formData.totalSqft?.toString()} sqft` || ''}
//               />
//             </View>

//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 placeholder="Category"
//                 placeholderTextColor="#999"
//                 value={formData.category}
//               />
//             </View>
//           </View>

//           <TouchableOpacity
//             style={styles.submitButton}
//             onPress={handleSubmit}
//             disabled={isLoading}>
//             <LinearGradient
//               colors={['#000000', '#000000']}
//               style={styles.buttonGradient}
//               start={{x: 0, y: 0}}
//               end={{x: 1, y: 0}}>
//               {isLoading && <ActivityIndicator color="#fff" />}
//               <AppText weight="Inter" style={styles.submitButtonText}>
//                 GENERATE LEAD
//               </AppText>
//               <Icon
//                 name="arrow-forward"
//                 size={22}
//                 color="#fff"
//                 style={styles.buttonIcon}
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   const renderSuccessMessage = () => {
//     return (
//       <Animated.View style={[styles.successContainer, {opacity: fadeAnim}]}>
//         <View style={styles.successOverlay} />
//         <View style={styles.successCard}>
//           <LinearGradient
//             colors={['#ffffff', '#f9f9f9']}
//             style={styles.successGradient}
//             start={{x: 0, y: 0}}
//             end={{x: 1, y: 1}}>
//             <TouchableOpacity
//               style={styles.closeButton}
//               onPress={handleCloseSuccess}>
//               <Icon name="close" size={24} color="#000" />
//             </TouchableOpacity>

//             <View style={styles.successIconContainer}>
//               <Icon name="check-circle" size={60} color="#000" />
//             </View>

//             <AppText weight="Inter" style={styles.successTitle}>
//               THANK YOU!
//             </AppText>

//             <View style={styles.successMessageContainer}>
//               <AppText weight="Inter" style={styles.successText}>
//                 Your quote request has been
//               </AppText>
//               <AppText weight="Inter" style={styles.successText}>
//                 successfully submitted
//               </AppText>
//             </View>

//             <View style={styles.successDivider}>
//               <View style={styles.dividerLine} />
//               <Icon name="star" size={18} color="#000" />
//               <View style={styles.dividerLine} />
//             </View>

//             <View style={styles.successFooter}>
//               <AppText weight="Inter" style={styles.successFooterText}>
//                 Our team will contact you
//               </AppText>
//               <AppText weight="Inter" style={styles.successFooterText}>
//                 within 24 hours with
//               </AppText>
//               <AppText weight="Inter" style={styles.successFooterText}>
//                 competitive quotes
//               </AppText>
//             </View>

//             <TouchableOpacity
//               style={styles.successActionButton}
//               onPress={handleCloseSuccess}>
//               <AppText weight="Inter" style={styles.successActionText}>
//                 BACK TO HOME
//               </AppText>
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>
//       </Animated.View>
//     );
//   };

//   const insets = useSafeAreaInsets();
//   return (
//     <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>
//       <View style={styles.mainContainer}>
//         <ScrollView
//           style={styles.container}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}>
//           {renderSelectedItems()}
//           {!isSubmitted ? renderForm() : null}
//         </ScrollView>
//         {isSubmitted && renderSuccessMessage()}
//         {currentItem && (
//           <EditQuoteModal
//             visible={isEditModalVisible}
//             onClose={() => {
//               setIsEditModalVisible(false);
//               setCurrentItem(null);
//             }}
//             quote={currentItem}
//             onUpdate={handleUpdateItem}
//             isLoading={isUpdating}
//             key={currentItem?._id}
//           />
//         )}
//       </View>
//       <PremiumLoginModal
//         visible={showLoginModal}
//         onClose={() => setShowLoginModal(false)}
//         navigation={navigation}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 40,
//   },
//   sectionContainer: {
//     paddingHorizontal: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     top: '30%',
//     transform: [{translateY: -12}],
//     padding: 5,
//   },
//   logoContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 100,
//     height: 50,
//   },
//   sectionTopHeader: {
//     fontSize: 18,
//     color: '#000',
//     paddingBottom: 30,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//   },
//   sectionHeader: {
//     fontSize: 14,
//     color: '#000',
//     marginBottom: 20,
//     letterSpacing: 1,
//     textTransform: 'uppercase',
//   },
//   itemsContainer: {
//     marginBottom: 15,
//   },
//   itemCard: {
//     borderRadius: 14,
//     marginBottom: 14,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 6},
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   cardGradient: {
//     padding: 20,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 15,
//     justifyContent: 'space-between',
//   },
//   cardTitle: {
//     fontSize: 16,
//     color: '#000',
//     letterSpacing: 0.5,
//     marginBottom: 15,
//     marginTop: 5,
//   },
//   editButton: {
//     padding: 5,
//     marginLeft: 10,
//   },
//   deleteButton: {
//     padding: 5,
//     marginLeft: 10,
//   },
//   cardActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   itemGrid: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   itemColumn: {
//     width: '48%',
//   },
//   itemField: {
//     marginBottom: 12,
//   },
//   itemLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 2,
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
//   itemValue: {
//     fontSize: 14,
//     color: '#000',
//   },
//   totalContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)',
//   },
//   totalLabel: {
//     fontSize: 14,
//     color: '#000',
//     textTransform: 'uppercase',
//   },
//   totalValue: {
//     fontSize: 16,
//     color: '#000',
//   },
//   remarksContainer: {
//     marginTop: 10,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(0,0,0,0.1)',
//   },
//   remarksLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 2,
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
//   remarksValue: {
//     fontSize: 13,
//     color: '#000',
//     fontStyle: 'italic',
//   },
//   formContainer: {
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     padding: 20,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 6},
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   inputRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 15,
//   },
//   dropdownInputRow: {
//     flexDirection: 'col',
//     marginBottom: 15,
//   },
//   inputContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//   },
//   inputWithIcon: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     paddingBottom: 8,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 14,
//     color: '#000',
//     paddingVertical: 8,
//   },
//   submitButton: {
//     marginTop: 25,
//     borderRadius: 12,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 4},
//         shadowOpacity: 0.3,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   buttonGradient: {
//     paddingVertical: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   submitButtonText: {
//     color: '#fff',
//     letterSpacing: 2,
//   },
//   buttonIcon: {
//     marginLeft: 10,
//   },
//   successContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 100,
//   },
//   successOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//   },
//   successCard: {
//     width: width - 40,
//     borderRadius: 20,
//     overflow: 'hidden',
//   },
//   successGradient: {
//     padding: 30,
//     alignItems: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     padding: 5,
//   },
//   successIconContainer: {
//     marginBottom: 20,
//   },
//   successTitle: {
//     fontSize: 24,
//     color: '#000',
//     marginBottom: 10,
//     textAlign: 'center',
//     letterSpacing: 1,
//   },
//   successMessageContainer: {
//     marginBottom: 15,
//   },
//   successText: {
//     fontSize: 16,
//     color: '#000',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   successDivider: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 15,
//     width: '100%',
//     justifyContent: 'center',
//   },
//   dividerLine: {
//     height: 1,
//     width: 40,
//     backgroundColor: '#000',
//     marginHorizontal: 10,
//   },
//   successFooter: {
//     marginBottom: 25,
//   },
//   successFooterText: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     lineHeight: 20,
//   },
//   successActionButton: {
//     borderWidth: 1,
//     borderColor: '#000',
//     borderRadius: 20,
//     paddingVertical: 10,
//     paddingHorizontal: 25,
//   },
//   successActionText: {
//     fontSize: 14,
//     color: '#000',
//     letterSpacing: 0.5,
//   },
//   serialBadge: {
//     backgroundColor: '#000',
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   serialBadgeText: {
//     color: '#fff',
//     fontSize: 12,
//   },
//   summaryCard: {
//     backgroundColor: 'white',
//     flexDirection: 'row',
//     padding: 20,
//     borderWidth: 1,
//     borderColor: 'rgba(0,0,0,0.05)',
//     borderRadius: 12,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: {width: 0, height: 4},
//         shadowRadius: 6,
//         shadowOpacity: 0.1,
//       },
//       android: {
//         elevation: 4,
//       },
//     }),
//   },
//   summaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#666',
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//     marginBottom: 5,
//   },
//   summaryValue: {
//     fontSize: 20,
//     color: '#000',
//   },
//   summaryIcon: {
//     marginBottom: 5,
//   },
//   dropdownContainer: {
//     flex: 1,
//     marginHorizontal: 5,
//     marginBottom: 15,
//   },
//   dropdownLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 5,
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
//   dropdown: {
//     borderWidth: 0,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     borderRadius: 0,
//     paddingHorizontal: 0,
//     backgroundColor: 'transparent',
//   },
//   dropdownList: {
//     borderWidth: 0,
//     marginTop: 5,
//     shadowColor: '#000',
//     shadowOffset: {width: 0, height: 2},
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   dropdownText: {
//     fontSize: 14,
//     color: '#000',
//   },
//   dropdownPlaceholder: {
//     fontSize: 14,
//     color: '#999',
//   },
// });

// export default QuoteRequestPage;
import React, { useState, useEffect } from 'react';
import { View, Animated, ScrollView, Modal, TouchableOpacity, Image, FlatList, Switch, Alert, StyleSheet, Dimensions, RefreshControl, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import PremiumLoginModal from '../../components/PremiumLoginModal';
import CountdownTimer from '../Buyer/components/CountdownTimer';
import AppText from '../../components/AppText';
import NotificationService from '../../utils/NotificationService';
import SellerNotificationBell from '../../components/Seller/SellerNotificationBell';
import { useFocusEffect } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');

const LeadDetails = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSlotDetails, setShowSlotDetails] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [maxSlots, setMaxSlots] = useState(6);
  const [remainingQuota, setRemainingQuota] = useState(0);
  const [useFreeQuota, setUseFreeQuota] = useState(false);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [freeSqftToUse, setFreeSqftToUse] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [sellerProfile, setSellerProfile] = useState(null);

  // Check if all uploaded documents are approved
  const areDocsVerified = () => {
    if (!sellerProfile) return false;
    const gstOk = sellerProfile.gstCertificateStatus === 'approved';
    const cardOk = !sellerProfile.visitingCard || sellerProfile.visitingCardStatus === 'approved';
    const videoOk = !sellerProfile.businessProfileVideo || sellerProfile.businessProfileVideoStatus === 'approved';
    return gstOk && cardOk && videoOk;
  };

  // Reset exit dialog when screen comes back into focus (e.g. app resumed from background)
  useFocusEffect(
    React.useCallback(() => {
      setShowExitDialog(false);
    }, [])
  );

  // Handle back button press - show exit confirmation on LeadDetails (home screen)
  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', onPress: () => null, style: 'cancel' },
          { text: 'EXIT', onPress: () => BackHandler.exitApp() },
        ]);
        return true; // Prevent default back behavior
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleExitApp = () => {
    BackHandler.exitApp();
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const fetchQuota = async () => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) return;

      const response = await axios.get('https://upvcconnect.com/api/seller/lead/quota', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRemainingQuota(response.data.remainingQuota);
    } catch (error) {
      console.error('Error fetching quota:', error);
    }
  };

  const fetchSellerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) return;
      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSellerProfile(response.data.seller);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchQuota();
    fetchSellerProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const fetchLeads = async () => {
    try {
      const response = await axios.get('https://upvcconnect.com/api/seller/lead');

      if (response.data.success) {
        // DEBUG: log raw seller data from first lead with sellers
        const leadsWithSellers = response.data.leads?.filter(l => l.seller?.length > 0);
        if (leadsWithSellers?.length > 0) {
          console.log('🔍 Lead with sellers - seller array:', JSON.stringify(leadsWithSellers[0].seller));
        }
        // UPDATED LOGIC: Filter leads to be within the last 72 hours
        // const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
        const seventyTwoHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

        const formattedLeads = response.data.leads
          .filter(lead => new Date(lead.createdAt) >= seventyTwoHoursAgo) // This is the new filter
          .filter(lead => lead.availableSlots > 0)
          .map(lead => ({
            id: lead._id,
            city: lead.projectInfo.address,
            projectArea: lead?.projectInfo?.area,
            pincode: lead.projectInfo.pincode,
            area: `${lead.totalSqft} sq ft`,
            timeline: lead.projectInfo.timeline,
            price: `₹${Math.round(lead.dynamicSlotPrice || lead.basePricePerSqft * lead.totalSqft)}`,
            date: format(new Date(lead.createdAt), 'yyyy-MM-dd'),
            specs: lead.quotes.map(q => q.product?.title).join(', '),
            slotsLeft: lead.availableSlots,
            slotOccupants: lead?.seller
              ?.filter(s => s.sellerId)
              .map(s => ({
                id: s.sellerId?._id?.toString() || s.sellerId?.toString(),
                name: s.sellerId?.companyName || 'Unknown Seller',
                brand: s.sellerId?.brandOfProfileUsed || 'Unknown Brand'
              })),
            rawData: lead, // Keep rawData for createdAt timestamp
          }));
        setLeads(formattedLeads);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch leads'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLeads();
      fetchQuota();
    });

    return unsubscribe;
  }, [navigation]);

  // Filter leads based on selected date
  const filteredLeads = selectedDate
    ? leads.filter(lead => lead.date === selectedDate)
    : leads;
  // console.log("filteredLeads : " , filteredLeads[0].rawData.projectInfo)
  const toggleCalendar = () => setShowCalendar(!showCalendar);

  const handleDayPress = day => {
    setSelectedDate(day.dateString);
    setShowCalendar(false);
  };

  const clearFilter = () => setSelectedDate(null);

  const renderSlotIndicator = lead => {
    const totalSlots = 6;
    const slotsLeft = lead.slotsLeft;
    const slotsTaken = totalSlots - slotsLeft;
    const slotWidth = (width - 160) / totalSlots;

    return (
      <View style={styles.slotContainer}>
        <View style={styles.slotHeader}>
          <AppText weight="Inter" style={styles.slotText}>
            {slotsLeft} SLOTS LEFT ({slotsTaken}/6)
          </AppText>
          {slotsTaken > 0 && (
            <TouchableOpacity
              style={styles.viewOccupantsButton}
              onPress={() => {
                console.log('🔍 slotOccupants:', JSON.stringify(lead.slotOccupants));
                console.log('🔍 rawData.seller:', JSON.stringify(lead.rawData?.seller));
                setCurrentLead(lead);
                setShowSlotDetails(true);
              }}>
              <AppText weight="Inter" style={styles.viewOccupantsText}>
                View Occupants
              </AppText>
              <Icon name="chevron-right" size={16} color="#000" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.slotBar}>
          {[...Array(totalSlots)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.slot,
                { width: slotWidth },
                index < slotsTaken ? styles.slotEmpty : styles.slotFilled,
                index === 0 && {
                  borderTopLeftRadius: 4,
                  borderBottomLeftRadius: 4,
                },
                index === totalSlots - 1 && {
                  borderTopRightRadius: 4,
                  borderBottomRightRadius: 4,
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderSlotOccupant = ({ item, index }) => (
    <View style={styles.occupantCard}>
      <View style={styles.occupantAvatar}>
        <AppText weight="Bold" style={styles.occupantAvatarText}>
          {index + 1}
        </AppText>
      </View>
      <View style={styles.occupantInfo}>
        <View style={styles.occupantBrandTag}>
          <AppText weight="SemiBold" style={styles.occupantBrandText}>
            {item.brand || 'Unknown Brand'}
          </AppText>
        </View>
        <AppText weight="Inter" style={styles.occupantName}>
          {item.name || 'Unknown Seller'}
        </AppText>
      </View>
      <Icon name="check-circle" size={18} color="#4CAF50" />
    </View>
  );

  const checkExistingVideo = async () => {
    try {
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token) return false;

      const response = await axios.get('https://upvcconnect.com/api/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success && response.data.seller.businessProfileVideo;
    } catch (error) {
      console.error('Error checking video:', error);
      return false;
    }
  };

  const handleBuyLead = async (lead) => {
    const token = await AsyncStorage.getItem('sellerToken');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    // Block if documents are not all verified
    if (!areDocsVerified()) {
      Toast.show({
        type: 'error',
        text1: '🔒 Documents Under Verification',
        text2: 'You can purchase leads once all your documents are approved.',
        position: 'top',
        visibilityTime: 4000,
      });
      return;
    }

    setCurrentLead(lead);
    setMaxSlots(lead.slotsLeft);

    const hasVideo = await checkExistingVideo();
    if (!hasVideo) {
      setShowPremiumPopup(true);
      return;
    }

    try {
      const quotaCheck = await axios.get(
        `https://upvcconnect.com/api/seller/lead/lead-quota-check/${lead.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (remainingQuota > 0 && !quotaCheck.data.alreadyUsed) {
        setShowQuotaModal(true);
      }
      else {
        // alert("No you cant buy this lead")
        setShowQuotaModal(true);
        //   setShowSlotModal(true);
      }
    } catch (error) {
      console.error('Error checking quota:', error);
      // setShowSlotModal(true);
    }
  };

  const handlePurchaseLead = async (slotsToBuy, actualPrice) => {
    try {
      setShowQuotaModal(false)
      const token = await AsyncStorage.getItem('sellerToken');
      if (!token || !currentLead) return;

      const leadSqft = currentLead.rawData.totalSqft;

      const freeSqftToUse = useFreeQuota
        ? Math.min(
          50, // Max per transaction
          remainingQuota,
          leadSqft // Can't exceed the first slot purchase size
        )
        : 0;

      setFreeSqftToUse(freeSqftToUse)

      const payload = {
        leadId: currentLead.rawData._id,
        slotsToBuy,
        useFreeQuota,
        freeSqftToUse,
        price : actualPrice
      };
      const response = await axios.post(
        'https://upvcconnect.com/api/seller/lead/purchase',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowSlotModal(false);
        setUseFreeQuota(false);

        await Promise.all([fetchLeads(), fetchQuota()]);

        // playSuccessSound();

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: useFreeQuota
            ? `Used ${freeSqftToUse} sqft from your free quota `
            : 'Lead purchased successfully'
        });
        
      

        navigation.navigate('ContactBuyer', {
          lead: currentLead,
          purchaseDetails: {
            freeSqftUsed: freeSqftToUse,
            amountPaid: response.data.actualPricePaid
          }
        });
      } 
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || error.message || 'Purchase failed'
      });
    }
  };

  const QuotaModal = () => {
    if (!currentLead?.rawData) return null;
    console.log("currentLead.rawData : " , currentLead.rawData.projectInfo.timeline)
    const leadSqft = currentLead.rawData.totalSqft || 0;
    const timeline = String(currentLead.rawData.projectInfo.timeline || "").toLowerCase();
    const basePricePerSlot = 599;
    const slotsToBuy = 1; //only 1 slot seller can buy at a time
    // console.log("timeline : 1111111" , timeline)
    let priceMultiplier = 1;
    if (timeline.includes("31-60 days")) {
      // priceMultiplier = 0.7; // 30% discount
      console.log("timeline : " , timeline)
      priceMultiplier = 0.8330550918;
    } else if (timeline.includes("above 60 days") || timeline.includes("60+ days")) {
      console.log("timeline : " , timeline)
      // priceMultiplier = 0.49; // 51% discount
      priceMultiplier = 0.6661101836
    }

    const maxFreeApplicable = Math.min(
      50,
      remainingQuota,
      leadSqft // Only apply to first slot's sqft
    );

    const freeSqftUsed = useFreeQuota ? maxFreeApplicable : 0;
    const freeSqftValue = freeSqftUsed * (basePricePerSlot / leadSqft) * priceMultiplier;

    // BUG FIX: Correctly calculate total price based on comments.
    const firstSlotPrice = basePricePerSlot * priceMultiplier - freeSqftValue;
    const additionalSlotsPrice = (slotsToBuy - 1) * basePricePerSlot * priceMultiplier;
    const actualPrice = firstSlotPrice + (slotsToBuy > 1 ? additionalSlotsPrice : 0);

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showQuotaModal}
        onRequestClose={() => setShowQuotaModal(false)}
      >
        <View style={styles.popupOverlay}>
          <View style={styles.quotaPopupContainer}>
            <AppText weight="SemiBold" style={styles.popupTitle}>
              Use Free Quota
            </AppText>

            {/* New container for the quota summary */}
            <View style={styles.quotaSummaryContainer}>
              <View style={styles.quotaSummaryRow}>
                <AppText style={styles.quotaSummaryLabel}>Monthly Bonus:</AppText>
                <AppText weight="SemiBold" style={styles.quotaSummaryValue}>200 sqft</AppText>
              </View>
              <View style={styles.quotaSummaryRow}>
                <AppText style={styles.quotaSummaryLabel}>Used:</AppText>
                <AppText weight="SemiBold" style={styles.quotaSummaryValue}>{200 - parseInt(remainingQuota)} sqft</AppText>
              </View>
              <View style={styles.quotaDivider} />
              <View style={styles.quotaSummaryRow}>
                <AppText style={styles.quotaSummaryLabel}>Available:</AppText>
                <AppText weight="Bold" style={[styles.quotaSummaryValue, { color: '#000' }]}>{remainingQuota} sqft</AppText>
              </View>
            </View>

            <AppText weight="Inter" style={styles.quotaInfoText}>
              A maximum of 50 sqft can be used per transaction.
            </AppText>

            <View style={styles.quotaCalculation}>
              <View style={styles.quotaSummaryRow}>
                <AppText style={styles.quotaCalculationText}>Lead Size:</AppText>
                <AppText weight="SemiBold" style={styles.quotaCalculationText}>{currentLead?.rawData?.totalSqft || 0} sqft</AppText>
              </View>
              <View style={styles.quotaSummaryRow}>
                <AppText style={styles.quotaCalculationText}>Free Quota Applicable:</AppText>
                <AppText weight="Bold" style={styles.quotaCalculationText}>{Math.min(50, remainingQuota, currentLead?.rawData?.totalSqft || 0)} sqft</AppText>
              </View>
            </View>
            {remainingQuota ?
              <View style={styles.quotaOption}>
                <Switch
                  trackColor={{ false: '#ccc', true: '#000' }}
                  thumbColor={useFreeQuota ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  value={useFreeQuota}
                  onValueChange={setUseFreeQuota}
                />
                <AppText weight="Inter" style={styles.quotaOptionText}>
                  Apply free quota to this purchase
                </AppText>
              </View> : <></>
            }
            <AppText weight="SemiBold" style={styles.buyNowText}>
              Total payable amount :
              ₹{Math.round(actualPrice)}
            </AppText>

            <AppText weight="SemiBold" style={styles.buyNowText}>
            </AppText>

            <View style={styles.quotaButtons}>
              <TouchableOpacity
                style={[styles.quotaButton, styles.skipButton]}
                onPress={() => {
                  setUseFreeQuota(false);
                  setShowQuotaModal(false);
                }}
              >
                <AppText weight="SemiBold" style={styles.skipButtonText}>
                  CANCEL
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quotaButton, styles.continueButton]}
                onPress={() => {
                  handlePurchaseLead(1, actualPrice)
                  setShowQuotaModal(false)
                }}
              >
                <AppText weight="SemiBold" style={styles.continueButtonText}>
                  BUY
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  };

  const renderSlotOption = (num) => {
    if (!currentLead?.rawData) return null;

    const leadSqft = currentLead.rawData.totalSqft || 0;
    const timeline = String(currentLead.rawData.timeline || "").toLowerCase();
    const basePricePerSlot = 599;
    const slotsToBuy = num;

    let priceMultiplier = 1;
    if (timeline.includes("31-60 days")) {
      // priceMultiplier = 0.7; // 30% discount
      priceMultiplier = 0.8330550918;
    } else if (timeline.includes("above 60 days") || timeline.includes("60+ days")) {
      // priceMultiplier = 0.49; // 51% discount
      priceMultiplier = 0.6661101836
    }

    const maxFreeApplicable = Math.min(
      50,
      remainingQuota,
      leadSqft // Only apply to first slot's sqft
    );

    const freeSqftUsed = useFreeQuota ? maxFreeApplicable : 0;
    const freeSqftValue = freeSqftUsed * (basePricePerSlot / leadSqft) * priceMultiplier;

    // BUG FIX: Correctly calculate total price based on comments.
    const firstSlotPrice = basePricePerSlot * priceMultiplier - freeSqftValue;
    const additionalSlotsPrice = (slotsToBuy - 1) * basePricePerSlot * priceMultiplier;
    const actualPrice = firstSlotPrice + (slotsToBuy > 1 ? additionalSlotsPrice : 0);

    return (
      <TouchableOpacity
        key={num}
        disabled={num > maxSlots}
        style={[styles.slotOption, num > maxSlots && { opacity: 0.4 }]}
        onPress={() => handlePurchaseLead(num, actualPrice)}
      >
        <View>
          <AppText weight="Inter" style={styles.slotOptionText}>
            {num} slot(s)
          </AppText>
          <AppText weight="Inter" style={styles.discountText}>
            {leadSqft * num} sqft - {useFreeQuota ? `${freeSqftUsed}` : '0'} sqft free
          </AppText>
        </View>
        <AppText weight="SemiBold" style={styles.buyNowText}>
          ₹{Math.round(actualPrice)}
        </AppText>
      </TouchableOpacity>
    );
  };

  const PremiumPopup = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showPremiumPopup}
      onRequestClose={() => setShowPremiumPopup(false)}
    >
      <View style={styles.popupOverlay2}>
        <View style={styles.popupContainer}>
          <View style={styles.popupHeader}>
            <AppText weight="Inter" style={styles.popupTitle}>
              Your chance
            </AppText>
            <AppText weight="Inter" style={styles.popupSubtitle}>
              of cracking the lead increases
            </AppText>
            <AppText weight="Inter" style={styles.popupHighlight}>
              by 80% when your
            </AppText>
            <AppText weight="Inter" style={styles.popupSubtitle}>
              customer sees your work and you
            </AppText>
          </View>

          <View style={styles.popupButtons}>
            <TouchableOpacity
              style={[styles.popupButton, styles.primaryButton]}
              onPress={() => {
                setShowPremiumPopup(false);
                navigation.navigate('SellerDashboard');
              }}>
              <Icon name="videocam" size={20} color="#fff" />
              <AppText weight="Inter" style={styles.popupButtonText}>
                Upload Video
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.popupButton, styles.secondaryButton]}
              onPress={() => {
                setShowPremiumPopup(false);
                setShowQuotaModal(true) //added new
                // setShowSlotModal(true);
              }}>
              <AppText weight="Inter" style={[styles.popupButtonText, { color: '#000' }]}>
                Skip for now
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <AppText>Loading leads...</AppText>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
           refreshControl={
                      <RefreshControl
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#000000']}
                        tintColor={'#000000'}
                      />
                    }
        >
          {/* Document verification banner */}
          {sellerProfile && !areDocsVerified() && (
            <View style={styles.docsBanner}>
              <AppText weight="SemiBold" style={styles.docsBannerText}>
                🔒 Your documents are under verification. You can view leads but cannot purchase until all documents are approved.
              </AppText>
            </View>
          )}

          {/* UI REWORK: Header and Subheader section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
              />
              <SellerNotificationBell navigation={navigation} />
            </View>
            <View style={styles.headerContent}>
              <AppText weight="SemiBold" style={styles.subheader}>
                Only 6 lucky manufacturers get a chance to buy a 100% authentic and verified lead.
              </AppText>
              <AppText weight="Bold" style={styles.subheader2}>
                Are you one of them?
              </AppText>
            </View>
            
          </View>

          {showCalendar && (
            <View style={styles.calendarContainer}>
              <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: '#000' },
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#000',
                  selectedDayBackgroundColor: '#000',
                  selectedDayTextColor: '#ffffff',
                  todayTextColor: '#000',
                  dayTextColor: '#000',
                  textDisabledColor: '#d9d9d9',
                  arrowColor: '#000',
                  monthTextColor: '#000',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '600',
                  textDayHeaderFontWeight: '600',
                }}
              />
            </View>
          )}


          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <Animated.View
                key={lead.id}
                style={[styles.card, styles.cardElevation]}
              >
                <CountdownTimer createdAt={lead.rawData.createdAt} />
                <View style={styles.cardHeader}>
                  <View style={styles.locationTag}>
                    <Icon name="location-on" size={16} color="#000" />
                    <AppText weight="Inter" style={styles.locationText}>
                      {lead?.rawData?.projectInfo?.area}
                    </AppText>
                  </View>

                  
                </View>

               
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <AppText weight="Inter" style={styles.detailLabel}>PIN CODE</AppText>
                    <AppText weight="SemiBold" style={styles.detailValue}>{lead.pincode}</AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <AppText weight="Inter" style={styles.detailLabel}>AREA</AppText>
                    <AppText weight="SemiBold" style={styles.detailValue}>{lead.area}</AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <AppText weight="Inter" style={styles.detailLabel}>TIMELINE</AppText>
                    <AppText weight="SemiBold" style={styles.detailValue}>{lead.timeline}</AppText>
                  </View>
                  <View style={styles.detailItem}>
  <AppText weight="Inter" style={styles.detailLabel}>COLOR</AppText>
  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
    {lead.rawData?.quotes?.length > 0 ? (
      lead.rawData.quotes.map((quote, index) => {
        const totalSqft = (quote.sqft || 0) * (quote.quantity || 1);
        return (
          <AppText
            key={index}
            weight="SemiBold"
            style={styles.detailValue}
            numberOfLines={1}
          >
            {quote.color || 'N/A'} - {totalSqft} sqft 
          </AppText>
        );
      })
    ) : (
      <AppText weight="SemiBold" style={styles.detailValue}>N/A</AppText>
    )}
  </View>
</View>


                </View>

                {renderSlotIndicator(lead)}

                <View style={styles.priceContainer}>
                  <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => handleBuyLead(lead)}
                  >
                    <AppText weight="Inter" style={styles.buyButtonText}>
                      BUY LEAD
                    </AppText>
                    <Icon name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Icon name="info-outline" size={30} color="#666" />
              <AppText weight="Inter" style={styles.noResultsText}>
                No active leads available right now.
              </AppText>
              {selectedDate && (
                <TouchableOpacity onPress={clearFilter}>
                  <AppText weight="Inter" style={styles.clearFilterLink}>
                    (Clear date filter to see all leads)
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showSlotDetails}
          onRequestClose={() => setShowSlotDetails(false)}
        >
          <View style={styles.occupantsOverlay}>
            <View style={styles.occupantsContainer}>
              <View style={styles.occupantsHeader}>
                <View>
                  <AppText weight="Bold" style={styles.occupantsTitle}>
                    Slot Occupants
                  </AppText>
                  <AppText weight="Inter" style={styles.occupantsSubtitle}>
                    {currentLead?.slotOccupants?.length || 0} of {currentLead?.rawData?.maxSlots || 6} slots filled
                  </AppText>
                </View>
                <TouchableOpacity onPress={() => setShowSlotDetails(false)}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={currentLead?.slotOccupants || []}
                renderItem={renderSlotOccupant}
                keyExtractor={(item, index) => item.id || String(index)}
                contentContainerStyle={styles.occupantsList}
              />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showSlotModal}
          onRequestClose={() => setShowSlotModal(false)}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <View style={styles.popupHeader}>
                <AppText weight="Inter" style={styles.popupTitle}>
                  Select Slot(s)
                </AppText>
                <TouchableOpacity onPress={() => setShowSlotModal(false)}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <AppText weight="Inter" style={styles.popupSubtitle}>
                Choose how many slots you want to buy
              </AppText>
              {[1, 2, 3, 4, 5, 6].map(num => renderSlotOption(num))}
            </View>
          </View>
        </Modal>

        <QuotaModal />
        <PremiumPopup />
      </View>
      <PremiumLoginModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        navigation={navigation}
        seller={true}
      />

    </View>
  );
};

// CSS is below

const styles = StyleSheet.create({
  docsBanner: {
    backgroundColor: '#FFF3CD',
    borderLeftWidth: 4,
    borderLeftColor: '#F39C12',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 10,
    marginBottom: 12,
    marginTop: 8,
  },
  docsBannerText: {
    fontSize: 13,
    color: '#7D5A00',
    lineHeight: 18,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingBottom: 100,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  cardElevation: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pinTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  locationText: {
    // fontSize: 14,
    color: '#000',
    marginLeft: 5,
  },
  slotContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  slotText: {
    // fontSize: 12,
    color: '#555',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  slotBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  slot: {
    height: '100%',
    marginRight: 2,
  },
  slotEmpty: {
    backgroundColor: '#000', // Black = SOLD/TAKEN
  },
  slotFilled: {
    backgroundColor: '#e0e0e0', // Grey = AVAILABLE
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 5,
    columnGap: 10,
  },
  detailItem: {
    width: '25%',
    marginBottom: 15,
  },
  detailLabel: {
    color: '#666',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailValue: {
    // fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceLabel: {
    // fontSize: 11,
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceValue: {
    // fontSize: 20,
    color: '#000',
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: '#000',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    color: '#fff',
    // fontSize: 13,
    marginRight: 6,
    letterSpacing: 2,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noResultsText: {
    // fontSize: 16,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  clearFilterLink: {
    // fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewOccupantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewOccupantsText: {
    // fontSize: 12,
    color: '#000',
    marginRight: 4,
  },
  occupantsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  occupantsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: height * 0.7,
    padding: 20,
  },
  occupantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  occupantsTitle: {
    fontSize: 18,
    color: '#000',
  },
  occupantsSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  occupantsList: {
    paddingBottom: 20,
  },
  occupantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#efefef',
  },
  occupantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  occupantAvatarText: {
    color: '#fff',
    fontSize: 14,
  },
  occupantInfo: {
    flex: 1,
  },
  occupantBrandTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 5,
  },
  occupantBrandText: {
    color: '#fff',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  occupantName: {
    color: '#333',
    fontSize: 13,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupOverlay2: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width * 0.9,
    padding: 25,
  },
  popupContainer2: {
    alignItems: 'center',
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  popupHeader: {
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: "space-between",
    flexDirection: "column"
  },
  popupTitle: {
    // fontSize: 20,
    color: '#000',
    marginBottom: 10,
    textAlign: "center"
  },
  popupSubtitle: {
    // fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10
  },
  popupHighlight: {
    // fontSize: 20,
    color: '#000',
    marginVertical: 10,
  },
  popupButtons: {
    width: '100%',
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  popupButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000',
  },
  popupButtonText: {
    // fontSize: 14,
    color: '#fff',
    marginLeft: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginRight: 10,
  },
  filterButtonText: {
    // fontSize: 14,
    color: '#000',
    marginLeft: 8,
  },
  clearFilterButton: {
    padding: 10,
  },
  clearFilterText: {
    // fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
  slotOption: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slotOptionText: {
    color: '#000',
    // fontSize: 16,
  },
  buyNowText: {
    color: '#000',
  },
  quotaInfoText: {
    // fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  quotaCalculation: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  quotaCalculationText: {
    // fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  quotaButtons: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  quotaButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  continueButton: {
    backgroundColor: '#000',
  },
  skipButton: {
    backgroundColor: '#f0f0f0',
  },
  skipButtonText: {
    color: '#000',
  },
  continueButtonText: {
    color: 'white',
  },
  quotaOptionText: {
    color: 'black',
  },


  //new
  header: {
    alignItems: 'center',
    // marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  headerContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  subheader: {
    // fontSize: 15,
    textAlign: 'center',
    color: '#333',
    lineHeight: 22,
  },
  subheader2: {
    // fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    color: '#000',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // MODIFIED: Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 5, // Added for slight spacing from edge
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
    justifyContent: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  locationText: {
    marginLeft: 5,
    // fontSize: 13,
    color: '#333',
  },

  // MODIFIED & NEW: Details Grid Styles for perfect alignment
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailItem: {
    width: '48%', // Creates a two-column layout
    marginBottom: 12,
  },
  detailLabel: {
    // fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    // fontSize: 14,
    color: '#000',
  },

  // REMOVED: pinTag style (no longer needed with the new grid)

  // MODIFIED: No Results Container
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  noResultsText: {
    marginTop: 10,
    // fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  clearFilterLink: {
    marginTop: 8,
    color: '#888',
    // fontSize: 12,
  },

  // MODIFIED: Slot option styles for better clarity
  slotOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  slotOptionText: {
    // fontSize: 16,
    color: '#000',
  },
  discountText: {
    // fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  buyNowText: {
    fontSize: 18,
    color: '#000',
    letterSpacing: 1.3
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  quotaPopupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  popupTitle: {
    // fontSize: 22,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  quotaSummaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quotaSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  quotaSummaryLabel: {
    // fontSize: 14,
    color: '#6c757d',
  },
  quotaSummaryValue: {
    // fontSize: 14,
    color: '#212529',
  },
  quotaDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
  },
  quotaInfoText: {
    // fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  quotaCalculation: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quotaCalculationText: {
    // fontSize: 14,
    color: '#212529',
  },
  quotaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  quotaOptionText: {
    // fontSize: 15,
    color: '#000',
    marginLeft: 15,
  },
  quotaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  quotaButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  continueButtonText: {
    color: '#fff',
    // fontSize: 16,
    letterSpacing: 1
  },
  skipButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    marginRight: 8,
  },
  skipButtonText: {
    color: '#495057',
    letterSpacing: 1
    // fontSize: 16,
  },
  // Exit Dialog Styles
  exitDialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitDialogContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  exitDialogHeader: {
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitDialogTitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  exitDialogMessage: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  exitDialogButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  exitDialogButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitCancelButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#404040',
  },
  exitCancelButtonText: {
    color: '#fff',
    fontSize: 15,
    letterSpacing: 1,
  },
  exitConfirmButton: {
    backgroundColor: '#fff',
  },
  exitConfirmButtonText: {
    color: '#000',
    fontSize: 15,
    letterSpacing: 1,
  },
});

export default LeadDetails;

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from './AppText';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const TermsAndPrivacyModal = ({ visible, onClose }) => {
  const scaleValue = new Animated.Value(0);
  const opacityValue = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      scaleValue.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
        <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleValue }] }]}>
          <View style={styles.header}>
            <AppText weight="Inter" style={styles.title}>TERMS & PRIVACY</AppText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
            nestedScrollEnabled={true}
          >
            {/* Terms and Conditions Section */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>1. Terms and Conditions</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Introduction</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  UPVC Connect ("the App") is a digital platform for generating leads of buyers interested in UPVC windows and doors and connecting them with verified fabricators in India.
                </AppText>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Eligibility and Account</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Users must be 18+ years old</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>All registration information must be accurate</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Users are responsible for maintaining account security</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Services & Payments</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Fabricators are charged per lead or via subscription. All charges, including in-app, are transparently shared within the app</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Payments are processed via Google Play's billing system as mandated</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Usage Rules</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Leads are sold strictly for business purposes</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Reproduction, resale or unauthorized use of leads is prohibited</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>The App does not guarantee business conversions or buyer authenticity</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Prohibited Activities</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Illegal, fraudulent, or misleading activities</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Submission of false details or impersonation</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Distribution or misuse of lead data outside the App</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Disclaimer and Limitation</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  The App is an intermediary, facilitating connections without guaranteeing transactions or product quality.
                </AppText>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Termination</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  Accounts may be terminated for violations of these terms or applicable Indian law.
                </AppText>
              </View>
            </View>

            {/* Refund Policy Section */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>2. Refund Policy</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.bodyText}>
                  We do not provide any refunds, all purchases are absolute.
                </AppText>
              </View>
            </View>

            {/* Return Policy Section */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>3. Return Policy</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.bodyText}>
                  We are a service based platform, we are not eligible for a return policy.
                </AppText>
              </View>
            </View>

            {/* Shipping Policy Section */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>4. Shipping Policy</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.bodyText}>
                  We are a service based platform, we are not eligible for a shipping policy.
                </AppText>
              </View>
            </View>

            {/* Privacy Policy Section */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>5. Privacy Policy</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.bodyText}>
                  As per your discretion.
                </AppText>
              </View>
            </View>

            {/* Detailed Privacy Information */}
            <View style={styles.mainSection}>
              <AppText weight="Inter" style={styles.mainTitle}>6. Additional Privacy Information</AppText>
              
              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Legal Foundation</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  This policy adheres to the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, and Google Play Platform rules.
                </AppText>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Information Collection</AppText>
                <AppText weight="Inter" style={styles.bodyText}>Details collected:</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Name, contact information, business profile</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Inquiry and usage data</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Device/app metadata</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Consent</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Users must give explicit, informed, and freely given consent for their personal data to be processed</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Consent is sought in plain language in English or any Indian language</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Data Usage</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Personal data is processed only for the stated purpose (lead generation and business connectivity)</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>We never sell user data to third parties</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Data Sharing</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Buyer information is shared only with verified fabricators for legitimate business transactions</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Service providers/analytics partners may access non-personal data for technical or business support</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>User Rights</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Users can access, modify, or request deletion of their data by emailing suren@upvcconnect.com</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Users may withdraw consent at any time; data processing will be stopped unless required by law</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Security Practices</AppText>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>Data is stored securely using encryption standards. Regular security audits and multi-factor authentication are used for data protection</AppText>
                  </View>
                  <View style={styles.bulletItem}>
                    <Icon name="circle" size={8} color="#000" style={styles.bulletIcon} />
                    <AppText weight="Inter" style={styles.bulletText}>In case of a data breach, affected users and authorities are notified immediately</AppText>
                  </View>
                </View>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Grievance Redressal</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  Users may contact grievance officer at suren@upvcconnect.com for complaints, as required under Indian law.
                </AppText>
              </View>

              <View style={styles.subSection}>
                <AppText weight="Inter" style={styles.subTitle}>Policy Updates</AppText>
                <AppText weight="Inter" style={styles.bodyText}>
                  Changes to terms or privacy will be notified via the app or user email. Continued use implies acceptance of updates.
                </AppText>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.contactSection}>
              <AppText weight="Inter" style={styles.contactTitle}>Contact Information</AppText>
              <View style={styles.contactItem}>
                <Icon name="email" size={18} color="#000" style={styles.contactIcon} />
                <AppText weight="Inter" style={styles.contactText}>suren@upvcconnect.com</AppText>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    color: '#000',
    fontSize: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  mainSection: {
    marginBottom: 28,
  },
  mainTitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  subSection: {
    marginBottom: 18,
  },
  subTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 10,
    letterSpacing: 0.3,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 6,
    marginBottom: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 12,
    marginTop: 7,
  },
  bulletText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flex: 1,
  },
  contactSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  contactTitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 14,
    color: '#333',
  },
});
export default TermsAndPrivacyModal;



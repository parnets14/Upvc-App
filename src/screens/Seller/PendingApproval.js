import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const { width } = Dimensions.get('window');

const PendingApproval = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => animateDots());
    };
    animateDots();

    // Navigate to SellerMain when approval notification arrives (foreground)
    const unsubscribeFg = messaging().onMessage(async remoteMessage => {
      if (remoteMessage.data?.type === 'application_approval') {
        navigation.reset({ index: 0, routes: [{ name: 'SellerMain' }] });
      }
    });

    // Navigate when user taps notification (background)
    const unsubscribeBg = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage.data?.type === 'application_approval') {
        navigation.reset({ index: 0, routes: [{ name: 'SellerMain' }] });
      }
    });

    return () => {
      unsubscribeFg();
      unsubscribeBg();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>🔍</Text>
        </View>
        <Text style={styles.title}>Account Under Verification</Text>
        <Text style={styles.message}>
          Your account is currently being reviewed by our team. This usually takes up to 24 hours.
        </Text>
        <Text style={styles.subMessage}>
          Once approved, you'll receive a notification and get full access to leads, purchases, and more.
        </Text>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Pending Review</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 32, width: width - 48, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconText: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E', textAlign: 'center', marginBottom: 16 },
  message: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, marginBottom: 12 },
  subMessage: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F39C12' },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3CD', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#F39C12' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F39C12', marginRight: 8 },
  statusText: { fontSize: 14, fontWeight: '600', color: '#E67E22' },
});

export default PendingApproval;

// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import Animated, { FadeInLeft } from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const TrendTeaser = ({ title, insight, recommendation, onPress }) => {
//   return (
//     <Animated.View entering={FadeInLeft}>
//       <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
//         <LinearGradient
//           colors={['#FEF9E7', '#FDEBD0']}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 1 }}
//           style={styles.card}
//         >
//           <View style={styles.cardHeader}>
//             <Icon name="trending-up" size={24} color="#E67E22" />
//             <Text style={styles.cardTitle}>{title}</Text>
//           </View>
//           <Text style={styles.insight}>
//             "{insight}"
//           </Text>
//           <Text style={styles.recommendation}>
//             {recommendation}
//           </Text>
//           <View style={styles.ctaContainer}>
//             <Text style={styles.ctaText}>Explore Trends</Text>
//             <Icon name="arrow-forward" size={20} color="#E67E22" />
//           </View>
//         </LinearGradient>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 16,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#FAD7A0',
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   cardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#E67E22',
//     marginLeft: 8,
//   },
//   insight: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2C3E50',
//     marginBottom: 8,
//     fontStyle: 'italic',
//   },
//   recommendation: {
//     fontSize: 14,
//     color: '#566573',
//     marginBottom: 16,
//   },
//   ctaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'flex-end',
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(230,126,34,0.2)',
//     paddingTop: 12,
//   },
//   ctaText: {
//     color: '#E67E22',
//     fontWeight: '600',
//     marginRight: 8,
//   },
// });

// export default TrendTeaser;







import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TrendTeaser = ({ title, insight, recommendation, onPress }) => {
  const slideAnim = useRef(new Animated.Value(-50)).current; // Start from left
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View 
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }]
      }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#FEF9E7', '#FDEBD0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Icon name="trending-up" size={24} color="#E67E22" />
            <Text style={styles.cardTitle}>{title}</Text>
          </View>
          <Text style={styles.insight}>
            "{insight}"
          </Text>
          <Text style={styles.recommendation}>
            {recommendation}
          </Text>
          <View style={styles.ctaContainer}>
            <Text style={styles.ctaText}>Explore Trends</Text>
            <Icon name="arrow-forward" size={20} color="#E67E22" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FAD7A0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E67E22',
    marginLeft: 8,
  },
  insight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  recommendation: {
    fontSize: 14,
    color: '#566573',
    marginBottom: 16,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(230,126,34,0.2)',
    paddingTop: 12,
  },
  ctaText: {
    color: '#E67E22',
    fontWeight: '600',
    marginRight: 8,
  },
});

export default TrendTeaser;
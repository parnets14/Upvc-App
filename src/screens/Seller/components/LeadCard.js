// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import Animated, { FadeInRight } from 'react-native-reanimated';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// const LeadCard = ({ name, location, requirement, time, amount, onPress }) => {
//   return (
//     <Animated.View entering={FadeInRight}>
//       <TouchableOpacity 
//         style={styles.card}
//         onPress={onPress}
//         activeOpacity={0.9}
//       >
//         <View style={styles.cardHeader}>
//           <View style={styles.avatar}>
//             <Icon name="person" size={24} color="#2E86C1" />
//           </View>
//           <View style={styles.headerText}>
//             <Text style={styles.name}>{name}</Text>
//             <Text style={styles.location}>
//               <Icon name="location-on" size={14} color="#95A5A6" /> {location}
//             </Text>
//           </View>
//           <Text style={styles.time}>{time}</Text>
//         </View>
        
//         <Text style={styles.requirement}>{requirement}</Text>
        
//         <View style={styles.cardFooter}>
//           <Text style={styles.amount}>{amount}</Text>
//           <Icon name="chevron-right" size={24} color="#D5D8DC" />
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#EAEDED',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#EBF5FB',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   headerText: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2C3E50',
//   },
//   location: {
//     fontSize: 12,
//     color: '#95A5A6',
//     marginTop: 2,
//   },
//   time: {
//     fontSize: 12,
//     color: '#95A5A6',
//   },
//   requirement: {
//     fontSize: 14,
//     color: '#566573',
//     marginBottom: 16,
//     lineHeight: 20,
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderTopWidth: 1,
//     borderTopColor: '#EAEDED',
//     paddingTop: 12,
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#28B463',
//   },
// });

// export default LeadCard;





import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const LeadCard = ({ name, location, requirement, time, amount, onPress }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
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
      <TouchableOpacity 
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Icon name="person" size={24}  />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.location}>
              <Icon name="location-on" size={14}  /> {location}
            </Text>
          </View>
          <Text style={styles.time}>{time}</Text>
        </View>
        
        <Text style={styles.requirement}>{requirement}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.amount}>{amount}</Text>
          <Icon name="chevron-right" size={24} color="#D5D8DC" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEDED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  location: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#95A5A6',
  },
  requirement: {
    fontSize: 14,
    color: '#566573',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EAEDED',
    paddingTop: 12,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    // color: '#28B463',
  },
});

export default LeadCard;
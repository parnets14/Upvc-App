import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppText from '../../../components/AppText';
const TopTabBar = () => {
  const navigation = useNavigation()
  const tabs = [
    { label: 'PRICES', screen: 'PricesScreen' },
    { label: 'BUY NOW', screen: 'BuyNowScreen' },
    { label: 'WHITE vs COLORS', screen: 'WhiteVsColorsScreen' },
    { label: 'INSIGHTS', screen: 'ProcessScreen' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScrollContainer}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.tabButton}
          onPress={() => navigation.navigate(tab.screen)}
        >
          <AppText weight="SemiBold" style={styles.tabText}>{tab.label}</AppText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabScrollContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    height: 30,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'black',
  },
  tabText: {
    fontSize: 12,
    color: 'black',
    letterSpacing: 1,
  },
});

export default TopTabBar;

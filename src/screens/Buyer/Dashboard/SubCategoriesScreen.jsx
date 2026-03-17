import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import axios from 'axios';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppText from '../../../components/AppText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubCategoriesScreen = ({navigation, route}) => {
  const {category} = route.params;
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Subcategories are already in the category object
    console.log('Category object:', category);
    console.log('Subcategories from category:', category.subcategories);
    
    if (category.subcategories && Array.isArray(category.subcategories)) {
      setSubCategories(category.subcategories);
    } else {
      // Fallback: fetch from API if not included
      fetchSubCategories();
    }
  }, []);

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://upvcconnect.com/api/subcategories/category/${category._id}`
      );
      console.log('Full API response:', JSON.stringify(response, null, 2));
      console.log('Response data:', response?.data);
      
      // Handle different response structures
      const data = response?.data?.data || response?.data || [];
      console.log('Processed subcategories:', data);
      setSubCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (category.subcategories && Array.isArray(category.subcategories)) {
      setSubCategories(category.subcategories);
      setRefreshing(false);
    } else {
      fetchSubCategories();
    }
  };

  const handleSubCategoryPress = async (subCategory) => {
    console.log('Subcategory pressed:', subCategory);
    
    const token = await AsyncStorage.getItem('buyerToken');
    console.log('Token:', token ? 'exists' : 'not found');

    if (!token) {
      // Navigate to login or show login modal
      console.log('No token, navigating to login');
      navigation.getParent()?.navigate('LoginScreen');
      return;
    }

    // Navigate to products/buy now screen with selected category and subcategory
    console.log('Navigating to BuyNowScreen with:', {
      selectedCategory: category,
      selectedSubCategory: subCategory,
    });
    
    navigation.getParent()?.navigate('BuyNowScreen', {
      selectedCategory: category,
      selectedSubCategory: subCategory,
    });
  };

  const renderSubCategory = ({item}) => {
    console.log('Rendering subcategory item:', JSON.stringify(item, null, 2));
    console.log('Item name:', item?.name);
    console.log('Item keys:', Object.keys(item || {}));
    
    return (
      <TouchableOpacity
        style={styles.subCategoryCard}
        onPress={() => handleSubCategoryPress(item)}>
        <View style={styles.subCategoryContent}>
          <View style={styles.subCategoryInfo}>
            <Text style={styles.subCategoryName}>
              {item?.name || item?.title || 'Unnamed Subcategory'}
            </Text>
            {item?.description && (
              <Text style={styles.subCategoryDescription}>
                {item.description}
              </Text>
            )}
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: '#f5f5f5'}}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
          />
          <AppText weight="Inter" style={styles.headerTitle}>
            {category.name}
          </AppText>
        </View>
      </View>

      {subCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AppText weight="Inter" style={styles.emptyText}>
            No subcategories available for this category
          </AppText>
        </View>
      ) : (
        <FlatList
          data={subCategories}
          renderItem={renderSubCategory}
          keyExtractor={(item, index) => item._id || `subcategory-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#000000']}
              tintColor={'#000000'}
            />
          }
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
  },
  listContainer: {
    padding: 15,
  },
  subCategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subCategoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subCategoryInfo: {
    flex: 1,
    marginRight: 10,
  },
  subCategoryName: {
    fontSize: 18,
    color: '#000',
    marginBottom: 5,
    fontWeight: '600',
  },
  subCategoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
export default SubCategoriesScreen;

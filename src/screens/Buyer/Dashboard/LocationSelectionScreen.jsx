import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import AppText from '../../../components/AppText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOOGLE_MAPS_API_KEY = "abcd"; 

const LocationSelectionScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}&language=en&components=country:in`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        setSuggestions(data.predictions);
      } else {
        setSuggestions([]);
        console.warn("Places API error:", data.status);
        alert("Failed to fetch suggestions. Please check your API key.");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      alert("Network error. Please check your internet connection.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSelectPlace = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,geometry&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        const { formatted_address: address, geometry } = data.result;
        const lat = geometry.location.lat;
        const lng = geometry.location.lng;

        console.log({ address, lat, lng });
        navigation.goBack();
      } else {
        console.warn("Place details error:", data.status);
        alert("Failed to retrieve location details.");
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            console.log({ address, latitude, longitude });
            navigation.goBack();
          } else {
            console.warn("No geocoding results found");
            alert("Failed to get address from coordinates");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          alert("Failed to get address from coordinates");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get current location. Please enable location services.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectPlace(item.place_id)}
    >
      <AppText weight='Inter' style={styles.suggestionText}>{item.description}</AppText>
    </TouchableOpacity>
  );

  
  return (
    <View style={{paddingTop: insets.top, flex: 1, backgroundColor: 'white'}}>

    <View style={styles.container}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
              <Image
                          source={require('../../../assets/logo.png')}
                          style={styles.logo}
                        /> 
        <View style={{ width: 24 }} />  
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your address"
            placeholderTextColor="#A0A0A0"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {isFetching && (
            <ActivityIndicator style={styles.loadingIndicator} color="#000000" />
          )}
          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.place_id}
              style={styles.suggestionList}
            />
          )}
          {suggestions.length === 0 && searchQuery.length >= 3 && !isFetching && (
            <View style={styles.emptyList}>
              <AppText weight="Inter" style={styles.emptyText}>No results found</AppText>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Icon name="my-location" size={20} color="#000000" />
              <AppText weight='Inter' style={styles.currentLocationText}>Use Current Location</AppText>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
  },
  logo: {
    // marginTop:15,
    // alignSelf:"center",
    width: 100, 
    height: 50,  
    // resizeMode: 'contain', 
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingIndicator: {
    marginTop: 10,
  },
  suggestionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    elevation: 3,
  },
  suggestionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#000000',
  },
  emptyList: {
    padding: 15,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationText: {
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 16,
    color: '#000000',
  },
});

export default LocationSelectionScreen;
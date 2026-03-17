import React, {useState, useEffect} from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppText from '../../../components/AppText';
import DropDownPicker from 'react-native-dropdown-picker';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const EditQuoteModal = ({visible, onClose, quote, onUpdate, isLoading}) => {
  const [formData, setFormData] = useState({
    color: '',
    height: '',
    width: '',
    quantity: '',
    installationLocation: '',
    remark: '',
  });

  const [colorOpen, setColorOpen] = useState(false);
  const [colorItems, setColorItems] = useState([
    {label: 'White', value: 'white'},
    {label: 'Black', value: 'black'},
    {label: 'Wooden Brown', value: 'brown'},
    {label: 'Silver Grey', value: 'grey'},
    {label: 'Golden Oak', value: 'golden'},
  ]);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationItems, setLocationItems] = useState([
    {label: 'Balcony', value: 'balcony'},
    {label: 'Living Room', value: 'living_room'},
    {label: 'Bedroom', value: 'bedroom'},
    {label: 'Kitchen', value: 'kitchen'},
    {label: 'Bathroom', value: 'bathroom'},
  ]);

  useEffect(() => {
    if (quote) {
      setFormData({
        color: quote.color || '',
        height: quote.height?.toString() || '',
        width: quote.width?.toString() || '',
        quantity: quote.quantity?.toString() || '',
        installationLocation: quote.installationLocation || '',
        remark: quote.remark || '',
      });
    }
  }, [quote]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = () => {
    const updatedQuote = {
      ...quote,
      ...formData,
      height: parseFloat(formData.height),
      width: parseFloat(formData.width),
      quantity: parseInt(formData.quantity, 10),
      sqft:
        parseFloat(formData.height) *
        parseFloat(formData.width) *
        parseInt(formData.quantity, 10),
    };
    onUpdate(updatedQuote);
  };

  if (!quote) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <AppText weight="SemiBold" style={styles.modalTitle}>
              Edit Quote
            </AppText>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Icon name="close" size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            contentContainerStyle={styles.scrollContent}>
            {/* Color */}
            <View style={[styles.field, {zIndex: 3000}]}>
              <AppText weight="Inter" style={styles.label}>
                COLOR
              </AppText>
              <DropDownPicker
                open={colorOpen}
                value={formData.color}
                items={colorItems}
                setOpen={setColorOpen}
                setValue={cb =>
                  handleInputChange('color', cb(formData.color))
                }
                setItems={setColorItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Select a color"
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            {/* Height & Width */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <AppText weight="Inter" style={styles.label}>
                  Height (ft)
                </AppText>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.height}
                  onChangeText={t => handleInputChange('height', t)}
                />
              </View>
              <View style={styles.halfField}>
                <AppText weight="Inter" style={styles.label}>
                  Width (ft)
                </AppText>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formData.width}
                  onChangeText={t => handleInputChange('width', t)}
                />
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.field}>
              <AppText weight="Inter" style={styles.label}>
                Quantity
              </AppText>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.quantity}
                onChangeText={t => handleInputChange('quantity', t)}
              />
            </View>

            {/* Location */}
            <View style={[styles.field, {zIndex: 2000}]}>
              <AppText weight="Inter" style={styles.label}>
                WHERE
              </AppText>
              <DropDownPicker
                open={locationOpen}
                value={formData.installationLocation}
                items={locationItems}
                setOpen={setLocationOpen}
                setValue={cb =>
                  handleInputChange(
                    'installationLocation',
                    cb(formData.installationLocation),
                  )
                }
                setItems={setLocationItems}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                placeholder="Select location"
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            {/* Remarks */}
            <View style={styles.field}>
              <AppText weight="Inter" style={styles.label}>
                Remarks
              </AppText>
              <TextInput
                style={[styles.input, styles.remarksInput]}
                multiline
                value={formData.remark}
                onChangeText={t => handleInputChange('remark', t)}
              />
            </View>
          </ScrollView>

          {/* UPDATE always pinned at bottom */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleSubmit}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText weight="SemiBold" style={styles.updateButtonText}>
                UPDATE
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 8,
  },
  field: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  halfField: {
    width: '48%',
  },
  label: {
    fontSize: 12,
    color: '#555',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  remarksInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    minHeight: 44,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 8,
  },
  updateButton: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default EditQuoteModal;

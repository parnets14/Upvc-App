import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { colors, fonts, spacing } from '../../theme';
// import Icon from 'react-native-vector-icons/MaterialIcons';

const SelectDropdown = ({ label, options, onSelect, style }) => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('');

  const handleSelect = (item) => {
    setSelected(item);
    onSelect(item);
    setVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.buttonText, !selected && styles.placeholder]}>
          {selected || `Select ${label}`}
        </Text>
        {/* <Icon name="arrow-drop-down" size={24} color={colors.text} /> */}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {selected === item && (
                    <Text name="check" size={20} color={colors.primary} ></Text>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.separator} />
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  label: {
    ...fonts.label,
    color: colors.text,
  },
  dropdownButton: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    marginTop: spacing.small,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    ...fonts.body,
    color: colors.text,
  },
  placeholder: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.large,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 8,
    maxHeight: '60%',
  },
  optionItem: {
    padding: spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    ...fonts.body,
    color: colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.medium,
  },
});

export default SelectDropdown;
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const ProductSelectionChip = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected
          ? { backgroundColor: '#D6EAF8', borderColor: '#2E86C1' }
          : { borderColor: '#D5D8DC' },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.chipText,
          selected ? { color: '#2E86C1' } : { color: '#566573' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
  },
});

export default ProductSelectionChip;
import React, { forwardRef } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { sellerStyles } from '../../styles/sellerStyles';

const OTPInput = forwardRef((props, ref) => {
  return (
    <TextInput
      ref={ref}
      style={sellerStyles.otpInput}
      maxLength={1}
      keyboardType="number-pad"
      {...props}
    />
  );
});

export default OTPInput;
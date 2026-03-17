// import React from 'react';
// import { Text } from 'react-native';

// // Define your font mapping here
// const fontMap = {
//   Regular: 'Poppins-Regular',
//   Bold: 'Poppins-Bold',
//   Light: 'Poppins-Light',
//   Medium: 'Poppins-Medium',
//   SemiBold: 'Poppins-SemiBold',
//   Inter: 'Inter_18pt-Regular', 
// };

// // Helper to detect if child is icon
// const isIcon = (child) => {
//   return (
//     typeof child !== 'string' &&
//     typeof child !== 'number' &&
//     child?.type?.displayName?.toLowerCase().includes('icon')
//   );
// };

// const AppText = ({ children, style, weight = 'Regular', ...rest }) => {
//   // If the children is an icon or something non-text, avoid applying fontFamily
//   if (isIcon(children)) {
//     return (
//       <Text style={style} {...rest}>
//         {children}
//       </Text>
//     );
//   }

//   return (
//     <Text style={[{ fontFamily: fontMap[weight] || fontMap.Regular, fontSize: 20 }, style]} {...rest}>
//       {children}
//     </Text>
//   );
// };

// export default AppText;
// import React from 'react';
// import { Text } from 'react-native';

// // Font mapping
// const fontMap = {
//   Regular: 'Poppins-Regular',
//   Bold: 'Poppins-Bold',
//   Light: 'Poppins-Light',
//   Medium: 'Poppins-Medium',
//   SemiBold: 'Poppins-SemiBold',
//   Inter: 'Inter_18pt-Regular',
// };

// const AppText = ({ children, style, weight = 'Regular', ...rest }) => {
//   const isTextChild = typeof children === 'string' || typeof children === 'number';

//   return (
//     <Text
//       style={[
//         isTextChild ? { fontFamily: fontMap[weight] || fontMap.Regular, fontSize: 20, color: '#000' } : null,
//         style,
//       ]}
//       {...rest}
//     >
//       {children}
//     </Text>
//   );
// };

// export default AppText;import React from 'react';import React from 'react';
import { Text } from 'react-native';

const fontMap = {
  Regular: 'Poppins-Regular',
  Bold: 'Poppins-Bold',
  Light: 'Poppins-Light',
  Medium: 'Poppins-Medium',
  SemiBold: 'Poppins-SemiBold',
  Inter: 'Inter_18pt-Regular',
};

const AppText = ({ children, style, weight = 'Regular', ...rest }) => {
  const isPlainText =
    (typeof children === 'string' || typeof children === 'number') ||
    (Array.isArray(children) &&
      children.every(
        child => typeof child === 'string' || typeof child === 'number'
      ));

  return (
    <Text
      style={[
        isPlainText ? { fontFamily: fontMap[weight] || fontMap.Regular } : {},
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

export default AppText;

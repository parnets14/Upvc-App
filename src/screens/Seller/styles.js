import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle1: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: 'black',
    marginBottom: 30,
    textAlign: 'center',
  },
  otpContainer: {
    marginBottom: 20,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    height: 50,
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5, 
  },
  pinCodeText: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    includeFontPadding: false,
  },
  focusStick: {
    backgroundColor: 'black',
    width: 2,
  },
  activePinCodeContainer: {
    borderColor: 'black',
    borderWidth: 2,
  },
  filledPinCodeContainer: {
    borderColor: 'black',
  }, 
  button: {
    backgroundColor: 'black',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
    resendButton: {
    backgroundColor: 'black',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: 'gray',
    opacity: 0.6,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: 'black',
  },
  contentBlurred: {
    opacity: 0.5,
  },
  contentNormal: {
    opacity: 1,
  },
});
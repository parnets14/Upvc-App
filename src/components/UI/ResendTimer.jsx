import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from '../AppText';

const ResendTimer = ({ duration = 30, canResend, onTimeout }) => {
  const [timer, setTimer] = useState(duration);

  useEffect(() => {
    let interval;

    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      onTimeout(); // let parent know resend is now allowed
    }

    return () => clearInterval(interval);
  }, [timer, canResend]);

  // reset timer when parent restarts countdown
  useEffect(() => {
    if (!canResend) {
      setTimer(duration);
    }
  }, [canResend, duration]);

  return (
    <View style={styles.container}>
      {canResend ? (
        <AppText weight="Inter" style={styles.timerText}>
          Didn't receive code?
        </AppText>
      ) : (
        <AppText weight="Inter" style={styles.timerText}>
          Resend code in {timer}s
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  timerText: {
    color: 'black',
    fontSize: 14,
  },
});

export default ResendTimer;

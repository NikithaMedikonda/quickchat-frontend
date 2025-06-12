/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet, Animated, Easing} from 'react-native'; // Import Easing

export const MessageSyncLoader = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pingProgressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(pingProgressAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  }, [pingProgressAnim]);


  const createPingOpacity = (index: number, count: number) => {
    const start = index / count;
    const end = start + (1 / count);

    return pingProgressAnim.interpolate({
        inputRange: [start, end],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });
  };

  const pingOpcities = [
      createPingOpacity(0, 3),
      createPingOpacity(1, 3),
      createPingOpacity(2, 3),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.iconsContainer}>
        <View style={styles.device}>
          <View style={styles.deviceDot} />
          <View style={styles.deviceLines}>
            <View style={styles.line} />
            <View style={[styles.line, {width: 20}]} />
            <View style={styles.line} />
          </View>
        </View>

        <View style={styles.syncContainer}>
          <View style={styles.dotRow}>
            {pingOpcities.map((opacity, idx) => (
              <Animated.View
                key={idx}
                style={[styles.syncDot, {opacity}]}
              />
            ))}
          </View>
          <Text style={styles.syncText}>••••</Text>
          <View style={styles.dotRow}>
             {pingOpcities.map((opacity, idx) => (
              <Animated.View
                key={idx + 3}
                style={[styles.syncDot, {opacity}]}
              />
            ))}
          </View>
        </View>

        <View style={styles.device}>
          <Animated.View
            style={[styles.deviceDot, {transform: [{scale: pulseAnim}]}]}
          />
          <View style={styles.deviceLines}>
            <Animated.View
              style={[styles.serverLine, {transform: [{scale: pulseAnim}]}]}
            />
            <Animated.View
              style={[
                styles.serverLine,
                {width: 20, transform: [{scale: pulseAnim}]},
              ]}
            />
            <Animated.View
              style={[styles.serverLine, {transform: [{scale: pulseAnim}]}]}
            />
          </View>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Syncing Contacts</Text>
        <Text style={styles.subtitle}>
          Please wait while your contacts are being synced.
        </Text>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  device: {
    width: 60,
    height: 90,
    backgroundColor: '#2d2d2d',
    borderRadius: 8,
    borderColor: '#3b82f6',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  deviceDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginBottom: 4,
  },
  deviceLines: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 30,
  },
  line: {
    width: 30,
    height: 2,
    backgroundColor: '#4b5563',
    borderRadius: 1,
  },
  serverLine: {
    width: 30,
    height: 2,
    backgroundColor: '#3b82f6',
    borderRadius: 1,
  },
  syncContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  dotRow: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  syncDot: {
    width: 6,
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    marginHorizontal: 2,
  },
  syncText: {
    color: '#3b82f6',
    fontSize: 12,
    marginVertical: 2,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
  },
});


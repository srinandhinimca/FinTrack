import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

export default function Transactions() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Transaction History
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#292a37',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
  },
});
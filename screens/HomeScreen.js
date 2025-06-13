import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { useUser } from '../services/UserContext';

export default function HomeScreen({ navigation }) {
  const { user } = useUser();
  return (
    <View style={styles.container}>
      <Text>Welcome, {user?.username || 'Guest'}!</Text>
      <Button title="SUPERVISOR DASHBOARD" onPress={() => navigation.navigate('Dashboard')} />
      <Button title="CHECK IN" onPress={() => navigation.navigate('CheckIn')} />
      <Button title="CHECK OUT" onPress={() => navigation.navigate('Dashboard')} />
        <Button title="SPECIAL CHECK IN" onPress={() => navigation.navigate('Dashboard')} />
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 50 },
});

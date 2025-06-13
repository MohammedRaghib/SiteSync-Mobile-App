import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { login } from '../services/auth';
import { useUser } from '../services/UserContext';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useUser(); 

  const handleLogin = async () => {
    setUser({ username: username, password: password, });
    const success = await login(username, password);
    if (success) onLoginSuccess();
    else alert('Invalid credentials');
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
});

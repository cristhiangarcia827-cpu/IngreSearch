
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import SectionTitle from '../components/SectionTitle';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { isEmailValid, isPhoneValid, isRequired } from '../utils/validation';

export default function ProfileScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const submit = () => {
    const valid =
      isEmailValid(email) &&
      isRequired(password) &&
      isPhoneValid(phone);

    if (!valid) {
      Alert.alert('Datos inválidos', 'Por favor verifica tu email, contraseña y teléfono.');
      return;
    }
    Alert.alert('Perfil guardado', 'Tus datos se han validado correctamente.');
  };

  return (
    <View style={styles.container}>
      <SectionTitle text="Perfil" color="#0066cc" />
      <CustomInput label="Email" placeholder="nombre@dominio.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <CustomInput label="Contraseña" placeholder="********" value={password} onChangeText={setPassword} secureTextEntry required />
      <CustomInput label="Teléfono" placeholder="9999-9999" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <CustomButton text="Guardar" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'flex-start', alignItems: 'stretch' }
});
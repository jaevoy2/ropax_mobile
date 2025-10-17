import { UserLogin } from '@/api/userLogin';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');
const logo_icon = require('@/assets/images/logo_icon.png');
const logo_text = require('@/assets/images/logo.png');
const redWave = require('@/assets/images/red_wave.png');
const yellowWave = require('@/assets/images/yellow_wave.png');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [isPasswordVissible, setPasswordVissible] = useState(false);
    const [loginSpinner, setLoginSpinner] = useState(false);

    const handleLogin = async () => {
        setLoginSpinner(true);
        console.log(email, password);

        if(!email.trim() || !password.trim()) {
            setLoginSpinner(false);
            Alert.alert('Invalid', 'Email and password are reqiuired.');
            return;
        }

        try {
            const response = await UserLogin(email, password);
            if(!response.error) {
                AsyncStorage.setItem('email', email);
                router.replace('/(tabs)/manual-booking');
            }
        }catch(error: any) {
            Alert.alert('Login Failed', error.message);
        }finally{
            setLoginSpinner(false);
        }

    }

    return (
        <View style={{ height: height + 20, position: 'relative', backgroundColor: '#fff' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, left: 10 }} onPress={() => router.back()}>
                <Ionicons name={'chevron-back'} size={35} color={'#cf2a3a'} />
            </TouchableOpacity>
            <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent />
            <View style={{ justifyContent: 'center', height: height, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 60, gap: 10, marginTop: -120 }}>
                    <Image source={logo_icon} style={{ width: 50, height: 49 }} />
                    <Image source={logo_text} style={{ height: 25, width: 105 }} />
                </View>
                <View>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>Email</Text>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                        style={[styles.input, emailFocused && styles.inputFocused, { color: '#000' }]}
                    />
                </View>
                <View>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>Password</Text>
                    <View style={[styles.passwordInput, passwordFocused && styles.inputFocused]}>
                        <TextInput
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                            secureTextEntry={!isPasswordVissible}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            style={{ width: '90%', color: '#000' }}
                        />
                        <TouchableOpacity onPress={() => setPasswordVissible(!isPasswordVissible)} style={{ paddingRight: 10 }}>
                            {isPasswordVissible == true ? (
                            <Ionicons name="lock-open" color={'#cf2a3a'} size={20} />
                            ) : (
                            <Ionicons name="lock-closed" color={'#6C6C6C'} size={20} />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity disabled={loginSpinner} onPress={() => handleLogin()} style={[{backgroundColor: loginSpinner == true ? '#eb606eff' : '#cf2a3a'}, styles.button]} >
                    {loginSpinner == true ? (
                    <ActivityIndicator size={'small'} color={'#FFC107'} style={{ alignSelf: 'center' }} />
                    ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>
            <View>
                <Image source={redWave} style={{ height: 100, width: width, position: 'absolute', bottom: -40, zIndex: 2  }} /> 
                <Image source={yellowWave} style={{ height: 100, width: width + 50, position: 'absolute', bottom: -40, right: -50, zIndex: 1 }} /> 
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    input: {
        backgroundColor: '#D8DADF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 5,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    inputFocused: {
        borderColor: '#FFC107',
        borderWidth: 2,
    },
    passwordInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D8DADF',
        paddingHorizontal: 5,
        borderRadius: 5,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    button: {
        paddingHorizontal: 5,
        paddingVertical: 13,
        borderRadius: 5,
        alignItems: 'center',
    },
})
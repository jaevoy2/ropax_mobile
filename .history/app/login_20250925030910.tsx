import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');
const logo_icon = require('@/assets/images/logo_icon.png');
const logo_text = require('@/assets/images/logo.png');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [isPasswordVissible, setPasswordVissible] = useState(false);
    const [loginSpinner, setLoginSpinner] = useState(false);

    return (
        <View style={{ height }}>
            <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent />
            <View style={{ justifyContent: 'center', height: height, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 60, gap: 10 }}>
                    <Image source={logo_icon} style={{ width: 40, height: 40 }} />
                    <Image source={logo_text} style={{ height: 25, width: 120 }} />
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
                <TouchableOpacity disabled={loginSpinner} style={[{backgroundColor: loginSpinner == true ? '#eb606eff' : '#cf2a3a'}, styles.button]} >
                    {loginSpinner == true ? (
                    <ActivityIndicator size={'small'} color={'#FFC107'} style={{ alignSelf: 'center' }} />
                    ) : (
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
                    )}
                </TouchableOpacity>
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
        borderColor: '#f1f1f1'
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
        borderColor: '#f1f1f1'
    },
    button: {
        paddingHorizontal: 5,
        paddingVertical: 13,
        borderRadius: 5,
        alignItems: 'center',
    },
})
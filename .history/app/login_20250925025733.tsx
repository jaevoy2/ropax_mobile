import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [isPasswordVissible, setPasswordVissible] = useState(false);

    return (
        <View style={{ height }}>
            <StatusBar barStyle={'dark-content'} backgroundColor={'transparent'} translucent />
            <View style={{ justifyContent: 'center', height: height, paddingHorizontal: 20 }}>
                <View>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>Email</Text>
                    <TextInput
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        // onFocus={() => setEmailFocused(true)}
                        // onBlur={() => setEmailFocused(false)}
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
        borderColor: '#f1c40f',
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
})
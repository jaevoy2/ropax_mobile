import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('window');
const defaultImg = require('@/assets/images/default.jpg')

export default function GenSettings() {
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);

        await AsyncStorage.clear();
        setTimeout(() => {
            setLoading(false);
            router.replace('/');
        }, 800);

    }

    return (
        <View>
            <Modal visible={modal} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 6, width: width - 40, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'space-between', padding: 15 }}>
                        <Text style={{ fontSize: 16, marginTop: 25 }}>Are you sure you want to logout?</Text>
                        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: 20, gap: 10 }}>
                            <TouchableOpacity onPress={() => setModal(false)}>
                                    <Text>Cancel</Text>
                                </TouchableOpacity>
                            {loading ? (
                                <ActivityIndicator size="small" color="#cf2a3a" style={{ marginRight: 10 }} />
                            ) : (
                                <TouchableOpacity onPress={handleLogout} disabled={loading}>
                                    <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Logout</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Settings</Text>
                <TouchableOpacity onPress={() => setModal(true)}>
                    < Ionicons name="log-out-outline" size={30} color={'#fff'} />
                </TouchableOpacity>
            </View>
            <View style={{ padding: 10 }}>
                <View style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Image source={defaultImg} style={{ borderRadius: 60, height: 40, width: 40 }} />
                        <View>
                            <Text style={{ fontWeight: '900', fontSize: 16, color: '#cf2a3a' }}>Dedal Boyet</Text>
                            <Text style={{ fontSize: 11, color: '#BEC4CE' }}>Ticketing Staff</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 13, color: '#BEC4CE' }}>Station</Text>
                        <Text style={{ fontSize: 15, color: '#cf2a3a' }}>Hilongos Port</Text>
                    </View>
                </View>
                <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="store" size={35} color={'#cf2a3a'} />
                        <View>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#cf2a3a' }}>Station</Text>
                            <Text style={{ fontSize: 12, color: '#666' }}>Select ticketing station</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} />
                </TouchableOpacity>
            </View>
        </View>
    )
} 
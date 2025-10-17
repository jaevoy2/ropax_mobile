import { FetchStation } from "@/api/station";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('window');
const defaultImg = require('@/assets/images/default.jpg');

type UserProp = {
    id: number;
    name: string;
    image: string;
    station: string;
}

type StationProps = {
    id: number;
    name: string;
}

export default function GenSettings() {
    const [modal, setModal] = useState(false);
    const [stationModal, setStationModal] = useState(false);
    const [stationOptions, setStationOptions] = useState<StationProps[] | null>(null);
    const [stationSpinner, setStationSpinner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<UserProp | null>(null);

    useEffect(() => {
        const loadUserData = async () => {
            const userID = await AsyncStorage.getItem('userID');
            const userName = await AsyncStorage.getItem('name');
            const userImage = await AsyncStorage?.getItem('image');
            const userStation = await AsyncStorage?.getItem('station');

            const userData: UserProp = {
                id: Number(userID) || 0,
                name: userName ?? '',
                image: userImage ?? '',
                station: userStation ?? ''
            }

            setUser(userData);
        }

        loadUserData()
    }, []);

    const fetchStations = async () => {
        setStationModal(true);
        setStationSpinner(true);

        try {
            const response = await FetchStation();

            if(response) {
                const stations: StationProps[] = response.stations.map((station: any) => ({
                    id: station.id,
                    name: station.name
                }))

                setStationOptions(stations);
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setStationSpinner(false);
        }
        
    }

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

            {/* station modal */}
            <Modal visible={stationModal} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: 'auto', width: width - 40, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'space-between', padding: 15 }}>
                        {stationSpinner ? (
                            <View style={{ justifyContent: 'center' }}>
                                <ActivityIndicator size={'small'} color={'#cf2a3a'} />
                            </View>
                        ) : (
                            <>
                                <Text style={{ fontSize: 16, fontWeight:'bold', paddingBottom: 5 }}>Select Station</Text>
                                <View style={{ flexDirection: 'column', gap: 15, marginTop: 10 }}>
                                    {stationOptions?.map((option) => (
                                        <TouchableOpacity key={option.id} style={{ padding: 8, borderWidth: 1, borderColor: '#cf2a3a', borderRadius: 5, backgroundColor: '#cf2a3b50' }}>
                                            <Text style={{ fontWeight: 'bold', color: '#cf2a3a' }}>{option.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 20 }}>
                                    <Text style={{ fontWeight: 'bold' }}>Save</Text>
                                </TouchableOpacity>
                            </>
                        )}
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
                <View style={{ paddingHorizontal: 15, paddingVertical: 25, backgroundColor: '#fff', borderRadius: 10, marginTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        {user?.image ? (
                            <Image source={{ uri: user.image }} style={{ borderRadius: 60, height: 50, width: 50 }} />
                        ) : (
                            <Image source={defaultImg} style={{ borderRadius: 60, height: 50, width: 50 }} />
                        )}
                        <View>
                            <Text style={{ fontWeight: '900', fontSize: 18, color: '#cf2a3a' }}>{user?.name}</Text>
                            <Text style={{ fontSize: 10, color: '#A4ABBA' }}>Ticketing Staff</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end', marginTop: 10 }}>
                        <Text style={{ fontSize: 10, color: '#A4ABBA' }}>Station</Text>
                        {user?.station ? (
                            <Text style={{ fontSize: 12, color: '#cf2a3a' }}>{user?.station}</Text>
                        ) : (
                            <Text style={{ fontSize: 12, color: '#A4ABBA' }}>No station selected yet</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity onPress={fetchStations} style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
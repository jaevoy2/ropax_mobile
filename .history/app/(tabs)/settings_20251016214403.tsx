import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const { height, width } = Dimensions.get('window');

export default function GenSettings() {
    const [modal, setModal] = useState(false);
    const [loading, setLoading] = useState(false);


    return (
        <View>
            <Modal visible={modal} transparent animationType="fade">
                <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ height: height / 6, width: width - 40, backgroundColor: '#fff', borderRadius: 10, justifyContent :'center', padding: 15 }}>
                        <Text style={{ fontSize: 16 }}>Are you sure you want to logout?</Text>
                        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', marginTop: 20, gap: 10 }}>
                            <TouchableOpacity>
                                <Text style={{ color: '#cf2a3a', fontWeight: 'bold' }}>Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
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
                <TouchableOpacity style={{ paddingHorizontal: 15, paddingVertical: 20, backgroundColor: '#fff', borderRadius: 10, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="office-building" size={30} color={'#cf2a3a'} />
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
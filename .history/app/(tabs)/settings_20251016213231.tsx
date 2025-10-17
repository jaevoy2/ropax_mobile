import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function GenSettings() {
    return (
        <View>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Settings</Text>
                <TouchableOpacity>
                    < Ionicons name="logout" size={25} color={'#fff'} />
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
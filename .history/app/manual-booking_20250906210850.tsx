import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";



export default function ManualBooking() {
    return (
        <View style={{ backgroundColor: '#f1f1f1' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manual Booking</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <TouchableOpacity>
                        <Ionicons name="boat" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="calendar" size={25} color={'#FFC107'} />
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    )
}
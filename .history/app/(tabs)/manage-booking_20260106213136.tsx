import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";

export default function ManageBooking() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
            </View>

            <View style={{ justifyContent: 'center', padding: 10 }}>
                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 }}>
                    <TextInput placeholder='Search' style={{ fontSize: 13, fontWeight: '600' }} />
                    <Ionicons name={'search'} size={20} style={{ borderLeftWidth: 1, borderLeftColor: '#B3B3B3', paddingLeft: 10 }} />
                </View>
            </View>
        </View>
    )
}
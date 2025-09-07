import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";



export default function ManualBooking() {
    return (
        <View>
            <View style={{ paddingTop: 30, height: 120, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text>Manual Booking</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Ionicons name="boat" size={25} color={'#FFC107'} />
                    <Ionicons name="calendar" size={25} color={'#FFC107'} />
                </View>
            </View>
        </View>
    )
}
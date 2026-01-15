import { Text, TextInput, View } from "react-native";

export default function ManageBooking() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
            </View>

            <View style={{ justifyContent: 'center', padding: 8 }}>
                {/* <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Address:</Text> */}
                <View style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 5 }}>
                    <TextInput placeholder='Address' style={{ fontSize: 13, fontWeight: '600' }} />
                </View>
            </View>
        </View>
    )
}
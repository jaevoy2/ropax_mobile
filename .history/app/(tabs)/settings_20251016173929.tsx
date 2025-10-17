import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

export default function GenSettings() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {/* Header */}
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Manage Booking</Text>
            </View>

            {/* Under Development Section */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Ionicons name="build-outline" size={40} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>This feature is under development</Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
                    We're working hard to bring this page to life. Stay tuned for updates!
                </Text>
            </View>
        </View>
    )
} 
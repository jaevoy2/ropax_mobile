import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Expenses() {
    return (
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', top: 45, left: 10, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ paddingTop: 20, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>Daily Expenses</Text>
            </View>

            {/* Under Development Section */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Ionicons name="construct-outline" size={50} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>This feature is under development</Text>
                <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
                    We're working hard to bring this page to life. Stay tuned for updates!
                </Text>
            </View>
        </View>
    )
}
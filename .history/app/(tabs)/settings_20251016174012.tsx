import { Text, View } from "react-native";

export default function GenSettings() {
    return (
        <View>
            <View style={{ paddingTop: 30, height: 100, backgroundColor: '#cf2a3a', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Settings</Text>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                </View>
            </View>
        </View>
    )
} 
import { useTrip } from '@/context/trip';
import { Text, TextInput, View } from 'react-native';



export default function Forms() {
    const { refNumber } = useTrip();

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#FFC107', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12 }}>Reference#:</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#cf2a3a' }}>LMBS-{refNumber}</Text>
                </View>
            </View>

        </View>
    )
}
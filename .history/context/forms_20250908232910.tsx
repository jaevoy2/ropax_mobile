import { useTrip } from '@/context/trip';
import { Text, TextInput, View } from 'react-native';



export default function Forms() {
    const { refNumber } = useTrip();

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#FFC107', borderWidth: 1, borderRadius: 5 }} />
                <Text>{refNumber}</Text>
            </View>

        </View>
    )
}
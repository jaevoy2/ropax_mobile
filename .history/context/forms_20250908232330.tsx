import { useTrip } from '@/context/trip';
import { Text, TextInput, View } from 'react-native';



export default function Forms() {
    const { refNumber } = useTrip();

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput />
                <Text>{refNumber}</Text>
            </View>

        </View>
    )
}
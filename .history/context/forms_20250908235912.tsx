import { useTrip } from '@/context/trip';
import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';



export default function Forms() {
    const { refNumber, trip } = useTrip();
    const [year, setYear] = useState('');

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    })

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#FFC107', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11 }}>Reference#:</Text>
                    <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-{refNumber.toString().padStart(6, '0')}-{year}{trip.split(" ")[4].charAt(0)}</Text>
                </View>
            </View>

        </View>
    )
}
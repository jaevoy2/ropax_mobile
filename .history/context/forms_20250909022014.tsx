import { useTrip } from '@/context/trip';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { usePassengers } from './passenger';

const accommType = ['Tourist']

export default function Forms() {
    const { refNumber, trip } = useTrip();
    const { passengers } = usePassengers();
    const [year, setYear] = useState('');

    useEffect(() => {
        const date = new Date();
        setYear(date.getFullYear().toString().slice(-2));
    })

    return (
        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextInput placeholder='₱00.00' style={{ borderColor: '#cf2a3a', borderWidth: 1, borderRadius: 5, paddingHorizontal: 15 }} />
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11 }}>Reference#:</Text>
                    <Text style={{ fontWeight: '900', fontSize: 14, color: '#cf2a3a' }}>LMBS-{refNumber.toString().padStart(6, '0')}-{year}{trip.split(" ")[0].charAt(0)}{trip.split(" ")[4].charAt(0)}</Text>
                </View>
            </View>

            <View style={{ height: '81%', marginTop: 10 }}>
                <ScrollView>
                    {passengers.map((p) => (
                        <View key={p.seatNumber} style={{ borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 10, marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View>
                                    <Text style={{ color: '#cf2a3a', fontSize: 10, fontWeight: 'bold' }}>B Class Seat#</Text>
                                    <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 15, color: '#cf2a3a', borderColor: '#cf2a3a', backgroundColor: '#cf2a3b1a', borderWidth: 1, paddingVertical: 5, paddingHorizontal: 20, borderRadius: 5 }}>
                                        {p.seatNumber}
                                    </Text>
                                </View>
                                <TextInput placeholder='₱00.00' style={{ borderColor: '#FFC107', borderWidth: 1, borderRadius: 5, paddingHorizontal: 8 }} />
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

        </View>
    )
}
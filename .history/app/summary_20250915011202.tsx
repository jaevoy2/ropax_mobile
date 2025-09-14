import { usePassengers } from '@/context/passenger';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('screen');

export default function TicketGenerator() {
    const { passengers } = usePassengers();

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <TouchableOpacity style={{ position: 'absolute', top: 45, left: 20, zIndex: 3 }}>
                <Ionicons name='chevron-back' size={30} color={'#fff'} />
            </TouchableOpacity>
            <View style={{ height: 100, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Payment Summary</Text>
            </View>
            <View style={{ padding: 10 }}>
                <Text style={{ fontWeight: '600', fontSize: 16, marginTop: 20 }}>Summary</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3, marginTop: 10 }}>
                    <Text style={{ fontSize: 15, width: '40%', fontWeight: '700' }}>Name:</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', width: 60, textAlign: 'right' }}>Fare</Text>
                </View>
                {passengers.map((p) => (
                    <View key={p.seatNumber} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, width: '40%' }}>{`${p.name?.split(',')[1]?.trim().charAt(0)}, ${p.name?.split(',')[0]}`}</Text>
                        <Text style={{ fontSize: 14 }}>₱350.00</Text>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={{ position: 'absolute', bottom: 10, backgroundColor: '#cf2a3a', width: '95%', alignSelf: 'center', borderRadius: 30, paddingVertical: 15, zIndex: 5 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>Confirm</Text>
            </TouchableOpacity>
        </View>
    )
}
import { usePassengers } from '@/context/passenger';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
                <View style={{ backgroundColor: '#fff', borderColor: '#B3B3B3', borderWidth: 1, borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column', gap: 15 }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Subtotal:</Text>
                            <Text style={{ fontSize: 16, fontWeight: '900', color: '#545454' }}>₱350.00</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Input Cash:</Text>
                            <View style={{ borderBottomColor: '#FFC107', borderBottomWidth: 1, width: 150, marginTop: -10 }}>
                                <TextInput keyboardType={'numeric'} placeholder='₱00.00' style={{ fontWeight: 'bold', fontSize: 16, paddingBottom: -10, paddingLeft: -10 }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Change:</Text>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#cf2a3a' }}>₱150.00</Text>
                    </View>
                </View>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>Summary</Text>
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
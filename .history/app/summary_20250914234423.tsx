import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('screen');

export default function TicketGenerator() {

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
                            <View style={{ borderBottomColor: '#FFC107', borderBottomWidth: 1, width: 150, padding: -20, marginTop: -10 }}>
                                <TextInput keyboardType={'numeric'} placeholder='₱00.00' style={{ fontWeight: 'bold', fontSize: 16, }} />
                            </View>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#545454' }}>Change:</Text>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#cf2a3a' }}>₱150.00</Text>
                    </View>
                </View>
            </View>

            <View style={{ padding: 10 }}>
                <Text style={{ fontWeight: '600' }}>Summary</Text>
            </View>
        </View>
    )
}
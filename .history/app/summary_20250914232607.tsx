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
                <View style={{ backgroundColor: '#fff', borderColor: '#B3B3B3', borderWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Subtotal:</Text>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#545454' }}>₱350.00</Text>
                        </View>
                        <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Input Cash:</Text>
                            <TextInput placeholder='₱00.00' style={{ borderBottomColor: '#FFC107', borderWidth: 1, paddingHorizontal: 15 }} />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#545454' }}>Change:</Text>
                        <Text style={{ fontSize: 18, fontWeight: '900', color: '#cf2a3a' }}>₱150.00</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
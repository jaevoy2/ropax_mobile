import React from 'react';
import { Dimensions, Text, View } from 'react-native';

const { height } = Dimensions.get('screen');

export default function TicketGenerator() {

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Payment Summary</Text>
            </View>
        </View>
    )
}
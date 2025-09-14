import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Text, View } from 'react-native';

const logo_text = require('@/assets/images/logo.png');
const logo_icon = require('@/assets/images/logo_icon.png');
const { height } = Dimensions.get('screen');

export default function TicketGenerator() {
    const { trip, refNumber } = useTrip();
    const { passengers } = usePassengers();
    const [tripDate, setTripDate] = useState('');
    const [year, setYear] = useState('');
    const viewRef = useRef<View | null>(null);

    useEffect(() => {
        const date = new Date();
        setTripDate(date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }));
        setYear(date.getFullYear().toString().slice(-2));
    });

    return (
        <View style={{ backgroundColor: '#f1f1f1', position: 'relative', height: height }}>
            <View style={{ height: 160, backgroundColor: '#cf2a3a', paddingTop: 50 }}>
                <Text style={{ fontSize: 15, color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Payment Summary</Text>
            </View>
        </View>
    )
}
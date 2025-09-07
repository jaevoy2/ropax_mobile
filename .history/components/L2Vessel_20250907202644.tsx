import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');
const touristSeat = ['BC1', 'BC2', 'BC3', 'BC4', 'BC5', 'P1', 'P2', 'P3', 'P5', 'P6', 'P7', 'P8'];

interface SeatProps { 
    start: number; 
    limit: number; 
    skipPattern?: boolean;
    skip?: number;
    count?: number;
    letter: string;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, letter, skip = 0, count = 0 }) => {
        const [items, setItems] = useState<number[]>([]);
    
    useEffect(() => {
        const seats: number[] = [];

        if(!skipPattern) {
            for (let i  = start; i <= limit; i++) {
                seats.push(i);
            }
        }else {
            for (let i = start; i <= limit;) {
                for(let j = 1; j <= count; j++, i++) {
                    seats.push(i);
                }
                i += skip;
            }
        }

        setItems(seats);
    }, [start, limit, skipPattern, count, skip]);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {items.map((seat) => (
                <TouchableOpacity key={seat} style={{ width: 33, height: 33, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: touristSeat.includes(`${letter}${seat}`) ? '#E6E2C6' : 'transparent', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: 'bold' }}>{`${letter}${seat}`} </Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}


export default function L2Vessel() {
    return (
        <View style={{ width: 335, height: height + 290, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row',justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan start={1} limit={23} skipPattern={true} skip={2} count={3} letter='BC' />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan skip={3} count={2} start={4} limit={25} skipPattern={true} letter='BC' />
                </View>
            </View>

            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a', marginTop: 30 }}>TOURIST CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={1} limit={22} letter='A' />
                </View>
                <View style={{ width: '50%' }}>
                    <SeatPlan start={1} limit={40} letter='B' />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={1} limit={22} letter='C' />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 3, alignSelf: 'center' }}>
                <View style={{ width: '60%' }}>
                    <SeatPlan start={1} limit={15} letter='D' />
                </View>
            </View>

        </View>
    )
} 
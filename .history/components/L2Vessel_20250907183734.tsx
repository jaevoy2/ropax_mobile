import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];
const touristSeat = [1, 2, 3, 4, 5, 6, 7, 8, 57, 58, 59, 60, 61, 62, 63, 64];

interface SeatProps { 
    start: number; 
    limit: number; 
    skipPattern?: boolean;
    skip: number;
    count: number;
    letter: string;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, letter, skip, count }) => {
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
                <TouchableOpacity key={seat} style={{ width: 35, height: 35, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: touristSeat.includes(seat) ? '#E6E2C6' : 'transparent', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', textAlign: 'center' }}>{`${letter}${seat}`} </Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}


export default function L2Vessel() {
    return (
        <View style={{ width: 325, height: height + 270, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan start={1} limit={23} skipPattern={true} skip={2} count={3} letter='BC' />
                </View>
                <View style={{ width: '30%' }}>
                    <SeatPlan skip={3} count={2} start={4} limit={25} skipPattern={true} letter='BC' />
                </View>
            </View>

            {/* <View style={{ marginTop: 25, }}>
                <Text style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'flex-end',}}>
                    <View style={{ width: '48%' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                        <SeatPlan start={1} limit={52} skipPattern={true} />
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                        <SeatPlan start={5} limit={56} skipPattern={true} />
                    </View>
                </View>
            </View>
            <View style={{ marginTop: 5, }}>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'flex-end',}}>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                        <SeatPlan start={57} limit={108} skipPattern={true} />
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                        <SeatPlan start={61} limit={112} skipPattern={true} />
                    </View>
                </View>
            </View>
            <View style={{ marginTop: 5, }}>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan start={113} limit={134} />
                    </View>
                </View>
            </View> */}

        </View>
    )
} 
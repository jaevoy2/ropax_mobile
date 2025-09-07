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
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false }) => {
        const [items, setItems] = useState<number[]>([]);
    
    useEffect(() => {
        const seats: number[] = [];

        if(!skipPattern) {
            for (let i  = start; i <= limit; i++) {
                seats.push(i);
            }
        }else {
            for (let i = start; i <= limit;) {
                for(let j = 1; j <= 4; j++, i++) {
                    seats.push(i);
                }
                i += 4;
            }
        }

        setItems(seats);
    }, [start, limit, skipPattern]);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
            {items.map((seat) => (
                <TouchableOpacity key={seat} style={{  paddingVertical: 2, width: 32, height: 32, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: touristSeat.includes(seat) ? '#E6E2C6' : 'transparent', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{seat}</Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}


export default function SRVessel() {
    return (
        <View style={{ width: 330, height: height + 290, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, width: '80%', alignSelf: 'center' }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                    {seatColumn1.map((seat) => ( 
                        <TouchableOpacity key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: seat == 'A' || seat == 'B' ? '#E6E2C6' : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                    {seatColumn2.map((seat) => ( 
                        <TouchableOpacity key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: '#E6E2C6' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PDW</Text>
                    {seatColumn3.map((seat) => ( 
                        <TouchableOpacity key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: seat == 'C' || seat == 'D' ? '#E6E2C6' : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ marginTop: 25, }}>
                <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
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
            <View style={{ marginTop: 10, }}>
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
            <View style={{ marginTop: 10, }}>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan start={113} limit={134} />
                    </View>
                </View>
            </View>
        </View>
    )
} 
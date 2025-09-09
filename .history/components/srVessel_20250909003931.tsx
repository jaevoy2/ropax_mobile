import { usePassengers } from '@/context/passenger';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];
const touristSeat = [1, 2, 3, 4, 5, 6, 7, 8, 57, 58, 59, 60, 61, 62, 63, 64];

interface SeatProps { 
    start: number; 
    limit: number; 
    skipPattern?: boolean;
    onSeatSelect?: (seat: number) => void;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, onSeatSelect }) => {
        const [items, setItems] = useState<number[]>([]);
        const { passengers } = usePassengers();
    
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
                <TouchableOpacity onPress={() => onSeatSelect?.(seat)} key={seat} style={{  paddingVertical: 2, width: 32, height: 32, borderColor: '#A9A9B2', borderWidth: 1, 
                borderRadius: 3, backgroundColor: passengers.some((p) => p.seatNumber == Number(seat)) ? '#BA68C8' : touristSeat.includes(seat) ? '#E6E2C6' : 'transparent', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == Number(seat)) ? '#fff' : '#000' }}>{seat}</Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}

type SRVesselProps = {
  onSeatSelect?: (seat: number | string) => void;
};

export default function SRVessel({ onSeatSelect }: SRVesselProps) {
    const { passengers, setPassengers } = usePassengers();
    const assignseat = (seat: number | string) => {
        setPassengers(prev => [...prev, { seatNumber: seat }]);
        onSeatSelect?.(seat);
    }


    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50, alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, width: '80%', alignSelf: 'center', }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn1.map((seat) => ( 
                        <TouchableOpacity onPress={() => assignseat?.(seat)} key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                        backgroundColor: passengers.some((p) => p.seatNumber == String(seat)) ? '#BA68C8' : seat == 'A' || seat == 'B' ? '#E6E2C6' : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn2.map((seat) => ( 
                        <TouchableOpacity onPress={() => assignseat?.(seat)} key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: '#E6E2C6' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn3.map((seat) => ( 
                        <TouchableOpacity onPress={() => assignseat?.(seat)} key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: seat == 'C' || seat == 'D' ? '#E6E2C6' : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ marginTop: 25, paddingHorizontal: 4, width: width - 20 }}>
                <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <View style={{ flexDirection: 'column', width: '46%', alignItems: 'center',  }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={1} limit={52} skipPattern={true} onSeatSelect={assignseat} />
                    </View>
                    <View style={{ flexDirection: 'column', width: '46%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={5} limit={56} skipPattern={true} onSeatSelect={assignseat} />
                    </View>
                </View>
            </View>


            <View style={{ marginTop: 10, paddingHorizontal: 4 }}>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ width: '45%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={57} limit={108} skipPattern={true} onSeatSelect={assignseat} />
                    </View>
                    <View style={{ width: '45%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={61} limit={112} skipPattern={true} onSeatSelect={assignseat} />
                    </View>
                </View>
            </View>
            <View style={{ marginTop: 10, }}>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan start={113} limit={134} onSeatSelect={assignseat} />
                    </View>
                </View>
            </View>
        </View>
    )
} 
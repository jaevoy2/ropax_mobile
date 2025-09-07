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
        <View>
            {items.map((seat) => (
                <TouchableOpacity key={seat}>
                    <Text>{seat}</Text>
                </TouchableOpacity>
            ))}
        </View>
    )
}


export default function SRVessel() {
    return (
        <View style={{ width: 325, height: height + 230, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            
        </View>
    )
} 
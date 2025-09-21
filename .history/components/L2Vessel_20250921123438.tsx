import { FetchAccommodations } from '@/api/accommodations';
import { usePassengers } from '@/context/passenger';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');
const touristSeat = ['BC1', 'BC2', 'BC3', 'BC4', 'BC5', 'P1', 'P2', 'P4', 'P3', 'P5', 'P6', 'P7', 'P8'];

interface SeatProps { 
    start: number; 
    limit: number; 
    skipPattern?: boolean;
    skip?: number;
    count?: number;
    letter: string;
    type: string;
    accomm_id: number;
    onSeatSelect?: (seat: string | number, type: string, accomm_id: number) => void;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, letter, skip = 0, count = 0, onSeatSelect, type, accomm_id }) => {
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
                for(let j = 1; j <= count; j++, i++) {
                    seats.push(i);
                }
                i += skip;
            }
        }

        setItems(seats);
    }, [start, limit, skipPattern, count, skip]);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {items.map((seat) => (
                <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(`${letter}${seat}`))} key={seat} onPress={() => onSeatSelect?.(`${letter}${seat}`, type, accomm_id)} 
                style={{ width: 33, height: 33, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, backgroundColor: passengers.some((p) => p.seatNumber == String(`${letter}${seat}`)) ? '#BA68C8' : touristSeat.includes(`${letter}${seat}`) ? '#E6E2C6' : 'transparent', alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == String(`${letter}${seat}`)) ? '#fff' : '#000' }}>{`${letter}${seat}`} </Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}

type L2VesselProps = {
    onSeatSelect?: (seat: string | number) => void;
}

type AccomsProps = {
    id: number;
    name: string;
    code: string;
}

export default function L2Vessel({onSeatSelect}: L2VesselProps) {
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { passengers, setPassengers } = usePassengers();
    const assignseat = (seat: string | number, type: string, accomm_id: number) => {
        setPassengers(prev => [...prev, { seatNumber: seat, accommodation: type, accommodationID: accomm_id }]);
        onSeatSelect?.(seat);
    }

    useEffect(() => {
        const fetchAccom = async () => {
            try {
                const accomType = await FetchAccommodations();
    
                if(!accomType.error) {
                    const accomms: AccomsProps[] = accomType.data.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        code: a.code
                    }));

                    setAccommodations(accomms);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message)
            }
        }
        
        fetchAccom();        
    })

    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row',justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan start={1} limit={23} skipPattern={true} skip={2} count={3} letter='BC' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'BC')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'BC')?.id!} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan skip={3} count={2} start={4} limit={25} skipPattern={true} letter='BC' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'BC')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'BC')?.id!} />
                </View>
            </View>

            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a', marginTop: 30 }}>TOURIST CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={1} limit={2} letter='P' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={22} letter='A' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
                <View style={{ width: '50%' }}>
                    <SeatPlan start={3} limit={6} letter='P' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={40} letter='B' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={7} limit={8} letter='P' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={22} letter='C' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 3, alignSelf: 'center' }}>
                <View style={{ width: '60%' }}>
                    <SeatPlan start={1} limit={15} letter='D' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
            </View>

        </View>
    )
} 
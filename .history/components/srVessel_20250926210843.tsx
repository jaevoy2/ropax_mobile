import { FetchAccommodations } from '@/api/accommodations';
import { FetchBookings } from '@/api/bookings';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];
const touristSeat = [1, 2, 3, 4, 5, 6, 7, 8, 57, 58, 59, 60, 61, 62, 63, 64];

interface SeatProps { 
    start: number; 
    limit: number;
    type: string;
    accomm_id: number;
    skipPattern?: boolean;
    bookedSeats?: BookedSeat[];
    onSeatSelect?: (seat: number, type: string, accomm_id: number) => void;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, onSeatSelect, type, accomm_id, bookedSeats }) => {
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {items.map((seat) => (
                <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == Number(seat))} onPress={() => onSeatSelect?.(seat, type, accomm_id)} key={seat}
                style={{  paddingVertical: 2, width: 32, height: 32, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                backgroundColor: bookedSeats?.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Port'
                ? '#01760B'
                : bookedSeats?.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Shop'
                ? '#64B5F6' :
                passengers.some((p) => p.seatNumber == Number(seat)) ? '#BA68C8' : touristSeat.includes(seat) ? '#E6E2C6' : 'transparent', 
                alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == Number(seat)) ? '#fff' : '#000' }}>{seat}</Text>
                </TouchableOpacity>
            ))} 
        </View>
    )
}

type SRVesselProps = {
  onSeatSelect?: (seat: number | string) => void;
};

type AccomsProps = {
    id: number;
    name: string;
    code: string;
}

type BookedSeat = {
    seat_no: string | number;
    station: {
        id: number;
        name: string;
    }
}

export default function SRVessel({ onSeatSelect }: SRVesselProps) {
    const { id } = useTrip();
    const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { passengers, setPassengers } = usePassengers();
    const assignseat = (seat: number | string, type: string, accomm_id: number) => {
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

        const fetchBookings = async () => {
            try {
                const seats = await FetchBookings(id);
                
                if(!seats.error) {
                    const bookings = seats.data.passengers.map((p: any) => ({
                        seat_no: p.pivot.seat_no,
                        station: p.station 
                    }));
                    
                    console.log(bookings);
                    setBookedSeats(bookings);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

        fetchBookings();
        fetchAccom();
    }, [])

    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50,  }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, width: '80%', alignSelf: 'center', }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn1.map((seat) => ( 
                        <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)}
                        onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} 
                        style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                        backgroundColor: bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Port'
                        ? '#01760B'
                        : bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Shop'
                        ? '#64B5F6'
                        : passengers.some((p) => p.seatNumber == String(seat))
                        ? '#BA68C8'
                        : seat == 'A' || seat == 'B'
                        ? '#E6E2C6'
                        : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == String(seat)) ? '#fff' : '#000' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn2.map((seat) => ( 
                        <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)} 
                        onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                        backgroundColor: bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Port'
                        ? '#01760B'
                        : bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Shop'
                        ? '#64B5F6'
                        : passengers.some((p) => p.seatNumber == String(seat))
                        ? '#BA68C8' : '#E6E2C6' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == String(seat)) ? '#fff' : '#000' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn3.map((seat) => ( 
                        <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)} onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                        backgroundColor: bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Port'
                        ? '#01760B'
                        : bookedSeats.find((s) => s.seat_no == seat)?.station.name === 'Hilongos Shop'
                        ? '#64B5F6'
                        : passengers.some((p) => p.seatNumber == String(seat))
                        ? '#BA68C8'
                        : seat == 'C' || seat == 'D'
                        ? '#E6E2C6'
                        : 'transparent' }}> 
                            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: passengers.some((p) => p.seatNumber == String(seat)) ? '#fff' : '#000' }}>{seat}</Text> 
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ marginTop: 25, paddingHorizontal: 4, width: width - 20 }}>
                <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <View style={{ flexDirection: 'column', width: '46%', alignItems: 'center',  }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={1} limit={52} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                    <View style={{  width: '46%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={5} limit={56} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={57} limit={108} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan start={61} limit={112} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan start={113} limit={134} bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
            </View>

        </View>
    )
} 
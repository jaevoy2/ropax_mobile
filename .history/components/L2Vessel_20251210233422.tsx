import { FetchAccommodations } from '@/api/accommodations';
import { FetchBookings } from '@/api/bookings';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { channel, seatSelection } from '@/utils/channel';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    bookedSeats?: BookedSeat[];
    onSeatSelect?: (seat: string | number, type: string, accomm_id: number) => void;
}

const SeatPlan: React.FC<SeatProps> = ({ start, limit, skipPattern = false, letter, skip = 0, count = 0, onSeatSelect, type, accomm_id, bookedSeats }) => {
    const [items, setItems] = useState<number[]>([]);
    const { passengers } = usePassengers();
    const [seatSelectionChannel, setSeatSelectionChannel] = useState<any[]>([]);

    useEffect(() => {
        const listen = channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'seats_channels' }, payload => {
            const newData = payload.new;
            const { event_type, seat_number } = newData;

            console.log('seats selected', newData);

            if(event_type == 'selected') {
                setSeatSelectionChannel((prev) => [...prev, seat_number])
            }else {
                setSeatSelectionChannel((prev) => 
                    prev.filter((s) => s != seat_number)
                )
            }
        });

        return () => {
            listen.unsubscribe();
        }
    }, []);
     
    useMemo(() => {
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

    const bookedSeatsMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s
        });

        return map;
    }, [bookedSeats]);

    const passengerSeats = useMemo(() => new Set(passengers.map((p) => p.seatNumber)), [passengers]);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {items.map((seat) => {
                const booked =  bookedSeatsMap[`${letter}${seat}`];
                const isPassenger = passengerSeats.has(`${letter}${seat}`);
                
                return(
                    <TouchableOpacity disabled={!!booked || isPassenger || seatSelectionChannel.includes(`${letter}${seat}`)} key={seat} onPress={() => onSeatSelect?.(`${letter}${seat}`, type, accomm_id)} 
                    style={{ width: 33, height: 33, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                    backgroundColor: booked ? booked.station.color : isPassenger ? '#BA68C8' : touristSeat.includes(`${letter}${seat}`) && !seatSelectionChannel.includes(`${letter}${seat}`) ? '#E6E2C6' : seatSelectionChannel.includes(`${letter}${seat}`) ? '#e6d1e9ff' : 'transparent',
                    alignItems: 'center', justifyContent: 'center', margin: 2 }}>
                        <Text style={{ fontSize: 10.5, fontWeight: 'bold', 
                            color: booked || isPassenger ? '#fff' : seatSelectionChannel.includes(`${letter}${seat}`) ? '#FFFFFF' : '#000' }}>
                            {booked?.passTypeCode ?? `${letter}${seat}`}
                        </Text>
                    </TouchableOpacity>
                )
            })} 
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

type BookedSeat = {
    seat_no: string | number;
    passTypeCode: string;
    station: {
        id: number;
        name: string;
        created_at?: string;
        updated_at?: string;
        code: string;
        color: string;
    }
}

export default function L2Vessel({onSeatSelect}: L2VesselProps) {
    const { id } = useTrip();
    const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { setPassengers } = usePassengers();
    
    const assignseat = useCallback((seat: string | number, type: string, accomm_id: number) => {
        setPassengers(prev => [...prev, { seatNumber: seat, accommodation: type, accommodationID: accomm_id }]);
        onSeatSelect?.(seat);

        seatSelection(seat, id)
    }, [onSeatSelect, setPassengers]);

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
                    const bookings = seats.data.flatMap((t: any) =>
                        t.passengers.map((p: any) => ({
                            passTypeCode: p.passenger_types.passenger_types_code,
                            seat_no: p.pivot.seat_no,
                            station: t.station
                        }))
                    )
                    
                    console.log(bookings);
                    setBookedSeats(bookings);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

        fetchBookings()
        fetchAccom();        
    }, []);


    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row',justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan start={1} limit={23} skipPattern={true} bookedSeats={bookedSeats} skip={2} count={3} letter='BC' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'BC')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'BC')?.id!} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan skip={3} count={2} start={4} limit={25} bookedSeats={bookedSeats} skipPattern={true} letter='BC' onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'BC')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'BC')?.id!} />
                </View>
            </View>

            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a', marginTop: 30 }}>TOURIST CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={1} limit={2} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={22} letter='A' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
                <View style={{ width: '50%' }}>
                    <SeatPlan start={3} limit={6} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={40} letter='B' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan start={7} limit={8} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    <SeatPlan start={1} limit={22} letter='C' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 3, alignSelf: 'center' }}>
                <View style={{ width: '60%' }}>
                    <SeatPlan start={1} limit={15} letter='D' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                </View>
            </View>

        </View>
    )
} 
import { FetchAccommodations } from '@/api/accommodations';
import { FetchBookings } from '@/api/bookings';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { supabase } from '@/utils/supabase';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
    seatSelectionChannel: string[];
}

const SeatPlan: React.FC<SeatProps> = React.memo(({ start, limit, skipPattern = false, onSeatSelect, type, accomm_id, bookedSeats, seatSelectionChannel }) => {
    const [items, setItems] = useState<number[]>([]);
    const { passengers } = usePassengers();

    useMemo(() => {
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


    const bookedSeatMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s
        });

        return map;
    }, [bookedSeats]);

    const passengerSeats = useMemo(() => new Set(passengers.map((p) => p.seatNumber)), [passengers])

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {items.map((seat) => {
                const booked = bookedSeatMap[seat];
                const isPassenger = passengerSeats.has(seat);
                
                return (
                    <TouchableOpacity disabled={!!booked || isPassenger} onPress={() => onSeatSelect?.(seat, type, accomm_id)} key={seat}
                    style={{  paddingVertical: 2, width: 32, height: 32, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                    backgroundColor: 
                        booked ? booked.station.color : isPassenger ? '#BA68C8' : touristSeat.includes(seat) ? '#E6E2C6' : 'transparent'
                    }}>
                        <Text style={{ fontSize: 16, textAlign: 'center', fontWeight: 'bold', 
                            color: booked || isPassenger ? '#fff' : '#000' }}>
                            {booked?.passTypeCode ?? seat}
                        </Text>
                    </TouchableOpacity>
                );
            })}
                
        </View>
    )
})

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

export default function SRVessel({ onSeatSelect }: SRVesselProps) {
    const { id } = useTrip();
    const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { passengers, setPassengers } = usePassengers();
    const [seatSelectionChannel, setSeatSelectionChannel] = useState<string[]>([]);

    const assignseat = useCallback((seat: number | string, type: string, accomm_id: number) => {
        const paxHasCargo = passengers.find(p => p.hasCargo == true);
        if(!paxHasCargo || (paxHasCargo && paxHasCargo.seatNumber != null)){
            setPassengers(prev => [...prev, { seatNumber: seat, accommodation: type, accommodationID: accomm_id }]);
        }else{
            setPassengers(prev => 
                prev.map((p) => p.hasCargo ? { ...p, seatNumber: seat, accommodation: type, accommodationID: accomm_id }: p)
            )
        }

        onSeatSelect?.(seat);
    }, [setPassengers, onSeatSelect])

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
                    setBookedSeats(bookings);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

        channel();
        fetchBookings();
        fetchAccom();
    }, [])

    const channel = async () => {
        const { data } = await supabase.from('seats').select('*').eq('trip_id', id).eq('event_type', 'selected');
        const selectedSeats = data?.map((d: any) => d.seat_number);
        setSeatSelectionChannel(selectedSeats || []);

        const listen = supabase.channel('seats_changes_channels').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'seats' }, (payload) => {
6
            const newData: any = payload.new;
            const { event_type, seat_number, trip_id } = newData;

            setSeatSelectionChannel(prev =>
                event_type === "selected" && trip_id == id
                    ? [...prev, seat_number]
                    : prev.filter(s => s !== seat_number)
            );
        });

        listen.subscribe();

        return () => {
            listen.unsubscribe();
        }
    }

    const bookedSeatMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s
        });

        return map;
    }, [bookedSeats]);

    const passengerSeats = useMemo(() => new Set(passengers.map((p) => p.seatNumber)), [passengers])

    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50,  }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, width: '80%', alignSelf: 'center', }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn1.map((seat) =>{
                        const booked = bookedSeatMap[seat];
                        const isPassenger = passengerSeats.has(seat)

                        return ( 
                            <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)}
                            onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} 
                            style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked.station.color : isPassenger ? '#BA68C8' : seat == 'A' || seat == 'B' ? '#E6E2C6' : 'transparent'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger ? '#fff' : '#000' }}>
                                    {booked?.passTypeCode ?? seat}
                                </Text> 
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn2.map((seat) =>{
                        const booked = bookedSeatMap[seat];
                        const isPassenger = passengerSeats.has(seat)

                        return ( 
                            <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)}
                            onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} 
                            style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked.station.color : isPassenger ? '#BA68C8' : '#E6E2C6'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger ? '#fff' : '#000' }}>
                                    {booked?.passTypeCode ?? seat}
                                </Text> 
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn3.map((seat) =>{
                        const booked = bookedSeatMap[seat];
                        const isPassenger = passengerSeats.has(seat)

                        return ( 
                            <TouchableOpacity disabled={passengers.some((p) => p.seatNumber == String(seat)) || bookedSeats.some((s) => s.seat_no == seat)}
                            onPress={() => assignseat?.(seat, accommodations?.find((accom) => accom.code == 'BC')?.name!, accommodations?.find((accom) => accom.code == 'BC')?.id!)} key={seat} 
                            style={{ paddingVertical: 3, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked.station.color : isPassenger && !seatSelectionChannel.includes(seat) ? '#BA68C8' : seat == "C" || seat == "D" ? '#E6E2C6' : seatSelectionChannel.includes(seat) ? '#e6d1e9ff' : 'transparent'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger || seatSelectionChannel.includes(seat) ? '#fff' : '#000' }}>
                                    {booked?.passTypeCode ?? seat}
                                </Text> 
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>

            <View style={{ marginTop: 25, paddingHorizontal: 4, width: width - 20 }}>
                <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
                <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                    <View style={{ flexDirection: 'column', width: '46%', alignItems: 'center',  }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan seatSelectionChannel={seatSelectionChannel} start={1} limit={52} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                    <View style={{  width: '46%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan seatSelectionChannel={seatSelectionChannel} start={5} limit={56} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan seatSelectionChannel={seatSelectionChannel} start={57} limit={108} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan seatSelectionChannel={seatSelectionChannel} start={61} limit={112} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
                <View style={{ marginTop: 10, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan seatSelectionChannel={seatSelectionChannel} start={113} limit={134} bookedSeats={bookedSeats} onSeatSelect={assignseat} type={accommodations?.find((accom) => accom.code == 'TO')?.name!} accomm_id={accommodations?.find((accom) => accom.code == 'TO')?.id!} />
                    </View>
                </View>
            </View>

        </View>
    )
} 
import { FetchAccommodations } from '@/api/accommodations';
import { FetchBookings } from '@/api/bookings';
import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { seatSelection } from '@/utils/channel';
import { supabase } from '@/utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];
const touristSeat = [1, 2, 3, 4, 5, 6, 7, 8, 57, 58, 59, 60, 61, 62, 63, 64];

interface SeatProps { 
    passengerSeats: Set<number | string>;
    start: number; 
    limit: number;
    type: string;
    accomm_id: number;
    skipPattern?: boolean;
    bookedSeats?: BookedSeat[];
    seatChannel?:  Set<number | string>
    onSeatSelect?: (seat: number, type: string, accomm_id: number) => void;
}

const SeatPlan: React.FC<SeatProps> = React.memo(({ start, limit, passengerSeats, skipPattern = false, onSeatSelect, type, accomm_id, bookedSeats, seatChannel }) => {
    const items = useMemo(() => {
        const seats = [];

        if(!skipPattern) {
            for(let i = start; i <= limit; i++) {
                seats.push(i);
            }
        }else {
            for(let i = start; i <= limit;) {
                for (let j = 1; j <= 4; j++, i++) {
                    seats.push(i);
                }
                i += 4
            }
        }

        return seats;
    }, [start, limit, skipPattern])


    const bookedSeatMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s
        });

        return map;
    }, [bookedSeats]);


    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {items.map((seat) => {
                const touristSet = new Set(touristSeat);
                const booked = bookedSeatMap[seat];
                const isPassenger = passengerSeats.has(seat);
                const inChannel = seatChannel?.has(String(seat)) ?? false;
                
                return (
                    <TouchableOpacity disabled={!!booked || isPassenger || inChannel} onPress={() => onSeatSelect?.(seat, type, accomm_id)} key={seat}
                    style={{ justifyContent: 'center', paddingVertical: 2, width: 33, height: 33, borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                    backgroundColor: 
                        booked ? booked?.station?.color : isPassenger ? '#BA68C8' : touristSet.has(seat) && !inChannel ? '#E6E2C6' : inChannel ? '#e6d1e9ff' : 'transparent'
                    }}>
                        <Text style={{ fontSize: 14, textAlign: 'center', fontWeight: 'bold', 
                            color: booked || isPassenger || inChannel ? '#fff' : '#000' }}>
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
    name?: string;
    code: string;
}

type BookedSeat = {
    seat_no: string | number;
    passTypeCode?: string;
    station?: {
        id: number;
        name?: string;
        created_at?: string;
        updated_at?: string;
        code?: string;
        color?: string;
    }
}

const bClassNames = ['Business Class', 'B Class', 'B-Class']

const SRVessel = ({ onSeatSelect }: SRVesselProps) => {
    const { id } = useTrip();
    const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { passengers, setPassengers } = usePassengers();
    const [seatSelectionChannel, setSeatSelectionChannel] = useState<string[]>([]);
    const stationRef = useRef<{ id: string; color: string } | null>(null);
    const tripIdRef = useRef(id);
    

    useEffect(() => { tripIdRef.current = id; }, [id]);

    useEffect(() => {
        const loadStation = async () => {
            const id = await AsyncStorage.getItem('stationID');
            const color = await AsyncStorage.getItem('stationColor');
            stationRef.current = { id: id ?? '', color: color ?? '' };
        };
        loadStation();
    }, [])

    const assignseat = useCallback(async (seat: number | string, type: string, accomm_id: number) => {
        const { id: stationId, color: stationColor } = stationRef.current ?? {};

        try {
            const { error } = await seatSelection(seat, tripIdRef.current, Number(stationId), stationColor);
            
            if(error) {
                Alert.alert('Error', 'Seat selection failed. Please try again later.');
            }

            const tempId = Crypto.randomUUID();
            
            setPassengers(prev => {
                const paxScan = prev.find(p => p.hasScanned && p.seatNumber == '');

                if(!paxScan) {
                    return [
                        ...prev,
                        { id: tempId, seatNumber: seat, accommodation: type, accommodationID: accomm_id }
                    ]
                }
                return prev.map(p => p.hasScanned && p?.id == paxScan?.id ? { ...p, seatNumber: seat }: p)
            });
        
            onSeatSelect?.(seat);
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }
    }, [setPassengers, onSeatSelect])


    useEffect(() => {
        const fetchAccom = async () => {
            try {
                const accomType = await FetchAccommodations();
    
                if(!accomType.error) {
                    const accomms: AccomsProps[] = accomType.data.map((a: any) => ({
                        id: a?.id,
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
                    const bookings = seats.data.filter((b: any) => b.station_id != null)
                        .flatMap((t: any) =>
                        t.passengers.map((p: any) => ({
                            passTypeCode: p?.passenger_type?.passenger_types_code,
                            seat_no: p?.pivot.seat_no,
                            station: t?.station
                        }))
                    )
                    setBookedSeats(bookings);
                }
            }catch(error: any) {
                Alert.alert('Error', error.message);
            }
        }

        fetchBookings();
        fetchAccom();
    }, [])

    
    useEffect(() => {
        const channel = async () => {
            const { data } = await supabase.from('seats_selections').select('*').eq('trip_id', id);
            const selectedSeats = data?.map((d: any) => d.seat_number);
            setSeatSelectionChannel(selectedSeats || []);
    
            const listen = supabase.channel('custom-insert-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'seats_selections' }, (payload) => {
    
                if(payload.eventType == "INSERT") {
                    const newData: any = payload.new;
                    const { seat_number, trip_id } = newData;
        
                    setSeatSelectionChannel(prev => trip_id == id ? [...prev, seat_number] : prev );
                }
    
                if(payload.eventType == 'DELETE') {
                    const oldData: any = payload.old;
                    const { seat_number, trip_id } = oldData;
    
                    setSeatSelectionChannel(prev => trip_id == id ? prev.filter((seat) => seat != seat_number) : prev)
                }
            });
    
            listen.subscribe();
            return listen;
        }

        let channelInstance: any;
        channel().then(ch => (channelInstance = ch));

        return () => {
            channelInstance?.unsubscribe();
        };
    }, [id])

    const bookedSeatMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s
        });

        return map;
    }, [bookedSeats]);

    const TouristAccoms = useMemo(() => accommodations?.find((accom) => accom?.name == 'Tourist'), [accommodations]);
    const BClassAccomms = useMemo(() => accommodations?.find((accom) => bClassNames.includes(accom?.name)), [accommodations]);
    const passengerSeats = useMemo(() => new Set(passengers.map(p => p.seatNumber)), [passengers]);
    const seatChannel = useMemo(() => new Set(seatSelectionChannel.map(String)), [seatSelectionChannel]);

    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#f0f0f0', marginTop: 20, paddingTop: 10, borderRadius: 50,  }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10, width: '80%', alignSelf: 'center', }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 90, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    {seatColumn1.map((seat) =>{
                        const booked = bookedSeatMap[seat];
                        const isPassenger = passengerSeats.has(seat)
                        const inChannel = seatChannel?.has(String(seat)) ?? false;

                        return ( 
                            <TouchableOpacity disabled={!!booked || isPassenger || inChannel}
                            onPress={() => assignseat?.(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
                            style={{ paddingVertical: 4, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked?.station?.color : isPassenger ? '#BA68C8' : inChannel ? '#e6d1e9ff' : seat == 'A' || seat == 'B' ? '#E6E2C6' : 'transparent'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger || inChannel ? '#fff' : '#000' }}>
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
                        const inChannel = seatChannel?.has(String(seat))

                        return ( 
                            <TouchableOpacity disabled={!!booked || isPassenger || inChannel}
                            onPress={() => assignseat?.(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
                            style={{ paddingVertical: 4, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked?.station?.color :
                                isPassenger  ? '#BA68C8' :
                                !inChannel ? '#E6E2C6' :
                                '#e6d1e9ff'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger || inChannel ? '#fff' : '#000' }}>
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
                        const inChannel = seatChannel?.has(String(seat))

                        return ( 
                            <TouchableOpacity disabled={!!booked || isPassenger || inChannel}
                            onPress={() => assignseat?.(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
                            style={{ paddingVertical: 4, width: '35%', borderColor: '#A9A9B2', borderWidth: 1, borderRadius: 3, 
                            backgroundColor: 
                                booked ? booked?.station?.color : isPassenger ? '#BA68C8' : inChannel ? '#e6d1e9ff' : seat == "C" || seat == "D" ? '#E6E2C6' : 'transparent'
                            }}> 
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', 
                                    color: booked || isPassenger || inChannel ? '#fff' : '#000' }}>
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
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={52} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                    <View style={{  width: '46%', alignItems: 'center', }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={5} limit={56} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' }}>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={57} limit={108} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                    <View style={{ width: '46%' }}>
                        <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={61} limit={112} bookedSeats={bookedSeats} skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={113} limit={134} bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                </View>
            </View>

        </View>
    )
} 

export default React.memo(SRVessel)
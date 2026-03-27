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

const { height } = Dimensions.get('window');

const touristSeatList = ['BC1', 'BC2', 'BC3', 'BC4', 'BC5', 'P1', 'P2', 'P4', 'P3', 'P5', 'P6', 'P7', 'P8'];
const touristSet = new Set(touristSeatList);
const bClassNames = ['Business Class', 'B Class', 'B-Class'];

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
    passengerSeats: Set<number | string>;
    seatChannel?: Set<number | string>;
}

const SeatPlan: React.FC<SeatProps> = React.memo(({ start, limit, skipPattern = false, letter, skip = 0, count = 0, onSeatSelect, type, accomm_id, bookedSeats, seatChannel, passengerSeats }) => {
    const items = useMemo(() => {
        const seats = [];

        if (!skipPattern) {
            for (let i = start; i <= limit; i++) {
                seats.push(i);
            }
        } else {
            for (let i = start; i <= limit;) {
                for (let j = 1; j <= count; j++, i++) {
                    seats.push(i);
                }
                i += skip;
            }
        }

        return seats;
    }, [start, limit, skipPattern, count, skip]);

    const bookedSeatsMap = useMemo(() => {
        const map: Record<number | string, BookedSeat> = {};
        bookedSeats?.forEach((s) => {
            map[s.seat_no] = s;
        });
        return map;
    }, [bookedSeats]);

    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
            {items.map((seat) => {
                const seatKey = `${letter}${seat}`;
                const booked = bookedSeatsMap[seatKey];
                const isPassenger = passengerSeats?.has(seatKey);
                const inChannel = seatChannel?.has(seatKey) ?? false;

                return (
                    <TouchableOpacity
                        key={seat}
                        disabled={!!booked || isPassenger || inChannel}
                        onPress={() => onSeatSelect?.(seatKey, type, accomm_id)}
                        style={{
                            width: 34, height: 34, borderColor: '#A9A9B2',
                            borderWidth: 1, borderRadius: 3, alignItems: 'center',
                            justifyContent: 'center', margin: 2,
                            backgroundColor:
                                booked ? booked?.station.color
                                : isPassenger ? '#BA68C8'
                                : touristSet.has(seatKey) && !inChannel ? '#E6E2C6'
                                : inChannel ? '#e6d1e9ff'
                                : 'transparent'
                        }}>
                        <Text style={{
                            fontSize: 10.3, fontWeight: '900',
                            color: booked || isPassenger || inChannel ? '#fff' : '#000'
                        }}>
                            {booked?.passTypeCode ?? seatKey}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
});

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
    passTypeCode?: string;
    station: {
        id: number;
        name: string;
        created_at?: string;
        updated_at?: string;
        code: string;
        color: string;
    }
}

const L2Vessel = ({ onSeatSelect }: L2VesselProps) => {
    const { id } = useTrip();
    const [bookedSeats, setBookedSeats] = useState<BookedSeat[]>([]);
    const [accommodations, setAccommodations] = useState<AccomsProps[] | null>(null);
    const { passengers, setPassengers } = usePassengers();
    const [seatSelectionChannel, setSeatSelectionChannel] = useState<string[]>([]);

    const stationRef = useRef<{ id: string; color: string } | null>(null);

    useEffect(() => {
        const loadStation = async () => {
            const stationId = await AsyncStorage.getItem('stationID');
            const stationColor = await AsyncStorage.getItem('stationColor');
            stationRef.current = { id: stationId ?? '', color: stationColor ?? '' };
        };
        loadStation();
    }, []);

    const assignseat = useCallback(async (seat: string | number, type: string, accomm_id: number) => {
        const { id: stationId, color: stationColor } = stationRef.current ?? {};
        try {
            const { error } = await seatSelection(seat, id, Number(stationId), stationColor);

            if (error) {
                Alert.alert('Error', 'Seat selection failed. Please try again later.');
            }

            const tempId = Crypto.randomUUID();

            setPassengers(prev => {
                const paxScan = prev.find(p => p?.hasScanned && p.seatNumber == '');

                if (!paxScan) {
                    return [
                        ...prev,
                        { id: tempId, seatNumber: seat, accommodation: type, accommodationID: accomm_id }
                    ];
                }

                return prev.map(p => p?.hasScanned && p?.id == paxScan?.id ?
                    { ...p, seatNumber: seat } : p
                );
            });

            onSeatSelect?.(seat);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }, [id, onSeatSelect, setPassengers]);

    useEffect(() => {
        const fetchAccom = async () => {
            try {
                const accomType = await FetchAccommodations();

                if (!accomType.error) {
                    const accomms: AccomsProps[] = accomType.data.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                        code: a.code
                    }));
                    setAccommodations(accomms);
                }
            } catch (error: any) {
                Alert.alert('Error', error.message);
            }
        };

        const fetchBookings = async () => {
            try {
                const seats = await FetchBookings(id);

                if (!seats.error) {
                    const bookings = seats.data.flatMap((t: any) =>
                        t.passengers.map((p: any) => ({
                            passTypeCode: p.passenger_type?.passenger_types_code,
                            seat_no: p.pivot.seat_no,
                            station: t.station
                        }))
                    );
                    setBookedSeats(bookings);
                }
            } catch (error: any) {
                Alert.alert('Error', error.message);
            }
        };

        fetchAccom();
        fetchBookings();
    }, []);

    useEffect(() => {
        const channel = async () => {
            const { data } = await supabase.from('seats_selections').select('*').eq('trip_id', id);
            const selectedSeats = data?.map((d: any) => d.seat_number);
            setSeatSelectionChannel(selectedSeats || []);

            const listen = supabase.channel('custom-insert-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'seats_selections' }, (payload) => {
                if (payload.eventType == 'INSERT') {
                    const newData: any = payload.new;
                    const { seat_number, trip_id } = newData;
                    setSeatSelectionChannel(prev => trip_id == id ? [...prev, seat_number] : prev);
                }

                if (payload.eventType == 'DELETE') {
                    const oldData: any = payload.old;
                    const { seat_number, trip_id } = oldData;
                    setSeatSelectionChannel(prev => trip_id == id ? prev.filter((seat) => seat != seat_number) : prev);
                }
            });

            listen.subscribe();
            return listen;
        };

        let channelInstance: any;
        channel().then(ch => (channelInstance = ch));

        return () => {
            channelInstance?.unsubscribe();
        };
    }, [id]);

    const passengerSeats = useMemo(() => new Set(passengers.map((p) => p.seatNumber)), [passengers]);
    const TouristAccoms = useMemo(() => accommodations?.find((accom) => accom?.name == 'Tourist'), [accommodations]);
    const BClassAccomms = useMemo(() => accommodations?.find((accom) => bClassNames.includes(accom?.name)), [accommodations]);
    const seatChannel = useMemo(() => new Set(seatSelectionChannel), [seatSelectionChannel]);

    return (
        <View style={{ width: '100%', height: height + 290, backgroundColor: '#FAFAFA', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={23} skipPattern={true} bookedSeats={bookedSeats} skip={2} count={3} letter='BC' onSeatSelect={assignseat} type={BClassAccomms?.name} accomm_id={BClassAccomms?.id} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} skip={3} count={2} start={4} limit={25} bookedSeats={bookedSeats} skipPattern={true} letter='BC' onSeatSelect={assignseat} type={BClassAccomms?.name} accomm_id={BClassAccomms?.id} />
                </View>
            </View>

            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a', marginTop: 30 }}>TOURIST CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                <View style={{ width: '25%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={2} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={22} letter='A' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
                <View style={{ width: '50%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={3} limit={6} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={40} letter='B' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={7} limit={8} letter='P' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={22} letter='C' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 3, alignSelf: 'center' }}>
                <View style={{ width: '60%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={15} letter='D' bookedSeats={bookedSeats} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
            </View>
        </View>
    );
};

export default React.memo(L2Vessel);
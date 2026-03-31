import React from 'react';
import { Text, View } from 'react-native';
import { SeatPlan } from './L2Vessel';


type L2TouristSeatPlanProps = {
    passengerSeats: Set<number | string>;
    seatChannel: Set<string>;
    bookedSeats: any[];
    assignseat: (seat: number | string, type: string, accomm_id: number) => void;
    TouristAccoms?: { 
        id: number; name?: 
        string 
    };
    isDisabled?: boolean;
    seatAvailability?: (hasAvailable: boolean) => void;
}


const L2TouristSeatPlan = ({ passengerSeats, seatChannel, bookedSeats, assignseat, TouristAccoms }: L2TouristSeatPlanProps) => {
    return (
        <View>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a', marginTop: 30 }}>TOURIST CLASS</Text>
                <View style={{ marginTop: 15, flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                    <View style={{ width: '25%' }}>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={2} letter='P' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={22} letter='A' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                    <View style={{ width: '50%' }}>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={3} limit={6} letter='P' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={40} letter='B' bookedSeats={bookedSeats}
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                    <View style={{ width: '25%' }}>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={7} limit={8} letter='P' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={22} letter='C' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row', gap: 3, alignSelf: 'center' }}>
                    <View style={{ width: '60%' }}>
                        <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={15} letter='D' bookedSeats={bookedSeats} 
                            onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                    </View>
                </View>
        </View>
    )
}

export default React.memo(L2TouristSeatPlan)
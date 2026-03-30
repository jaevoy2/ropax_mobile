import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { SeatPlan } from './srVessel';


const { height, width } = Dimensions.get('window');

type SrTouristSeatPlanProps = {
    passengerSeats: Set<number | string>;
    seatChannel: Set<string>;
    bookedSeats: any[];
    assignseat: (seat: number | string, type: string, accomm_id: number) => void;
    TouristAccoms?: { 
        id: number; name?: 
        string 
    };
    isDisabled?: boolean;
}


const SrToursitSeatPlan = ({ passengerSeats, seatChannel, bookedSeats, assignseat, TouristAccoms, isDisabled }: SrTouristSeatPlanProps) => {
    return (
        <View pointerEvents={isDisabled ? 'none' : 'auto'} style={{ marginTop: 25, paddingHorizontal: 4, width: width - 20, opacity: isDisabled ? 0.3 : 1 }}>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>TOURIST CLASS</Text>
            <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                <View style={{ flexDirection: 'column', width: '46%', alignItems: 'center',  }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={52} bookedSeats={bookedSeats}
                        skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
                <View style={{  width: '46%', alignItems: 'center', }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={5} limit={56} bookedSeats={bookedSeats}
                        skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, justifyContent: 'space-between', width: '100%' }}>
                <View style={{ width: '46%' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={57} limit={108} bookedSeats={bookedSeats}
                        skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
                <View style={{ width: '46%' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>Senior/PWD</Text>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={61} limit={112} bookedSeats={bookedSeats}
                        skipPattern={true} onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
            </View>
            <View style={{ marginTop: 20, flexDirection: 'row', gap: 10, justifyContent: 'center',}}>
                <View style={{ width: '60%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={113} limit={134} bookedSeats={bookedSeats}
                        onSeatSelect={assignseat} type={TouristAccoms?.name} accomm_id={TouristAccoms?.id} />
                </View>
            </View>
        </View>
    )
}


export default React.memo(SrToursitSeatPlan)
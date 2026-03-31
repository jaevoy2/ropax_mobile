import React from "react";
import { Text, View } from "react-native";
import { SeatPlan } from "./L2Vessel";



type L2BClassSeatPlanProps = {
    passengerSeats: Set<number | string>;
    seatChannel: Set<string>;
    bookedSeats: any[];
    assignseat: (seat: number | string, type: string, accomm_id: number) => void;
    BClassAccomms?: { 
        id: number; name?: 
        string 
    };
    isDisabled?: boolean;
    seatAvailability?: (hasAvailable: boolean) => void;
}

const L2BClassSeatPlan = ({ passengerSeats, seatChannel, bookedSeats, assignseat, BClassAccomms }: L2BClassSeatPlanProps) => {
    return (
        <View>
            <Text style={{ textAlign: 'center', fontWeight: '900', letterSpacing: 1, fontSize: 16, color: '#cf2a3a' }}>BUSINESS CLASS</Text>
            <View style={{ marginTop: 15, flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                <View style={{ width: '40%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} start={1} limit={23} skipPattern={true} bookedSeats={bookedSeats} 
                        skip={2} count={3} letter='BC' onSeatSelect={assignseat} type={BClassAccomms?.name} accomm_id={BClassAccomms?.id} />
                </View>
                <View style={{ width: '25%' }}>
                    <SeatPlan passengerSeats={passengerSeats} seatChannel={seatChannel} skip={3} count={2} start={4} limit={25} bookedSeats={bookedSeats}
                        skipPattern={true} letter='BC' onSeatSelect={assignseat} type={BClassAccomms?.name} accomm_id={BClassAccomms?.id} />
                </View>
            </View>
        </View>
    )
}

export default React.memo(L2BClassSeatPlan)
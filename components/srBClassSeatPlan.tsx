import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BookedSeat } from './srVessel';


const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];


type SrBClassSeatPlanProps = {
    passengerSeats: Set<number | string>;
    seatChannel: Set<string>;
    bookedSeatMap: Record<number | string, BookedSeat> 
    assignseat: (seat: number | string, type: string, accomm_id: number) => void;
    BClassAccomms?: {
        id: number; 
        name?: string
    };
    isDisabled?: boolean;
}


const SRBClassSeatPlan = ({ passengerSeats, seatChannel, bookedSeatMap, assignseat, BClassAccomms, isDisabled }: SrBClassSeatPlanProps) => {
    return (
        <View pointerEvents={isDisabled ? 'none' : 'auto'} style={{ opacity: isDisabled ? 0.3 : 1 }}>
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
                            onPress={() => assignseat(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
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
                            onPress={() => assignseat(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
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
                            onPress={() => assignseat(seat, BClassAccomms?.name, BClassAccomms?.id)} key={seat} 
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
        </View>
    );
}


export default React.memo(SRBClassSeatPlan)
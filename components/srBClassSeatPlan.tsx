import React, { useEffect, useMemo } from 'react';
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { BookedSeat } from './srVessel';

const seatColumn1 = ['A', 'B', 'E', 'F', 'I', 'J'];
const seatColumn2 = ['K', 'L'];
const seatColumn3 = ['C', 'D', 'G', 'H', 'M', 'N'];

type SrBClassSeatPlanProps = {
    passengerSeats: Set<number | string>;
    seatChannel: Set<string>;
    bookedSeatMap: Record<number | string, BookedSeat>;
    assignseat: (seat: number | string, type: string, accomm_id: number) => void;
    BClassAccomms?: { id: number; name?: string };
    isDisabled?: boolean;
    seatAvailability?: (hasAvailable: boolean) => void;
}

const allSeats = [...seatColumn1, ...seatColumn2, ...seatColumn3];

const SRBClassSeatPlan = ({ passengerSeats, seatChannel, bookedSeatMap, assignseat, BClassAccomms, isDisabled, seatAvailability }: SrBClassSeatPlanProps) => {
    const { width } = useWindowDimensions();


    const isTablet = width >= 600;
    // Column container width scales with screen
    const columnWidth = isTablet ? 120 : 90;
    // Seat button size: 35% of columnWidth minus gap, kept as fixed px for consistency
    const seatSize = Math.floor(columnWidth * 0.40);
    const labelFontSize = isTablet ? 15 : 12;
    const titleFontSize = isTablet ? 18 : 16;

    const hasSeatAvailable = useMemo(() => {
        return allSeats.some(seat => {
            const booked = bookedSeatMap[seat];
            const isPassenger = passengerSeats.has(seat);
            const inChannel = seatChannel?.has(String(seat)) ?? false;
            return !booked && !isPassenger && !inChannel;
        });
    }, [bookedSeatMap, passengerSeats, seatChannel]);

    useEffect(() => {
        seatAvailability?.(hasSeatAvailable);
    }, [hasSeatAvailable]);

    const renderSeat = (
        seat: string,
        bgColor: string,
    ) => {
        const booked = bookedSeatMap[seat];
        const isPassenger = passengerSeats.has(seat);
        const inChannel = seatChannel?.has(String(seat)) ?? false;

        return (
            <TouchableOpacity
                key={seat}
                disabled={!!booked || isPassenger || inChannel}
                onPress={() => assignseat(seat, BClassAccomms?.name, BClassAccomms?.id)}
                style={{
                    paddingVertical: isTablet ? 6 : 4,
                    width: seatSize,
                    height: seatSize,
                    justifyContent: 'center',
                    borderColor: '#A9A9B2',
                    borderWidth: 1,
                    borderRadius: 3,
                    backgroundColor: booked ? booked?.station?.color
                        : isPassenger ? '#BA68C8'
                        : inChannel ? '#e6d1e9ff'
                        : bgColor,
                }}
            >
                <Text style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: isTablet ? 14 : 12,
                    color: booked || isPassenger || inChannel ? '#fff' : '#000',
                }}>
                    {booked?.passTypeCode ?? seat}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View pointerEvents={isDisabled ? 'none' : 'auto'} style={{ opacity: isDisabled ? 0.3 : 1 }}>
            <Text style={{
                textAlign: 'center',
                fontWeight: '900',
                letterSpacing: 1,
                fontSize: titleFontSize,
                color: '#cf2a3a',
            }}>
                BUSINESS CLASS
            </Text>

            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 10,
                width: '80%',
                alignSelf: 'center',
            }}>
                {/* Column 1 */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: columnWidth, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: labelFontSize, marginBottom: 4, width: '100%' }}>Senior/PWD</Text>
                    {seatColumn1.map(seat => renderSeat(
                        seat,
                        seat === 'A' || seat === 'B' ? '#E6E2C6' : 'transparent'
                    ))}
                </View>

                {/* Column 2 */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: columnWidth, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: labelFontSize, marginBottom: 4, width: '100%' }}>Senior/PWD</Text>
                    {seatColumn2.map(seat => renderSeat(seat, '#E6E2C6'))}
                </View>

                {/* Column 3 */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: columnWidth, gap: 4, justifyContent: 'center' }}>
                    <Text style={{ fontWeight: 'bold', textAlign: 'center', fontSize: labelFontSize, marginBottom: 4, width: '100%' }}>Senior/PWD</Text>
                    {seatColumn3.map(seat => renderSeat(
                        seat,
                        seat === 'C' || seat === 'D' ? '#E6E2C6' : 'transparent'
                    ))}
                </View>
            </View>
        </View>
    );
};

export default React.memo(SRBClassSeatPlan);
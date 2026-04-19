import { CancelPaxBooking } from '@/api/cancel';
import { PaxInfo } from '@/app/bookingInfo';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';


const CancelBooking = ({ cancelModal, setCancelModal, paxInfo, setPaxInfo, percents, bookingId }: 
        { cancelModal: boolean;
        setCancelModal: React.Dispatch<React.SetStateAction<boolean>>; 
        paxInfo: PaxInfo[];
        setPaxInfo: React.Dispatch<React.SetStateAction<PaxInfo[]>> 
        percents,
        bookingId,
    }) => {

    const [selectAll, setSelectAll] = useState(false);
    const [totalFare, setTotalFare] = useState(0);
    const [percent, setPercent] = useState(Number);
    const [charge, setCharge] = useState(Number)
    const [refundAmnt, setRefundAmnt] = useState(Number);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isByMamangement, setIsByManagement] = useState(false);


    const forCancel = useMemo(() => {
        return paxInfo.filter(p => p.forCancel == true && p.passenger_type != 'Infant')
    },[paxInfo])

    const handleChargeComputation = () => {
        let fee: any;

        if(isByMamangement == true) {
            fee = 0;
            setPercent(fee);
        }else {
            if(paxInfo[0].tripStatus.toLowerCase() != 'Departed') {
                fee = percents.find(p => p.situation.toLowerCase() == 'pre-departure').feePercentage
                setPercent(fee);
            }else {
                fee = percents.find(p => p.situation.toLowerCase() == 'post-departure').feePercentage
                setPercent(fee);
            }
        }

        
        const chargeAmnt = (fee / 100) * totalFare
        setCharge(chargeAmnt);
        setRefundAmnt(totalFare - chargeAmnt)
    }


    const handleSelectAll = () => {
        setSelectAll(!selectAll);

        setPaxInfo(prev => (
            prev.map(p => ({ ...p, forCancel: !selectAll }))
        ))
    }


    const handleCancelPax = (paxId: number) => {
        setPaxInfo(prev => (
            prev.map(p => p.id == paxId ? ({ ...p, forCancel: !p.forCancel }) : p)
        ))
    }

    useEffect(() => {
        const paxToCancel = paxInfo.filter(p => p.forCancel == true);
        
        if(paxToCancel.length > 1) {
            const total = paxToCancel.reduce((sum, passenger) => sum + Number(passenger?.fare), 0);
            setTotalFare(total);
        }

        const tripTotalFare = paxInfo.reduce((sum, passenger) => sum + Number(passenger?.fare), 0);
        setTotalFare(tripTotalFare)

        handleChargeComputation();
        const notForCancel = paxInfo.some(p => p.forCancel != true);
        setSelectAll(!notForCancel);
    }, [paxInfo, isByMamangement]);



    const handleSubmitCancellation = async () => {
        setSubmitLoading(true);

        if(!cancelReason.trim()) {
            setSubmitLoading(false)
            return Alert.alert('Invalid', 'Reason is required.');
        }

        if(forCancel.length < 1 && isByMamangement == false) {
            setSubmitLoading(false)
            return Alert.alert('Invalid', 'No passengers selected for cancellation.');   
        }

        try {
            const toCancelIDs = [];
            const paxToCancel = paxInfo.filter(p => p.forCancel == true);

            paxToCancel.forEach(pax => {
                toCancelIDs.push(pax.id)
            });

            const response = await CancelPaxBooking(bookingId, cancelReason, charge, refundAmnt, paxInfo[0].departureDate, paxInfo[0].tripId, selectAll, toCancelIDs, isByMamangement);

            if(!response.error) {
                Alert.alert('Success', 'Cancellation Success', [{
                    text: 'ok',
                    onPress: () => { setCancelModal(false), router.back() },
                }])
            }
        }catch(error: any) {
            Alert.alert('Error', error.message);
        }finally{
            setSubmitLoading(false)
        }
    }


    return (
        <View>
            <Modal transparent animationType={'fade'} visible={cancelModal}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ width: '92%', backgroundColor: '#fff', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10, paddingHorizontal: 20, paddingVertical: 15, borderBottomColor: '#dadada', borderBottomWidth: 1 }}>Booking Cancellation</Text>
                        <View style={{ paddingHorizontal: 20, }}>

                            <View style={{ borderColor: '#dadada', borderWidth: 1, borderRadius: 5, marginTop: 5 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#dadada', padding: 8 }}>Breakdown</Text>
                                <View style={{ paddingVertical: 5, paddingHorizontal: 10, gap: 5 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 14 }}>Booking Amount:</Text>
                                        <Text style={{ fontSize: 16, fontWeight: '600' }}>₱ {totalFare.toFixed(2)}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={{ fontSize: 14 }}>Charge:</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Text style={{ fontSize: 14, opacity: 0.6, fontWeight: '600', color: '#cf2a3a' }}>{`(${percent}%)`}</Text>
                                            <Text style={{ fontSize: 16, fontWeight: '700' }}>₱ {charge.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#cf2a3b27', padding: 10, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#cf2a3a' }}>Refund Amount:</Text>
                                    <Text style={{ fontSize: 18, fontWeight: '900', color: '#cf2a3a' }}>₱ {refundAmnt.toFixed(2)}</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 30 }}>
                                <Text style={{ fontWeight: '600', marginBottom: 5 }}>Reason of Cancellation</Text>
                                <View style={{ borderColor: '#dadada', borderWidth: 1, borderRadius: 5 }}>
                                    <TextInput value={cancelReason ?? 'e.g Emergency'} onChangeText={(text) => setCancelReason(text)} style={{ fontSize: 16 }} />
                                </View>
                            </View>

                            <View style={{ marginTop: 10 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <Text style={{ fontWeight: '600', marginBottom: 5, fontSize: 14 }}>Passenger/s</Text>
                                    <TouchableOpacity onPress={() => handleSelectAll()} style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}>
                                        <Checkbox status={selectAll ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                        <Text style={{ color: selectAll ? '#cf2a3a' : '#999', fontSize: 14 }}>Select All</Text>
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={{ height: 140 }}>
                                    <ScrollView style={{ flex: 1, borderWidth: 1, borderColor: '#dadada', borderRadius: 8, paddingHorizontal: 5, width: '100%' }}>
                                        {paxInfo.map((p: any) => (
                                            <TouchableOpacity key={p.id} onPress={() => handleCancelPax(p.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Checkbox status={p.forCancel == true ? 'checked' : 'unchecked'} color='#cf2a3a' uncheckedColor="#999" />
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '85%' }}>
                                                    <Text style={{ color: p.forCancel == true ? '#cf2a3a' : '#999', fontSize: 16, width: '75%' }}>{`${p.first_name} ${p.last_name}`}</Text>
                                                    <Text style={{ color: p.forCancel == true ? '#cf2a3a' : '#999', fontSize: 16 }}>{`(${p.passenger_type})`}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {paxInfo[0].tripStatus.toLowerCase() != 'departed' && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 15 }}>
                                        <Switch 
                                            value={isByMamangement}
                                            thumbColor={isByMamangement ? '#cf2a3a' : '#bebebe'}
                                            trackColor={{ false: '#e4e4e4', true: '#cf2a3a80' }}
                                            onValueChange={() => {handleSelectAll(), setIsByManagement(!isByMamangement)}}
                                        />
                                        <Text style={{ fontSize: 16, color: isByMamangement ? '#cf2a3a' : '#999' }}>By Management</Text>
                                    </View>
                                )}
                            </View>

                            <View style={{ paddingBottom: 20 }}>
                                <TouchableOpacity disabled={
                                    (forCancel.length < 1 || 
                                        cancelReason == '' || 
                                        submitLoading) &&
                                        isByMamangement == false
                                    } 
                                    onPress={() => handleSubmitCancellation()} 
                                    style={{ marginTop: 30, padding: 10, backgroundColor: '#CF2A3A', borderRadius: 5, 
                                    opacity: (forCancel.length == 0 || 
                                        cancelReason == '') &&
                                        isByMamangement == false ? 0.5 : 1 
                                }}>
                                    {submitLoading == true ? (
                                        <ActivityIndicator size={'small'} color={'#fff'} style={{ alignSelf: 'center' }} />
                                    ) : (
                                        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Submit</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setCancelModal(false)} style={{ marginTop: 10, alignSelf: 'center' }}>
                                    <Text style={{ color: '#4e4e4e', textAlign: 'center' }}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}   


export default React.memo(CancelBooking)
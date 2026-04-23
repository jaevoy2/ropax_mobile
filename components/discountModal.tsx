import { usePassengers } from '@/context/passenger';
import { useTrip } from '@/context/trip';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { SetStateAction, useState } from 'react';
import {
    ActivityIndicator, Keyboard,
    Modal, StyleSheet,
    Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const DiscountModal = ({ discountModal, setDiscountModal, discounts }: {
    discounts,
    discountModal: boolean;
    setDiscountModal: React.Dispatch<SetStateAction<boolean>>;
}) => {
    const { passengers, updatePassenger } = usePassengers();
    const { totalFare, setDiscountId, setIsDiscounted, setCouponCode, setDiscountType, setDiscountValue, setTotalFare } = useTrip();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleApply = () => {
        if (!code.trim()) {
            setError('Please enter a coupon code.');
            return;
        }

        setError('');
        setLoading(true);

        setTimeout(() => {
            setLoading(false);

            const discount = discounts.find(
                (d) => d.discount_code === code.toUpperCase()
            );

            if (!discount) {
                setError('Invalid coupon code.');
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            if (discount.expiry_date < today) {
                setError('This coupon has already expired.');
                return;
            }

            const qualifyingPassengers = passengers.filter((pax) =>
                discount.passenger_types.some(
                    (pt) => pt.id === pax.passType_id
                )
            );

            if (qualifyingPassengers.length === 0) {
                setError('No passengers qualify for this coupon.');
                return;
            }

            if (discount.is_one_time_per_passenger) {
                const alreadyUsed = qualifyingPassengers.some((pax) =>
                    discount.redemptions.some(
                        (r) => r.passenger_id === pax.pax_id
                    )
                );

                if (alreadyUsed) {
                    setError('One or more passengers have already used this coupon.');
                    return;
                }
            }

            let computedDiscount = 0;

            if (discount.scope === 'booking_total') {
                if (discount.discount_type === 'fixed') {
                    computedDiscount = Number(discount.fixed_amount);
                } else {
                    computedDiscount = (totalFare * discount.percent) / 100;
                }

                computedDiscount = Math.min(computedDiscount, totalFare);
                setTotalFare(Number(Math.max(0, totalFare - computedDiscount).toFixed(2)))

            } else if (discount.scope === 'passenger_fare') {
                const qualifyingTotal = qualifyingPassengers.reduce(
                    (sum, pax) => sum + Number(pax.fare ?? 0), 0
                );

                if (discount.discount_type === 'fixed') {
                    qualifyingPassengers.forEach(p => {
                        const newFare = Number(p.fare ?? 0) - Number(discount.fixed_amount);
                        updatePassenger(p.id, 'fare', Number(Math.max(0, newFare).toFixed(2)));
                    });
                    computedDiscount = qualifyingPassengers.reduce((sum, p) => {
                        const deducted = Math.min(Number(p.fare ?? 0), Number(discount.fixed_amount));
                        return sum + deducted;
                    }, 0);
                } else {
                    computedDiscount = (qualifyingTotal * discount.percent) / 100;
                    qualifyingPassengers.forEach(pax => {
                        const paxDiscount = (Number(pax.fare ?? 0) * discount.percent) / 100;
                        const newFare = Number(pax.fare ?? 0) - paxDiscount;
                        updatePassenger(pax.id, 'fare', Number(Math.max(0, newFare).toFixed(2)));
                    });
                }

                computedDiscount = Math.min(computedDiscount, totalFare);
                setTotalFare(Number(Math.max(0, totalFare - computedDiscount).toFixed(2)));
            }

            setDiscountId(discount.id)
            setDiscountType(discount.discount_type);
            setDiscountValue(computedDiscount);
            setIsDiscounted(true);
            setCouponCode(code);
            setSuccess(true);
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setCode('');
        setError('');
        setSuccess(false);
        setLoading(false);
        setDiscountModal(false);
    };

    return (
        <Modal transparent animationType="fade" visible={discountModal}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.backdrop}>
                    <View style={styles.card}>
                        <View style={styles.header}>
                            <View style={styles.tagIconWrap}>
                                <MaterialCommunityIcons name={'tag-multiple'} color={'#cf2a3a'}  size={25}/>
                            </View>
                            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.title}>Apply Coupon</Text>
                        <Text style={styles.subtitle}>
                            Enter your discount code below to apply a discount to this booking.
                        </Text>

                        {!success && (
                            <>
                                <Text style={styles.label}>Coupon Code</Text>
                                <View style={[styles.inputWrap, error ? styles.inputError : null]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. SUMMER20"
                                        placeholderTextColor="#aab0bb"
                                        value={code}
                                        onChangeText={(t) => {
                                            setCode(t.toUpperCase());
                                            setError('');
                                        }}
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        editable={!loading}
                                    />
                                </View>
                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={handleClose}
                                        disabled={loading}
                                    >
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.applyBtn, loading && styles.applyBtnDisabled]}
                                        onPress={handleApply}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.applyText}>Apply</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const BLUE = '#2563EB';
const RED_LIGHT = '#eb4b5b10';
const GREEN = '#16A34A';
const GREEN_LIGHT = '#F0FDF4';
const RED = '#cf2a3a';
const BORDER = '#E5E9F0';
const TEXT = '#111827';
const MUTED = '#6B7280';

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.45)',
        paddingHorizontal: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    tagIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: RED_LIGHT,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagIcon: { fontSize: 20 },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: { color: MUTED, fontSize: 13, fontWeight: '600' },

    title: {
        fontSize: 20,
        fontWeight: '700',
        color: TEXT,
        marginBottom: 4,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        color: MUTED,
        lineHeight: 19,
        marginBottom: 20
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: TEXT,
        marginBottom: 8,
    },
    inputWrap: {
        borderWidth: 1.5,
        borderColor: BORDER,
        borderRadius: 10,
        backgroundColor: '#FAFAFA',
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 6,
    },
    inputError: {
        borderColor: RED,
        backgroundColor: '#FFF5F5',
    },
    input: {
        fontSize: 16,
        color: TEXT,
        fontWeight: '600',
        letterSpacing: 1.5,
        padding: 0,
    },
    errorText: {
        fontSize: 12,
        color: RED,
        marginBottom: 4,
        marginLeft: 2,
    },

    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: BORDER,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: MUTED,
    },
    applyBtn: {
        flex: 2,
        paddingVertical: 13,
        borderRadius: 10,
        backgroundColor:  RED,
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyBtnDisabled: {
        opacity: 0.7,
    },
    applyText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },

    successWrap: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    successIcon: {
        fontSize: 24,
        color: GREEN,
        fontWeight: '700',
    },
});

export default React.memo(DiscountModal);
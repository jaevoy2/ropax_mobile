import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Modal, Text, View } from 'react-native';

const { height } = Dimensions.get('window')

export default function PreLoader({ loading }: { loading: boolean }) {
    const motionAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if(loading == true) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(motionAnim, {
                        toValue: -8,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true
                    }),
                    Animated.timing(motionAnim, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true
                    }),
                ])
            ).start()
        }
    }, [loading])


    return (
        <Modal visible={loading} transparent animationType="fade">
            <View style={{ backgroundColor: '#00000048', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ height: height / 5.5, width: '55%', backgroundColor: '#fff', borderRadius: 10, justifyContent :'center', alignItems: 'center', gap: 8 }}>
                    <Animated.View style={{ transform: [{ translateY: motionAnim }] }}>
                        <Ionicons name={'boat'} size={34} color={'#cf2a3a'} />
                    </Animated.View>
                    <Text style={{ color: '#cf2a3a' }}>Loading..</Text>
                </View>
            </View> 
        </Modal>
    );
}
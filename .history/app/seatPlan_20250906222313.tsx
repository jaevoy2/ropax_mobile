import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, View } from "react-native";

const { width, height } = Dimensions.get('window');

export default function SeatPlan() {
    return (
        <View style={{ height: '100%' }}>
            <LinearGradient
                colors={[
                    'rgba(214, 48, 65, 1)',
                    'rgba(228, 80, 80, 0.8)',
                    'rgba(228, 80, 80, 0.28)', 
                    'rgba(253, 0, 0, 0.08)',
            ]} style={{ zIndex: -1, height: '100%', width: width }} />
            

            <View style={{  position: 'relative', zIndex: 3 }}>
                <Ionicons name={'chevron-back'} size={25} color={'#fff'} />
                
            </View>

        </View>

    )
}
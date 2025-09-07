import { Dimensions, Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

const { width, height } = Dimensions.get('screen');

export default function SRVesselSeats () {

    return (
        <View style={{ width: 325, height: height + 220, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, fontSize: 16 }}>BUSINESS CLASS</Text>
        </View>
    )
}

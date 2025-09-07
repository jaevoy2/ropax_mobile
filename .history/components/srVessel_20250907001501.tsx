import { Dimensions, Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

const { width, height } = Dimensions.get('screen');

export default function SRVesselSeats () {

    return (
        <View style={{ width: 325, height: '100%', backgroundColor: '#fff', marginTop: 20, padding: 10, borderRadius: 30 }}>
            <Text style={{ textAlign: 'center' }}>BUSINESS CLASS</Text>
        </View>
    )
}

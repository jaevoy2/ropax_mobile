import { Dimensions, Text, View } from "react-native";


type SRVesselProps = {
    seat: number | string;
}

const { width, height } = Dimensions.get('screen');

export default function SRVesselSeats () {

    return (
        <View style={{ width: width, backgroundColor: '#fff', marginTop: 20 }}>
            <Text style={{ textAlign: 'center' }}>BUSINESS CLASS</Text>
        </View>
    )
}

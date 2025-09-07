import { Dimensions, Text, View } from "react-native";


type SRVesselProps = {
    start: number;
    end: number;
    columns: number;
    skipPattern: number;
}

const bclass = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

const { width, height } = Dimensions.get('screen');

const Seat = ({ skipPattern, start, end, columns }: SRVesselProps) =>  {
    const seats = [];

    for(let i = start; i < end; i++ ) {
        for(let j = 1; j <= columns; j++) {
            seats.push(i);
            i += 1
        }
    }

    return seats;

}


export default function SRVesselSeats () {

    return (
        <View style={{ width: 325, height: height + 220, backgroundColor: '#fff', marginTop: 20, paddingTop: 10, borderRadius: 50 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', letterSpacing: 1, fontSize: 16 }}>BUSINESS CLASS</Text>

            <View>
                <View>
                    <Seat skipPattern={2} start={0} end={13} columns={2} />
                </View>
            </View>
        </View>
    )
}

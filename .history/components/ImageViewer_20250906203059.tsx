import { Image } from "expo-image";

type Props = {
    ImgSource: string;
}

export default function ImgViewer({ ImgSource}: Props) {
    return (
        <Image
            source={ImgSource}
            contentFit="contain"
            style={{ width: '100%', height: '100%' }}
        />
    )
}
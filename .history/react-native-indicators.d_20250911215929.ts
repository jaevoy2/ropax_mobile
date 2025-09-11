declare module "react-native-indicators" {
    import { Component } from "react";
    import { StyleProp, ViewStyle } from "react-native";

    interface IndicatorProps {
        animationDuration?: number;
        animating?: boolean;
        color?: string;
        count?: number;
        size?: number;
        style?: StyleProp<ViewStyle>;
    }

    
    export class BallIndicator extends Component<IndicatorProps> {}
    export class BarIndicator extends Component<IndicatorProps> {}
    export class DotIndicator extends Component<IndicatorProps> {}
    export class MaterialIndicator extends Component<IndicatorProps> {}
    export class PacmanIndicator extends Component<IndicatorProps> {}
    export class PulseIndicator extends Component<IndicatorProps> {}
    export class SkypeIndicator extends Component<IndicatorProps> {}
    export class UIActivityIndicator extends Component<IndicatorProps> {}
    export class WaveIndicator extends Component<IndicatorProps> {}

}
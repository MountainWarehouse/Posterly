import { Parcel } from '../models/Parcel';
import { Operator } from '../models/Operator';

const getConsignmentNo = ({ barcode, operator }: Parcel): string => {
    const unrecognized = '(Unrecognized barcode)';
    switch (operator) {
        case Operator.FedEx:
            return barcode.length === 33 ? barcode.substr(22, 12) : unrecognized;
        case Operator.TNT:
            return barcode.length === 28 ? barcode.substring(4, 9) : unrecognized;
        //TODO:
        // case Operator.Hermes:
        //     break;
        case Operator.Yodel:
            return barcode.length === 19 ? barcode.substr(1, 18) : unrecognized;
        case Operator.Royal:
        case Operator.RoyalMail:
            return barcode;
        default:
            return '';
    }
};

export default {
    getConsignmentNo
};

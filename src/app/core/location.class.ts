import { ILatLng } from './latLng.interface';

declare const L: any;

export class Location implements ILatLng {
    latitude: number;
    longitude: number;
    address: string;
    viewBounds: L.LatLngBounds;
}

/// <reference path="../core/GoogleGeocode.ts" />

declare const L: any;

import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Location, IIpResult, IFreegeoipResult } from '../core/index';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class GeocodingService {

    public constructor(private http: Http) { }

    public geocode(address: string): Observable<Location> {
        return this.http
            .get('http://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURIComponent(address))
            .map(res => <GoogleGeocode.GeocodeData>res.json())
            .map((data: GoogleGeocode.GeocodeData) => {
                if(data.status != 'OK') { throw new Error('unable to geocode address'); }

                let location = new Location();
				let result = data.results[0];
                location.address = result.formatted_address;
                location.latitude = result.geometry.location.lat;
                location.longitude = result.geometry.location.lng;

                let viewPort = result.geometry.viewport;
                location.viewBounds = new L.LatLngBounds(
					{ lat: viewPort.southwest.lat, lng: viewPort.southwest.lng },
					{ lat: viewPort.northeast.lat, lng: viewPort.northeast.lng }
				);

                return location;
            });
    }

    public getCurrentLocation(): Observable<Location> {
        return this.http
            .get('http://ipv4.myexternalip.com/json')
            .map(res => <IIpResult>res.json())
            .flatMap(res => this.http.get('http://freegeoip.net/json/' + res.ip))
            .map((res: Response) => <IFreegeoipResult>res.json())
            .map((result: IFreegeoipResult) => {
                let location = new Location();
                location.address = result.city + ', ' + result.region_code + ' ' +
								   result.zip_code + ', ' + result.country_code;
                location.latitude = result.latitude;
                location.longitude = result.longitude;
                return location;
            });
    }

}

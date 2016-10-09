declare const L: any;

import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { NavigatorComponent, MarkerComponent } from '../index';
import { MapService, GeocodingService } from '../../services/index';
import { Location } from '../../core/index';

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: [ 'app.component.css' ]
})
export class AppComponent implements OnInit, AfterViewInit {

    @ViewChild('markerComponent') markerComponent: MarkerComponent;
    @ViewChild('navigatorComponent') navigatorComponent: NavigatorComponent;

    constructor(private mapService: MapService, private geocoder: GeocodingService) { }

    ngOnInit() {
        let map = new L.Map('map', {
            zoomControl: false,
            center: new L.LatLng(0, 0), // new L.LatLng(31, 34),
            zoom: 12,
            minZoom: 4,
            maxZoom: 20,
            layers: [this.mapService.baseMaps.OpenStreetMap]
        });

        L.control.zoom({ position: 'topright' }).addTo(map);
        L.control.layers(this.mapService.baseMaps).addTo(map);
        L.control.scale().addTo(map);

        this.mapService.map = map;
        this.geocoder
			.getCurrentLocation()
            .subscribe(
				(loc: Location) => map.panTo([loc.latitude, loc.longitude]),
				err => console.error(err)
			);
    }

    ngAfterViewInit() {
        this.markerComponent.Initialize();
    }

}

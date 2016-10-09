declare const L: any;

import { Component, OnInit } from '@angular/core';
import { GeocodingService, MapService } from '../../services/index';
import { Location } from '../../core/index';

@Component({
    selector: 'navigator',
    templateUrl: 'navigator.component.html',
    styleUrls: [ 'navigator.component.css' ]
})
export class NavigatorComponent implements OnInit {

    public address: string;

    private map: L.Map;

    constructor(private geocoder: GeocodingService, private mapService: MapService) {
        this.address = '';
    }

    ngOnInit() {
        this.mapService.disableMouseEvent('goto');
        this.mapService.disableMouseEvent('place-input');
        this.map = this.mapService.map;
    }

    goto() {
        if (!this.address) { return; }

        this.geocoder
			.geocode(this.address)
			.subscribe(
				(location:Location) => {
					this.map.fitBounds(location.viewBounds, null);
					this.address = location.address;
				},
				error => console.error(error)
			);
	}

}

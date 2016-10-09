namespace GoogleGeocode {

	export interface AddressComponent {
		long_name: string;
		short_name: string;
		types: string[];
	}

	export interface Location {
		lat: number;
		lng: number;
	}

	export interface Viewport {
		northeast: Location;
		southwest: Location;
	}

	export interface Geometry {
		location: Location;
		location_type: string;
		viewport: Viewport;
	}

	export interface Result {
		address_components: AddressComponent[];
		formatted_address: string;
		geometry: Geometry;
		place_id: string;
		types: string[];
	}

	export interface GeocodeData {
		status: string;
		results: Result[];
	}

}

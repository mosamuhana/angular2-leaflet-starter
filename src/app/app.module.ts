import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent, NavigatorComponent, MarkerComponent } from './components/index';

import { MapService, GeocodingService } from './services/index';

@NgModule({
    imports: [
		BrowserModule,
		CommonModule,
		FormsModule,
		HttpModule
	],
    declarations: [
        AppComponent,
        NavigatorComponent,
        MarkerComponent
    ],
    bootstrap: [ AppComponent ],
	entryComponents: [AppComponent],
    providers: [
        MapService,
        GeocodingService
    ]
})
export class AppModule {}

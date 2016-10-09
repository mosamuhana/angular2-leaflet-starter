import 'reflect-metadata';
import * as path from 'path';
import * as chalk from 'chalk';

import * as rollup from 'rollup';
import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as tsr from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import { Observable } from 'rxjs';

const SRC = '../../src';
const DIST = '../../dist';

export class Builder {

	public cache: any;

	build(): Observable<any> {
		return this.buildMain().concat(this.buildVendor());
	}

	buildMain(): Observable<any> {
		return Observable.create(observer => {
			this.mainBuilder.subscribe(bundle => {
				this.cache = bundle;
				Observable.fromPromise(bundle.write({
					format: 'iife',
					dest: path.resolve(__dirname, DIST + '/main.js'),
					sourceMap: true,
					globals: {
						'@angular/core': 'vendor._angular_core',
						'@angular/common': 'vendor._angular_common',
						'@angular/platform-browser': 'vendor._angular_platformBrowser',
						'@angular/platform-browser-dynamic': 'vendor._angular_platformBrowserDynamic',
						'@angular/router': 'vendor._angular_router',
						'@angular/http': 'vendor._angular_http',
						'@angular/forms': 'vendor._angular_forms'
					}
				})).subscribe(resp => {
					observer.complete();
				});
			}, err => {
				observer.error(err);
				observer.complete();
			});
		});
	}

	buildVendor(): Observable<any> {
		return Observable.create(observer => {
			this.vendorBuilder.subscribe(bundle => {
				this.cache = bundle;
				Observable.fromPromise(bundle.write({
					format: 'iife',
					moduleName: 'vendor',
					dest: path.resolve(__dirname, DIST + '/vendor.js')
				})).subscribe(resp => {
					observer.complete();
				});
			}, err => {
				observer.error(err);
				observer.complete();
			});
		});
	}

	get mainBuilder(): Observable<any> {
		return Observable.fromPromise(rollup.rollup({
			entry: path.resolve(__dirname, SRC + '/main.ts'),
			cache: this.cache,
			context: 'this',
			plugins: [
				angular({
					exclude: '../../node_modules/**'
				}),
				tsr({
					typescript: require('../../node_modules/typescript')
				}),
				commonjs({
					include: 'node_modules/rxjs/**'
				}),
				nodeResolve({ jsnext: true, main: true, browser: true }),
				buble()
			],
			external: [
				'@angular/core',
				'@angular/common',
				'@angular/platform-browser-dynamic',
				'@angular/platform-browser',
				'@angular/forms',
				'@angular/http',
				'@angular/router',
			]
		}));
	};

	get vendorBuilder(): Observable<any> {
		return Observable.fromPromise(rollup.rollup({
			entry: path.resolve(__dirname, SRC + '/vendor.ts'),
			cache: this.cache,
			context: 'this',
			plugins: [
				angular({
					exclude: '../../node_modules/**'
				}),
				tsr({
					typescript: require('../../node_modules/typescript')
				}),
				commonjs({
					include: 'node_modules/rxjs/**'
				}),
				nodeResolve({ jsnext: true, main: true, browser: true }),
				buble()
			]
		}));
	}

}

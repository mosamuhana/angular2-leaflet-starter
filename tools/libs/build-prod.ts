import 'reflect-metadata';
import * as path from 'path';
import * as rollup from 'rollup';
import * as commonjs from 'rollup-plugin-commonjs';
import * as nodeResolve from 'rollup-plugin-node-resolve';
import * as angular from 'rollup-plugin-angular';
import * as tsr from 'rollup-plugin-typescript';
import * as buble from 'rollup-plugin-buble';
import * as uglify from 'rollup-plugin-uglify';
import { Observable } from 'rxjs';
import * as ts from 'typescript';
import * as tsc from '@angular/tsc-wrapped';
import { CodeGenerator } from '@angular/compiler-cli';

const SRC = '../../src';
const DIST = '../../dist';
const AOT_CONFIG = '../../tsconfig.aot.json';

export class Builder {

	public cache: any;

	build(): Observable<any> {
		return this.ngc().concat(this.runBuilder);
	}

	get runBuilder(): Observable<any> {
		return Observable.create(observer => {
			//let start: Date = new Date();
			this.builder.subscribe(bundle => {
				this.cache = bundle;
				Observable.fromPromise(bundle.write({
					format: 'iife',
					dest: path.resolve(__dirname, DIST + '/app.js'),
					sourceMap: true,
					moduleName: 'app'
				})).subscribe(resp => {
					//let time: number = new Date().getTime() - start.getTime();
					//observer.next(`Build time: ${time}ms`);
					observer.complete();
				});
			}, err => {
				observer.error(err);
				observer.complete();
			});
		});
	}

	get builder(): Observable<any> {
		return Observable.fromPromise(rollup.rollup({
			entry: path.resolve(__dirname, SRC + '/main.aot.ts'),
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
				buble({
					exclude: '../../node_modules/**'
				}),
				uglify()
			]
		}));
	};

	private codegen(ngOptions: tsc.AngularCompilerOptions, cliOptions: tsc.NgcCliOptions, program: ts.Program, host: ts.CompilerHost) {
		return CodeGenerator.create(ngOptions, cliOptions, program, host).codegen();
	}

	private ngc(): Observable<any> {
		let start: Date = new Date();
		const cliOptions = new tsc.NgcCliOptions({});
		return Observable.fromPromise(
			tsc.main(path.resolve(__dirname, AOT_CONFIG), cliOptions, this.codegen)
				.then(() => {
					let time: number = new Date().getTime() - start.getTime();
					return `AoT Build Time: ${time}ms`;
				})
		);
	}

}

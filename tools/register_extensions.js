'use strict';

const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const chalk = require('chalk');

require.extensions['.ts'] = function (m, filename) {
	const source = fs.readFileSync(filename).toString();
	try {
		const result = ts.transpile(source, {
			target: ts.ScriptTarget.ES5,
			module: ts.ModuleKind.CommonJs
		});
		return m._compile(result, filename);
	} catch (err) {
		throw err;
	}
};

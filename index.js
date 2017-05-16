const commander = require('commander');
const prompt = require('prompt');

const schema = require('./conf/prompt.conf');
const optionsConf = require('./conf/options.conf');
const exporter = require('./exporter');

commander.version('0.1.0');

Object.keys(optionsConf).forEach((key) => {
  commander.option(optionsConf[key].arg + ' --' + key + (optionsConf[key].type ? ' [' + optionsConf[key].type + ']' : ''), optionsConf[key].description, optionsConf[key].callback || function(x) { return x; });
});

commander.parse(process.argv);

prompt.override = commander;
prompt.start();

prompt.get(schema, function (err, options) {
	if (err) {
		console.log('Export aborted.');
		process.exit(0);
	}

	exporter.run(options);
});

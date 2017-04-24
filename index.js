const commander = require('commander');
const exporter = require('./exporter');

commander
  .version('0.1.0')
  .option('-h, --host [string]', 'Choose MySQL host')
  .option('-P, --port [integer]', 'Choose MySQL port')
  .option('-d, --database [string]', 'Choose MySQL database')
  .option('-u, --user [string]', 'Choose MySQL user')
  .option('-p, --password [string]', 'Choose MySQL password')
  .option('-t, --table [string]', 'Choose table')
  .option('-o, --outputFilename [string]', 'Choose output filename')
  .option('-T, --outputType [string]', 'Choose output type', (t) => {
		return (['csv', 'zip', 'term'].indexOf(t) !== -1) ? t : 'term';
	})
  .option('-e, --encrypt', 'Choose if zip file should be encrypted')
  .option('-c, --columns [string]', 'Choose columns', (c) => { return c.split(' '); })
  .option('-l, --limit [integer]', 'Set export limit')
  .option('-s, --silent', 'Hide progressbar')
	.option('-q, --query [string]', 'SQL query or .sql file')
	.parse(process.argv);

const prompt = require('prompt');
const schema = require('./conf/prompt.conf');

prompt.override = commander;
prompt.start();

prompt.get(schema, function (err, options) {
	if (err) {
		console.log('Export aborted.');
		process.exit(0);
	}

	exporter.run(options);
});

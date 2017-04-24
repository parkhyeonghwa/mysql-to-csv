// Check if all params are there
const fs = require('fs');

const commander = require('commander');
const mysql = require('mysql');
const through = require('through');
const csvwriter = require('csvwriter');
const archiver = require('archiver');
const asciiProgress = require('ascii-progress');

module.exports = {
	init: function(options) {
		this.connection = null;

		this.outputType = options.outputType;
		this.outputFilename = options.outputFilename;
		this.isSilent = !!options.silent;

		this.host = options.host;
		this.port = options.port;
		this.database = options.database;
		this.user = options.user;
		this.password = options.password;

		this.columns = options.columns;
		this.replaceArgs = [];

		if (options.query.substr(-4) === '.sql') {
			if (!fs.existsSync(options.query)) {
					this.terminate(new Error(`File ${options.query} not found.`));
					return;
			}

			this.query = fs.readFileSync(options.query, 'utf8').split(';')[0];
		}
		else if (options.query === '') {
			this.query = `SELECT ${this.columns !== '*' ? '??' : '*'} FROM ?? ${options.limit > 0 ? 'LIMIT ' + options.limit : ''}`;

			if (this.columns !== '*') {
				this.replaceArgs.push(this.columns.split(','));
			}

			this.replaceArgs.push(options.table);
		}
		else {
			this.query = options.query.split(';')[0];
		}

		let args = {
			host: this.host,
			port: this.port,
			user: this.user,
			password: this.password,
			database: this.database
		};

		this.connection = mysql.createConnection(args);
	},
	run: function(options) {
		this.init(options);

		this.connection.connect(function(err) {
			if (err) {
				this.terminate(new Error(`Connection to ${this.user}@${this.host}:${this.port} - failed. ${err.message}`));
				return;
			}

			this.export();
		}.bind(this));
	},
	export: function() {
		let interval;
		let progress = 0;
		let firstLine = true;
		let archive;
		let dataRecieved = false;

		if (!this.isSilent && this.outputType !== 'term') {
			this.connection.query(`EXPLAIN ${this.query}`, this.replaceArgs, function(err, res) {
				if (err) {
					this.terminate(err);
					return;
				}

				let total = res[0].rows;
				let bar = new asciiProgress({ total, schema: " [:bar.gradient(#FFDC00,#39CCCC)] :current/:total :percent :elapseds :etas" });
				interval = setInterval(() => {
					bar.update(Math.min(total, progress) / total);
				}, 300);
			}.bind(this));
		}

		const outputStream = this.outputType === 'term' ? process.stdout : fs.createWriteStream(`./output/${this.outputFilename}.${this.outputType}`);

		// Query DB and return CSV stream
		const queryCSVStream = this.connection.query(this.query, this.replaceArgs)
			.on('error', function (err) {
				this.terminate(err);
			}.bind(this))
			.stream()
			.pipe(through(function (data) {
				progress += 1;

				return csvwriter(data, { quoteMode: 2, header: firstLine }, function(err, csv) {
					firstLine = false;
					this.queue(csv);
				}.bind(this));
			}, function end() {
				clearInterval(interval);
				this.emit('end');

				if (outputStream === process.stdout) {
					process.exit(0);
				}
			}));

			if (this.outputType === 'zip') {
				// Create a file to stream archive data to.
				archive = archiver('zip', {
					zlib: { level: 9 }
				});

				archive.on('error', function(err) {
					throw err;
				});

				// pipe archive data to the file
				archive.pipe(outputStream);
				archive.append(queryCSVStream, { name: `${this.outputFilename}.csv` });
				archive.finalize();
			}
			else {
				// Pipe CSV stream to outputStream
				queryCSVStream.pipe(outputStream);
			}

			outputStream.on('close', function() {
				if (progress === 0) {
					console.log('No data found.');
					fs.unlinkSync(`./output/${this.outputFilename}.${this.outputType}`);
				}
				else {
					console.log('Export complete.');

					if (archive !== undefined) {
						console.log(archive.pointer() + ' total bytes.');
					}
				}

				this.terminate();
			}.bind(this));
	},
	terminate: function(error) {
		if (error) {
			console.log('Export failed:');
			console.log(error.message);
			this.connection && this.connection.destroy();
			process.exit(0);
		}
		else {
			this.connection.end(() => {
				process.exit(0);
			});
		}
	}
};


// commander
//   .version('0.0.1')
//   .option('-h, --host [string]', 'Choose MySQL host')
//   .option('-P, --port [integer]', 'Choose MySQL port')
//   .option('-d, --database [string]', 'Choose MySQL database')
//   .option('-u, --user [string]', 'Choose MySQL user')
//   .option('-p, --pw [string]', 'Choose MySQL password')
//   .option('-t, --table [string]', 'Choose table')
//   .option('-o, --output [string]', 'Choose output filename')
//   .option('-c, --columns [string]', 'Choose columns', (c) => { return c.split(' '); })
//   .option('-l, --limit [integer]', 'Set export limit')
//   .option('-s, --silent', 'Hide progressbar')
// 	.option('-q, --query [string]')
// 	.parse(process.argv);

// const host = commander.host || 'localhost';
// const port = commander.port || 3306;
// const database = commander.database;
// const user = commander.user || 'root';
// const password = commander.pw || 'root';
// const table = commander.table;
// const columns = commander.columns || '*';
// const limit = commander.limit || false;
// const filename = commander.output || false;
// const isSilent = commander.silent || false;

// let query = commander.query || false;

// if (!database) {
// 	console.log('Databse flag -d || --database is not set');
// 	process.exit(0);
// }

// if (!table) {
// 	console.log('Table flag -t || --table is not set');
// 	process.exit(0);
// }

// function run() {
// 	let conn = mysql.createConnection({ host, port, user, password, database });

// 	let replaceArgs = [];
// 	let firstLine = true;
// 	let archive = false;

// 	if (!query) {
// 		query = `SELECT ${commander.columns ? '??' : '*'} FROM ?? LIMIT ${limit ? limit : 1000}`;

// 		if (commander.columns) {
// 			replaceArgs.push(columns);
// 		}

// 		replaceArgs.push(table);
// 	}

// 	try {
// 		let interval;
// 		let progress = 0;

// 		if (!isSilent && filename) {
// 			conn.query(`EXPLAIN ${query}`, function(err, res) {
// 				if (!err) {
// 					let total = res[0].rows;
// 					let bar = new asciiProgress({ total, schema: " [:bar.gradient(#FFDC00,#39CCCC)] :current/:total :percent :elapseds :etas" });
// 					interval = setInterval(() => {
// 						bar.update(Math.min(total, progress) / total);
// 					}, 300);
// 				}
// 			})
// 		}


// 		const outputStream = !filename ? process.stdout : fs.createWriteStream(filename);

// 		// Query DB and return CSV stream
// 		const queryCSVStream = conn.query(query, replaceArgs)
// 			.stream()
// 			.pipe(through(function (data) {
// 				progress += 1;

// 				return csvwriter(data, { quoteMode: 2, header: firstLine }, function(err, csv) {
// 					// console.log(csv);
// 					firstLine = false;
// 					this.queue(csv);
// 				}.bind(this));
// 			}, function end() {
// 				clearInterval(interval);
// 				this.emit('end');

// 				if (outputStream === process.stdout) {
// 					process.exit(0);
// 				}
// 			}));

// 			if (filename && filename.substr(-4).toLowerCase() === '.zip') {
// 				// Create a file to stream archive data to.
// 				archive = archiver('zip', {
// 						zlib: { level: 9 }
// 				});

// 				archive.on('error', function(err) {
// 					throw err;
// 				});

// 				// pipe archive data to the file
// 				archive.pipe(outputStream);
// 				archive.append(queryCSVStream, { name: 'result.csv' });
// 				archive.finalize();
// 			}
// 			else {
// 				// Pipe CSV stream to outputStream
// 				queryCSVStream.pipe(outputStream);
// 			}

// 			outputStream.on('close', function() {
// 				console.log(archive ? archive.pointer() + ' total bytes.' : '', 'Export complete.');
// 				process.exit(0);
// 			});
// 	}
// 	catch (e) {
// 		console.log(e.message);
// 		process.exit(0);
// 	}
// }

// run();

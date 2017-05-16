module.exports = {
	host: {
		arg: '-h',
		type: 'string',
		description: 'Choose MySQL host',
		default: false
	},
  port: {
		arg: '-P',
		type: 'integer',
		description: 'Choose MySQL port',
		default: false
	},
  database: {
		arg: '-d',
		type: 'string',
		description: 'Choose MySQL database',
		default: false
	},
  user: {
		arg: '-u',
		type: 'string',
		description: 'Choose MySQL user',
		default: false
	},
  password: {
		arg: '-p',
		type: 'string',
		description: 'Choose MySQL password',
		default: false
	},
  query: {
		arg: '-q',
		type: 'string',
		description: 'SQL query or .sql file',
		default: false
	},
  table: {
		arg: '-t',
		type: 'string',
		description: 'Choose table',
		default: false
	},
  columns: {
		arg: '-c',
		type: 'string',
		description: 'Choose columns (seperator: ,)',
		callback: (c) => { return c.split(' '); },
		default: '*'
	},
  limit: {
		arg: '-l',
		type: 'integer',
		description: 'Set export limit',
		default: ''
	},
  outputType: {
		arg: '-T',
		type: 'string',
		description: 'Choose output type',
		callback: (t) => {
			return (['csv', 'zip', 'term'].indexOf(t) !== -1) ? t : 'term';
		},
		default: false
	},
  outputFilename: {
		arg: '-o',
		type: 'string',
		description: 'Choose output filename',
		default: false
	},
	silent: {
		arg: '-s',
		description: 'Hide progressbar',
		default: false
	}
};

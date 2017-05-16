const prompt = require('prompt');
const commander = require('commander');

module.exports = [
	{
		name: 'host',
		description: 'DB host address',
		type: 'string',
		message: 'DB host must be a string',
		default: 'localhost',
		required: false
	},
	{
		name: 'port',
		description: 'DB port',
		type: 'string',
		pattern: /^([0-9]+)$/,
		message: 'DB port must be a valid port',
		default: 3306,
		required: false
	},
	{
		name: 'database',
		description: 'Database',
		type: 'string',
		message: 'Database must be a string',
		required: true
	},
	{
		name: 'user',
		description: 'DB user',
		type: 'string',
		message: 'User must be a string',
		default: 'root',
		required: false
	},
	{
		name: 'password',
		description: 'DB password',
		type: 'string',
		message: 'User must be a string',
		hidden: true,
		replace: '*',
		default: 'root',
		required: false
	},
	{
		ask: () => {
			return commander.rawArgs.indexOf('-t') === -1;
		},
		name: 'query',
		description: 'SQL query or file (skip for single table export)',
		type: 'string',
		message: 'Table name must be a string',
		default: '',
	},
	{
		ask: () => {
			return commander.rawArgs.indexOf('-t') !== -1 || prompt.history('query').value === '';
		},
		name: 'table',
		default: 'false',
		description: 'DB table',
		type: 'string',
		message: 'Table name must be a string',
		required: true
	},
	{
		ask: () => {
			return commander.rawArgs.indexOf('-q') === -1 && (commander.rawArgs.indexOf('-t') !== -1 || prompt.history('query').value === '');
		},
		name: 'columns',
		description: 'DB columns (seperator: ",")',
		type: 'string',
		message: 'Columns name must be a string',
		default: '*',
		before: function (value) {
			value.replace(/ /, '');

			return value;
		}
	},
	{
		ask: () => {
			return commander.rawArgs.indexOf('-q') === -1 && (!prompt.history('query') || prompt.history('query').value === '');
		},
		name: 'limit',
		pattern: /^\d*$/,
		description: 'Row limit (0 = no limit)',
		type: 'string',
		message: 'Limit must be an integer',
		default: 0
	},
	{
		name: 'outputType',
		description: 'Output type (csv|zip|term)',
		type: 'string',
		pattern: /^(csv|zip|term)$/,
		message: 'Output type has to be "csv", "zip" or "term"',
		default: 'csv'
	},
	{
		ask: () => {
			return (commander.outputType && commander.outputType !== 'term') || (prompt.history('outputType') && prompt.history('outputType').value !== 'term');
		},
		name: 'outputFilename',
		description: 'Output filename',
		type: 'string',
		message: 'Output filename must be a string',
		default: 'export_result'
	}
];

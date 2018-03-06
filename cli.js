#!/usr/bin/env node

const http = require('http');
const sade = require('sade');
const httpProxy = require('http-proxy');
const morgan = require('morgan');

const prog = sade('nanoproxy');

const err  = (msg) => {
  console.error(msg);
	process.exit(1);
};

const isNumeric = (num) => {
  return !isNaN(parseFloat(num)) && isFinite(num);
};

prog.command('proxy <from> <to>', '', { default:true })
	.describe('Start proxying requests.')
	.example('proxy 3000 80')
	.option('-l, --logger', 'Specifies the logging format for morgan', 'common')
	.action((from, to, opts) => {
    if (!isNumeric(to)) err('`to` must be a port');
		const port = parseInt(to);
		if (port <= 0 || port > 65535) err('`to` must be a valid port');
		if (isNumeric(from)) from = `http://localhost:${from}`;

		const proxy = httpProxy.createProxyServer({});
		const logger = morgan(opts.logger);

		const server = http.createServer((req, res) => {
			logger(req, res, (err) => {
				if (err) console.log(err);

				proxy.web(req, res, { target: from });
		  })
		});

		server.listen(port, () => {
			console.log(`Listening on port ${port}`);
		});
  });

prog.parse(process.argv);

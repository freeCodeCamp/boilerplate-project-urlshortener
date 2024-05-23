const dotenv = require('dotenv').config();
const dns = require('dns');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
	res.json({ greeting: 'hello API' });
});

const randomNumber = () => {
	return Math.floor(Math.random() * 100)
}

app.post('/api/shorturl', async (req, res) => {
	const { url } = req.body
	let createRows = null
	const data = await prisma.shorten_url.findMany({
		where: {
			original: url
		}
	});

	if ( data.length == 0 || data[data.length - 1].original == null ) {
		createRows = await prisma.shorten_url.create({
			data: {
				original: url,
				short: randomNumber()	
			}
		})	
	}
	

	dns.lookup(url.replace("https://", ''), {all: true}, (err, address) => {
		if (err) {
			res.send({
				erorr: "Invalid URL"
			})
		} else if (data.length == 0) {
			res.send({
				original_url: createRows.original,
				short_url: createRows.short
			})
		} else {
			res.send({
				original_url: data[data.length - 1].original,
				short_url: data[data.length - 1].short
			})	
		}
	})
	
})

app.get('/api/shorturl/:num', async (req, res) => {
	const { num } = req.params;

	const data = await prisma.shorten_url.findMany({
		where: {
			short: parseInt(num)
		}
	})

	const url = data[data.length - 1].original

	res.redirect(url)
})


app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});

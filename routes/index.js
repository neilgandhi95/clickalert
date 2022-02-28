var express = require('express');
var router = express.Router();


// Query data
var axios = require('axios');


// Cache data about entries
var cachedResponses = {};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/neil/:template/:name/:domain', async function(req, res, next) {

	console.log("----------")
	console.log(req.url);
	console.log(req.get('user-agent'));
	// console.log(req.ipInfo);
	const g = await axios.get('http://ipwhois.app/json/' + req.ipInfo.ip);
	console.log(g.data.city + "/" + g.data.region);
	  // .then(({ data }) => console.log(data))
	console.log("----------")


	const name = req.params.name;
	const domain = req.params.domain;

	try {
		const org = await enrichDomain(domain);
		const person = {
			name: name,
			org: org
		}

	  	res.render('page', { person: person });
	} catch(e) {
		res.status(500).send("Something went wrong. Please email neil@onepagekit.com");
	}
});

router.get('/ryan/:template/:name/:domain', async function(req, res, next) {

	console.log("----------")
	console.log(req.url);
	console.log(req.get('user-agent'));
	console.log("----------")


	const name = req.params.name;
	const domain = req.params.domain;

	try {
		const org = await enrichDomain(domain);
		const person = {
			name: name,
			org: org
		}

	  	res.render('ryan', { person: person });
	} catch(e) {
		res.status(500).send("Something went wrong. Please email neil@onepagekit.com");
	}
});


router.get('/avery/:email', async function(req, res, next) {
	const email = req.params.email;

	try {
		const person = await enrichContact(email);

	  	res.render('avery', { person: person });
	} catch(e) {
		res.status(500).send("Something went wrong. Please email neil@onepagekit.com");
	}
});


module.exports = router;


//----------------------------------------

// -----------------
// Enrich email with Apollo information
// -----------------
async function enrichDomain(domain) {

	// Empty check
	if (domain == "") {
		throw Error("Not a valid domain");
	}

	// First check if data is cached
	if (cachedResponses[domain]) {
		return cachedResponses[domain];
	}

	// Get data back in JSON
	var headers = {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache'
	};

	// API key
	var data = {
		"api_key": "MRfLnf4OP-tftTPfL9F9rg",
		"domain": domain
	}


	try {

		// Ping API
		const response = await axios.get("https://api.apollo.io/v1/organizations/enrich?api_key=MRfLnf4OP-tftTPfL9F9rg&domain=" + domain, {
			headers: headers
		});

		// Check for errors
		if (!response.data) {
			throw Error("Apollo error: " + response.data);
		}

		const company = response.data.organization;

		var essentialData = {
			name: company.name,
			logo: company.logo_url,
			domain: domain
		}

		// Clean up data
		essentialData.name = essentialData.name.split(",")[0].split("-")[0].split("-")[0]
		essentialData.name = essentialData.name.replace("Inc", "");
		essentialData.name = essentialData.name.replace("LLC", "");

		// Cache response
		cachedResponses[domain] = essentialData;

		return essentialData;

	} catch(e) {
		console.log(e);
		throw Error("Apollo error");
	}
}


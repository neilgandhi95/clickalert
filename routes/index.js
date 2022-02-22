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


router.get('/neil', async function(req, res, next) {
	console.log(req.query.hello);
	const email = req.query.hello;

	const person = await enrichContact(email);
	console.log(person);

  	res.render('page', { person: person });
});


module.exports = router;


//----------------------------------------

// -----------------
// Enrich email with Apollo information
// -----------------
async function enrichContact(email) {
	console.log("ENRCIHING: " + email);

	// Empty check
	if (email == "") {
		throw Error("Not a valid email");
	}

	// First check if data is cached
	if (cachedResponses[email]) {
		return cachedResponses[email];
	}

	// Get data back in JSON
	var headers = {
		'Content-Type': 'application/json'
	};

	// API key
	var data = {
		"api_key": "MRfLnf4OP-tftTPfL9F9rg",
		"email": email
	}


	try {

		// Ping API
		const response = await axios.post("https://api.apollo.io/v1/people/match", data, {
			headers: headers
		});

		// Check for errors
		if (!response.data || !response.data.person) {
			throw Error("Apollo error: " + response.data);
		}

		const person = response.data.person;

		const name = person.first_name;
		const title = person.title;
		const company = person.organization.name;

		var essentialData = {
			name: person.first_name ??= email.split("@")[0],
			title: person.title ??= "",
			company: person.organization.name ??= email.split("@")[1],
			email: email
		}

		// Clean up data
		essentialData.company = essentialData.company.split(",")[0].split("-")[0];
		essentialData.company = essentialData.company.replace("Inc", "");
		essentialData.company = essentialData.company.replace("LLC", "");
		essentialData.logo = person.organization.logo_url;

		essentialData.title = essentialData.title.split(",")[0].split("-")[0];

		// Cache response
		cachedResponses[email] = essentialData;

		return essentialData;

	} catch(e) {
		console.log(e);
		throw Error("Apollo error");
	}
}


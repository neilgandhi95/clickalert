var express = require('express');
var router = express.Router();

// Mongo
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = 'mongodb+srv://first:d3VrKV9ugovErDoU@cluster0.lbzve.mongodb.net/test';
var mongoCompanyCollection;

// Query data
var axios = require('axios');


// Cache data about entries
var cachedResponses = {};


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/neil/:template/:domain/:name', async function(req, res, next) {

	console.log("----------")
	// console.log(req.url);
	// console.log(req.get('user-agent'));

	printLogs(req);
	// console.log(req.ipInfo);
	// const g = await axios.get('http://ipwhois.app/json/' + req.ipInfo.ip);
	// console.log(g.data.city + "/" + g.data.region);
	  // .then(({ data }) => console.log(data))
	console.log("----------")


	const name = req.params.name;
	const domain = req.params.domain;

	try {
		const org = await getCompany(domain);
		console.log(org);
		const person = {
			name: name,
			org: org
		}

	  	res.render('page', { person: person });
	} catch(e) {
		res.status(500).send("Something went wrong. Please email neil@paage.io");
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
// async function enrichDomain(domain) {

// 	// Empty check
// 	if (domain == "") {
// 		throw Error("Not a valid domain");
// 	}

// 	// First check if data is cached
// 	if (cachedResponses[domain]) {
// 		return cachedResponses[domain];
// 	}

// 	// Get data back in JSON
// 	var headers = {
// 		'Content-Type': 'application/json',
// 		'Cache-Control': 'no-cache'
// 	};

// 	// API key
// 	var data = {
// 		"api_key": "MRfLnf4OP-tftTPfL9F9rg",
// 		"domain": domain
// 	}


// 	try {

// 		// Ping API
// 		const response = await axios.get("https://api.apollo.io/v1/organizations/enrich?api_key=MRfLnf4OP-tftTPfL9F9rg&domain=" + domain, {
// 			headers: headers
// 		});

// 		// Check for errors
// 		if (!response.data) {
// 			throw Error("Apollo error: " + response.data);
// 		}

// 		const company = response.data.organization;

// 		var essentialData = {
// 			name: company.name,
// 			logo: company.logo_url,
// 			domain: domain
// 		}

// 		// Clean up data
// 		essentialData.name = essentialData.name.split(",")[0].split("-")[0].split("-")[0]
// 		essentialData.name = essentialData.name.replace("Inc", "");
// 		essentialData.name = essentialData.name.replace("LLC", "");

// 		// Cache response
// 		cachedResponses[domain] = essentialData;

// 		return essentialData;

// 	} catch(e) {
// 		console.log(e);
// 		throw Error("Apollo error");
// 	}
// }

//------------
// Print out all the analytics for demo purposes
//------------
function printLogs(req) {


	const ua = req.get('user-agent');
	// console.log(ua);
	if (ua.includes("Slackbot")) {
		writeLog(req, " shared in Slack!");
	} else if (ua.includes("LinkedInBot")) {
		writeLog(req, " shared in LinkedIn!");
	}
	// console.log(req.url);
	// console.log(req.get('user-agent'));
	// console.log(req.ipInfo);
	// const g = await axios.get('http://ipwhois.app/json/' + req.ipInfo.ip);
	// console.log(g.data.city + "/" + g.data.region);
	  // .then(({ data }) => console.log(data))
}

	function writeLog(req, content) {
		console.log(req.params.name + " from " + req.params.domain + " page was " + content);
	}





//--------------------------
// Retrieve info about this company from mongoDB
//--------------------------
async function getCompany(domain) {

	// If all else fails, return this
	const baseReturn = {
		logo_url: "https://logo.clearbit.com/" + domain,
		name: titleCase(domain.split(".")[0]),
		domain: domain
	}

	console.log("swag")
	// First connect to our our Crunchbase clone
	try {
		await connectToDatabase();

		var query = {};
		query.domain = domain;
		query.rank = {$exists: true};
		console.log("hey");

		const docs = await mongoCompanyCollection.find(query)
			.limit(1)
			.sort({rank: 1})
			.collation({locale: "en_US", numericOrdering: true})
			.toArray();

			console.log("hey");

		if (docs.length > 0) {
			return cleanOrg(docs[0], domain);
		} else {

			// Check Clearbit autocomplete
			const response = await axios.get('https://autocomplete.clearbit.com/v1/companies/suggest?query=' + domain);

			// Make sure a result exists
			if (response.data && response.data.length > 0) {

				// If it does, cycle through each response to see if the domain matches and return it if successful
				for (var i = 0; i < response.data.length; i++) {
					const result = response.data[i];

					// Clearbit domain matches the domain we passed in
					if (result.domain == domain) {
						return {
							name: result.name,
							domain: result.domain,
							logo_url: result.logo
						}
					}
				}
			}

			// Clearbit had results, but nothing relevant. Try to see if we can make it work with placeholder results
			// It may still fail though if there the logo_url data is invalid.
			return baseReturn;
		}

	} catch(e) {
		console.log(e);
		throw Error("Could not find logo or name");
	}
}

	//-----------------------
	// Connect to mongodb client
	//-----------------------
	async function connectToDatabase() {

		// If we already have a connection, just return that
		if (mongoCompanyCollection) {
			return mongoCompanyCollection;
		}


		// Connect to our MongoDB database hosted on MongoDB Atlas
		try {

			// Wait to connect to Mongo
			const client = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true });

			// Save connection for later
			mongoCompanyCollection = client.db("all").collection("companies");

			console.log("connected to mongo");

			return;
		} catch(e) {
			throw Error("Could not connect to MongoDB");
		}
	}


	// Modify mongodb docs before returning to client
	function cleanOrg(org, domain) {

		var retOrg = {};

		// Domain
		retOrg.domain = domain;

		// Naturalize name
		retOrg.name = org.name.replace(/,?\s*(llc|inc|corp|co)\.?$/i, '').split(".")[0].split("(")[0].split("-")[0].split("|")[0].split(",")[0].trim();
		retOrg.name = titleCase(retOrg.name);

		// Change up logo
		if (org.logo_url != undefined && org.logo_url != "") {

			const id = org.logo_url.split("/").pop();
			if (id) {
				retOrg.logo_url = "https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,h_170,w_170,f_auto,b_white,q_auto:eco,dpr_1/" + id;
			}

		} else {
			retOrg.logo_url = "https://logo.clearbit.com/" + org.domain;
		}

		return retOrg;
	}


	// Capitalize the first letter of the company name
	function titleCase(str) {
		var splitStr = str.toLowerCase().split(' ');

		for (var i = 0; i < splitStr.length; i++) {
			// You do not need to check if i is larger than splitStr length, as your for does that for you
			// Assign it back to the array
			splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
		}

		// Directly return the joined string
		return splitStr.join(' ');
	}


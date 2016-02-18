/*
 * Copyright (c) 2009 - 2015 Tropo, now part of Cisco
 * Released under the MIT license. See the file LICENSE
 * for the complete license
 */

/*
 * Downloaded from
 *   https://github.com/tropo/tropo-samples/blob/master/javascript/recording-node-webapi.js
 * Described in
 *   https://www.tropo.com/docs/webapi/tutorials/nodejs-voice-recording-example
 *   https://www.tropo.com/docs/webapi/tutorials/nodejs-voice-recording-example/behind-scenes-json-recording-example
 *
 * -Xv
 */

/**
 * Showing with the Express framework http://expressjs.com/
 * Express must be installed for this sample to work
 */

var tropoApi = require('tropo-webapi');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var port = process.env.VCAP_APP_PORT || 80;
var host = 

/**
 * Required to process the HTTP body
 * req.body has the Object while req.rawBody has the JSON string
 */

app.use(bodyParser.json());

app.post('/', function(req, res){
    
    console.dir(req.body);
    var recordUrl = req.protocol + '://' + req.get('host') + '/recordings';
    recordUrl = 'https://' + req.get('host') + '/recordings';

	// Create a new instance of the TropoWebAPI object.
	var tropo = new tropoApi.TropoWebAPI();
	if(req.body['session']['from']['channel'] == "TEXT") {
		tropo.say("This application is voice only.  Please call in using a regular phone, SIP phone or via Skype.");
		
		tropo.on("continue", null, null, true);
		
		res.send(tropoApi.TropoJSON(tropo));
	}
	
	// Use the say method https://www.tropo.com/docs/webapi/say.htm
	else {
	
	tropo.say("Welcome to my Tropo Web API node demo.");
	
	// Demonstrates how to use the base Tropo action classes.
	var say = new Say("Please ree cord your message after the beep.");
	var choices = new Choices(null, null, "#");
    // -Xv: the above lines add stuff to the response that causes an execption in tropo
    say = null;
    choices = null;

	// Action classes can be passed as parameters to TropoWebAPI class methods.
	// use the record method https://www.tropo.com/docs/webapi/record.htm
	tropo.record(3, false, null, choices, null, 5, 60, null, null, "recording", null, say, 5, null, recordUrl, null, null);

	// use the on method https://www.tropo.com/docs/webapi/on.htm
	tropo.on("continue", null, "/answer", true);
	
	tropo.on("incomplete", null, "/timeout", true);
	
	tropo.on("error", null, "/error", true);

    var tropoJson = tropoApi.TropoJSON(tropo);
    console.log('returning...');
    console.log(JSON.stringify(tropo, null, 2));
    res.send(tropoJson);
}});

app.post('/answer', function(req, res){
	var tropo = new tropoApi.TropoWebAPI();
	tropo.say("Recording successfully saved.  Thank you!");

	res.send(tropoApi.TropoJSON(tropo));
});

app.post('/timeout', function(req, res){
	var tropo = new tropoApi.TropoWebAPI();
	tropo.say("Sorry, I didn't hear anything.  Please call back and try again.");

	res.send(tropoApi.TropoJSON(tropo));
});

app.post('/error', function(req, res){
	var tropo = new tropoApi.TropoWebAPI();
	tropo.say("Recording failed.  Please call back and try again.");

	res.send(tropoApi.TropoJSON(tropo));
});

app.post('/recordings', function(req, res){
    console.log('got a recording!');
    console.dir(req.headers);
    res.status(200).json({status:"ok"});
});
app.listen(port);
console.log('Server running on port :' + port);

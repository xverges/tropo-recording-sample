/*
 * Copyright (c) 2009 - 2015 Tropo, now part of Cisco
 * Released under the MIT license. See the file LICENSE
 * for the complete license
 */

/*
 * Originally downloaded from
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
var multer = require('multer');
var request = require('request');

var port = process.env.VCAP_APP_PORT || 80;

/**
 * Required to process the HTTP body
 * req.body has the Object while req.rawBody has the JSON string
 */

app.use(bodyParser.json());

app.post('/', function(req, res){
    
    console.dir(req.body);
    var sessionId = req.body.session.id;
    var recordUrl = 'https://' + req.get('host') + '/recordings?sessionId=' + sessionId;

    // Create a new instance of the TropoWebAPI object.
    var tropo = new tropoApi.TropoWebAPI();
    
    tropo.say("Welcome to this recording demo");
    
    var say = {value: "Please ree cord your message after the beep."};
    var choices = {terminator: "#"};

    // Action classes can be passed as parameters to TropoWebAPI class methods.
    // use the record method https://www.tropo.com/docs/webapi/record.htm
    var record = { 
        attempts: 3,
        asyncUpload: true,
        bargein: false,
        beep: null,
        choices: choices,
        format: null,
        maxSilence: 5,
        maxTime: 60,
        method: 'POST',
        minConfidence: null,
        name: "recording",
        required: true,
        say: say,
        timeout: 3,
        transcription: null,
        url: recordUrl,
        password: null,
        username: null
    };
    tropo.tropo.push({record: record});
    tropo.say('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20');
    tropo.say('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20');
    tropo.say('1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20');

    // use the on method https://www.tropo.com/docs/webapi/on.htm
    tropo.on("continue", null, "/continue", true);
    tropo.on("recordingPosted", null, "/recordingPosted", true);
    
    tropo.on("incomplete", null, "/timeout", true);
    
    tropo.on("error", null, "/error", true);

    console.log(JSON.stringify(tropo, null, 2));
    res.send(tropoApi.TropoJSON(tropo));
});

app.post('/continue', function(req, res){
    var tropo = new tropoApi.TropoWebAPI();
    tropo.say("Continue handler one");
    tropo.say("Continue handler two");

    res.send(tropoApi.TropoJSON(tropo));
});

app.post('/recordingPosted', function(req, res){

    var tropo = new tropoApi.TropoWebAPI();
    tropo.say("Recording posted handler one");
    tropo.say("Recording posted handler two");

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

var upload = multer({ dest: 'uploads/' });
app.post('/recordings', upload.single('filename'), function(req, res){
    console.log('got a recording!');
    console.dir(req.headers);
    if (!req.file || !req.file.size) {
        console.log('empty file');
    } else {
        console.log('size: ' + req.file.size);
        var sessionId = req.query.sessionId;
        var url = 'https://api.tropo.com/1.0/sessions/' +
                  sessionId +
                  '/signals?action=signal&value=recordingPosted';

        request.get(url)
           .on('error', function(err) {
                console.error('call to tropo failed');
                console.log(err);
            })
            .on('response', function(response) {
                console.log('asked tropo to interrupt the muzak');
            });
    }
    res.status(200).json({status:"ok"});
});

app.listen(port);
console.log('Server running on port :' + port);

'use strict';

var debug = true;

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');

if (debug){
    // Fetch the service account key JSON file contents
    var serviceAccount = require("./credentials/what-fresh-hell-firebase-adminsdk-ozhpf-51d009745a.json");

    // Initialize the app with a custom auth variable, limiting the server's access
    admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://what-fresh-hell.firebaseio.com"
    });
}
else{
    admin.initializeApp(functions.config().firebase);
}


// a. the action name from the make_name Dialogflow intent
//const NAME_ACTION = 'LatestTweet';
const TWITTER_HANDLE_ARGUMENT = 'TwitterHandle';

var twitterHandle = '';

function snapshotToArray(snapshot) {
    var returnArr = [];

    snapshot.forEach(function(childSnapshot) {
        var item = childSnapshot.val();
        item.key = childSnapshot.key;

        returnArr.push(item);
    });

    return returnArr;
};

var getLatestTweetFrom = function(twitterHandle){
    return new Promise(function(resolve, reject) {

        try{
            let speechOutput = '';


            var latestTweet = admin.database().ref('/messages').limitToLast(1).once('value').then(function(snapshot) {
                var messages = snapshotToArray(snapshot);
                var speechOutput = (messages.length > 0)? messages[0].original: "No tweets today";
                resolve(speechOutput);
            });

            
        }
        catch (error){
            reject(Error("Sorry, there was a problem."));
        }

    });
}

exports.getFreshHell = functions.https.onRequest((request, response) => {
    const app = new App({request, response});
    //console.log('Request headers: ' + JSON.stringify(request.headers));
    //console.log('Request body: ' + JSON.stringify(request.body));

    function getLatestTweet (app) {
        twitterHandle = app.getArgument(TWITTER_HANDLE_ARGUMENT);
        getLatestTweetFrom(twitterHandle).then(function(result){
            app.tell(result);
        }, function(err){
            app.tell(err.Error);
        });
        
      }
    // d. build an action map, which maps intent names to functions
    let actionMap = new Map();
    actionMap.set("LatestTweet", getLatestTweet);


    app.handleRequest(actionMap);
});


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    const created = req.query.created;
    const username = req.query.username;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    admin.database().ref('/messages').push({original: original, created: created, username: username}).then(snapshot => {
      // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
      res.send("Success");
    });
  });



twitterHandle = "Trump";
getLatestTweetFrom(twitterHandle).then(function(result){
    console.log("Success: " + result);
}, function(err){
    console.log("Failed: " + err);
});

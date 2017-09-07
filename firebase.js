var firebase = require("firebase");
var config = { 
    apiKey: "AIzaSyB3K13DRUe3wn8O-Qs-KDk9MEbN1j_Dme4",
    authDomain: "face-recognition-d77d4.firebaseapp.com",
    databaseURL: "https://face-recognition-d77d4.firebaseio.com",
    projectId: "face-recognition-d77d4",
    storageBucket: "face-recognition-d77d4.appspot.com",
    messagingSenderId: "918686885503" 
}
module.exports = firebase.initializeApp(config);
import * as firebase from 'firebase';

const config = {
	apiKey: "AIzaSyDXf7gJ3n2hJIzf76RSie5NCdOqLB-MP9Q",
	authDomain: "sensorcollector-030618.firebaseapp.com",
	databaseURL: "https://sensorcollector-030618.firebaseio.com",
	projectId: "sensorcollector-030618",
	storageBucket: "sensorcollector-030618.appspot.com",
	messagingSenderId: "947071283339"
};

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();

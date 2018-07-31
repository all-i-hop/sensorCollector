import React, { Component } from 'react';
import { ScrollView, View, Text, Picker } from 'react-native';
//import firebase from './firebase';
import { Header, Button, Spinner, CardSection } from './components/common';
//import LoginForm from './components/LoginForm'
import SensorData from './components/SensorData';
import activityTypes from './components/ActivityList.json'
import LocationData from './components/LocationData';

const sensorTypes = ['Accelerometer', 'Gyroscope', 'Magnetometer']
const locationTypes = ['GPS']
const CHUNK_MAX = 100
let GPS_max = false

class App extends Component {
    state = {
        loggedIn: false,
        recording: false,
        userId: null,
		selectedActivity: '',
	}
    recordData = []
    currentActivityRef = null

    constructor(props) {
        super(props);
        //if (firebase) {
            //this.db = firebase.database();
            //this.sensorDataCollection = firebase.firestore().collection('sensorData');
			// this.sensorDataColRef = this.db.collection('sensorData');
        //}
    }

    // for every 100 entry chunk --> new doc in subcollection [sensortype]
    // GPS is not being uploaded at the moment (doesn't reach the 100 entries for uploading it to firestore)

    componentDidMount(){
        /*firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.setState({ loggedIn: true, userId: user.uid });
            } else {
                this.setState({ loggedIn: false, userId: null });
            }
        });
        console.log(firebase.database().app.name);
        // console.log(activityType.title)*/
    }


	async sendDataToFirebase(sensorType, data) {
		return new Promise((resolve) => {

			const currentActivityRef = this.db.ref('/sensorData').child(this.currentActivityKey);
			console.log(currentActivityRef);
			currentActivityRef.on('value', (snapShot) => {
				// const currentActivity = snapShot.val();
				//
				// console.log(currentActivity)
				// if (currentActivity && currentActivity[sensorType]) {
				// 	console.log('concat sensorTpye');
				// 	currentActivity[sensorType] = currentActivity[sensorType].concat(data);
				// } else {
				// 	currentActivity[sensorType] = data;
				// }
				//
				// this.db.ref('/sensorData').child(this.currentActivityKey).set(currentActivity);
				//
				resolve();
			})
		})
	}

    // value = {x: '', y: '', z: '', timestamp: '' }
    updateData (sensorType, sensorValue) {
        if (this.recordData[sensorType]) {
			this.recordData[sensorType].push(sensorValue);
		} else {
			this.recordData[sensorType] = [sensorValue];
        }

		if (this.recordData[sensorType].length > CHUNK_MAX) {
            //console.log('exceeded recordData', sensorType, sensorValue, this.recordData);
            //console.log(this.recordData[sensorType])
            this.pushToMongoDB(sensorType, {...this.recordData[sensorType]}, false)
            /*this.currentActivityRef
                .collection(sensorType)
                .doc()
                .set({...this.recordData[sensorType]})*/
            this.recordData[sensorType] = []
		}
        // this.checkForRecordChunks(sensorType, sensorValue)
    }

    getCurrentDoc() {
        fetch('https://api.mlab.com/api/1/databases/prototype/collections/sensorData?apiKey=6yz1_5_AcsFF5uXJWL5NXKEbds-zyis6', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
    }

    pushToMongoDB(activityType, data, initPush) {
        var item = {}
        item [activityType] = data;
        //console.log(item)

        if (initPush) {
            fetch('https://api.mlab.com/api/1/databases/prototype/collections/sensorData?apiKey=6yz1_5_AcsFF5uXJWL5NXKEbds-zyis6', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          .then((response) => response.json())
            .then((responseJson) => {
                //console.log(responseJson._id.$oid)
                this.currentActivityRef = responseJson._id.$oid
                console.log(this.currentActivityRef)
            })
          .catch(((error) => console.log("ERROR happened --> ",error)))
        }
        else {
            fetch('https://api.mlab.com/api/1/databases/prototype/collections/sensorData/'+this.currentActivityRef+'?apiKey=6yz1_5_AcsFF5uXJWL5NXKEbds-zyis6', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({$push: item}),
          })
          .then((response) => response.json())
            .then((responseJson) => {
                //console.log(data.sensorType)
                //console.log(activityType)
                //console.log(data)
                console.log("SUCCESS adding " + activityType + " data to activity " +this.currentActivityRef)
            })
          .catch(((error) => console.log("ERROR happened --> ",error)))
        }
    }

    addNewActivity(){
		const newActivity  = {
		    userId: this.state.userId || 'DUMMY',
			definedActivity: this.state.selectedActivity || activityTypes[0].id,
            startTime: Date.now(),
            endTime: ''
		}
        
        this.pushToMongoDB(0,newActivity,true)
        /*this.currentActivityRef = this.sensorDataCollection.doc()
        this.currentActivityRef.set({...newActivity})*/
        
        //console.log('added new activity to DB --> ',this.currentActivityRef.id)

		//this.currentActivityKey = this.db.ref("sensorData").push(newActivity).key;
		this.setState({ recording: true });
    }

    setActivityEnd(){
        this.endTime = Date.now()
        fetch('https://api.mlab.com/api/1/databases/prototype/collections/sensorData/'+this.currentActivityRef+'?apiKey=6yz1_5_AcsFF5uXJWL5NXKEbds-zyis6', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {"$set": {endTime: this.endTime}}
            ),
          })
          .then((response) => response.json())
            .then((responseJson) => {
                //console.log(responseJson._id.$oid)
                console.log(responseJson)
            })
          .catch(((error) => console.log("ERROR happened --> ",error)))
    }

    checkForRecordChunks(sensorType, value){
        /*
        var chunk = this.recordData.length;

        var exitCond = chunk >= CHUNK_MAX
        // var exitCond = (chunk1 || chunk2 || chunk3) >= 100

        // if (chunk > 5) firebase.database().ref('activities/').push(this.activity)
        if (exitCond)
        {
            firebase.database().ref('new/' + this.currentActivityKey + "/" + sensorType).set(this.recordData) // same as in "sendDataToFireBase" fct
            //firebase.database().ref('new').child(this.currentActivityKey).child(sensorType).set(this.recordData)
            this.recordData = []
            //this.recordData[sensorType] = [value]

            console.log(this.recordData)
            console.log([value])
            console.log("checked chunks --> uploaded current progress")
            //var check = firebase.database().ref("new").child().orderByChild("definedActivity")
            //console.log(check)
        }
        console.log(exitCond)
        */
    }

    renderActivityList(list){
        return list.map(item =>
            <Picker.Item
                key={item.id}
                value={item.id}
                label={item.title}
            />
        );
    }

    renderContent(){
        /*switch (this.state.loggedIn){
            case true:*/
                return (
                    <View>
                        {
                            sensorTypes.map(type => (
                                <SensorData
                                    key={type}
                                    sensorType={type}
                                    recording={this.state.recording}
                                    onUpdate={this.updateData.bind(this)}
                                />
                            ))
                        }

                        {
                            locationTypes.map(type => (
                                <LocationData
                                    key={type}
                                    sensorType={type}
                                    recording={this.state.recording}
                                    onUpdate={this.updateData.bind(this)}
                                />
                            ))
                        }

                        <Picker
                            mode="dropdown"
                            enabled={!this.state.recording}
                            selectedValue={this.state.selectedActivity}
                            onValueChange={(value) => this.setState({selectedActivity: value})}
                        >
                            {this.renderActivityList(activityTypes)}
                        </Picker>

                        <CardSection>
                            <Button
                                disabled={!this.state.recording}
                                onPress={() => {
                                    this.setState({ recording: false })
                                    // this.sendDataToFireBase()
                                    this.pushToMongoDB('GPS', {...this.recordData['GPS']}, false)
                                    this.setActivityEnd()
                                    // send Activity end timestamp to mongoDB
                                }}
                                btnStyle="stop"
                            >
                            Stop
                            </Button>
                            <Button
                                onPress={() => this.addNewActivity()}
                                disabled={this.state.recording}
                                btnStyle="start"
                            >
                                Start
                            </Button>
                        </CardSection>

                        {/* <CardSection>
                            <Button onPress={() => firebase.auth().signOut()} >
                                Log Out
                            </Button>
                        </CardSection>
                        <Text>
                            Logged in as: {firebase.auth().currentUser.email}
                        </Text> */}
                    </View>
                );
            /*case false:
                return <LoginForm />;
            default:
                return <Spinner size="large" />;
        }*/
    }

    render(){
        return (
            <ScrollView>
                <Header headerText="Almighty sensor collector" />
                {this.renderContent()}
            </ScrollView>
        );
    }
}

export default App;

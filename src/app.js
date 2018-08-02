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
const API_KEY = '6yz1_5_AcsFF5uXJWL5NXKEbds-zyis6'
const CHUNK_MAX = 50
let GPS_max = false

class App extends Component {
    state = {
        loggedIn: false,
        recording: false,
        userId: null,
		selectedActivity: '',
	}
    recordData = {}
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
		/*return new Promise((resolve) => {

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
		})*/
	}

    // value = {x: '', y: '', z: '', timestamp: '' }
    updateData (sensorType, sensorValue) {
        if (this.recordData[sensorType]) {
			this.recordData[sensorType].push(sensorValue);
		} else {
			this.recordData[sensorType] = [sensorValue];
        }

		if (this.recordData[sensorType].length > (CHUNK_MAX-1)) {
            //console.log('exceeded recordData', sensorType, sensorValue, this.recordData);
            //console.log(this.recordData[sensorType])
            //console.log(...this.recordData[sensorType])

            this.pushToMongoDB(sensorType, {...this.recordData[sensorType]}, false)
            this.recordData[sensorType] = []
		}
        // this.checkForRecordChunks(sensorType, sensorValue)
    }

    getCurrentDoc() {
        /*
        fetch('https://api.mlab.com/api/1/databases/prototype/collections/sensorData?apiKey='+API_KEY, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })
          */
    }

    pushToMongoDB(activityType, data, initPush) {
        //var item = {}
        //item [activityType] = data;
        //console.log(item)
        //console.log(data)
        //console.log(activityType)


        // MISSING --> WHAT IF GPS DATA IS EMPTY
        // ==> currently it is stil getting sent, no matter if it contains values or not
        if (initPush) {
            fetch('https://api.mlab.com/api/1/databases/prototype/collections/' + activityType + '?apiKey='+API_KEY, {
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
            fetch('https://api.mlab.com/api/1/databases/prototype/collections/' + activityType + '/' + this.currentActivityRef+'?apiKey='+API_KEY, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({$push: {data}}),
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
		    //userId: this.state.userId || 'DUMMY',
			definedActivity: this.state.selectedActivity || activityTypes[0].id,
            startTime: Date.now(),
            endTime: Date.now()
		}
        
        this.pushToMongoDB('Accelerometer',newActivity,true)
		this.setState({ recording: true });
    }


    // what if app crashes ==> no endTime set
    // option1 => set endTime with every update (performance?)
    // option2 => ???

    setActivityEnd(activityType){
        this.endTime = Date.now()
        fetch('https://api.mlab.com/api/1/databases/prototype/collections/' + activityType + '/' + this.currentActivityRef+'?apiKey='+API_KEY, {
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
                                    this.pushToMongoDB('GPS', {...this.recordData['GPS']}, false)
                                    this.setActivityEnd('Accelerometer')
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

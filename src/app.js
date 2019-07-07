import React, { Component } from 'react';
import { ScrollView, View, Text, Picker } from 'react-native';
import { Header, Button, Spinner, CardSection } from './components/common';
import SensorData from './components/SensorData';
import activityTypes from './components/ActivityList.json'
import LocationData from './components/LocationData';
import DeviceInfo from 'react-native-device-info'

const sensorTypes = ['Accelerometer', 'Gyroscope', 'Magnetometer']
const locationTypes = ['GPS']
const API_KEY = 'XXX'
const CHUNK_MAX = 200
const serialNumber = DeviceInfo.getSerialNumber();
const model = DeviceInfo.getModel();
const systemVersion = DeviceInfo.getSystemVersion();

class App extends Component {
    state = {
        recording: false,
		selectedActivity: '',
	}
    recordData = {}
    currentActivityRef = null

    constructor(props) {
        super(props);
    }

    // value = {x: '', y: '', z: '', timestamp: '' }
    updateData (sensorType, sensorValue) {
        if (this.recordData[sensorType]) {
			this.recordData[sensorType].push(sensorValue);
		} else {
			this.recordData[sensorType] = [sensorValue];
        }

		if (this.recordData[sensorType].length > (CHUNK_MAX-1)) {
            this.pushToMongoDB(sensorType, {...this.recordData[sensorType]}, false)
            this.recordData[sensorType] = []
		}
    }

    pushToMongoDB(activityType, data, initPush) {
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
                this.currentActivityRef = responseJson._id.$oid
                console.log(this.currentActivityRef)
            })
          .catch(((error) => console.log("ERROR happened --> ",activityType, error)))
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
                console.log("SUCCESS adding " + activityType + " data to activity " +this.currentActivityRef + " ====> " + Date.now())
                console.log({data})
            })
          .catch(((error) => console.log("ERROR happened --> ",activityType, error)))
        }
    }

    addNewActivity(){
		const newActivity  = {
            serialNumber: serialNumber,
            model: model,
            systemVersion: systemVersion,
			definedActivity: this.state.selectedActivity || activityTypes[0].id,
            startTime: Date.now(),
            endTime: ''
		}   
        this.pushToMongoDB('activities',newActivity,true)
		this.setState({ recording: true });
    }

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
                                    this.pushToMongoDB('Accelerometer', {...this.recordData["Accelerometer"]}, false)
                                    this.pushToMongoDB('Gyroscope', {...this.recordData["Gyroscope"]}, false)
                                    this.pushToMongoDB('Magnetometer', {...this.recordData["Magnetometer"]}, false)
                                    this.pushToMongoDB('GPS', {...this.recordData["GPS"]}, false)
                                    this.setActivityEnd('activities')
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
                    </View>
                );
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

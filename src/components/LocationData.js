import React, { Component } from 'react';
import { Button, Card, CardSection, Input, TextLabel } from './common';
import { DeviceEventEmitter } from 'react-native'

class LocationData extends Component {
	//intervalId;
	// if TRUE => GPS
	// if FALSE => WIFI
	//useGps = false;
	//initGPS = true

	constructor(props) {
		super(props);
		this.state = {
			accuracy: '',
			// altidude: '',
			heading: '',
			latitude: '',
			longitude: '',
			speed: '',
			timestamp: '',
			error: null
		};
	}

	componentDidMount() {
		/* if (this.props.recording) {
			console.log("component mounted --> execute loadGPSData")
			this.loadGPSData();
			//this.setInterval();
		} */

	}

	setInterval() {
		this.intervalId = setInterval(() => {
			this.loadGPSData();
		}, 10000);
	}

	loadGPSData() {
		console.log("loading GPS data...")
		navigator.geolocation.getCurrentPosition(
			(position) => {
				var { accuracy, heading, latitude, longitude, speed } = position.coords;
				const recordData = {
					'accuracy': accuracy,
					'heading': heading,
					'latitude': latitude,
					'longitude': longitude,
					'speed': speed,
					'timestamp': position.timestamp
				}

				this.setState({ ...recordData, error: null });
				this.props.onUpdate("GPS", recordData)
				//this.watchGPSData()
				console.log(recordData)
				//alert(JSON.stringify(recordData))
			},
			(error) => {
				this.setState({
					accuracy: "",
					// altidude: "",
					heading: "",
					latitude: "",
					longitude: "",
					speed: "",
					timestamp: "",
					error: error.message,
				})
				//alert(JSON.stringify(error))
			},
			{
				enableHighAccuracy: false,
				timeout: 10000,
				maximumAge: 1000
			}
		);
		console.log("done loading GPS")
		console.log(this.state.error)
	}

	// ISSUE --> first two entries still the same 
	watchGPSData() {
		//if(this.watchId) navigator.geolocation.clearWatch(this.watchId)
		//alert(JSON.stringify("watching GPS data..."))
		console.log("watching GPS data...")
		this.watchId = navigator.geolocation.watchPosition(
			(position) => {
				var { accuracy, heading, latitude, longitude, speed } = position.coords;
				const recordData = {
					'accuracy': accuracy,
					'heading': heading,
					'latitude': latitude,
					'longitude': longitude,
					'speed': speed,
					'timestamp': position.timestamp
				}

				this.setState({ ...recordData, error: null });
				this.props.onUpdate("GPS", recordData)
				console.log(recordData)
				//console.log(typeof(position.timestamp))
				//console.log(position.coords)
				//alert(JSON.stringify(recordData))
			},
			(error) => {
				this.setState({
					accuracy: "",
					// altidude: "",
					heading: "",
					latitude: "",
					longitude: "",
					speed: "",
					timestamp: "",
					error: error.message,
				})
				// use WiFi if GPS is not available after first time
				//this.useGps = false;
				console.log("error")
				console.log(this.state.error)
			},
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 1000,
				useSignificantChanges: true
				//distanceFilter: 10
			}
		);
		console.log(this.watchId)
		//this.useGps = true
	}


	componentDidUpdate(prevProps) {
		const { recording } = this.props;
		//console.log(this.useGps)
		if (!recording && prevProps.recording) {
			console.log("clearWatch will be executed")
			navigator.geolocation.clearWatch(this.watchId)
			//clearInterval(this.intervalId);
		} 
		else if (recording && !prevProps.recording) {
			//if (this.initGPS) {
			//	this.initGPS = false
			//	this.loadGPSData()
			//}
			//else {
				//setTimeout(this.watchGPSData(), 10000)
			//	console.log("watchGPS() will be executed")
				this.watchGPSData();
			//}
			
			//this.setInterval();
		}
		
	}

	render() {
		const { latitude, longitude } = this.state;

		return (
			<Card>
				<CardSection>
					<TextLabel
						value="GPS"
					/>
				</CardSection>
				<CardSection>
					<Input
						readonly
						label='Latitude'
						value={latitude.toString()}
					/>
				</CardSection>
				<CardSection>
					<Input
						readonly
						label="Longitude"
						value={longitude.toString()}
					/>
				</CardSection>
			</Card>
		);
	}

	componentWillUnmount() {
		//if (this.intervalId) {
		if (this.watchId) {
			//clearInterval(this.intervalId)
			navigator.geolocation.clearWatch(this.watchId)
		}
	}
}

export default LocationData;

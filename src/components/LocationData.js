import React, { Component } from 'react';
import { Button, Card, CardSection, Input, TextLabel } from './common';
import { DeviceEventEmitter } from 'react-native'

class LocationData extends Component {
	//intervalId;
	watchId;
	// if TRUE => GPS
	// if FALSE => WIFI
	useGps = true;

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
		if (this.props.recording) {
			this.loadGPSData();
			//this.setInterval();
		}
	}

	setInterval() {
		this.intervalId = setInterval(() => {
			this.loadGPSData();
		}, 10000);
	}

	// ISSUE --> first two entries still the same 
	loadGPSData() {
		console.log("loading GPS data...")
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
				this.useGps = false;
			},
			{
				enableHighAccuracy: this.useGps,
				timeout: 10000,
				maximumAge: 1000
			}
		);
	}


	componentDidUpdate(prevProps) {
		const { recording } = this.props;

		if (!recording && prevProps.recording) {
			navigator.geolocation.clearWatch(this.watchId)
			//clearInterval(this.intervalId);
		} else if (recording && !prevProps.recording) {
			this.loadGPSData();
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

import React, { Component } from 'react';
import { Button, Card, CardSection, Input, TextLabel } from './common';
import { DeviceEventEmitter } from 'react-native'

class LocationData extends Component {

	constructor(props) {
		super(props);
		this.state = {
			accuracy: '',
			heading: '',
			latitude: '',
			longitude: '',
			speed: '',
			timestamp: '',
			error: null
		};
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
				console.log(recordData)
			},
			(error) => {
				this.setState({
					accuracy: "",
					heading: "",
					latitude: "",
					longitude: "",
					speed: "",
					timestamp: "",
					error: error.message,
				})
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

	watchGPSData() {
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
			},
			(error) => {
				this.setState({
					accuracy: "",
					heading: "",
					latitude: "",
					longitude: "",
					speed: "",
					timestamp: "",
					error: error.message,
				})
				console.log("error")
				console.log(this.state.error)
			},
			{
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 1000,
				useSignificantChanges: true
			}
		);
		console.log(this.watchId)
	}


	componentDidUpdate(prevProps) {
		const { recording } = this.props;
		if (!recording && prevProps.recording) {
			console.log("clearWatch will be executed")
			navigator.geolocation.clearWatch(this.watchId)
		} 
		else if (recording && !prevProps.recording) {
				this.watchGPSData();
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
		if (this.watchId) {
			navigator.geolocation.clearWatch(this.watchId)
		}
	}
}

export default LocationData;

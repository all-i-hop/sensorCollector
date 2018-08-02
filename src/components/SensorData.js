import React, { Component } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { Button, Card, CardSection, Input, TextLabel } from './common';
import { SensorManager } from 'NativeModules';

const SENSOR_TIMER = 50

class SensorData extends Component {
	constructor(props) {
		super(props);
		this.state = {
			x: '',
			y: '',
			z: ''
		};
	}

	componentDidMount() {
		var { sensorType } = this.props;
		// console.log(this.props)

		if (this.props.recording) {
			this.startSensor(sensorType, SENSOR_TIMER);
			this.loadSensorData(sensorType);
		}

	}

	startSensor(sensorType, timer) {
		switch (sensorType) {
			case 'Accelerometer':
				SensorManager.startAccelerometer(timer);
				break;
			case 'Gyroscope':
				SensorManager.startGyroscope(timer);
				break;
			case 'Magnetometer':
				SensorManager.startMagnetometer(timer);
				break;
		}
	}

	stopSensor(sensorType) {
		switch (sensorType) {
			case 'Accelerometer':
				SensorManager.stopAccelerometer();
				break;
			case 'Gyroscope':
				SensorManager.stopGyroscope();
				break;
			case 'Magnetometer':
				SensorManager.stopMagnetometer();
				break;
		}
	}

	loadSensorData(type) {
		DeviceEventEmitter.addListener(type, (data) => {
			const recordData = {
				x: data['x'],
				y: data['y'],
				z: data['z'],
			};

			this.setState(recordData)

			this.props.onUpdate(type, {
				//type,
				...recordData,
				timestamp: ((new Date).getTime()/100).toFixed(1)*100
			})
			//console.log(recordData)
		});
	}

	componentDidUpdate(prevProps) {
		var { sensorType } = this.props;

		if (!this.props.recording && prevProps.recording) {
			console.log('stop events')
			DeviceEventEmitter.removeAllListeners;
			this.stopSensor(sensorType)
		} else if (this.props.recording && !prevProps.recording) {
			console.log('start events')
			this.startSensor(sensorType, SENSOR_TIMER);
			this.loadSensorData(sensorType)
		}
	}

	render() {
		const { sensorType } = this.props;
		const { x, y, z } = this.state
		return (
			<Card>
				<CardSection>
					<TextLabel
						value={sensorType}
					/>
				</CardSection>
				<CardSection>
					<Input
						placeholder="-"
						readonly
						label='X'
					/>
					<Input
						placeholder="-"
						readonly
						label='Y'
					/>
					<Input
						placeholder="-"
						readonly
						label='Z'
					/>
				</CardSection>
			</Card>

		);
	}

	componentWillUnmount() {
		var { sensorType } = this.props;

		DeviceEventEmitter.removeAllListeners;
		this.stopSensor(sensorType)
	}
}

export default SensorData;

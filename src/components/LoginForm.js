import React, { Component } from 'react';
import { Text } from 'react-native';
import firebase from '../firebase';
import { Button, Card, CardSection, Input, Spinner } from './common';

class LoginForm extends Component {
    
    constructor(){
        super()
        this.state = {
            email: '',
            password: '',
            error: '',
            loading: false
        };
    }

    onButtonPress() {
        const { email, password } = this.state;

        this.setState({ error: '', loading: true});

        firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password)
            .then(this.onLoginSuccess.bind(this))
            .catch(() => {
                firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(email, password)
                    .then(this.onLoginSuccess.bind(this))
                    // .catch(console.log(this.state))
                    .catch(this.onLoginFail.bind(this));
            });
    }

    onLoginFail(){
        this.setState({
            error: 'Authentication failed',
            loading: false
        });
    }

    onLoginSuccess(){
        this.setState({ 
            email: '',
            password: '',
            loading: false,
            error: ''
        });
    }

    renderButton(){
        if (this.state.loading) {
            return <Spinner size="small" />;
        }

        return (
            <Button onPress={this.onButtonPress.bind(this)}>
                Log in
            </Button>
        );
    }

    render() {
        return (
            <Card>
                <CardSection>
                    <Input 
                        placeholder="user@gmail.com"
                        label="EMail"
                        onChangeText={email => this.setState({ email })}
                        value={this.state.email}
                    />
                </CardSection>

                <CardSection>
                    <Input
                        placeholder="password"
                        label="Password"
                        secureTextEntry
                        value={this.state.password}
                        onChangeText={passwordInput => this.setState({ password: passwordInput })}
                    />
                </CardSection>

                <Text style={styles.errorTextStyle}>
                    {this.state.error}
                </Text>

                <CardSection>
                    {this.renderButton()}
                </CardSection>
            </Card>
        );
    }
}

const styles = {
    errorTextStyle: {
        fontSize: 20,
        alignSelf: 'center',
        color: 'red'
    }
}

export default LoginForm;
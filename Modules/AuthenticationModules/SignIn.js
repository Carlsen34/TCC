import React from 'react';
import { TextInput, Button, StyleSheet,KeyboardAvoidingView} from 'react-native';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from '../../aws-exports';
import * as TaskManager from 'expo-task-manager';
Amplify.configure(awsconfig);



export default class App extends React.Component {
  state = {
    username: '',
    password: '',
    user: {},
  };
  
  onChangeText(key, value) {
    this.setState({
      [key]: value,
    });
  }

  signIn() {
    TaskManager.unregisterAllTasksAsync()   
    const { username, password } = this.state;
    Auth.signIn(username, password)
      .then(user => {
        this.setState({ user });
        console.log('successful sign in!');
        this.props.screenProps.authenticate(true);
        
      })
      .catch(err => {
        alert('error signing in!: '+ err.message);
        console.log('error signing in!: ', err);
      });
      
  }

  render() {

    
    return (
      <KeyboardAvoidingView style={styles.container} behavior="padding">

        <TextInput
          onChangeText={value => this.onChangeText('username', value)}
          style={styles.input}
          placeholder="username"
        />
      
        <TextInput
          onChangeText={value => this.onChangeText('password', value)}
          style={styles.input}
          secureTextEntry={true}
          placeholder="password"
        />
      <Button title="Sign In" onPress={this.signIn.bind(this)} />    
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 16,
  },
});

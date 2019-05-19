import React from 'react';
import { TextInput, Button, StyleSheet,KeyboardAvoidingView} from 'react-native';

import { Auth } from 'aws-amplify';



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
    const { username, password } = this.state;
    Auth.signIn(username, password)
      .then(user => {
        this.setState({ user });
        console.log('successful sign in!');
        this.props.screenProps.authenticate(true);
        
      })
      .catch(err => {
        showAlert();
        console.log('error signing in!: ', err)
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

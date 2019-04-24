import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView } from 'react-native';
import Amplify,{ Auth,API } from 'aws-amplify';
import AWSConfig from '../../aws-exports';
var AWS = require('aws-sdk');
Amplify.configure(AWSConfig);


//AWS.config.region = 'us-east-1';
//AWS.config.credentials = 'us-east-1:f6f3c2c3-d521-4996-aa54-2d532dc6cb74';

AWS.config.update({
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: 'us-east-1:f6f3c2c3-d521-4996-aa54-2d532dc6cb74',
    }),
    region: 'us-east-1'
  });


const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

 var params = {
  UserPoolId: "us-east-1_pzJ6w0dlE",
 }


 cognitoIdentityServiceProvider.listUsers(params, function(err, data) {
  if (err) console.log("ERROR "+err, err.stack); // an error occurred
  else{
  console.log(Object.values(data.Users));
  } ;           // successful response
});

export default class App extends React.Component {

 async  saveUser() {
  let newUser = {
    body: {
      "Users": this.state.Users
    }
  }
  const path = "/friendship";

  // Use the API module to save the note to the database
  try {
    const apiResponse = await API.put("Friendship", path, newUser)
    console.log("response from saving note: " + apiResponse);
    this.setState({apiResponse});
  } catch (e) {
    console.log(e);
  }
};

  state = {
    apiResponse: null,
    Users: ''
  };
      
  handleChangeUser = (event) => {
      this.setState({Users: event});
  }

render(){
    return(
      <KeyboardAvoidingView style={styles.container}>
      <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
      <Button title="Save User" onPress={this.saveUser.bind(this)} />
     
      <TextInput style={styles.textInput} autoCapitalize='none' onChangeText={this.handleChangeUser}/>
</KeyboardAvoidingView>
    )
}
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  textInput: {
      margin: 15,
      height: 30,
      width: 200,
      borderWidth: 1,
      color: 'green',
      fontSize: 20,
      backgroundColor: 'black'
   }
});
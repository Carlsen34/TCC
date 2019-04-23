import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView } from 'react-native';
import Amplify,{ Auth } from 'aws-amplify';
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

export default class App extends React.Component {


render(){
    cognitoIdentityServiceProvider.listUsers(params, function(err, data) {
        if (err) console.log("ERROR "+err, err.stack); // an error occurred
        else{
        console.log(Object.values(data.Users));
        } ;           // successful response
      });

    return(
        <View
        
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text>Hey {Auth.user.username}!</Text>
      </View>
    )
}


}

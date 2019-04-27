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
  UserPoolId: 'us-east-1_pzJ6w0dlE',
  AttributesToGet:[],
 }

export default class App extends React.Component {

  state = {
    apiResponse: null,
    Users: '',
    Friends:'',
  };

  handleChangeUser = (event) => {
    this.setState({Users: event});
}




async getUser() {
  const path = "/friendship/object/" + this.state.Users;
  try {
    const apiResponse = await API.get("Friendship", path);
    console.log("response from getting note: " + apiResponse.Friends);
    this.setState({apiResponse});
    this.setState({Friends:apiResponse.Friends});
  } catch (e) {
    console.log(e);
  }
}



 async  saveUser() {
    await  this.getUser();
    var user = await this.state.Users;
    var friends = await this.state.Friends;

    await cognitoIdentityServiceProvider.listUsers(params, function(err, data) {
    if (err) console.log("ERROR "+err, err.stack); // an error occurred
    else{
      for(var resp in data.Users){
        var objUsername = data.Users[resp].Username;
        var objUserStatus = data.Users[resp].UserStatus;

        if(user == objUsername && objUserStatus == "CONFIRMED" ){
          let newFriend = {
            body: {
              "Users": user,
              "Friends":friends
            }
          }
          newFriend.body.Friends.push("Friend6");
          const path = "/friendship";
        
          // Use the API module to save the note to the database
          try {
            const apiResponse =  API.put("Friendship", path, newFriend)
            console.log("response from saving note: " + apiResponse);
            this.setState({apiResponse});
          } catch (e) {
            console.log(e);
          }
        }
      }
    } ;           // successful response
  });

 }

render(){
    return(
      <KeyboardAvoidingView style={styles.container}>
      <Text>Response: {this.state.apiResponse && JSON.stringify(this.state.apiResponse)}</Text>
      <Button title="New Friend" onPress={this.saveUser.bind(this)} />
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
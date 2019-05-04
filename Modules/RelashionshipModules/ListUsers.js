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
    NewFriend:'',
    hasFriend:false,
  };

  handleChangeUser = (event) => {
    this.setState({NewFriend: event});
}




async getUser(name) {
  const path = "/friendship/object/" + name;
  try {
    const apiResponse = await API.get("Friendship", path);
    console.log("response from getting note: " + apiResponse.Friends);
    this.setState({apiResponse});
    if(apiResponse.Friends != undefined ){
      this.setState({Friends:apiResponse.Friends});
      this.setState({hasFriend:true});
    }else{
      this.setState({hasFriend:false});

    }
  
  } catch (e) {
    console.log(e);
  }
}


async  deleteUser() {
  var user = await Auth.user.username;
  await  this.getUser(user);
  var friends = await this.state.Friends;
  var newFriends = await this.state.NewFriend;
  var hasFriend = await this.state.hasFriend;

  await cognitoIdentityServiceProvider.listUsers(params, function(err, data) {
  if (err) console.log("ERROR "+err, err.stack); // an error occurred
  else{
    for(var resp in data.Users){
      var objUsername = data.Users[resp].Username;
      var objUserStatus = data.Users[resp].UserStatus;

      if(newFriends == objUsername && objUserStatus == "CONFIRMED" ){
        let objNewFriend = {
          body: {
            "Users": Auth.user.username,
            "Friends":friends
          }
        }

        var indice = objNewFriend.body.Friends.indexOf(newFriends);
          console.log("Friends : "+ newFriends);
          console.log(objNewFriend);
        if(indice == -1){
          console.log("Cant unfriend");
        } else{
          objNewFriend.body.Friends.splice(indice,1);
          const path = "/friendship";
      
          // Use the API module to save the note to the database
          try {
            const apiResponse =  API.put("Friendship", path, objNewFriend)
            console.log("response from saving note: " + apiResponse);
            this.setState({apiResponse});
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  } ;           // successful response
});

}


 async  saveUser() {
    var user = await Auth.user.username;
    await  this.getUser(user);
    var friends = await this.state.Friends;
    var newFriends = await this.state.NewFriend;
    var hasFriend = await this.state.hasFriend;

    await cognitoIdentityServiceProvider.listUsers(params, function(err, data) {
    if (err) console.log("ERROR "+err, err.stack); // an error occurred
    else{
      for(var resp in data.Users){
        var objUsername = data.Users[resp].Username;
        var objUserStatus = data.Users[resp].UserStatus;

        if(objUsername != user && newFriends == objUsername && objUserStatus == "CONFIRMED" ){
          let objNewFriend = {
            body: {
              "Users": user,
              "Friends":friends
            }
          }

          if(hasFriend == true){
            objNewFriend.body.Friends.push(newFriends);
          }else{
            objNewFriend.body.Friends = [newFriends];
          }
         
          const path = "/friendship";
        
          // Use the API module to save the note to the database
          try {
            const apiResponse =  API.put("Friendship", path, objNewFriend)
            console.log("response from saving note: " + apiResponse);
            this.setState({apiResponse});
          } catch (e) {
            console.log(e);
          }

        }else{
          console.log("Impossivel adicionar amigo");
        }
      }
    } ;           // successful response
  });

 }

render(){
    return(
      <KeyboardAvoidingView style={styles.container}>
      <Button title="New Friend" onPress={this.saveUser.bind(this)} />
      <Button title="Load Friend" onPress={this.getUser.bind(this)} />
      <Button title="Delete Friend" onPress={this.deleteUser.bind(this)} />
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
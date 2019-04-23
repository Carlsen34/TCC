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



 // Create a new Note according to the columns we defined earlier
 async function saveNote() {
  let newNote = {
    body: {
      "NoteTitle": "My first note!",
      "NoteContent": "This is so cool!",
      "NoteId": this.state.noteId
    }
  }
  const path = "/Notes";

  // Use the API module to save the note to the database
  try {
    const apiResponse = await API.put("NotesCRUD", path, newNote)
    console.log("response from saving note: " + apiResponse);
    this.setState({apiResponse});
  } catch (e) {
    console.log(e);
  }
}

 async function getNote() {
  const path = "/Notes/object/" + this.state.noteId;
  try {
    const apiResponse = await API.get("NotesCRUD", path);
    console.log("response from getting note: " + apiResponse);
    this.setState({apiResponse});
  } catch (e) {
    console.log(e);
  }
}

async function deleteNote() {
  const path = "/Notes/object/" + this.state.noteId;
  try {
    const apiResponse = await API.del("NotesCRUD", path);
    console.log("response from deleteing note: " + apiResponse);
    this.setState({apiResponse});
  } catch (e) {
    console.log(e);
  }
}


export default class App extends React.Component {

  state = {
    apiResponse: null,
    noteId: ''
  };
      
  handleChangeNoteId = (event) => {
      this.setState({noteId: event});
  }

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

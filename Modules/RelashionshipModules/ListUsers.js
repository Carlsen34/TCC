import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList } from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';
var AWS = require('aws-sdk');
Amplify.configure(AWSConfig);

Analytics.disable();

AWS.config.update({
    credentials: new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWSConfig.aws_cognito_identity_pool_id
    }),
    region: AWSConfig.aws_project_region
  });


const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

 var params = {
  UserPoolId: AWSConfig.aws_user_pools_id,
  AttributesToGet:[],
 }

export default class App extends React.Component {

  state = {
    apiResponse: null,
    Users: '',
    Friends:'',
    NewFriend:'',
    hasFriend:false,
    data: [
      { id: 0, full_name: 'Repo 1' },
      { id: 1, full_name: 'Repo 2' },
      { id: 2, full_name: 'Repo 3' },
      { id: 3, full_name: 'Repo 4' },
      { id: 4, full_name: 'Repo 5' },
    ],
  };

  handleChangeUser = (event) => {
    this.setState({NewFriend: event});
}


async auxgetUser(){
  var user = await Auth.user.username;
  await this.getUser(user);
}

async auxFriend(){
  var user = await Auth.user.username;
  var newFriend = await this.state.NewFriend;
  await this.newFriend(user,newFriend);
  await this.newFriend(newFriend,user)
}


async auxDeleteUser(){
  var user = await Auth.user.username;
  var newFriend = await this.state.NewFriend;
  await this.deleteUser(user,newFriend);
  await this.deleteUser(newFriend,user)

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
      console.log("List Friends: " + this.state.Friends);
    }else{
      this.setState({hasFriend:false});

    }
  
    return apiResponse;
  } catch (e) {
    console.log(e);
  }
}


async  deleteUser(user,newFriends) {
  await  this.getUser(user);
  var friends = await this.state.Friends;
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
            "Users": user,
            "Friends":friends
          }
        }

        var indice = objNewFriend.body.Friends.indexOf(newFriends);
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
            return apiResponse;
          } catch (e) {
            console.log(e);
          }
        }
      }
    }
  } ;           // successful response
});

}



 async  newFriend(user,newFriends) {
    await  this.getUser(user);
    var friends = await this.state.Friends;
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
            return apiResponse;
          } catch (e) {
            console.log(e);
          }

        }else{
          console.log("Impossivel adicionar amigo");
        }
      }
    } ;           
  });

 }


 renderItem = ({ item }) => (
  <View style={styles.listItem}>
    <Text>{item.full_name}</Text>
  </View>
);

render(){
    return(
      <KeyboardAvoidingView style={styles.container}>
      <Button title="New Friend" onPress={this.auxFriend.bind(this)} />
      <Button title="List Friend" onPress={this.auxgetUser.bind(this)} />
      <Button title="Delete Friend" onPress={this.auxDeleteUser.bind(this)} />
      
      <FlatList
        style={{ marginTop: 30 }}
        contentContainerStyle={styles.list}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={item => item.id}
      />

      <TextInput style={styles.textInput} autoCapitalize='none' onChangeText={this.handleChangeUser}/>
</KeyboardAvoidingView>
    )
}
};


const styles = StyleSheet.create({
  container: {
    margin: 30,
    flex: 5,
    backgroundColor: '#fff',
  },
  textInput: {
      margin: 15,
      height: 30,
      width: 200,
      borderWidth: 1,
      fontSize: 20,
   },  list: {
    paddingHorizontal: 20,
  },  
  listItem: {
    backgroundColor: '#EEE',
    marginTop: 20,
    padding: 30,
  },

   
});
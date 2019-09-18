import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity,Image,TouchableHighlight} from 'react-native';
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

export default class ListUsers extends React.Component {
  

  state = {
    apiResponse: null,
    Users: '',
    Friends:'',
    NewFriend:'',
    hasFriend:false,
    animating:true
  };

  handleChangeUser = (event) => {
    this.setState({NewFriend: event});
}


async auxgetUser(){
  this.setState({animating:true})
  var user = "edmar";
   this.getUser(user);
  this.setState({animating:false})
}

async auxFriend(){
  this.setState({animating:true})
  var user =  "edmar";
  var newFriend =  this.state.NewFriend;
  await this.newFriend(user,newFriend);
  await this.newFriend(newFriend,user)
  await this.getUser(user);
  this.setState({animating:false})
  alert('Friendship added successfully');
}


async auxDeleteUser(friend){
  console.log(friend)
  this.setState({animating:true})
  var user =  "edmar";
  var newFriend =  friend;
  await this.deleteUser(user,newFriend);
  await this.deleteUser(newFriend,user)
  await this.getUser(user);
  this.setState({animating:false})
  alert('Friendship successfully disbanded!');


}




async getUser(name) {
  console.log(name);
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
            for(var resp in  objNewFriend.body.Friends){
              if(objNewFriend.body.Friends[resp] == newFriends ){
                return
              }
            }
            objNewFriend.body.Friends.push(newFriends);
          }else{
            objNewFriend.body.Friends = [newFriends];
          }
         
          const path = "/friendship";
        
          // Use the API module to save the note to the database
          try {
            const apiResponse =  API.put("Friendship", path, objNewFriend)
            console.log(path)
            console.log(objNewFriend)
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


componentWillMount(){
   this.auxgetUser();
  }

render(){
    if(this.state.animating){
      return ( 
     <KeyboardAvoidingView style={styles.container} behavior="padding" enabled> 
       <Button 
      title="New Friend"
       onPress={this.auxFriend.bind(this)} 
       />
       <Text></Text>
      <ActivityIndicator
        size="large" 
        color="#0000ff" 
        animating = {this.state.animating}/>

        </KeyboardAvoidingView>
        )
    }
    if(!this.state.animating){
    return(
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <Button 
      title="New Friend"
       onPress={this.auxFriend.bind(this)} 
       />
       <Text></Text>

      <FlatList
        style={{ marginTop: 15 }}
        contentContainerStyle={styles.list}
        data={this.state.Friends}
        renderItem = {({item}) =>
        <View style={styles.listItem}>
          <TouchableOpacity  onPress={() => {
            this.props.navigation.navigate('UserProfile', {
              itemId: 86,
              name: item,
          })
          }}>
        <Text style={styles.format}>{item}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress ={() => this.auxDeleteUser(item)} >
          <View>
          <Image
              source={require("../../images/cross.jpg")}
              style={styles.float}

            />
          </View>
          </TouchableOpacity>

      </View>
      
      }
        keyExtractor={(item, index) => index.toString()}
      />

      <TextInput style={styles.textInput} autoCapitalize='none' onChangeText={this.handleChangeUser}/>
</KeyboardAvoidingView>
    )
  }
}
};


const styles = StyleSheet.create({
  container: {
    margin: 30,
    flex: 5,
    backgroundColor: '#fff',
    padding: 16,

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
    backgroundColor: '#f0f8ff',
    padding: 30,
    marginTop: 5,
    justifyContent: 'center',

  },
  format:{
    fontSize: 15,
  },
  float:{
    marginTop:-20,
    alignSelf: 'flex-end',
    height: 25, 
    width: 25

  },
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    margin: 10,
  }
   
});
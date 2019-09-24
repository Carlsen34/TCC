import React from 'react';
import {RefreshControl, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity,Image} from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';
import DialogInput from 'react-native-dialog-input';    


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
    refreshing:true,
    isDialogVisible:false
  };

  handleChangeUser = (event) => {
    this.setState({NewFriend: event});
}


async auxgetUser(){
  this.setState({animating:true})
  var user = Auth.user.username;
   this.getUser(user);
  this.setState({animating:false})
}

async auxFriend(friend){
  this.setState({animating:true})
  var user =  Auth.user.username;
  await this.newFriend(user,friend);
  await this.newFriend(friend,user)
  await this.getUser(user);
  this.setState({animating:false})
  alert('Contato Adicionado com Sucesso');
  this.setState({isDialogVisible:false})
}


async auxDeleteUser(deleteUser){
  this.setState({animating:true})
  var user =  Auth.user.username;
  var newFriend =  deleteUser;
  await this.deleteUser(user,newFriend);
  await this.deleteUser(newFriend,user)
  await this.getUser(user);
  this.setState({animating:false})
  alert('Contato Removido com Sucesso');
  await this.getUser(user);


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

 saveButton = () => {
  this.setState({isDialogVisible:true})
}

componentWillMount(){
   this.auxgetUser();
   this.setState({refreshing:false})
  }
  onRefresh() {
    this.auxgetUser();
    this.setState({refreshing:false})
  }


render(){
  if (this.state.refreshing) {
    return (
      //loading view while data is loading
      <View style={{ flex: 1, paddingTop: 20 }}>
        <ActivityIndicator />
      </View>
    );
  }

    return(
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
      <Button 
      title="Adicionar Contato"
       onPress={this.saveButton.bind(this)} 
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
        refreshControl={
          <RefreshControl
             refreshing={this.state.refreshing}
            onRefresh={this.onRefresh.bind(this)}
          />
        }
      />

<DialogInput isDialogVisible={this.state.isDialogVisible}
            title={"Nome do Contato"}
            message={"Digite o nome do Contato"}
            hintInput ={"Digite o nome do Contato"}
            submitInput={ (inputText) => {this.auxFriend(inputText)} }
            closeDialog={ () => { this.setState({isDialogVisible:false})}}>
          </DialogInput>

</KeyboardAvoidingView>
    )
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
    marginTop: 5,
    padding: 30,
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
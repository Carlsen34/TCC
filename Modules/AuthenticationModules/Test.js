import React from 'react';
import {RefreshControl, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity,Image, Alert} from 'react-native';
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

 var listRoutesAux = [];
export default class ListUsers extends React.Component {
  

  state = {
    apiResponse: null,
    listRoutes:[],
    refreshing:true,
    isDialogVisible:false
  };

  


 saveButton = () => {
  this.setState({isDialogVisible:true})
}

componentWillMount(){
   //this.auxgetUser();
   this.setState({refreshing:false})
  }
  onRefresh() {
   //this.auxgetUser();
    this.setState({refreshing:false})
  }

  async RemoveRoute(route){
    this.setState({animating:true})
    var index = listRoutesAux.indexOf(route)
    if (index !== -1) {
      await listRoutesAux.splice(index, 1)
      this.setState({
        listRoutes: listRoutesAux
      })
    }
  }

  async addRoute(addRoute){
    this.setState({animating:true})
    await listRoutesAux.push(addRoute)
    this.setState({
      listRoutes: listRoutesAux
    })
    this.setState({isDialogVisible:false})


  }


    saveRoute = () => {
      var routeString = "" 
      var i 
      
      for(i=0;i<this.state.listRoutes.length ;i++){ 
          if(this.state.listRoutes.length == i+1){
            routeString = routeString + this.state.listRoutes[i]
          } 
          else{
            routeString = routeString + this.state.listRoutes[i] + "|" 
          } 
         
      }
      
      
      console.log(routeString)
   


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
     title="Criar Rota" 
     onPress={this.saveRoute.bind(this)} />    
      <Text></Text>

      <Button 
      title="Adicionar Endereço"
       onPress={this.saveButton.bind(this)} 
       />
       <Text></Text>

      <FlatList
        style={{ marginTop: 15 }}
        contentContainerStyle={styles.list}
        data={this.state.listRoutes}
        renderItem = {({item}) =>
        <View style={styles.listItem}>
          <Text style={styles.format}>{item}</Text>
          <TouchableOpacity onPress ={() => this.RemoveRoute(item)} >
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
            title={"Adicionar Endereço"}
            message={"Digite o Endereço"}
            hintInput ={"Digite o Endereço"}
            submitInput={ (inputText) => {this.addRoute(inputText)} }
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
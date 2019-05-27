import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator} from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';
var AWS = require('aws-sdk');
Amplify.configure(AWSConfig);

Analytics.disable();






export default class App extends React.Component {

  state = {
    apiResponse: null,
    Users: '',
    Friends:'',
    NewFriend:'',
    hasFriend:false,
    animating:true,
    routeNameList:'',
    routeName:''
  };


  async auxgetRoutes(){
   this.setState({animating:true})
     this.getRoutes(Auth.user.username);
    this.setState({animating:false})
  }

  async auxdeleteRoutes(){
    this.setState({animating:true})
    await this.getRoutes(Auth.user.username);
   this.deleteRoutes();
    this.setState({animating:true})


    alert('Routes deleted successfully!');
  }


  async deleteRoutes(){
    let Obj =  {
      body: await{
        "user":Auth.user.username,
        "routeName":this.state.routeNameList
      }
    }

    var indice =  await Obj.body.routeName.indexOf(this.state.routeName);
    if(indice == -1){
      console.log("Cant unfriend");
      return
    } else{
      Obj.body.routeName.splice(indice,1);
       

      console.log(Obj.body.user)
      var path = "/getRoute"
      // Use the API module to save the note to the database
      try {
        const apiResponse =  await API.put("getRoute",path,Obj)
        console.log("response from deleing route: " + apiResponse.routeName);
        this.setState({apiResponse});
       
      } catch (e) {
     
        console.log(e);
      }


      try {
        const apiResponse = await API.del("Routes", "/routes/object/" + this.state.routeName);
        console.log("response from deleteing route: " + apiResponse);
        this.setState({apiResponse});
      } catch (e) {
        console.log(e);
      }
   

    }

  }

  async getRoutes(name) {
      const path = "/getRoute/object/"+name;
    try {
      const apiResponse = await API.get("getRoute", path);
      console.log("response from getting route: " + apiResponse.routeName);
      this.setState({routeNameList:apiResponse.routeName})
      this.setState({apiResponse});

 
     return apiResponse;
    } catch (e) {
      console.log(e);
    }
  }


  renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text>{item}</Text>
    </View>
  );
 
  componentWillMount(){
    this.auxgetRoutes();
   }

   handleChangeUser = (event) => {
    this.setState({routeName: event});
}

render(){

    return(
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
     <Button 
      title="List Routes"
       onPress={this.auxgetRoutes.bind(this)}  
       /> 
      <Text></Text>
     <Button 
      title="Delete Routes"
       onPress={this.auxdeleteRoutes.bind(this)} /> 
        <FlatList
        style={{ marginTop: 30 }}
        contentContainerStyle={styles.list}
        data={this.state.routeNameList}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
       <TextInput style={styles.textInput} autoCapitalize='none' onChangeText={this.handleChangeUser}/>
    
</KeyboardAvoidingView>
    )
  }
}


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
    backgroundColor: '#EEE',
    marginTop: 20,
    padding: 30,
  },
  input: {
    height: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
    margin: 10,
  }
   
});
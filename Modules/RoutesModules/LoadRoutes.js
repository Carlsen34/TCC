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
    data: [
      'Repo 1' ,
      'Repo 2' ,
      'Repo 3' ,
      'Repo 4' ,
      'Repo 5' ,
    ],
  };


  async auxgetRoutes(){
    this.setState({animating:true})
    var user = Auth.user.username;
     this.getRoutes(user);
    this.setState({animating:false})
  }

  async getRoutes(name) {
    console.log(name);
    const path = "/routes";
    try {
      const apiResponse = await API.get("Routes", path);
      console.log("response from getting route: " + apiResponse.user);
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
 

render(){
 
    return(
      <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
     <Button 
      title="List Routes"
       onPress={this.auxgetRoutes.bind(this)}  
       />  
            <FlatList
        style={{ marginTop: 30 }}
        contentContainerStyle={styles.list}
        data={this.state.data}
        renderItem={this.renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    
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
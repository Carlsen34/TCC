import React from 'react';
import {StyleSheet,View, Text, Button,TextInput,KeyboardAvoidingView,FlatList,TouchableOpacity } from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';

const routeAPI = 'http://vrp-dev.us-east-1.elasticbeanstalk.com/api/v1/vrp/route=';

class AddressScreen extends React.Component {

   state = {
        originText: '',
        waypointsText:''
      };

    onChangeText(key, value) {
    var str = value.split(" ").join("+");
    this.setState({
      [key]: str,
    });
  }

   saveButton = () => {
      const { originText,waypointsText} = this.state;
  
         /* 1. Navigate to the Details route with params */
            this.props.navigation.navigate('VehiclesScreen', {
              route:originText+waypointsText
            })
    }



  render() {
 
    return (
   <KeyboardAvoidingView style={styles.container} behavior="padding">

        <TextInput
          onChangeText={value => this.onChangeText('originText', value+'|')}
          style={styles.input}
          placeholder="originText"
        />

       <TextInput
          onChangeText={value => this.onChangeText('waypointsText', value)}
          style={styles.input}
          placeholder="waypointsText"
        />
      
      <Button title="Create Route" onPress={this.saveButton.bind(this)} />    
      </KeyboardAvoidingView>
    );
  }  
}


class VehiclesScreen extends React.Component {

  state = {
    Friends:'',
    vehicles: []
  };

addVehicle = (item) => {
 const list = this.state.vehicles;
 if(list.indexOf(item) == -1){
  list.push(item)
  this.setState({vehicles:list})
 }else{
   var index = list.indexOf(item)
   list.splice(index,1)
   this.setState({vehicles:list})
 }
}


completeRoute = (fullAPI) => {
  const {vehicles} = this.state;
  fetch(fullAPI).then(response => response.json()).then(data => {
  this.props.navigation.navigate('ConclusionScreen', {
    dist:data.Distance_of_the_route,
    max_dist:data.Maximum_of_the_route_distances,
    route:data.Route,
    num_vehicles:data.Vehicle,
    vehicles:vehicles
   })
}

)
.catch(error => alert(error))
      }

async auxgetUser(){
    this.setState({animating:true})
    var user = Auth.user.username;
    this.getUser(user);
    this.setState({animating:false})
}


async getUser(name) {
    console.log(name);
    const path = "/friendship/object/" + name;
    try {
      const APIResponse = await API.get("Friendship", path);
      console.log("response from getting note: " + APIResponse.Friends);
      this.setState({APIResponse});
      if(APIResponse.Friends != undefined ){
        this.setState({Friends:APIResponse.Friends});
        this.setState({hasFriend:true});
        console.log("List Friends: " + this.state.Friends);
      }else{
        this.setState({hasFriend:false});
  
      }
    
      return APIResponse;
    } catch (e) {
      console.log(e);
    }
  }


componentWillMount(){
        this.auxgetUser();
 }

  render() {
    const { navigation } = this.props;
    const route = navigation.getParam('route', '');
    const fullAPI = routeAPI + route + '/' + this.state.vehicles.length;
    
    return (
<KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
 <Text>{fullAPI}</Text>
      <FlatList
      style={{ marginTop: 30 }}
      contentContainerStyle={styles.list}
      data={this.state.Friends}
      renderItem = {({item}) =>
         <View style={styles.listItem}>
        <TouchableOpacity onPress={() =>this.addVehicle(item)}>
      <Text>{item}</Text>
        </TouchableOpacity>
    </View>
    }
      keyExtractor={(item, index) => index.toString()}
    />
  <Text>{this.state.vehicles}</Text>
<Button onPress={() =>this.completeRoute(fullAPI)} title="CREATE ROUTE"/>  
</KeyboardAvoidingView>
    );
  }
}

class ConclusionScreen extends React.Component {

    state = {
    data: [],
    vehicles: []
  };

 render() {
    const { navigation } = this.props;
    const vehicles = navigation.getParam('vehicles', '');
    const index_vehicles = navigation.getParam('num_vehicles', '');
    const dist = navigation.getParam('dist', '');
    const max_dist = navigation.getParam('max_dist', '');
    const route = navigation.getParam('route', '');

  return(
<KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
  <Text>Name :{vehicles}</Text>
  <Text>Index Vehicle :{index_vehicles}</Text>
  <Text>Dist :{dist}</Text>
  <Text>Max dist :{max_dist}</Text>
  <Text>Route :{route}</Text>

</KeyboardAvoidingView>
  );


}
}


const styles = StyleSheet.create({
container: {
  margin: 30,
  flex: 5,
  backgroundColor: '#fff',
  padding: 16,

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

const AppNavigator = createStackNavigator({
  AddressScreen: {
    screen: AddressScreen,
      navigationOptions:  {
      header: null
  }
  },
  VehiclesScreen: {
    screen: VehiclesScreen,
      navigationOptions:  {
      header: null
  }
 
},

    ConclusionScreen: {
    screen: ConclusionScreen,
      navigationOptions:  {
      header: null
  }
 
},

}, {
    initialRouteName: 'AddressScreen',
}



);

export default createAppContainer(AppNavigator);
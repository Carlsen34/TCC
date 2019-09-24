import React from 'react';
import {StyleSheet,View, Text, Button,TextInput,KeyboardAvoidingView,FlatList,TouchableOpacity } from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];

const routeAPI = 'http://vrp-dev.us-east-1.elasticbeanstalk.com/api/v1/vrp/route=';

class AddressScreen extends React.Component {

   state = {
        originText: '',
        waypointsText:'',

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
              route:originText+waypointsText,
            })
    }



  render() {
 
    return (
   <KeyboardAvoidingView style={styles.container} behavior="padding">
        <Text>Rota Compartilhada</Text>

        <TextInput
          onChangeText={value => this.onChangeText('originText', value+'|')}
          style={styles.input}
          placeholder="Origem"
        />

       <TextInput
          onChangeText={value => this.onChangeText('waypointsText', value)}
          style={styles.input}
          placeholder="Pontos de Parada"
        />
      
      <Button title="Criar Rota" onPress={this.saveButton.bind(this)} />    
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
  const { navigation } = this.props;
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
<Button onPress={() =>this.completeRoute(fullAPI)} title="CRIAR ROTA"/>  
</KeyboardAvoidingView>
    );
  }
}

class ConclusionScreen extends React.Component {

    state = {
    data: [],
    vehicles: [],
    index_vehicles:[],
    dist:[],
    max_dist:[],
    route:[],
    apiResponse:"",
    hasRoute:false,
    RouteName:"",
    routeAux:[]

  };

  async saveRoutes(api,path,objRoutes){
    try {
      const apiResponse = await API.put(api, path, objRoutes)
      console.log("response from saving routes: " + apiResponse);
      this.setState({apiResponse});
      return apiResponse;
    } catch (e) {
      console.log(e);
    }

  }

  async auxgetRoutes(){
    this.setState({animating:true})
      this.getRoutes(Auth.user.username);
     this.setState({animating:false})
   }

   async getRoutes(user){
    var path = "/getRoute/object/" + user;
    try {
      const apiResponse = await API.get("getRoute", path)
      console.log("response from get routes: " + apiResponse.routeName);
      this.setState({apiResponse});
      if(apiResponse.routeName != undefined ){
        this.setState({RouteName:apiResponse.routeName});
        console.log(this.state.RouteName)
        this.setState({hasRoute:true});
        console.log("List Route: " + this.state.RouteName);
      }else{
        this.setState({hasRoute:false});

      }
      return apiResponse;
    } catch (e) {
      console.log(e);
    }


  }


  handleButton = async (vehicles,index_vehicles,dist,max_dist,route) => {



      var i;
      for (i = 0; i < index_vehicles.length; i++) {
        if(dist[i] != 0){
      console.log(i)  
      let uuidv1 = require('uuid/v1');
   

      var user = vehicles[i]
      var origin = route[i].shift()
      var destination = route[i].pop()
      var waypoints = route[i]
      var RouteName = Auth.user.username + "-" + uuidv1()
  
      let objRoutes =  {
        body: {
          "routeName": RouteName,
          "user": user,
          "origin":origin,
          "destination":destination,
          "waypoints":waypoints
          
        }
      }
      await this.saveRoutes("Routes","/routes",objRoutes);

      await this.getRoutes(user)

      let objRoutesAux = await {
        body: {
          "user": user,
          "routeName": this.state.RouteName
        }
      }

      if( await this.state.hasRoute == true){
        objRoutesAux.body.routeName.push(RouteName);
      }else{
        objRoutesAux.body.routeName = [RouteName];
      }


      await this.saveRoutes("getRoute","/getRoute",objRoutesAux);
      await this.getRoutes(user)
      alert('Rota Compartilhada com Sucesso');
    }
      }


   }



 render() {
  var { navigation } = this.props;
  var vehicles = navigation.getParam('vehicles', '');
  var index_vehicles = navigation.getParam('num_vehicles', '');
  var dist = navigation.getParam('dist', '');
  var max_dist = navigation.getParam('max_dist', '');
  var route = navigation.getParam('route', '');




  return(
<KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
  <FlatList
            style={{ marginTop: 30 }}
            contentContainerStyle={styles.list}
            data={route} 
            renderItem = {({item}) =>
            <View style={styles.listItem}>
            <Text>
            {item+" "} 
            </Text>
          </View>
          }
            keyExtractor={(item, index) => index.toString()}
          />

  <Button 
  title="Compartilhar Rota"
  onPress={() =>this.handleButton(vehicles,index_vehicles,dist,max_dist,route)}/>
  

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
  backgroundColor: '#f0f8ff',
  marginTop: 5,
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
import React from 'react';
import {RefreshControl, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity,Image, Alert} from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 
import DialogInput from 'react-native-dialog-input';    
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];

const routeAPI = 'http://vrp-dev.us-east-1.elasticbeanstalk.com/api/v1/vrp/route=';
var listRoutesAux = [];

class AddressScreen extends React.Component {



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
      var str1 = ""
      if(addRoute.slice(-1) ==" "){
        str1 = addRoute.replace(/.$/,"")
      } 
      else{
        str1 = addRoute
      } 
       

      this.setState({animating:true})
      await listRoutesAux.push(str1)
      this.setState({
        listRoutes: listRoutesAux
      })
      this.setState({isDialogVisible:false})
  
  
    }
  
  
      saveRoute = () => {
        if(this.state.listRoutes.length > 1){

      
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
        
        this.props.navigation.navigate('VehiclesScreen', {
          route:routeString.split(" ").join("+")
        })
  
      }else{
        alert("Necessita de pelo menos dois Endereço")
      }
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
          <KeyboardAvoidingView style={styles1.container} behavior="padding" enabled>
         <Button 
         title="Criar Rota Compartilhada" 
         onPress={this.saveRoute.bind(this)} />    
          <Text></Text>
    
          <Button 
          title="Adicionar Endereço"
           onPress={this.saveButton.bind(this)} 
           />
           <Text></Text>
    
          <FlatList
            style={{ marginTop: 15 }}
            contentContainerStyle={styles1.list}
            data={this.state.listRoutes}
            renderItem = {({item}) =>
            <View style={styles1.listItem}>
              <Text style={styles1.format}>{item}</Text>
              <TouchableOpacity onPress ={() => this.RemoveRoute(item)} >
              <View>
              <Image
                  source={require("../../images/cross.jpg")}
                  style={styles1.float}
    
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
.catch(error => alert("Algum endereço está invalido"))
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
    routeAux:[],
    refreshing:false

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

      this.setState({refreshing:true})

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
       this.setState({refreshing:false})
    }
      }

      alert('Rota Compartilhada com Sucesso');

   }



 render() {
  var { navigation } = this.props;
  var vehicles = navigation.getParam('vehicles', '');
  var index_vehicles = navigation.getParam('num_vehicles', '');
  var dist = navigation.getParam('dist', '');
  var max_dist = navigation.getParam('max_dist', '');
  var route = navigation.getParam('route', '');

  if (this.state.refreshing) {
    return (
      //loading view while data is loading
      <View style={{ flex: 1, paddingTop: 20,marginTop:100}}>
        <ActivityIndicator />
      </View>
    );
  }


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


const styles1 = StyleSheet.create({
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
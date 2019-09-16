import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity,TouchableHighlight} from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';
import DialogInput from 'react-native-dialog-input';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import getDirections from 'react-native-google-maps-directions'
import { PermissionsAndroid } from 'react-native';
import Geocoder from 'react-native-geocoding';
var AWS = require('aws-sdk');
Amplify.configure(AWSConfig);
const GOOGLE_MAPS_APIKEY = AWSConfig.GOOGLEAPI;
const arr = [];
Analytics.disable();


export default class App extends React.Component {

  state = {
    apiResponse: null,
    animating:true,
    routeNameList:'',
    routeName:'',
    origin: '',
    destination: '',
    waypoints:'',
    originText: 'Campinas',
    destinationText: 'Sao Paulo',
    waypointsText:'',
    arrWaypoints:[],
    latitude:"",
    longitude:"",
    value:1,
    onRide:false

  };


  cancelSharePositionAux(){

    let obj = {
      body: {
      "user":Auth.user.username,
      "lat":"1",
      "long":"1",
      "value":1,
      "onRide":false
      }
    }
    console.log(obj)
    try {
      const apiResponse = API.put("ShareTracking", "/shareTracking", obj)
      console.log("response from saving routes: " + apiResponse);
      this.setState({apiResponse});
      return apiResponse;
    } catch (e) {
      console.log(e);
    }

  }

  sharePosition() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude:position.coords.latitude,
          longitude:position.coords.longitude,
          value:this.state.value+1,
          onRide:true
        })
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

    let obj =  {
      body: {
      "user":Auth.user.username,
      "lat":this.state.latitude,
      "long":this.state.longitude,
      "value":this.state.value,
      "onRide":this.state.onRide
      }
    }
    console.log(obj)
    try {
      const apiResponse = API.put("ShareTracking", "/shareTracking", obj)
      console.log("response from saving routes: " + apiResponse);
      this.setState({apiResponse});
      return apiResponse;
    } catch (e) {
      console.log(e);
    }



    }

 async startSharePosition(){
      this.sharePosition()
      this.interval = setInterval(() => this.sharePosition(), 8000);
    }

 async cancelSharePosition(){
  clearInterval(this.interval);
  this.cancelSharePositionAux()
    }

  async auxgetRoutes(){
   this.setState({animating:true})
     this.getRoutes(Auth.user.username);
    this.setState({animating:false})
  }

  async auxdeleteRoutes(deleteRoutes){
    this.setState({animating:true})
    await this.getRoutes(Auth.user.username);
   this.deleteRoutes(deleteRoutes);
    this.setState({animating:true})


    alert('Routes deleted successfully!');
  }


  async deleteRoutes(deleteRoutes){
    let Obj =  {
      body: await{
        "user":Auth.user.username,
        "routeName":this.state.routeNameList
      }
    }

    var indice =  await Obj.body.routeName.indexOf(deleteRoutes);
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
        const apiResponse = await API.del("Routes", "/routes/object/" + deleteRoutes);
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

  geocoderAux = () => {
  

    if(this.state.originText != '') {

        Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key

        Geocoder.from(this.state.originText)
            .then(json => {
                var location = json.results[0].geometry.location;
                console.log(location);
                this.setState({ origin: { latitude: location.lat, longitude: location.lng } });

        })
        .catch(error => console.warn(error));

    }

    else {

        alert("Digite a origem ! ")
        

    }


    

    if(this.state.destinationText != '') {

        Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key

        Geocoder.from(this.state.destinationText)
        .then(json => {
            var location = json.results[0].geometry.location;
            console.log(location);
            this.setState({ destination: { latitude: location.lat, longitude: location.lng } });
            this.handleGetGoogleMapDirections()
        })
        .catch(error => console.warn(error));
    }

    else {

        alert("Digite o destino ! ")
  
    }



    var i;
    for (i = 0; i < this.state.waypointsText.length; i++) {
         Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key
         Geocoder.from(this.state.waypointsText[i])
        .then(json => {
            var location = json.results[0].geometry.location;
            console.log(location);
            this.setState({ waypoints: { latitude: location.lat, longitude: location.lng } });
            arr.push(this.state.waypoints);
  
    })
    .catch(error => console.warn(error)); 

  }
  this.setState({arrWaypoints:arr});
  }

  handleGetGoogleMapDirections = async () => {
    await this.sharePosition()
    var data = await {

        source: await this.state.origin,
        destination: await this.state.destination,
        waypoints: await this.state.arrWaypoints,
        params: [
            {
              key: "travelmode",
              value: "driving"
            }
        ]
        
    };
      await console.log(data)
     getDirections(data);

 

  };


   openRoute =  async (item) => {
    this.sharePosition()
    console.log(item);
    


    try {
      const apiResponse =  await API.get("Routes", "/routes/object/" + item);
      await  this.setState({originText:apiResponse.origin})
      await  this.setState({destinationText:apiResponse.destination})
      await  this.setState({waypointsText:apiResponse.waypoints})

      this.setState({apiResponse});
    } catch (e) {
      console.log(e);
      return 
    }
     
      await  this.geocoderAux()    
  }





 
  componentWillMount(){
    this.auxgetRoutes();
   }

   handleChangeUser = (event) => {
    this.setState({routeName: event});
}


actionOnRow(item){
  console.log(item)
}

render(){

  return(
    <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
   <Button 
    title="List Routes"
     onPress={this.auxgetRoutes.bind(this)}  
     /> 
    <Text></Text>
    <Text></Text>

    <Button 
    
    title="Compartilhamento de Localizacao"
     onPress={this.startSharePosition.bind(this)} /> 
    <Text></Text>

    <Button 
    title="Cancelamento de Localizacao"
     onPress={this.cancelSharePosition.bind(this)} /> 


      <FlatList
      style={{ marginTop: 30 }}
      contentContainerStyle={styles.list}
      data={this.state.routeNameList}
      renderItem = {({item}) =>
      <View style={styles.listItem}>
        <TouchableOpacity onPress={() =>this.openRoute(item)}>
      <Text>{item}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress ={() => this.auxdeleteRoutes(item)} >
            <Text>X</Text>
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

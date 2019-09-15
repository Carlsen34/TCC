import React from 'react';
import AWSConfig from '../../aws-exports';

import {StyleSheet,View, Text, Button,TextInput,KeyboardAvoidingView,FlatList,TouchableOpacity } from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import DialogInput from 'react-native-dialog-input';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import getDirections from 'react-native-google-maps-directions'
import { PermissionsAndroid } from 'react-native';
import Geocoder from 'react-native-geocoding';
const GOOGLE_MAPS_APIKEY = AWSConfig.GOOGLEAPI;

const routeAPI = 'http://vrp-dev.us-east-1.elasticbeanstalk.com/api/v1/vrp/route=';
const arr = [];


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
            this.props.navigation.navigate('MapScreen', {
              origin:originText,
              waypoints:waypointsText
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


 class MapScreen extends React.Component {
  state ={
    isDialogVisible:false,
    origin: { latitude: 42.3616132, longitude: -71.0672576 },
    destination: { latitude: 42.3730591, longitude: -71.033754 },
    waypoints:{ latitude: 0, longitude: 0 },
    originText: '',
    destinationText: '',
    waypointsText:'',
    RouteName:'',
    hasRoute: false,
    arrWaypoints:[],
  }
  

  async componentDidMount() {


    const { navigation } = this.props;
    const origin = navigation.getParam('origin', '');
    const waypoints = navigation.getParam('waypoints', '');
    this.setState({
      originText:origin,
      waypointsText:waypoints
    })





  }


  render() {



      return(

          <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
 <MapView
  
  ref={map => this.mapView = map}
  style={styles.map}

  region={{
    latitude: (this.state.origin.latitude + this.state.destination.latitude) / 2,
    longitude: (this.state.origin.longitude + this.state.destination.longitude) / 2,
    latitudeDelta: Math.abs(this.state.origin.latitude - (this.state.destination.latitude  -0.2)) + Math.abs(this.state.origin.latitude - (this.state.destination.latitude -0.2)) * .1,
    longitudeDelta: Math.abs(this.state.origin.longitude - this.state.destination.longitude) + Math.abs(this.state.origin.longitude - this.state.destination.longitude) * .1,
  }}

  loadingEnabled={true}
  toolbarEnabled={true}
  zoomControlEnabled={true}
  
>

<MapView.Marker
  coordinate={this.state.destination}
>
  <MapView.Callout onPress={this.handleGetGoogleMapDirections}>
    <Text>Press to Get Direction</Text>
  </MapView.Callout>
</MapView.Marker>
{/* 
<MapView.Marker
  coordinate={this.state.waypoints}
>
</MapView.Marker> */}

<MapView.Marker
  coordinate={this.state.origin}
>
<MapView.Callout>
    <Text>This is where you are</Text>
</MapView.Callout>
</MapView.Marker>

<MapViewDirections
  origin={this.state.origin}
  waypoints={this.state.arrWaypoints}
  destination={this.state.destination}
  apikey={GOOGLE_MAPS_APIKEY}
/>

</MapView>

<DialogInput isDialogVisible={this.state.isDialogVisible}
title={"Route Name"}
message={"Enter your route name"}
hintInput ={"Enter your route name"}
submitInput={ (inputText) => {this.sendInput(inputText)} }
closeDialog={ () => { this.setState({isDialogVisible:false})}}>
</DialogInput>
{/* 
  <TextInput
      onChangeText={text => this.onChangeText('originText', text+'|')}
      style={styles.input}
      placeholder="Origin"
  />
    <TextInput
      onChangeText={text => this.onChangeText('waypointsText', text+'|')}
      style={styles.input}
      placeholder="Waypoints"
      />

    <TouchableOpacity style={styles.button} onPress={this.handleButton}>

        <Text style={styles.buttonText}>Search Route</Text>

    </TouchableOpacity> */}

    <TouchableOpacity style={styles.button} onPress={this.saveButton}>

        <Text style={styles.buttonText}>Save Route</Text>

    </TouchableOpacity>
  
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
  MapScreen: {
    screen: MapScreen,
      navigationOptions:  {
      header: null
  }
 
},


}, {
    initialRouteName: 'AddressScreen',
}



);

export default createAppContainer(AppNavigator);
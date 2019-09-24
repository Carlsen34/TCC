
import React, { Component } from 'react';
import AWSConfig from '../../aws-exports';
import {
  View,
  TouchableHighlight,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Button,
  KeyboardAvoidingView,
  StyleSheet
} from 'react-native';
import DialogInput from 'react-native-dialog-input';    
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import getDirections from 'react-native-google-maps-directions'
import { PermissionsAndroid } from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import Geocoder from 'react-native-geocoding';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 

const GOOGLE_MAPS_APIKEY = AWSConfig.GOOGLEAPI;
const routeAPI = 'http://vrp-dev.us-east-1.elasticbeanstalk.com/api/v1/vrp/route=';
const arr = [];

const backgroundColor = '#007256';

const { height, width } = Dimensions.get('window');

console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];


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
  <KeyboardAvoidingView style={styles1.container} behavior="padding">
       <Text>Rota Unica</Text>

       <TextInput
         onChangeText={value => this.onChangeText('originText', value+'|')}
         style={styles1.input}
         placeholder="Origem"
       />

      <TextInput
         onChangeText={value => this.onChangeText('waypointsText', value)}
         style={styles1.input}
         placeholder="Pontos de Parada"
       />
     
     <Button title="Criar Rota" onPress={this.saveButton.bind(this)} />    
     </KeyboardAvoidingView>
   );
 }  
}




 class MapScreen extends Component {

    state = {
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
       
    
      };


      onChangeText(key, value) {
        this.setState({
          [key]: value,
        });
      }
    
      async requestLocationPermission() {
        try {
    
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    'title': 'App Location Permission',
                    'message': 'Maps App needs access to your map ' +
                        'so you can be navigated.'
                }
            );
    
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the location");
                return true;
    
            } else {
                console.log("location permission denied");
                return false;
            }
    
        } catch (err) {
            console.warn(err)
        }
    
      }
    
      getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            let newOrigin = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
    
            console.log('new origin');
            console.log(newOrigin);
    
            this.setState({
                origin: newOrigin
            });

        }, (err) => {
            console.log('error');
            console.log(err)
    
        }, {enableHighAccuracy: true, timeout: 2000, maximumAge: 1000})
    
      };

      async componentDidMount() {
        let isGranted = await this.requestLocationPermission();

        if (isGranted) {
            this.getLocation();
        }

        this.getLocation();

        const { navigation } = this.props;
        const origin = navigation.getParam('origin', '');
        const waypoints = navigation.getParam('waypoints', '');
        this.setState({
          originText:origin,
          waypointsText:waypoints
        })
        console.log(this.state.originText)
        console.log(this.state.waypointsText)
        this.handleButton()

      }





      saveButton = () => {
          this.setState({isDialogVisible:true})
      }


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

      

        async sendInput(inputText){
        await this.setState({isDialogVisible:false}) 
        var user = Auth.user.username;
        var origin = this.state.originText
        var destination = this.state.destinationText
        var waypoints = this.state.waypointsText
        var routeName = inputText

         let objRoutes = await {
          body: {
            "routeName": routeName,
            "user": user,
            "origin":origin,
            "destination": destination,
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
          objRoutesAux.body.routeName.push(routeName);
        }else{
          objRoutesAux.body.routeName = [routeName];
        }


        await this.saveRoutes("getRoute","/getRoute",objRoutesAux);
        alert('Route saved successfully');
      };

    handleButton = () => {
       // const fullAPI = routeAPI +this.state.originText+"|" +this.state.waypointsText + '/' + 1;
        const fullAPI = routeAPI + this.state.originText.split(" ").join("+") + this.state.waypointsText.split(" ").join("+") +'/'+1
        console.log(fullAPI)
        fetch(fullAPI).then(response => response.json()).then(data => {
        var arrayAux = []
        data.Route[0].forEach(function (item, indice, array) {
         var str = item.replace("+"," ")
         arrayAux.push(str)
 
        })
        this.handleArray(arrayAux)
        })
      }



async handleArray(params) {
    await console.log(params)
    let auxArray = []
    await Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key
    await this.setState({originText: params.shift()})
    await Geocoder.from(this.state.originText)
        .then(json => {
            var location = json.results[0].geometry.location;
            console.log(location);
            this.setState({ origin: { latitude: location.lat, longitude: location.lng } });

    })
    .catch(error => console.warn(error));



    await Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key
    await this.setState({destinationText: params.pop()})
    await Geocoder.from(this.state.destinationText)
    .then(json => {
        var location = json.results[0].geometry.location;
        console.log(location);
        this.setState({ destination: { latitude: location.lat, longitude: location.lng } });

    })
    .catch(error => console.warn(error));




  var i;
  var listAux = []
  for (i = 0; i < params.length; i++) {
      console.log(params[i]) 
      await Geocoder.init(GOOGLE_MAPS_APIKEY); // use a valid API key
      await Geocoder.from(params[i])
      .then(json => {
          var location = json.results[0].geometry.location;
          console.log(location);
          this.setState({ waypoints: { latitude: location.lat, longitude: location.lng } });
          arr.push(this.state.waypoints);

  })
  .catch(error => console.warn(error)); 
  await listAux.push(params[i])
  await this.setState({waypointsText:listAux})
  await console.log(this.state.waypointsText)
}

await this.setState({arrWaypoints:arr});
await console.log(this.state.arrWaypoints)
}

  
handleGetGoogleMapDirections = async () => {
    
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
   await getDirections(data);



};

    render() {
      console.ignoredYellowBox = ['Warning: Each', 'Warning: Failed'];

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
            title={"Nome da Rota"}
            message={"Digite o nome da Rota"}
            hintInput ={"Digite o nome da Rota"}
            submitInput={ (inputText) => {this.sendInput(inputText)} }
            closeDialog={ () => { this.setState({isDialogVisible:false})}}>
          </DialogInput>

                <TouchableOpacity style={styles.button} onPress={this.saveButton}>

                    <Text style={styles.buttonText}>Save Route</Text>

                </TouchableOpacity>
    
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



const styles = StyleSheet.create({

    container: {
  
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    
      },
    
      map: {
    
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    
      },

      button: {

        width: width - 100,
        height: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 7,
        marginBottom: 15,
        marginHorizontal: 20,

      },

      buttonText: {

        color: '#000',
        fontWeight: 'bold',

      },

      inputContainer: {

        width: '100%',
        maxHeight: 200,
  
      },

      input: {

        width: width - 40,
        maxHeight: 200,
        backgroundColor: '#FFF',
        marginBottom: 15,
        marginHorizontal: 20,
  
      },

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
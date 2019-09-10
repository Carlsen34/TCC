
import React from "react";
import {StyleSheet,View, Text,Image, Button,TextInput,KeyboardAvoidingView,FlatList,TouchableOpacity } from 'react-native';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; 
import MapView, { Marker,AnimatedRegion,Polyline,PROVIDER_GOOGLE} from "react-native-maps";
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';


const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;

class AnimatedMarkers extends React.Component {
  state = {
    Friends:'',
    vehicles: []
  };



completeRoute = (user) => {
  this.props.navigation.navigate('ShareScreen', {
    user:user
}
)
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

    
    return (
<KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
 <Text>TRACKING ROUTE</Text>
      <FlatList
      style={{ marginTop: 30 }}
      contentContainerStyle={styles.list}
      data={this.state.Friends}
      renderItem = {({item}) =>
         <View style={styles.listItem}>
        <TouchableOpacity onPress={() =>this.completeRoute(item)}>
      <Text>{item}</Text>
        </TouchableOpacity>
    </View>
    }
      keyExtractor={(item, index) => index.toString()}
    />
  <Text>{this.state.vehicles}</Text>
</KeyboardAvoidingView>
    );
  }
}


class ShareScreen extends React.Component {


  
  constructor(props) {
    super(props);
    const { navigation } = this.props;

    this.state = {
    trackingSpot: { latitude: 42.3730591, longitude: -71.033754 },
    latitude: "",
    longitude: "",
    routeCoordinates: [],
    prevLatLng: {},
    userTracking:navigation.getParam('user', '')

    };
  }



  async getLocation(){
    var path = "/shareTracking/object/"+this.state.userTracking;
    try {
      const apiResponse = await API.get("ShareTracking", path);
      if(apiResponse.onRide != true){
        alert("Usuario não está em rota")
        clearInterval(this.interval);
        this.props.navigation.navigate('AnimatedMarkers')
        return
      }
      console.log("response from get routes: " + apiResponse);
      this.setState({latitude:apiResponse.lat})
      this.setState({longitude:apiResponse.long});
      this.setState({
        trackingSpot:{ latitude:apiResponse.lat, longitude:apiResponse.long }
      })

      


      console.log(apiResponse.user)
      console.log(apiResponse.lat)
      console.log(apiResponse.long)
      return apiResponse;
    } catch (e) {
      console.log(e);
    }

  }

  componentWillMount() {
    this.getLocation()
  }

componentDidMount() {
      this.interval = setInterval(() => this.getLocation(), 10000);
    }
  

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

 

  render() {

    return (
      <View style={styles1.container}>
      <MapView
          ref={map => this.mapView = map}
          style={styles1.map}
          region={{
            latitude: (this.state.latitude  + this.state.latitude) / 2,
            longitude: (this.state.longitude + this.state.longitude) / 2,
            latitudeDelta: Math.abs(this.state.latitude - (this.state.latitude -0.02)) + Math.abs(this.state.latitude - (this.state.latitude -0.02)) * .1,
            longitudeDelta: Math.abs(this.state.longitude - this.state.longitude) + Math.abs(this.state.longitude - this.state.longitude) * .1,
          }}

          loadingEnabled={true}
          toolbarEnabled={true}
       
        >



          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.trackingSpot}
          >
            <Image
              source={require("./car.png")}
              style={{ height: 35, width: 35 }}
            />
          </Marker.Animated>
        </MapView>
      </View>
    );
  }
}




const styles1 = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
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
    AnimatedMarkers: {
      screen: AnimatedMarkers,
        navigationOptions:  {
        header: null
    }
    },

   

  
      ShareScreen: {
      screen: ShareScreen,
        navigationOptions:  {
        header: null
    }
   
  },
  
  }, {
      initialRouteName: 'AnimatedMarkers',
  }
  
  
  
  );

export default AppNavigator;
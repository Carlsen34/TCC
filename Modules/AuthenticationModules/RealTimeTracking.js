
import React from "react";
import {StyleSheet,View,Image,Text,TouchableOpacity,Platform,PermissionsAndroid} from "react-native";
import MapView, { Marker,AnimatedRegion,Polyline,PROVIDER_GOOGLE} from "react-native-maps";
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';



class AnimatedMarkers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    trackingSpot: { latitude: 42.3730591, longitude: -71.033754 },
    latitude: "",
    longitude: "",
    routeCoordinates: [],
    prevLatLng: {},

    };
  }



  async getLocation(){
    var path = "/shareTracking/object/"+"edmar";
    try {
      const apiResponse = await API.get("ShareTracking", path);
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
      this.interval = setInterval(() => this.getLocation(), 2000);
    }
  

  getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
  });

 

  render() {
    return (
      <View style={styles.container}>
      <MapView
          ref={map => this.mapView = map}
          style={styles.map}
          region={{
            latitude: (this.state.latitude  + this.state.latitude) / 2,
            longitude: (this.state.longitude + this.state.longitude) / 2,
            latitudeDelta: Math.abs(this.state.latitude - (this.state.latitude -0.01)) + Math.abs(this.state.latitude - (this.state.latitude -0.01)) * .1,
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

const styles = StyleSheet.create({
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

export default AnimatedMarkers;
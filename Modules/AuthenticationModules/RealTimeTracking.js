import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity
} from "react-native";
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';


export default class App extends Component {
  state = {
    user:"teste",
    latitude:null,
    longitude:null,
    value: 1
  };

  componentWillMount = () => {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude:position.coords.latitude,
          longitude:position.coords.longitude,
          value:this.state.value+1

        })

        let obj =  {
          body: {
          "user":this.state.user,
          "lat":this.state.latitude,
          "long":this.state.longitude,
          "value":this.state.value
          }
        }
        try {
          const apiResponse = API.put("ShareTracking", "/shareTracking", obj)
          console.log("response from saving routes: " + apiResponse);
          this.setState({apiResponse});
          return apiResponse;
        } catch (e) {
          console.log(e);
        }



      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );

  };


  sharePosition() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.setState({
          latitude:position.coords.latitude,
          longitude:position.coords.longitude,
          value:this.state.value+1
        })

        let obj =  {
          body: {
          "user":this.state.user,
          "lat":this.state.latitude,
          "long":this.state.longitude,
          "value":this.state.value
          }
        }
        try {
          const apiResponse = API.put("ShareTracking", "/shareTracking", obj)
          console.log("response from saving routes: " + apiResponse);
          this.setState({apiResponse});
          return apiResponse;
        } catch (e) {
          console.log(e);
        }


      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
    }

componentDidMount() {
      this.interval = setInterval(() => this.sharePosition(), 20000);
    }

  render() {
    return (
      <View style={styles.container}>
          <Text>Latitude: {this.state.latitude}</Text>
          <Text>Longitude: {this.state.longitude}</Text>
          <Text>Value: {this.state.value}</Text>


      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F5FCFF"
    },
    welcome: {
      fontSize: 20,
      textAlign: "center",
      margin: 10
    },
    instructions: {
      textAlign: "center",
      color: "#333333",
      marginBottom: 5
    }
  });
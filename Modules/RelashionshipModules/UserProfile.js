import React from 'react';
import { TextInput, Button, StyleSheet, Text, View,KeyboardAvoidingView,FlatList,ActivityIndicator,TouchableOpacity} from 'react-native';
import Amplify,{ Auth,API,Analytics} from 'aws-amplify';
import AWSConfig from '../../aws-exports';
var AWS = require('aws-sdk');
Analytics.disable();

export default class UserProfile extends React.Component {
    
    state = {
        originText: '',
        destinationText: '',
        waypointsText:'',
        RouteName:'',
        shareUser:'',
        hasRoute: false,
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


    auxShareRoute = async(item) => {
        try {
            const apiResponse =  await API.get("Routes", "/routes/object/" + item);
            await  this.setState({originText:apiResponse.origin})
            await  this.setState({destinationText:apiResponse.destination})
            this.setState({apiResponse});
          } catch (e) {
            console.log(e);
            return 
          }
    }


    shareRoute =  async (shareRoute,shareName) => {
        await this.auxShareRoute(shareRoute);

        var AuthUser = Auth.user.username
        var user = shareName
        var origin = this.state.originText
        var destination = this.state.destinationText
        var waypoints = this.state.waypointsText
        var RouteName = shareRoute +"-"+ Auth.user.username

         let objRoutes = await {
          body: {
            "routeName": RouteName,
            "user": user,
            "origin":origin,
            "destination": destination,
            //"waypoints":waypoints
            
            
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
        this.auxgetRoutes();
        alert('Route shared successfully ');
      };

       
    

    componentWillMount(){
        this.auxgetRoutes();
       }


  render() {
    const { navigation } = this.props;
    const name = navigation.getParam('name', 'some default value');


    return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <Text>Share Route Screen</Text>
        <Text>name: {name}</Text>
     
            <FlatList
            style={{ marginTop: 30 }}
            contentContainerStyle={styles.list}
            data={this.state.routeNameList}
            renderItem = {({item}) =>
            <View style={styles.listItem}>
              <TouchableOpacity onPress={() =>this.shareRoute(item,name)}>
            <Text>{item}</Text>
              </TouchableOpacity>
          </View>
          }
            keyExtractor={(item, index) => index.toString()}
          />
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
    
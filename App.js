import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import Amplify, { Auth,Analytics } from 'aws-amplify';
import AWSConfig from './aws-exports';
Amplify.configure(AWSConfig);
Analytics.disable();


import Tabs from './Modules/AuthenticationModules/Tabs';
import OptionsTabs from './Modules/OptionsTabs'
export default class App extends React.Component {
  state = {
    isAuthenticated: false,
  };
  authenticate = isAuthenticated => {
    this.setState({ isAuthenticated });
  };
  render() {
    if (this.state.isAuthenticated) {
      console.log('Auth: ', Auth);
      return (
        <OptionsTabs/>
      );
    }
    return (
      <View style={styles.container}>
        <Tabs
          screenProps={{
            authenticate: this.authenticate,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
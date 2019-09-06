
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';

import SignIn from './SignIn';
import SignUp from './SignUp';
import RealTimeTracking from './RealTimeTracking';


const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      SignIn,
      SignUp,
      RealTimeTracking
    },
    {
      tabBarOptions: {
        labelStyle: {
          fontSize: 16,
        },
        tabStyle: {
          justifyContent: 'center',
          flex: 1,
        },
        showIcon: false,
      },
    },
  ),
);
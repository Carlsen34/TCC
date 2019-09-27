
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';

import Conectar from './SignIn';
import Cadastrar from './SignUp';
import test from './Test';



const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      Conectar,
      Cadastrar
      
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
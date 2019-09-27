
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';


import Compartilhada from './CreateRoutes';
import Propria from './Routes';



const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      Compartilhada,
      Propria,

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
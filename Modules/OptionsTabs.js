
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';

import Relationship from './RelashionshipModules/ListUserRoutes';
import VRP from './RoutesModules/CreateRoutes';
import SMP from './RoutesModules/Routes';
import LoadRoutes from './RoutesModules/LoadRoutes';
import Tracking from './RoutesModules/Tracking';


const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      Relationship,
      VRP,
      SMP,
      LoadRoutes,
      Tracking,
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
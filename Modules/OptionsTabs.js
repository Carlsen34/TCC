
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';

import Relationship from './RelashionshipModules/ListUserRoutes';
import CreateRoutes from './RoutesModules/CreateRoutes';
import LoadRoutes from './RoutesModules/LoadRoutes';

const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      Relationship,
      CreateRoutes,
      LoadRoutes,
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
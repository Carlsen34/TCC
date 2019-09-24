
import { Platform } from 'react-native';
import { createAppContainer, createBottomTabNavigator } from 'react-navigation';

import Contatos from './RelashionshipModules/ListUserRoutes';

import Criar from './RoutesModules/RoutesTab';
import Carregar from './RoutesModules/LoadRoutes';
import Rastreamento from './RoutesModules/Tracking';


const createApp = Platform.select({
  default: createAppContainer,
});

export default createApp(
  createBottomTabNavigator(
    {
      Contatos,
      Criar,
      Carregar,
      Rastreamento,
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
import UserProfile from './ShareRoutes';
import ListUsers from './ListUsers';
import { createAppContainer, createStackNavigator, StackActions, NavigationActions } from 'react-navigation'; // Version can be specified in package.json



const AppNavigator = createStackNavigator({
    ListUsers: {
      screen: ListUsers,
      navigationOptions:  {
      header: null
  }
    },
    UserProfile: {
      screen: UserProfile,
       navigationOptions:  {
      header: null
  }
    },
  }, {
      initialRouteName: 'ListUsers',
  });
  
  export default createAppContainer(AppNavigator);
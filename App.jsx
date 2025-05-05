import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import auth from '@react-native-firebase/auth';
import Login from "./components/Auth/Login";
import CreatAccont from "./components/Auth/CreatAccont"; // Utilisez le nom EXACT du fichier
import Home from "./components/Main/Home";
import Icon from 'react-native-vector-icons/Ionicons';
import Add from "./components/Main/Add";
import Explore from "./components/Main/Explore";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNav (){
  return(
    <Tab.Navigator 
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
switch (route.name){
  case 'Home':
    iconName='home';
    break;
    case 'Add' :
      iconName='add-circle';
      break;
      case'Explore':
      iconName='person'
      break ;
}
        // if (route.name === 'Accueil') {
        //   iconName = focused ? 'home' : 'home-outline';
        // } else if (route.name === 'add') {
        //   iconName = 'Add-circle';
        // } else if (route.name === 'profile') {
        //   iconName = focused ? 'person' : 'person-outline';
        // }

        return <Icon name={iconName} size={size} color={color} />;
      },
      
      tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#FBD38D',
          height: 60,
          borderTopLeftRadius: 10,
         
          borderTopRightRadius: 10,
        },
        headerShown: false
      })}
      >
        <Tab.Screen name="Home" component={Home} options={{  tabBarIcon: ({ color, size }) => (
      <Icon name="home-outline" color={color} size={size} />
    ),}} />
        <Tab.Screen name="Add" component={Add} options={{ tabBarLabel: 'Ajouter'}} />
        <Tab.Screen name="Explore" component={Explore} options={{ tabBarLabel: 'profil'}} />
      </Tab.Navigator>
  )
}


export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
      setUser(user);
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "CreatAccont"}
        screenOptions={{
          headerStyle: { backgroundColor: '#E1B055' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="CreatAccont"
          component={CreatAccont}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={TabNav} options={{ headerShown: false }} />
        <Stack.Screen name="Add" component={Add} options={{ headerShown: false }} />
        <Stack.Screen name="Explore" component={Explore} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
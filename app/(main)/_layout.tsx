import { Tabs } from 'expo-router/tabs';
import { Image } from 'react-native';

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarShowLabel: false }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/icons/material-symbols_home-rounded.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#000000' : '#8e8e93',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(edit)"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/icons/ph_plus-fill.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#000000' : '#8e8e93',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/icons/tabler_user-filled.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#000000' : '#8e8e93',
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

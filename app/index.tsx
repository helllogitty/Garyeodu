import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
    const router = useRouter(); // 추가
    const isLoggedIn = async () => {
        try {
        const user = await AsyncStorage.getItem('USER');
        return user !== null;
        } catch (error) {
        console.error('Error checking login status:', error);
        return false;
        }
    };

    useEffect(() => {
                                        
        const timer = setTimeout(async () => {
            // router.replace(await isLoggedIn() ? "/(main)" : "/(login)");
            router.replace('/(edit)')
        }, 3000);

        return () => clearTimeout(timer);
                            
    }, [isLoggedIn ]);


  return <View></View>;
}
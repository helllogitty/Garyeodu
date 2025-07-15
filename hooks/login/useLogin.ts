import { SigninDto } from "@/types/dto/authDto";
import { util_signIn } from "@/util/util_signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";

export const useLogin = () =>{

    const [emailText, setEmailText] = useState("");
    const [passText, setPassText] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const signinDto = new SigninDto()
    signinDto.email = emailText
    signinDto.password = passText

    const login = async() =>{
        if (isChecked && emailText && passText) {
            try {
                await AsyncStorage.setItem('USER', JSON.stringify(signinDto));
                console.log("성공")
            } catch (error) {
                console.error("로그인 실패:", error);
            }
        }
        util_signIn(signinDto)
        router.replace("/(main)");
    }

    return {emailText, passText ,isChecked, setEmailText, setPassText, setIsChecked, login}
}
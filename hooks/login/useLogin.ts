import { SigninDto } from "@/types/dto/authDto";
import { util_signIn } from "@/util/util_signin";
import { useState } from "react";
import { AmbientLight } from "three/src/Three.Core.js";

export const useLogin = () =>{

    const [emailText, setEmailText] = useState("");
    const [passText, setPassText] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const signinDto = new SigninDto()
    signinDto.email = emailText
    signinDto.password = passText

    const login = async() =>{
        util_signIn(signinDto)
    }

    return {emailText, passText ,isChecked, setEmailText, setPassText, setIsChecked, login}
}
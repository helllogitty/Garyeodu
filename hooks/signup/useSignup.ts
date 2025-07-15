import { SignupDto } from "@/types/dto/authDto";
import { util_signUp } from "@/util/util_signup";
import { useState } from "react";

export const useSignup = () =>{

    const [emailText, setEmailText] = useState("");
    const [nameText, setNameText] = useState("");
    const [passText, setPassText] = useState("");
    const [checkPassword, setCheckPassword] = useState('');

    const signupDto = new SignupDto()
    signupDto.email = emailText
    signupDto.name = nameText
    signupDto.password = passText

    const signup = async() =>{
        util_signUp(signupDto)
    }

    return {emailText, passText, nameText, checkPassword, setEmailText, setPassText, setNameText, setCheckPassword, signup}
}
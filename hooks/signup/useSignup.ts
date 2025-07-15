import { useState } from "react";

export const useSignup = () =>{

    const [emailText, setEmailText] = useState("");
    const [nameText, setNameText] = useState("");
    const [passText, setPassText] = useState("");
    const [checkPassword, setCheckPassword] = useState('');

    const signup = async() =>{

    }

    return {emailText, passText, nameText, checkPassword, setEmailText, setPassText, setNameText, setCheckPassword, signup}
}
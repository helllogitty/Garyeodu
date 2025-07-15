import { useState } from "react";

export const useLogin = () =>{

    const [emailText, setEmailText] = useState("");
    const [passText, setPassText] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    const login = async() =>{

    }

    return {emailText, passText ,isChecked, setEmailText, setPassText, setIsChecked, login}
}
import { useState } from "react";

export const useLogin = () =>{

    const [telText, setTelText] = useState("");
    const [passText, setPassText] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    // const [error, setError] = useState("")

    const login = async() =>{

    }

    return {telText, passText ,isChecked, setTelText, setPassText, setIsChecked, login}
}
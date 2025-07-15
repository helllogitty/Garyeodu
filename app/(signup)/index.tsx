import * as S from './style';
import StyledBtn from "@/components/ui/StyledBtn";
import StyledInput from "@/components/ui/StyledInput";
import { useSignup } from "@/hooks/signup/useSignup";
import { router } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
    const {emailText, passText, nameText, checkPassword, setEmailText, setPassText, setNameText, setCheckPassword, signup} = useSignup();
    
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <S.Container>
          <S.LogoView>
            <S.Logo>가려두</S.Logo>
          </S.LogoView>
          <S.TextInputView>
          <StyledInput
              placeholder="이메일를 입력하세요"
              value={emailText}
              onChangeText={setEmailText}
            />
            <StyledInput
              placeholder="이름를 입력하세요"
              value={nameText}
              onChangeText={setNameText}
              keyboardType="phone-pad"
            />
            <StyledInput 
              placeholder="비밀번호를 입력하세요"
              value={passText}
              onChangeText={setPassText}
              secureTextEntry
            />
            <StyledInput 
              placeholder="비밀번호를 다시 입력하세요"
              value={checkPassword}
              onChangeText={setCheckPassword}
              secureTextEntry
              error={(checkPassword !== "" && passText !== checkPassword) ? true : false }
              errorMessage= '비밀번호가 일치하지 않습니다'
            />
            <StyledBtn
              label="회원가입" 
              isActive={true} 
              onPress={() => {
                  signup()
              }}
            />
          </S.TextInputView>
        </S.Container>
      </SafeAreaView>
    );
  }
  export default Login;
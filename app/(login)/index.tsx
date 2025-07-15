import * as S from './style';
import StyledBtn from "@/components/ui/StyledBtn";
import StyledInput from "@/components/ui/StyledInput";
import { useLogin } from "@/hooks/login/useLogin";
import colors from "@/constants/baseColors";
import { router } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
    const {telText, passText, isChecked, setTelText, setPassText, setIsChecked} = useLogin();
  
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor : colors.gray5 }}>
        <S.Container>
          <S.LogoView>
            <Text>가려두</Text>
          </S.LogoView>
          <S.TextInputView>
            <StyledInput
              placeholder="전화번호를 입력하세요"
              value={telText}
              onChangeText={setTelText}
              keyboardType="phone-pad"
            />
            <StyledInput 
              placeholder="비밀번호를 입력하세요"
              value={passText}
              onChangeText={setPassText}
              secureTextEntry
            />

            <S.SaveIdView>
                <S.SaveIdBtn isChecked={isChecked}
                    onPress={() => setIsChecked(!isChecked)}
                    >
                <S.SaveIdBtnIcon source={require("../../assets/images/check.png")} style={isChecked && {tintColor : colors.primary, width : 10, height : 10}}/>
                </S.SaveIdBtn>
                <Text style={{textAlign : "center", height : 20, lineHeight : 20}}>아이디 저장</Text>
            </S.SaveIdView>
            <StyledBtn
              label="로그인" 
              isActive={true} 
              onPress={()=>{}}
            />
            <View style={{flexDirection : "row", justifyContent : "center", gap : 5}}>
                <Text>아직 계정이 없다면?</Text>
                <Text 
                    onPress={()=> {router.replace("/(login)")}}
                    style={{color : colors.primary, textDecorationLine : "underline"}}
                    >
                    회원가입
                </Text>
   
            </View>
          </S.TextInputView>
          <TouchableOpacity style={{backgroundColor:'black'}}>
            
          </TouchableOpacity>
        </S.Container>
      </SafeAreaView>
    );
  }
  export default Login;

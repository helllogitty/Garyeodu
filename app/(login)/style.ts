import styled from "styled-components/native";
import colors from "@/constants/baseColors";

export const Container = styled.View`
    flex:1;
    padding:0 20px;
    background-color: ${colors.gray5};
`
export const LogoView = styled.View`
    flex:0.8%;
    justify-content: center;
    align-items: center;
`
export const TextInputView = styled.View`
    flex:2;
    gap:12px;
`
export const Input = styled.TextInput`
    border: 1px solid ${colors.gray5};
    border-radius: 16;
    height: 60;
    padding: 0 16px;
    font-size: 16;
    background-color: ${colors.gray5};
`
export const InputFocused = styled.View`
  border-color: ${colors.primary};
  background-color: ${colors.primary10};
`
export const SaveIdView = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 22px;
  gap: 5px;
`
export const SaveIdBtn = styled.TouchableOpacity<{isChecked:boolean}>`
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border-color: ${({isChecked}) => isChecked ? colors.primary : colors.gray3};
  border-width: 1px;
  border-radius: 6px;
`
export const SaveIdBtnIcon = styled.Image`
  width: 10px;
  height: 10px;
`;
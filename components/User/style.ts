import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #fff;
`;

export const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;

export const ProfileSection = styled.View`
  align-items: center;
  margin: 20px 0;
`;

export const Avatar = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;
export const ChangeText = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: #888;
`;

export const Username = styled.Text`
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
`;

export const InfoSection = styled.View`
  margin: 0 16px;
  padding: 20px;
`;

export const OptionText = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px; 
`;


export const Logout = styled.Text`
  font-size: 16px;
  color: red;
  margin-bottom: 10px;
`;

export const DeleteAccount = styled.Text`
  font-size: 16px;
  color: red;
`;
export const Divider = styled.View`
  width: 100%;
  height: 1px;
  background-color: #E0E0E0; 
  margin-top: 4px;
  margin-bottom: 12px; 
`;
import styled from 'styled-components/native';
import colors from '@/styles/colors';


export const Container = styled.View`
  flex: 1;
  gap: 20px;
`;

export const Buttons = styled.View`
    gap:12px;
`;

export const PreviewContainer = styled.View`
  margin-bottom: 20px;
  align-items: center;
`;

export const PreviewImage = styled.Image`
  width: 200px;
  height: 200px;
  border-radius: 10px;
  margin-bottom: 10px;
`;

export const SelectButton = styled.TouchableOpacity`
    background-color: ${colors.black};
  padding: 10px 20px;
  border-radius: 8px;
`;


import styled from "styled-components/native";
import colors from "@/styles/colors";
import typography from "@/styles/typography";
import { ThemedText } from "@/components/ThemedText";

export const Btn = styled.TouchableOpacity`
  background-color: ${colors.primary};
  height: 60px;
  border-radius: 16px;
  justify-content: center;
  align-items: center;
`;

export const BtnText = styled(ThemedText)`
  color: ${colors.white};
  font-size: ${typography.bodyNormal.fontSize}px;
  font-family: ${typography.bodyNormal.fontFamily};
`;
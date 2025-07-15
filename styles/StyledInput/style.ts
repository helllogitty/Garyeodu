import styled from "styled-components/native";
import colors from "@/styles/colors";
import typography from "@/styles/typography";
import { ThemedText } from "@/components/ThemedText";

export const Input = styled.TextInput`
  background-color: ${colors.gray5};
  border-width: 1px;
  border-style: solid;
  border-color: ${colors.gray3};
  border-radius: 16px;
  height: 60px;
  align-items: center;
  padding: 0 20px;
  color: ${colors.black};
  font-size: ${typography.bodySmall2.fontSize}px;
  font-family: ${typography.bodySmall2.fontFamily};
`
export const ErrorText = styled(ThemedText)`
  margin: 10px 0 0 0;
  color: ${colors.error};
  font-size: ${typography.bodySmall2.fontSize}px;
  font-family: ${typography.bodySmall2.fontFamily};
`
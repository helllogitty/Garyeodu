import styled from "styled-components/native";

// 헤더 영역 (상단 바)
export const Layout = styled.View`
  height: 44px;
  flex-direction: row;
  justify-content: space-between;
  padding: 10px 0;
  margin-bottom: 30px;
`;

export const TitleContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
`

export const Icon = styled.Image`
  width: 24px;
  height: 24px;
  resize-mode: cover;
`
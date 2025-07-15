import styled from "styled-components/native";

// 헤더 영역 (상단 바)
export const Layout = styled.View`
  height: 44px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  margin-bottom: 30px;
`;

export const TitleContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 0;
  right: 0;
`;

export const IconContainer = styled.View`
  width: 24px;
  height: 24px;
  z-index: 1;
`;

export const Icon = styled.Image`
  width: 24px;
  height: 24px;
  resize-mode: cover;
`;
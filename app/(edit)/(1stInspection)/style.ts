import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  padding: 20px;
`;

export const TitleSection = styled.View`
  margin-bottom: 30px;
  align-items: center;
`;

export const ImageContainer = styled.View`
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const ImageWrapper = styled.View`
  position: relative;
`;

export const DetectionCircle = styled.View`
  position: absolute;
  border: 3px solid #FF4444;
  border-radius: 50px;
  background-color: rgba(255, 68, 68, 0.1);
`;

export const DetectionList = styled.View`
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
`;

export const DetectionItem = styled.View`
  margin-bottom: 5px;
`;
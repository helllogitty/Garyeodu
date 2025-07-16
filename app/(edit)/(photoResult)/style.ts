import styled from "styled-components/native";

export const Container = styled.View`
  flex: 1;
  padding: 20px;
`;

export const CenterContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export const TitleSection = styled.View`
  margin-bottom: 20px;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 15px;
`;

export const ImageSection = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-vertical: 20px;
`;

export const ImageWrapper = styled.View`
  position: relative;
`;

export const ComparisonOverlay = styled.View`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const ComparisonLabel = styled.View<{ showing: boolean }>`
  background-color: ${(props:any) => props.showing ? '#e74c3c' : '#27ae60'};
  padding: 6px 12px;
  border-radius: 15px;
  border-width: 2px;
  border-color: #fff;
`;

// 블러 컨테이너
export const BlurContainer = styled.View`
  position: absolute;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 5;
`;

// 블러 위 오버레이
export const BlurOverlay = styled.View`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(200, 200, 200, 0.3);
  border: 1px solid rgba(150, 150, 150, 0.5);
`;

// 감지된 영역 원형 (빨간 테두리)
export const DetectionCircle = styled.View`
  position: absolute;
  border: 3px solid #FF4444;
  border-radius: 50px;
  background-color: rgba(255, 68, 68, 0.1);
`;

export const DebugInfo = styled.View`
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  align-items: center;
`;

export const BottomSection = styled.View`
  margin-top: 10px;
`;

export const DetectionList = styled.View`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 10px;
`;

export const DetectionItem = styled.View`
  margin-bottom: 5px;
`;

export const ActionButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 10px;
`;

export const ActionButton = styled.TouchableOpacity`
  flex: 1;
  padding: 15px;
  margin: 0 5px;
  border-radius: 8px;
  background-color: #fff;
  border-width: 1px;
  border-color: #e0e0e0;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
  align-items: center;
`;

export const ButtonContainer = styled.View`
  gap: 10px;
`;
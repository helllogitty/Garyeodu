import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Image, Dimensions } from 'react-native';
import CustomView from '@/components/ui/CustomView';
import { ThemedText } from '@/components/ThemedText';
import { detectPersonalInfo } from '@/util/util_image_1st';
import * as S from './style';

const FirstInspection = () => {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const screenWidth = Dimensions.get('window').width;
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [detectedAreas, setDetectedAreas] = useState<Array<{x: number, y: number, width: number, height: number, type: string}>>([]);

  useEffect(() => {
    if (imageUri) {
      // 이미지 원본 크기 계산
      Image.getSize(imageUri, (width, height) => {
        setOriginalDimensions({ width, height });
        
        const maxWidth = screenWidth * 0.8;
        const maxHeight = 400;
        
        const ratio = width / height;
        
        let newWidth = maxWidth;
        let newHeight = maxWidth / ratio;
        
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * ratio;
        }
        
        setImageDimensions({ width: newWidth, height: newHeight });
      });

      handleDetectAndMosaic();
    }
  }, [imageUri, screenWidth]);

  const handleDetectAndMosaic = async () => {
    try {
      // 이미지를 Buffer로 변환
      const response = await fetch(imageUri);
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      
      // 개인정보 감지
      const result = await detectPersonalInfo(imageBuffer) as { "이미지 파일 개인정보 문제"?: Record<string, { 위치: { x: number, y: number, width: number, height: number }, 종류: string }> };
      
      if (result && result["이미지 파일 개인정보 문제"]) {
        const detectedInfo = result["이미지 파일 개인정보 문제"];
        const areas: Array<{x: number, y: number, width: number, height: number, type: string}> = [];
        
        Object.values(detectedInfo).forEach((info: any) => {
          if (info.위치 && info.종류) {
            areas.push({
              x: info.위치.x,
              y: info.위치.y,
              width: info.위치.width,
              height: info.위치.height,
              type: info.종류
            });
          }
        });
        
        setDetectedAreas(areas);
      }
    } catch (error) {
      console.error('개인정보 감지 실패:', error);
    }
  };

  // 좌표를 화면 크기에 맞게 변환하는 함수
  const scaleCoordinates = (area: {x: number, y: number, width: number, height: number}) => {
    const scaleX = imageDimensions.width / originalDimensions.width;
    const scaleY = imageDimensions.height / originalDimensions.height;
    
    return {
      x: area.x * scaleX,
      y: area.y * scaleY,
      width: area.width * scaleX,
      height: area.height * scaleY
    };
  };

  return (
    <CustomView
      title="1차 검수"
      onPressLeftIcon={() => router.back()}
    >
      <S.Container>
        <S.TitleSection>
          <ThemedText type="HeadingSmall" style={{ textAlign: 'center', marginBottom: 10 }}>
            민감 정보가 발견되었어요
          </ThemedText>
          <ThemedText type="bodyNormal" style={{ textAlign: 'center', color: '#666' }}>
            개인정보 보호를 위해 확인해주세요
          </ThemedText>
        </S.TitleSection>

        <S.ImageContainer>
          {imageUri && imageDimensions.width > 0 && (
            <S.ImageWrapper>
              <Image 
                source={{ uri: imageUri }} 
                style={{
                  width: imageDimensions.width,
                  height: imageDimensions.height,
                }}
                resizeMode="contain"
              />
              
              {/* 감지된 영역에 동그라미 표시 */}
              {detectedAreas.map((area, index) => {
                const scaledArea = scaleCoordinates(area);
                const centerX = scaledArea.x + scaledArea.width / 2;
                const centerY = scaledArea.y + scaledArea.height / 2;
                const radius = Math.max(scaledArea.width, scaledArea.height) / 2 + 10; // 약간 더 큰 원
                
                return (
                  <S.DetectionCircle
                    key={index}
                    style={{
                      left: centerX - radius,
                      top: centerY - radius,
                      width: radius * 2,
                      height: radius * 2,
                    }}
                  />
                );
              })}
            </S.ImageWrapper>
          )}
        </S.ImageContainer>

        {/* 감지된 정보 목록 */}
        {detectedAreas.length > 0 && (
          <S.DetectionList>
            <ThemedText type="bodyMedium" style={{ marginBottom: 10, fontWeight: 'bold' }}>
              감지된 개인정보:
            </ThemedText>
            {detectedAreas.map((area, index) => (
              <S.DetectionItem key={index}>
                <ThemedText type="bodySmall1">
                  • {area.type}
                </ThemedText>
              </S.DetectionItem>
            ))}
          </S.DetectionList>
        )}
      </S.Container>
    </CustomView>
  );
};

export default FirstInspection;


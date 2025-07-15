import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Image, Dimensions, ActivityIndicator } from 'react-native';
import CustomView from '@/components/ui/CustomView';
import { ThemedText } from '@/components/ThemedText';
import { detectPersonalInfoAPI } from '@/hooks/detectPersonalInfoAPI';
import * as S from './style';
import StyledBtn from '@/components/ui/StyledBtn';

interface DetectedArea {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

const FirstInspection = () => {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const screenWidth = Dimensions.get('window').width;

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [detectedAreas, setDetectedAreas] = useState<DetectedArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);

  useEffect(() => {
    if (imageUri) {
      // 이미지 크기 계산
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

      // 자동으로 개인정보 감지 실행
      handleDetectPersonalInfo();
    }
  }, [imageUri, screenWidth]);

  const handleDetectPersonalInfo = async () => {
    if (!imageUri) return;

    setIsLoading(true);
    try {
      const result = await detectPersonalInfoAPI(imageUri);

      // API 응답 구조에 맞게 파싱 (실제 API 응답 구조에 따라 수정 필요)
      if (result && result.data) {
        const areas: DetectedArea[] = [];

        // API 응답 구조가 확실하지 않으므로 여러 가능성 고려
        const detectedData = result.data["이미지 파일 개인정보 문제"] || result.data || result;

        if (typeof detectedData === 'object') {
          Object.values(detectedData).forEach((info: any) => {
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
        }

        setDetectedAreas(areas);
        setHasDetected(true);
      }
    } catch (error) {
      console.error('개인정보 감지 실패:', error);
      // 에러 시 사용자에게 알림
      setHasDetected(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 좌표를 화면 크기에 맞게 변환
  const scaleCoordinates = (area: DetectedArea) => {
    const scaleX = imageDimensions.width / originalDimensions.width;
    const scaleY = imageDimensions.height / originalDimensions.height;

    return {
      x: area.x * scaleX,
      y: area.y * scaleY,
      width: area.width * scaleX,
      height: area.height * scaleY
    };
  };

  const handleNext = () => {
    router.push({
      pathname: '/(edit)/(aiPhotoEdit)',
      params: {
        imageUri: imageUri,
        detectedAreas: JSON.stringify(detectedAreas)
      }
    });
  };

  return (
    <CustomView
      title="1차 검수"
      onPressLeftIcon={() => router.back()}
    >
      <S.Container>
        <S.TitleSection>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText type="bodyNormal" style={{ textAlign: 'center', marginTop: 10 }}>
                개인정보를 감지하고 있습니다...
              </ThemedText>
            </>
          ) : hasDetected ? (
            detectedAreas.length > 0 ? (
              <>
                <ThemedText type="HeadingSmall" style={{ textAlign: 'center', marginBottom: 10 }}>
                  민감 정보가 발견되었어요
                </ThemedText>
                <ThemedText type="bodyNormal" style={{ textAlign: 'center', color: '#666' }}>
                  개인정보 보호를 위해 확인해주세요
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="HeadingSmall" style={{ textAlign: 'center', marginBottom: 10 }}>
                  민감 정보가 발견되지 않았습니다
                </ThemedText>
                <ThemedText type="bodyNormal" style={{ textAlign: 'center', color: '#666' }}>
                  안전한 이미지입니다
                </ThemedText>
              </>
            )
          ) : null}
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
                const radius = Math.max(scaledArea.width, scaledArea.height) / 2 + 15;

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

        {/* 다음 단계 버튼 */}
        {hasDetected && !isLoading && (
          <>
            {detectedAreas.length > 0 ? (
              <StyledBtn
                label="다음 단계로"
                onPress={handleNext}
                isActive={true}
              />
            ) : (
              <StyledBtn
                label="처음으로"
                onPress={() => {router.dismiss(1)}} // 또는 router.back() 여러 번
                isActive={true}
              />
            )}
          </>
        )}
      </S.Container>
    </CustomView>
  );
};

export default FirstInspection;


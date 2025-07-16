import { ThemedText } from "@/components/ThemedText";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import { detectPersonalInfoAPI } from "@/hooks/detectPersonalInfoAPI";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  View,
} from "react-native";
import * as S from "./style";

// ✅ 서버 응답 타입
type RawDetectedArea = {
  [key: string]: {
    위치: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    종류: string;
  };
};

// ✅ 화면 렌더링용 타입
interface ParsedDetectedArea {
  위치: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  종류: string;
}

const FirstInspection = () => {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const screenWidth = Dimensions.get("window").width;

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [rawDetectedAreas, setRawDetectedAreas] = useState<RawDetectedArea | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  const [result, setResult] = useState<RawDetectedArea | null>(null);

  // ✅ 화면 표시용으로 배열로 변환
  const parsedAreas: ParsedDetectedArea[] = useMemo(() => {
    return rawDetectedAreas ? Object.values(rawDetectedAreas) : [];
  }, [rawDetectedAreas]);

  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (width, height) => {
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
        },
        (error) => {
          console.error("이미지 크기 가져오기 실패:", error);
          Alert.alert("오류", "이미지를 불러올 수 없습니다.");
        }
      );

      handleDetectPersonalInfo();
    }
  }, [imageUri, screenWidth]);

  const handleDetectPersonalInfo = async () => {
    if (!imageUri) return;
    setIsLoading(true);
    setHasDetected(false);

    try {
      const imageFile = {
        uri: imageUri,
        type: "image/jpeg",
        name: "image.jpg",
      };

      const result = await detectPersonalInfoAPI(imageFile);
      setResult(result)
      const detectedData = result["이미지 파일 개인정보 문제"];

      if (detectedData && typeof detectedData === "object") {
        setRawDetectedAreas(detectedData);
        console.log(detectedData)
      } else {
        setRawDetectedAreas(null);
      }
    } catch (error) {
      console.error("개인정보 감지 실패:", error);
      Alert.alert(
        "오류",
        "개인정보 감지 중 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해주세요.",
        [
          { text: "다시 시도", onPress: () => handleDetectPersonalInfo() },
          { text: "취소", style: "cancel" },
        ]
      );
    } finally {
      setIsLoading(false);
      setHasDetected(true);
    }
  };

  const scaleCoordinates = (area: ParsedDetectedArea) => {
    if (originalDimensions.width === 0 || originalDimensions.height === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const scaleX = imageDimensions.width / originalDimensions.width;
    const scaleY = imageDimensions.height / originalDimensions.height;

    return {
      x: area.위치.left * scaleX,
      y: area.위치.top * scaleY,
      width: area.위치.width * scaleX,
      height: area.위치.height * scaleY,
    };
  };

  const handleNext = () => {
    if (!imageUri) return;

    router.push({
      pathname: "/(main)/(edit)/(aiPhotoEdit)",
      params: {
        imageUri,
        detectedAreas: JSON.stringify(result),
      },
    });
  };

  const handleRetry = () => {
    setHasDetected(false);
    handleDetectPersonalInfo();
  };

  return (
    <CustomView title="1차 검수" onPressLeftIcon={() => router.back()}>
      <S.Container>
        <S.TitleSection>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText type="bodyNormal" style={{ textAlign: "center", marginTop: 10 }}>
                개인정보를 감지하고 있습니다...
              </ThemedText>
            </>
          ) : hasDetected ? (
            parsedAreas.length > 0 ? (
              <>
                <ThemedText type="HeadingSmall" style={{ textAlign: "center", marginBottom: 10 }}>
                  민감 정보가 발견되었어요
                </ThemedText>
                <ThemedText type="bodyNormal" style={{ textAlign: "center", color: "#666" }}>
                  개인정보 보호를 위해 확인해주세요
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="HeadingSmall" style={{ textAlign: "center", marginBottom: 10 }}>
                  민감 정보가 발견되지 않았습니다
                </ThemedText>
                <ThemedText type="bodyNormal" style={{ textAlign: "center", color: "#666" }}>
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
                style={{ width: imageDimensions.width, height: imageDimensions.height }}
                resizeMode="contain"
                onError={(error) => {
                  console.error("이미지 로드 실패:", error);
                  Alert.alert("오류", "이미지를 표시할 수 없습니다.");
                }}
              />
              {parsedAreas.map((area, index) => {
                const scaled = scaleCoordinates(area);
                const centerX = scaled.x + scaled.width / 2;
                const centerY = scaled.y + scaled.height / 2;
                const radius = Math.max(scaled.width, scaled.height) / 2 + 15;

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

        {parsedAreas.length > 0 && (
          <S.DetectionList>
            <ThemedText type="bodyMedium" style={{ marginBottom: 10, fontWeight: "bold" }}>
              감지된 개인정보:
            </ThemedText>
            {parsedAreas.map((area, index) => (
              <S.DetectionItem key={index}>
                <ThemedText type="bodySmall1">• {area.종류}</ThemedText>
              </S.DetectionItem>
            ))}
          </S.DetectionList>
        )}

        {hasDetected && !isLoading && (
          <View style={{ width: "100%", marginTop: 20, gap: 12 }}>
            {parsedAreas.length > 0 ? (
              <StyledBtn label="다음 단계로" onPress={handleNext} isActive={true} />
            ) : (
              <StyledBtn label="사진 다시 선택" onPress={() => router.back()} isActive={true} />
            )}
            <StyledBtn
              label="다시 검사하기"
              onPress={handleRetry}
              isActive={true}
              style={{ backgroundColor: "#f0f0f0" }}
            />
          </View>
        )}
      </S.Container>
    </CustomView>
  );
};

export default FirstInspection;

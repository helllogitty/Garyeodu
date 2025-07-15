import { ThemedText } from "@/components/ThemedText";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import { detectPersonalInfoAPI } from "@/hooks/detectPersonalInfoAPI";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Image, View } from "react-native";
import * as S from "./style";

interface DetectedArea {
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

  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [detectedAreas, setDetectedAreas] = useState<DetectedArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);

  useEffect(() => {
    if (imageUri) {
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
      handleDetectPersonalInfo();
    }
  }, [imageUri, screenWidth]);

  const handleDetectPersonalInfo = async () => {
    if (!imageUri) return;
    setIsLoading(true);
    try {
      let imageFile: any = null;
      if (imageUri.startsWith("file://")) {
        imageFile = { uri: imageUri, type: "image/jpeg", name: "image.jpg" };
      } else {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        imageFile = new File([blob], "image.jpg", { type: "image/jpeg" });
      }
      const result = await detectPersonalInfoAPI(imageFile);
      const detectedData = result["이미지 파일 개인정보 문제"];
      if (detectedData && typeof detectedData === "object") {
        const areas: DetectedArea[] = [];
        Object.values(detectedData).forEach((info: any) => {
          if (info.위치 && info.종류) {
            areas.push({
              위치: info.위치,
              종류: info.종류,
            });
          }
        });
        setDetectedAreas(areas);
      }
    } catch (error) {
      console.error("개인정보 감지 실패:", error);
    } finally {
      setIsLoading(false);
      setHasDetected(true);
    }
  };

  const scaleCoordinates = (area: DetectedArea) => {
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
    const imageFile = {
      uri: imageUri,
      type: "image/jpeg",
      name: imageUri.split("/").pop() || "image.jpg",
    };
    router.push({
      pathname: "/(main)/(edit)/(aiPhotoEdit)",
      params: {
        imageFile: JSON.stringify(imageFile),
        detectedAreas: JSON.stringify(detectedAreas),
      },
    });
  };

  return (
    <CustomView title="1차 ���수" onPressLeftIcon={() => router.back()}>
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
            detectedAreas.length > 0 ? (
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
              />
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

        {detectedAreas.length > 0 && (
          <S.DetectionList>
            <ThemedText type="bodyMedium" style={{ marginBottom: 10, fontWeight: "bold" }}>
              감지된 개인정보:
            </ThemedText>
            {detectedAreas.map((area, index) => (
              <S.DetectionItem key={index}>
                <ThemedText type="bodySmall1">• {area.종류}</ThemedText>
              </S.DetectionItem>
            ))}
          </S.DetectionList>
        )}

        {hasDetected && !isLoading && (
          <View style={{width: '100%', marginTop: 20, gap: 12}}>
            {detectedAreas.length > 0 ? (
              <StyledBtn label="다음 단계로" onPress={handleNext} isActive={true} />
            ) : (
              <StyledBtn label="사진 다시 선택" onPress={() => router.back()} isActive={true} />
            )}
          </View>
        )}
      </S.Container>
    </CustomView>
  );
};

export default FirstInspection;
import { ThemedText } from "@/components/ThemedText";
import CustomIcon from "@/components/ui/CustomIcon";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, Image, View } from "react-native";
import * as S from "./style";
import { processImageAPI } from "@/hooks/processImageAPI";

const AiEdit = () => {
  const router = useRouter();
  const { imageUri, detectedAreas } = useLocalSearchParams<{
    imageUri: string;
    detectedAreas: string;
  }>();

  const parsedDetectedAreas = useMemo(() => {
    try {
      return JSON.parse(detectedAreas);
    } catch {
      return [];
    }
  }, [detectedAreas]);

  const getResult = async () => {
    const imageName = imageUri.split("/").pop()
    console.log(imageName)
    const imageFile = {
      uri: imageUri,
      name: imageName,
      type: "image/jpeg",
    };
    console.log(imageFile, parsedDetectedAreas);
    const resultUri = await processImageAPI(imageFile, parsedDetectedAreas,selectedMethod);
    return resultUri;
  };

  const screenWidth = Dimensions.get("window").width;
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedMethod, setSelectedMethod] = useState<"mosaic" | "ai">(
    "mosaic"
  ); // 추가

  const handleComplete = async () => {
    // const result: string = await getResult();
    router.push({
      pathname: "/(main)/(edit)/(photoResult)",
      params: { imageUri: imageUri},
    });
  };

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        const maxWidth = screenWidth * 0.8; // 화면 너비의 80%로 줄임
        const maxHeight = 300; // 최대 높이 제한 추가

        const ratio = width / height;

        let newWidth = maxWidth;
        let newHeight = maxWidth / ratio;

        // 높이가 최대값을 초과하면 높이 기준으로 재계산
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * ratio;
        }

        setImageDimensions({ width: newWidth, height: newHeight });
      });
    }
  }, [imageUri, screenWidth]);

  return (
    <CustomView
      title="사진 편집"
      onPressLeftIcon={() => {
        router.back();
      }}
    >
      {imageUri && imageDimensions.width > 0 && (
        <S.ImageContainer>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: imageDimensions.width,
              height: imageDimensions.height,
            }}
            resizeMode="contain"
          />
        </S.ImageContainer>
      )}
      <S.Container>
        <View style={{ gap: 12, marginTop: 12 }}>
          <ThemedText type="HeadingSmall">편집 방식</ThemedText>
          <S.SelectButtonWrapper>
            <S.MethodButton
              selected={selectedMethod === "mosaic"}
              onPress={() => setSelectedMethod("mosaic")}
              style={{
                borderColor:
                  selectedMethod === "mosaic" ? "#007AFF" : "#E0E0E0",
                backgroundColor: selectedMethod === "mosaic" ? "#0A80ED1A" : "",
              }}
            >
              <CustomIcon
                type="mosaic"
                size="18"
                style={{
                  color: selectedMethod === "mosaic" ? "#007AFF" : "#E0E0E0",
                }}
              />
              <ThemedText
                type="bodySmall1"
                style={{
                  color: selectedMethod === "mosaic" ? "#007AFF" : "#828282",
                }}
              >
                모자이크
              </ThemedText>
            </S.MethodButton>

            <S.MethodButton
              selected={selectedMethod === "ai"}
              onPress={() => setSelectedMethod("ai")}
              style={{
                borderColor: selectedMethod === "ai" ? "#007AFF" : "#E0E0E0",
                backgroundColor: selectedMethod === "ai" ? "#0A80ED1A" : "",
              }}
            >
              <CustomIcon
                type="ai"
                size="24"
                style={{
                  color: selectedMethod === "ai" ? "#007AFF" : "#E0E0E0",
                }}
              />
              <ThemedText
                type="bodySmall1"
                style={{
                  color: selectedMethod === "ai" ? "#007AFF" : "#828282",
                }}
              >
                AI 편집
              </ThemedText>
            </S.MethodButton>
          </S.SelectButtonWrapper>
        </View>
        <StyledBtn
          label="편집 완료"
          onPress={handleComplete}
          isActive={!!selectedMethod}
          style={{ backgroundColor: "#000000" }}
        />
      </S.Container>
    </CustomView>
  );
};

export default AiEdit;

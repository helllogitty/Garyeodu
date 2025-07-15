import { ThemedText } from "@/components/ThemedText";
import CustomIcon from "@/components/ui/CustomIcon";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, View, ActivityIndicator } from "react-native";
import * as S from "./style";

// From 1stInspection, we receive a stringified imageFile object and detectedAreas array.
interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

const AiEdit = () => {
  const router = useRouter();
  // Receive stringified params
  const { imageFile: imageFileString, detectedAreas: detectedAreasString } =
    useLocalSearchParams<{ imageFile: string; detectedAreas: string }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedAreas, setDetectedAreas] = useState<any[]>([]);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [selectedMethod, setSelectedMethod] = useState<"mosaic" | "ai">(
    "mosaic"
  );
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    if (imageFileString) {
      try {
        const parsedImageFile: ImageFile = JSON.parse(imageFileString);
        setImageUri(parsedImageFile.uri);

        if (detectedAreasString) {
          setDetectedAreas(JSON.parse(detectedAreasString));
        }
      } catch (e) {
        console.error("Failed to parse navigation params:", e);
      }
    }
  }, [imageFileString, detectedAreasString]);

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        const maxWidth = screenWidth * 0.9;
        const ratio = width / height;
        let newWidth = maxWidth;
        let newHeight = maxWidth / ratio;
        if (newHeight > 500) {
          newHeight = 500;
          newWidth = newHeight * ratio;
        }
        setImageDimensions({ width: newWidth, height: newHeight });
      });
    }
  }, [imageUri, screenWidth]);

  const handleComplete = () => {
    if (imageUri) {
      router.push({
        // Navigate to the correct photo result screen within the (main)/(edit) flow
        pathname: "/(main)/(edit)/(photoResult)",
        params: {
          imageUri: imageUri, // Pass the simple URI
          editMethod: selectedMethod, // Pass the selected edit method
          detectedAreas: JSON.stringify(detectedAreas),
        },
      });
    }
  };

  return (
    <CustomView
      title="사진 편집"
      onPressLeftIcon={() => {
        router.back();
      }}
    >
      <S.Container>
        <S.ImageContainer>
          {imageUri && imageDimensions.width > 0 ? (
            <Image
              source={{ uri: imageUri }}
              style={{
                width: imageDimensions.width,
                height: imageDimensions.height,
              }}
              resizeMode="contain"
            />
          ) : (
            <ActivityIndicator />
          )}
        </S.ImageContainer>

        <View style={{ gap: 12, marginTop: 12, width: '100%' }}>
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
          label="2차 편집 진행"
          onPress={handleComplete}
          isActive={!!selectedMethod}
          style={{ marginTop: 'auto', marginBottom: 20, width: '100%' }}
        />
      </S.Container>
    </CustomView>
  );
};

export default AiEdit;

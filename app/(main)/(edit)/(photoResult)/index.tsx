import { ThemedText } from "@/components/ThemedText";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import { processImageAPI } from "@/hooks/processImageAPI";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
} from "react-native";
import * as S from "./style";

const Result = () => {
  const router = useRouter();
  const {
    imageUri,
    detectedAreas: detectedAreasString,
    editMethod,
  } = useLocalSearchParams<{
    imageUri: string;
    detectedAreas: string;
    editMethod: "mosaic" | "ai";
  }>();

  const screenWidth = Dimensions.get("window").width;

  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedImageUri, setProcessedImageUri] = useState<string | null>(
    null
  );
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const processImage = async () => {
      if (!imageUri || !detectedAreasString || !editMethod) {
        setError("이미지 처리 정보를 불러오는 데 실패했습니다.");
        setIsProcessing(false);
        return;
      }

      try {
        // 1. Prepare the image file from URI
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageFile = new File([blob], "image.jpg", { type: "image/jpeg" });

        // 2. Prepare the regions data in the format required by the server
        const detectedAreas = JSON.parse(detectedAreasString);
        const regions = {
          "이미지 파일 개인정보 문제": detectedAreas.reduce(
            (acc: any, area: any, index: number) => {
              acc[index + 1] = area;
              return acc;
            },
            {}
          ),
        };

        // 3. Call the processing API
        const resultUri = await processImageAPI(imageFile, regions, editMethod);
        setProcessedImageUri(resultUri);
      } catch (e: any) {
        console.error("Processing failed:", e);
        setError(e.message || "이미지 처리 중 오류가 발생했습니다.");
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [imageUri, detectedAreasString, editMethod]);

  useEffect(() => {
    const uriToDisplay = processedImageUri || imageUri;
    if (uriToDisplay) {
      Image.getSize(
        uriToDisplay,
        (width, height) => {
          const maxWidth = screenWidth * 0.9;
          const maxHeight = 500;
          const ratio = width / height;
          let newWidth = maxWidth;
          let newHeight = maxWidth / ratio;
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * ratio;
          }
          setImageDimensions({ width: newWidth, height: newHeight });
        },
        () => {
          setError("이미지 크기를 계산할 수 없습니다.");
        }
      );
    }
  }, [processedImageUri, imageUri, screenWidth]);

  const handleShare = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "공유 기능 미지원",
        "웹 환경에서는 인스타그램 공유를 지원하지 않습니다."
      );
      return;
    }

    if (!processedImageUri) {
      Alert.alert("오류", "공유할 이미지가 준비되지 않았습니다.");
      return;
    }

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert("공유 불가", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
      return;
    }

    try {
      const fileUri = FileSystem.cacheDirectory + "shared_processed_image.jpg";
      await FileSystem.downloadAsync(processedImageUri, fileUri);
      await Sharing.shareAsync(fileUri, {
        mimeType: "image/jpeg",
        dialogTitle: "인스타그램에 사진 공유",
      });
    } catch (shareError) {
      console.error("공유 실패:", shareError);
      Alert.alert("오류", "이미지 공유 중 오류가 발생했습니다.");
    }
  };

  const handleDone = () => {
    router.replace("/(main)/home");
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <>
          <ActivityIndicator size="large" />
          <ThemedText style={{ marginTop: 10 }}>
            이미지를 처리 중입니다...
          </ThemedText>
        </>
      );
    }

    if (error) {
      return <ThemedText>오류: {error}</ThemedText>;
    }

    if (processedImageUri && imageDimensions.width > 0) {
      return (
        <Image
          source={{ uri: processedImageUri }}
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
          }}
          resizeMode="contain"
        />
      );
    }

    return <ThemedText>이미지를 표시할 수 없습니다.</ThemedText>;
  };

  return (
    <CustomView
      title="편집 결과"
      onPressLeftIcon={() => {
        router.back();
      }}
    >
      <S.Container>
        <S.ImageContainer>{renderContent()}</S.ImageContainer>
        <S.ButtonContainer>
          <StyledBtn
            label="편집 완료"
            isActive={!isProcessing && !error}
            onPress={handleDone}
          />
          <StyledBtn
            label="인스타 공유"
            isActive={!isProcessing && !error}
            onPress={handleShare}
            style={{ backgroundColor: "#ffffff" }}
            textStyle={{ color: "black" }}
          />
        </S.ButtonContainer>
      </S.Container>
    </CustomView>
  );
};

export default Result;

import { ThemedText } from "@/components/ThemedText";
import CustomView from "@/components/ui/CustomView";
import StyledBtn from "@/components/ui/StyledBtn";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image } from "react-native";
import * as S from "./style";

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
  const [rawDetectedData, setRawDetectedData] = useState<any>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUri, screenWidth]);

  const handleDetectPersonalInfo = async () => {
    if (!imageUri) return;

    setIsLoading(true);
    try {
      console.log("🔍 업로드할 이미지 URI:", imageUri);

      // 이미지 파일을 fetch로 가져와서 blob으로 변환
      const response = await fetch(imageUri);
      const blob = await response.blob();

      console.log("📁 Blob 생성 완료:", blob.size, "bytes");

      // FormData 생성
      const formData = new FormData();

      // 실제 파일 객체로 append
      formData.append("image", blob);

      console.log("📤 FormData 생성 완료, API 요청 시작", blob);

      // API 요청
      const apiResponse = await fetch(
        `https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/detect`,
        {
          method: "POST",
          body: formData,
          // headers는 설정하지 않음 - FormData 사용 시 자동 설정됨
        }
      );

      console.log("📡 API 응답 상태:", apiResponse.status);

      const result = await apiResponse.json();
      console.log("📝 서버 응답:", result);

      // 400 에러 처리
      if (!apiResponse.ok) {
        if (apiResponse.status === 400) {
          console.error("❌ 파일 업로드 실패:", result.message);
          Alert.alert(
            "업로드 오류",
            result.message || "이미지 파일 업로드에 실패했습니다."
          );
          return;
        }
        throw new Error(`HTTP error! status: ${apiResponse.status}`);
      }

      // 성공 시 기존 로직 실행
      if (result && result["이미지 파일 개인정보 문제"]) {
        const detectedData = result["이미지 파일 개인정보 문제"];
        console.log("🔍 감지된 데이터:", JSON.stringify(detectedData, null, 2));

        setRawDetectedData(detectedData);

        if (detectedData.상태 === "안전") {
          setDetectedAreas([]);
          setHasDetected(true);
          await saveToAsyncStorage(detectedData, []);
          return;
        }

        const areas: DetectedArea[] = [];

        Object.entries(detectedData).forEach(([key, info]: [string, any]) => {
          if (key !== "메시지" && key !== "상태" && info?.위치 && info?.종류) {
            console.log(`📍 항목 ${key}:`, {
              종류: info.종류,
              위치: info.위치,
            });

            areas.push({
              x: Number(info.위치.left || info.위치.x),
              y: Number(info.위치.top || info.위치.y),
              width: Number(info.위치.width),
              height: Number(info.위치.height),
              type: info.종류,
            });
          }
        });

        console.log("🎯 최종 areas 배열:", areas);
        setDetectedAreas(areas);
        setHasDetected(true);
        await saveToAsyncStorage(detectedData, areas);
      } else {
        console.log("예상과 다른 응답 구조:", result);
        setDetectedAreas([]);
        setHasDetected(true);
        await saveToAsyncStorage(null, []);
      }
    } catch (error) {
      console.error("개인정보 감지 실패:", error);
      Alert.alert("오류", "개인정보 감지에 실패했습니다.");
      setDetectedAreas([]);
      setHasDetected(true);
    } finally {
      setIsLoading(false);
    }
  };

  // AsyncStorage 저장 함수
  const saveToAsyncStorage = async (
    detectedData: any,
    areas: DetectedArea[]
  ) => {
    try {
      // 좌표 JSON 문자열 생성
      const regionsJson = detectedData
        ? JSON.stringify({
            "이미지 파일 개인정보 문제": detectedData,
          })
        : JSON.stringify({});

      // 저장할 데이터 구조
      const dataToSave = {
        imageUri: imageUri,
        detectedAreas: areas,
        rawDetectedData: detectedData,
        regionsJson: regionsJson, // JSON 문자열로 저장
        originalDimensions: originalDimensions,
        timestamp: Date.now(),
        status: detectedData?.상태 || "unknown",
        detectedCount: areas.length,
      };

      console.log("💾 AsyncStorage에 저장할 데이터:", {
        imageUri: dataToSave.imageUri ? "✅ 있음" : "❌ 없음",
        detectedAreas: `${dataToSave.detectedAreas.length}개`,
        regionsJson: dataToSave.regionsJson.length + " characters",
        status: dataToSave.status,
      });

      // 메인 데이터 저장
      await AsyncStorage.setItem("detectionResult", JSON.stringify(dataToSave));

      // 추가로 개별 항목들도 저장 (필요시 사용)
      await AsyncStorage.setItem("imageUri", imageUri || "");
      await AsyncStorage.setItem("regionsJson", regionsJson);

      console.log("✅ AsyncStorage 저장 완료");

      // 저장 확인
      const saved = await AsyncStorage.getItem("detectionResult");
      if (saved) {
        console.log("✅ 저장 검증 성공");
      } else {
        console.error("❌ 저장 검증 실패");
      }
    } catch (error) {
      console.error("❌ AsyncStorage 저장 실패:", error);
      Alert.alert("오류", "데이터 저장에 실패했습니다.");
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
      height: area.height * scaleY,
    };
  };

  // 다음 단계로 이동
  const handleNext = async () => {
    try {
      // 이미 저장되어 있지만 한 번 더 확인
      const existingData = await AsyncStorage.getItem("detectionResult");

      if (!existingData) {
        console.log("⚠️ 저장된 데이터가 없어서 다시 저장 시도");
        await saveToAsyncStorage(rawDetectedData, detectedAreas);
      }

      console.log("🚀 다음 단계로 이동");

      router.push({
        pathname: "/(edit)/(photoResult)",
        params: {
          resultKey: "detectionResult",
          detectedCount: detectedAreas.length.toString(),
        },
      });
    } catch (error) {
      console.error("❌ 다음 단계 이동 실패:", error);
      Alert.alert("오류", "다음 단계로 이동할 수 없습니다.");
    }
  };

  const handleGoToFirst = () => {
    router.dismiss(1);
  };

  // 저장된 데이터 확인 함수 (디버깅용)
  const checkSavedData = async () => {
    try {
      const data = await AsyncStorage.getItem("detectionResult");
      const imageUri = await AsyncStorage.getItem("imageUri");
      const regionsJson = await AsyncStorage.getItem("regionsJson");

      console.log("📋 저장된 데이터 확인:");
      console.log("- detectionResult:", data ? "✅" : "❌");
      console.log("- imageUri:", imageUri ? "✅" : "❌");
      console.log("- regionsJson:", regionsJson ? "✅" : "❌");

      if (data) {
        const parsed = JSON.parse(data);
        console.log("- 파싱된 데이터 구조:", Object.keys(parsed));
      }
    } catch (error) {
      console.error("데이터 확인 실패:", error);
    }
  };

  // useEffect에 데이터 확인 추가 (개발용)
  useEffect(() => {
    if (hasDetected) {
      checkSavedData();
    }
  }, [hasDetected]);

  return (
    <CustomView title="1차 검수" onPressLeftIcon={() => router.back()}>
      <S.Container>
        <S.TitleSection>
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText
                type="bodyNormal"
                style={{ textAlign: "center", marginTop: 10 }}
              >
                개인정보를 감지하고 있습니다...
              </ThemedText>
            </>
          ) : hasDetected ? (
            detectedAreas.length > 0 ? (
              <>
                <ThemedText
                  type="HeadingSmall"
                  style={{ textAlign: "center", marginBottom: 10 }}
                >
                  민감 정보가 발견되었어요
                </ThemedText>
                <ThemedText
                  type="bodyNormal"
                  style={{ textAlign: "center", color: "#666" }}
                >
                  개인정보 보호를 위해 확인해주세요
                </ThemedText>
                <ThemedText
                  type="bodySmall1"
                  style={{ textAlign: "center", color: "#999", marginTop: 5 }}
                >
                  {detectedAreas.length}개의 민감정보가 감지되었습니다
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText
                  type="HeadingSmall"
                  style={{
                    textAlign: "center",
                    marginBottom: 10,
                    color: "#34C759",
                  }}
                >
                  민감 정보가 발견되지 않았습니다
                </ThemedText>
                <ThemedText
                  type="bodyNormal"
                  style={{ textAlign: "center", color: "#666" }}
                >
                  안전한 이미지입니다
                </ThemedText>
              </>
            )
          ) : null}
        </S.TitleSection>

        <S.ImageSection>
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
                const radius =
                  Math.max(scaledArea.width, scaledArea.height) / 2 + 15;

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
        </S.ImageSection>

        <S.BottomSection>
          {/* 감지된 정보 목록 */}
          {detectedAreas.length > 0 && (
            <S.DetectionList>
              <ThemedText
                type="bodyMedium"
                style={{ marginBottom: 10, fontWeight: "bold" }}
              >
                감지된 개인정보:
              </ThemedText>
              {detectedAreas.map((area, index) => (
                <S.DetectionItem key={index}>
                  <ThemedText type="bodySmall1">• {area.type}</ThemedText>
                </S.DetectionItem>
              ))}
            </S.DetectionList>
          )}

          {/* 버튼들 */}
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
                  onPress={handleGoToFirst}
                  isActive={true}
                  style={{ backgroundColor: "#34C759" }}
                />
              )}
            </>
          )}
        </S.BottomSection>
      </S.Container>
    </CustomView>
  );
};

export default FirstInspection;

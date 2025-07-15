export const blurImageRegions = async (
  imageUri: string,
  regionsJson: string
): Promise<string> => {
  try {
    console.log("🔄 블러 처리 API 호출 시작");
    console.log("📷 이미지 URI:", imageUri);
    console.log("📍 좌표 JSON:", regionsJson);

    // FormData 생성
    const formData = new FormData();

    // 이미지 파일 추가
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "image.jpg",
    } as any);

    // regions를 JSON 문자열로 추가
    formData.append("regions", regionsJson);

    console.log("📤 API 요청 전송 중...");

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/image-processing/blur-regions`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      }
    );

    console.log("📥 응답 상태:", response.status);
    console.log("📥 응답 헤더:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API 에러:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 응답을 먼저 텍스트로 확인
    const responseText = await response.text();
    console.log("📥 원본 응답 텍스트:", responseText);
    console.log("📥 응답 길이:", responseText.length);
    console.log("📥 응답 시작 100자:", responseText.substring(0, 100));

    // JSON 파싱 시도
    let result;
    try {
      result = JSON.parse(responseText);
      console.log("✅ JSON 파싱 성공:", result);
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", parseError);
      console.error("📄 전체 응답:", responseText);

      // 응답이 URL인지 확인
      if (responseText.startsWith("http")) {
        console.log("🔗 응답이 URL 형태입니다:", responseText);
        return responseText.trim();
      }

      // 응답이 base64인지 확인
      if (responseText.startsWith("data:image/")) {
        console.log("📷 응답이 base64 이미지입니다");
        return responseText;
      }

      // 파일 경로인지 확인
      if (
        responseText.includes("uploads/") ||
        responseText.includes(".jpg") ||
        responseText.includes(".png")
      ) {
        console.log("📁 응답이 파일 경로입니다");
        // 전체 URL 구성
        const fullUrl = responseText.startsWith("http")
          ? responseText
          : `${process.env.EXPO_PUBLIC_API_BASE_URL}/${responseText}`;
        return fullUrl.trim();
      }
    }

    // JSON 응답에서 이미지 URL 추출
    const processedImage =
      result.processedImageUrl ||
      result.data ||
      result.image ||
      result.blurredImage ||
      result.url ||
      result.imageUrl;

    if (processedImage) {
      console.log("🎉 블러 처리 완료:", processedImage);
      return processedImage;
    } else {
      console.error(
        "❌ 처리된 이미지를 찾을 수 없습니다. 응답 구조:",
        Object.keys(result)
      );
      throw new Error("처리된 이미지를 받지 못했습니다.");
    }
  } catch (error) {
    console.error("❌ 블러 처리 실패:", error);
    throw error;
  }
};

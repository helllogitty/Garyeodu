export const detectPersonalInfoAPI = async (imageFile: any): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/image-processing/detect`,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 에러 응답:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
console.log("API 응답:", result);

// 전체 구조를 JSON.stringify로 확인
console.log("🔍 전체 구조:", JSON.stringify(result, null, 2));

// 이미지 파일 개인정보 문제 데이터 추출
const detectedData = result["이미지 파일 개인정보 문제"];
console.log("🔍 감지된 데이터:", JSON.stringify(detectedData, null, 2));

// 각 항목의 위치 정보 접근
Object.entries(detectedData).forEach(([key, info]: [string, any]) => {
  console.log(`📍 항목 ${key}:`);
  console.log('  - 종류:', info.종류);
  console.log('  - 위치 전체:', JSON.stringify(info.위치, null, 2));
  console.log('  - x 좌표:', info.위치.top);
  console.log('  - y 좌표:', info.위치.left);
  console.log('  - 너비:', info.위치.width);
  console.log('  - 높이:', info.위치.height);
});
    

    return result;
  } catch (error) {
    console.error("개인정보 감지 API 호출 실패:", error);
    throw error;
  }
};

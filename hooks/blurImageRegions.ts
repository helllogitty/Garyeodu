export const blurImageRegions = async (imageUri: string, regionsJson: string): Promise<string> => {
  try {
    console.log('🔄 블러 처리 API 호출 시작');
    console.log('📷 이미지 URI:', imageUri);
    console.log('📍 좌표 JSON:', regionsJson);

    // FormData 생성
    const formData = new FormData();
    
    // 이미지 파일 추가
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg'
    } as any);

    // regions를 JSON 문자열로 추가
    formData.append('regions', regionsJson);

    console.log('📤 API 요청 전송 중...');

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/image-processing/blur-regions`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    console.log('📥 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 에러:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 블러 처리 결과:', result);
    
    // 처리된 이미지 URL 또는 base64 데이터 반환
    const processedImage = result.processedImageUrl || result.data || result.image || result.blurredImage;
    
    if (processedImage) {
      console.log('🎉 블러 처리 완료');
      return processedImage;
    } else {
      throw new Error('처리된 이미지를 받지 못했습니다.');
    }

  } catch (error) {
    console.error('❌ 블러 처리 실패:', error);
    throw error;
  }
};
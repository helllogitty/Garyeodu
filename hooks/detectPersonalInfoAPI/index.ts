export const detectPersonalInfoAPI = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg'
    } as any);

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/image-processing/detect`, {
      method: 'POST',
      body: formData,
    });

    console.log('응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 에러 응답:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API 응답:', result);
    return result;
  } catch (error) {
    console.error('개인정보 감지 API 호출 실패:', error);
    throw error;
  }
};
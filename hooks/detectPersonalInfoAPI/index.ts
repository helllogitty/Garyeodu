
export const detectPersonalInfoAPI = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg'
    } as any);

    const response = await fetch(`${process.env.API_BASE_URL}/api/image-processing/detect-personal-info`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('개인정보 감지 API 호출 실패:', error);
    throw error;
  }
};
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';

export const useImageUpload = () => {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  async function uploadImage() {
    try {
    //접근 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('갤러리 접근 권한이 필요합니다.');
      return;
    }

    //이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
    } catch (error) {
      console.log('이미지 업로드 실패:', error);
    }
  }

  return {image, uploadImage};
}
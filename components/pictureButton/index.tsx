import React, { useState, useEffect } from 'react';
import CustomIcon from '../ui/CustomIcon';
import { ThemedText } from '../ThemedText';
import * as S from './style';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // 추가
import { Alert } from 'react-native';

interface PicBtnProps {
  onImageSelected?: (uri: string) => void;
}

const PicBtn = ({ onImageSelected }: PicBtnProps) => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedUri = await AsyncStorage.getItem('profileImage');
        if (storedUri) setImageUri(storedUri);
      } catch (error) {
        console.error('이미지를 불러오는데 실패했습니다:', error);
      }
    };

    loadImage();
  }, []);

  const saveToPermanentStorage = async (originalUri: string) => {
    try {
      const fileName = originalUri.split('/').pop() || `profile.jpg`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: originalUri,
        to: newPath,
      });

      return newPath;
    } catch (error) {
      console.error('이미지를 영구 저장소로 복사하는 데 실패했습니다:', error);
      return null;
    }
  };

  const handleImageResult = async (uri: string) => {
    const permanentUri = await saveToPermanentStorage(uri);
    if (permanentUri) {
      setImageUri(permanentUri);
      onImageSelected?.(permanentUri);

      try {
        await AsyncStorage.setItem('profileImage', permanentUri);
      } catch (error) {
        console.error('이미지 URI 저장 실패:', error);
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      await handleImageResult(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      await handleImageResult(result.assets[0].uri);
    }
  };

  return (
    <>
      <S.PhotoButton style={{ backgroundColor: '#DBE8F2' }} onPress={pickImage}>
        <CustomIcon type="pic" size="18" />
        <ThemedText type="bodyNormal" style={{ color: '#7590A6' }}>
          라이브러리에서 고르기
        </ThemedText>
      </S.PhotoButton>
      <S.PhotoButton style={{ backgroundColor: '#EBEDF2' }} onPress={takePhoto}>
        <CustomIcon type="camera" size="24" />
        <ThemedText type="bodyNormal" style={{ color: '#969AA6' }}>
          사진 찍기
        </ThemedText>
      </S.PhotoButton>
    </>
  );
};

export default PicBtn;

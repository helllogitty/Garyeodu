import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import * as S from './style';

export default function ProfileScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const defaultImage = require('@/assets/images/User.png'); 

  // 저장된 이미지 URI 불러오기
  useEffect(() => {
    const loadImage = async () => {
      try {
        const storedUri = await AsyncStorage.getItem('profileImage');
        if (storedUri) {
          setImageUri(storedUri);
        }
      } catch (error) {
        console.error('이미지를 불러오는데 실패했습니다:', error);
      }
    };

    loadImage();
  }, []);

  // 이미지 선택
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '프로필 사진을 변경하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);

      // 저장
      try {
        await AsyncStorage.setItem('profileImage', uri);
      } catch (error) {
        console.error('이미지 저장 실패:', error);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '확인',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('profileImage');
              setImageUri(null);
              Alert.alert('로그아웃 완료');
              router.replace("/(login)");
            } catch (error) {
              console.error('로그아웃 중 오류 발생:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    
    <S.Container>
      <S.HeaderContainer />
      <S.ProfileSection>
        <TouchableOpacity onPress={pickImage}>
          <S.Avatar source={imageUri ? { uri: imageUri } : defaultImage}  />
        </TouchableOpacity>
        <S.ChangeText>프로필 사진 변경</S.ChangeText>
        <S.Username>이윤하</S.Username>
      </S.ProfileSection>

      <S.InfoSection>
        <S.OptionText>📁 내 라이브러리</S.OptionText>
          <S.Divider />
        <S.Logout onPress={handleLogout}>로그아웃</S.Logout>
        <S.DeleteAccount>회원 탈퇴</S.DeleteAccount>
      </S.InfoSection>
    </S.Container>
  );
}

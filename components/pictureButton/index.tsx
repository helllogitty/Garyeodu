import React,{useState, useEffect} from 'react'
import CustomIcon from '../ui/CustomIcon'
import { ThemedText } from '../ThemedText'
import * as S from './style'
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Linking } from 'react-native';

interface PicBtnProps {
  onImageSelected?: (uri: string) => void;
}

const PicBtn = ({ onImageSelected }: PicBtnProps) => {
    const [imageUri, setImageUri] = useState<string | null>(null);

    // 저장된 이미지 URI 불러오기
    useEffect(() => {
      const loadImage = async () => {
        try {
          const storedUri = await AsyncStorage.getItem('Image');
          if (storedUri) {
            setImageUri(storedUri);
          }
        } catch (error) {
          console.error('이미지를 불러오는데 실패했습니다:', error);
        }
      };

      loadImage();
    }, []);

    const requestPermissionWithRetry = async (type: 'camera' | 'library') => {
      const permission = type === 'camera' 
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        const message = type === 'camera' 
          ? '사진을 촬영하려면 카메라 접근 권한이 필요합니다.'
          : '사진을 선택하려면 갤러리 접근 권한이 필요합니다.';

        Alert.alert(
          '권한 필요',
          message,
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '설정으로 이동', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return false;
      }
      return true;
    };

    // 이미지 선택
    const pickImage = async () => {
      const hasPermission = await requestPermissionWithRetry('library');
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // 변경된 부분
        allowsEditing: false,
        // aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);

        // 상위 컴포넌트로 이미지 전달
        onImageSelected?.(uri);

        // 저장
        try {
          await AsyncStorage.setItem('profileImage', uri);
        } catch (error) {
          console.error('이미지 저장 실패:', error);
        }
      }
    };

    // 카메라로 사진 찍기
    const takePhoto = async () => {
      const hasPermission = await requestPermissionWithRetry('camera');
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], // 변경된 부분
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setImageUri(uri);

        // 상위 컴포넌트로 이미지 전달
        onImageSelected?.(uri);

        // 저장
        try {
          await AsyncStorage.setItem('profileImage', uri);
        } catch (error) {
          console.error('이미지 저장 실패:', error);
        }
      }
    };
        
    return (
      <>
          <S.PhotoButton style={{ backgroundColor: '#DBE8F2'}} onPress={pickImage}>
            <CustomIcon type='pic' size='18'/>
            <ThemedText type='bodyNormal' style={{color:'#7590A6'}}>라이브러리에서 고르기</ThemedText>
          </S.PhotoButton>
          <S.PhotoButton style={{ backgroundColor: '#EBEDF2' }} onPress={takePhoto}>
            <CustomIcon type='camera' size='24'/>
            <ThemedText type='bodyNormal' style={{color:'#969AA6'}}>사진 찍기</ThemedText>
          </S.PhotoButton>
      </>
    )
}

export default PicBtn

import React, { useState, useEffect } from 'react'
import { Image, Dimensions, View, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import CustomView from '@/components/ui/CustomView'
import { ThemedText } from '@/components/ThemedText'
import * as S from './style'
import StyledBtn from '@/components/ui/StyledBtn'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { blurImageRegions } from '@/hooks/blurImageRegions'

const Result = () => {
  const router = useRouter()
  const { resultKey } = useLocalSearchParams<{ resultKey?: string }>()
  const screenWidth = Dimensions.get('window').width

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [photoData, setPhotoData] = useState<any>(null)
  const [blurredImageUri, setBlurredImageUri] = useState<string>('')
  const [showingBefore, setShowingBefore] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    loadPhotoData()
  }, [resultKey])

  const loadPhotoData = async () => {
    try {
      const keyToUse = resultKey || 'detectionResult';
      const data = await AsyncStorage.getItem(keyToUse);
      
      if (data) {
        const parsedData = JSON.parse(data);
        console.log('📸 로드된 데이터:', {
          imageUri: parsedData.imageUri ? '✅' : '❌',
          regionsJson: parsedData.regionsJson ? '✅' : '❌',
          detectedCount: parsedData.detectedCount
        });
        
        setPhotoData(parsedData);
        
        if (parsedData.imageUri) {
          calculateImageDimensions(parsedData.imageUri);
          
          // 민감정보가 있으면 블러 처리
          if (parsedData.detectedAreas && parsedData.detectedAreas.length > 0) {
            // 저장된 regionsJson 사용
            handleBlurProcessWithJson(parsedData.imageUri, parsedData.regionsJson);
          } else {
            setHasProcessed(true);
          }
        }
      }
    } catch (error) {
      console.error('❌ 데이터 로드 실패:', error);
    }
  };

  const calculateImageDimensions = (imageUri: string) => {
    Image.getSize(
      imageUri,
      (width, height) => {
        console.log('Image size:', width, height) // 디버깅용
        const maxWidth = screenWidth * 0.8
        const maxHeight = 300

        const ratio = width / height

        let newWidth = maxWidth
        let newHeight = maxWidth / ratio

        if (newHeight > maxHeight) {
          newHeight = maxHeight
          newWidth = maxHeight * ratio
        }

        setImageDimensions({ width: newWidth, height: newHeight })
        console.log('Set dimensions:', { width: newWidth, height: newHeight }) // 디버깅용
      },
      (error) => {
        console.error('Error loading image:', error) // 에러 확인
      }
    )
  }

  const handleBlurProcessWithJson = async (imageUri: string, regionsJson: string) => {
    setIsProcessing(true);
    try {
      console.log('🔄 저장된 JSON으로 블러 처리:', regionsJson);

      // blurImageRegions 훅 사용
      const blurredImage = await blurImageRegions(imageUri, regionsJson);
      
      console.log('✅ 블러 처리 완료:', blurredImage);
      setBlurredImageUri(blurredImage);
      setHasProcessed(true);

    } catch (error) {
      console.error('❌ 블러 처리 실패:', error);
      Alert.alert('오류', '블러 처리에 실패했습니다.');
      setHasProcessed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CustomView
      title="편집 결과"
      onPressLeftIcon={() => { router.back() }}
    >
      <S.ImageContainer>
        {photoData?.imageUri ? (
          imageDimensions.width > 0 ? (
            <Image
              source={{ uri: showingBefore ? photoData.imageUri : blurredImageUri || photoData.imageUri }}
              style={{
                width: imageDimensions.width,
                height: imageDimensions.height,
              }}
              resizeMode="contain"
              onError={(error) => console.error('Image render error:', error)}
            />
          ) : (
            <ThemedText>이미지 로딩 중...</ThemedText>
          )
        ) : (
          <ThemedText>이미지 URI가 없습니다</ThemedText>
        )}
      </S.ImageContainer>
      <View style={{ gap: 12, marginTop: 20, justifyContent: 'flex-end', flex: 1 }}>
        <StyledBtn
          label='편집 완료'
          isActive={true}
          onPress={() => { }}
        />
        <StyledBtn
          label='취소하기'
          isActive={true}
          onPress={() => { router.dismissAll(); router.replace('/(edit)') }}
          style={{ backgroundColor: '#ffffff' }}
          textStyle={{ color: 'black' }}
        />
      </View>
    </CustomView>
  )
}

export default Result

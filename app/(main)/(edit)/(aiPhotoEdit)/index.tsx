import React, { useState, useEffect } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import CustomView from '@/components/ui/CustomView'
import { ThemedText } from '@/components/ThemedText'
import * as S from './style'
import CustomIcon from '@/components/ui/CustomIcon'
import StyledBtn from '@/components/ui/StyledBtn'


const AiEdit = () => {
  const router = useRouter()
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>()
  const screenWidth = Dimensions.get('window').width
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [selectedMethod, setSelectedMethod] = useState<'mosaic' | 'ai'>('mosaic') // 추가

  const handleComplete = () => {
    router.push({
      pathname: '/(edit)/(photoResult)',
      params: { imageUri: imageUri } // imageUri 전달
    })
  }

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        const maxWidth = screenWidth * 0.8 // 화면 너비의 80%로 줄임
        const maxHeight = 300 // 최대 높이 제한 추가
        
        const ratio = width / height
        
        let newWidth = maxWidth
        let newHeight = maxWidth / ratio
        
        // 높이가 최대값을 초과하면 높이 기준으로 재계산
        if (newHeight > maxHeight) {
          newHeight = maxHeight
          newWidth = maxHeight * ratio
        }
        
        setImageDimensions({ width: newWidth, height: newHeight })
      })
    }
  }, [imageUri, screenWidth])

  return (
    <CustomView
      title="사진 편집"
      onPressLeftIcon={() => { router.back() }}
    >
      {imageUri && imageDimensions.width > 0 && (
        <S.ImageContainer>
          <Image
            source={{ uri: imageUri }}
            style={{
              width: imageDimensions.width,
              height: imageDimensions.height,
            }}
            resizeMode="contain"
          />
        </S.ImageContainer>
      )}
      <S.Container >
        <View style={{gap: 12, marginTop: 12}}>
        <ThemedText type='HeadingSmall'>편집 방식</ThemedText>
        <S.SelectButtonWrapper>
          <S.MethodButton 
            selected={selectedMethod === 'mosaic'}
            onPress={() => setSelectedMethod('mosaic')}
            style={{borderColor: selectedMethod === 'mosaic' ? '#007AFF' : '#E0E0E0',
                backgroundColor: selectedMethod === 'mosaic' ? '#0A80ED1A' : '',}}
          >
            <CustomIcon type='mosaic' size="18" style={{color:selectedMethod === 'mosaic' ? '#007AFF' : '#E0E0E0' }}/>
            <ThemedText 
              type='bodySmall1' 
              style={{
                color: selectedMethod === 'mosaic' ? '#007AFF' : '#828282'
              }}
            >
              모자이크
            </ThemedText>
          </S.MethodButton>
          
          <S.MethodButton 
            selected={selectedMethod === 'ai'}
            onPress={() => setSelectedMethod('ai')}
            style={{borderColor: selectedMethod === 'ai' ? '#007AFF' : '#E0E0E0',
                backgroundColor: selectedMethod === 'ai' ? '#0A80ED1A' : '',}}
          >
            <CustomIcon type='ai' size="24" style={{color:selectedMethod === 'ai' ? '#007AFF' : '#E0E0E0' }}/>
            <ThemedText 
              type='bodySmall1' 
              style={{
                color: selectedMethod === 'ai' ? '#007AFF' : '#828282',
              }}
            >
              AI 편집
            </ThemedText>
          </S.MethodButton>
        </S.SelectButtonWrapper>
        </View>
        <StyledBtn
          label="편집 완료"
          onPress={handleComplete}
          isActive={!!selectedMethod}
          style={{ backgroundColor: '#000000' }}
        />
      </S.Container>
     
    </CustomView>
  )
}

export default AiEdit
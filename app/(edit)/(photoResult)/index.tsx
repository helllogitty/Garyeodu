import React, { useState, useEffect } from 'react'
import { Image, Dimensions, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import CustomView from '@/components/ui/CustomView'
import { ThemedText } from '@/components/ThemedText'
import * as S from './style'
import StyledBtn from '@/components/ui/StyledBtn'


const Result = () => {
  const router = useRouter()
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>()
  const screenWidth = Dimensions.get('window').width
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  console.log('Received imageUri:', imageUri) // 디버깅용

  useEffect(() => {
    if (imageUri) {
      console.log('Loading image:', imageUri) // 디버깅용
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
    } else {
      console.log('No imageUri provided') // 디버깅용
    }
  }, [imageUri, screenWidth])

  return (
    <CustomView
      title="편집 결과"
      onPressLeftIcon={() => { router.back() }}
    >
      <S.ImageContainer>
        {imageUri ? (
          imageDimensions.width > 0 ? (
            <Image
              source={{ uri: imageUri }}
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
      <View style={{gap: 12, marginTop: 20, justifyContent:'flex-end', flex:1}}>
      <StyledBtn
      label='편집 완료'
      isActive={true}
      onPress={()=> {}}/>
      
      <StyledBtn
      label='취소하기'
      isActive={true}
      onPress={()=> {router.dismissAll(); router.replace('/(edit)')}}
      style={{backgroundColor : '#ffffff'}}
      textStyle={{color: 'black'}}/> 
        </View>
      
    </CustomView>
  )
}

export default Result

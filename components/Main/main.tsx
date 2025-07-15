// screens/HomeScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import * as S from './style';

const HomeScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const defaultImage = require('@/assets/images/User.png'); // 로컬 기본 이미지

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const uri = await AsyncStorage.getItem('profileImage');
        if (uri) {
          setImageUri(uri);
        }
      } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
      }
    };
    loadProfileImage();
  }, []);

  return (
    <S.Container>
      <ScrollView>
        <S.ProfileRow>
          <S.Avatar source={imageUri ? { uri: imageUri } : defaultImage} />
          <S.Header>이윤하님</S.Header>
        </S.ProfileRow>

        <S.BannerImage
          source={require('@/assets/images/Mainbanner.png')}
        />

        <S.SectionTitle>최신 정보 유출 뉴스</S.SectionTitle>

        <S.NewsItem>
          <S.NewsIcon source={{ uri: '/Users/dgsw05/Garyeodu/assets/images/news1.png' }} />
          <S.NewsTextContainer>
            <S.NewsTitle>New Data Breach Exposes Millions of</S.NewsTitle>
            <S.NewsSource>TechCrunch</S.NewsSource>
          </S.NewsTextContainer>
        </S.NewsItem>

        <S.NewsItem>
          <S.NewsIcon source={{ uri: '/Users/dgsw05/Garyeodu/assets/images/new2.png' }} />
          <S.NewsTextContainer>
            <S.NewsTitle>AI-Powered Tools Enhance</S.NewsTitle>
            <S.NewsSource>Wired</S.NewsSource>
          </S.NewsTextContainer>
        </S.NewsItem>

        <S.NewsItem>
          <S.NewsIcon source={{ uri: '/Users/dgsw05/Garyeodu/assets/images/news3.png' }} />
          <S.NewsTextContainer>
            <S.NewsTitle>Privacy Advocates Raise Concerns</S.NewsTitle>
            <S.NewsSource>The Verge</S.NewsSource>
          </S.NewsTextContainer>
        </S.NewsItem>

        <S.SectionTitle>퀴즈</S.SectionTitle>
        <S.QuizContainer>
          <S.QuizText>
            <S.QuizTitle>Test Your Knowledge</S.QuizTitle>
            <S.QuizDescription>
              Take a quick quiz to assess your understanding of online privacy best practices.
            </S.QuizDescription>
            <S.QuizButton>
              <S.QuizButtonText>Start Quiz</S.QuizButtonText>
            </S.QuizButton>
          </S.QuizText>
          <S.QuizImage source={{ uri: '/Users/dgsw05/Garyeodu/assets/images/QuizImage.png' }} />
        </S.QuizContainer>
      </ScrollView>
    </S.Container>
  );
};

export default HomeScreen;
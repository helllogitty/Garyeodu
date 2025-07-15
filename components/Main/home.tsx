import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import * as S from './style';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItemType[]>([]);
  const defaultImage = require('@/assets/images/User.png');

  type NewsItemType = {
    제목: string;
    링크: string;
    날짜: string;
    설명: string;
    키워드: string;
  };

  const fetchPrivacyNews = async () => {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
        '사진 개인정보 유출'
      )}&hl=ko&gl=KR&ceid=KR:ko`;

      const res = await fetch(url);
      const xml = await res.text();

      const parser = new XMLParser();
      const json = parser.parse(xml);

      const items = json.rss.channel.item;

      const parsed: NewsItemType[] = items.map((item: any) => ({
        제목: item.title,
        링크: item.link,
        날짜: item.pubDate,
        설명: item.description,
        키워드: '사진 개인정보 유출',
      }));

      setNewsList(parsed.slice(0, 3)); // 앞에서 3개만
    } catch (err) {
      console.error('❌ RSS 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const uri = await AsyncStorage.getItem('profileImage');
        if (uri) setImageUri(uri);
      } catch (error) {
        console.error('프로필 이미지 로드 실패:', error);
      }
    };

    loadProfileImage();
    fetchPrivacyNews(); // ✅ RSS 호출
  }, []);

  return (
    <SafeAreaView style={{flex : 1}}>
      <S.Container>
        <ScrollView>
          <S.ProfileRow>
            <S.Avatar source={imageUri ? { uri: imageUri } : defaultImage} />
            <S.Header>이윤하님</S.Header>
          </S.ProfileRow>

          <S.BannerWrapper>
            <S.BannerImage source={require('@/assets/images/Mainbanner.png')} />
            <S.BannerText>Service Update</S.BannerText>
          </S.BannerWrapper>

          <S.SectionTitle>최신 정보 유출 뉴스</S.SectionTitle>

          {newsList.map((item, index) => {
            const fullUrl = item.링크.startsWith('http') ? item.링크 : `https://${item.링크}`;
            return (
              <S.NewsItem key={index} onPress={() => Linking.openURL(fullUrl)}>
                <S.NewsIcon source={require('@/assets/images/news1.png')} />
                <S.NewsTextContainer>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <S.NewsTitle>{item.제목}</S.NewsTitle>
                  </ScrollView>
                  <S.NewsSource>{item.날짜}</S.NewsSource>
                </S.NewsTextContainer>
              </S.NewsItem>
            );
          })}

          {/* <S.SectionTitle>퀴즈</S.SectionTitle> */}
          {/* <S.QuizContainer>
            <S.QuizText>
              <S.QuizTitle>Test Your Knowledge</S.QuizTitle>
              <S.QuizDescription>
                Take a quick quiz to assess your understanding of online privacy best practices.
              </S.QuizDescription>
              <S.QuizButton>
                <S.QuizButtonText>Start Quiz</S.QuizButtonText>
              </S.QuizButton>
            </S.QuizText>
            <S.QuizImage source={require('@/assets/images/QuizImage.png')} />
          </S.QuizContainer> */}
        </ScrollView>
      </S.Container>
    </SafeAreaView>
  );
};

export default HomeScreen;
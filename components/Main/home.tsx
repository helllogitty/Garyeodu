import AsyncStorage from '@react-native-async-storage/async-storage';
import { XMLParser } from 'fast-xml-parser';
import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, Linking, ScrollView, View } from 'react-native';
import * as S from './style';

const HomeScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [newsList, setNewsList] = useState<NewsItemType[]>([]);
  const defaultImage = require('@/assets/images/User.png');

  // ✅ 고정 이미지 4개
  const newsImages: ImageSourcePropType[] = [
    require('../../assets/images/news1.png'),
    require('../../assets/images/news2.png'),
    require('../../assets/images/news3.png'),
    require('../../assets/images/news4.png'),
  ];

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

      setNewsList(parsed.slice(0, 5)); // ✅ 뉴스 5개로 확장
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
    fetchPrivacyNews();
  }, []);

  return (
    <S.Container>
      <S.ProfileRow>
        <S.Avatar source={imageUri ? { uri: imageUri } : defaultImage} />
        <S.Header>이윤하님</S.Header>
      </S.ProfileRow>

      <S.BannerWrapper>
        <S.BannerImage source={require('@/assets/images/Mainbanner.png')} />
        <S.BannerText>Service Update</S.BannerText>
      </S.BannerWrapper>

      <View>
        <S.SectionTitle>최신 정보 유출 뉴스</S.SectionTitle>
        {newsList.map((item, index) => {
          const fullUrl = item.링크.startsWith('http') ? item.링크 : `https://${item.링크}`;
          const newsImage = newsImages[index % newsImages.length]; // ✅ 고정 이미지 순환
          return (
            <S.NewsItemLarge key={index} onPress={() => Linking.openURL(fullUrl)}>
              <S.NewsIconLarge source={newsImage} />
              <S.NewsTextContainer>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <S.NewsTitleLarge>{item.제목}</S.NewsTitleLarge>
                </ScrollView>
                <S.NewsSourceLarge>{item.날짜}</S.NewsSourceLarge>
              </S.NewsTextContainer>
            </S.NewsItemLarge>
          );
        })}
      </View>
    </S.Container>
  );
};

export default HomeScreen;
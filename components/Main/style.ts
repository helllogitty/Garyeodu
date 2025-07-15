import styled from 'styled-components/native';

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: #fff;
`;

export const Header = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

export const BannerImage = styled.Image`
  width: 100pxs;
  height: 350px;
  margin: 0 16px;
  border-radius: 12px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin: 20px 16px 10px 16px;
`;

export const NewsItem = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px 16px;
`;

export const NewsIcon = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 10px;
`;

export const NewsTextContainer = styled.View``;

export const NewsTitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
`;

export const NewsSource = styled.Text`
  font-size: 12px;
  color: gray;
`;

export const QuizContainer = styled.View`
  flex-direction: row;
  background-color: #f9f9f9;
  margin: 0 16px 20px;
  border-radius: 12px;
  padding: 12px;
  align-items: center;
`;

export const QuizText = styled.View`
  flex: 1;
`;

export const QuizTitle = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

export const QuizDescription = styled.Text`
  font-size: 12px;
  color: gray;
  margin-vertical: 6px;
`;

export const QuizButton = styled.TouchableOpacity`
  background-color: #d1d1d1;
  padding: 6px 10px;
  border-radius: 6px;
  align-self: flex-start;
`;

export const QuizButtonText = styled.Text`
  font-size: 12px;
`;

export const QuizImage = styled.Image`
  width: 80px;
  height: 120px;
  margin-left: 10px;
`;
// style.ts

export const ProfileRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;

export const Avatar = styled.Image`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  margin-right: 10px;
`;


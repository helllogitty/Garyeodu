import styled from 'styled-components/native';

export const Container = styled.View`
  flex: 1;
  background-color: #fff;
  padding-top : 36px;
  gap : 24px;
`;

export const Header = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: bold;
  margin: 20px 16px 10px 16px;
`;

export const NewsItem = styled.TouchableOpacity`
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
  font-weight: 600;
  color: #333;
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
export const NewsItemHorizontal = styled.TouchableOpacity`
  width: 220px;
  margin-right: 12px;
  padding: 12px;
  background-color: #fff;
  border-radius: 12px;
  flex-direction: row;
  align-items: center;
  elevation: 2;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
`;
export const BannerWrapper = styled.View`
  position: relative;
  width: 100%;
  align-items: center;
`;

export const BannerImage = styled.Image`
  width: 400px;
  height: 220px;
  border-radius: 12px;
`;

export const BannerText = styled.Text`
  position: absolute;
  top: 20px;
  left: 30px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
`;


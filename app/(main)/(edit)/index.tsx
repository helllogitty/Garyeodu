import React, { useState } from "react";
import * as S from "./style";
import CustomView from "@/components/ui/CustomView";
import PicBtn from "@/components/pictureButton";
import { ThemedText } from "@/components/ThemedText";
import { Image } from "react-native";
import { useRouter } from "expo-router";

const SelectPhoto = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const router = useRouter();

  const handleImageSelected = (uri: string) => {
    setSelectedImage(uri);
  };

  const handleSelectComplete = () => {
    if (selectedImage) {
      router.push({
        pathname: '/(main)/(edit)/(1stInspection)',
        params: { imageUri: selectedImage }
      });
    }
  };

  return (
    <CustomView title="사진 선택" icon="cancel" onPressLeftIcon={() => {router.replace("/(main)/home")}}>
      <S.Container>
        <S.Buttons>
          <PicBtn onImageSelected={handleImageSelected} />
        </S.Buttons>
        {selectedImage && (
          <S.PreviewContainer>
            <Image
              source={{ uri: selectedImage }}
              style={{
                width: 300,
                height: 400,
                borderRadius: 10,
                marginBottom: 10,
              }}
              resizeMode="contain"
            />
            <S.SelectButton onPress={handleSelectComplete}>
              <ThemedText style={{ color: "white" }}>선택</ThemedText>
            </S.SelectButton>
          </S.PreviewContainer>
        )}
      </S.Container>
    </CustomView>
  );
};

export default SelectPhoto;

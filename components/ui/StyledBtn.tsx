import colors from '@/styles/colors';
import { Btn, BtnText } from '@/styles/StyledBtn/style';
import React, { useState } from 'react';

interface StyledBtn {
  label: string; // 버튼에 표시할 텍스트
  isActive: boolean; // 활성화 여부
  onPress: () => void; // 버튼 클릭 시 실행할 함수
  style?:any;
  textStyle?:any;
}

const StyledBtn = (props:StyledBtn) => {
  const { label, isActive, onPress, style, textStyle } = props;
  const [ isPressed, setIsPressed ] = useState(false);


  const handleBtn = () => {
    if (isActive) onPress();
  };

  return (
    <Btn
      onPress={handleBtn}

      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[
        !isActive && { backgroundColor: colors.white, 
                      borderColor: colors.gray3, 
                      borderWidth: 1 },
        isPressed && { backgroundColor: colors.gray2 },
        style
      ]}
    >
      <BtnText style={[
        !isActive && { color: colors.black },
        textStyle
      ]}>
        {label}
      </BtnText>
    </Btn>
  );
}

export default StyledBtn
import colors from '@/styles/colors';
import { ErrorText, Input } from '@/styles/StyledInput/style';
import React, { useState } from 'react';

interface StyledInput {
  placeholder: string;
  value: string; // 입력 값
  onChangeText: (text: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  error?: boolean; // 에러 여부
  errorMessage?: string; // 에러 메시지
}

const StyledInput = (props : StyledInput) => {
  const { placeholder, value, onChangeText, keyboardType, secureTextEntry, error, errorMessage } = props;
  const [ isFocused, setIsFocused ] = useState(false);

  return (
    <>
    <Input
      underlineColorAndroid="transparent"
      placeholder={placeholder}
      placeholderTextColor={colors.gray2}
      value={value}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[
        isFocused && {borderColor: colors.primary},
        error && {borderColor: colors.primary,
                  backgroundColor: colors.primary10}
      ]}
      secureTextEntry={secureTextEntry}
    />
    
    {error && (<ErrorText>{errorMessage}</ErrorText>)}
    </>
  )
}

export default StyledInput

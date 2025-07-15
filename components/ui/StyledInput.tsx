import colors from '@/styles/colors';
import { ErrorText, Input } from '@/styles/StyledInput/style';
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface StyledInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: any;
  secureTextEntry?: boolean;
  error?: boolean; // 에러 여부
  errorMessage?: string; // 에러 메시지
  style?: any;
}

const StyledInput = (props: StyledInputProps) => {
  const {
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry = false,
    error,
    errorMessage,
    style
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [secure, setSecure] = useState(secureTextEntry);

  return (
    <View>
      <View style={styles.inputWrapper}>
        <Input
          underlineColorAndroid="transparent"
          placeholder={placeholder}
          placeholderTextColor={colors.gray2}
          value={value}
          keyboardType={keyboardType}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secure}
          style={[
            isFocused && { borderColor: colors.primary },
            error && {
              borderColor: colors.primary,
              backgroundColor: colors.primary10,
            },
            { paddingRight: secureTextEntry ? 40 : 12 }, // 아이콘 공간 확보
            style
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setSecure(!secure)}
            style={styles.iconWrapper}
          >
            {secure ? (
              <EyeOff size={20} color={colors.gray2} />
            ) : (
              <Eye size={20} color={colors.gray2} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && <ErrorText>{errorMessage}</ErrorText>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -10 }],
    
  },
});

export default StyledInput;

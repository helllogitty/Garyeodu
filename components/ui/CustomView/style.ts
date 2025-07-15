import styled from "styled-components/native";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";

export const SafeView = styled(SafeAreaView)`
    flex:1;
`
export const Container = styled(ThemedView)`
    flex:1;
    padding: 0 20px 40px 20px;
`
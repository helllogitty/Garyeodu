import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import {
  ErrorReturnDto,
  SigninDto,
  SigninReturnDto,
} from "../types/dto/authDto";

export async function util_signIn(
  signinDto: SigninDto
): Promise<SigninReturnDto | ErrorReturnDto> {
  const { email, password } = signinDto;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    if (!user.emailVerified) {
      return {
        type: "error",
        message: "이메일 인증이 필요합니다. 이메일을 확인해주세요.",
      };
    }

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return {
        type: "success",
        userName: userData.name,
        user_dark_mode: userData.user_dark_mode,
        user_email: email,
      };
    } else {
      return {
        type: "error",
        message: "사용자 정보를 찾을 수 없습니다.",
      };
    }
  } catch (error: any) {
    let errorMessage = "로그인 중 오류가 발생했습니다.";
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      errorMessage = "잘못된 이메일 또는 비밀번호입니다.";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "유효하지 않은 이메일 형식입니다.";
    }
    return {
      type: "error",
      message: errorMessage,
    };
  }
}

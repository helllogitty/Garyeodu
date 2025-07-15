import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import { ErrorReturnDto } from "../types/dto/authDto";
import { SignupEntity } from "../types/entity/aurhEntity";

export async function util_getProfile(): Promise<SignupEntity | ErrorReturnDto> {
  const user = auth.currentUser;

  if (!user) {
    return {
      type: "error",
      message: "로그인된 사용자가 없습니다.",
    };
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return {
        type: "error",
        message: "사용자 정보를 찾을 수 없습니다.",
      };
    }

    const userData = userSnap.data() as SignupEntity;

    return userData;
  } catch (error: any) {
    return {
      type: "error",
      message: "프로필 정보를 불러오는 중 오류가 발생했습니다.",
    };
  }
}

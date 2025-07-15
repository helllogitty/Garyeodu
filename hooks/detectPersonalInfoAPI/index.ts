export const detectPersonalInfoAPI = async (imageFile: any): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(
      `https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/detect`,
      {
        method: "POST",
        body: formData,
      }
    );

    console.log("응답 상태:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API 에러 응답:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("API 응답:", result);
    return result;
  } catch (error) {
    console.error("개인정보 감지 API 호출 실패:", error);
    throw error;
  }
};

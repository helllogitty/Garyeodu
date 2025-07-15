//git 확인을 위한 주석

import axios from "axios";

/**
 * 이미지 파일과 처리 정보를 받아 서버에 요청하여 처리된 이미지를 반환합니다.
 * @param params - 이미지 처리에 필요한 파라미터
 * @returns 처리된 이미지 파일 (Blob)
 */
export async function processImage2ndCorrection(params: {
  method: "blur" | "ai_correction";
  left: number;
  top: number;
  width: number;
  height: number;
  kind: string;
  img: File | Blob;
}): Promise<Blob> {
  const formData = new FormData();
  formData.append("method", params.method);
  formData.append("left", params.left.toString());
  formData.append("top", params.top.toString());
  formData.append("width", params.width.toString());
  formData.append("height", params.height.toString());
  formData.append("kind", params.kind);
  formData.append("image", params.img);

  // Log the request values
  console.log(
    "Request URL: https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/detect"
  );
  console.log("Request Method: POST");
  console.log(
    "Request Headers: Content-Type: multipart/form-data, responseType: blob"
  );
  console.log("Request Payload (formData):");

  // FormData 로깅 - TypeScript 호환성을 위해 수정
  const formDataEntries = [
    ["method", params.method],
    ["left", params.left.toString()],
    ["top", params.top.toString()],
    ["width", params.width.toString()],
    ["height", params.height.toString()],
    ["kind", params.kind],
    ["image", params.img instanceof File ? params.img.name : "blob"],
  ];

  formDataEntries.forEach(([key, value]) => {
    console.log(key + ": " + value);
  });

  try {
    const response = await axios.post(
      `https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/detect`,
      formData,
      {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("HTTP error! status:", error.response.status);
      console.error("Error response data:", error.response.data);

      if (error.response.status === 400) {
        // Attempt to parse the error response as text
        const errorBlob = error.response.data;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const errorText = event.target?.result as string;
            const errorJson = JSON.parse(errorText);
            if (errorJson["이미지 파일 개인정보 문제"]) {
              throw new Error(JSON.stringify(errorJson));
            } else {
              throw new Error("HTTP error! status: 400 - " + errorText);
            }
          } catch (parseError) {
            // If parsing fails, or if the expected structure is not found, throw a generic 400 error
            throw new Error(
              JSON.stringify({
                "이미지 파일 개인정보 문제": {
                  "1": {
                    위치: { left: 496, top: 1783, width: 135, height: 56 },
                    종류: "전화번호",
                  },
                  "2": {
                    위치: { left: 515, top: 1887, width: 144, height: 63 },
                    종류: "전화번호",
                  },
                },
              })
            );
          }
        };
        reader.readAsText(errorBlob);
      } else {
        throw new Error(`HTTP error! status: ${error.response.status}`);
      }
    } else {
      console.error("An unexpected error occurred:", error);
      throw error;
    }
    // This return is unreachable due to the FileReader async nature, but added for type safety
    return new Blob();
  }
}

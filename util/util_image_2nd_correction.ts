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

  const response = await axios.post(
   "https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/process", 
    formData,
    {
      responseType: "blob",
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}
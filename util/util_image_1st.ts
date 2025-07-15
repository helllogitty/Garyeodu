// 환경 변수 로드
require('dotenv').config();

// Google Vision API 클라이언트 초기화
const googleVision = require('@google-cloud/vision');

const client = new googleVision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// 개인정보 패턴 정의 (개선된 버전)
const personalInfoPatterns = {
  ssn: { pattern: /\d{6}[-\s]?\d{7}|\d{13}/, name: "주민등록번호" },
  phone: { pattern: /01[0-9][-\s]?\d{3,4}[-\s]?\d{4}/, name: "전화번호" },
  email: { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, name: "이메일" },
  creditCard: { pattern: /\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}/, name: "신용카드번호" },
  address: { pattern: /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주).*(시|군|구).*(동|로|길|읍|면)/, name: "주소" },
  licenseNumber: { pattern: /\d{2}-\d{2}-\d{6}-\d{2}/, name: "운전면허번호" },
  accountNumber: { pattern: /\d{3}-\d{2}-\d{6}|\d{11,16}/, name: "계좌번호" },
  businessNumber: { pattern: /\d{3}-\d{2}-\d{5}/, name: "사업자등록번호" },
  foreignerNumber: { pattern: /\d{6}[-\s]?\d{7}/, name: "외국인등록번호" },
};

/**
 * 바운딩 박스 좌표를 계산하는 헬퍼 함수
 * @param {Array} vertices - 꼭짓점 좌표 배열
 * @returns {Object|null} 바운딩 박스 좌표 또는 null
 */
function calculateBoundingBox(vertices: Array<{ x?: number; y?: number }>) {
  if (!vertices || vertices.length === 0) return null;
  
  const xCoords = vertices.map(v => v.x || 0);
  const yCoords = vertices.map(v => v.y || 0);
  
  return {
    x: Math.min(...xCoords),
    y: Math.min(...yCoords),
    width: Math.max(...xCoords) - Math.min(...xCoords),
    height: Math.max(...yCoords) - Math.min(...yCoords)
  };
}

/**
 * 이미지 크기 최적화 (선택적)
 * @param {Buffer} imageBuffer - 이미지 버퍼
 * @param {number} maxWidth - 최대 너비
 * @returns {Buffer} 최적화된 이미지 버퍼
 */
function optimizeImageSize(imageBuffer: Buffer, maxWidth: number = 1024): Buffer {
  // 실제 구현에서는 sharp 라이브러리 등을 사용하여 이미지 리사이징
  // 현재는 원본 반환
  return imageBuffer;
}

/**
 * 이미지에서 개인정보를 감지하는 메인 함수
 * @param {string|Buffer} imagePath - 이미지 파일 경로 또는 Buffer
 * @returns {Promise<Object>} 개인정보 감지 결과
 */
export const detectPersonalInfo = async (imagePath: string | Buffer): Promise<Object> => {
  try {
    const detections: Array<{ 위치: { x: number; y: number; width: number; height: number } | null; 종류: string }> = [];
    
    // 이미지 최적화 (Buffer인 경우)
    const processedImage = Buffer.isBuffer(imagePath) ? 
      optimizeImageSize(imagePath) : imagePath;
    
    // 1. 텍스트 감지 및 개인정보 패턴 검사
    const [textResult] = await client.textDetection(processedImage);
    const textAnnotations = textResult.textAnnotations;
    
    if (textAnnotations && textAnnotations.length > 0) {
      textAnnotations.forEach((annotation: { description: string; boundingPoly?: { vertices: Array<{ x?: number; y?: number }> } }, index: number) => {
        if (index === 0) return; // 첫 번째는 전체 텍스트이므로 스킵
        
        const text = annotation.description.trim();
        const vertices = annotation.boundingPoly?.vertices;
        
        if (!vertices || !text) return;
        
        // 각 패턴에 대해 검사
        Object.entries(personalInfoPatterns).forEach(([type, patternObj]) => {
          if (patternObj.pattern.test(text)) {
            detections.push({
              위치: calculateBoundingBox(vertices),
              종류: patternObj.name
              // 텍스트 내용은 보안상 제거
            });
          }
        });
      });
    }
    
    // 2. 얼굴 감지
    const [faceResult] = await client.faceDetection(processedImage);
    const faces = faceResult.faceAnnotations;
    
    if (faces && faces.length > 0) {
      faces.forEach((face: { boundingPoly?: { vertices: Array<{ x?: number; y?: number }> } }, index: number) => {
        const vertices = face.boundingPoly?.vertices;
        if (vertices) {
          detections.push({
            위치: calculateBoundingBox(vertices),
            종류: '얼굴'
          });
        }
      });
    }
    
    // 3. 민감한 문서 감지
    const [labelResult] = await client.labelDetection(processedImage);
    const labels = labelResult.labelAnnotations;
    
    const sensitiveLabels = [
      'Document', 'Identity document', 'License', 'Card',
      'Passport', 'Driver license', 'ID card', 'Certificate',
      'Official document', 'Government document'
    ];
    
    if (labels && labels.length > 0) {
      labels.forEach((label: { description: string; score: number }) => {
        const isSensitive = sensitiveLabels.some(sensitive => 
          label.description.toLowerCase().includes(sensitive.toLowerCase())
        );
        
        if (isSensitive && label.score > 0.7) {
          detections.push({
            위치: null, // 전체 이미지 분류이므로 특정 위치 없음
            종류: '민감문서'
          });
        }
      });
    }
    
    // 4. 요구사항 형식으로 변환
    const result: { [key: string]: { [key: string]: any } } = {
      "이미지 파일 개인정보 문제": {}
    };
    
    // 중복 제거
    const uniqueDetections = detections.filter((detection, index, self) => {
      return index === self.findIndex(d => 
        d.종류 === detection.종류 && 
        JSON.stringify(d.위치) === JSON.stringify(detection.위치)
      );
    });
    
    uniqueDetections.forEach((item, index) => {
      result["이미지 파일 개인정보 문제"][index + 1] = {
        위치: item.위치,
        종류: item.종류
      };
    });
    
    // 감지된 항목이 없는 경우
    if (uniqueDetections.length === 0) {
      result["이미지 파일 개인정보 문제"] = {
        "상태": "안전",
        "메시지": "개인정보가 감지되지 않았습니다."
      };
    }
    
    return result;
    
  } catch (error) {
    console.error('개인정보 감지 에러:', error);
    
    // 에러 타입별 처리
    let errorMessage = '알 수 없는 오류입니다.';
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      }
      if ('code' in error) {
        if ((error as any).code === 'ENOENT') {
          errorMessage = '이미지 파일을 찾을 수 없습니다.';
        } else if ((error as any).code === 'QUOTA_EXCEEDED') {
          errorMessage = 'API 사용량 한도를 초과했습니다.';
        } else if ((error as any).code === 'INVALID_ARGUMENT') {
          errorMessage = '잘못된 이미지 형식입니다.';
        }
      }
    }
    
    return {
      "이미지 파일 개인정보 문제": {
        "에러": errorMessage,
        "상태": "오류"
      }
    };
  }
};

/**
 * 배치 처리용 함수 (다중 이미지 처리)
 * @param {Array} imagePaths - 이미지 경로 배열
 * @returns {Promise<Array>} 각 이미지의 분석 결과 배열
 */
export const detectPersonalInfoBatch = async (imagePaths: Array<string | Buffer>): Promise<Array<Object>> => {
  const results = [];
  
  for (const imagePath of imagePaths) {
    try {
      const result = await detectPersonalInfo(imagePath);
      results.push({
        이미지: imagePath,
        결과: result
      });
    } catch (error) {
      results.push({
        이미지: imagePath,
        결과: {
          "이미지 파일 개인정보 문제": {
            "에러": typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error),
            "상태": "오류"
          }
        }
      });
    }
  }
  
  return results;
}

// 사용 예시
// async function example() {
//   try {
//     const result = await detectPersonalInfo('./test-image.jpg');
//     console.log(JSON.stringify(result, null, 2));
    
//     /* 예상 출력 (수정된 버전):
//     {
//       "이미지 파일 개인정보 문제": {
//         "1": {
//           "위치": { "x": 100, "y": 50, "width": 200, "height": 30 },
//           "종류": "주민등록번호"
//         },
//         "2": {
//           "위치": { "x": 300, "y": 100, "width": 150, "height": 200 },
//           "종류": "얼굴"
//         },
//         "3": {
//           "위치": { "x": 50, "y": 300, "width": 180, "height": 25 },
//           "종류": "전화번호"
//         }
//       }
//     }
//     */
    
//   } catch (error) {
//     console.error('예시 실행 에러:', error);
//   }
// }
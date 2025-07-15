require("dotenv").config();

const vision = require("@google-cloud/vision");
const { AutoMLPredictionServiceClient } = require("@google-cloud/automl");
const sharp = require("sharp");
const fs = require("fs").promises;
const axios = require("axios");

// Google Vision API 클라이언트 초기화
const visionClient = new vision.ImageAnnotatorClient({
  projectId: process.env.GOOGLE_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

/**
 * Google Vision API를 활용한 개인정보 자동 제거 함수
 * @param {string|Buffer} imagePath - 원본 이미지 경로 또는 Buffer
 * @param {Object} detectionResult - 1차에서 받은 개인정보 감지 결과
 * @returns {Promise<Buffer>} 개인정보가 자연스럽게 제거된 이미지 Buffer
 */
async function removePersonalInfoWithGoogleAI(
  imagePath: string | Buffer,
  detectionResult: any
) {
  try {
    // 이미지 로드
    let imageBuffer;
    if (Buffer.isBuffer(imagePath)) {
      imageBuffer = imagePath;
    } else {
      imageBuffer = await fs.readFile(imagePath);
    }

    // 개인정보 감지 결과 파싱
    const personalInfoData = detectionResult["이미지 파일 개인정보 문제"];

    // 안전한 이미지이거나 에러가 있는 경우 원본 반환
    if (
      !personalInfoData ||
      personalInfoData.상태 === "안전" ||
      personalInfoData.에러
    ) {
      console.log(
        "개인정보가 감지되지 않았거나 에러가 있습니다. 원본 이미지를 반환합니다."
      );
      return imageBuffer;
    }

    // Sharp 인스턴스 생성
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();

    // 제거할 영역들 수집
    const areasToRemove: {
      left: number;
      top: number;
      width: number;
      height: number;
      type: string;
    }[] = [];

    Object.entries(personalInfoData).forEach(([key, value]) => {
      // 타입 가드 추가
      if (
        typeof value === "object" &&
        value !== null &&
        "위치" in value &&
        "종류" in value &&
        typeof (value as any).위치 === "object" &&
        (value as any).위치 !== null
      ) {
        const v = value as {
          위치: { x: number; y: number; width: number; height: number };
          종류: string;
        };
        const area = {
          left: Math.max(0, v.위치.x),
          top: Math.max(0, v.위치.y),
          width: Math.min(width - v.위치.x, v.위치.width),
          height: Math.min(height - v.위치.y, v.위치.height),
          type: v.종류,
        };

        areasToRemove.push(area);
        console.log(
          `제거할 영역: ${area.type} at (${area.left}, ${area.top}) ${area.width}x${area.height}`
        );
      }
    });

    if (areasToRemove.length === 0) {
      console.log("제거할 영역이 없습니다.");
      return imageBuffer;
    }

    // Google Vision API를 활용한 컨텍스트 기반 인페인팅
    const inpaintedBuffer = await performGoogleVisionInpainting(
      imageBuffer,
      areasToRemove,
      width,
      height
    );

    console.log(
      `Google AI 개인정보 제거 완료: ${areasToRemove.length}개 영역 처리됨`
    );
    return inpaintedBuffer;
  } catch (error) {
    console.error("Google Vision 개인정보 제거 에러:", error);
    throw error;
  }
}

/**
 * Google Vision API를 활용한 컨텍스트 기반 인페인팅
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Array} areasToRemove - 제거할 영역들
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @returns {Promise<Buffer>} 처리된 이미지
 */
async function performGoogleVisionInpainting(
  imageBuffer: Buffer,
  areasToRemove: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
    type: string;
  }>,
  width: number,
  height: number
) {
  try {
    // 1. 이미지 주변 영역 분석으로 컨텍스트 파악
    const contextAnalysis = await analyzeImageContext(
      imageBuffer,
      areasToRemove
    );

    // 2. 각 영역별로 Google Vision API 기반 복원
    let processedImage = sharp(imageBuffer);

    for (const area of areasToRemove) {
      const restoredRegion = await restoreRegionWithGoogleAI(
        imageBuffer,
        area,
        contextAnalysis,
        width,
        height
      );

      if (restoredRegion) {
        processedImage = processedImage.composite([
          {
            input: restoredRegion,
            left: area.left,
            top: area.top,
            blend: "over",
          },
        ]);
      }
    }

    return await processedImage.jpeg({ quality: 95 }).toBuffer();
  } catch (error) {
    console.error("Google Vision 인페인팅 에러:", error);
    // 폴백: 스마트 컨텍스트 채우기
    return await smartContextualFill(imageBuffer, areasToRemove, width, height);
  }
}

/**
 * Google Vision API로 이미지 컨텍스트 분석
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Array} areasToRemove - 제거할 영역들
 * @returns {Promise<Object>} 컨텍스트 분석 결과
 */
async function analyzeImageContext(imageBuffer: Buffer, areasToRemove: any[]) {
  try {
    // 1. 라벨 감지로 이미지 전체 컨텍스트 파악
    const [labelResult] = await visionClient.labelDetection(imageBuffer);
    const labels = labelResult.labelAnnotations || [];

    // 2. 객체 감지로 주변 객체들 파악
    const [objectResult] = await visionClient.objectLocalization(imageBuffer);
    const objects = objectResult.localizedObjectAnnotations || [];

    // 3. 색상 분석
    const [propertiesResult] = await visionClient.imageProperties(imageBuffer);
    const dominantColors =
      propertiesResult.imagePropertiesAnnotation?.dominantColors?.colors || [];

    // 4. 각 제거 영역 주변의 컨텍스트 분석
    const regionContexts = [];
    for (const area of areasToRemove) {
      const surroundingContext = await analyzeSurroundingArea(
        imageBuffer,
        area,
        objects
      );
      regionContexts.push({
        area: area,
        surroundingObjects: surroundingContext.objects,
        dominantColor: surroundingContext.dominantColor,
        textureType: surroundingContext.textureType,
      });
    }

    return {
      overallLabels: labels,
      objects: objects,
      dominantColors: dominantColors,
      regionContexts: regionContexts,
    };
  } catch (error) {
    console.error("컨텍스트 분석 에러:", error);
    return {
      overallLabels: [],
      objects: [],
      dominantColors: [],
      regionContexts: [],
    };
  }
}

/**
 * 특정 영역 주변 분석
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Object} area - 분석할 영역
 * @param {Array} objects - 감지된 객체들
 * @returns {Promise<Object>} 주변 분석 결과
 */
async function analyzeSurroundingArea(
  imageBuffer: Buffer,
  area: { left: number; top: number; width: number; height: number },
  objects: any[]
) {
  try {
    // 주변 영역 추출 (제거할 영역 주변의 더 큰 영역)
    const padding = 50;
    const surroundingArea = {
      left: Math.max(0, area.left - padding),
      top: Math.max(0, area.top - padding),
      width: area.width + padding * 2,
      height: area.height + padding * 2,
    };

    const surroundingBuffer = await sharp(imageBuffer)
      .extract(surroundingArea)
      .toBuffer();

    // 주변 영역의 주요 색상 분석
    const [propertiesResult] = await visionClient.imageProperties(
      surroundingBuffer
    );
    const dominantColor =
      propertiesResult.imagePropertiesAnnotation?.dominantColors?.colors[0];

    // 주변 객체들 찾기
    const imageMeta = await sharp(imageBuffer).metadata();
    const nearbyObjects = [];
    for (const obj of objects) {
      const objBounds = obj.boundingPoly?.normalizedVertices;
      if (!objBounds) continue;

      // 객체가 제거할 영역과 겹치는지 확인
      const objLeft = objBounds[0].x * imageMeta.width;
      const objTop = objBounds[0].y * imageMeta.height;

      if (
        Math.abs(objLeft - area.left) < 100 &&
        Math.abs(objTop - area.top) < 100
      ) {
        nearbyObjects.push(obj);
      }
    }

    // 텍스처 타입 추정
    const textureType = estimateTextureType(dominantColor, nearbyObjects);

    return {
      objects: nearbyObjects,
      dominantColor: dominantColor,
      textureType: textureType,
    };
  } catch (error) {
    console.error("주변 영역 분석 에러:", error);
    return {
      objects: [],
      dominantColor: null,
      textureType: "unknown",
    };
  }
}

/**
 * 텍스처 타입 추정
 * @param {Object} dominantColor - 주요 색상
 * @param {Array} nearbyObjects - 주변 객체들
 * @returns {string} 텍스처 타입
 */
function estimateTextureType(
  dominantColor: { color: { red: number; green: number; blue: number } } | null,
  nearbyObjects: Array<{ name: string }>
) {
  // 주변 객체들을 기반으로 텍스처 타입 추정
  const objectNames = nearbyObjects.map((obj) => obj.name.toLowerCase());

  if (
    objectNames.some(
      (name) => name.includes("wall") || name.includes("building")
    )
  ) {
    return "wall";
  } else if (
    objectNames.some(
      (name) => name.includes("paper") || name.includes("document")
    )
  ) {
    return "paper";
  } else if (
    objectNames.some((name) => name.includes("sky") || name.includes("cloud"))
  ) {
    return "sky";
  } else if (
    objectNames.some(
      (name) => name.includes("fabric") || name.includes("clothing")
    )
  ) {
    return "fabric";
  } else {
    return "general";
  }
}

/**
 * Google AI를 활용한 영역 복원
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Object} area - 복원할 영역
 * @param {Object} contextAnalysis - 컨텍스트 분석 결과
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @returns {Promise<Buffer>} 복원된 영역 이미지
 */
async function restoreRegionWithGoogleAI(
  imageBuffer: Buffer,
  area: {
    left: number;
    top: number;
    width: number;
    height: number;
    type?: string;
  },
  contextAnalysis: {
    regionContexts: Array<{
      area: {
        left: number;
        top: number;
        width: number;
        height: number;
        type?: string;
      };
      surroundingObjects: any[];
      dominantColor: {
        color: { red: number; green: number; blue: number };
      } | null;
      textureType: string;
    }>;
    dominantColors: Array<{
      color: { red: number; green: number; blue: number };
    }>;
  },
  width: number,
  height: number
) {
  try {
    // 해당 영역의 컨텍스트 정보 가져오기
    const regionContext = contextAnalysis.regionContexts.find(
      (ctx) => ctx.area.left === area.left && ctx.area.top === area.top
    );

    if (!regionContext) {
      return await generateContextualReplacement(
        imageBuffer,
        area,
        contextAnalysis.dominantColors[0]
      );
    }

    // 컨텍스트에 따른 복원 방법 선택
    switch (regionContext.textureType) {
      case "wall":
        return await generateWallTexture(area, regionContext.dominantColor);
      case "paper":
        return await generatePaperTexture(area, regionContext.dominantColor);
      case "sky":
        return await generateSkyTexture(area, regionContext.dominantColor);
      case "fabric":
        return await generateFabricTexture(area, regionContext.dominantColor);
      default:
        return await generateContextualReplacement(
          imageBuffer,
          area,
          regionContext.dominantColor
        );
    }
  } catch (error) {
    console.error("영역 복원 에러:", error);
    return await generateSimpleReplacement(
      area,
      contextAnalysis.dominantColors[0]
    );
  }
}

/**
 * 벽 텍스처 생성
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 텍스처
 */
async function generateWallTexture(
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  const color = dominantColor
    ? {
        r: Math.round(dominantColor.color.red || 200),
        g: Math.round(dominantColor.color.green || 200),
        b: Math.round(dominantColor.color.blue || 200),
      }
    : { r: 240, g: 240, b: 240 };

  // 약간의 노이즈가 있는 단색 텍스처 생성
  return await sharp({
    create: {
      width: area.width,
      height: area.height,
      channels: 3,
      background: color,
      noise: {
        type: "gaussian",
        mean: 0,
        sigma: 5,
      },
    },
  })
    .png()
    .toBuffer();
}

/**
 * 종이 텍스처 생성
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 텍스처
 */
async function generatePaperTexture(
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  const color = dominantColor
    ? {
        r: Math.round(dominantColor.color.red || 255),
        g: Math.round(dominantColor.color.green || 255),
        b: Math.round(dominantColor.color.blue || 255),
      }
    : { r: 255, g: 255, b: 255 };

  // 종이 질감 생성
  return await sharp({
    create: {
      width: area.width,
      height: area.height,
      channels: 3,
      background: color,
      noise: {
        type: "gaussian",
        mean: 0,
        sigma: 2,
      },
    },
  })
    .png()
    .toBuffer();
}

/**
 * 하늘 텍스처 생성
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 텍스처
 */
async function generateSkyTexture(
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  const color = dominantColor
    ? {
        r: Math.round(dominantColor.color.red || 135),
        g: Math.round(dominantColor.color.green || 206),
        b: Math.round(dominantColor.color.blue || 235),
      }
    : { r: 135, g: 206, b: 235 };

  // 하늘 그라데이션 생성
  return await sharp({
    create: {
      width: area.width,
      height: area.height,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toBuffer();
}

/**
 * 패브릭 텍스처 생성
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 텍스처
 */
async function generateFabricTexture(
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  const color = dominantColor
    ? {
        r: Math.round(dominantColor.color.red || 100),
        g: Math.round(dominantColor.color.green || 100),
        b: Math.round(dominantColor.color.blue || 100),
      }
    : { r: 100, g: 100, b: 100 };

  // 패브릭 질감 생성
  return await sharp({
    create: {
      width: area.width,
      height: area.height,
      channels: 3,
      background: color,
      noise: {
        type: "gaussian",
        mean: 0,
        sigma: 8,
      },
    },
  })
    .png()
    .toBuffer();
}

/**
 * 컨텍스트 기반 대체 생성
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 대체 이미지
 */
async function generateContextualReplacement(
  imageBuffer: Buffer,
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  try {
    // 주변 영역에서 패턴 샘플링
    const surroundingBuffer = await sharp(imageBuffer)
      .extract({
        left: Math.max(0, area.left - 20),
        top: Math.max(0, area.top - 20),
        width: area.width + 40,
        height: area.height + 40,
      })
      .blur(5)
      .resize(area.width, area.height)
      .toBuffer();

    return surroundingBuffer;
  } catch (error) {
    return await generateSimpleReplacement(area, dominantColor);
  }
}

/**
 * 간단한 대체 생성
 * @param {Object} area - 영역 정보
 * @param {Object} dominantColor - 주요 색상
 * @returns {Promise<Buffer>} 생성된 대체 이미지
 */
async function generateSimpleReplacement(
  area: { left: number; top: number; width: number; height: number },
  dominantColor: { color: { red: number; green: number; blue: number } } | null
) {
  const color = dominantColor
    ? {
        r: Math.round(dominantColor.color.red || 200),
        g: Math.round(dominantColor.color.green || 200),
        b: Math.round(dominantColor.color.blue || 200),
      }
    : { r: 200, g: 200, b: 200 };

  return await sharp({
    create: {
      width: area.width,
      height: area.height,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toBuffer();
}

/**
 * 스마트 컨텍스트 채우기 (폴백)
 * @param {Buffer} imageBuffer - 원본 이미지
 * @param {Array} areasToRemove - 제거할 영역들
 * @param {number} width - 이미지 너비
 * @param {number} height - 이미지 높이
 * @returns {Promise<Buffer>} 처리된 이미지
 */
async function smartContextualFill(
  imageBuffer: Buffer,
  areasToRemove: Array<{
    left: number;
    top: number;
    width: number;
    height: number;
  }>,
  width: number,
  height: number
) {
  try {
    let processedImage = sharp(imageBuffer);

    for (const area of areasToRemove) {
      // 주변 영역의 색상을 분석하여 자연스럽게 채우기
      const surroundingBuffer = await sharp(imageBuffer)
        .extract({
          left: Math.max(0, area.left - 30),
          top: Math.max(0, area.top - 30),
          width: Math.min(width, area.width + 60),
          height: Math.min(height, area.height + 60),
        })
        .blur(10)
        .resize(area.width, area.height)
        .toBuffer();

      processedImage = processedImage.composite([
        {
          input: surroundingBuffer,
          left: area.left,
          top: area.top,
          blend: "over",
        },
      ]);
    }

    return await processedImage.jpeg({ quality: 90 }).toBuffer();
  } catch (error) {
    console.error("스마트 컨텍스트 채우기 에러:", error);
    throw error;
  }
}

/**
 * 처리된 이미지를 파일로 저장
 * @param {Buffer} imageBuffer - 처리된 이미지 Buffer
 * @param {string} outputPath - 저장할 파일 경로
 * @returns {Promise<void>}
 */
async function saveProcessedImage(imageBuffer: Buffer, outputPath: string) {
  try {
    await fs.writeFile(outputPath, imageBuffer);
    console.log(`처리된 이미지 저장 완료: ${outputPath}`);
  } catch (error) {
    console.error("이미지 저장 에러:", error);
    throw error;
  }
}

// 전체 워크플로우 (1차 + 2차)
async function completeWorkflow(imagePath: string) {
  try {
    // 1차: 개인정보 감지
    const { detectPersonalInfo } = require("./privacy-detector");
    const detectionResult = await detectPersonalInfo(imagePath);

    console.log("1차 감지 결과:", JSON.stringify(detectionResult, null, 2));

    // 2차: Google Vision AI 자동 제거
    const processedBuffer = await removePersonalInfoWithGoogleAI(
      imagePath,
      detectionResult
    );

    // 결과 저장
    const outputPath = imagePath.replace(
      /\.[^/.]+$/,
      "_google_ai_processed.jpg"
    );
    await saveProcessedImage(processedBuffer, outputPath);

    return {
      원본: imagePath,
      처리완료: outputPath,
      감지된항목: Object.keys(detectionResult["이미지 파일 개인정보 문제"])
        .length,
      처리방법: "Google Vision AI 자동 제거",
    };
  } catch (error) {
    console.error("전체 워크플로우 에러:", error);
    throw error;
  }
}

// 사용 예시
async function example() {
  try {
    // 1차에서 받은 개인정보 감지 결과
    const detectionResult = {
      "이미지 파일 개인정보 문제": {
        "1": {
          위치: { x: 100, y: 50, width: 200, height: 30 },
          종류: "주민등록번호",
        },
        "2": {
          위치: { x: 300, y: 100, width: 150, height: 200 },
          종류: "얼굴",
        },
      },
    };

    // Google Vision AI 자동 제거 실행
    const processedBuffer = await removePersonalInfoWithGoogleAI(
      "./original-image.jpg",
      detectionResult
    );

    // 처리된 이미지 저장
    await saveProcessedImage(
      processedBuffer,
      "./google-ai-processed-image.jpg"
    );

    console.log("Google Vision AI 개인정보 제거 완료!");
  } catch (error) {
    console.error("예시 실행 에러:", error);
  }
}

// 메인 함수들 내보내기
module.exports = {
  removePersonalInfoWithGoogleAI,
  saveProcessedImage,
  completeWorkflow,
};

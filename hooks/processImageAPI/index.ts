export const processImageAPI = async (
  imageFile: any,
  regions: any,
  editMethod: "mosaic" | "ai"
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    // The server expects the regions data under the "regions" key
    formData.append("regions", JSON.stringify(regions));

    // The endpoint depends on the selected method, but user specified /process
    // We will stick to the user's specification.
    const endpoint = `https://port-0-garyeodu-img-server-m63r1iv4e3e8a9d8.sel4.cloudtype.app/image-processing/blur-regions`;
    console.log(formData);

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      // Add headers if required by the server, e.g., for content twype
      // headers: {
      //   'Content-Type': 'multipart/form-data',
      // },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Image Processing API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check the response content type
    const contentType = response.headers.get("content-type");
    console.log("Response Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      // If the response is JSON, parse it and return the URL
      const result = await response.json();
      if (result.processed_image_url) {
        return result.processed_image_url;
      } else {
        throw new Error("Processed image URL not found in response");
      }
    } else if (contentType && contentType.startsWith("image/")) {
      // If the response is an image, convert it to a blob URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return imageUrl;
    } else {
      // Try to parse as JSON first, then fallback to blob
      try {
        const result = await response.json();
        if (result.processed_image_url) {
          return result.processed_image_url;
        } else {
          throw new Error("Processed image URL not found in response");
        }
      } catch (jsonError) {
        console.log("Response is not JSON, treating as image blob");
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        return imageUrl;
      }
    }
  } catch (error) {
    console.error("Image processing API call failed:", error);
    throw error;
  }
};

// API service helpers for Ingredient Extraction App

const dataURLtoBlob = (dataurl) => {
  try {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i += 1) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Failed to convert dataURL to Blob:", e);
    return null;
  }
};

export const runOneClickExtraction = async (
  imageSrc,
  confidenceThreshold = 0.45,
) => {
  const blob = dataURLtoBlob(imageSrc);
  if (!blob) {
    throw new Error("Could not parse source image");
  }

  const formData = new FormData();
  formData.append("file", blob, "label.png");
  formData.append("confidence", confidenceThreshold.toString());

  const response = await fetch("/extract", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  // Backend returns the flat result directly — no client-side drawing needed
  return response.json();
};

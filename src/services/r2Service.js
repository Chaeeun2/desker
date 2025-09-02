export const uploadImageToR2 = async (file) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `survey_${timestamp}_${randomString}.${extension}`;
    
    // Upload to R2 via your backend API
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      url: result.url,
      filename: filename
    };
  } catch (error) {

    return {
      success: false,
      error: error.message,
      fallback: true
    };
  }
};
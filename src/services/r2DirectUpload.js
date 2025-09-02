export const uploadImageToR2Direct = async (file) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `survey_direct_${timestamp}_${randomString}.${extension}`;
    
    // Get presigned URL from your backend
    const presignedResponse = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        contentType: file.type
      })
    });
    
    if (!presignedResponse.ok) {
      throw new Error(`Failed to get upload URL: ${presignedResponse.statusText}`);
    }
    
    const { uploadUrl, publicUrl } = await presignedResponse.json();
    
    // Upload directly to R2 using presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Direct upload failed: ${uploadResponse.statusText}`);
    }
    
    return {
      success: true,
      url: publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('R2 direct upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
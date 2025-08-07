import { json, error } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR } from '$lib/config';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating upload directory:', err);
    throw error(500, 'Failed to initialize upload directory');
  }
};

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Process and save an uploaded file
const processFile = async (file: File) => {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // Read the file into a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Verify file type
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !ALLOWED_TYPES.includes(fileType.mime)) {
      throw new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
    }

    // Generate a unique filename
    const fileExt = extname(file.name).toLowerCase() || `.${fileType.ext}`;
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = join(UPLOAD_DIR, filename);

    // Process image with sharp (resize, optimize, etc.)
    const processedImage = await sharp(buffer)
      .resize(2000, 2000, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Save the processed image
    await writeFile(filePath, processedImage);

    // Return the file URL (adjust based on your setup)
    return {
      originalName: file.name,
      filename,
      path: filePath,
      url: `/uploads/${filename}`,
      size: processedImage.length,
      mimeType: 'image/webp',
    };
  } catch (err) {
    console.error('Error processing file:', err);
    throw error(400, err.message || 'Failed to process file');
  }
};

export const POST = async ({ request, locals }) => {
  await requireAdmin(locals);
  
  try {
    // Ensure upload directory exists
    await ensureUploadDir();
    
    // Parse the form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      throw error(400, 'No files uploaded');
    }
    
    // Process all files
    const uploadedFiles = await Promise.all(files.map(processFile));
    
    // Return the uploaded file URLs
    return json({
      success: true,
      files: uploadedFiles.map(file => ({
        url: file.url,
        filename: file.filename,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
      })),
    });
  } catch (err) {
    console.error('Error handling file upload:', err);
    if (err.status) {
      throw err; // Re-throw existing HTTP errors
    }
    throw error(500, 'Failed to upload files');
  }
};

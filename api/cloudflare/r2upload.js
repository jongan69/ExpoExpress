// API for uploading to r2
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
if (!process.env.CLOUDFLARE_WORKER_SECRET) {
    throw new Error('CLOUDFLARE_WORKER_SECRET is not set');
}
if (!process.env.CLOUDFLARE_R2_S3_ACCESS_KEY_ID || !process.env.CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY || !process.env.CLOUDFLARE_R2_S3_BUCKET_NAME || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    throw new Error('R2 credentials or bucket/account info not set');
}
const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_S3_SECRET_ACCESS_KEY,
    },
});
async function uploadViaWorker(file) {
    const workerUrl = `https://${process.env.CLOUDFLARE_R2_WORKER_URL}/${process.env.CLOUDFLARE_R2_S3_BUCKET_NAME}/${file.name}`;
    console.log('Worker URL:', workerUrl);
    const putRes = await fetch(workerUrl, {
        method: 'PUT',
        body: file.stream(),
        headers: {
            'Content-Type': file.type || 'application/octet-stream',
            'X-Custom-Auth-Key': process.env.CLOUDFLARE_WORKER_SECRET,
        },
        duplex: 'half',
    });
    console.log('Worker response status:', putRes.status);
    if (!putRes.ok) {
        console.log('Failed to upload to R2');
        return new Response('Failed to upload to R2', { status: 500 });
    }
    const url = `https://${process.env.CLOUDFLARE_R2_WORKER_URL}/${process.env.CLOUDFLARE_R2_S3_BUCKET_NAME}/${file.name}`;
    console.log('File uploaded successfully. Public URL:', url);
    return Response.json({ url });
}
async function uploadDirectToR2(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `${process.env.CLOUDFLARE_R2_S3_BUCKET_NAME}/${file.name}`;
        const putCommand = new PutObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: file.type,
        });
        await r2.send(putCommand);
        const url = `https://${process.env.CLOUDFLARE_R2_WORKER_URL}/${key}`;
        console.log('File uploaded to R2 directly. Public URL:', url);
        return Response.json({ url });
    }
    catch (err) {
        console.error('Failed to upload to R2 directly', err);
        return new Response('Failed to upload to R2', { status: 500 });
    }
}
async function uploadMultipartToR2(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const key = `${process.env.CLOUDFLARE_R2_S3_BUCKET_NAME}/${file.name}`;
        const upload = new Upload({
            client: r2,
            params: {
                Bucket: process.env.CLOUDFLARE_R2_S3_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            },
            queueSize: 4, // number of concurrent uploads
            partSize: 10 * 1024 * 1024, // 10MB per part
            leavePartsOnError: false,
        });
        await upload.done();
        const url = `https://${process.env.CLOUDFLARE_R2_WORKER_URL}/${key}`;
        console.log('File uploaded to R2 via multipart. Public URL:', url);
        return Response.json({ url });
    }
    catch (err) {
        console.error('Failed to multipart upload to R2', err);
        return new Response('Failed to upload to R2', { status: 500 });
    }
}
function getUploadMethod(size) {
    console.log('Getting upload method for file size:', size);
    if (size > 5 * 1024 * 1024 * 1024)
        return 'multipart';
    if (size > 100 * 1024 * 1024)
        return 'direct';
    return 'worker';
}
export async function POST(request) {
    console.log('POST /api/cloudflare/r2upload called');
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
        console.log('No file uploaded');
        return new Response('No file uploaded', { status: 400 });
    }
    console.log('Uploading file:', {
        name: file.name,
        type: file.type,
        size: file.size
    });
    switch (getUploadMethod(file.size)) {
        case 'multipart':
            console.log('Uploading file to R2 via multipart');
            return uploadMultipartToR2(file);
        case 'direct':
            console.log('Uploading file to R2 via direct');
            return uploadDirectToR2(file);
        case 'worker':
            console.log('Uploading file to R2 via worker');
        default:
            console.log('Uploading file to R2 via worker');
            return uploadViaWorker(file);
    }
}
//# sourceMappingURL=r2upload+api.js.map
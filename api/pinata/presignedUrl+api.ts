// API for requesting a presigned url from pinata
import { PinataSDK } from 'pinata';

export async function GET() {
  const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: process.env.PINATA_GATEWAY_URL
  })

  const url = await pinata.upload.public.createSignedURL({
    expires: 60 // Last for 60 seconds
  })

  return Response.json({ url });
  }
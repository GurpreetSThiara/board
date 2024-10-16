

import { HfInference } from '@huggingface/inference'
import { NextResponse } from 'next/server'

const hf = new HfInference('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')

export async function POST(req: Request) {

  const formData = await req.formData()
  const image = formData.get('image') as File
  
  if (!image) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }
  console.log("callllllllllllllllllllll")

  try {
    const response = await hf.imageToImage({
      model: 'timbrooks/instruct-pix2pix',
      inputs: {
        image: await image.arrayBuffer(),
        prompt: 'Transform this sketch into a beautiful, detailed image',
      },
    })
    console.log("callllllllllllllllllllll")

    return NextResponse.json({ imageUrl: response })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}
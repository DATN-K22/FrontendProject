import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const targetUrl = request.headers.get('x-target-url')
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing x-target-url header' }, { status: 400 })
    }

    // Đọc buffer từ request
    const body = await request.arrayBuffer()

    // Chuyển tiếp request lên S3 từ môi trường Node.js (không bị dính CORS)
    const response = await fetch(targetUrl, {
      method: 'PUT',
      body: body
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: text || response.statusText }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Proxy S3 error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

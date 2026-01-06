import { getFileById } from '@/server/modules/file/service/file.admin.service'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const file = await getFileById(id)

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.filename}"`,
      },
    })
  } catch (e) {
    return new NextResponse('Unauthorized or not found', { status: 401 })
  }
}

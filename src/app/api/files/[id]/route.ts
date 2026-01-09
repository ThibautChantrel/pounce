import { getFileById } from '@/server/modules/file/services/file.admin.service'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const file = await getFileById(id)

    const encodedFilename = encodeURIComponent(file.filename)

    return new NextResponse(file.data, {
      headers: {
        'Content-Type': file.mimeType,
        // Utiliser la syntaxe "filename*=UTF-8''" pour supporter les accents
        'Content-Disposition': `inline; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (e) {
    return new NextResponse('Unauthorized or not found', { status: 401 })
  }
}

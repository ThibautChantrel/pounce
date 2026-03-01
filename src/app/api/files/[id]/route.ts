import { getFileById } from '@/server/modules/file/services/file.admin.service'
import { isFileRequestFromApp } from '@/utils/file-request'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isFileRequestFromApp(request)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { id } = await params

    const file = await getFileById(id)

    const encodedFilename = encodeURIComponent(file.filename)
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(file.data as any, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': file.size.toString(),
        'Content-Disposition': `inline; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (e) {
    console.error(e) // Toujours utile de loguer l'erreur serveur
    return new NextResponse('Unauthorized or not found', { status: 404 })
  }
}

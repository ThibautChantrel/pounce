import { getFileById } from '@/server/modules/file/services/file.admin.service'
import { NextResponse } from 'next/server'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Cette fonction retourne bien 'data' (le Buffer), c'est parfait pour ici.
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

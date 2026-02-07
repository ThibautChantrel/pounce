export type SortDirection = 'asc' | 'desc'

export type SortItem = Record<string, SortDirection>

export interface FetchParams {
  skip: number
  take: number
  search?: string
  orderBy?: SortItem[]
}

export function parseTableParams(
  searchParams: { [key: string]: string | string[] | undefined },
  defaultLimit = 10
): FetchParams {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || defaultLimit
  const search = (searchParams.search as string) || ''

  const skip = (page - 1) * limit

  let orderBy: SortItem[] | undefined
  const sortParam = searchParams.sort as string

  if (sortParam) {
    orderBy = sortParam.split(',').map((item) => {
      const [field, direction] = item.split(':')
      return { [field]: direction as 'asc' | 'desc' }
    })
  }

  return {
    skip,
    take: limit,
    search,
    orderBy,
  }
}

const AppError = require('./AppError')

const toPositiveInteger = (value, fieldName) => {
  const normalizedValue = Number(value)

  if (!Number.isInteger(normalizedValue) || normalizedValue <= 0) {
    throw new AppError(`${fieldName} 必须是大于 0 的整数`, 400)
  }

  return normalizedValue
}

const normalizePaginationParams = ({ page, pageSize }) => {
  const currentPage = toPositiveInteger(page, 'page')
  const currentPageSize = toPositiveInteger(pageSize, 'pageSize')

  return {
    page: currentPage,
    pageSize: currentPageSize,
    offset: (currentPage - 1) * currentPageSize
  }
}

module.exports = {
  normalizePaginationParams
}

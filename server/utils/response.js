// 成功响应
const success = (res, data = null, message = '操作成功') => {
  res.json({
    code: 200,
    message,
    data
  })
}

// 失败响应
const fail = (res, message = '操作失败', code = 400) => {
  res.status(code).json({
    code,
    message,
    data: null
  })
}

module.exports = {
  success,
  fail
}
interface Parameter {
  field?: string
  id?: string | number
  process?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Data {}

interface ResponseData {
  result?: {
    code: string
    params?: Parameter
  }
  success?: boolean
  data?: Data
}

function logInvalidValueError(res: ResponseData, field: string): ResponseData {
  res.result = {
    code: 'value/invalid',
    params: {
      field: field,
    },
  }

  res.success = false
  return res
}

function logMissingValueError(res: ResponseData, field: string): ResponseData {
  res.result = {
    code: 'value/invalid',
    params: {
      field: field,
    },
  }

  res.success = false
  return res
}

function logAuthorization(res: ResponseData): ResponseData {
  res.result = {
    code: 'auth/authorization',
  }

  res.success = false
  return res
}

function logAuthentication(res: ResponseData): ResponseData {
  res.result = {
    code: 'auth/authentication',
  }

  res.success = false
  return res
}

function logObjectDoesNotExist(
  res: ResponseData,
  id: string | number,
): ResponseData {
  res.result = {
    code: 'datamgmt/objectdoesnotexist',
    params: {
      id,
    },
  }

  res.success = false
  return res
}

function logProcessingError(res: ResponseData, process: string): ResponseData {
  res.result = {
    code: 'server/processing',
    params: {
      process,
    },
  }

  res.success = false
  return res
}

export {
  logInvalidValueError,
  logObjectDoesNotExist,
  logMissingValueError,
  logAuthentication,
  logAuthorization,
  logProcessingError,
}

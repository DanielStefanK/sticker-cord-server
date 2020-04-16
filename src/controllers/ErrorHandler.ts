function logInvalidValueError (res: any, field: string) {
  res.result = {
    code: "value/invalid",
    params: {
      field: field
    }
  }

  res.success = false
  return res
}

function logMissingValueError (res: any, field: string) {
  res.result = {
    code: "value/invalid",
    params: {
      field: field
    }
  }

  res.success = false
  return res
}


function logAuthorization (res: any) {
  res.result = {
    code: "auth/authorization",
  }

  res.success = false
  return res
}

function logAuthentication (res: any) {
  res.result = {
    code: "auth/authentication",
  }

  res.success = false
  return res
}

function logObjectDoesNotExist (res: any, id: string|number) {
  res.result = {
    code: "datamgmt/objectdoesnotexist",
    params: {
      id
    }
  }

  res.success = false
  return res
}

export {
  logInvalidValueError,
  logObjectDoesNotExist,
  logMissingValueError,
  logAuthentication,
  logAuthorization
}
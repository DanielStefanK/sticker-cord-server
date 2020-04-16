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
  logObjectDoesNotExist
}
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

function callsites() {
  const _prepareStackTrace = Error.prepareStackTrace
  try {
    let result: NodeJS.CallSite[] = []
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1)
      result = callSitesWithoutCurrent
      return callSitesWithoutCurrent
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    new Error().stack
    return result
  }
  finally {
    Error.prepareStackTrace = _prepareStackTrace
  }
}

function callerPath1() {
  const callSites = callsites()
  if (!callSites[0])
    return
  return callSites[0].getFileName()
}

function callerPath2() {
  const error = new Error()
  const stack = error.stack?.split('\n') as string[]

  const data = stack.find(
    line =>
      !line.trim().startsWith('Error')
      && !line.includes('(')
      && !line.includes(')'),
  )
  if (!data) {
    return
  }

  const filePathPattern = new RegExp(
    /\s*at (\/.*|[a-z]:\\(?:([^<>:"/\\|?*]*[^<>:"/\\|?*.]\\|..\\)*([^<>:"/\\|?*]*[^<>:"/\\|?*.]\\?|..\\))?):\d+:\d+/i,
  )
  const result = filePathPattern.exec(data)
  if (!result) {
    return
  }

  return result[1]
}

export function callerPath() {
  return callerPath1() ?? callerPath2()
}

export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  
  return function(this: any, ...args: any[]) {
    const context = this
    
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func.apply(context, args)
      timeout = null
    }, wait)
  }
}

export function throttle(func: Function, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  
  return function(this: any, ...args: any[]) {
    const context = this
    const now = Date.now()
    const remaining = wait - (now - previous)
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        func.apply(context, args)
      }, remaining)
    }
  }
}

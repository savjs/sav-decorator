const CONFIG_KEY = '_CONFIG'

/**
 * insert config data
 * @example
 * class Test {
 *   @conf('hello', 'world')
 *   say () {
 *   }
 * }
 */
export const conf = annotateMethod((target, it, args) => {
  it.push(args)
})

/**
 * get config reference data
 * @param  {Class} target dest class
 * @param  {Boolean} isTarget whether from target
 * @return {Object}        data
 */
export function refer (target, isTarget) {
  const proto = isTarget ? target : target.prototype
  return proto[CONFIG_KEY] || (proto[CONFIG_KEY] = {})
}

/**
 * conf with key
 * @param  {String} key config key name
 * @return {Function}     a fn wrappered conf
 */
export function quickConf (key) {
  return annotateMethod((target, it, args) => {
    args.unshift(key)
    it.push(args)
  })
}

/**
 * annotate method
 * @param  {Function} fn   callback
 * @example
 * let conf = annotateMethod((target, arry, args) => arry.push(args))
 * class Test {
 *   @conf('hello', 'world')
 *   say () {
 *   }
 * }
 */
export function annotateMethod (fn) {
  return (...args) => {
    let annotateion = (target, method, descriptor) => {
      let it = target[CONFIG_KEY] || (target[CONFIG_KEY] = {})
      fn(target, it[method] || (it[method] = []), args || [])
      return descriptor.value
    }
    return annotateion
  }
}

/**
 * props interface
 * @param  {Class} intf interface class
 */
export function props (props) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...props}
  }
}

/**
 * impl interface
 * @param  {Class} intf interface class
 */
export function impl (intf) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...refer(intf, true)}
    target.prototype[CONFIG_KEY] = refer(intf)
  }
}

/**
 * the generator
 * @param  {Object} opts the options merge into module
 * @return {Object}      generatored module
 * @example
 *
 * class SaleInterface {
 *   @conf('hello', 'world')
 *   say () {}
 * }
 *
 * @generator({auth: true})
 * @impl(SaleInterface)
 * class Sale {
 *   say () {}
 * }
 *
 * @example
 * {
 *   name: 'Sale',
 *   options: {auth: true},
 *   actions:{
 *     say: {
 *       name: 'say',
 *       action: Sale.prototype.say,
 *       options: [
 *         ['hello', 'world']
 *       ]
 *     }
 *   }
 * }
 */
export function generator (opts) {
  if (typeof opts === 'function') {
    return transform({})(opts)
  }
  return transform(opts || {})
}

export {generator as gen}

function transform (opts) {
  return (target) => {
    let configs = refer(target)
    let props = refer(target, true)
    props = Object.assign({}, props, opts)
    let moduleName = target.name
    let actions = {}
    let module = {
      moduleName,
      props,
      actions
    }
    for (let actionName in configs) {
      let middleware = {}
      let config = configs[actionName]
      for (let item of config) {
        let [name, ...args] = item
        if (name) {
          middleware[name] = args
        }
      }
      let action = { // action
        actionName,
        props: middleware,
        config
      }
      Object.defineProperty(action, 'method', {
        value: target.prototype[actionName]
      })
      actions[actionName] = action
    }
    return module
  }
}

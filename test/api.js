import test from 'ava'
import {isFunction} from 'sav-util'
import {expect} from 'chai'

import {conf, refer, quickConf, impl, annotateMethod, annotateClass, gen, generator} from '../src'

test('api', (ava) => {
  ava.true(isFunction(conf))
  ava.true(isFunction(refer))
  ava.true(isFunction(quickConf))
  ava.true(isFunction(impl))
  ava.true(isFunction(annotateMethod))
  ava.true(isFunction(annotateClass))
  ava.true(isFunction(gen))
  ava.true(isFunction(generator))
})

test('conf', (ava) => {
  class Test {
    @conf('hello', 'world')
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [[ 'hello', 'world' ]]})
})

test('quickConf', (ava) => {
  let prop = quickConf('prop')
  class Test {
    @prop('readonly')
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [[ 'prop', 'readonly' ]]})
})

test('multi conf', (ava) => {
  let prop = quickConf('prop')
  class Test {
    @prop()
    @prop
    say () {}
  }
  let props = refer(Test)
  expect(props).to.deep.equal({say: [['prop'], ['prop']]})
})

test('multi gen', (ava) => {
  let prop = quickConf('prop')
  @gen
  class Test {
    @prop()
    @prop
    say () {}
  }
  expect(Test.actions.say.options).to.deep.equal([['prop'], ['prop']])
})

test('interface+impl', (ava) => {
  class TestInterface {
    @conf('hello', 'world')
    test () {}
  }

  @impl(TestInterface)
  class Test {
    test () {}
  }
  expect(generator({auth: true})(Test)).to.deep.equal({
    name: 'Test',
    options: {auth: true},
    actions: {
      test: {
        name: 'test',
        action: Test.prototype.test,
        options: [
          ['hello', 'world']
        ]
      }
    }
  })

  @gen
  @impl(TestInterface)
  class Test2 {
    @conf
    fail () {}
  }

  expect(Test2).to.deep.equal({
    name: 'Test2',
    options: {},
    actions: {
      test: {
        name: 'test',
        action: undefined,
        options: [
          ['hello', 'world']
        ]
      }
    }
  })
})

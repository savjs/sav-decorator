# sav-decorator
Interface generator with ES7 decorator

#### Interface Useage

```js

class TestInterface {
  @conf('hello', 'world')
  test () {}
}

@gen({auth: true})
@impl(TestInterface)
  class Test {
  async test () {}
}

Test = {
  name: 'Test',
  props: {auth: true},
  actions: {
    test: {
      name: 'test',
      method: async test () {},
      middleware: [
        ['hello', 'world']
      ]
    }
  }
}

```

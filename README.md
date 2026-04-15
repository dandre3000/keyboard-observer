# keyboard-input

Query keyboard state.

## Installation

npm i @dandre3000/keyboard-input

## Usage

```js
import KeyboardInput from '@dandre3000/keyboard-input'

let k = new KeyboardInput(document.documentElement)

setInterval(() => {
    console.log(k.getButtons('KeyQ', 'KeyW')) // [ boolean, boolean ]
}, 1000 / 60)
```

## Exports

### Class KeyboardInput

#### constructor (eventTarget: EventTarget)

### Static methods

#### patchEventStopImmediatePropagation (): void

### Instance methods

<h4>
    getButtons (keyCode: string): boolean</br>
    getButtons (...keyCodes: string[]): boolean[]
</h4>

#### getButtonSet (): Set&lt;string&gt;

## License

[MIT](https://github.com/dandre3000/keyboard-input/blob/main/LICENSE)

# keyboard-input

Query keyboard state.

## Installation

npm i @dandre3000/keyboard-input

## Usage

```js
import KeyboardInput from '@dandre3000/keyboard-input'

let k = new KeyboardInput(document.documentElement)

setInterval(() => {
    console.log(k.areButtonsPressed('KeyQ', 'KeyW'))
}, 1000 / 60)
```

## Exports

### Class KeyboardInput

#### constructor (eventTarget: EventTarget)

### Instance methods

<h4>
    areButtonsPressed (keyCode: string): boolean</br>
    areButtonsPressed (...keyCodes: string[]): boolean[]
</h4>

#### getPressedButtonSet (): Set&lt;string&gt;

## License

[MIT](https://github.com/dandre3000/keyboard-observer/blob/main/LICENSE)

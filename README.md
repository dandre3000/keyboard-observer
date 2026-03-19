# async-keyboard-pointer

Query keyboard and pointer states. Use keyboard and pointer events asynchronously.

## Installation

npm i @dandre3000/async-keyboard-pointer

## Usage

```js
import {
    asyncKeydown,
    asyncPointerdown,
    getKeyboardButtons,
    getKeyboardState,
    getPointerStateMap,
    getPointerStates
} from '@dandre3000/async-keyboard-pointer'

await Promise.race([
    asyncPointerdown(0),
    asyncKeydown('Enter')
])

let intervalId

const callback = () => {
    const keyboardButtons = getKeyboardButtons('KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyP', 'KeyQ')
    // or
    const keyboardState = getKeyboardState()

    const pointerState = getPointerStates(0)
    // or for multitouch
    const pointerStateMap = getPointerStateMap()

    if (keyboardButtons[0]) console.log('KeyW')
    if (keyboardButtons[1]) console.log('KeyA')
    if (keyboardButtons[2]) console.log('KeyS')
    if (keyboardButtons[3]) console.log('KeyD')
    if (keyboardButtons[4]) console.log(pointerState)
    if (keyboardButtons[5]) {
        console.log('KeyQ')

        Promise.race([
            asyncPointerdown(0),
            asyncKeydown('Enter')
        ]).then(() => intervalId = requestAnimationFrame(callback))

        return cancelAnimationFrame(intervalId)
    }

    intervalId = requestAnimationFrame(callback)
}

intervalId = requestAnimationFrame(callback)
```

## Exports

<h4>
    interface PointerState {<br/>
        &emsp;button1: boolean<br/>
        &emsp;button2: boolean<br/>
        &emsp;button3: boolean<br/>
        &emsp;button4: boolean<br/>
        &emsp;button5: boolean<br/>
        &emsp;screenX: number<br/>
        &emsp;screenY: number<br/>
        &emsp;clientX: number<br/>
        &emsp;clientY: number<br/>
        &emsp;pageX: number<br/>
        &emsp;pageY: number<br/>
        &emsp;movementX: number<br/>
        &emsp;movementY: number<br/>
    }
</h4>

#### activate: () => void

Add keyboard and pointer event listeners to the root element and enable exported methods.

#### deactivate: () => void

Remove keyboard and pointer event listeners from the root element, disable exported methods and reject all promises returned by them.

<h4>
    getPointerStates: (...idArray: [number]) => PointerState<br/>
    getPointerStates: (...idArray: number[]) => PointerState[]
</h4>

#### getPointerStateMap: () => Map<number, PointerState>

<h4>
    getKeyboardButtons: (...codeArray: [string]) => boolean<br/>
    getKeyboardButtons: (...codeArray: string[]) => boolean[]
</h4>

#### getKeyboardState: () => Set&lt;string&gt;

#### asyncPointerenter: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncPointerdown: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncPointermove: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncPointerup: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncClick: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncPointerleave: (id: PointerEvent["pointerId"], signal?: AbortSignal) => Promise&lt;PointerState&gt;

#### asyncKeydown: (code: KeyboardEvent["code"], signal?: AbortSignal) => Promise&lt;boolean&gt;

#### asyncKeypress: (code: KeyboardEvent["code"], signal?: AbortSignal) => Promise&lt;boolean&gt;

#### asyncKeyup: (code: KeyboardEvent["code"], signal?: AbortSignal) => Promise&lt;boolean&gt;

## License

[MIT](https://github.com/dandre3000/async-keyboard-pointer/blob/main/LICENSE)

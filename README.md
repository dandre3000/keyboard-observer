# async-keyboard-pointer

Use keyboard and pointer events asynchronously.

## Installation

npm i @dandre3000/async-keyboard-pointer

## Usage

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

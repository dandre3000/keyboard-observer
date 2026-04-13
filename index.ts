type KeyCode = KeyboardEvent['code'] | KeyboardEvent['key']

interface KeyboardInputData {
    symbol: symbol
    eventTarget: EventTarget
    buttons: Set<KeyCode>
}

const KeyboardInputSymbol = Symbol()

export class KeyboardInput {
    #data: KeyboardInputData

    constructor (eventTarget: EventTarget) {
        this.#data = {
            symbol: KeyboardInputSymbol,
            eventTarget,
            buttons: new Set
        }
    }

    areButtonsPressed <T extends KeyCode[]>(...keyCodes: T): T['length'] extends 1 ? boolean : boolean[] {
        if (this.#data?.symbol !== KeyboardInputSymbol)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        if (keyCodes.length === 1) return this.#data.buttons.has(String(keyCodes[0])) as any

        const buttons: boolean[] = []

        for (let i = 0; i < keyCodes.length; i++) {
            buttons.push(this.#data.buttons.has(String(keyCodes[i])))
        }

        return buttons as any
    }

    getPressedButtonSet () {
        if (this.#data?.symbol !== KeyboardInputSymbol)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        return new Set(this.#data.buttons)
    }
}

export default KeyboardInput
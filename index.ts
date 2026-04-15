type KeyCode = KeyboardEvent['code'] | KeyboardEvent['key']

interface EventTargetData extends EventListenerObject {
    target: EventTarget
    buttons: Set<KeyCode>
}

const targetDataMap: WeakMap<Element, EventTargetData> = new WeakMap
const eventSet: WeakSet<Event> = new WeakSet

export class KeyboardInput {
    #data: EventTargetData

    static #listener (this: EventTargetData, event: KeyboardEvent) {
        eventSet.add(event) // skip if patched event.stopImmediatePropagation is called after this listener

        if (event.type === 'keyup') {
            this.buttons.delete(event.code)
            if (event.code !== event.key) this.buttons.delete(event.key)
        } else {
            this.buttons.add(event.code)
            if (event.code !== event.key) this.buttons.add(event.key)
        }
    }

    static patchEventStopImmediatePropagation () {
        const stopImmediatePropagation = Event.prototype.stopImmediatePropagation

        return function (this: Event) {
            stopImmediatePropagation.call(this)

            if (!eventSet.has(event) && event instanceof KeyboardEvent) PointerInput.#listener(this)
        }
    }

    constructor (target: EventTarget) {
        if (!(target instanceof EventTarget)) throw new TypeError

        let targetData = targetDataMap.get(target)

        if (!targetData) {
            targetDataMap.set(target, targetData = {
                target,
                buttons: new Set,
                handleEvent: KeyboardInput.#listener
            })

            target.addEventListener('keydown', this.#data, true)
            target.addEventListener('keypress', this.#data, true)
            target.addEventListener('keyup', this.#data, true)
        }

        this.#data = targetData
    }

    getButtons <T extends KeyCode[]>(...keyCodes: T): T['length'] extends 1 ? boolean : boolean[] {
        if (this.#data?.handleEvent !== KeyboardInput.#listener)
            throw TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        if (keyCodes.length === 1) return this.#data.buttons.has(String(keyCodes[0])) as any

        const buttons: boolean[] = []

        for (let i = 0; i < keyCodes.length; i++) {
            buttons.push(this.#data.buttons.has(String(keyCodes[i])))
        }

        return buttons as any
    }

    getButtonSet () {
        if (this.#data?.handleEvent !== KeyboardInput.#listener)
            throw new TypeError(`this (${Object.prototype.toString.call(this)}) is not a KeyboardInput instance`)

        return new Set(this.#data.buttons)
    }
}

export default KeyboardInput
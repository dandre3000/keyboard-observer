type InputEventId = PointerEvent['pointerId'] | KeyboardEvent['code']

export interface PointerState {
    button1: boolean,
    button2: boolean,
    button3: boolean,
    button4: boolean,
    button5: boolean,
    screenX: number
    screenY: number
    clientX: number
    clientY: number
    pageX: number
    pageY: number
    movementX: number
    movementY: number
}

type PromiseExecutor = ConstructorParameters<PromiseConstructor>[0]
type Resolve = Parameters<PromiseExecutor>[0]
type Reject = Parameters<PromiseExecutor>[1]

interface PromiseData extends EventListenerObject {
    id: InputEventId
    eventMap: Map<InputEventId, Set<PromiseData>>
    signal?: AbortSignal
    resolve: Resolve
    reject: Reject
}

const eventTypePromiseDataMapReference: { [key: string]: PromiseData['eventMap'] } = {
    pointerenter: new Map,
    pointerdown: new Map,
    pointermove: new Map,
    pointerup: new Map,
    pointerleave: new Map,
    click: new Map,
    keydown: new Map,
    keypress: new Map,
    keyup: new Map
}

const eventPromiseInit: Omit<Required<PromiseData>, 'resolve' | 'reject' | 'handleEvent' > & { idType: NumberConstructor | StringConstructor } = {
    id: undefined,
    idType: undefined,
    eventMap: undefined,
    signal: undefined
}

const abortListener: PromiseData['handleEvent'] = function (this: PromiseData) {
    this.reject(this.signal.reason)
    this.eventMap.delete(this.id)
}

const eventPromiseExecutor: PromiseExecutor = (resolve, reject) => {
    const { eventMap, signal, idType } = eventPromiseInit
    let id = idType(eventPromiseInit.id)

    if (signal !== undefined && !(signal instanceof AbortSignal))
        throw new TypeError(`signal (${Object.prototype.toString.call(signal)}) is not an AbortSignal instance.`)

    const promiseData = {
        id,
        eventMap,
        signal,
        resolve,
        reject,
        handleEvent: abortListener
    }

    signal?.addEventListener('abort', promiseData)

    let promiseDataSet = eventMap.get(id)
    if (promiseDataSet)
        promiseDataSet.add(promiseData)
    else
        eventMap.set(id, new Set([promiseData]))

    eventPromiseInit.id = undefined
    eventPromiseInit.eventMap = undefined
    eventPromiseInit.signal = undefined
}

const asyncEvent = <T>(eventName: string, idType: NumberConstructor | StringConstructor, id: InputEventId, signal?: AbortSignal) => {
    eventPromiseInit.id = id
    eventPromiseInit.idType = idType
    eventPromiseInit.eventMap = eventTypePromiseDataMapReference[eventName]
    eventPromiseInit.signal = signal
    const promise = new Promise(eventPromiseExecutor)

    return promise as Promise<T>
}

const root = document.documentElement
const pointerStateMap: Map<PointerEvent['pointerId'], PointerState> = new Map

const updatePointerState = (event: PointerEvent) => {
    const {
        target,
        type,
        pointerId,
        buttons,
        screenX,
        screenY,
        clientX,
        clientY,
        pageX,
        pageY,
        movementX,
        movementY
    } = event

    let pointerState: PointerState

    if (type === 'pointerenter') {
        pointerStateMap.set(pointerId, pointerState = {
            button1: (buttons & 1) === 1,
            button2: (buttons & 2) === 2,
            button3: (buttons & 4) === 4,
            button4: (buttons & 8) === 8,
            button5: (buttons & 16) === 16,
            screenX: screenX,
            screenY: screenY,
            clientX: clientX,
            clientY: clientY,
            pageX: pageX,
            pageY: pageY,
            movementX: movementX,
            movementY: movementY
        })
    } else {
        pointerState = pointerStateMap.get(pointerId)

        pointerState.button1 = (buttons & 1) === 1
        pointerState.button2 = (buttons & 2) === 2
        pointerState.button3 = (buttons & 4) === 4
        pointerState.button4 = (buttons & 8) === 8
        pointerState.button5 = (buttons & 16) === 16
        pointerState.screenX = screenX
        pointerState.screenY = screenY
        pointerState.clientX = clientX
        pointerState.clientY = clientY
        pointerState.pageX = pageX
        pointerState.pageY = pageY
        pointerState.movementX = movementX
        pointerState.movementY = movementY
    }

    if (type === 'pointerleave' && target === root) pointerStateMap.delete(pointerId)

    return pointerState
}

const keyboardMap: Map<KeyboardEvent['code'], true> = new Map

const updateKeyboardState = (event: KeyboardEvent) => {
    if (event.code === undefined) return

    let button = true

    if (event.type === 'keydown')
        keyboardMap.set(event.code, button)
    else if (event.type === 'keyup') {
        button = false

        keyboardMap.delete(event.code)
    }

    return button
}

const eventListener: EventListener = (event: PointerEvent | KeyboardEvent) => {
    let id: InputEventId
    let data: PointerState | boolean

    if (event instanceof PointerEvent) {
        id = event.pointerId
        data = updatePointerState(event)
    } else {
        id = event.code
        data = updateKeyboardState(event)
    }

    const promiseDataSet = eventTypePromiseDataMapReference[event.type].get(id)

    if (promiseDataSet) {
        if (typeof data === 'object') data = { ...data }

        for (const promiseData of promiseDataSet) {
            promiseData.resolve(data)
            promiseData.signal?.removeEventListener('abort', promiseData)
        }

        eventTypePromiseDataMapReference[event.type].delete(id)
    }
}

root.addEventListener('pointerenter', eventListener, true)
root.addEventListener('pointerdown', eventListener, true)
root.addEventListener('pointermove', eventListener, true)
root.addEventListener('pointerup', eventListener, true)
root.addEventListener('click', eventListener, true)
root.addEventListener('pointerleave', eventListener, true)
root.addEventListener('keydown', eventListener, true)
root.addEventListener('keypress', eventListener, true)
root.addEventListener('keyup', eventListener, true)

export const getPointerState = (id: PointerEvent['pointerId']) => pointerStateMap.get(id) || null

export const getKeyboardButton = (code: KeyboardEvent['code']) => keyboardMap.get(code) || false

export const asyncPointerenter = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('pointerenter', Number, id, signal)

export const asyncPointerdown = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('pointerdown', Number, id, signal)

export const asyncPointermove = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('pointermove', Number, id, signal)

export const asyncPointerup = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('pointerup', Number, id, signal)

export const asyncClick = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('click', Number, id, signal)

export const asyncPointerleave = (id: PointerEvent['pointerId'], signal?: AbortSignal) =>
    asyncEvent<PointerState>('pointerleave', Number, id, signal)

export const asyncKeydown = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keydown', String, code, signal)

export const asyncKeypress = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keypress', String, code, signal)

export const asyncKeyup = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keyup', String, code, signal)
type InputEventId = PointerEvent['pointerId'] | KeyboardEvent['code']

export interface PointerState {
    button1: boolean
    button2: boolean
    button3: boolean
    button4: boolean
    button5: boolean
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
    pointerenter: undefined,
    pointerdown: undefined,
    pointermove: undefined,
    pointerup: undefined,
    pointerleave: undefined,
    click: undefined,
    keydown: undefined,
    keypress: undefined,
    keyup: undefined
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
    if (!active) throw new Error('Not active')

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
const keyboardSet: Set<KeyboardEvent['code']> = new Set
const pointerStateMap: Map<PointerEvent['pointerId'], PointerState> = new Map

const updateKeyboardState = (event: KeyboardEvent) => {
    if (event.code === undefined) return

    let button = true

    if (event.type === 'keydown')
        keyboardSet.add(event.code)
    else if (event.type === 'keyup') {
        button = false

        keyboardSet.delete(event.code)
    }

    return button
}

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

let active = false

/**
 * Add keyboard and pointer event listeners to the root element and enable exported methods.
 */
export const activate = () => {
    if (active) return

    const eventNames = [
        'keydown',
        'keypress',
        'keyup',
        'pointerenter',
        'pointerdown',
        'pointermove',
        'pointerup',
        'click',
        'pointerleave'
    ]

    active = true

    for (let i = 0; i < eventNames.length; i++) {
        root.addEventListener(eventNames[i], eventListener, true)

        eventTypePromiseDataMapReference[eventNames[i]] = new Map
    }
}

/**
 * Remove keyboard and pointer event listeners from the root element, disable exported methods and
 * reject all promises returned by them.
 */
export const deactivate = () => {
    if (!active) return

    const eventNames = [
        'keydown',
        'keypress',
        'keyup',
        'pointerenter',
        'pointerdown',
        'pointermove',
        'pointerup',
        'click',
        'pointerleave'
    ]

    active = false
    keyboardSet.clear()
    pointerStateMap.clear()

    for (let i = 0; i < eventNames.length; i++) {
        root.removeEventListener(eventNames[i], eventListener, true)

        for (const [id, set] of eventTypePromiseDataMapReference[eventNames[i]]) {
            for (const promiseData of set) {
                promiseData.reject(new Error('Deactivate'))
            }
        }

        eventTypePromiseDataMapReference[eventNames[i]] = undefined
    }
}

export const getKeyboardButtons = <T extends KeyboardEvent['code'][]>(...codeArray: T): T['length'] extends 1 ? boolean : boolean[] => {
    if (!active) throw new Error('Not active')

    if (codeArray.length === 1) {
        return keyboardSet.has(codeArray[0]) as any
    } else {
        const buttons: boolean[] = []

        for (let i = 0; i < codeArray.length; i++) {
            buttons.push(keyboardSet.has(codeArray[i]))
        }

        return buttons as any
    }
}

export const getKeyboardState = () => new Set(keyboardSet)

export const getPointerStates = <T extends PointerEvent['pointerId'][]>(...idArray: T): T['length'] extends 1 ? PointerState : PointerState[] => {
    if (!active) throw new Error('Not active')

    if (idArray.length === 1) {
        const pointerState = pointerStateMap.get(idArray[0])

        return pointerState ? { ...pointerState } as any : null
    } else {
        const states: PointerState[] = []

        for (let i = 0; i < idArray.length; i++) {
            const pointerState = pointerStateMap.get(idArray[i])

            states.push(pointerState? { ...pointerState } : null)
        }

        return states as any
    }
}

export const getPointerStateMap = () => {
    const copyMap: typeof pointerStateMap = new Map

    for (const [id, state] of pointerStateMap) {
        copyMap.set(id, { ...state })
    }

    return copyMap
}

export const asyncKeydown = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keydown', String, code, signal)

export const asyncKeypress = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keypress', String, code, signal)

export const asyncKeyup = (code: KeyboardEvent['code'], signal?: AbortSignal) =>
    asyncEvent<boolean>('keyup', String, code, signal)

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
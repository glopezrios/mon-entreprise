import { DottedName } from 'modele-social'
import Engine, {
	PublicodesExpression,
	Rule,
	RuleNode,
	formatValue,
	isPublicodesError,
} from 'publicodes'

import { Situation } from '@/store/reducers/rootReducer'

export function capitalise0(name: undefined): undefined
export function capitalise0(name: string): string
export function capitalise0(name?: string) {
	return name && name[0].toUpperCase() + name.slice(1)
}

export const debounce = <T>(waitFor: number, fn: (...args: T[]) => void) => {
	let timeoutId: ReturnType<typeof setTimeout>

	return (...args: T[]) => {
		clearTimeout(timeoutId)
		timeoutId = setTimeout(() => fn(...args), waitFor)
	}
}

export const fetcher = (url: RequestInfo) => fetch(url).then((r) => r.json())

export function inIframe(): boolean {
	try {
		return window.self !== window.top
	} catch (e) {
		return true
	}
}

export function softCatch<ArgType, ReturnType>(
	fn: (arg: ArgType) => ReturnType
): (arg: ArgType) => ReturnType | null {
	return function (...args) {
		try {
			return fn(...args)
		} catch (e) {
			// eslint-disable-next-line no-console
			console.warn(e)

			return null
		}
	}
}

export function getSessionStorage() {
	// In some browsers like Brave, even just reading the variable sessionStorage
	// is throwing an error in the iframe, so we can't do things if sessionStorage !== undefined
	// and we need to wrap it in a try { } catch { } logic
	try {
		return window.sessionStorage
	} catch (e) {
		return undefined
	}
}

export const currencyFormat = (language: string) => ({
	isCurrencyPrefixed: !!formatValue(12, { language, displayedUnit: '€' }).match(
		/^€/
	),
	thousandSeparator: formatValue(1000, { language }).charAt(1),
	decimalSeparator: formatValue(0.1, { language }).charAt(1),
})

export function hash(str: string): number {
	let hash = 0
	let chr
	for (let i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}

	return hash
}

export function omit<T, K extends keyof T>(obj: T, key: K): Omit<T, K> {
	const { [key]: _ignore, ...returnObject } = obj

	return returnObject
}

/**
 * Transforms an object into entries which is then passed to the transform function to be
 * modified as desired with map, filter, etc., then transformed back into an object
 */
export const objectTransform = <T, U>(
	object: Record<string, T>,
	transform: (entries: [string, T][]) => [string, U][]
) => Object.fromEntries(transform(Object.entries(object)))

// TODO: This is will be included in the ES spec soon. Remove our custom
// implementation and rely on browser native support and polyfill when it is
// available.
// https://caniuse.com/?search=groupby
export function groupBy<E, G extends string>(
	arr: Array<E>,
	callback: (elm: E, index: number, array: Array<E>) => G
): Record<G, Array<E>> {
	return arr.reduce((result, item, currentIndex) => {
		const key = callback(item, currentIndex, arr)
		result[key] = result[key] || []
		result[key].push(item)

		return result
	}, {} as Record<G, Array<E>>)
}

export function isIterable<T>(obj: unknown): obj is Iterable<T> {
	return Symbol.iterator in Object(obj)
}

/**
 * Check if a key exists in the object and return its value or undefined,
 * usefull for type check
 * @param obj any object
 * @param key key to get value from object
 * @returns value or undefined
 */
export const getValueFrom = <
	T extends Record<string | number | symbol, unknown>,
	K extends string | number | symbol
>(
	obj: T,
	key: K
): Extract<T, { [k in K]?: unknown }>[K] | undefined =>
	key in obj ? obj[key] : undefined

const isMeta = <T>(rule: Rule): rule is Rule & { meta?: T } => 'meta' in rule

/**
 * Return typed meta property from a rule
 * @param rule
 * @param defaultValue
 * @returns
 */
export const getMeta = <T>(rule: Rule, defaultValue: T) =>
	(isMeta<T>(rule) ? getValueFrom(rule, 'meta') : null) ?? defaultValue

/**
 * Wraps each event function specified in eventsToWrap (default onPress) with an
 * asynchronous function that waits x ms before executing the original function
 * Use this function on button props to avoid ghost click after onPress event
 * See this issue https://github.com/betagouv/mon-entreprise/issues/1872
 * Maybe the next version of the react-spectrum will handle that natively (issue https://github.com/adobe/react-spectrum/issues/1513)
 * @param props
 * @param options ms (time of debounce) and eventsToWrap (array of events to wrap with debounce)
 * @returns props
 */
export const wrapperDebounceEvents = <T>(
	props: T,
	{ ms = 25, eventsToWrap = ['onPress'] } = {}
): T => {
	if (props && typeof props === 'object') {
		const castedProps = props as Record<string, unknown>

		eventsToWrap.forEach((event: string) => {
			if (event in castedProps) {
				const original = castedProps[event]

				if (typeof original === 'function') {
					const debouncedFunction = async (...params: unknown[]) => {
						await new Promise((resolve) =>
							setTimeout(() => resolve(original(...params)), ms)
						)
					}

					castedProps[event] = debouncedFunction
				}
			}
		})
	}

	return props
}

export async function getIframeOffset(): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const returnOffset = (evt: MessageEvent) => {
			if (evt.data.kind !== 'offset') {
				return
			}
			window.removeEventListener('message', returnOffset)
			resolve(evt.data.value)
		}
		if (!window.parent.postMessage) {
			reject(new Error('No parent window'))
		}
		window.parent?.postMessage({ kind: 'get-offset' }, '*')
		window.addEventListener('message', returnOffset)
	})
}

export function evaluateQuestion(
	engine: Engine,
	rule: RuleNode
): string | undefined {
	const question = rule.rawNode.question as Exclude<
		number,
		PublicodesExpression
	>
	if (question && typeof question === 'object') {
		return engine.evaluate(question as PublicodesExpression).nodeValue as string
	}

	return question
}

export function buildSituationFromObject<Names extends string = DottedName>(
	contextDottedName: Names,
	situationObject: Record<string, PublicodesExpression>
): Situation {
	return Object.fromEntries(
		Object.entries(situationObject).map(
			([key, value]: [string, PublicodesExpression]) => [
				`${contextDottedName} . ${key}` as Names,
				typeof value === 'string' ? `'${value}'` : value,
			]
		)
	)
}

export const catchDivideByZeroError = <T>(func: () => T) => {
	try {
		return func()
	} catch (err) {
		if (
			isPublicodesError(err, 'EvaluationError') &&
			err.message === 'Division by zero'
		) {
			// eslint-disable-next-line no-console
			console.error(err)
		}
		throw err
	}
}

export const generateUuid = () => {
	return Math.floor(Math.random() * Date.now()).toString(16)
}
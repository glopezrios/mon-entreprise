import rawRules, { DottedName } from 'modele-social'
import Engine from 'publicodes'

import type { ProviderProps } from '@/components/Provider'
import i18n from '@/locales/i18n'
import ruleTranslations from '@/locales/rules-en.yaml'
import translateRules from '@/locales/translateRules'

import { createWorkerEngine, WorkerEngineActions } from './workerEngine'

function getUnitKey(unit: string): string {
	const units = i18n.getResourceBundle('fr', 'units') as Record<string, string>
	const key = Object.entries(units)
		.find(([, trans]) => trans === unit)?.[0]
		.replace(/_plural$/, '')

	return key || unit
}

let warnCount = 0
let timeout: NodeJS.Timeout | null = null
const logger = {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	warn: (message: string) => {
		// console.warn(message)

		warnCount++
		timeout !== null && clearTimeout(timeout)
		timeout = setTimeout(() => {
			// eslint-disable-next-line no-console
			console.warn('⚠️', warnCount, 'warnings in the engine')
			warnCount = 0
		}, 1000)
	},
	error: (message: string) => {
		// eslint-disable-next-line no-console
		console.error(message)
	},
	log: (message: string) => {
		// eslint-disable-next-line no-console
		console.log(message)
	},
}

const init = ({ basename }: Pick<ProviderProps, 'basename'>) => {
	let rules = rawRules
	if (basename === 'infrance') {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		rules = translateRules('en', ruleTranslations, rules)
	}

	const engine = new Engine(rules, { getUnitKey, logger })

	return engine
}

export type Actions = WorkerEngineActions<Parameters<typeof init>, DottedName>

console.time('[createWorkerEngine]')
createWorkerEngine(init)
console.timeEnd('[createWorkerEngine]')

import { ErrorBoundary } from '@sentry/react'
import { FallbackRender } from '@sentry/react/types/errorboundary'
import { ComponentProps, StrictMode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes } from 'react-router-dom'
import { css, styled } from 'styled-components'

import Footer from '@/components/layout/Footer/Footer'
import Header from '@/components/layout/Header'
import { Container } from '@/design-system/layout'
import { useAxeCoreAnalysis } from '@/hooks/useAxeCoreAnalysis'
import { useGetFullURL } from '@/hooks/useGetFullURL'
import { useIsEmbedded } from '@/hooks/useIsEmbedded'
import { useLazyPromise } from '@/hooks/usePromise'
import { useSaveAndRestoreScrollPosition } from '@/hooks/useSaveAndRestoreScrollPosition'
import Landing from '@/pages/_landing/Landing'
import Page404 from '@/pages/404'
import Accessibilité from '@/pages/Accessibilité'
import Budget from '@/pages/budget/index'
import IntegrationTest from '@/pages/dev/IntegrationTest'
import Integration from '@/pages/integration/index'
import Nouveautés from '@/pages/nouveautés/index'
import Offline from '@/pages/Offline'
import Plan from '@/pages/Plan'
import Simulateurs from '@/pages/simulateurs'
import SimulateursEtAssistants from '@/pages/simulateurs-et-assistants'
import Stats from '@/pages/statistiques/LazyStats'
import { useSitePaths } from '@/sitePaths'
import {
	useAsyncGetRule,
	useAsyncParsedRules,
	useLazyPromiseOnSituationChange,
	usePromiseOnSituationChange,
	useShallowCopy,
	useWorkerEngine,
} from '@/worker/socialWorkerEngineClient'

import Provider, { ProviderProps } from './Provider'
import Redirections from './Redirections'

type RootProps = {
	basename: ProviderProps['basename']
	// rulesPreTransform?: (rules: Rules) => Rules
}

const TestWorkerEngine = () => {
	const [refresh, setRefresh] = useState(0)
	const workerEngine = useWorkerEngine()
	// const workerEngineCtx = useWorkerEngineContext()

	const [, trigger] = useLazyPromise(
		async () =>
			workerEngine?.asyncSetSituationWithEngineId({
				SMIC: '1000€/mois',
			}),
		[workerEngine],
		{ defaultValue: 'loading...' }
	)

	const date = useAsyncGetRule('date', { defaultValue: 'loading...' })

	const parsedRules = useAsyncParsedRules()

	const resultSmic = usePromiseOnSituationChange(
		() => workerEngine.asyncEvaluateWithEngineId('SMIC'),
		[workerEngine],
		{ defaultValue: 'loading...' }
	)

	const [resultLazySmic, triggerLazySmic] = useLazyPromiseOnSituationChange(
		() => workerEngine.asyncEvaluateWithEngineId('SMIC'),
		[workerEngine],
		{ defaultValue: 'wait 2sec...' }
	)

	useEffect(() => {
		console.log('??? useEffect')

		void (async () => {
			await workerEngine.isWorkerReady
			setTimeout(() => {
				void triggerLazySmic()
			}, 3000)
		})()
	}, [triggerLazySmic, workerEngine.isWorkerReady])

	const workerEngineCopy = useShallowCopy(workerEngine)
	// // const workerEngineCopy = workerEngine
	console.log('=========>', workerEngine, workerEngineCopy)

	const [, triggerCopy] = useLazyPromise(async () => {
		// console.log('+++++++++>', workerEngineCopy)

		await workerEngineCopy?.asyncSetSituationWithEngineId({
			SMIC: '2000€/mois',
		})
	}, [workerEngineCopy])

	const dateCopy = useAsyncGetRule('date', {
		defaultValue: 'loading...',
		// workerEngine: workerEngineCopy,
	})

	const parsedRulesCopy = useAsyncParsedRules({
		workerEngine: workerEngineCopy,
	})

	const resultSmicCopy = usePromiseOnSituationChange(
		async () => workerEngineCopy?.asyncEvaluateWithEngineId('SMIC'),
		[workerEngineCopy],
		{
			defaultValue: 'loading...',
			workerEngine: workerEngineCopy,
		}
	)

	const [resultLazySmicCopy, triggerLazySmicCopy] =
		useLazyPromiseOnSituationChange(
			async () => workerEngineCopy?.asyncEvaluateWithEngineId('SMIC'),
			[workerEngineCopy],
			{
				defaultValue: 'wait 2sec...',
				workerEngine: workerEngineCopy,
			}
		)

	useEffect(() => {
		// console.log('useEffect')

		void (async () => {
			await workerEngine.isWorkerReady
			setTimeout(() => {
				void triggerLazySmicCopy()
			}, 3000)
		})()
	}, [triggerLazySmicCopy, workerEngine.isWorkerReady])

	const { asyncSetSituationWithEngineId } = workerEngineCopy ?? {}
	usePromiseOnSituationChange(async () => {
		// console.log('**************>', workerEngineCopy, resultSmic)

		if (
			typeof resultSmic !== 'string' &&
			typeof resultSmic.nodeValue === 'number'
		) {
			// console.log('ooooooooooooooooooo', resultSmic)

			await asyncSetSituationWithEngineId?.({
				SMIC: resultSmic.nodeValue + '€/mois',
			})
		}
	}, [asyncSetSituationWithEngineId, resultSmic])

	return (
		<div>
			<h1>Test worker engine</h1>
			<button onClick={() => setRefresh((r) => r + 1)}>
				Refresh {refresh}
			</button>
			<button onClick={() => void trigger()}>trigger</button>
			<button onClick={() => void triggerCopy()}>trigger copy</button>

			<p>
				date title:{' '}
				{JSON.stringify(typeof date === 'string' ? date : date?.title)}
			</p>
			<p>
				parsedRules length:{' '}
				{JSON.stringify(Object.entries(parsedRules ?? {}).length)}
			</p>
			<p>
				resultSmic:{' '}
				{JSON.stringify(
					typeof resultSmic === 'string' ? resultSmic : resultSmic?.nodeValue
				)}
			</p>
			<p>
				resultLazySmic:{' '}
				{JSON.stringify(
					typeof resultLazySmic === 'string'
						? resultLazySmic
						: resultLazySmic?.nodeValue
				)}
			</p>

			<p>workerEngineCopy: {JSON.stringify(workerEngineCopy?.engineId)}</p>

			<p>
				dateCopy title:{' '}
				{JSON.stringify(
					typeof dateCopy === 'string' ? dateCopy : dateCopy?.title
				)}
			</p>
			<p>
				parsedRulesCopy length:{' '}
				{JSON.stringify(Object.entries(parsedRulesCopy ?? {}).length)}
			</p>
			<p>
				resultSmicCopy:{' '}
				{JSON.stringify(
					typeof resultSmicCopy === 'string'
						? resultSmicCopy
						: resultSmicCopy?.nodeValue
				)}
			</p>
			<p>
				resultLazySmicCopy:{' '}
				{JSON.stringify(
					typeof resultLazySmicCopy === 'string'
						? resultLazySmicCopy
						: resultLazySmicCopy?.nodeValue
				)}
			</p>
		</div>
	)
}

export default function Root({
	basename,
}: // rulesPreTransform = (r) => r,
RootProps) {
	// const situationVersion = useCreateWorkerEngine(basename)
	// const engine = useMemo(
	// 	() => engineFactory(rulesPreTransform(rules)),

	// 	// We need to keep [rules] in the dependency list for hot reload of the rules
	// 	// in dev mode, even if ESLint think it is unnecessary since `rules` isn't
	// 	// defined in the component scope.
	// 	//
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[rules]
	// )

	return (
		<StrictMode>
			{/* <EngineProvider value={engine}> */}
			<Provider basename={basename}>
				<Redirections>
					<Router />
				</Redirections>
			</Provider>
			{/* </EngineProvider> */}
		</StrictMode>
	)
}
const Router = () => {
	/*
	const exampleSyncValue = usePromiseOnSituationChange(
		() => asyncEvaluate('SMIC'),
		[]
	)?.nodeValue

	const exampleSyncValueWithDefault = usePromiseOnSituationChange(
		async () => (await asyncEvaluate('SMIC')).nodeValue,
		[],
		'loading...'
	)

	const [exampleAsyncValue, fireEvaluate] = useLazyPromise(
		async (param: PublicodesExpression) =>
			(await asyncEvaluate(param)).nodeValue,
		[],
		42
	)

	usePromise(async () => {
		let count = 0
		const interval = setInterval(() => {
			void fireEvaluate(count++ % 2 === 0 ? 'date' : 'SMIC')
			if (count === 7) clearInterval(interval)
		}, 1000)

		await new Promise((resolve) => setTimeout(resolve, 3000))
		await asyncSetSituation({ date: '01/01/2022' })
		await new Promise((resolve) => setTimeout(resolve, 3000))
		await asyncSetSituation({ date: '01/01/2021' })
		await new Promise((resolve) => setTimeout(resolve, 3000))
	}, [fireEvaluate])

	*/

	return (
		<>
			{/* exemple sans valeur par defaut : {JSON.stringify(exampleSyncValue)}
			<br />
			exemple avec valeur par defaut :{' '}
			{JSON.stringify(exampleSyncValueWithDefault)} <br />
			exemple d'execution manuel : {JSON.stringify(exampleAsyncValue)} */}
			{/*  */}
			<Routes>
				<Route path="test-worker" element={<TestWorkerEngine />} />

				{/* <Route path="/iframes/*" element={<Iframes />} /> */}
				<Route path="*" element={<App />} />
			</Routes>
		</>
	)
}

const CatchOffline = ({ error }: ComponentProps<FallbackRender>) => {
	if (error.message.includes('dynamically imported module')) {
		return <Offline />
	} else {
		throw error
	}
}

const App = () => {
	const { relativeSitePaths } = useSitePaths()
	const { t } = useTranslation()
	const fullURL = useGetFullURL()
	useSaveAndRestoreScrollPosition()
	const isEmbedded = useIsEmbedded()
	if (!import.meta.env.PROD && import.meta.env.VITE_AXE_CORE_ENABLED) {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		useAxeCoreAnalysis()
	}
	const documentationPath = useSitePaths().absoluteSitePaths.documentation.index

	return (
		<StyledLayout $isEmbedded={isEmbedded}>
			{!isEmbedded && <Header />}

			<main
				role="main"
				id="main"
				style={{
					flex: '1',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<a
					href={`${fullURL}#footer`}
					aria-label={t(
						'Passer le contenu principal et aller directement au pied de page'
					)}
					className="skip-link print-hidden"
				>
					{t('Aller directement au pied de page')}
				</a>
				<Container>
					<ErrorBoundary fallback={CatchOffline}>
						<Routes>
							<Route index element={<Landing />} />

							{/* <Route
								path={relativeSitePaths.assistants.index + '/*'}
								element={<Assistants />}
							/> */}
							<Route
								path={relativeSitePaths.simulateurs.index + '/*'}
								element={<Simulateurs />}
							/>
							<Route
								path={relativeSitePaths.simulateursEtAssistants + '/*'}
								element={<SimulateursEtAssistants />}
							/>
							{/* <Route
									path={relativeSitePaths.documentation.index + '/*'}
									element={
										<Documentation
											documentationPath={documentationPath}
											engine={engine}
										/>
									}
								/> */}
							<Route
								path={relativeSitePaths.développeur.index + '/*'}
								element={<Integration />}
							/>
							<Route
								path={relativeSitePaths.nouveautés.index + '/*'}
								element={<Nouveautés />}
							/>
							<Route path={relativeSitePaths.stats} element={<Stats />} />
							<Route path={relativeSitePaths.budget} element={<Budget />} />
							<Route
								path={relativeSitePaths.accessibilité}
								element={<Accessibilité />}
							/>
							<Route
								path="/dev/integration-test"
								element={<IntegrationTest />}
							/>
							<Route path={relativeSitePaths.plan} element={<Plan />} />

							<Route path="*" element={<Page404 />} />
						</Routes>
					</ErrorBoundary>
				</Container>
			</main>
			{!isEmbedded && <Footer />}
		</StyledLayout>
	)
}

const StyledLayout = styled.div<{
	$isEmbedded: boolean
}>`
	${({ $isEmbedded }) =>
		!$isEmbedded &&
		css`
			flex-direction: column;
			display: flex;
			height: 100%;
		`}

	min-height: 100vh;
`

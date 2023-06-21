import { useMemo } from 'react'

import { EngineDocumentationRoutes } from '@/components/EngineDocumentationRoutes'
import { Statut } from '@/components/StatutTag'
import { useEngine, useRawSituation } from '@/components/utils/EngineContext'
import { EngineComparison } from '@/pages/simulateurs/comparaison-statuts/components/Comparateur'
import Détails from '@/pages/simulateurs/comparaison-statuts/components/Détails'
import Résultats from '@/pages/simulateurs/comparaison-statuts/components/Résultats'
import { useCasParticuliers } from '@/pages/simulateurs/comparaison-statuts/contexts/CasParticuliers'
import { useSitePaths } from '@/sitePaths'
import { Situation } from '@/store/reducers/rootReducer'

export default function Comparateur() {
	const namedEngines = useStatutComparaison()
	const { absoluteSitePaths } = useSitePaths()

	return (
		<>
			<Résultats namedEngines={namedEngines} />
			<Détails namedEngines={namedEngines} />
			<EngineDocumentationRoutes
				namedEngines={namedEngines}
				basePath={absoluteSitePaths.assistants['choix-du-statut'].comparateur}
			/>
		</>
	)
}

/**
 * Returns the situation for computing the results with the given statut
 * @param statut
 */
function useStatutComparaison(): EngineComparison {
	const { isAutoEntrepreneurACREEnabled } = useCasParticuliers()
	const possibleStatuts = usePossibleStatuts()
	console.log(possibleStatuts)
	const situation = useRawSituation()
	const engine = useEngine()

	return useMemo(
		() =>
			possibleStatuts.map((statut) => ({
				name: statut,
				engine: engine.shallowCopy().setSituation({
					...situation,
					...getSituationFromStatut(statut, isAutoEntrepreneurACREEnabled),
				}),
			})) as EngineComparison,
		[possibleStatuts, isAutoEntrepreneurACREEnabled]
	)
}

function usePossibleStatuts(): Array<Statut> {
	const engine = useEngine()
	// We could do this logic by filtering the applicable status in publicodes,
	// but for now, there is only two options, so we hardcode it
	if (
		engine.evaluate('entreprise . catégorie juridique . EI = non').nodeValue ===
		true
	) {
		return ['SASU', 'SARL']
	} else {
		return ['SASU', 'EI', 'AE']
	}
}

function getSituationFromStatut(statut: Statut, AEAcre: boolean): Situation {
	return {
		'entreprise . catégorie juridique . remplacements': 'oui',
		'entreprise . catégorie juridique':
			statut === 'SASU'
				? "'SAS'"
				: statut === 'EURL'
				? "'EURL'"
				: statut === 'AE'
				? "'EI'"
				: statut === 'SELARLU'
				? "'SELARL'"
				: statut === 'SELASU'
				? "'SELAS'"
				: `'${statut}'`,
		'entreprise . catégorie juridique . EI . auto-entrepreneur':
			statut === 'AE' ? 'oui' : 'non',
		'entreprise . imposition': "'IS'",
		'entreprise . associés': ['SARL', 'SAS', 'SELAS', 'SELARL'].includes(statut)
			? "'multiple'"
			: "'unique'",
		...(AEAcre ? { 'dirigeant . exonérations . ACRE': 'oui' } : {}),
	}
}
import { Trans } from 'react-i18next'
import styled from 'styled-components'

import HelpButtonWithPopover from '@/design-system/buttons/HelpButtonWithPopover'
import { Li, Ul } from '@/design-system/typography/list'
import { Body, baseParagraphStyle } from '@/design-system/typography/paragraphs'

export const StyledTable = styled.table`
	${baseParagraphStyle}
	font-size: 0.85em;
	text-align: center;
	border-collapse: collapse;
	display: block;
	overflow-y: auto;

	tr:nth-child(2n + 3) {
		background: var(--lightestColor);
	}

	td,
	th {
		padding: 0.5rem;
		border: 1px solid ${({ theme }) => theme.colors.extended.grey[500]};
	}
	th {
		font-weight: initial;
	}
`

const exonerationsHeader = 'exonerationsHeader'
const resultatFiscalHeader = 'resultatFiscalHeader'
const zonesHeader = 'zonesHeader'
const madelinHeader = 'madelinHeader'
const plusValueHeader = 'plusValueHeader'
const suramortissementHeader = 'suramortissementHeader'

export function ExplicationsResultatFiscal() {
	return (
		<HelpButtonWithPopover
			title="Quelles exonérations inclure ?"
			type="aide"
			bigPopover
		>
			<Body>
				Pour calculer le montant du résultat fiscal avant déduction des
				exonérations et des charges sociales à indiquer dans ce simulateur, vous
				pouvez utiliser votre liasse fiscale, en reprenant les montants indiqués
				dans les lignes fiscales du tableau ci-dessous, en fonction de votre
				situation (imposition au réel normal ou au réel simplifié).
			</Body>
			<Body>L’opération à effectuer est la suivante :</Body>
			<Ul>
				<Li>
					Déterminez le résultat fiscal dans votre liasse, sans déduire le
					montant de vos cotisations et contributions sociales aux régimes
					obligatoires de sécurité sociale. Prenez le résultat fiscal
					correspondant <strong>(1)</strong>
				</Li>
				<Li>
					Ajoutez les exonérations <strong>(2)</strong>
				</Li>
			</Ul>

			<StyledTable role="table">
				<caption className="sr-only">
					<Trans i18nKey="explications.tableCaption">
						Tableau affichant les lignes de votre liasse fiscale associées aux
						exonérations fiscales en place pour chaque type d'activité. La
						première colonne affiche les différents types d'activité (BIC, BNC).
						La deuxième colonne indique les lignes de votre liasse fiscale qui
						vous permettent de déterminer votre résultat fiscal, et ce pour
						chaque type d'activité. Les autres colonnes affichent les
						exonérations en place ainsi que les lignes de liasse fiscale ou
						ajouter vos exonérations et ce pour chaque type d'activité.
					</Trans>
				</caption>
				<thead>
					<tr>
						<th id="explicationEmptyTh1"></th>
						<th id="explicationEmptyTh2"></th>
						<th colSpan={4} id={exonerationsHeader} role="columnheader">
							Exonérations <strong>(2)</strong>
						</th>
					</tr>
					<tr>
						<th id="explicationEmptyTh3"></th>
						<th id={resultatFiscalHeader}>
							Résultat fiscal <strong>(1)</strong>
						</th>
						<th id={zonesHeader} headers={exonerationsHeader}>
							Exonérations liées aux zones / activités
						</th>
						<th id={madelinHeader} headers={exonerationsHeader}>
							Exonérations Madelin et plan d’épargne retraite
						</th>
						<th id={plusValueHeader} headers={exonerationsHeader}>
							Exonérations de plus-values à court terme
						</th>
						<th id={suramortissementHeader} headers={exonerationsHeader}>
							Suramortissement productif
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th role="rowheader" scope="row">
							BIC réel normal
						</th>
						<td headers={resultatFiscalHeader}>
							<strong>2058-A-SD</strong>
							<br />
							Ligne XN (bénéfice) Ligne XO (déficit)
						</td>
						<td headers={`${exonerationsHeader} ${zonesHeader}`}>
							<strong>2058-A-SD</strong>
							<br />
							Lignes K9 / L6 / ØV / PP / L2 / 1F / PC / L5 / PA / XC / PB
						</td>
						<td headers={`${exonerationsHeader} ${madelinHeader}`}>
							<strong>2053-SD</strong>
							<br />
							Lignes A7 et A8
						</td>
						<td headers={`${exonerationsHeader} ${plusValueHeader}`}>
							<strong>2058-A-SD</strong>
							<br />
							Ligne XG (montant inclus)
						</td>
						<td headers={`${exonerationsHeader} ${suramortissementHeader}`}>
							<strong>2058-A-SD</strong>
							<br />
							Lignes X9 et YA
						</td>
					</tr>
					<tr>
						<th role="rowheader" scope="row">
							BIC réel simplifié
						</th>
						<td headers={resultatFiscalHeader}>
							<strong>2033-B-SD</strong>
							<br />
							Ligne 370 (bénéfice) Ligne 372 (déficit)
						</td>
						<td headers={`${exonerationsHeader} ${zonesHeader}`}>
							<strong>2033 B-SD</strong>
							<br />
							Lignes 986 / 127 / 991 / 345 / 992 / 987 / 989 / 138 / 990 / 993
						</td>
						<td headers={`${exonerationsHeader} ${madelinHeader}`}>
							<strong>2033-SD</strong>
							<br />
							Lignes 325 et 327
						</td>
						<td headers={`${exonerationsHeader} ${plusValueHeader}`}>
							<strong>2033 B-SD</strong>
							<br />
							Ligne 350 (montant inclus)
						</td>
						<td headers={`${exonerationsHeader} ${suramortissementHeader}`}>
							<strong>2033 B-SD</strong>
							<br />
							Lignes 655 et 643
						</td>
					</tr>
					<tr>
						<th role="rowheader" scope="row">
							BNC déclaration contrôlée
						</th>
						<td headers={resultatFiscalHeader}>
							<strong>2035-B-SD</strong>
							<br />
							Ligne CP (bénéfice) Ligne CR (déficit)
						</td>
						<td headers={`${exonerationsHeader} ${zonesHeader}`}>
							<strong>2035-B-SD </strong>
							<br />
							Lignes CS / AW / CU / CI / AX / CQ
						</td>
						<td headers={`${exonerationsHeader} ${madelinHeader}`}>
							<strong>2035-A-SD </strong>
							<br />
							Lignes BZ et BU
						</td>
						<td headers={`${exonerationsHeader} ${plusValueHeader}`}>
							<strong>2035-A-SD</strong>
							<br />
							Ligne CL (montant inclus)
						</td>
						<td></td>
					</tr>
				</tbody>
			</StyledTable>
		</HelpButtonWithPopover>
	)
}
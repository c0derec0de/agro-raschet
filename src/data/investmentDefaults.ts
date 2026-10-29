import type { InvestmentInputs } from '../domain/types'

export const defaultInvestmentInputs: InvestmentInputs = {
  contractorRatePerHectare: 1_500,
  rentalRatePerHour: 1_600,
  loanDownPaymentPercent: 20,
  loanAnnualRatePercent: 18,
  loanTermYears: 5,
  leaseAdvancePercent: 20,
  leaseAnnualRatePercent: 15,
  leaseTermYears: 5,
}

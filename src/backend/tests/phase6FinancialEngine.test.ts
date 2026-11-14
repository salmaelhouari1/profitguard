import { describe, it, expect, beforeEach } from 'vitest';
import { FinancialEngine } from '../modules/engine/financialEngine';

describe('Phase 6: Precision Financial Engine & Accounting Integrity', () => {
  describe('Safe Monetary Decimal Arithmetic', () => {
    it('handles complex sub-cent addition without float distortion', () => {
      const gross = FinancialEngine.calculateGrossSales([
        { price: 19.99, quantity: 3 },
        { price: 9.95, quantity: 2 },
      ]);
      // 19.99 * 3 = 59.97, 9.95 * 2 = 19.90 -> 79.87
      expect(gross).toBe(79.87);
    });

    it('calculates net revenue subtracting discounts and refunds', () => {
      const net = FinancialEngine.calculateNetRevenue({
        grossSales: 150.0,
        discounts: 25.5,
        refunds: 40.0,
        shippingIncome: 12.0,
        taxesCollected: 15.0, // Taxes must NOT count as business revenue
      });
      // 150 - 25.5 - 40 + 12 = 96.50 (taxes excluded from revenue)
      expect(net).toBe(96.5);
    });

    it('reverses COGS only when returned items are restocked/salvageable', () => {
      const baseCogs = 50.0;
      const returnedCogsRestocked = FinancialEngine.adjustCogsForRefund({
        initialCogs: baseCogs,
        refundedItemsCogs: 20.0,
        restocked: true,
      });
      expect(returnedCogsRestocked).toBe(30.0);

      const returnedCogsDamaged = FinancialEngine.adjustCogsForRefund({
        initialCogs: baseCogs,
        refundedItemsCogs: 20.0,
        restocked: false, // Damaged/discarded item cannot recover COGS
      });
      expect(returnedCogsDamaged).toBe(50.0);
    });
  });

  describe('Multi-Tiered Margin & Profitability Metrics', () => {
    it('calculates Gross, Contribution, Operating, and Net Profit', () => {
      const netRevenue = 1000.0;
      const cogs = 350.0;
      const shippingExpense = 80.0;
      const paymentFees = 29.0;
      const adSpend = 200.0;
      const operatingExpenses = 150.0;

      const grossProfit = FinancialEngine.calculateGrossProfit(netRevenue, cogs);
      expect(grossProfit).toBe(650.0);

      const contributionProfit = FinancialEngine.calculateContributionProfit({
        revenue: netRevenue,
        cogs,
        shipping: shippingExpense,
        paymentFees,
        adSpend,
      });
      // 1000 - 350 - 80 - 29 - 200 = 341.0
      expect(contributionProfit).toBe(341.0);

      const operatingProfit = FinancialEngine.calculateOperatingProfit({
        contributionProfit,
        operatingExpenses,
      });
      // 341 - 150 = 191.0
      expect(operatingProfit).toBe(191.0);
    });

    it('computes Customer Acquisition Cost (CAC) safely', () => {
      const cac = FinancialEngine.calculateCac({
        totalAdSpend: 1500,
        newCustomersAcquired: 30,
      });
      expect(cac).toBe(50.0);

      const cacZero = FinancialEngine.calculateCac({
        totalAdSpend: 1500,
        newCustomersAcquired: 0,
      });
      expect(cacZero).toBe(0);
    });

    it('converts currencies while preserving original amounts and exchange rates', () => {
      const converted = FinancialEngine.convertCurrency({
        amount: 100.0,
        fromCurrency: 'EUR',
        toCurrency: 'USD',
        exchangeRate: 1.085,
      });
      expect(converted.convertedAmount).toBe(108.5);
      expect(converted.originalAmount).toBe(100.0);
      expect(converted.originalCurrency).toBe('EUR');
      expect(converted.targetCurrency).toBe('USD');
      expect(converted.exchangeRate).toBe(1.085);
    });
  });
});

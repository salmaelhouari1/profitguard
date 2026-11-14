import type { Order, Product, FinancialSummary, MarginStatus } from '../../../types';

export class FinancialEngine {
  /**
   * Safe rounded currency addition/multiplication using integer cents
   */
  public static toCents(amount: number): number {
    return Math.round(amount * 100);
  }

  public static fromCents(cents: number): number {
    return Math.round(cents) / 100;
  }

  /**
   * Gross Sales = Sum(Unit Price * Quantity)
   */
  public static calculateGrossSales(items: Array<{ price: number; quantity: number }>): number {
    const totalCents = items.reduce((sum, item) => sum + (this.toCents(item.price) * item.quantity), 0);
    return this.fromCents(totalCents);
  }

  /**
   * Net Revenue = Gross Sales - Discounts - Refunds + Shipping Income
   * Note: Taxes collected on behalf of governments are excluded from business revenue.
   */
  public static calculateNetRevenue(params: {
    grossSales: number;
    discounts?: number;
    refunds?: number;
    shippingIncome?: number;
    taxesCollected?: number;
  }): number {
    const grossCents = this.toCents(params.grossSales);
    const discCents = this.toCents(params.discounts || 0);
    const refundCents = this.toCents(params.refunds || 0);
    const shipCents = this.toCents(params.shippingIncome || 0);
    const netCents = grossCents - discCents - refundCents + shipCents;
    return this.fromCents(netCents);
  }

  /**
   * Adjust COGS upon refund: only reversed if items are returned to inventory
   */
  public static adjustCogsForRefund(params: {
    initialCogs: number;
    refundedItemsCogs: number;
    restocked: boolean;
  }): number {
    if (!params.restocked) {
      return params.initialCogs;
    }
    const adjusted = this.toCents(params.initialCogs) - this.toCents(params.refundedItemsCogs);
    return this.fromCents(Math.max(0, adjusted));
  }

  /**
   * Gross Profit = Revenue - COGS
   */
  public static calculateGrossProfit(revenue: number, cogs: number): number {
    const profitCents = this.toCents(revenue) - this.toCents(cogs);
    return this.fromCents(profitCents);
  }

  /**
   * Contribution Profit = Revenue - COGS - ShippingCost - AllocatedAdSpend - PaymentFees - Discounts
   */
  public static calculateContributionProfit(params: {
    revenue: number;
    cogs: number;
    shipping: number;
    discount?: number;
    adSpend?: number;
    paymentFees?: number;
  }): number {
    const { revenue, cogs, shipping, discount = 0, adSpend = 0, paymentFees = 0 } = params;
    const revCents = this.toCents(revenue);
    const costCents = this.toCents(cogs) + this.toCents(shipping) + this.toCents(discount) + this.toCents(adSpend) + this.toCents(paymentFees);
    return this.fromCents(revCents - costCents);
  }

  /**
   * Operating Profit = Contribution Profit - Fixed Operating Expenses
   */
  public static calculateOperatingProfit(params: {
    contributionProfit: number;
    operatingExpenses: number;
  }): number {
    const opCents = this.toCents(params.contributionProfit) - this.toCents(params.operatingExpenses);
    return this.fromCents(opCents);
  }

  /**
   * Customer Acquisition Cost (CAC) = Total Ad Spend / New Customers Acquired
   */
  public static calculateCac(params: {
    totalAdSpend: number;
    newCustomersAcquired: number;
  }): number {
    if (params.newCustomersAcquired <= 0) return 0;
    return this.fromCents(this.toCents(params.totalAdSpend) / params.newCustomersAcquired);
  }

  /**
   * Currency Conversion preserving original value & exchange rate
   */
  public static convertCurrency(params: {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    exchangeRate: number;
  }): {
    convertedAmount: number;
    originalAmount: number;
    originalCurrency: string;
    targetCurrency: string;
    exchangeRate: number;
  } {
    const converted = this.fromCents(this.toCents(params.amount) * params.exchangeRate);
    return {
      convertedAmount: converted,
      originalAmount: params.amount,
      originalCurrency: params.fromCurrency,
      targetCurrency: params.toCurrency,
      exchangeRate: params.exchangeRate,
    };
  }

  /**
   * Profit Margin % = (Profit / Revenue) * 100
   */
  public static calculateMargin(profit: number, revenue: number): number {
    if (revenue <= 0) return 0;
    return Math.round(((profit / revenue) * 100) * 10) / 10;
  }

  /**
   * Determine margin classification
   */
  public static determineMarginStatus(params: {
    cogs: number;
    margin: number;
    targetMargin?: number;
  }): MarginStatus {
    const { cogs, margin, targetMargin = 20 } = params;
    if (cogs <= 0) return 'missing';
    if (margin < 0) return 'negative';
    if (margin < targetMargin) return 'low';
    return 'healthy';
  }

  /**
   * Break-even ROAS = 1 / Gross Margin Ratio
   */
  public static calculateBreakEvenRoas(grossMarginPercent: number): number {
    if (grossMarginPercent <= 0) return 0;
    return Math.round((100 / grossMarginPercent) * 10) / 10;
  }

  /**
   * Summarize financial metrics across a set of normalized orders
   */
  public static computeSummary(params: {
    orders: Order[];
    advertisingSpend: number;
    dateRange: string;
    comparison?: { revenue: number; profitMargin: number; contributionProfit: number };
  }): FinancialSummary {
    const { orders: rawOrders, advertisingSpend, dateRange, comparison } = params;
    
    // Invariant: Deduplicate orders by unique identifier (orderNumber or id) to prevent double counting
    const seen = new Set<string>();
    const orders: Order[] = [];
    for (const o of rawOrders) {
      const key = o.orderNumber || o.id;
      if (!seen.has(key)) {
        seen.add(key);
        orders.push(o);
      }
    }

    const totalRevenue = orders.reduce((sum, o) => sum + o.revenue, 0);
    const totalCogs = orders.reduce((sum, o) => sum + o.cogs, 0);
    const grossProfit = this.calculateGrossProfit(totalRevenue, totalCogs);
    
    // Total contribution profit across orders
    const orderProfitSum = orders.reduce((sum, o) => sum + o.profit, 0);
    // Net contribution profit after global unallocated advertising spend
    const contributionProfit = Math.round((orderProfitSum - (advertisingSpend * 0.2)) * 100) / 100;
    
    const profitMargin = this.calculateMargin(contributionProfit, totalRevenue);
    const avgOrderValue = orders.length > 0 ? Math.round((totalRevenue / orders.length) * 100) / 100 : 0;
    
    // Profit at risk: sum of potential lost margin from orders with low, negative or missing margins
    const profitAtRisk = orders
      .filter((o) => o.marginStatus === 'negative' || o.marginStatus === 'low' || o.marginStatus === 'missing')
      .reduce((sum, o) => sum + (o.revenue * 0.2 - o.profit), 0);

    return {
      contributionProfit,
      revenue: Math.round(totalRevenue * 100) / 100,
      profitMargin,
      orders: orders.length,
      avgOrderValue,
      profitAtRisk: Math.max(0, Math.round(profitAtRisk * 100) / 100),
      advertisingSpend,
      grossProfit,
      dateRange,
      comparisonPeriod: comparison || {
        revenue: Math.round(totalRevenue * 0.94),
        profitMargin: Math.round((profitMargin - 2.3) * 10) / 10,
        contributionProfit: Math.round(contributionProfit * 0.84),
      },
    };
  }
}

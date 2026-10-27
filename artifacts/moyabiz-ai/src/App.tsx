import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowRight, BadgePercent, BriefcaseBusiness, Calculator, Check, ChevronRight,
  CircleHelp, ClipboardList, Copy, FileText, Home, Menu, Megaphone, Printer,
  RotateCcw, Sparkles, Wallet, X,
} from 'lucide-react';
import {
  getGetMarketingStatusQueryKey, useGenerateMarketing, useGetMarketingStatus,
} from '@workspace/api-client-react';
import type { MarketingInput, MarketingOutput } from '@workspace/api-client-react';
import {
  calculateProfitSummary,
  calculateQuoteLineTotal,
  calculateQuoteTotal,
  parseCurrencyInput,
  parsePositiveQuantity,
} from '@/lib/business-math';

const queryClient = new QueryClient();
const money = (value: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number.isFinite(value) ? value : 0);
const formatDate = (value: string) => value
  ? new Date(`${value}T12:00:00`).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—';
const todayForDateInput = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const navItems = [
  { href: '/', label: 'Workspace', icon: Home },
  { href: '/profit', label: 'Profit calculator', icon: Calculator },
  { href: '/quotation', label: 'Quotation builder', icon: ClipboardList },
  { href: '/marketing', label: 'Marketing captions', icon: Megaphone },
];

function Shell({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = navItems.find((item) => item.href === path);
  return (
    <div className="app-shell min-h-[100dvh] md:flex">
      <aside className="app-sidebar no-print hidden w-[252px] shrink-0 flex-col px-5 py-7 md:flex">
        <Link href="/" className="mb-10 flex items-center gap-3 px-2" data-testid="link-brand-home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#64c787] text-[#16385a]"><BriefcaseBusiness size={20} /></div>
          <div>
            <div className="display-font text-[17px] font-extrabold tracking-tight text-white">MoyaBiz <span className="text-[#83d69e]">AI</span></div>
            <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[.17em] text-white/55">Small business, made simpler</div>
          </div>
        </Link>
        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/42">Your workspace</div>
        <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${path === href ? 'active' : ''}`} data-testid={`link-nav-${href === '/' ? 'workspace' : href.slice(1)}`}>
              <Icon size={18} strokeWidth={1.9} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.06] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-[#85d79f]"><CircleHelp size={17} /></div>
          <p className="text-sm font-bold text-white">Built for your next step</p>
          <p className="mt-1 text-xs leading-5 text-white/60">Clear numbers and confident words, whenever you need them.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="no-print flex h-[68px] items-center justify-between border-b border-[#e1e8ec] bg-white px-4 md:h-[76px] md:px-9">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-[#26415a] md:hidden" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
              {menuOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            <div className="md:hidden">
              <div className="display-font text-base font-extrabold text-[#17365d]">MoyaBiz <span className="text-[#27834f]">AI</span></div>
            </div>
            <div className="hidden text-sm font-medium text-[#778795] md:block">Workspace <ChevronRight className="mx-1 inline" size={14} /> <span className="font-bold text-[#263c52]">{current?.label ?? 'Workspace'}</span></div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold text-[#263c52]">Made for local business</p>
              <p className="text-[11px] text-[#8795a0]">South Africa · ZAR</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e4f3e9] text-sm font-extrabold text-[#23774a]">M</div>
          </div>
        </header>
        {menuOpen && <div className="no-print absolute z-30 w-full border-b border-[#dfe7eb] bg-white p-3 shadow-lg md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link !text-[#263c52] ${path === href ? '!bg-[#eaf5ed] !text-[#23774a]' : ''}`} data-testid={`link-mobile-${href === '/' ? 'workspace' : href.slice(1)}`}><Icon size={18} />{label}</Link>)}
        </div>}
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-24 pt-6 md:px-9 md:pb-12 md:pt-8">{children}</main>
        <nav className="no-print fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-[#dfe7eb] bg-white/95 px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-2 backdrop-blur md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold ${path === href ? 'text-[#23774a]' : 'text-[#82909b]'}`} data-testid={`link-bottom-${href === '/' ? 'workspace' : href.slice(1)}`}>
              <Icon size={19} strokeWidth={path === href ? 2.4 : 1.8} /><span>{label === 'Profit calculator' ? 'Profit' : label === 'Quotation builder' ? 'Quote' : label === 'Marketing captions' ? 'Marketing' : 'Home'}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-7 page-enter"><p className="mb-2 text-[11px] font-extrabold uppercase tracking-[.16em] text-[#328153]">{eyebrow}</p><h1 className="display-font text-[28px] font-extrabold leading-tight tracking-[-.035em] text-[#17365d] md:text-[34px]">{title}</h1><p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#71808d]">{description}</p></div>;
}

function Workspace() {
  return <div className="page-enter">
    <section className="relative mb-7 overflow-hidden rounded-[22px] bg-[#17365d] px-6 py-7 text-white md:px-10 md:py-9">
      <div className="relative z-10 max-w-[620px]">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[.18em] text-[#9cddb0]">Your business toolkit</p>
        <h1 className="display-font max-w-[500px] text-[30px] font-extrabold leading-[1.12] tracking-[-.04em] md:text-[42px]">Good business starts with clear numbers.</h1>
        <p className="mt-4 max-w-[480px] text-sm leading-6 text-white/72 md:text-[15px]">Work out what you really earn, send a tidy quotation, and find the right words for your customers.</p>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-8 hidden h-64 w-64 rounded-full border border-white/10 md:right-8 md:top-[-75px] md:block md:h-[350px] md:w-[350px]">
        <div className="absolute inset-8 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-1/2 flex h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[28px] bg-[#64c787] text-[#17365d] shadow-[0_14px_35px_rgba(0,0,0,.16)]"><Wallet size={38} strokeWidth={1.7} /></div>
        <div className="absolute right-10 top-20 rounded-xl bg-white/10 p-3 text-[#a4e1b7] backdrop-blur"><BadgePercent size={22} /></div>
        <div className="absolute bottom-12 left-10 rounded-xl bg-white/10 p-3 text-[#a4e1b7] backdrop-blur"><FileText size={22} /></div>
      </div>
    </section>

    <div className="mb-4 flex items-end justify-between"><div><h2 className="display-font text-xl font-extrabold tracking-tight text-[#21384e]">What are we working on?</h2><p className="mt-1 text-sm text-[#7c8a95]">Pick up a useful task and get it done.</p></div></div>
    <section className="grid gap-4 md:grid-cols-3">
      <ToolCard href="/profit" tag="Know your numbers" title="Profit calculator" detail="See how much is left after costs, and check your margin before you sell." icon={<Calculator size={21} />} tone="green" test="profit" />
      <ToolCard href="/quotation" tag="Quote with confidence" title="Quotation builder" detail="Put together a clear, professional quote your customer can understand." icon={<ClipboardList size={21} />} tone="navy" test="quotation" />
      <ToolCard href="/marketing" tag="Find the right words" title="Marketing captions" detail="Write a friendly caption for WhatsApp, Facebook, or both." icon={<Megaphone size={21} />} tone="gold" test="marketing" />
    </section>
    <section className="mt-6 grid gap-4 md:grid-cols-[1.25fr_.75fr]">
      <div className="soft-card flex items-center gap-5 p-5 md:p-6">
        <div className="hidden h-[66px] w-[66px] shrink-0 items-center justify-center rounded-2xl bg-[#eaf5ed] text-[#27834f] sm:flex"><Sparkles size={29} /></div>
        <div><p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#378354]">A little clarity goes a long way</p><h3 className="display-font mt-1 text-lg font-extrabold text-[#21384e]">Practical tools. No jargon.</h3><p className="mt-1 max-w-xl text-sm leading-6 text-[#788792]">MoyaBiz is built around the everyday moments that keep a small business moving — pricing, proposals, and the next customer.</p></div>
      </div>
      <div className="rounded-2xl border border-[#dce9df] bg-[#edf6ef] p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-[.15em] text-[#398153]">Made for South Africa</p>
        <p className="display-font mt-2 text-[22px] font-extrabold text-[#17365d]">Local by default.</p>
        <p className="mt-1 text-sm leading-6 text-[#62786d]">Every money amount is in South African rand (ZAR).</p>
      </div>
    </section>
  </div>;
}

function ToolCard({ href, tag, title, detail, icon, tone, test }: { href: string; tag: string; title: string; detail: string; icon: ReactNode; tone: string; test: string }) {
  const colors: Record<string, string> = { green: 'bg-[#e7f5eb] text-[#23804c]', navy: 'bg-[#e9eff7] text-[#244a75]', gold: 'bg-[#fbf1dc] text-[#a7711f]' };
  return <Link href={href} className="soft-card group block p-5 no-underline transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(25,53,74,.09)] md:p-6" data-testid={`card-tool-${test}`}>
    <div className="mb-6 flex items-start justify-between"><div className={`flex h-11 w-11 items-center justify-center rounded-[13px] ${colors[tone]}`}>{icon}</div><ArrowRight className="text-[#a8b4bc] transition-transform group-hover:translate-x-1 group-hover:text-[#27834f]" size={19} /></div>
    <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-[#778791]">{tag}</p>
    <h3 className="display-font mt-1.5 text-lg font-extrabold text-[#21384e]">{title}</h3>
    <p className="mt-2 min-h-[48px] text-[13px] leading-[1.65] text-[#768590]">{detail}</p>
    <div className="mt-5 flex items-center gap-1.5 text-[12px] font-bold text-[#27834f]">Open tool <ChevronRight size={15} /></div>
  </Link>;
}

function Profit() {
  const [totalCost, setTotalCost] = useState('120');
  const [sellingPrice, setSellingPrice] = useState('250');
  const [quantity, setQuantity] = useState('1');
  const [showErrors, setShowErrors] = useState(false);
  const costValue = parseCurrencyInput(totalCost);
  const priceValue = parseCurrencyInput(sellingPrice);
  const quantityValue = parsePositiveQuantity(quantity);
  const summary = costValue !== null && priceValue !== null && quantityValue !== null
    ? calculateProfitSummary(costValue, priceValue, quantityValue)
    : null;
  const costError = totalCost.trim() === ''
    ? 'Enter the total cost for this batch.'
    : costValue === null
      ? 'Enter a non-negative rand amount with up to two decimal places.'
      : null;
  const priceError = sellingPrice.trim() === ''
    ? 'Enter the selling price for one item.'
    : priceValue === null || priceValue <= 0
      ? 'Enter a selling price greater than R0, with up to two decimal places.'
      : null;
  const quantityError = quantity.trim() === ''
    ? 'Enter the number of items.'
    : quantityValue === null
      ? 'Enter a whole number of one or more items.'
      : null;
  const reset = () => {
    setTotalCost('');
    setSellingPrice('');
    setQuantity('');
    setShowErrors(false);
  };
  return <div className="page-enter">
    <PageHeading eyebrow="Know your numbers" title="Profit calculator" description="Enter your total cost for the batch, your selling price per item, and how many items you plan to sell." />
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_.86fr]">
      <section className="soft-card p-5 md:p-7">
        <div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#27834f]"><Calculator size={20} /></div><div><h2 className="display-font font-extrabold text-[#20374d]">Your selling numbers</h2><p className="text-xs text-[#81909a]">All amounts in South African rand</p></div></div>
        <div className="space-y-5">
          <div>
            <label className="label" htmlFor="cost">Total cost for all items</label>
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#8795a0]">R</span><input id="cost" className="field pl-8" inputMode="decimal" type="number" min="0" step="0.01" value={totalCost} onBlur={() => setShowErrors(true)} onChange={(e) => setTotalCost(e.target.value)} placeholder="0.00" aria-invalid={showErrors && !!costError} data-testid="input-cost" /></div>
            <p className="mt-1.5 text-xs text-[#8795a0]">Your combined cost to make or buy this batch.</p>
            {showErrors && costError && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-total-cost">{costError}</p>}
          </div>
          <div>
            <label className="label" htmlFor="price">Selling price, per item</label>
            <div className="relative"><span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#8795a0]">R</span><input id="price" className="field pl-8" inputMode="decimal" type="number" min="0.01" step="0.01" value={sellingPrice} onBlur={() => setShowErrors(true)} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" aria-invalid={showErrors && !!priceError} data-testid="input-price" /></div>
            {showErrors && priceError && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-selling-price">{priceError}</p>}
          </div>
          <div>
            <label className="label" htmlFor="quantity">Number of items</label>
            <input id="quantity" className="field" inputMode="numeric" type="number" min="1" step="1" value={quantity} onBlur={() => setShowErrors(true)} onChange={(e) => setQuantity(e.target.value)} aria-invalid={showErrors && !!quantityError} data-testid="input-quantity" />
            {showErrors && quantityError && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-quantity">{quantityError}</p>}
          </div>
          <button className="btn-secondary inline-flex items-center gap-2 text-sm" onClick={reset} data-testid="button-reset-calculator"><RotateCcw size={15} /> Clear amounts</button>
        </div>
      </section>
      <section className="overflow-hidden rounded-2xl bg-[#17365d] text-white">
        <div className="border-b border-white/10 px-6 py-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9bd9ad]">Your result</p><h2 className="display-font mt-1 text-xl font-extrabold">At a glance</h2></div>
        <div className="p-6">
          <p className="text-sm font-medium text-white/65">Gross profit for the batch</p>
          <p className={`display-font mt-1 text-[38px] font-extrabold tracking-tight ${summary && summary.grossProfit < 0 ? 'text-[#f3b9a8]' : 'text-white'}`} data-testid="text-gross-profit">{summary ? money(summary.grossProfit) : '—'}</p>
          <div className="my-5 h-px bg-white/12" />
          <div className="space-y-4">
            <ResultLine label="Revenue" value={summary ? money(summary.revenue) : '—'} test="revenue" />
            <ResultLine label="Total cost" value={summary ? money(summary.totalCost) : '—'} test="total-cost" />
            <ResultLine label="Gross profit" value={summary ? money(summary.grossProfit) : '—'} test="gross-profit-row" />
            <ResultLine label="Profit margin" value={summary ? `${summary.profitMargin.toFixed(1)}%` : '—'} test="profit-margin" />
          </div>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/[.07] p-4 text-[12px] leading-[1.6] text-white/70"><span className="font-bold text-[#a3dfb4]">Profit margin</span> is gross profit divided by revenue. A negative margin means your total cost is higher than the revenue from this batch.</div>
          {summary && summary.grossProfit < 0 && <p className="mt-3 text-sm font-semibold text-[#ffd1bd]" data-testid="status-loss-warning">Your total cost is higher than your revenue. This batch would make a loss.</p>}
          {!summary && <p className="mt-3 text-xs text-white/65" data-testid="status-calculator-incomplete">Enter valid amounts and a whole-number quantity to calculate results.</p>}
        </div>
      </section>
    </div>
  </div>;
}

function ResultLine({ label, value, test }: { label: string; value: string; test: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-sm text-white/65">{label}</span><strong className="text-[15px] font-bold text-white" data-testid={`text-${test}`}>{value}</strong></div>;
}

type QuoteLine = { id: number; description: string; quantity: string; price: string };
function Quotation() {
  const [business, setBusiness] = useState('');
  const [customer, setCustomer] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('MB-001');
  const [quoteDate, setQuoteDate] = useState(todayForDateInput);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<QuoteLine[]>([{ id: 1, description: '', quantity: '1', price: '' }]);
  const [showErrors, setShowErrors] = useState(false);
  const subtotal = calculateQuoteTotal(lines.map((line) => ({ quantity: line.quantity, unitPrice: line.price })));
  const validUntilError = Boolean(validUntil && quoteDate && validUntil < quoteDate);
  const quoteIsValid = Boolean(
    business.trim() &&
    customer.trim() &&
    quoteNumber.trim() &&
    quoteDate &&
    !validUntilError &&
    lines.length > 0 &&
    lines.every((line) =>
      line.description.trim() &&
      calculateQuoteLineTotal(line.quantity, line.price) !== null
    )
  );
  const updateLine = (id: number, key: keyof QuoteLine, value: string) => setLines((prev) => prev.map((line) => line.id === id ? { ...line, [key]: value } : line));
  const addLine = () => setLines((prev) => [...prev, { id: Math.max(0, ...prev.map((line) => line.id)) + 1, description: '', quantity: '1', price: '' }]);
  const removeLine = (id: number) => setLines((prev) => prev.length > 1 ? prev.filter((line) => line.id !== id) : prev);
  const printQuote = () => {
    setShowErrors(true);
    if (quoteIsValid) window.print();
  };
  return <div className="page-enter">
    <div className="no-print"><PageHeading eyebrow="Quote with confidence" title="Quotation builder" description="Add your business and customer details, then list what you are offering. Your quote updates as you type." /></div>
    <div className="grid items-start gap-5 xl:grid-cols-[.92fr_1.08fr]">
      <section className="soft-card no-print p-5 md:p-6">
        <h2 className="display-font mb-5 text-lg font-extrabold text-[#20374d]">Quote details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="business-name">Your business</label>
            <input id="business-name" className="field" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business name" aria-invalid={showErrors && !business.trim()} data-testid="input-business-name" />
            {showErrors && !business.trim() && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-business-name">Enter your business name.</p>}
          </div>
          <div>
            <label className="label" htmlFor="quote-number">Quotation number</label>
            <input id="quote-number" className="field" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} aria-invalid={showErrors && !quoteNumber.trim()} data-testid="input-quote-number" />
            {showErrors && !quoteNumber.trim() && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-quote-number">Enter a quotation number.</p>}
          </div>
          <div>
            <label className="label" htmlFor="customer-name">Prepared for</label>
            <input id="customer-name" className="field" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" aria-invalid={showErrors && !customer.trim()} data-testid="input-customer-name" />
            {showErrors && !customer.trim() && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-customer-name">Enter your customer's name.</p>}
          </div>
          <div>
            <label className="label" htmlFor="quote-date">Quotation date</label>
            <input id="quote-date" className="field" type="date" required value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} aria-invalid={showErrors && !quoteDate} data-testid="input-quote-date" />
            {showErrors && !quoteDate && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-quote-date">Choose the quotation date.</p>}
          </div>
          <div>
            <label className="label" htmlFor="valid-until">Valid until (optional)</label>
            <input id="valid-until" className="field" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} aria-invalid={showErrors && validUntilError} data-testid="input-valid-until" />
            {showErrors && validUntilError && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid="error-valid-until">The expiry date must be on or after the quotation date.</p>}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#30465a]">Items or services</h3><button className="text-xs font-bold text-[#27834f] hover:underline" onClick={addLine} data-testid="button-add-quote-line">+ Add a line</button></div>
        <div className="mt-3 space-y-3">
          {lines.map((line, index) => <div key={line.id} className="rounded-xl border border-[#e3e9ed] bg-[#fbfcfd] p-3" data-testid={`row-quote-line-${index}`}>
            <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-bold text-[#82909b]">LINE {String(index + 1).padStart(2, '0')}</span>{lines.length > 1 && <button onClick={() => removeLine(line.id)} className="px-2 text-xs font-semibold text-[#9a6870]" data-testid={`button-remove-quote-line-${index}`}>Remove</button>}</div>
            <input className="field !py-2.5" aria-label={`Description for line ${index + 1}`} value={line.description} onChange={(e) => updateLine(line.id, 'description', e.target.value)} placeholder="Description" aria-invalid={showErrors && !line.description.trim()} data-testid={`input-line-description-${index}`} />
            {showErrors && !line.description.trim() && <p className="mt-1 text-xs font-semibold text-[#a04444]" role="alert" data-testid={`error-line-description-${index}`}>Enter a description for this item or service.</p>}
            <div className="mt-2 grid grid-cols-[.7fr_1fr] gap-2">
              <div><label className="mb-1 block text-[10px] font-bold text-[#84919b]" htmlFor={`line-quantity-${index}`}>QUANTITY</label><input id={`line-quantity-${index}`} className="field !py-2.5" type="number" min="1" step="1" required aria-label={`Quantity for line ${index + 1}`} value={line.quantity} onChange={(e) => updateLine(line.id, 'quantity', e.target.value)} aria-invalid={showErrors && parsePositiveQuantity(line.quantity) === null} data-testid={`input-line-quantity-${index}`} />{showErrors && parsePositiveQuantity(line.quantity) === null && <p className="mt-1 text-[10px] font-semibold leading-4 text-[#a04444]" role="alert" data-testid={`error-line-quantity-${index}`}>Use a whole number above zero.</p>}</div>
              <div><label className="mb-1 block text-[10px] font-bold text-[#84919b]" htmlFor={`line-price-${index}`}>PRICE PER ITEM (ZAR)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8795a0]">R</span><input id={`line-price-${index}`} className="field !py-2.5 pl-8" type="number" min="0" step="0.01" required aria-label={`Price for line ${index + 1}`} value={line.price} onChange={(e) => updateLine(line.id, 'price', e.target.value)} placeholder="0.00" aria-invalid={showErrors && parseCurrencyInput(line.price) === null} data-testid={`input-line-price-${index}`} /></div>{showErrors && parseCurrencyInput(line.price) === null && <p className="mt-1 text-[10px] font-semibold leading-4 text-[#a04444]" role="alert" data-testid={`error-line-price-${index}`}>Enter a price of R0 or more with up to two decimals.</p>}</div>
            </div>
            <p className="mt-2 text-right text-xs font-bold text-[#42634f]" data-testid={`text-line-total-${index}`}>{calculateQuoteLineTotal(line.quantity, line.price) === null ? '—' : money(calculateQuoteLineTotal(line.quantity, line.price)!)}</p>
          </div>)}
        </div>
        <div className="mt-5"><label className="label" htmlFor="quote-notes">Notes or payment terms</label><textarea id="quote-notes" rows={3} className="field resize-y" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details for your customer" data-testid="input-quote-notes" /></div>
        {showErrors && !quoteIsValid && <p className="mt-4 text-sm font-semibold text-[#a04444]" role="alert" data-testid="error-quotation-form">Complete the quotation details and enter a valid description, whole-number quantity, and price for each line before printing.</p>}
        <button onClick={printQuote} className="btn-primary mt-5 inline-flex w-full items-center justify-center gap-2" data-testid="button-print-quotation"><Printer size={17} /> Print or save as PDF</button>
      </section>

      <section className="quote-paper soft-card min-h-[580px] p-6 md:p-9" data-testid="content-quotation-preview">
        <div className="flex items-start justify-between gap-4 border-b border-[#e7ecef] pb-6">
          <div><div className="display-font text-xl font-extrabold text-[#17365d]" data-testid="text-preview-business">{business || 'Your business name'}</div><p className="mt-1 text-xs text-[#83909a]">QUOTATION</p></div>
          <div className="rounded-lg bg-[#eaf5ed] px-3 py-2 text-right"><p className="text-[9px] font-extrabold uppercase tracking-[.13em] text-[#44815a]">Quote number</p><p className="mt-0.5 text-sm font-bold text-[#244b36]" data-testid="text-preview-number">{quoteNumber || '—'}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 py-6">
          <div><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#89969f]">Prepared for</p><p className="mt-1 text-sm font-bold text-[#31475a]" data-testid="text-preview-customer">{customer || 'Customer name'}</p></div>
          <div className="text-right"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#89969f]">Quotation date</p><p className="mt-1 text-sm font-bold text-[#31475a]" data-testid="text-preview-date">{formatDate(quoteDate)}</p></div>
          {validUntil && <div className="col-span-2 text-right"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-[#89969f]">Valid until</p><p className="mt-1 text-sm font-bold text-[#31475a]" data-testid="text-preview-valid-until">{formatDate(validUntil)}</p></div>}
        </div>
        <div className="overflow-hidden rounded-lg border border-[#e2e8eb]">
          <div className="grid grid-cols-[1fr_45px_75px_78px] gap-2 bg-[#f4f7f8] px-3 py-2.5 text-[9px] font-extrabold uppercase tracking-[.08em] text-[#687b89] sm:grid-cols-[1fr_58px_105px_105px]">
            <span>Description</span><span className="text-right">Qty</span><span className="text-right">Price</span><span className="text-right">Amount</span>
          </div>
          {lines.map((line, index) => <div key={line.id} className="grid min-h-[47px] grid-cols-[1fr_45px_75px_78px] gap-2 border-t border-[#e9edef] px-3 py-3 text-[11px] text-[#405568] sm:grid-cols-[1fr_58px_105px_105px]" data-testid={`preview-quote-line-${index}`}>
            <span className="break-words">{line.description || 'Item or service'}</span><span className="text-right">{parsePositiveQuantity(line.quantity) ?? '—'}</span><span className="text-right">{parseCurrencyInput(line.price) === null ? '—' : money(parseCurrencyInput(line.price)!)}</span><span className="text-right font-bold">{calculateQuoteLineTotal(line.quantity, line.price) === null ? '—' : money(calculateQuoteLineTotal(line.quantity, line.price)!)}</span>
          </div>)}
        </div>
        <div className="ml-auto mt-5 max-w-[240px] border-t border-[#e2e8eb] pt-3"><div className="flex justify-between text-xs text-[#71818e]"><span>Subtotal</span><span>{subtotal === null ? '—' : money(subtotal)}</span></div><div className="mt-2 flex justify-between text-[15px] font-extrabold text-[#17365d]" data-testid="text-quotation-total"><span>Total (ZAR)</span><span>{subtotal === null ? '—' : money(subtotal)}</span></div></div>
        {notes && <div className="mt-7 rounded-lg bg-[#f6f8f9] p-3"><p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-[#798892]">Notes</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-[#485e70]" data-testid="text-preview-notes">{notes}</p></div>}
        <div className="mt-10 border-t border-[#e7ecef] pt-4 text-[10px] text-[#9aa5ac]">Thank you for the opportunity to quote.</div>
      </section>
    </div>
  </div>;
}

function Marketing() {
  const status = useGetMarketingStatus({ query: { queryKey: getGetMarketingStatusQueryKey() } });
  const generate = useGenerateMarketing();
  const [businessType, setBusinessType] = useState('');
  const [productOrService, setProductOrService] = useState('');
  const [targetCustomers, setTargetCustomers] = useState('');
  const [platform, setPlatform] = useState<MarketingInput['platform']>('Both');
  const [tone, setTone] = useState('Friendly and helpful');
  const [copied, setCopied] = useState<string | null>(null);
  const [costConsent, setCostConsent] = useState(false);
  const output: MarketingOutput | undefined = generate.isError ? undefined : generate.data;
  const canGenerate = Boolean(
    businessType.trim() &&
    productOrService.trim() &&
    targetCustomers.trim() &&
    tone.trim() &&
    (!status.data?.configured || costConsent)
  );
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canGenerate) return;
    generate.mutate({ data: { businessType: businessType.trim(), productOrService: productOrService.trim(), targetCustomers: targetCustomers.trim(), platform, tone: tone.trim() } });
  };
  const copyCaption = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); window.setTimeout(() => setCopied(null), 1800); } catch { setCopied('unavailable'); }
  };
  return <div className="page-enter">
    <PageHeading eyebrow="Find the right words" title="Marketing captions" description="Share a few details about what you offer. Get a customer-friendly caption for your next post." />
    <div className="grid items-start gap-5 xl:grid-cols-[.88fr_1.12fr]">
      <form className="soft-card p-5 md:p-6" onSubmit={submit}>
        <div className="mb-5 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5ec] text-[#27834f]"><Megaphone size={20} /></div><div><h2 className="display-font font-extrabold text-[#20374d]">Tell us about your offer</h2><p className="text-xs text-[#81909a]">A few simple details make it more personal.</p></div></div>
        <div className="space-y-4">
          <div><label className="label" htmlFor="business-type">What kind of business do you run?</label><input id="business-type" className="field" maxLength={120} required value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="For example, a home bakery" data-testid="input-business-type" /></div>
          <div><label className="label" htmlFor="product-service">What are you promoting?</label><textarea id="product-service" rows={2} maxLength={240} required className="field resize-y" value={productOrService} onChange={(e) => setProductOrService(e.target.value)} placeholder="Describe your product or service" data-testid="input-product-service" /></div>
          <div><label className="label" htmlFor="target-customers">Who would you like to reach?</label><input id="target-customers" className="field" maxLength={240} required value={targetCustomers} onChange={(e) => setTargetCustomers(e.target.value)} placeholder="For example, busy families in my area" data-testid="input-target-customers" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="platform">Where will you post?</label><select id="platform" className="field" value={platform} onChange={(e) => setPlatform(e.target.value as MarketingInput['platform'])} data-testid="select-platform"><option>Both</option><option>WhatsApp</option><option>Facebook</option></select></div>
            <div><label className="label" htmlFor="tone">Choose a tone</label><select id="tone" className="field" value={tone} onChange={(e) => setTone(e.target.value)} data-testid="select-tone"><option>Friendly and helpful</option><option>Warm and personal</option><option>Confident and professional</option><option>Bright and playful</option><option>Simple and direct</option></select></div>
          </div>
          {status.isLoading ? <div className="h-10 animate-pulse rounded-lg bg-[#edf1f3]" data-testid="status-marketing-loading" /> :
            status.isError ? <div className="rounded-lg border border-[#f0d9c7] bg-[#fff8f1] p-3 text-xs leading-5 text-[#8a6039]" data-testid="status-marketing-error">We could not check live generation right now. You can still try generating a caption.</div> :
            <div className="flex items-start gap-2 rounded-lg bg-[#f2f7f3] p-3 text-xs leading-5 text-[#54715f]" data-testid="status-marketing-mode"><span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#43a76c]" />{status.data?.configured ? `A server-side API key is configured${status.data.model ? ` for ${status.data.model}` : ''}. Live access is confirmed only after a successful request.` : 'Demo mode is active. Captions are sample suggestions, not AI-generated.'}</div>}
          {status.data?.configured && <>
            <p className="rounded-lg border border-[#f0e4c9] bg-[#fffaf0] p-3 text-xs leading-5 text-[#796542]" data-testid="notice-model-usage-cost">Live requests use your Meta Model API account and may incur usage charges. Demo mode does not send requests to Meta.</p>
            <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#536474]" data-testid="label-model-cost-consent">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#27834f]" checked={costConsent} onChange={(event) => setCostConsent(event.target.checked)} data-testid="checkbox-model-cost-consent" />
              <span>I understand this request will use Meta Model API and may incur charges.</span>
            </label>
          </>}
          {generate.isError && <p className="text-sm font-semibold text-[#a04444]" role="alert" data-testid="status-generation-error">{generate.error instanceof Error ? generate.error.message : 'We could not create your caption. Check the connection and try again.'}</p>}
          <button className="btn-primary inline-flex w-full items-center justify-center gap-2" disabled={!canGenerate || generate.isPending} type="submit" data-testid="button-generate-caption">{generate.isPending ? <><span className="h-4 w-4 animate-pulse rounded-full bg-white/70" /> Creating your caption…</> : <><Sparkles size={17} /> Create a caption</>}</button>
        </div>
      </form>
      <section className="space-y-4">
        {output ? <>
          <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${output.mode === 'ai' ? 'border-[#cfe5d5] bg-[#eef7f0] text-[#34724b]' : 'border-[#e7e2d3] bg-[#faf7ed] text-[#78653a]'}`} data-testid="status-output-mode">
            {output.mode === 'ai' ? <Check size={15} /> : <CircleHelp size={15} />}
            {output.mode === 'ai' ? `AI-generated${output.model ? ` · ${output.model}` : ''}` : 'Demo suggestion · not AI-generated'}
          </div>
          {(platform === 'Both' || platform === 'WhatsApp') && <CaptionCard title="WhatsApp" subtitle="Short and personal" text={output.whatsappCaption} copied={copied === 'WhatsApp'} onCopy={() => copyCaption(output.whatsappCaption, 'WhatsApp')} test="whatsapp" />}
          {(platform === 'Both' || platform === 'Facebook') && <CaptionCard title="Facebook" subtitle="A little more room to tell your story" text={output.facebookCaption} copied={copied === 'Facebook'} onCopy={() => copyCaption(output.facebookCaption, 'Facebook')} test="facebook" />}
        </> : <div className="soft-card flex min-h-[300px] flex-col items-center justify-center px-7 py-10 text-center" data-testid="content-caption-empty">
          <div className="relative mb-5 flex h-[74px] w-[74px] items-center justify-center rounded-[25px] bg-[#eaf5ed] text-[#27834f]"><Megaphone size={31} /><span className="absolute -right-1 -top-1 h-5 w-5 rounded-full border-4 border-white bg-[#73cb8d]" /></div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.17em] text-[#438457]">Your next post starts here</p>
          <h3 className="display-font mt-2 text-xl font-extrabold text-[#21384e]">A good caption, made simple.</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#7c8a95]">Fill in your business details and we’ll prepare a caption you can review and copy.</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#89969f]"><span className="h-1.5 w-1.5 rounded-full bg-[#71bc85]" />{status.isLoading ? 'Checking availability' : status.data?.configured ? 'Live generation available' : 'Demo mode available'}</div>
        </div>}
      </section>
    </div>
  </div>;
}

function CaptionCard({ title, subtitle, text, copied, onCopy, test }: { title: string; subtitle: string; text: string; copied: boolean; onCopy: () => void; test: string }) {
  return <article className="soft-card overflow-hidden" data-testid={`card-caption-${test}`}>
    <div className="flex items-center justify-between border-b border-[#e9eef0] px-5 py-4">
      <div><h3 className="display-font font-extrabold text-[#20374d]">{title}</h3><p className="mt-0.5 text-xs text-[#84919b]">{subtitle}</p></div>
      <button className="btn-secondary inline-flex items-center gap-1.5 !px-3 !py-2 text-xs" onClick={onCopy} data-testid={`button-copy-${test}`}><Copy size={14} />{copied ? 'Copied' : 'Copy'}</button>
    </div>
    <p className="whitespace-pre-wrap px-5 py-5 text-[14px] leading-7 text-[#42586a]" data-testid={`text-caption-${test}`}>{text}</p>
    {copied && <div className="border-t border-[#e9eef0] px-5 py-2 text-xs font-semibold text-[#27834f]" data-testid={`status-copied-${test}`}>Caption copied to clipboard</div>}
  </article>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch>
    <Route path="/" component={Workspace} />
    <Route path="/profit" component={Profit} />
    <Route path="/quotation" component={Quotation} />
    <Route path="/marketing" component={Marketing} />
    <Route component={NotFound} />
  </Switch></Shell></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;

// Generates a Monthly Merchant Invoice HTML string based on the provided data shape
// Data shape expected (from getMerchantInvoiceService backend):
// {
//   INVOICE_DETAILS: { INVOICE_NUMBER, INVOICE_DATE, HSN_NUMBER },
//   SERVICE_FROM: { NAME, ADDRESS, CITY, STATE, COUNTRY, ZIP, CONTACT, EMAIL, GSTIN, PAN },
//   SERVICE_TO: { NAME, ADDRESS, CITY, STATE, COUNTRY, ZIP, CONTACT, EMAIL, GSTIN, PAN },
//   INVOICE_ORDERS: [{ DATE, ORDER_ID, QUANTITY, TOTAL_AMOUNT }, ...],
//   TOTAL_AMOUNT: string/number,
//   BREAKUPS: { BV, CGST, SGST, IGST }
// }

const escapeHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const numberToIndianWords = (num) => {
  // Basic Indian numbering system words for amounts
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const inWords = (n) => {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '')
    return ''
  }

  const toWords = (n) => {
    if (n === 0) return 'Zero'
    let s = ''
    const crore = Math.floor(n / 10000000)
    n %= 10000000
    const lakh = Math.floor(n / 100000)
    n %= 100000
    const thousand = Math.floor(n / 1000)
    n %= 1000
    const hundredBelow = n

    if (crore) s += inWords(crore) + ' Crore '
    if (lakh) s += inWords(lakh) + ' Lakh '
    if (thousand) s += inWords(thousand) + ' Thousand '
    if (hundredBelow) s += inWords(hundredBelow)

    return s.trim()
  }

  const amount = Number(num || 0)
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  const rupeesWords = toWords(rupees) + ' Rupees'
  const paiseWords = paise ? ` and ${toWords(paise)} Paise` : ''
  return rupeesWords + paiseWords + ' Only'
}

const generateMonthlyInvoiceHtml = (data) => {
  const details = data?.INVOICE_DETAILS || {}
  const from = data?.SERVICE_FROM || {}
  const to = data?.SERVICE_TO || {}
  const orders = Array.isArray(data?.INVOICE_ORDERS) ? data.INVOICE_ORDERS : []
  const breakups = data?.BREAKUPS || {}
  const total = Number(data?.TOTAL_AMOUNT || 0)

  const companyName = escapeHtml(from.NAME || 'ShipWale')
  const companyShort = escapeHtml((from.NAME || 'ShipWale').split(' ').map(w => w[0]).join('').slice(0,4).toUpperCase())
  const logoUrl = `${(typeof window !== 'undefined' ? window.location.origin : '')}/logo-nobg.png`
  const companyTagline = 'Monthly Merchant Invoice'

  const invoiceNumber = escapeHtml(details.INVOICE_NUMBER || '')
  const invoiceDate = escapeHtml(details.INVOICE_DATE || '')
  const hsnCode = escapeHtml(details.HSN_NUMBER || '')

  const fromAddress = escapeHtml(`${from.ADDRESS}, ${from.CITY}, ${from.STATE}, ${from.COUNTRY} - ${from.ZIP}`)
  const fromContact = escapeHtml(from.CONTACT || '')
  const fromEmail = escapeHtml(from.EMAIL || '')
  const fromGstin = escapeHtml(from.GSTIN || '')
  const fromPan = escapeHtml(from.PAN || '')

  const toName = escapeHtml(to.NAME || '')
  const toAddress = escapeHtml(`${to.ADDRESS}, ${to.CITY}, ${to.STATE}, ${to.COUNTRY} - ${to.ZIP}`)
  const toContact = escapeHtml(to.CONTACT || '')
  const toEmail = escapeHtml(to.EMAIL || '')
  const toGstin = escapeHtml(to.GSTIN || 'N/A')
  const toPan = escapeHtml(to.PAN || 'N/A')

  const bv = Number(breakups.BV || 0).toFixed(2)
  const cgst = Number(breakups.CGST || 0).toFixed(2)
  const sgst = Number(breakups.SGST || 0).toFixed(2)
  const igst = Number(breakups.IGST || 0).toFixed(2)

  const amountInWords = escapeHtml(numberToIndianWords(total))
  const billingPeriod = `${invoiceDate}`

  const orderRows = orders.map((o, idx) => {
    const dt = escapeHtml(o.DATE)
    const orderId = escapeHtml(o.ORDER_ID)
    const qty = escapeHtml(o.QUANTITY)
    const amt = Number(o.TOTAL_AMOUNT || 0).toFixed(2)
    return `<tr>
            <td>${idx + 1}</td>
            <td>${dt}</td>
            <td>${orderId}</td>
            <td class="text-right">${qty}</td>
            <td class="text-right">${amt}</td>
          </tr>`
  }).join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Invoice - ${companyName}</title>
  <style>
    :root{
      --brown:#7a4b2a;
      --grey:#f4f4f6;
      --text:#222;
      --muted:#666;
      --accent:#e9d8c3;
      font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    body{background:var(--grey); padding:24px;}
    .sheet{max-width:900px;margin:0 auto;background:white;padding:30px;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,0.06);page-break-after:always;}
    header{display:flex;align-items:center;gap:20px;border-bottom:6px solid var(--brown);padding-bottom:16px;margin-bottom:18px}
    .brand{display:flex;gap:16px;align-items:center}
  .logo{width:84px;height:42px;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff;border:1px solid #eee}
  .logo img{width:100%;height:100%;object-fit:contain}
    h1{margin:0;font-size:28px;color:var(--text)}
    .meta{margin-left:auto;text-align:right}
    .meta .small{font-size:13px;color:var(--muted)}

    .addresses{display:flex;gap:24px;margin-bottom:20px}
    .col{flex:1;padding:12px;border-radius:6px;background:linear-gradient(180deg,#fff, #fbfbfb);border:1px solid #eee}
    .col h3{margin:0 0 6px 0;color:var(--brown);font-size:14px}
    .col p{margin:0;color:var(--muted);font-size:13px;line-height:1.4}

    table{width:100%;border-collapse:collapse;margin-top:12px}
    thead th{background:var(--accent);text-align:left;padding:10px;font-size:13px;color:var(--text);border-bottom:1px solid #e6e6e6}
    tbody td{padding:10px;border-bottom:1px dashed #eee;font-size:13px;color:var(--text)}
    .text-right{text-align:right}
    .muted{color:var(--muted);font-size:12px}

    .totals{margin-top:14px;display:flex;justify-content:flex-end}
    .totals table{width:360px}
    .totals td{padding:8px;font-size:13px}
    .totals tr.total td{font-weight:700;border-top:2px solid #ddd}

    footer{margin-top:26px;font-size:13px;color:var(--muted);text-align:center}

    @media print{
      body{background:white}
      .sheet{box-shadow:none;border-radius:0}
      header{border-bottom:none}
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header>
      <div class="brand">
  <div class="logo"><img src="${logoUrl}" alt="${companyName} Logo" crossorigin="anonymous" onerror="this.style.display='none'; this.parentElement.textContent='${companyShort}';"/></div>
        <div>
          <h1>${companyName}</h1>
          <div class="muted">${companyTagline}</div>
        </div>
      </div>
      <div class="meta">
        <div class="small">Invoice No: <strong>${invoiceNumber}</strong></div>
        <div class="small">Invoice Date: <strong>${invoiceDate}</strong></div>
        <div class="small">HSN Code: <strong>${hsnCode}</strong></div>
      </div>
    </header>

    <div class="addresses">
      <div class="col">
        <h3>From</h3>
        <p>
          ${fromAddress}<br><br>
          Contact No: ${fromContact}<br>
          Email Id: ${fromEmail}<br>
          GSTIN: ${fromGstin}<br>
          PAN: ${fromPan}
        </p>
      </div>
      <div class="col">
        <h3>To</h3>
        <p>
          ${toName}<br>
          ${toAddress}<br>
          Contact No: ${toContact}<br>
          Email: ${toEmail}<br>
          GSTIN: ${toGstin}<br>
          PAN: ${toPan}
        </p>
      </div>
    </div>

    <section>
      <table>
        <thead>
          <tr>
            <th style="width:48px">S.L</th>
            <th style="width:120px">Date</th>
            <th>Order ID / Consignment</th>
            <th style="width:70px" class="text-right">Qty</th>
            <th style="width:110px" class="text-right">Total Amount (Rs)</th>
          </tr>
        </thead>
        <tbody id="items">
          ${orderRows}
        </tbody>
      </table>

      <div class="totals">
        <table>
          <tr>
            <td class="muted">BV</td>
            <td class="text-right">Rs. ${bv}</td>
          </tr>
          <tr>
            <td class="muted">CGST</td>
            <td class="text-right">Rs. ${cgst}</td>
          </tr>
          <tr>
            <td class="muted">SGST</td>
            <td class="text-right">Rs. ${sgst}</td>
          </tr>
          <tr>
            <td class="muted">IGST(18%)</td>
            <td class="text-right">Rs. ${igst}</td>
          </tr>
          <tr class="total">
            <td>Total Amount (With Tax)</td>
            <td class="text-right">Rs. ${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <p class="muted" style="margin-top:10px">Total Amount in Words: ${amountInWords}.</p>

    </section>

    <footer>
      <p class="muted">Details: Billing of ${billingPeriod}<br>This is a computer-generated invoice and does not require a signature.</p>
    </footer>
  </div>
</body>
</html>`
}

export default generateMonthlyInvoiceHtml

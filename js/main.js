/* ============================================================
   MyHomeRates.com — Main JavaScript
   Single shared file. All pages link to this.
   No inline scripts needed on any page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ── MOBILE NAV ──────────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      const icon   = this.querySelector('i');
      if (icon) icon.className = isOpen ? 'ti ti-x' : 'ti ti-menu-2';
    });

    // Close nav when a link is clicked (mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'ti ti-menu-2';
      });
    });
  }

  /* ── FAQ ACCORDION ───────────────────────────────────────── */
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const answer = this.nextElementSibling;
      const isOpen = this.classList.contains('open');

      // Close all open items
      document.querySelectorAll('.faq-q').forEach(function (b) {
        b.classList.remove('open');
        if (b.nextElementSibling) b.nextElementSibling.classList.remove('open');
      });

      // Open clicked item if it wasn't already open
      if (!isOpen) {
        this.classList.add('open');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ── MORTGAGE CALCULATOR ─────────────────────────────────── */
  const calcForm = document.getElementById('mortgageCalc');

  if (calcForm) {
    // Input elements
    const homePrice   = document.getElementById('homePrice');
    const downPct     = document.getElementById('downPct');
    const rateSlider  = document.getElementById('rateSlider');
    const loanTerm    = document.getElementById('loanTerm');

    // Display elements
    const homePriceDisplay = document.getElementById('homePriceDisplay');
    const downDisplay      = document.getElementById('downDisplay');
    const rateDisplay      = document.getElementById('rateDisplay');

    // Result elements
    const monthlyPayment = document.getElementById('monthlyPayment');
    const loanAmount     = document.getElementById('loanAmount');
    const totalInterest  = document.getElementById('totalInterest');
    const totalCost      = document.getElementById('totalCost');
    const pmiNote        = document.getElementById('pmiNote');

    function fmt(n) {
      return '$' + Math.round(n).toLocaleString('en-US');
    }

    function updateCalc() {
      const price    = parseFloat(homePrice.value);
      const downPctV = parseFloat(downPct.value);
      const down     = downPctV / 100;
      const rate     = parseFloat(rateSlider.value) / 100 / 12;
      const term     = parseInt(loanTerm.value) * 12;
      const loan     = price * (1 - down);
      const downAmt  = price * down;

      // Update display labels
      if (homePriceDisplay) homePriceDisplay.textContent = fmt(price);
      if (downDisplay)      downDisplay.textContent      = fmt(downAmt) + ' (' + downPctV + '%)';
      if (rateDisplay)      rateDisplay.textContent      = parseFloat(rateSlider.value).toFixed(2) + '%';

      // Calculate monthly payment
      let monthly;
      if (rate === 0) {
        monthly = loan / term;
      } else {
        monthly = loan * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      }

      const totalPaid    = monthly * term;
      const totalInt     = totalPaid - loan;
      const pmiRequired  = downPctV < 20;
      const pmiMonthly   = pmiRequired ? loan * 0.01 / 12 : 0;

      // Update results
      if (monthlyPayment) monthlyPayment.textContent = fmt(monthly);
      if (loanAmount)     loanAmount.textContent     = fmt(loan);
      if (totalInterest)  totalInterest.textContent  = fmt(totalInt);
      if (totalCost)      totalCost.textContent      = fmt(totalPaid);
      if (pmiNote)        pmiNote.textContent        = pmiRequired
        ? 'Yes — approx ' + fmt(pmiMonthly) + '/mo'
        : 'No (' + downPctV + '% down)';
    }

    // Attach listeners
    [homePrice, downPct, rateSlider, loanTerm].forEach(function (el) {
      if (el) el.addEventListener('input', updateCalc);
    });

    // Tab switching
    document.querySelectorAll('.calc-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        document.querySelectorAll('.calc-tab').forEach(function (t) {
          t.classList.remove('active');
        });
        this.classList.add('active');
        updateCalc();
      });
    });

    // Initialise
    updateCalc();
  }

  /* ── CONTACT FORM (Formspree) ────────────────────────────── */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const btn     = document.getElementById('submitBtn');
      const success = document.getElementById('formSuccess');

      if (btn) {
        btn.innerHTML  = '<i class="ti ti-loader-2"></i> Sending…';
        btn.disabled   = true;
      }

      try {
        const response = await fetch(this.action, {
          method:  'POST',
          body:    new FormData(this),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          contactForm.style.display = 'none';
          if (success) success.style.display = 'block';
        } else {
          throw new Error('Server error');
        }
      } catch (err) {
        if (btn) {
          btn.innerHTML         = '<i class="ti ti-alert-circle"></i> Something went wrong — please try again';
          btn.disabled          = false;
          btn.style.background  = '#dc2626';
        }
      }
    });
  }

  /* ── SMOOTH SCROLL OFFSET ────────────────────────────────── */
  // Adjusts anchor links to account for sticky nav height (62px)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ── ACTIVE NAV LINK ─────────────────────────────────────── */
  // Automatically marks the current page's nav link as active
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const linkPath = new URL(link.href, window.location.origin).pathname;
    // Match exact or folder index
    if (
      linkPath === currentPath ||
      (currentPath.endsWith('/') && linkPath === currentPath + 'index.html') ||
      (linkPath.endsWith('/index.html') && currentPath === linkPath.replace('index.html', ''))
    ) {
      link.classList.add('active');
    }
  });

});

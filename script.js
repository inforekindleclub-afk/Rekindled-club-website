// Rekindled Club — shared site behavior: nav scroll state, active-section highlighting, scroll-reveal animations

document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('nav.sitenav');

  // Nav reacts on scroll (shrinks slightly + stronger shadow)
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile hamburger nav — opens a full-screen overlay with the nav links
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var navCloseBtn = document.getElementById('navCloseBtn');
  var navLinksEl = document.getElementById('navLinks');
  function openMobileNav() {
    navLinksEl.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    navLinksEl.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (hamburgerBtn && navLinksEl) {
    hamburgerBtn.addEventListener('click', openMobileNav);
    if (navCloseBtn) navCloseBtn.addEventListener('click', closeMobileNav);
    navLinksEl.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMobileNav);
    });
  }

  // Swipeable card sliders (mobile) — dot pagination follows the swipe position.
  // Reused for both the Features cards and the founder photo collage.
  function setupSlider(containerEl, itemSelector, dotsEl) {
    if (!containerEl || !dotsEl) return;
    var dots = dotsEl.querySelectorAll('.dot');
    if (!dots.length) return;
    var syncDots = function () {
      var items = containerEl.querySelectorAll(itemSelector);
      var center = containerEl.scrollLeft + containerEl.clientWidth / 2;
      var closest = 0, closestDist = Infinity;
      items.forEach(function (item, i) {
        var itemCenter = item.offsetLeft + item.offsetWidth / 2;
        var dist = Math.abs(itemCenter - center);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === closest); });
    };
    containerEl.addEventListener('scroll', syncDots, { passive: true });
    syncDots();
  }
  setupSlider(document.getElementById('featuresGrid'), '.feature-card', document.getElementById('featuresDots'));
  setupSlider(document.getElementById('founderCollage'), '.ph', document.getElementById('founderDots'));

  // Join application form — submits straight to Brevo via fetch(), instead of relying on
  // Brevo's own widget script (main.js). That script throws an internal error the moment
  // this form is submitted (a bug on Brevo's end, confirmed by testing the exact same
  // request without their script — it succeeds), which silently blocked every submission.
  // This sends the same POST their script would have sent, then shows the matching message.
  var joinForm = document.getElementById('sib-form');
  if (joinForm) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      submitJoinForm(joinForm);
    });
  }

  function submitJoinForm(form) {
    var successMsg = document.getElementById('success-message');
    var errorMsg = document.getElementById('error-message');
    var submitBtn = form.querySelector('button[type="submit"]');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (successMsg) successMsg.classList.remove('is-visible');
    if (errorMsg) errorMsg.classList.remove('is-visible');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    var formData = new FormData(form);

    fetch(form.action, { method: 'POST', body: formData, mode: 'cors' })
      .then(function (response) {
        if (response.ok) {
          form.reset();
          if (successMsg) {
            successMsg.classList.add('is-visible');
            successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else if (errorMsg) {
          errorMsg.classList.add('is-visible');
        }
      })
      .catch(function () {
        if (errorMsg) errorMsg.classList.add('is-visible');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit application';
        }
      });
  }

  // Active-section highlighting in the nav as you scroll through the one-page layout
  var navLinks = document.querySelectorAll('.navlinks a.page');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href');
    if (id && id.charAt(0) === '#') {
      var el = document.querySelector(id);
      if (el) sections.push({ id: id, el: el, link: link });
    }
  });
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var match = sections.find(function (s) { return s.el === entry.target; });
          if (!match) return;
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            match.link.classList.add('active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (s) { sectionObserver.observe(s.el); });
  }

  // Scroll-reveal: fade + slide up as sections enter the viewport.
  // Elements are only "armed" (hidden pre-animation) here, once we know this
  // script actually ran — see the CSS comment above .reveal-armed for why.
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(function (el) { el.classList.add('reveal-armed'); });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }
});

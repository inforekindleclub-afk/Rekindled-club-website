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

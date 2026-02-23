(function () {
    
    document.addEventListener('DOMContentLoaded', function () {
        if (window.location.hash) {
            var target = document.querySelector(window.location.hash);
            if (target) {
                var hdr = document.getElementById('page-header');
                var offset = hdr ? hdr.offsetHeight : 52;
                var top = target.getBoundingClientRect().top + window.scrollY - offset - 8;
                window.scrollTo({ top: top, behavior: 'instant' });
            }
        }
        
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                document.documentElement.classList.add('page-ready');
            });
        });
    });

    var toggle = document.getElementById('mobile-menu-toggle');
    var panel = document.getElementById('mobile-menu-panel');
    if (!toggle || !panel) return;

    var header = document.getElementById('page-header');

    function closeMenu() {
        panel.classList.remove('is-open');
        toggle.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        panel.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open');
        if (header) header.classList.remove('menu-panel-open');
    }

    function openMenu() {
        panel.classList.add('is-open');
        toggle.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        panel.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
        if (header) header.classList.add('menu-panel-open');
    }

    
    if (header) {
        var scrollThreshold = 40;
        function onScroll() {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll(); 
    }

    toggle.addEventListener('click', function () {
        if (panel.classList.contains('is-open')) closeMenu();
        else openMenu();
    });

    panel.addEventListener('click', function (event) {
        var link = event.target.closest('a,button');
        if (!link) return;

        var href = link.getAttribute('href');

        
        if (!href) { closeMenu(); return; }

        
        if (href.charAt(0) === '#') {
            event.preventDefault();
            closeMenu();
            var target = document.querySelector(href);
            if (target) {
                var headerHeight = header ? header.offsetHeight : 0;
                var top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            return;
        }

        
        event.preventDefault();
        closeMenu();
        document.body.style.transition = 'opacity 0.22s ease';
        document.body.style.opacity   = '0';
        setTimeout(function () { window.location.href = href; }, 230);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) closeMenu();
    });
})();

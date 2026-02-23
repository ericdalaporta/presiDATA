class AnimationManager {
    constructor() {
        this.isAnimating = false;
        this.init();
    }

    init() {
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
    }

    animatePageEntry() {
        
    }

    
    animatePresidentSelection(selection, isFirstSearch, callback) {
        const presidentes = Array.isArray(selection)
            ? selection.filter(Boolean)
            : [selection].filter(Boolean);

        if (presidentes.length === 0) {
            console.warn('⚠️ Nenhum presidente válido para animar');
            return;
        }

        const primeiroPresidente = presidentes[0];

        this.isAnimating = true;
        console.log('🔒 Iniciando animação para', primeiroPresidente.nome, '- bloqueando novas execuções');
        
        const resultsArea = document.getElementById('area-resultados');
        
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isFirstSearch) {
            console.log('🎬 PRIMEIRA PESQUISA - Trocando tutorial por resultado');

            const tutorialSection = document.querySelector('.instructions-section');

            if (tutorialSection && typeof gsap !== 'undefined') {
                const tl = gsap.timeline({
                    onComplete: () => {
                        tutorialSection.classList.add('is-hidden');
                        gsap.set(tutorialSection, { clearProps: 'all' });
                        if (resultsArea) {
                            resultsArea.innerHTML = '';
                            callback(presidentes);
                        }
                        this.isAnimating = false;
                    }
                });

                
                const tutorialCards = tutorialSection.querySelectorAll('.instruction-card, .info-card, [class*="card"]');
                if (tutorialCards.length > 0) {
                    tl.to(tutorialCards, {
                        opacity: 0,
                        y: -18,
                        scale: 0.94,
                        duration: 0.2,
                        ease: 'power3.in',
                        stagger: { each: 0.04, from: 'start' }
                    });
                    tl.to(tutorialSection, {
                        opacity: 0,
                        duration: 0.12,
                        ease: 'power1.in'
                    }, '-=0.05');
                } else {
                    tl.to(tutorialSection, {
                        opacity: 0,
                        y: -14,
                        scale: 0.97,
                        duration: 0.28,
                        ease: 'power3.in'
                    });
                }

            } else {
                if (tutorialSection) tutorialSection.classList.add('is-hidden');
                setTimeout(() => {
                    if (resultsArea) {
                        resultsArea.innerHTML = '';
                        callback(presidentes);
                    }
                    this.isAnimating = false;
                }, 250);
            }
            
        } else {
            console.log('⚡ PESQUISAS SEGUINTES - Só trocando presidente');
            
            if (resultsArea) {
                callback(presidentes);
            }

            this.isAnimating = false;
            console.log('🔓 Pesquisa seguinte finalizada - liberando novas execuções');
        }
    }

 
    animateStats() {
        const statNumbers = document.querySelectorAll('[data-count]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const count = parseInt(target.dataset.count);
                    
                    if (typeof gsap !== 'undefined') {
                        gsap.fromTo(target, {
                            textContent: 0
                        }, {
                            textContent: count,
                            duration: 2,
                            ease: "power2.out",
                            snap: { textContent: 1 },
                            onUpdate: function() {
                                target.textContent = Math.ceil(target.textContent);
                            }
                        });
                    }
                    
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    initScrollAnimations() {
        
    }

    isCurrentlyAnimating() {
        return this.isAnimating;
    }
}

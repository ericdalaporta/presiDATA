class AnimationManager {
    constructor() {
        this.isAnimating = false;
        this.init();
    }

    init() {
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-out-cubic',
                once: false,
                offset: 50
            });
        }
    }


    animatePageEntry() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline();
        
        tl.fromTo('.search-card', {
            y: 50,
            opacity: 0,
            scale: 0.95
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power3.out"
        });
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
        
        const container = document.querySelector('.container');
        if (container) {
            container.style.minHeight = container.offsetHeight + 'px';
        }
        
        if (isFirstSearch) {
            console.log('🎬 PRIMEIRA PESQUISA - Animando tutoriais');

            const tutorialCards = document.querySelectorAll('.instruction-item');
            const tutorialTitle = document.querySelector('.instructions-title');
            
            const mainTimeline = gsap.timeline();

            mainTimeline.to(tutorialTitle, {
                opacity: 0,
                y: 50,
                duration: 0.4,
                ease: "power2.inOut"
            });

            tutorialCards.forEach((card, index) => {
                mainTimeline.to(card, {
                    opacity: 0,
                    y: 80,
                    duration: 0.5,
                    ease: "power2.inOut"
                }, `-=${index === 0 ? 0.15 : 0.2}`);
            });

            mainTimeline.to({}, { duration: 0.8 });

            mainTimeline.call(() => {
                const tutorialSection = document.querySelector('.instructions-section');
                if (tutorialSection) {
                    tutorialSection.style.display = 'none';
                }
            });

            mainTimeline.call(() => {
                if (resultsArea) {
                    resultsArea.innerHTML = '';
                    callback(presidentes);
                }
            }, null, "+=0.5");
            
            mainTimeline.call(() => {
                this.isAnimating = false;
                if (container) {
                    container.style.minHeight = 'auto';
                }
                console.log('🔓 Animação finalizada - liberando novas execuções');
            });
            
        } else {
            console.log('⚡ PESQUISAS SEGUINTES - Só trocando presidente');
            
            if (resultsArea) {
                callback(presidentes);
            }

            if (container) {
                container.style.minHeight = 'auto';
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
        if (typeof gsap === 'undefined') return;

        gsap.utils.toArray('.instruction-item').forEach((item, index) => {
            gsap.fromTo(item, {
                y: 50,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    end: "bottom 15%",
                    toggleActions: "play none none reverse"
                }
            });
        });
    }

    isCurrentlyAnimating() {
        return this.isAnimating;
    }

    captureContainerTop() {
        const container = document.querySelector('.container');
        if (!container) return;
        this.lastContainerTop = container.getBoundingClientRect().top;
    }

}


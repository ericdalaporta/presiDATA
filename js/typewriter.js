class TypewriterEffect {
    constructor(element) {
        this.element = element;
        this.phrases = [
            'Digite o nome de um presidente...',
            'Ex: Getúlio Vargas',
            'Ex: Jair Bolsonaro',
            'Ex: Fernando Henrique',
            'Ex: Dilma Rousseff',
        ];
        this.currentPhraseIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.isWaiting = false;
        this.isActive = true;
        this.animationId = null;

        this.typeSpeed = 120;
        this.deleteSpeed = 80;
        this.waitTime = 2500;

        if (this.element) {
            this.element.placeholder = '';
        }
        this.start();
    }

    start() {
        if (this.isActive) {
            this.type();
        }
    }

    type() {
        if (!this.isActive) return;

        const currentPhrase = this.phrases[this.currentPhraseIndex];

        if (this.isWaiting) {
            this.animationId = setTimeout(() => {
                if (!this.isActive) return;
                this.isWaiting = false;
                this.isDeleting = true;
                this.type();
            }, this.waitTime);
            return;
        }

        if (this.isDeleting) {
            if (this.currentCharIndex > 0) {
                this.currentCharIndex--;
                if (this.element) {
                    this.element.placeholder = currentPhrase.slice(0, this.currentCharIndex);
                }
                this.animationId = setTimeout(() => this.type(), this.deleteSpeed);
            } else {
                this.isDeleting = false;
                this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
                this.animationId = setTimeout(() => this.type(), 500);
            }
        } else {
            if (this.currentCharIndex < currentPhrase.length) {
                this.currentCharIndex++;
                if (this.element) {
                    this.element.placeholder = currentPhrase.slice(0, this.currentCharIndex);
                }
                this.animationId = setTimeout(() => this.type(), this.typeSpeed);
            } else {
                this.isWaiting = true;
                this.type();
            }
        }
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            clearTimeout(this.animationId);
            this.animationId = null;
        }
        if (this.element) {
            this.element.placeholder = '';
        }
    }
}


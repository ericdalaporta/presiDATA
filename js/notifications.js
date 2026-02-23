class NotificationManager {
    constructor() {
        this.container = this._createContainer();
    }

    _createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        this.container.appendChild(notification);

        
        requestAnimationFrame(() => notification.classList.add('notification-visible'));

        if (duration > 0) {
            setTimeout(() => {
                notification.classList.remove('notification-visible');
                notification.classList.add('notification-hiding');
                notification.addEventListener('transitionend', () => notification.remove(), { once: true });
            }, duration);
        }
    }

    success(message, duration = 3000) { this.show(message, 'success', duration); }
    error(message, duration = 3000)   { this.show(message, 'error', duration); }
    warning(message, duration = 3000) { this.show(message, 'warning', duration); }
    info(message, duration = 3000)    { this.show(message, 'info', duration); }
}

const notificationManager = new NotificationManager();

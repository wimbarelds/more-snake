const Alert = (content: string, title = 'Alert', okText = 'OK') => {
    return new Promise((resolve, reject) => {
        const $container = document.createElement('div');
        $container.classList.add('overlay__container');
        $container.innerHTML = `
            <div class="overlay__backdrop"></div>
            <div class="overlay__content modal">
                <div class="modal__title">
                    <h2>${title}</h2>
                    <button class="modal__close">&times;</button>
                </div>
                <div class="modal__body">
                    <p>${content}</p>
                </div>
                <div class="modal__actions">
                    <button type="button" class="modal__actions__ok">${okText}</button>
                </div>
            </div>
        `;

        document.body.appendChild($container);
        const close = function() {
            document.body.removeChild($container);
            resolve();
        };

        const selectors = [
            '.overlay__backdrop',
            '.modal__close',
            '.modal__actions__ok',
        ];

        $container.querySelectorAll(selectors.join(', ')).forEach((btn) => btn.addEventListener('click', close));
    });
};

const Confirm = (content: string, title = 'Confirm', yesText = 'Yes', noText = 'No') => {
    return new Promise((resolve, reject) => {
        const $container = document.createElement('div');
        $container.classList.add('overlay__container');
        $container.innerHTML = `
            <div class="overlay__backdrop"></div>
            <div class="overlay__content modal">
                <div class="modal__title">
                    <h2>${title}</h2>
                </div>
                <div class="modal__body">
                    <p>${content}</p>
                </div>
                <div class="modal__actions">
                    <button type="button" class="modal__actions__yes">${yesText}</button>
                    <button type="button" class="modal__actions__no">${noText}</button>
                </div>
            </div>
        `;

        document.body.appendChild($container);
        const close = function(value: boolean) {
            document.body.removeChild($container);
            resolve(value);
        };

        const btnYes = $container.querySelector('.modal__actions__yes') as HTMLButtonElement;
        btnYes.addEventListener('click', close.bind(window, true));

        const btnNo = $container.querySelector('.modal__actions__no') as HTMLButtonElement;
        btnNo.addEventListener('click', close.bind(window, false));
    });
};

export { Alert, Confirm };

window.addEventListener('DOMContentLoaded', function () {

    // Tabs

    let tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {

        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', function (event) {
        const target = event.target;
        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    //Timer

    const deadline = '2022-06-20';

    function getTimeRemaining(endtime) {
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - Date.parse(new Date());
        if (t <= 0) {
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        } else {
            days = Math.floor(t / (1000 * 60 * 60 * 24));
            hours = Math.floor((t / (1000 * 60 * 60) % 24));
            minutes = Math.floor((t / 1000 / 60) % 60);
            seconds = Math.floor((t / 1000) % 60);
        }


        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        updateClock(); // вызов для того, чтобы не моргал таймер

        function updateClock() {
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }

    }

    setClock('.timer', deadline);

    //создание модального окна

    const modalTrigger = document.querySelectorAll('[data-modal]'),
        modal = document.querySelector('.modal');

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        //modal.classList.toggle('show');
        document.body.style.overflow = 'hidden';
        //clearInterval(modalTimerId);
    }

    modalTrigger.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        //modal.classList.toggle('show');
        document.body.style.overflow = '';
    }



    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === "Escape" && modal.classList.contains('show')) {
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 50000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);


    // Используем классы для карточек

    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            element.innerHTML = `
                    <img src=${this.src} alt=${this.alt}>
                    <h3 class="menu__item-subtitle">${this.title}</h3>
                    <div class="menu__item-descr">${this.descr}</div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена:</div>
                        <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                    </div>
            `;
            this.parent.append(element);
        }
    }

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({ img, altimg, title, descr, price }) => {
                new MenuCard(img, altimg, title, descr, price, ".menu .container").render();
            });
        });

    // Forms

    const forms = document.querySelectorAll('form');
    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с вами свяжемся',
        failure: 'Что-то пошло не так...'
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        });

        return await res.json();
    };

    async function getResource(url) {
        let res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    }

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            form.insertAdjacentElement('afterend', statusMessage);

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
                .then(data => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                }).catch(() => {
                    showThanksModal(message.failure);
                }).finally(() => {
                    form.reset();
                });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }


    //Slider

    let slideIndex = 1;
    let offset = 0;
    const slides = document.querySelectorAll('.offer__slide'),
        slider = document.querySelector('.offer__slider'),
        prev = document.querySelector('.offer__slider-prev'),
        next = document.querySelector('.offer__slider-next'),
        total = document.querySelector('#total'),
        current = document.querySelector('#current'),
        slidesWrapper = document.querySelector('.offer__slider-wrapper'),
        slidesField = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slidesWrapper).width;

    if (slides.length < 10) {
        total.textContent = `0${slides.length}`;
        current.textContent = `0${slideIndex}`;
    } else {
        total.textContent = slides.length;
        current.textContent = slideIndex;
    }

    slidesField.style.width = 100 * slides.length + '%';
    slides.forEach(slide => slide.style.width = width);
    slidesField.style.display = 'flex';
    slidesField.style.transition = '0.5s all';
    slidesWrapper.style.overflow = 'hidden';

    slides.forEach(slide => {
        slide.style.width = width;
    });

    /* создание точек внизу у слайдера */
    slider.style.position = 'relative';
    //создание обертки внутри js для точек
    const indicators = document.createElement('ol'),
        dots = [];

    indicators.classList.add('carousel-indicators');
    //добавление стилей css для блока
    indicators.style.cssText = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;
    slider.append(indicators);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.style.cssText = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;
        if (i == 0) {
            dot.style.opacity = 1;
        }

        indicators.append(dot);
        dots.push(dot);
    }
    // ф-я, к-я переводит строку в число и удаляет все нецифры
    function deleteNotDigits(str) {
        return +str.replace(/\D/g, '');
    }

    function opacityDots(arr) {
        //перебор массива с точками и каждой задать 50% прозрачности
        arr.forEach(dot => dot.style.opacity = '.5');
        //при перелистовании слайдов на текущем делать 1
        arr[slideIndex - 1].style.opacity = 1;
    }
    // ф-я прибавляет ноль впереди,если номер слайда меньше 10
    // иначе просто выводит номер слайда
    function showNumberSlides() {
        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    }


    next.addEventListener('click', () => {

        if (offset == deleteNotDigits(width) * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += deleteNotDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        showNumberSlides();

        opacityDots(dots);
    });

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = deleteNotDigits(width) * (slideTo - 1);

            slidesField.style.transform = `translateX(-${offset}px)`;

            showNumberSlides();

            opacityDots(dots);

        });
    });

    prev.addEventListener('click', () => {

        if (offset == 0) {
            offset = deleteNotDigits(width) * (slides.length - 1);
        } else {
            offset -= deleteNotDigits(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }

        showNumberSlides();

        opacityDots(dots);
    });

    /* showSlides(slideIndex);

    if (slides.length < 10) {
        total.textContent = `0${slides.length}`;
    } else {
        total.textContent = slides.length;
    }

    function showSlides(n) {
        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }

        slides.forEach((item) => item.style.display = 'none');

        slides[slideIndex - 1].style.display = 'block'; // Как ваша самостоятельная работа - переписать на использование классов show/hide

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    }

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    prev.addEventListener('click', function () {
        plusSlides(-1);
    });

    next.addEventListener('click', function () {
        plusSlides(1);

    }); */



    // Calc

    const result = document.querySelector('.calculating__result span');
    let sex, height, weight, age, ratio;

    //получение знач-я из localStorage и сохр на странице
    // если знач-е ключа 'sex' - true, то перезаписываем переменную sex
    if (localStorage.getItem('sex')) {
        sex = localStorage.getItem('sex');
    } else {
        sex = 'female';// иначе знач-е по умолч-ю
        localStorage.setItem('sex', 'female');//запись в хранилище знач-я по умолчанию
    }

    if (localStorage.getItem('ratio')) {
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 1.375;// иначе знач-е по умолч-ю
        localStorage.setItem('ratio', 1.375);//запись в хранилище знач-я по умолчанию
    }

    //общая ф-я для подсчета 
    function calcTotal() {
        // проверка, чтобы все пункты были заполнены
        if (!sex || !height || !weight || !age || !ratio) {
            result.textContent = '____';
            return;
        }

        if (sex === 'female') {
            result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else {
            result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }

    }
    calcTotal();

    //ф-я для инициализации полученных данных из хранилища и вывода на стр
    function initLocalSettings(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.classList.remove(activeClass);//удаляем у всех эл-нтов класс актив
            //проверка, если у эл-нта знач-е id совпадает со знач-ем в храниище, то
            if (elem.getAttribute('id') === localStorage.getItem('sex')) {
                elem.classList.add(activeClass);// добавляем класс актив
            }

            if (elem.getAttribute('data-ratio') === localStorage.getItem('ratio')) {
                elem.classList.add(activeClass);// добавляем класс актив
            }
        });
    }

    initLocalSettings('#gender div', 'calculating__choose-item_active');
    initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');



    //ф-я, к-я будет получать инфу со статических блоков

    function getStaticInformation(selector, activeClass) {
        // поиск на стр всех эл-нтов div у родителя parentSelector
        const elements = document.querySelectorAll(selector);
        //делегирование в этом случае не работает, поэтому навешиваем обр.события 
        // на каждый эл-нт отдельно
        // с помощью метода forEach перебираем эл-нты 
        elements.forEach((elem) => {
            elem.addEventListener('click', (e) => {
                //проверка на наличие атрибута data-ratio
                if (e.target.getAttribute('data-ratio')) {
                    // вытаскиваем знач-е data-ratio при клике и переводим в число
                    ratio = +e.target.getAttribute('data-ratio');
                    //запись в localStorage знач-е кофф., к-ый выбрал пользователь
                    localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
                } else {
                    // иначе выбираем пол мужчина либо женщина и вытаскиваем id
                    sex = e.target.getAttribute('id');
                    //запись в localStorage знач-е пола, к-ый выбрал пользователь
                    localStorage.setItem('sex', e.target.getAttribute('id'));
                }

                // перебираем весь массив с эл-нтами и удаляем у них класс актив

                elements.forEach((elem) => {
                    elem.classList.remove(activeClass);
                });
                //затем при клике на эл-нт добавляем класс актив
                e.target.classList.add(activeClass);
                //необходимо запускать ф-ю для пересчета каллорий после каждых измен-й от пользователя
                calcTotal();
            });
        });
    }

    getStaticInformation('#gender div', 'calculating__choose-item_active');
    //ставим . в селекторе,если это класс
    getStaticInformation('.calculating__choose_big div', 'calculating__choose-item_active');


    // ф-я, к-ая будет обрабатывать каждый отдельный input
    function getDynamicInformation(selector) {
        //поиск input по селектору
        const input = document.querySelector(selector);
        // навешиваем обр.события на input
        input.addEventListener('input', () => {
            //проверка знач-я  input на нечисло и 
            // поле ввода подсвечивается красным, если нечисло
            if (input.value.match(/\D/g)) {
                input.style.border = '1px solid red';
            } else {
                // если пользователь изменил на цифры, то убрать рамку
                input.style.border = 'none';
            }


            // проверка input на id
            switch (input.getAttribute('id')) {
                case 'height':
                    // если id = height, то переменная height = знач-ю в input
                    height = +input.value;
                    break; // остановка
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }
            //необходимо запускать ф-ю для пересчета каллорий после каждых измен-й от пользователя
            calcTotal();
        });



    }

    getDynamicInformation('#height');
    getDynamicInformation('#weight');
    getDynamicInformation('#age');
}); 
function calc() {
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

}

export default calc;
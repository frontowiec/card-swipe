(function () {

    const body = document.getElementsByTagName('body')[0];
    const squares = document.querySelectorAll('.square');

    let toggle = true;

    let translate = 0;
    let center = 1;
    let canSwipeLeft = true;
    let canSwipeRight = true;

    squares.forEach(square => {
        new Hammer(square)
            .on('tap', scaleSquare)
            .on('swipeleft swiperight', swipeSquare);
    });

    function scaleSquare({target}) {
        if (!target.classList.contains('center')) {
            return;
        }

        toggle ? scaleUp(target) : scaleDown(target);

        toggle = !toggle;
    }

    function swipeSquare({type}) {
        if (type === 'swipeleft' && canSwipeLeft) {
            center++;
            translate = translate - 324;
            canSwipeRight = true;

            squares.forEach((squareEl, index) => {
                if (index === center) {
                    squareEl.classList.add('center');
                    changeBodyBg(squareEl, index);
                    blockSwipeOnEdge(index);
                } else {
                    squareEl.classList.remove('center');
                }

                swipeLeft(squareEl);
            });
        }

        if (type === 'swiperight' && canSwipeRight) {
            center--;
            translate = translate + 324;
            canSwipeLeft = true;

            squares.forEach((squareEl, index) => {
                if (index === center) {
                    squareEl.classList.add('center');
                    changeBodyBg(squareEl, index);
                    blockSwipeOnEdge(index);
                } else {
                    squareEl.classList.remove('center');
                }

                swipeRight(squareEl);
            });
        }
    }

    const scaleUp = el => {
        const translateX = getTranslateX(el);

        el.style.zIndex = '9';
        el.style.transform = `matrix(2.1, 0, 0, 2.1, ${translateX}, 0)`;

        setTimeout(() => {
            el.style.transform = `matrix(2, 0, 0, 2, ${translateX}, 0)`;
        }, 250);
    };

    const scaleDown = el => {
        const translateX = getTranslateX(el);

        el.style.zIndex = '1';
        el.style.transform = `matrix(.9, 0, 0, .9, ${translateX}, 0)`;

        setTimeout(() => {
            el.style.transform = `matrix(1, 0, 0, 1, ${translateX}, 0)`;
        }, 250);
    };

    const swipeLeft = el => {
        el.style.transform = `matrix(1, 0, 0, 1, ${translate - 30}, 0)`;

        setTimeout(() => {
            el.style.transform = `matrix(1, 0, 0, 1, ${translate}, 0)`;
        }, 200);
    };

    const swipeRight = el => {
        el.style.transform = `matrix(1, 0, 0, 1, ${translate + 30}, 0)`;

        setTimeout(() => {
            el.style.transform = `matrix(1, 0, 0, 1, ${translate}, 0)`;
        }, 200);
    };

    const blockSwipeOnEdge = index => {
        // right edge
        if (index === squares.length - 1) {
            canSwipeLeft = false;
        }

        // left edge
        if (index === 0) {
            canSwipeRight = false;
        }
    };

    const getTranslateX = (myElement) => {
        // https://caniuse.com/#search=DOMMatrix
        const style = window.getComputedStyle(myElement);
        const matrix = new WebKitCSSMatrix(style.webkitTransform);
        return matrix.m41;
    };

    const changeBodyBg = (el, index) => {
        // todo: na podstawie koloru elementu
        switch (index) {
            case 0:
                body.style.backgroundColor = '#9878df';
                break;
            case 1:
                body.style.backgroundColor = '#698FF9';
                break;
            case 2:
                body.style.backgroundColor = '#ccc8a1';
                break;
        }
    };

})();
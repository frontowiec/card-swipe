(function () {
    const {fromEvent, merge} = Rx.Observable;

    const body = document.getElementsByTagName('body')[0];
    const squares = document.querySelectorAll('.square');

    const fromHammerEvent = event => [...squares].map(square => fromEvent(new Hammer(square), event));

    const registeredSquaresTap$ = fromHammerEvent('tap');
    const registeredSquaresSwipeLeft$ = fromHammerEvent('swipeleft');
    const registeredSquaresSwipeRight$ = fromHammerEvent('swiperight');

    // SWIPE

    const swipeLeft$ = merge(...registeredSquaresSwipeLeft$)
        .mapTo(1);

    const swipeRight$ = merge(...registeredSquaresSwipeRight$)
        .mapTo(-1);

    const swipe$ = merge(swipeLeft$, swipeRight$);

    const centerIndex$ = swipe$
        .scan((acc, val) => {
            const index = acc + val;
            if (index < 0 || index > 2) {
                return acc;
            }
            return index;
        }, 1)
        .distinctUntilChanged();

    const translate$ = centerIndex$.withLatestFrom(swipe$)
        .map(val => val[1])
        .scan((acc, val) => acc + (val * -324), 0)
        .startWith(0);

    const translateTmp$ = swipe$.withLatestFrom(translate$)
        .distinctUntilChanged(
            (oldVal, newVal) => oldVal[0] === newVal[0] && oldVal[1] === newVal[1]
        )
        .scan((acc, val) => {
            const position = val[0];
            const translate = val[1];
            return translate - (30 * position);
        }, 0);

    const swipe = (els, translate) => {
        els.forEach(el => {
            el.style.transform = `matrix(1, 0, 0, 1, ${translate}, 0)`;
        });
    };

    centerIndex$
        .subscribe(index => {
            markAsCenter(squares, index);
            changeBodyBg(index);
        });

    translate$
        .debounceTime(200)
        .subscribe(translate => swipe(squares, translate));

    translateTmp$
        .subscribe(translate => swipe(squares, translate));

    const markAsCenter = (els, index) => {
        els.forEach(el => el.classList.remove('center'));
        els[index].classList.add('center');
    };

    const changeBodyBg = (index, el) => {
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

    // TAP

    const taps$ = merge(...registeredSquaresTap$);

    const toggle$ = taps$.scan(val => !val, false);

    const centerSquare$ = taps$
        .map(({target}) => target)
        .filter(target => target.classList.contains('center'))
        .withLatestFrom(toggle$, translate$)
        .map(values => ({target: values[0], toggle: values[1], translateX: values[2]}))
        .partition(val => val.toggle);

    centerSquare$[0] // scaleUp$
        .do(({target, translateX}) => {
            target.style.zIndex = '9';
            target.style.transform = `matrix(2.1, 0, 0, 2.1, ${translateX}, 0)`;
        })
        .debounceTime(250)
        .do(({target, translateX}) => {
            target.style.transform = `matrix(2, 0, 0, 2, ${translateX}, 0)`;
        })
        .subscribe();

    centerSquare$[1] // scaleDown$
        .do(({target, translateX}) => {
            target.style.zIndex = '1';
            target.style.transform = `matrix(.9, 0, 0, .9, ${translateX}, 0)`;
        })
        .debounceTime(250)
        .do(({target, translateX}) => {
            target.style.transform = `matrix(1, 0, 0, 1, ${translateX}, 0)`;
        })
        .subscribe();

})();
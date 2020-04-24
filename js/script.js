const video = document.querySelector('.video');
const elementContainer = document.querySelector('.element-container');
const timeline = document.querySelector('.timeline');
let useBar = [];
let useEl = [];
let element = 0;
const controlBtn = ['Delete'];
let rotateDot = '';

setAttributes = (el, attrs) => {
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
};

addTimeLine = (inputValue) => {
    const container = document.createElement('div');
    const barContainer = document.createElement("div");
    const bar = document.createElement('div');
    const selectMoment = document.createElement('div');
    const textarea = document.createElement('div');
    setAttributes(textarea, {
        class: 'infoBar',
        id: `textareaBar-${element}`,
    });

    setAttributes(barContainer, {
        class: 'timeline-element',
        id: `timelineElement-${element}`,
    });
    setAttributes(selectMoment, {
        class: 'select-moment',
        'data-toggle': 'tooltip',
        title: `${inputValue}`,
        id: `timeline-${element}`,
    });
    setAttributes(bar, {class: 'timeline-bar', draggable: false});
    setAttributes(container, {id: `timelineContainer-${element}`});

    textarea.innerHTML = inputValue;
    useBar.push({timelineId: container.id, barId: barContainer.id, momentId: selectMoment.id, textareaId: textarea.id});
    controlBtn.forEach(el => {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = `${el}`;
        setAttributes(deleteBtn, {id: `btn${el}-${element}`});
        deleteBtn.addEventListener('click', deleteElement, true);
        container.appendChild(deleteBtn)
    });

    $(function () {
        $(`#${selectMoment.id}`).resizable({
            handles: 'e, w',
            containment: '.timeline-element',
            resize: function () {
                const el = document.getElementById(selectMoment.id);
                const wrapper = document.getElementById(barContainer.id);

                el.style.width = el.offsetWidth * 100 / wrapper.offsetWidth + '%';
                el.style.height = el.offsetHeight * 100 / wrapper.offsetHeight + '%';
            }
        });
    });

    $(function () {
        $(`#${selectMoment.id}`).draggable({
            axis: 'x', containment: `#${barContainer.id}`, stop: function () {
                const el = document.getElementById(selectMoment.id);
                const wrapper = document.getElementById(barContainer.id);
                el.style.left = el.offsetLeft * 100 / wrapper.offsetWidth + '%';
            }
        });
    });

    selectMoment.appendChild(textarea);
    barContainer.appendChild(bar);
    barContainer.appendChild(selectMoment);
    timeline.appendChild(container);
    container.appendChild(barContainer);
    element++;

    const el = document.getElementById(selectMoment.id);

    el.addEventListener("mousedown", () => {
        timeUpdate()
    });
};

rotateNWDot = (event, div, type) => {
    let degreeAdd;
    switch (type) {
        case 'nw':
            degreeAdd = 140;
            break;
        case 'ne':
            degreeAdd = 20;
            break;
        case 'sw':
            degreeAdd = 200;
            break;
        case 'se':
            degreeAdd = -40;
            break;
    }
    const // get center of div to rotate
        pw = document.getElementById(div.id),
        pwBox = pw.getBoundingClientRect(),
        center_x = (pwBox.left + pwBox.right) / 2,
        center_y = (pwBox.top + pwBox.bottom) / 2,
        // get mouse position
        mouse_x = event.pageX,
        mouse_y = event.pageY,
        radians = Math.atan2(mouse_x - center_x, mouse_y - center_y),
        degree = Math.round((radians * (180 / Math.PI) * -1) + 100);

    let rotateCSS = 'rotate(' + (degree + degreeAdd) + 'deg)';

    document.getElementById(div.id).style.transform = rotateCSS;
};

createElement = () => {
    const div = document.createElement("div");
    const textarea = document.createElement('textarea');
    const rotateDotNW = document.createElement('div');
    const rotateDotSW = document.createElement('div');
    const rotateDotNE = document.createElement('div');
    const rotateDotSE = document.createElement('div');
    setAttributes(div, {draggable: 'true', class: 'drag-element', id: `moment-${element}`, ondragstart: 'drag(event)'});
    setAttributes(rotateDotNW, {class: 'rotate-dot', id: 'nw', onmousedown: 'selectRotateDot(event)'});
    setAttributes(rotateDotSW, {class: 'rotate-dot', id: 'sw', onmousedown: 'selectRotateDot(event)'});
    setAttributes(rotateDotNE, {class: 'rotate-dot', id: 'ne', onmousedown: 'selectRotateDot(event)'});
    setAttributes(rotateDotSE, {class: 'rotate-dot', id: 'se', onmousedown: 'selectRotateDot(event)'});
    setAttributes(textarea, {
        class: 'info',
        placeholder: 'Text...',
        id: `textarea-${element}`,
        onchange: 'changeValue(event)',
        draggable: false
    });

    div.appendChild(textarea);
    div.appendChild(rotateDotNW);
    div.appendChild(rotateDotSW);
    div.appendChild(rotateDotNE);
    div.appendChild(rotateDotSE);
    elementContainer.appendChild(div);

    $(`#${div.id}`).draggable({
        handle: `#${div.id}`,
        containment: `.video`
    });

    $(`#${div.id}`).draggable({
        handle: `.rotate-dot`,
        opacity: 0.001,
        helper: 'clone',
        drag: function (event) {
            rotateNWDot(event, div, rotateDot)
        }
    });
};

createElement();

selectRotateDot = (event) => {
    rotateDot = event.target.id
};

allowDrop = ev => {
    ev.preventDefault();
};

drag = ev => {
    ev.stopPropagation();
    const style = window.getComputedStyle(ev.target, null);
    ev && ev.dataTransfer && ev.dataTransfer.setData("text", [ev.target.id, ev.layerX, parseInt(style.getPropertyValue('top')) - ev.y, ev.layerY, ev.target.children[0].id]);
};

drop = ev => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text").split(',');
    endDrop(ev, data);
    timeUpdate();
    $(function () {
        $(`#${data[0]}`).resizable({
            handles: 'nw, ne, sw, se',
            containment: '.video',
            resize: function () {
                const el = document.getElementById(data[0]);
                const wrapper = document.getElementById('video-wrapper');
                el.style.width = el.offsetWidth * 100 / wrapper.offsetWidth + '%';
                el.style.height = el.offsetHeight * 100 / wrapper.offsetHeight + '%';
            }
        });
    });

};

endDrop = (ev, data) => {
    const dragElement = document.getElementById(data[0]);
    const rightSide = dragElement && ev.layerX - parseInt(data[1]) <= video.offsetWidth - dragElement.offsetWidth;
    const left = ev.layerX - parseInt(data[1]) > 0;
    const bottom = dragElement && ev.layerY - parseInt(data[3]) <= video.offsetHeight - dragElement.offsetHeight;
    const top = ev.layerY - parseInt(data[3]) >= 0;
    if (rightSide && left && bottom && top && !ev.target.id.includes('textarea')) {
        ev.target.parentNode.appendChild(dragElement);
        dragElement.style.left = parseInt(data[1]) < ev.layerX && ((ev.layerX - parseInt(data[1])) / video.offsetWidth) * 100 + '%';
        dragElement.style.top = (ev.offsetY + parseInt(data[2], 10)) / video.offsetHeight * 100 + '%';
        afterDrop(data)
    }
};

afterDrop = (data) => {
    const inputValue = document.getElementById(data[0]).children[0];
    if (elementContainer.children.length === 0) {
        useEl.push({id: data[0], textareaId: data[4]});
        addTimeLine(inputValue.value);
        createElement();
    }
};


allowDropTimeline = ev => {
    ev.preventDefault();
};

dragTimeline = ev => {
    ev.dataTransfer.setData("text", [ev.target.id, ev.layerX]);
};

dropTimeline = ev => {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text").split(',');
    const left = ev.layerX - parseInt(data[1]) > 0;
    const right = ev.layerX - parseInt(data[1]) <= timeline.offsetWidth - document.getElementById(data[0]).offsetWidth;
    if (ev.target.id.includes(data[0].split('-')[1]) && left && right && !data[0].includes('moment')) {
        ev.target.appendChild(document.getElementById(data[0]));
        document.getElementById(data[0]).style.left = (ev.offsetX - parseInt(data[1])) / timeline.offsetWidth * 100 + '%';
        document.getElementById(data[0]).style.top = ev.offsetY + parseInt(data[2], 10) + 'px';
    }

};

changeValue = ev => {
    const el = document.getElementById(ev.target.id);
    useBar.forEach(bar => {
        if (bar.textareaId.includes(ev.target.id.split('-')[1])) {
            document.getElementById(bar.textareaId).innerHTML = el.value;
            document.getElementById(bar.textareaId).title = el.value
        }
    })
};

deleteElement = ev => {
    const delEl = useEl.find(el => el.id.includes(ev.target.id.split('-')[1]));
    const delBar = useBar.find(el => el.timelineId.includes(ev.target.id.split('-')[1]));

    document.getElementById(delEl.id).remove();
    document.getElementById(delBar.timelineId).remove();
    useEl.forEach((el, index) => {
        if (el.id === delEl.id) {
            useEl.splice(index, 1)
        }
    });
    useBar.forEach((el, index) => {
        if (el.barId === delBar.barId) {
            useBar.splice(index, 1)
        }
    });
};

momentShow = () => {
    const timelineBar = document.querySelectorAll('.timeline-bar');
    const barPossition = video.currentTime / video.duration;
    timelineBar.forEach((item) => {
        item.style.width = barPossition * 100 + '%'
    });
    useEl.forEach((item, index) => {
        if (item) {
            const elLeft = document.getElementById(useBar[index].momentId) && document.getElementById(useBar[index].momentId).offsetLeft;
            const elWidth = document.getElementById(useBar[index].momentId) && document.getElementById(useBar[index].momentId).offsetWidth;
            const barWidth = document.getElementById(useBar[index].barId) && document.getElementById(useBar[index].barId).offsetWidth;
            const divide = (elLeft + elWidth) / barWidth;
            if (elLeft / barWidth < barPossition && barPossition < divide) {
                document.getElementById(item.id).style.display = 'flex'
            } else {
                document.getElementById(item.id).style.display = 'none'
            }
        }
    });

};


video.addEventListener("timeupdate", () => {
    timeUpdate()
});

timeUpdate = () => {
    const timelineBar = document.querySelectorAll('.timeline-bar');
    useBar.forEach(el => {
        const moment = document.getElementById(el.momentId);
        if (moment) {
            moment.style.width = (moment.offsetWidth / video.offsetWidth) * 100 + '%'
        }
    });
    if (timelineBar) {
        momentShow();
    }
};

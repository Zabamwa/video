const video = document.querySelector('.video');
const elementContainer = document.querySelector('.element-container');
const timeline = document.querySelector('.timeline');
let useBar = [];
let useEl = [];
let element = 0;
const controlBtn = ['Left', 'Right', 'Delete'];

setAttributes = (el, attrs) => {
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
};

addTimeLine = (inputValue) => {
    const container = document.createElement('div');
    const barContainer = document.createElement("div");
    const bar = document.createElement('div');
    const selectMoment = document.createElement('div');
    const textarea = document.createElement('textarea');
    setAttributes(textarea, {class: 'infoBar', id: `textareaBar-${element}`, onchange: 'changeValue(event)'});

    setAttributes(barContainer, {
        class: 'timeline-element',
        id: `timeline-element-${element}`,
        ondrop: "dropTimeline(event)",
        ondragover: "allowDropTimeline(event)"
    });
    setAttributes(selectMoment, {
        class: 'select-moment',
        'data-toggle': 'tooltip',
        title: `${inputValue}`,
        id: `timeline-${element}`,
        ondragstart: 'dragTimeline(event)',
        draggable: true
    });
    setAttributes(bar, {class: 'timeline-bar', draggable: false});
    setAttributes(container, {id: `timelineContainer-${element}`});

    textarea.value = inputValue;
    useBar.push({timelineId: container.id, barId: barContainer.id, momentId: selectMoment.id, textareaId: textarea.id});
    controlBtn.forEach(el => {
        switch (el.toLowerCase()) {
            case 'delete':
                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = `${el}`;
                setAttributes(deleteBtn, {id: `btn${el}-${element}`});
                deleteBtn.addEventListener('click', deleteElement, true);
                container.appendChild(deleteBtn)
                break;
            default:
                const rotateBtn = document.createElement('button');
                rotateBtn.innerHTML = `Rotate ${el}`;
                setAttributes(rotateBtn, {id: `btn${el}-${element}`});
                rotateBtn.addEventListener('click', rotateElement, true);
                container.appendChild(rotateBtn);
                break;
        }
    });

    $(function () {
        $(`#${selectMoment.id}`).resizable({
            containment: ".timeline-element"
        });
    });
    selectMoment.appendChild(textarea)
    barContainer.appendChild(bar);
    barContainer.appendChild(selectMoment);
    timeline.appendChild(container);
    container.appendChild(barContainer);
    element++;
};

createElement = () => {
    let div = document.createElement("div");
    let textarea = document.createElement('textarea');
    setAttributes(div, {draggable: 'true', class: 'drag-element', id: `moment-${element}`, ondragstart: 'drag(event)'});
    setAttributes(textarea, {
        class: 'info',
        placeholder: 'Text...',
        id: `textarea-${element}`,
        onchange: 'changeValue(event)'
    });

    div.appendChild(textarea);
    elementContainer.appendChild(div);

    $(function () {
        $(`#${div.id}`).resizable({
            containment: "#video-wrapper"
        });
    });

};

createElement();

allowDrop = ev => {
    ev.preventDefault();
};

drag = ev => {
    ev.stopPropagation();
    const style = window.getComputedStyle(ev.target, null);
    ev.dataTransfer.setData("text", [ev.target.id, ev.layerX, parseInt(style.getPropertyValue('top')) - ev.y, ev.layerY, ev.target.children[0].id]);
};

drop = ev => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text").split(',');
    endDrop(ev, data);
};

endDrop = (ev, data) => {
    const dragElement = document.getElementById(data[0]);
    const rightSide = ev.layerX - parseInt(data[1]) <= video.offsetWidth - dragElement.offsetWidth;
    const left = ev.layerX - parseInt(data[1]) > 0;
    const bottom = ev.layerY - parseInt(data[3]) <= video.offsetHeight - dragElement.offsetHeight;
    const top = ev.layerY - parseInt(data[3]) >= 0;
    if (rightSide && left && bottom && top) {
        ev.target.parentNode.appendChild(dragElement);
        dragElement.style.left = parseInt(data[1]) < ev.layerX && ((ev.layerX - parseInt(data[1])) / video.offsetWidth) * 100 + '%';
        dragElement.style.top = (ev.offsetY + parseInt(data[2], 10)) / video.offsetHeight * 100 + '%';
        afterDrop(data)
    }
};

afterDrop = (data) => {
    const inputValue = document.getElementById(data[0]).children[0];
    if (elementContainer.children.length === 0) {
        useEl.push({id: data[0], rotate: 0, textareaId: data[4]});
        addTimeLine(inputValue.value);
        createElement();
    }
};

allowDropTimeline = ev => {
    ev.preventDefault();
};

dragTimeline = ev => {
    ev.dataTransfer.setData("text", [ev.target.id, ev.layerX]);
    video.pause();
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
    let el = document.getElementById(ev.target.id);
    el.innerHTML = el.value;

    if (!ev.target.id.includes('textareaBar')) {
        useBar.forEach(bar => {
            if (bar.textareaId.includes(ev.target.id.split('-')[1])) {
                document.getElementById(bar.textareaId).value = el.value;
                document.getElementById(bar.textareaId).title = el.value
            }
        })
    } else {
        useEl.forEach(dragEl => {
            if (dragEl.textareaId.includes(ev.target.id.split('-')[1])) {
                document.getElementById(dragEl.textareaId).value = el.value;
                document.getElementById(dragEl.textareaId).title = el.value
            }
        })
    }
}

rotateElement = ev => {
    if (ev.target.id.includes(controlBtn[0])) {
        useEl.forEach(el => {
            if (el.id.includes(ev.target.id.split('-')[1])) {
                el.rotate -= 5;
                document.getElementById(el.id).style.transform = `rotate(${el.rotate}deg)`;
            }
        })
    } else {
        useEl.forEach(el => {
            if (el.id.includes(ev.target.id.split('-')[1])) {
                el.rotate += 5;
                if (el.rotate > 360 || el.rotate < -365) {
                    el.rotate = 0
                }
                document.getElementById(el.id).style.transform = `rotate(${el.rotate}deg)`;
            }
        })
    }
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
    })
};

momentShow = () => {
    const timelineBar = document.querySelectorAll('.timeline-bar');
    const barPossition = video.currentTime / video.duration;
    timelineBar.forEach((item, index) => {
        timelineBar[index].style.width = barPossition * 100 + '%';
        const elLeft = document.getElementById(useBar[index].momentId) && document.getElementById(useBar[index].momentId).offsetLeft;
        const elWidth = document.getElementById(useBar[index].momentId) && document.getElementById(useBar[index].momentId).offsetWidth;
        const barWidth = document.getElementById(useBar[index].barId) && document.getElementById(useBar[index].barId).offsetWidth;
        const divide = (elLeft + elWidth) / barWidth;
        if (elLeft / barWidth < barPossition && barPossition < divide) {
            document.getElementById(useEl[index].id).style.display = 'flex'
        } else {
            document.getElementById(useEl[index].id).style.display = 'none'
        }
    });

};


video.addEventListener("timeupdate", () => {
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
});

resizeWindow = () => {
    useEl.forEach(el => {
        document.getElementById(el.id).style.width = '10vw';
        document.getElementById(el.id).style.height = '10vh';
    })
};


window.addEventListener('resize', resizeWindow);

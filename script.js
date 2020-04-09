let video = document.querySelector('.video');
let elementContainer = document.querySelector('.element-container');
let timeline = document.querySelector('.timeline');
let useBar = [];
let useEl = [];
let element = 0;
let controlBtn =['Left','Right','Delete'];

setAttributes = (el, attrs) => {
    Object.keys(attrs).forEach(key => el.setAttribute(key, attrs[key]));
};

addTimeLine = (inputValue) => {
    let container = document.createElement('div');
    let barContainer = document.createElement("div");
    let bar = document.createElement('div');
    let selectMoment = document.createElement('div');

    setAttributes(barContainer, { class: 'timeline-element', id: `timeline-element-${element}`, ondrop:"dropTimeline(event)", ondragover:"allowDropTimeline(event)",draggable: 'true'});
    setAttributes(selectMoment, { class: 'select-moment','data-toggle':'tooltip',title: `${inputValue}`, id: `timeline-${element}`, ondragstart: 'dragTimeline(event)', draggable: true});
    setAttributes(bar, { class: 'timeline-bar'});
    setAttributes(container, { id: `timelineContainer-${element}`});
    selectMoment.innerHTML = inputValue;
    useBar.push({timelineId:container.id, barId: barContainer.id, momentId: selectMoment.id});
    controlBtn.forEach(el => {
        switch (el.toLowerCase()) {
            case 'delete':
                let deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = `${el}`;
                setAttributes(deleteBtn, { id: `btn${el}-${element}`});
                deleteBtn.addEventListener('click', deleteElement,true);
                container.appendChild(deleteBtn)
                break;
            default:
                let rotateBtn = document.createElement('button');
                rotateBtn.innerHTML = `Rotate ${el}`;
                setAttributes(rotateBtn, { id: `btn${el}-${element}`});
                rotateBtn.addEventListener('click', rotateElement,true);
                container.appendChild(rotateBtn);
                break;
        }
    });

    barContainer.appendChild(bar);
    barContainer.appendChild(selectMoment);

    timeline.appendChild(container);
    container.appendChild(barContainer);
    element++;

};

createElement = () => {
    let div = document.createElement("div");
    let textarea = document.createElement('textarea');

    setAttributes(div, { draggable: 'true', class: 'drag-element',id: `el-${element}`, ondragstart: 'drag(event)'});

    setAttributes(textarea, { class: 'info', placeholder: 'Text...', id: `textarea-${element}`, onchange: 'changeValue(event)'});

    div.appendChild(textarea);
    elementContainer.appendChild(div);

};

createElement();


allowDrop = ev => {
    ev.preventDefault();
};

drag = ev => {
    ev.stopPropagation();
    let style = window.getComputedStyle(ev.target, null);
    ev.dataTransfer.setData("text", [ev.target.id, ev.offsetX , parseInt(style.getPropertyValue('top')) - ev.y]);
};

drop = ev => {
    ev.preventDefault();

    let style = window.getComputedStyle(ev.target.parentNode.parentNode.parentNode, null);
    let marginLeft = (style.marginLeft);
    let data = ev.dataTransfer.getData("text").split(',');

    let dragElement = document.getElementById(data[0])
        ev.target.parentNode.appendChild(dragElement);
        dragElement.style.left = (ev.x - parseInt(data[1]) - parseInt(marginLeft,10))/video.offsetWidth *100 +'%';
        dragElement.style.top = (ev.offsetY + parseInt(data[2],10))/video.offsetHeight * 100+ '%';
        let inputValue = document.getElementById(data[0]).children[0];
        if(elementContainer.children.length===0) {
            useEl.push({id:data[0], rotate:0});
            addTimeLine(inputValue.value);
            createElement();
        }

};

allowDropTimeline = ev => {
    ev.preventDefault();
};

dragTimeline = ev => {
    ev.dataTransfer.setData("text", [ev.target.id, ev.offsetX]);
};

dropTimeline = ev => {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text").split(',');
    if(ev.target.id.includes(data[0].split('-')[1]) && ev.x < video.clientWidth){
        ev.target.appendChild(document.getElementById(data[0]));
        document.getElementById(data[0]).style.left = (ev.offsetX - parseInt(data[1]))/timeline.offsetWidth*100+'%';
        document.getElementById(data[0]).style.top = ev.offsetY + parseInt(data[2],10)+ 'px';
    }
};

changeValue = ev => {
    let el = document.getElementById(ev.target.id)
    el.innerHTML=el.value;
    useBar.filter(bar => {
        if(bar.momentId.includes(ev.target.id.split('-')[1])){
            document.getElementById(bar.momentId).innerHTML = el.value
            document.getElementById(bar.momentId).title = el.value
        }
    })
};

rotateElement = ev => {
    if(ev.target.id.includes(controlBtn[0])){
        useEl.filter(el=>{
            if(el.id.includes(ev.target.id.split('-')[1])){
                el.rotate-=5;
                document.getElementById(el.id).style.transform = `rotate(${el.rotate}deg)`;
            }
        })
    }
    else {
        useEl.filter(el=>{
            if(el.id.includes(ev.target.id.split('-')[1])){
                el.rotate+=5;
                document.getElementById(el.id).style.transform = `rotate(${el.rotate}deg)`;
            }
        })
    }
};

deleteElement = ev => {
    let delEl = useEl.find(el=>el.id.includes(ev.target.id.split('-')[1]))
    let delBar = useBar.find(el=>el.timelineId.includes(ev.target.id.split('-')[1]))
    document.getElementById(delEl.id).remove();
    document.getElementById(delBar.timelineId).remove();
    useEl.find((el,index)=>{
        if(el.id===delEl.id){
            useEl.splice(index,1)
        }
    })
};




video.addEventListener("timeupdate", () => {
    let timelineBar = document.querySelectorAll('.timeline-bar');
    let barPossition = video.currentTime / video.duration;
    useBar.forEach(el=>{
        let moment = document.getElementById(el.momentId);
        if(moment) {
            moment.style.width = (moment.offsetWidth / video.offsetWidth) * 100 + '%'
        }
    });
    if(timelineBar){
        timelineBar.forEach((item,index) => {
            timelineBar[index].style.width = barPossition * 100 + '%';
            let divide= (document.getElementById(useBar[index].momentId).offsetLeft+document.getElementById(useBar[index].momentId).offsetWidth)/document.getElementById(useBar[index].barId).offsetWidth;
            if(document.getElementById(useBar[index].momentId).offsetLeft/document.getElementById(useBar[index].barId).offsetWidth < barPossition && barPossition < divide){
                document.getElementById(useEl[index].id).style.display='flex'
            }
            else {
                document.getElementById(useEl[index].id).style.display='none'
            }
        });
    }
});


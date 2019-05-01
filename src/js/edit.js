// polling
(function polling() {
    fetch('/api/list.php').then(function(res) {
        return res.json();
    }).then(function(data) {
        renderList(JSON.parse(data));
    });

    setTimeout(polling, 2000);
})();

// events modal
var add_button = document.getElementsByClassName('gh_add')[0];
var templateEditForm = `
    <div class="modalExit"></div>
    <h3>Добавить новую игру</h3>
    <form onsubmit="return false;">
        <input type="text" name="title" placeholder="Название">
        <input type="text" name="price" onkeypress="if(isNaN(String.fromCharCode(event.keyCode))) return false;" placeholder="Цена">
        <div class="pl_case">
            <div class="mefp_title">Платформы:</div>
            <label><input name="platform[]" class="pl_platform" type="checkbox" value="MacOs">MacOs</label>
            <label><input name="platform[]" class="pl_platform" type="checkbox" value="Windows">Windows</label>
            <label><input name="platform[]" class="pl_platform" type="checkbox" value="SteamOS">SteamOS</label>
        </div>
        <input type="submit" value="Добавить" onclick="validForm(this.form)">
    </form>
`;
var modalBg = document.getElementsByClassName('modalBg')[0];
var modalEdit = document.getElementsByClassName('modalEdit')[0];
var modalExit = document.getElementsByClassName('modalExit')[0];

add_button.addEventListener('click', function(bg, me) {
    bg.style.cssText = 'display: block;';
    me.style.cssText = 'display: block;';
    me.innerHTML = templateEditForm;
}.bind(null, modalBg, modalEdit));
modalBg.addEventListener('click', {handleEvent: modalRemove, bg: modalBg, me: modalEdit});
modalEdit.addEventListener('click', {handleEvent: modalRemove, bg: modalBg, me: modalEdit});

function modalRemove(e) {
    if(e.target.classList[0] == 'modalExit' || e.target.classList[0] == 'modalBg') {
        this.bg.style.cssText = '';
        this.me.style.cssText = '';
    }
}

// render list game
var nowData = [], oldData = [], edits = [], filter = '';
function renderList(data, isEdit) {

    var changeData = checkData(data, nowData);
    var game_table = document.getElementsByClassName('game_table')[0];
    var templateCell = `<div class="gt_item">
        <div class="gti_cell gti_title"><div class="gtic_wrap">Название</div></div>
        <div class="gti_cell gti_price"><div class="gtic_wrap">Цена</div></div>
        <div class="gti_cell gti_platform"><div class="gtic_wrap">Платформы</div></div>
        <div class="gti_cell gti_desc"><div class="gtic_wrap">Описание</div></div>
        <div class="gti_cell gti_edit"></div>
        <div class="gti_cell gti_del"></div>
    </div>`;

    if(window.location.hash) {
        var v = +window.location.hash.slice(1);
        if(edits.indexOf(v) == -1) {
            edits.push(v);
            setTimeout(function() {
                var htmlTag = document.getElementsByTagName('body')[0];
                var elPos = document.querySelector('.gt_item[data-id="'+v+'"]');
                scrollTo(htmlTag, elPos.offsetTop-100, 600);
            }, 100);
        }
    }

    if(changeData.length || isEdit) {

        var updateHTML = data.reduce((a, e) => a += createItem(e, changeData), '');
        game_table.innerHTML = templateCell + updateHTML;
        var gt_item = document.getElementsByClassName('gt_item');
        for(var i=0; i<gt_item.length; i++) {
            gt_item[i].addEventListener('click', delegateItem);

            var inputs = gt_item[i].querySelectorAll('form input[type="text"]');
            for(var g=0; g<inputs.length; g++) {
                inputs[g].addEventListener('change', changeInput);
            }

            var checkeds = gt_item[i].querySelectorAll('form input[type="checkbox"]');
            for(var g=0; g<checkeds.length; g++) {
                checkeds[g].addEventListener('change', changeChecked);
            }

            var desc_link =  gt_item[i].getElementsByClassName('desc_link')[0];
            if(i > 0) {
                desc_link.addEventListener('click', function(bg, me) {
                    bg.style.cssText = 'display: block;';
                    me.style.cssText = 'display: block;';
                    me.innerHTML = `
                        <div class="modalExit"></div>
                        <h3>Описание</h3>
                        <p class="modal_desc">Как принято считать, ключевые особенности структуры проекта ограничены исключительно 
                        образом мышления. Лишь тщательные исследования конкурентов набирают популярность 
                        среди определенных слоев населения, а значит, должны быть подвергнуты целой серии 
                        независимых исследований. В своем стремлении повысить качество жизни, они забывают, 
                        что граница обучения кадров влечет за собой процесс внедрения и модернизации экспериментов, 
                        поражающих по своей масштабности и грандиозности.</p>
                    `;
                }.bind(null, modalBg, modalEdit));
            }
        }

        if(!isEdit) {
            oldData = nowData;
            nowData = data;
            if(changeData[0].length) showLog(changeData);
        }
    }

}
function createItem(item, changeData) {
    if(filter && filter.indexOf(item.id) == -1) return '';

    if(edits.indexOf(item.id) == -1) {
        return `<div data-id="`+item.id+`" class="gt_item">
            <div class="gti_cell gti_title"><div class="gtic_wrap">`+item.title+`</div></div>
            <div class="gti_cell gti_price"><div class="gtic_wrap">`+item.price+`</div></div>
            <div class="gti_cell gti_platform"><div class="gtic_wrap">`+item.platform.join(', ')+`</div></div>
            <div class="gti_cell gti_desc"><div class="gtic_wrap"><a class="desc_link" href="#">Открыть</a></div></div>
            <div class="gti_cell gti_edit"></div>
            <div class="gti_cell gti_del"></div>
        </div>`;
    } else {
        // если форма уже есть и элемент не изменен
        var thisForm = document.querySelector('.gt_item[data-id="'+item.id+'"]');
        var isChange = changeData.reduce((a, i) => i[0]+1 == item.id ? false : a, true);

        if(thisForm && thisForm.querySelector('form') && isChange) {
            return thisForm.outerHTML;
        } else {
            return `
                <div data-id="`+item.id+`" class="gt_item">
                    <form onsubmit="return false;">
                        <input type="hidden" name="id" value="`+item.id+`" />
                        <div class="gti_cell gti_title"><div class="gtic_wrap"><input name="title" type="text" value="`+item.title+`"/></div></div>
                        <div class="gti_cell gti_price"><div class="gtic_wrap"><input name="price" type="text" value="`+item.price+`"/></div></div>
                        <div class="gti_cell gti_platform">
                            <div class="gtic_wrap pl_case">
                                <label><input `+checkPlatform(item.platform, 'MacOs')+` name="platform[]" class="pl_platform" type="checkbox" value="MacOs">MacOs</label>
                                <label><input `+checkPlatform(item.platform, 'Windows')+` name="platform[]" class="pl_platform" type="checkbox" value="Windows">Windows</label>
                                <label><input `+checkPlatform(item.platform, 'SteamOS')+` name="platform[]" class="pl_platform" type="checkbox" value="SteamOS">SteamOS</label>
                            </div>
                        </div>
                        <div class="gti_cell gti_desc"><div class="gtic_wrap"><a class="desc_link" href="#">Открыть</a></div></div>
                        <div class="gti_cell gti_complete"><input type="submit" type="submit" onclick="validForm(this.form)"/></div>
                        <div class="gti_cell gti_del"></div>
                    </form>
                </div>`;
        }
    }

}

// fix input html value
function changeInput(e) {
    e.target.setAttribute('value', e.target.value);
}
function changeChecked(e) {
    if(e.target.checked) e.target.setAttribute('checked','true');
    else e.target.removeAttribute('checked');
}

// create item
function checkPlatform(arr, val) {
    return arr.indexOf(val) != -1 ? 'checked="true"' : '';
}
function delegateItem(e) {
    if(e.target.classList[1] == 'gti_edit') {
        edits.push(+this.dataset.id);
        renderList(nowData, true);
    }
    if(e.target.classList[1] == 'gti_del') {
        modalBg.style.cssText = 'display: block;';
        modalEdit.style.cssText = 'display: block;';
        modalEdit.innerHTML = `
            <div class="modalExit"></div>
            <p class="alarm_modal">Вы уверены что хотите удалить игру?</p>
            <div class="btn_case"><div class="btnc_item btnc_yes">Да</div><div class="btnc_item btnc_no">Отмена</div> </div>
        `;

        var clickYes = document.getElementsByClassName('btnc_yes')[0];
        clickYes.addEventListener('click', function() {
            sendDel(this.dataset.id);
            modalBg.style.cssText = '';
            modalEdit.style.cssText = '';
        }.bind(this));

        var clickNo = document.getElementsByClassName('btnc_no')[0];
        clickNo.addEventListener('click', function() {
            modalBg.style.cssText = '';
            modalEdit.style.cssText = '';
        });

    }
}
function showLog(logsAdd) {
    var newLogs = logsAdd.reduce(function(a, i) {
        setTimeout(clearLog, 5000);
        a.push(createLog(i));
        return a;
    }, []);

    var logsCase = document.getElementsByClassName('logs')[0];
    for(var i=0;i<newLogs.length;i++) {
        logsCase.insertBefore(newLogs[0], logsCase.childNodes[0]);
    }
}
function clearLog() {
    var logsItem = document.getElementsByClassName('logs_item');
    logsItem[logsItem.length-1].style.cssText = 'opacity:0';
    setTimeout(function() {logsItem[logsItem.length-1].remove();}, 300);
}
function createLog(item) {
    var el = document.createElement('div');

    if(item[1] == 'add') {
        el.classList.add('logs_item', 'logs_add');
        el.innerText = 'Добавлена новая игра "'+nowData[nowData.length-item[0]].title+'"';
    } else if(item[1] == 'remove') {
        el.classList.add('logs_item', 'logs_remove');
        el.innerText = 'Была удалена игра "'+oldData.find(x => x.id === item[0]).title+'"';
    } else {
        el.classList.add('logs_item', 'logs_edit');
        el.innerText = 'Была изменена игра "'+nowData[item[0]].title+'"';
    }

    return el;
}

// valid form
function validForm(form) {

    var err = 0;

    if(form.title.value == '') {
        err = 1;
        form.title.classList.add('input_error');
    } else {
        form.title.classList.remove('input_error');
    }

    if(form.price.value == '') {
        err = 1;
        form.price.classList.add('input_error');  
    } else {
        form.price.classList.remove('input_error');
    }

    if(![].reduce.call(form.querySelectorAll('.pl_platform'), (a, i) => !a ? i.checked : a, false)) {
        err = 1;
        form.querySelector('.pl_case').classList.add('plcase_error');
    } else {
        form.querySelector('.pl_case').classList.remove('plcase_error');
    }

    if(!err) {
        if(!form.id) {
            sendAdd(serialize(form));
            modalBg.style.cssText = '';
            modalEdit.style.cssText = '';
            form.title.value = '';
            form.price.value = '';
            [].forEach.call(form.querySelectorAll('.pl_platform'), i => i.checked = false);
        } else {
            edits.splice(edits.indexOf(+form.id.value), 1);
            window.location.hash = '';
            if(compareForm(nowData, form)) sendEdit(serialize(form));
            else renderList(nowData, true);
        }
    }
}
function compareForm(data, form) {
    var res = 0;
    var data = data.find(x => x.id === +form.id.value);
    var platform = [].reduce.call(form.querySelectorAll('.pl_platform'), (a, i) => {
        if(i.checked) a.push(i.value);
        return a;
    }, []);

    if(data.title != form.title.value) res = 1;
    if(data.price != +form.price.value) res = 1;
    if(data.platform.join() != platform.join()) res = 1;

    return res;
}

// find events 
var findInput = document.getElementsByClassName('gh_find')[0];
findInput.addEventListener('keyup', function(e) {
    var val = e.target.value;
    if(!val) {
        filter = '';
    } else {
        filter = nowData.reduce(function(a, i) {
            var compare = i.title.replace(/\./gi, '').toLowerCase().match('^'+val.toLowerCase());
            if(val && compare && compare.length) a.push(i.id);
            return a;
        }, []);
    }
    renderList(nowData, true);
});

// api
function sendAdd(arr) {
    fetch('/api/add.php', {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: arr
    });
}
function sendEdit(arr) {
    fetch('/api/edit.php', {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: arr
    });
}
function sendDel(id) {
    fetch('/api/delete.php', {
        method: "POST",
        headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
        body: 'id='+id
    });
}

// support
function checkData(x, y) {
    if(!y.length) return [0];

    if(x.length > y.length) {
        var result = [];
        for(var i=1;i<=x.length - y.length; i++) result.push([i, 'add']);
        return result;
    }
    if(x.length < y.length) return findDeleteData(x, y); 
    return x.reduce((a, i, n) => validObject(i, y[n], n, a), []);
}
function validObject(x, y, index, result) {
    var ok = Object.keys;
    var keys = ok(x);

    for(var g=0; g < keys.length; g++) {
        if(typeof x[keys[g]] == "object") {
            if(x[keys[g]].length != y[keys[g]].length) {
                result.push([index, keys[g]]);
            }
        } else {
            if(x[keys[g]] != y[keys[g]]) {
                result.push([index, keys[g]]);
            }
        }
    }

    return result;
}
function findDeleteData(x, y) {
    var result = [];
    x = x.map(a => a.id);
    y = y.map(a => a.id);

    for(var i=0; i<y.length; i++) {
        if(x.indexOf(y[i]) == -1) {
            result.push([y[i], 'remove']);
        }
    }

    return result;
}

function serialize(form) {
    var serialized = [];
	for(var i = 0; i < form.elements.length; i++) {
		var field = form.elements[i];
		if(!field.name || field.disabled || field.type === 'file' || field.type === 'reset' || field.type === 'submit' || field.type === 'button') continue;
		if(field.type === 'select-multiple') {
			for(var n = 0; n < field.options.length; n++) {
				if (!field.options[n].selected) continue;
				serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[n].value));
			}
		} else if((field.type !== 'checkbox' && field.type !== 'radio') || field.checked) {
			serialized.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
		}
	}

	return serialized.join('&');
}
function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
}
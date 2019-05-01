// polling
//(function polling() {
    fetch('/api/list.php').then(function(res) {
        return res.json();
    }).then(function(data) {
        renderList(JSON.parse(data));
    });

//  setTimeout(polling, 2000);
//})();

var nowData = [], dataSort = [];
function renderList(data, isEdit) {

    if(window.location.search) {
        var getParams = parseQuery(window.location.search);

        var link_active = document.getElementsByClassName('gf_itemActive')[0];
        if(link_active) link_active.classList.remove('gf_itemActive');
        
        document.querySelector('.gf_item[data-sort="'+getParams.method_sort+'"]').classList.add('gf_itemActive');
        dataSort = sortData(data, getParams.method_sort);
    } else {
        document.querySelector('.gf_item[data-sort="all"]').classList.add('gf_itemActive');
        dataSort = null;
    }

    console.log(dataSort);
    console.log(nowData);

    var changeData = checkData(data, nowData);
    var game_case = document.getElementsByClassName('game_case')[0];

    if(changeData.length || isEdit) {
        if(dataSort) var updateHTML = dataSort.reduce((a, e) => a += createItem(e), '');
        else var updateHTML = data.reduce((a, e) => a += createItem(e), '');

        game_case.innerHTML = updateHTML;

        // events for votes
        var stars = document.getElementsByClassName('stars');
        var now_rate = document.getElementsByClassName('now_rate');
        for(var i=0; i<stars.length;i++) {
            (function(i) {
                var listStars = stars[i].querySelectorAll('.star');

                stars[i].addEventListener('mouseover', function(e) {
                    now_rate[i].style.cssText = 'opacity:0';
                    selectStars(e.target.dataset.id, listStars);
                });

                stars[i].addEventListener('mouseout', function() {
                    now_rate[i].style.cssText = '';
                    clearStars(listStars);
                });

                setEventListStarts(i+1, listStars);
            })(i);
        }

        nowData = data;
    }

}

function createItem(item) {
    item.text = `Как принято считать, ключевые особенности структуры проекта ограничены исключительно образом мышления. 
        Лишь тщательные исследования конкурентов набирают популярность среди определенных слоев 
        населения, а значит, должны быть подвергнуты целой серии независимых исследований. 
        В своем стремлении повысить качество жизни, они забывают, что граница обучения 
        кадров влечет за собой процесс внедрения и модернизации экспериментов, 
        поражающих по своей масштабности и грандиозности.`;

    return `
        <div class="gc_item">
            <div class="gci_top">
                <a class="link" href="/game?id=`+item.id+`"></a>
                <h3>`+item.title+`</h3>
                <div class="platform">`+getPlatform(item.platform)+`</div>
                <div class="gcisi_rate">
                    <div class="gcisi_vis">
                        <div class="now_rate" style="`+getStyleRate(item.id, item.rating)+`"></div>
                        <div class="stars">`+getStarts(item.id)+`</div>
                    </div>
                    <p>`+(parseFloat(item.rating).toFixed(1) || '0.0')+`</p>
                </div>
                <div class="price">`+getPrice(item.price)+`</div>
                <p class="desc">`+item.text.slice(0, 200).replace(/[., ]$/, '')+`...</p>
            </div>
            <div class="gci_bottom">
                <a href="/edit#`+item.id+`" class="gcib_edit">Править</a>
            </div>
         </div>
    `;
}

// sort
var sort_links = document.querySelectorAll('.gf_item:not(.gf_head)');
for(var i=0; i<sort_links.length; i++) {
    sort_links[i].addEventListener('click', function(e) {
        var method_sort = e.target.dataset.sort;
        var link_active = document.getElementsByClassName('gf_itemActive')[0];
        if(link_active) link_active.classList.remove('gf_itemActive');

        if(method_sort == 'all') {
            history.pushState({state:'method_sort'}, null, '?');
        } else {
            history.pushState({state:'method_sort'}, null, '?method_sort=' + method_sort);
        }

        e.target.classList.add('gf_itemActive');
        renderList(nowData, true);
    });
}
function sortData(data, method) {
    var copyData = data.slice();
    if(method == 'names') {
        return copyData.sort(function(a, b) {
            if(a.title[0].toLowerCase() < b.title[0].toLowerCase()) { return -1; }
            if(a.title[0].toLowerCase() > b.title[0].toLowerCase()) { return 1; }
            return 0;
        });
    }
    if(method == 'rate_up') {
        return copyData.sort(function(a, b) {
            if(a.rating < b.rating) { return -1; }
            if(a.rating > b.rating) { return 1; }
            return 0;
        });
    }
    if(method == 'rate_down') {
        return copyData.sort(function(a, b) {
            if(a.rating > b.rating) { return -1; }
            if(a.rating < b.rating) { return 1; }
            return 0;
        });
    }
}

// support
function getPlatform(platform) {
    return platform.reduce((a, name) => a += '<div class="platform_item '+name.toLowerCase()+'"><i></i><p>'+name+'</p></div>', '');
}
function getStarts(id) {
    var str = '';
    var votes = getVotesRate(id);

    for(var i=1;i<=10;i++) {
        if(i > votes) {
            str += '<div data-id="'+i+'" class="star"></div>';
        } else {
            str += '<div data-id="'+i+'" class="star starActive"></div>';
        }
    }
    return str;
}
function getStyleRate(id, rate) {
    return !getVotesRate(id) ? 'width:'+rate*10+'%' : '';
}
function getVotesRate(id) {
    var votes = JSON.parse(localStorage.getItem('votes')) || [];
    return votes.reduce((a, i) => i.id == id ? i.rate : a, 0) || 0;
}
function getPrice(price) {
    return price == '0' ? 'Бесплатно' : price + ' руб.';
}
function selectStars(index, stars) {
    for(var i=0;i<stars.length;i++) {
        if(i < index) stars[i].classList.add('starSelect');
    }
}
function clearStars(stars) {
    for(var i=0;i<stars.length;i++) {
        stars[i].classList.remove('starSelect');
    }
}
function setEventListStarts(id, listStars) {
    for(var i=0;i<listStars.length;i++) {
        listStars[i].addEventListener('click', function(e) {
            var rate = e.target.dataset.id;
            var votes = JSON.parse(localStorage.getItem('votes')) || [];

            var body = 'id='+id+'&rating='+rate;
            var nRate = getVotesRate(id);
            if(nRate) body += '&old='+nRate;

            fetch('/api/vote.php', {
                method: "POST",
                headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
                body: body
            }).then(function() {
                renderList(nowData, true);
            });

            var vIndex = votes.reduce((a, i, n) => i.id == id ? n : a, null);
            if(vIndex != null) votes[vIndex].rate = rate;
            else votes.push({id: id, rate: rate});
            localStorage.setItem('votes', JSON.stringify(votes));
        }, id);
    }
}
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
function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}
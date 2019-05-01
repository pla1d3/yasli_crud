fetch('/api/get.php?id='+getParams().id).then(function(res) {
    return res.json();
}).then(function(data) {
    renderItem(data);
});

var nowData = [];
function renderItem(data) {
    var game_solo = document.getElementsByClassName('game_solo')[0];
    game_solo.innerHTML = createItem(data);

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

    // events slider
    var slider_stop = false;
    var arrow_left = document.getElementsByClassName('gsa_left')[0];
    var arrow_right = document.getElementsByClassName('gsa_right')[0];
    var slider = document.getElementsByClassName('gsa_case')[0];
    slider.innerHTML += slider.innerHTML;
    var slide = document.getElementsByClassName('gsc_item');

    arrow_left.addEventListener('click', function() {
        if(!slider_stop) {
            slider_stop = true;
            for(var i=0; i<slide.length; i++) {
                slide[i].style.cssText = 'transform: translateX(100%);';
            }
            setTimeout(function() {
                for(var i=0; i<slide.length; i++) {
                    slide[i].style.cssText = 'transition:none;transform: translateX(0);';
                }
                slider.insertBefore(slide[slide.length-1], slide[0]);
                slider_stop = false;
            }, 500);
        }
    });
    arrow_right.addEventListener('click', function() {
        if(!slider_stop) {
            slider_stop = true;
            for(var i=0; i<slide.length; i++) {
                slide[i].style.cssText = 'transform: translateX(-100%);';
            }
            setTimeout(function() {
                for(var i=0; i<slide.length; i++) {
                    slide[i].style.cssText = 'transition:none;transform: translateX(0);';
                }
                slider.appendChild(slide[0]);
                slider_stop = false;
            }, 500);
        }
    });

    nowData = data;
}

function createItem(item) {
    return `
        <div class="gcisi_head">
            <h3>`+item.title+`</h3>
            <a href="/edit/#`+item.id+`" class="gcisi_edit">Править</a>
        </div>
        <div class="platform">`+getPlatform(item.platform)+`</div>
        <div class="gcisi_rate">
            <div class="gcisi_vis">
                <div class="now_rate" style="`+getStyleRate(item.id, item.rating)+`"></div>
                <div class="stars">`+getStarts(item.id)+`</div>
            </div>
            <p>`+(parseFloat(item.rating).toFixed(1) || '0.0')+`</p>
        </div>
        <div class="price">`+getPrice(item.price)+`</div>
        <p>Как принято считать, ключевые особенности структуры проекта ограничены исключительно образом мышления. 
        Лишь тщательные исследования конкурентов набирают популярность среди определенных слоев 
        населения, а значит, должны быть подвергнуты целой серии независимых исследований. 
        В своем стремлении повысить качество жизни, они забывают, что граница обучения 
        кадров влечет за собой процесс внедрения и модернизации экспериментов, 
        поражающих по своей масштабности и грандиозности.</p>
    ` + createSlide(item);
}

function createSlide(item) {
    var item = ['a947f.jpg', 'ag33a.jpg', 'gerh3.jpg', 'rh5a3.jpg', '457efe.jpg'];
    var slider = '<div class="game_slider"><div class="gs_arrow gsa_left"></div><div class="gsa_case">';
    for(var i=0; i < item.length; i++) {
        slider += '<div class="gsc_item"><div style="background-image: url(/build/res/screen/'+item[i]+')" class="gsci_img"></div></div>';
    }
    slider += '</div><div class="gs_arrow gsa_right"></div></div>';
    return slider;
}

// support
function getPlatform(platform) {
    return platform.reduce((a, name) => a += '<div class="platform_item '+name.toLowerCase()+'"><i></i><p>'+name+'</p></div>', '');
}
function getRateStyle(rate) {
    return 'width: '+rate*10+'%;';
}
function getPrice(price) {
    return price == '0' ? 'Бесплатно' : price + ' руб.';
}
function getClassVote(id) {
    var checkVote = JSON.parse(localStorage.getItem('checkVote')) || [];
    return checkVote[id] ? 'gcib_voteActive' : '';
}
function getParams() {
    return window.location.search.substr(1).split('&').reduce((acc, item) => {
        var tmp = item.split('=');
        acc[tmp[0]] = tmp[1];
        return acc;
    }, {});
}
function getStyleRate(id, rate) {
    return !getVotesRate(id) ? 'width:'+rate*10+'%' : '';
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
function getVotesRate(id) {
    var votes = JSON.parse(localStorage.getItem('votes')) || [];
    return votes.reduce((a, i) => i.id == id ? i.rate : a, 0) || 0;
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
                renderItem(nowData);
            });

            votes.push({id: id, rate: rate});
            localStorage.setItem('votes', JSON.stringify(votes));
        }, id);
    }
}

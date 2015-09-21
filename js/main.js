const _SEPARATOR = '|';
const _PARENT = 'group';

function drawData(id, data_url, control_type, fieldList) {
    _getData(data_url, function(data) {
        data = JSON.parse(data);

        var result = '';
        switch(control_type){
            case 'alpha_list':
                result = _drawAlphaList(data, fieldList);
                break;
            default: '';
        }

        var element = document.getElementById(id);
        element.innerHTML = result;
    });
}

function _getData( url, ready ) {
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', url, true );
    xhr.onreadystatechange = function() {
        if( this.readyState === 4 && this.status !== 404 ) {
            ready( this.responseText );
        }
    }
    xhr.send();
}

function _drawAlphaList(data, fieldList){
    var titles = _getUniqueMembers(data, _PARENT);
        if(titles.length === 0){
            return;
        }

    var result = '\<dl\>\n';
    for(var i=0; i<titles.length; i++){
            result += '\<dt\>'+ titles[i] +'\</dt\>\n';

            var content = _getChildMembers(data,_PARENT,titles[i]);
            for(var j=0; j<content.length; j++){
                result += '\<dd\>' + _getContent(content[j], fieldList) + '\</dd\>';
            }
        }

        result += '\</dl\>';
        return result;
}

function _getContent(content, fieldList) {
    var fields = fieldList.split(_SEPARATOR);
    var result = "";

    for(var i=0; i < fields.length; i++){
        var item = fields[i];

        if(item === 'src'){
            continue;
        }
        if(item === 'title'){
            var title = '';
            if(content.hasOwnProperty('title')){
                title = content.title;
            }
            if(content.hasOwnProperty('src') && fieldList.indexOf('src') != -1){
                title = '\<a href="' + content.src + '" \>' + title + '\</a\>';
            }
            result += title;
        } else{
            if(content.hasOwnProperty(item)){
                result += content[item];
            }
        }
    }

    return result;
}

function _getUniqueMembers(data, column) {
    var nonunique = [];
    for(var i=0; i<data.length; i++){
        if(data[i].hasOwnProperty(column)){
            nonunique.push(data[i][column]);
        }
    }
    if(nonunique.length === 0){
        return nonunique;
    }

    var result = [];
    for (var i = 0; i < nonunique.length; i++) {
        if (result.indexOf(nonunique[i]) == -1) result.push(nonunique[i]);
    }
    return result.sort();
}

function _getChildMembers(data, column, value){
    var result = [];
    for(var i=0; i<data.length; i++){
        if(data[i][column] === value){
            result.push(data[i]);
        }
    }
    return result;
}

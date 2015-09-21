const _SEPARATOR = '|';
const _PARENT = 'group';

function drawData(id, data_url, control_type, fieldList) {
    var data = _getData(data_url);

    var result = '';
    switch(control_type){
        case 'glossary':
            result = _drawGlossary(data, fieldList);
            break;
        default: '';
    }

    var element = document.getElementById(id);
    element.innerHTML = result;
}

function _getConfig() {
    return _getData("data/config.json");
}

function _getData(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if(request.readyState == 4 && request.status == 200) {
        return JSON.parse(request.responseText);
    }

    return null;
}

function _drawGlossary(data, fieldList){
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

function _format(config, field, value) {
    //var config = _getConfig();
    var formatting = _getChildMembers(config, "property", field)[0];

    if(formatting.length === 0 || value.length === 0){
        return value;
    }
    if(formatting.hasOwnProperty("tag")){
        value = "\<" + formatting["tag"] + "\>" + value + "\</" + formatting["tag"] + "\>";
    }
    if(formatting.hasOwnProperty("format")){
        value = formatting["format"].replace("{" + field + "}", value);
    }

    return value;
}

function _getContent(content, fieldList) {
    var fields = fieldList.split(_SEPARATOR);
    var result = "";
    var config = _getConfig();

    for(var i=0; i < fields.length; i++){
        var field = fields[i];
        var value = "";

        if(field === 'src'){
            continue;
        }
        if(field === 'title'){
            if(content.hasOwnProperty('title')){
                value = content.title;
            }
            if(content.hasOwnProperty('src')){
                value = '\<a href="' + content.src + '" \>' + value + '\</a\>';
            }
        } else{
            if(content.hasOwnProperty(field)){
                value = content[field];
            }
        }

        result += _format(config, field, value);
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

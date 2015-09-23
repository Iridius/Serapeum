const _SEPARATOR = '|';
//const _DISPLAYS = _getUniqueMembers(_getConfig(), 'property');

function drawData(id, data_url, display, fieldList) {
    var data = _getData(data_url);
    var result = _formatData(data, display, fieldList);

    var element = document.getElementById(id);
    element.innerHTML = result;
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

function _getConfig() {
    //return _getData("/data/config.json");
    return _getData('http://localhost:63342/Serapeum/data/config.json');
}

function _formatData(data, display, fieldList) {
    var result = '';
    switch (display) {
        case 'article':
            console.log(display);
            break;
        case 'blockqoute':
            console.log(display);
            break;
        case 'epigraph':
            console.log(display);
            break;
        //case 'header':
        //    result = _getContent(data);
        //    break;
        case 'glossary':
            result = _formatAsGlossary(data, fieldList);
            break;
        case 'list':
            result = _formatAsList(data, fieldList);
            break;
        case 'quotes':
            result = _formatAsQuotes(data);
            break;
        default: // attempt to read control type from config
            const _displays = _getUniqueMembers(_getConfig(), 'property');
            data.forEach(function(item){
                var key = Object.keys(item)[0];
                var display_key = _displays.indexOf(key);

                if(display != -1) {
                    //console.log('key «' + key + '» contains in _DISPLAYS');
                    result += _formatData(item[key], _displays[display_key]);
                }
            });
    }
    return result;
}

function _formatAsGlossary(data, fieldList){
    var titles = _getUniqueMembers(data, 'group');
    var config = _getConfig();

    if(titles.length === 0){
        return;
    }

    var result = '\<dl\>\n';
    for(var i=0; i<titles.length; i++){
            result += '\<dt\>'+ _format(config, 'group', titles[i]) +'\</dt\>\n';

            var content = _getChildMembers(data,'group',titles[i]);
            for(var j=0; j<content.length; j++){
                result += '\<dd\>' + _getContent(content[j], fieldList) + '\</dd\>';
            }
        }

        result += '\</dl\>';
        return result;
}

function _formatAsQuotes(data) {
    var config = _getConfig();
    var result = '';

    data.forEach(function(quote){
        var header = '';
        if(quote.hasOwnProperty('header')){
            header = _format(config, "header", quote.header);
        }

        var cite = '';
        if(quote.hasOwnProperty('source')){
            cite = _format(config, "source", quote.source);
        }

        var content = '';
        if(quote.hasOwnProperty('blockquote')){
            content = _format(config, 'blockquote', header + quote.blockquote + cite);
            result += content;
        }
    });

    return result;
}

function _formatAsList(data, fieldList) {
    const template = '<\ol\>{list}\</ol\>';

    var titles = _getUniqueMembers(data, 'group');
    var config = _getConfig();
    var result = '';

    if(titles.length === 0){
        titles.push(null);
    }

    for(var i=0; i<titles.length; i++){
        if(titles[i] != null) {
            result += _format(config, 'group', titles[i]);
        }

        var content = _getChildMembers(data,'group',titles[i]);
        var list  = '';
        for(var j=0; j<content.length; j++){
            list += '\<li\>' + _getContent(content[j], fieldList) + '\</li\>';
        }

        result += template.replace('{list}', list);
    }

    return result;
}

function _format(config, field, value) {
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
    var fields = fieldList != undefined? fieldList.split(_SEPARATOR): Object.keys(content);

    var result = "";
    var config = _getConfig();

    for(var i=0; i < fields.length; i++){
        var field = fields[i];
        var value = "";

        if(field === 'src' || field === 'group'){
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

    result = result.trim();
    if(result.lastIndexOf(',') === result.length - 1){
        result = result.substring(0, result.length - 1);
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

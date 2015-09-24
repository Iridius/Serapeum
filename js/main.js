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
            //console.log(display);
            result = _getContent(data)
            break;
        case 'blockqoute':
            console.log(display);
            break;
        case 'epigraph':
            console.log(display);
            break;
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
            data.forEach(function(item){
                if(item.hasOwnProperty("type")){
                    var type = item.type;
                    result += _formatData(item, type);
                }
            });
    }
    return result;
}

//TODO: global config for single request
function _formatAsGlossary(data, fieldList){
    var result = '';
    const config = _getConfig();

    if(data.hasOwnProperty('header')){
        result += _format(config, 'header', data.header);
    }

    if(data.hasOwnProperty('content') && Array.isArray(data.content)){
        const _LIST = "<\dl\>{list}\</dl\>";
        const _ITEM = "\<dd\>{item}\</dd\>";

        var list = '';
        data.content.forEach(function(item){
            list += _ITEM.replace('{item}', _getContent(item, fieldList));
        });

        result += _LIST.replace('{list}', list);
    }

    return result;
}

function _formatAsQuotes(data) {
    var result = '';
    var config = _getConfig();

    if(data.hasOwnProperty('header')){
        result += _format(config, 'header', data.header);
    }

    if(data.hasOwnProperty('content')){
        var content = data.content;

        if(Array.isArray(content)){
            content.forEach(function(quote){
                result += _getQuoteContent(config, quote);
            });
        } else {
            result += _getQuoteContent(config, content);
        }
    }

    return result;
}

function _getQuoteContent(config, content){
    var source = '';
    if(content.hasOwnProperty('source')){
        source = _format(config, "source", content.source);
    }

    if(content.hasOwnProperty('blockquote')){
        return _format(config, 'blockquote', content.blockquote + source);
    }

    return '';
}

//TODO: sorting headers +sorting content
function _formatAsList(data, fieldList) {
    var result = '';
    var config = _getConfig();

    if(data.hasOwnProperty("header")){
        result += _format(config, 'header', data.header);
    }

    if(data.hasOwnProperty("content") && Array.isArray(data.content)){
        const _LIST = '<\ol\>{list}\</ol\>';
        const _ITEM = "\<li\>{item}\</li\>";

        var list = '';
        data.content.forEach(function(item){
            list += _ITEM.replace('{item}', _getContent(item, fieldList));
        });

        result += _LIST.replace('{list}', list);
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

function _getChildMembers(data, column, value){
    var result = [];
    for(var i=0; i<data.length; i++){
        if(data[i][column] === value){
            result.push(data[i]);
        }
    }
    return result;
}

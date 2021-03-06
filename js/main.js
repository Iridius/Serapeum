const BASE = 'http://localhost:63342/Serapeum/';
const config = JSON.parse(_getData(BASE + 'data/config.json'));

function getLocalPath() {
    var localPath = location.href.replace(BASE, '');

    var output = '';
    for(var i=0; i<localPath.split('/').length-1; i++){
        output += '../';
    }

    return output;
}

function relocateData(data) {
    return replaceAll(data, '{BASE}', getLocalPath());
}

function createElement(tag, id, _class, data){
    var element = document.createElement(tag);
    if(id){
        element.id = id;
    }
    if(_class){
        element.className = _class;
    }

    element.innerHTML = data;
    document.body.appendChild(element);
}

function displayData(url, _class) {
    var menu = relocateData(_getData(BASE + 'res/menu.html'));
    createElement('nav', 'menu', null, menu);

    if(typeof(url) != 'undefined') {
        var content = _formatData(JSON.parse(relocateData(_getData(url))));
        createElement('section', 'content', _class, content);
    }
}

function replaceAll(text, from, to) {
    return text.replace(new RegExp(from, 'g'), to);
}

function _getData(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);

    if(request.readyState == 4 && request.status == 200) {
        return request.responseText;
    }

    return null;
}

function _formatData(data, display) {
    var result = '';

    switch (display) {
        case 'article':
            result = _getContent(data, display);
            break;
        case 'epigraph':
        case 'quote':
        case 'rhyme':
            result = _getQuote(data, display);
            break;
        case 'header':
            result = _getHeader(data);
        break;
        case 'image':
        case 'marginalis':
            result = _getImage(data, display);
            break;
        case 'glossary':
            result = _getGlossary(data, display);
            break;
        case 'list':
            result = _getEntitledList(data, display);
            break;
        case 'table':
            result = _getTable(data, display);
            break;
        default: // read control type from config
            if(!Array.isArray(data)){
                //return '';
                break;
            }

            //var result = '';
            data.forEach(function(item){
                if(item.hasOwnProperty("type")){
                    result += _formatData(item, item.type);
                }else{
                    result += _getContent(item);
                }
            });
            //return result;
    }

    return result;
}

function _getLinks(data) {
    if(!Array.isArray(data)){
        return;
    }

    var result = '';
    var delimiter = data.length > 1?' | ': '';
    data.forEach(function(link){
        result += _getContent(link) + delimiter;
    });

    result = result.substring(0, result.lastIndexOf(delimiter));
    return toDiv('\<p\>[' + result + ']\</p\>', 'links');
}

function _getHeader(data){
    if(data.hasOwnProperty("header")){
        return _format('header', data['header']);
    }

    return '';
}

function _getImage(data, display) {
    var result = _getHeader(data);

    result += _getImageContent(data, display);

    // for image with article get shell-container: remark
    if(data.hasOwnProperty('content')){
        result += _format('para', data['content']);
        return toDiv(result, 'remark');
    }

    return result;
}

function _getImageContent(data, display) {
    var result = '\<img src="{link}" alt="{source}" title="{source}"\>';

    result = result.replace("{link}", data.hasOwnProperty("link")? data.link: '');
    result = replaceAll(result, "{source}", data.hasOwnProperty("source")? data['source']: '');

    result += _format('source', data['source']);
    return toDiv(result, display);
}

function _getList(data, list, list_item){
    var result = '';

    if(data.hasOwnProperty('content') && Array.isArray(data['content'])){
        var li = '';
        data['content'].forEach(function(element){
            li += list_item.replace('{item}', _getContent(element));
        });

        result += list.replace('{list}', li);
    }

    return result;
}

function _getGlossary(data, display){
    var result = '';

    result += _getHeader(data);
    result += _getList(data, '\<dl\>{list}\</dl\>', '\<dd\>{item}\</dd\>');

    return toDiv(result, display);
}

function _getQuote(data, display) {
    var result = _getHeader(data);

    if(data.hasOwnProperty('content')){
        var content = data['content'];

        if(Array.isArray(content)){
            content.forEach(function(quote){
                result += _getQuoteContent(quote);
            });
        } else {
            result += _getQuoteContent(content);
        }
    }

    if(data.hasOwnProperty('links')){
        result += _getLinks(data['links']);
    }

    return toDiv(result, display);
}

function _getQuoteContent(content){
    var result = '';

    var header = '';
    if(content.hasOwnProperty('header')){
        header += _format("header", content['header']);
    }

    var source = '';
    if(content.hasOwnProperty('source')){
        source = _format("source", content['source']);
    }

    if(content.hasOwnProperty('quote')){
        result = _format('quote', header + content['quote'] + source);
    }

    if(content.hasOwnProperty('epigraph')){
        result = _format('epigraph', header + content['epigraph'] + source);
    }

    return result;
}

function _getTable(data, display) {
    var result = '';

    result += _getHeader(data);

    const _TABLE = '\<table\>{table}\</table\>';
    const _ROW = '\<tr\>{row}\</tr\>';
    const _CELL = '\<td\>{cell}\</td\>';
    if(data.hasOwnProperty('content')){

        var row_value = '';
        data.content.forEach(function(row){

            var cell_value = '';
            Object.keys(row).forEach(function(cell){
                cell_value += _CELL.replace('{cell}', row[cell]);
            });

            row_value += _ROW.replace('{row}', cell_value);
        });

        result += _TABLE.replace('{table}', row_value);
    }

    return toDiv(result, display);
}

function _getEntitledList(data, display) {
    var result = '';

    result += _getHeader(data);
    result += _getList(data, '\<ol\>{list}\</ol\>', '\<li\>{item}\</li\>');

    return toDiv(result, display);
}

function _format(field, value) {
    var formatting = _getChildMembers(config, "property", field)[0];

    if(typeof formatting === "undefined" || value.length === 0){
        return value;
    }

    var tag_class = '';
    if(formatting.hasOwnProperty("class")){
        tag_class = ' class="' + formatting["class"] + '"';
    }

    if(formatting.hasOwnProperty("tag")){
        value = "\<" + formatting["tag"] + tag_class + "\>" + value + "\</" + formatting["tag"] + "\>";
    }
    if(formatting.hasOwnProperty("format")){
        value = formatting["format"].replace("{" + field + "}", value);
    }

    return value;
}

function _getContent(content, display) {
    var fields = Object.keys(content);

    var result = "";

    for(var i=0; i < fields.length; i++){
        var field = fields[i];
        var value = "";

        if(field === 'src' || field === 'group' || field === 'type' || field === 'links'){
            continue;
        }
        if(field === 'title' || field === 'link'){
            if(content.hasOwnProperty(field)){
                value = content[field];
            }
            if(content.hasOwnProperty('src')){
                value = '\<a href="' + content['src'] + '" \>' + value + '\</a\>';
            }
        } else{
            if(content.hasOwnProperty(field)){
                if(!Array.isArray(content[field])){
                    value += content[field];
                }else{
                    value += _formatData(content[field]);
                }

            }
        }

        result += _format(field, value);
    }

    result = result.trim();
    if(result.lastIndexOf(',') === result.length - 1){
        result = result.substring(0, result.length - 1);
    }

    if(content.hasOwnProperty('links')){
        result += _getLinks(content['links']);
    }

    return toDiv(result, display);
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

function toDiv(value, type) {
    return type? '\<div class="' + type + '"\>' + value + '\</div\>': value;
}

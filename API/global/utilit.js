exports.getMonday = function(d){
    d = new Date(d);
    var day = d.getDay(),
    diff = d.getDate() - day + (day == 0? -6:1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

exports.getTimeStamp = function(timestamp){
    let hour = Math.floor(timestamp/3600);
    hour = hour===0?"00":(hour>0 && hour<10)?"0"+hour:hour;
    let min = Math.floor((timestamp % 3600)/60);
    min = min===0?"00":(min>0 && min<10)?"0"+min:min;
    let sec = (Math.round(timestamp) % 3600)%60;
    sec = sec === 0?"00":(sec>0 && sec<10)?"0"+sec:sec;
    return ""+hour+":"+min+":"+sec;
}
exports.formatAMPM = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = (hours>=10?hours:("0"+hours)) + ':' + minutes + ' ' + ampm;
    return strTime;
}

exports.formatAMPM_HOUR = function(date){
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    var strTime = (hours>=10?hours:("0"+hours)) + ' ' + ampm;
    return strTime;
}

exports.formatDate = function(timestamp, date_locale_opt, date_format_opt){
    let d = new Date(timestamp);
    return d.toLocaleDateString(date_locale_opt, date_format_opt);
}

exports.max = function(a, b){
    return a>b?a:b;
}

exports.min = function(a, b){
    return a>b?b:a;
}
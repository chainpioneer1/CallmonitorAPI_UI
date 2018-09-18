export class Global {
    static sleep = function (delay) {
        var start = new Date().getTime();
        while (new Date().getTime() < start + delay);
    }

    static getCurrentUser = function () {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static _linechartcolors = ['#00AC5C', '#F5B723', '#E5003F', '#4c8efc'];

    static getTimeStamp = function (timestamp) {
        let hour = Math.floor(timestamp / 3600);
        let hhour = hour === 0 ? "00" : (hour > 0 && hour < 10) ? "0" + hour : hour;
        let min = Math.floor((timestamp % 3600) / 60);
        let mmin = min === 0 ? "00" : (min > 0 && min < 10) ? "0" + min : min;
        let sec = (Math.round(timestamp) % 3600) % 60;
        let ssec = sec === 0 ? "00" : (sec > 0 && sec < 10) ? "0" + sec : sec;
        return "" + hhour + ":" + mmin + ":" + ssec;
    }


    static formatAMPM_HOUR = function(timestamp){
        var date = new Date(timestamp);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        var strTime = (hours>=10?hours:("0"+hours)) + ' ' + ampm;
        return strTime;
    }
    
    static formatDate = function(timestamp){
        let date = new Date(timestamp).toString();
        let datestrings = date.split(' ');
        return datestrings[1] + " "+datestrings[2]+", "+datestrings[3];        
    }
}
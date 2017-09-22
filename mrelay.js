'use strict'
const net = require('net');
const mc=require('./mailrelaydata.js'); 
const mail_proc=["MAIL FROM","RCPT TO","DATA","QUIT","--"];
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

function relaymail(fromaddr,toaddr,mbody,hc){
let mail_proc_ind=0;
let client = new net.Socket();
client.connect(mc.smtp_port,mc.smtp_host, function() {	console.log('Connected');});
client.on('data', function(data) {
    console.log('Received: ' + data);
    mlogg(data);
    let code=data.toString().substring(0,3);
    switch(code){
        case "220":client.write("HELO mydomain.com\r\n");
                   console.log("HELO");
                   break;
        case "250":
                if(mail_proc_ind<mail_proc.length) {console.log(mail_proc[mail_proc_ind]); mlogg(mail_proc[mail_proc_ind]);}
                switch(mail_proc_ind){
                    case 0:client.write("MAIL FROM:<"+fromaddr+">\r\n");break;
                    case 1:client.write("RCPT TO:<"+toaddr+">\r\n");break;
                    case 2:client.write("DATA\r\n");break;
                    case 3: client.write("QUIT\r\n");break;
                    default:
                        console.log("error!");
                        client.destroy();
                }
                mail_proc_ind++;
                break;
        case "354":client.write(mbody); console.log("Mail_Body"); break;
        case "221":client.destroy();
                var db = new sqlite3.Database(gsmail_db_path);
                db.run("delete from mail where to_=? and hc =?;", [toaddr,hc]);
                db.close();
                break;
        case "421":
            mlogg(toaddr);
            break; //"421" retry.
        case "550":
            mlogg(toaddr); //550 error. mark dele flag.
        default :
                mlog(hc);
                mlog(data);
                var db = new sqlite3.Database(gsmail_db_path);
                db.run("update mail set dele_=1 where hc =?;", [hc]);
                db.close();
    }
});
client.on('close', function() {	console.log('Connection closed');});
}
var vIntervalTimer;
var cnt=0;
function GetWGLog() {
    cnt++;  mlogg(cnt);
    var db = new sqlite3.Database(gsmail_db_path);
    db.all("SELECT body_ , from_ as mailfrm , to_ , hc FROM mail WHERE dele_=0 ;", [], function (err, rows) {
        try {
            for (let i = 0; i < rows.length>20?20:rows.length; i++) {
                let mailfrom=rows[i].mailfrm.toString();
                let mailto=rows[i].to_.toString();
                let mailhc=rows[i].hc.toString();
                relaymail(mailfrom,mailto,rows[i].body_,mailhc);
            }
        } catch (err) {
            mlogg(err);
        }
    });
    db.close();
    return; // if (cnt >= li.length) { clearInterval(vIntervalTimer);  }
}
function run() { vIntervalTimer = setInterval(GetWGLog, 1000); }
mlog("start");
GetWGLog();
run();

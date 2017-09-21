var mc=require('./mailrelaydata.js'); 
var net = require('net');
var fromaddr=mc.teacher_j+"@"+mc.mydomain;
var toaddr=mc.teacher_e+"@"+mc.mydomain;

var client = new net.Socket();
var proc_inde=0;
var ok354=false;
var mail_proc=["mail from","rcpt to","DATA","QUIT","--"];
client.connect(mc.smtp_port, mc.smtp_host, function() {
	console.log('Connected');
});

client.on('data', function(data) {
    console.log('Received: ' + data);
    if(data.toString().startsWith("220")){
        client.write("HELO "+mc.mydomain+"\r\n");
    }else if(!ok354 && data.toString().startsWith("250")){
        console.log(mail_proc[proc_inde]);
        switch(proc_inde){
            case 0:client.write("MAIL FROM:<"+fromaddr+">\r\n");
            break;
            case 1:client.write("RCPT TO:<"+toaddr+">\r\n");
            break;
            case 2:client.write("DATA\r\n");
            break;
        }
       proc_inde++;
    }else if(data.toString().startsWith("354")){
        client.write("C: Blah blah blah..\r\n");
        client.write("C: ...etc. etc. etc.\r\n");
        client.write("\r\n.\r\n");
        ok354=true;
    }else if(ok354 && data.toString().startsWith("250")){
        client.write("QUIT\r\n");
    }else if(data.toString().startsWith("221")){
        console.log("close conn...")
        client.destroy(); // kill client after server's response
    }  
});

client.on('close', function() {
	console.log('Connection closed');
});
/*

           S: 220 xyz.com Simple Mail Transfer Service Ready
           C: EHLO foo.com
           S: 250 xyz.com is on the air
           C: MAIL FROM:<JQP@bar.com>
           S: 250 OK
           C: RCPT TO:<Jones@XYZ.COM>
           S: 250 OK
           C: DATA
           S: 354 Start mail input; end with <CRLF>.<CRLF>
           C: Received: from bar.com by foo.com ; Thu, 21 May 1998
           C:     05:33:29 -0700
           C: Date: Thu, 21 May 1998 05:33:22 -0700
           C: From: John Q. Public <JQP@bar.com>
           C: Subject:  The Next Meeting of the Board
           C: To: Jones@xyz.com
           C:
           C: Bill:
           C: The next meeting of the board of directors will be
           C: on Tuesday.
           C:                         John.
           C: .
           S: 250 OK
           C: QUIT
           S: 221 foo.com Service closing transmission channel
*/

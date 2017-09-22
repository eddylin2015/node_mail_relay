# node_mail_relay
<pre>
Use Net Socket Connection send email , ref smtp protocal.
var mail_proc=["MAIL FROM","RCPT TO","DATA","QUIT","--"];
var mail_proc_ind=0;
var smtpclient=net.Socket();
smtpclient.connect(port,host,function(){console.log('Connected');});
smtpclient.on('data', function(data) {
    console.log('Received: ' + data);
    let code=data.toString().substring(0,3);
    switch(code)
    {
    case "220": client.write("HELO "+mc.mydomain+"\r\n"); break;
    case "250": 
      switch(mail_proc_ind){
            case 0:client.write("MAIL FROM:<"+fromaddr+">\r\n");
            break;
            case 1:client.write("RCPT TO:<"+toaddr+">\r\n");
            break;
            case 2:client.write("DATA\r\n");
            break;
            case 3:client.write("QUIT\r\n");
            break;
        }
        mail_proc_ind++;
        break;
    case "354": 
        client.write("Blah blah blah..\r\n");
        client.write("\r\n.\r\n");
        ok354=true;
    case "221": client.destroy(); break;
    default:
        client.destroy();
    }
});
smtpclient.on('close', function() {	console.log('Connection closed');});

like Telnet:
telnet host port
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


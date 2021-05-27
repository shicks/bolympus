/*
  bolympus.js
  Copyright (C) Stephen Hicks 2006
  Permission to copy or modify is granted under the
  GNU General Public License available at
    http://www.gnu.org/copyleft/gpl.html
  This notice must remain intact in all copies,
  modified or otherwise.

  The coding algorithm used is explained at
    <write me later>

  Based heavily on the following work:
/* Metroid password generator / decoder
 * Copyright (C) 1992,2004 Joel Yliluoma (http://iki.fi/bisqwit/)
 * Written for http://bisqwit.iki.fi/nesvideos/PasswordGenerators.html
 * Permission to copy and modify is granted under the following terms:
 *   The copyright notice is kept unmodified
 *   No attempts are made to prevent anyone downloading the source code
 *
 * Reverse engineering by unknown - algorithm copied from SnowBro's doc
 */


function bolyminput(name) {
  
  this.gel = function(id)   { return document.getElementById(name+id) }
  this.id  = function(id)   { return this.gel(id).selectedIndex }
  this.ids = function(id,v) { this.gel(id).selectedIndex=v }
  this.ch  = function(id)   { return this.gel(id).checked?1:0 }
  this.chs = function(id,v) { this.gel(id).checked = v>0 }
  this.tx  = function(id)   { return this.gel(id).value }
  this.txs = function(id,v) { this.gel(id).value = v }
  this.ta  = function(id)	{ return this.gel(id).value.replace(/[^a-zA-Z0-9\?!]/g, '') }
  this.tas = function(id,v) { this.gel(id).innerHTML = v; this.gel(id).value = v; }
  this.nm  = function(id)   { return parseInt(this.gel(id).value) }

  this.dce = function(obj) { return document.createElement(obj) }
  this.dcei= function(o,i) { ob=this.dce(o);this.sa(ob,'id',name+i);return ob; }
  this.dct = function(str) { return document.createTextNode(str) }
  this.ac  = function(p,c) { p.appendChild(c) }
  this.sa  = function(o,a,v) { o.setAttribute(a,v) }
  
  this.sanitize_pw = function(v) { return v.replace("/[^"+this.alphabet_regex+"]/g", '') }

  this.input_bits = /* start at 95 */
  [ 'Bit 95 (bug?)',
    'Crystal',
    'Flask',
    'Ocarina',
    'Harp',
    'Divine Sword',
    'Nymph Sword',
    'Staff of Fennel',
    'Club',
    '2nd Heart',
    '1st Heart',
    'Key',
    'Power Bracelet',
    'Reflective Shield',
    'Fire Shield',
    'Sandals',
    'Moonbeam',
    'Argolis Ambrosia',
    'Phthia Ambrosia',
    'Cyclops Ambrosia',
    'Forest Ambrosia',
    'Phrygia Ambrosia?',
    'Zeus',
    'Golden Apple',
    '3rd Heart',
    'Attica Child Rescued',
    'Lion Defeated',
    'Lamia Defeated',
    'Flask Filled',
    'Bit 124',
    'Bit 125',
    'Bit 126',
    'Bit 127',
    'Bit 128',
    'Bit 129',
    'Siren Defeated',
    'Gaea Defeated',
    'Cyclops Defeated',
    'Hydra Defeated',
    'Fire',
    'Bit 135',
    'Bit 136',
    'Bit 137',
    'Bit 138'];

  /* locations 0+4 */
  this.input_locations =
  [ 'Arcadia',
    'Attica',
    'Argolis',
    'Peloponnesus',
    'Laconia',
    'Phthia',
    'Crete',
    'Phrygia',
    'Tartarus 1',
    'Tartarus 2',
    'Tartarus 3',
    'Hades' ];

  this.adds = [0x38,0x0a,0x12,0x26];
  this.letters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz?!';
  this.alphabet_regex = 'a-zA-Z0-9\?!';
  
  this.chars = [0,0,0,0,0,0, 0,0,0,0,0,0,0,    /* current value */
		0,0,0,0,0,0, 0,0,0,0,0,0,0];

  this.info = [0,0,0,0,0,0,        /* non-encoded bits (full bytes worth) */
	       0,0,0,0,0,0,
	       0,0,0,0,0,0,0];     /* extra padding for checksum at start... */

  /* Routines */

  this.text = function(id,size,value) {
    input = this.dcei('input',id);
    this.sa(input,'size',size);
    this.sa(input,'type','text');
    this.sa(input,'value',value);
    return input;
  }
  this.monotext = function(id,size,onchange,value) {
    input = this.text(id,size,value);
    this.sa(input,'style','font-family:monospace;font-size:130%');
    /* input.onchange = onchange; */
    this.sa(input,'onchange','javascript:'+name+'.'+onchange+'()');
    this.sa(input,'maxlength',size);
    return input;
  }

  this.multitext = function(id,rows,cols,value) {
    input = this.dcei('textarea',id);
    this.sa(input,'rows',rows);
    this.sa(input,'cols',cols);
    this.sa(input,'spellcheck','false');
    input.innerHTML = value;
    return input;
  }
  this.multilinetext = function(id,rows,cols,onchange,value) {
    input = this.multitext(id,rows,cols,value);
    this.sa(input,'style','font-family:monospace;font-size:130%; resize: none;');
    /* input.onchange = onchange; */
    this.sa(input,'onkeyup',"this.value = this.value.replace(/[^"+this.alphabet_regex+"\s]/g, ' ')");	//This makes sure the value is in our set.
    this.sa(input,'onchange','javascript:'+name+'.'+onchange+'()');
    this.sa(input,'maxlength',rows*cols+1);	// The extra 1 accounts for a space between the second and third groups.
    return input;
  }

  this.messagetext = function(id,size) {
    input = this.text(id,size,'');
    this.sa(input,'readonly','1');
    return input;
  }
  this.select = function(id,choices,onchange) {
    input = this.dcei('select',id);
    for (i=0;i<choices.length;++i) {
      opt = this.dce('option');
      this.sa(opt,'value',i);
      this.ac(opt,this.dct(choices[i]));
      this.ac(input,opt);
    }
    this.sa(input,'onchange','javascript:'+name+'.'+onchange+'()');
    /* input.onchange = onchange; */
    return input;
  }
  this.bitbox = function(num,text,onchange) {
    sp = this.dce('span');
    input = this.dcei('input','bit'+num.toString());
    this.sa(input,'value',0);
    this.sa(input,'type','checkbox');
    this.sa(input,'onchange','javascript:'+name+'.'+onchange+'()');
    /* input.onchange = onchange; */
    /* maybe use a label with name/for pair... */
    this.ac(sp,input);
    this.ac(sp,this.dct(text));
    return sp;
  }

  this.write_form = function() {
    tab = this.dce('table');
    tr = this.dce('tr');
    td = this.dce('td');
    br = this.dce('br');
    this.sa(td,'valign','top');
    this.sa(td,'nowrap','nowrap');
    this.ac(td,this.dct('Password:'));
    this.ac(td,br);

//Replace these with one multiline
//	this.ac(td,this.monotext('l1','14','decode()',
//				'000000 0000000'));
//	this.ac(td,br.cloneNode(false));
//	this.ac(td,this.monotext('l2','14','decode()',
//				'000000 0000000'));
//	this.ac(td,br.cloneNode(false));
//End Replace

//New multiline
	this.ac(td,this.multilinetext('l3','2','14','decode()',
			     '012345 6789ABC DEFGHI JKLMNOP'));
	this.ac(td,br.cloneNode(false));
//End New


    this.ac(td,this.dct('Message:'));
    this.ac(td,br.cloneNode(false));
    this.ac(td,this.messagetext('msg',20));
    this.ac(td,br.cloneNode(false));

    nums=[];
    for (var i=0;i<64;++i) { nums.push(i.toString()); }
    this.ac(td,this.dct('Encoding: '));
    this.ac(td,this.select('enc',nums,'encode()'));
    this.ac(td,br.cloneNode(false));
    this.ac(td,this.dce('hr'));

    this.ac(td,this.dct('Hero: '));
    this.ac(td,this.monotext('name1','6','encode()','Orfeus'));
    this.ac(td,br.cloneNode(false));
    this.ac(td,this.dct('Heroine: '));
    this.ac(td,this.monotext('name2','6','encode()','Helene'));
    this.ac(td,br.cloneNode(false));

    this.ac(td,this.dct('Location: '));
    this.ac(td,this.select('loc',this.input_locations,'encode()'));
    this.ac(td,br.cloneNode(false));

    this.ac(td,this.dct('Olives: '));
    this.ac(td,this.monotext('olives','2','encode()','0'));
    this.ac(td,this.dct(' Skins: '));
    this.ac(td,this.monotext('skins','2','encode()','0'));
    this.ac(td,br.cloneNode(false));
    this.ac(td,this.dct('Life: '));
    this.ac(td,this.monotext('life','3','encode()','8'));
    this.ac(td,br.cloneNode(false));
    this.ac(tr,td);

    /* New column */
    td = this.dce('td');
    this.sa(td,'valign','top');
    this.sa(td,'nowrap','nowrap');
    
    colsize = 0;
    max_colsize = 14;
    for(i=95;i<138;++i) {
	this.ac(td,this.bitbox(i,this.input_bits[i-95],'encode()'));
	if (++colsize>max_colsize) {
	    this.ac(tr,td);
	    td = this.dce('td');
	    this.sa(td,'valign','top');
	    this.sa(td,'nowrap','nowrap');
	    colsize = 0;
	} else {
	    this.ac(td,br.cloneNode(false));
	}
    }

    this.ac(tr,td);
    this.ac(tab,tr);
    this.ac(this.gel(''),tab);
  }

  this.gb = function(bit) {
    var b = (bit >> 3) + 1; /* silly... */
    return (this.info[b]>>(7-(bit&7)))&1;
  }
  this.sb = function(bit,value) {
    var b = (bit >> 3) +1
    this.info[b] |= (value << (7-bit&7));
  }

//   this.gr = function(start,len) {
//     start += 8;  /* -8 is actually the beginning (checksum)... */
//     tot = 0;
//     sb = start>>3;
//     so = start&7;
//     while (len>0) {
//       thisbyte = 8-so;
//       se = thisbyte-len;
//       if (se<0) se=0;
//       else thisbyte = len;
//       len -= thisbyte;
//       b = (this.info[sb] & (255>>so)) >> se;
//       tot <<= thisbyte;
//       tot += b;
//       ++sb;
//       so=0;
//     }
//     return tot;
//   }

  this.gr = function(start,len) {
    var tot = 0;
    for (var n=start;n<start+len;++n) {
      tot<<=1;
      tot+=this.gb(n);
    }
    return tot;
  }
  this.sr = function(start,len,value) {
    for (var n=start+len-1;n>=start;--n) {
      this.sb(n,value&1);
      value>>=1;
    }
  }

  /* Is this too fancy?  Should I just set bits? */
//   this.sr = function(start,len,val) {
//     start += 8;  /* -8 is actually the beginning... */
//     sb = start>>3;
//     so = start&7;
//     while (len>0) {
//       thisbyte = 8-so;
//       se = thisbyte-len;
//       if (se<0) se=0;
//       else thisbyte = len;
//       mask = (255 >> (8-thisbyte)) << se;
//       thisval = ((val >> (len-thisbyte)) << se)&(mask);
//       len -= thisbyte;
//       this.info[sb] &= (!mask);
//       this.info[sb] |= thisval;
//       ++sb;
//       so=0;
//     }
//   }

  this.defaults = function() {
    this.chs('bit103',1);
    this.chs('bit117',1);
//     recovering = 0;
    this.encode();
  }

  this.encode = function() {
//     if (recovering) recovering = 0; else this.txs('msg','');
    this.txs('msg','');
    var n;
    /* Clear the password */
    for(n=0; n<24; ++n) this.info[n] = 0
    /* Add each input bit to it */
    for(n=95; n<138; ++n) {
      b = (n >> 3) + 1; /* silly... */
      /*      this.info[b] |= this.ch('bit' + n.toString()) << (n&7); */
    }
    for(n=95;n<138;++n) this.sb(n,parseInt(this.ch('bit' + n.toString())));
    /* Now do names and olives and other stuff */
    hero = this.tx('name1');
    for(n=0; n<6; ++n) {
	c = -1;
	if (n<hero.length)
	    c=this.letters.indexOf(hero.charAt(n));
	if (c<0) c=63;
	this.sr(17+6*n,6,c&63);
    }
    heroine = this.tx('name2');
    for(n=0; n<6; ++n) {
	c = -1;
	if (n<heroine.length)
	    c=this.letters.indexOf(heroine.charAt(n));
	if (c<0) c=63;
	this.sr(53+6*n,6,c&63);
    }
    /* Test if >99 or >31.  Then fix */
    olives = this.nm('olives');
    //    alert(parseInt(olives/10));
    this.sr(8,4,olives/10);
    this.sr(4,4,olives%10);
    this.sr(12,5,this.nm('skins'));
    this.sr(89,6,this.nm('life'));
    this.sr(0,4,this.id('loc'));

    this.calculate_password();
    this.updatepassword();
  }

  this.calculate_password = function() {
    /* Calculate, store first checksum */
    sum=0;
    for(n=0; n<23; ++n) sum -= this.gr(6*n,6);
    this.sr(-6,6,sum&63); /* "hidden" checksum location */
    //    alert('checksum: '+(sum&63).toString(16));
    
    // Maybe make a checkbox to fix the encoding or let it
    // float so that passwords look similar...
    this.roll_info(this.nm('enc'));
    //    this.decode()

  }

  this.roll_info = function(start) {
      cur = start; // go backwards twice to specify 3rd char
      //    cur = ((((((start-0x0a)&63)^(this.gr(0,6)))-0x38)&63)^(this.gr(-6,6)));
    cur = ((start-0x38)&63)^(this.gr(-6,6));
    sum = 0;
    this.chars[0] = cur;
    sum -= cur;
    msg='';
    for (var i=0;i<24;++i) {
      xor = this.gr(6*i-6,6);
      msg += (xor.toString(16) + ' ');
      add = this.adds[i%4];
      cur = ((cur^xor)+add)&63;
      this.chars[i+1] = cur;
      sum -= cur;
    }
    //    alert(msg);
    sum &= 63;
    this.chars[25] = sum;
  }

  this.unroll_info = function() {
    var sum = 0;
    var msg = '';
    for (var i=0;i<24;++i) {
      this.sr(6*i-6,6,this.chars[i]^((this.chars[i+1]-this.adds[i%4])&63));
      sum += this.chars[i];
      msg += this.gr(6*i-6,6).toString(16)+' ';
    }
    //    alert(msg);    
    sum += this.chars[24]+this.chars[25];
    
    return sum;
  }

  this.updatepassword = function() {
    var s = '';
    for (var n=0;n<26;++n) {
      s += this.letters.charAt(this.chars[n]);
    }
//    this.txs('l1', s.substr(0, 6)+ ' ' + s.substr( 6,7))
//    this.txs('l2', s.substr(13,6)+ ' ' + s.substr(19,7))
    this.tas('l3', s.substr(0, 6)+ ' ' + s.substr( 6,7)+ ' ' + s.substr(13,6)+ ' ' + s.substr(19,7))
  }

  this.decode = function() {
    var error = 0;
    var message = '';
//    var l1 = this.tx('l1');
//    var l2 = this.tx('l2');
    var l3 = this.ta('l3');
	//alert(this.chars);
//	alert (l3.length);
	alert(this.ta('l3'));
    for(var n=0; n<7; ++n) {
      //if (n!=7) this.chars[n] = this.letters.indexOf(l1.charAt(n));
      //this.chars[n+6] = this.letters.indexOf(l1.charAt(n+7));
      //if (n!=7) this.chars[n+13] = this.letters.indexOf(l2.charAt(n));
      //this.chars[n+19] = this.letters.indexOf(l2.charAt(n+7));
      if(n==7) alert("n = 7");
      this.chars[n] = this.letters.indexOf(l3.charAt(n));
      this.chars[n+6] = this.letters.indexOf(l3.charAt(n+6));
      this.chars[n+13] = this.letters.indexOf(l3.charAt(n+13));
      this.chars[n+19] = this.letters.indexOf(l3.charAt(n+19));
      
    }
//	alert(this.chars);
    if (this.unroll_info()!=0) {
      error |= 2;
      message = 'Bad checksum(s). ';
    }
    var sum=0;
    for(n=-1; n<23; ++n) sum += this.gr(6*n,6);
    if (sum&63!=0) {
      error |= 2;
      message = 'Bad checksum(s). ';
    }
//     this.ids('enc',this.chars[2]); /* encoding is 3rd char */
    this.ids('enc',this.chars[1]); /* encoding is 3rd char */

    this.ids('loc',this.gr(0,4));
    var olives = this.gr(4,4)+10*this.gr(8,4);
    if (olives>99) { error |= 1; olives = 99; }
    if (this.gr(4,4)>9) { error |= 1; olives = 99; }
    this.txs('olives',olives.toString());
    this.txs('skins',this.gr(12,5).toString());
    this.txs('life',this.gr(89,6).toString());

    var n;
    for(n=95;n<138;++n) this.chs('bit'+n.toString(),this.gb(n));
    var hero = ''; var ended=0;
    for(n=0; n<6; ++n) {
	c = this.letters.charAt(this.gr(17+6*n,6));
	if (c!='!') { 
	  if (!ended) hero += c;
	  else error |= 1;
	}
	else { ended=1; }
    }
    var heroine = '';
    for(n=0; n<6; ++n) {
	c = this.letters.charAt(this.gr(53+6*n,6));
	if (c!='!') { 
	  if (!ended) heroine += c;
	  else error |= 1;
	}
	else { ended=1; }
    }
    this.txs('name1',hero);
    this.txs('name2',heroine);
    this.txs('msg','');
    if (error==1) {
      this.txs('msg','Valid but not authentic');
    } else if (error>1) {
      this.txs('msg','Failed checksum');
//       recovering=1;
//       this.encode();
//      this.calculate_password();
//      this.updatepassword();
    }
    //    alert(error);
  }
}

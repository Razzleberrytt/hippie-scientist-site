import{g as dr,_ as ys,R as oc,j as Ze,W as El}from"./main-3fc9fb98.js";var Ic={exports:{}};(function(i,e){(function(t,r){r()})(dr,function(){function t(m,v){return typeof v>"u"?v={autoBom:!1}:typeof v!="object"&&(console.warn("Deprecated: Expected third argument to be a object"),v={autoBom:!v}),v.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(m.type)?new Blob(["\uFEFF",m],{type:m.type}):m}function r(m,v,b){var x=new XMLHttpRequest;x.open("GET",m),x.responseType="blob",x.onload=function(){h(x.response,v,b)},x.onerror=function(){console.error("could not download file")},x.send()}function c(m){var v=new XMLHttpRequest;v.open("HEAD",m,!1);try{v.send()}catch{}return 200<=v.status&&299>=v.status}function o(m){try{m.dispatchEvent(new MouseEvent("click"))}catch{var v=document.createEvent("MouseEvents");v.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),m.dispatchEvent(v)}}var l=typeof window=="object"&&window.window===window?window:typeof self=="object"&&self.self===self?self:typeof dr=="object"&&dr.global===dr?dr:void 0,d=l.navigator&&/Macintosh/.test(navigator.userAgent)&&/AppleWebKit/.test(navigator.userAgent)&&!/Safari/.test(navigator.userAgent),h=l.saveAs||(typeof window!="object"||window!==l?function(){}:"download"in HTMLAnchorElement.prototype&&!d?function(m,v,b){var x=l.URL||l.webkitURL,p=document.createElement("a");v=v||m.name||"download",p.download=v,p.rel="noopener",typeof m=="string"?(p.href=m,p.origin===location.origin?o(p):c(p.href)?r(m,v,b):o(p,p.target="_blank")):(p.href=x.createObjectURL(m),setTimeout(function(){x.revokeObjectURL(p.href)},4e4),setTimeout(function(){o(p)},0))}:"msSaveOrOpenBlob"in navigator?function(m,v,b){if(v=v||m.name||"download",typeof m!="string")navigator.msSaveOrOpenBlob(t(m,b),v);else if(c(m))r(m,v,b);else{var x=document.createElement("a");x.href=m,x.target="_blank",setTimeout(function(){o(x)})}}:function(m,v,b,x){if(x=x||open("","_blank"),x&&(x.document.title=x.document.body.innerText="downloading..."),typeof m=="string")return r(m,v,b);var p=m.type==="application/octet-stream",D=/constructor/i.test(l.HTMLElement)||l.safari,P=/CriOS\/[\d]+/.test(navigator.userAgent);if((P||p&&D||d)&&typeof FileReader<"u"){var U=new FileReader;U.onloadend=function(){var W=U.result;W=P?W:W.replace(/^data:[^;]*;/,"data:attachment/file;"),x?x.location.href=W:location=W,x=null},U.readAsDataURL(m)}else{var S=l.URL||l.webkitURL,E=S.createObjectURL(m);x?x.location=E:location.href=E,x=null,setTimeout(function(){S.revokeObjectURL(E)},4e4)}});l.saveAs=h.saveAs=h,i.exports=h})})(Ic);var sc=Ic.exports;function fe(i){"@babel/helpers - typeof";return fe=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},fe(i)}var tt=Uint8Array,vt=Uint16Array,Is=Int32Array,yo=new tt([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),vo=new tt([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),vs=new tt([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),_c=function(i,e){for(var t=new vt(31),r=0;r<31;++r)t[r]=e+=1<<i[r-1];for(var c=new Is(t[30]),r=1;r<30;++r)for(var o=t[r];o<t[r+1];++o)c[o]=o-t[r]<<5|r;return{b:t,r:c}},Oc=_c(yo,2),Mc=Oc.b,bs=Oc.r;Mc[28]=258,bs[258]=28;var Dc=_c(vo,0),Rl=Dc.b,cc=Dc.r,ws=new vt(32768);for(var Ae=0;Ae<32768;++Ae){var Ii=(Ae&43690)>>1|(Ae&21845)<<1;Ii=(Ii&52428)>>2|(Ii&13107)<<2,Ii=(Ii&61680)>>4|(Ii&3855)<<4,ws[Ae]=((Ii&65280)>>8|(Ii&255)<<8)>>1}var ei=function(i,e,t){for(var r=i.length,c=0,o=new vt(e);c<r;++c)i[c]&&++o[i[c]-1];var l=new vt(e);for(c=1;c<e;++c)l[c]=l[c-1]+o[c-1]<<1;var d;if(t){d=new vt(1<<e);var h=15-e;for(c=0;c<r;++c)if(i[c])for(var m=c<<4|i[c],v=e-i[c],b=l[i[c]-1]++<<v,x=b|(1<<v)-1;b<=x;++b)d[ws[b]>>h]=m}else for(d=new vt(r),c=0;c<r;++c)i[c]&&(d[c]=ws[l[i[c]-1]++]>>15-i[c]);return d},Mi=new tt(288);for(var Ae=0;Ae<144;++Ae)Mi[Ae]=8;for(var Ae=144;Ae<256;++Ae)Mi[Ae]=9;for(var Ae=256;Ae<280;++Ae)Mi[Ae]=7;for(var Ae=280;Ae<288;++Ae)Mi[Ae]=8;var mr=new tt(32);for(var Ae=0;Ae<32;++Ae)mr[Ae]=5;var Fl=ei(Mi,9,0),Ul=ei(Mi,9,1),jl=ei(mr,5,0),Tl=ei(mr,5,1),cs=function(i){for(var e=i[0],t=1;t<i.length;++t)i[t]>e&&(e=i[t]);return e},jt=function(i,e,t){var r=e/8|0;return(i[r]|i[r+1]<<8)>>(e&7)&t},ls=function(i,e){var t=e/8|0;return(i[t]|i[t+1]<<8|i[t+2]<<16)>>(e&7)},_s=function(i){return(i+7)/8|0},Ec=function(i,e,t){return(e==null||e<0)&&(e=0),(t==null||t>i.length)&&(t=i.length),new tt(i.subarray(e,t))},Bl=["unexpected EOF","invalid block type","invalid length/literal","invalid distance","stream finished","no stream handler",,"no callback","invalid UTF-8 data","extra field too long","date not in range 1980-2099","filename too long","stream finishing","invalid zip data"],Bt=function(i,e,t){var r=new Error(e||Bl[i]);if(r.code=i,Error.captureStackTrace&&Error.captureStackTrace(r,Bt),!t)throw r;return r},ql=function(i,e,t,r){var c=i.length,o=r?r.length:0;if(!c||e.f&&!e.l)return t||new tt(0);var l=!t,d=l||e.i!=2,h=e.i;l&&(t=new tt(c*3));var m=function(Ln){var _n=t.length;if(Ln>_n){var Cn=new tt(Math.max(_n*2,Ln));Cn.set(t),t=Cn}},v=e.f||0,b=e.p||0,x=e.b||0,p=e.l,D=e.d,P=e.m,U=e.n,S=c*8;do{if(!p){v=jt(i,b,1);var E=jt(i,b+1,3);if(b+=3,E)if(E==1)p=Ul,D=Tl,P=9,U=5;else if(E==2){var An=jt(i,b,31)+257,nn=jt(i,b+10,15)+4,q=An+jt(i,b+5,31)+1;b+=14;for(var an=new tt(q),mn=new tt(19),C=0;C<nn;++C)mn[vs[C]]=jt(i,b+C*3,7);b+=nn*3;for(var I=cs(mn),G=(1<<I)-1,j=ei(mn,I,1),C=0;C<q;){var cn=j[jt(i,b,G)];b+=cn&15;var W=cn>>4;if(W<16)an[C++]=W;else{var rn=0,hn=0;for(W==16?(hn=3+jt(i,b,3),b+=2,rn=an[C-1]):W==17?(hn=3+jt(i,b,7),b+=3):W==18&&(hn=11+jt(i,b,127),b+=7);hn--;)an[C++]=rn}}var $=an.subarray(0,An),un=an.subarray(An);P=cs($),U=cs(un),p=ei($,P,1),D=ei(un,U,1)}else Bt(1);else{var W=_s(b)+4,sn=i[W-4]|i[W-3]<<8,dn=W+sn;if(dn>c){h&&Bt(0);break}d&&m(x+sn),t.set(i.subarray(W,dn),x),e.b=x+=sn,e.p=b=dn*8,e.f=v;continue}if(b>S){h&&Bt(0);break}}d&&m(x+131072);for(var pn=(1<<P)-1,Dn=(1<<U)-1,L=b;;L=b){var rn=p[ls(i,b)&pn],O=rn>>4;if(b+=rn&15,b>S){h&&Bt(0);break}if(rn||Bt(2),O<256)t[x++]=O;else if(O==256){L=b,p=null;break}else{var R=O-254;if(O>264){var C=O-257,B=yo[C];R=jt(i,b,(1<<B)-1)+Mc[C],b+=B}var Y=D[ls(i,b)&Dn],Q=Y>>4;Y||Bt(3),b+=Y&15;var un=Rl[Q];if(Q>3){var B=vo[Q];un+=ls(i,b)&(1<<B)-1,b+=B}if(b>S){h&&Bt(0);break}d&&m(x+131072);var en=x+R;if(x<un){var tn=o-un,kn=Math.min(un,en);for(tn+x<0&&Bt(3);x<kn;++x)t[x]=r[tn+x]}for(;x<en;++x)t[x]=t[x-un]}}e.l=p,e.p=L,e.b=x,e.f=v,p&&(v=1,e.m=P,e.d=D,e.n=U)}while(!v);return x!=t.length&&l?Ec(t,0,x):t.subarray(0,x)},pi=function(i,e,t){t<<=e&7;var r=e/8|0;i[r]|=t,i[r+1]|=t>>8},hr=function(i,e,t){t<<=e&7;var r=e/8|0;i[r]|=t,i[r+1]|=t>>8,i[r+2]|=t>>16},us=function(i,e){for(var t=[],r=0;r<i.length;++r)i[r]&&t.push({s:r,f:i[r]});var c=t.length,o=t.slice();if(!c)return{t:Fc,l:0};if(c==1){var l=new tt(t[0].s+1);return l[t[0].s]=1,{t:l,l:1}}t.sort(function(dn,An){return dn.f-An.f}),t.push({s:-1,f:25001});var d=t[0],h=t[1],m=0,v=1,b=2;for(t[0]={s:-1,f:d.f+h.f,l:d,r:h};v!=c-1;)d=t[t[m].f<t[b].f?m++:b++],h=t[m!=v&&t[m].f<t[b].f?m++:b++],t[v++]={s:-1,f:d.f+h.f,l:d,r:h};for(var x=o[0].s,r=1;r<c;++r)o[r].s>x&&(x=o[r].s);var p=new vt(x+1),D=As(t[v-1],p,0);if(D>e){var r=0,P=0,U=D-e,S=1<<U;for(o.sort(function(An,nn){return p[nn.s]-p[An.s]||An.f-nn.f});r<c;++r){var E=o[r].s;if(p[E]>e)P+=S-(1<<D-p[E]),p[E]=e;else break}for(P>>=U;P>0;){var W=o[r].s;p[W]<e?P-=1<<e-p[W]++-1:++r}for(;r>=0&&P;--r){var sn=o[r].s;p[sn]==e&&(--p[sn],++P)}D=e}return{t:new tt(p),l:D}},As=function(i,e,t){return i.s==-1?Math.max(As(i.l,e,t+1),As(i.r,e,t+1)):e[i.s]=t},lc=function(i){for(var e=i.length;e&&!i[--e];);for(var t=new vt(++e),r=0,c=i[0],o=1,l=function(h){t[r++]=h},d=1;d<=e;++d)if(i[d]==c&&d!=e)++o;else{if(!c&&o>2){for(;o>138;o-=138)l(32754);o>2&&(l(o>10?o-11<<5|28690:o-3<<5|12305),o=0)}else if(o>3){for(l(c),--o;o>6;o-=6)l(8304);o>2&&(l(o-3<<5|8208),o=0)}for(;o--;)l(c);o=1,c=i[d]}return{c:t.subarray(0,r),n:e}},fr=function(i,e){for(var t=0,r=0;r<e.length;++r)t+=i[r]*e[r];return t},Rc=function(i,e,t){var r=t.length,c=_s(e+2);i[c]=r&255,i[c+1]=r>>8,i[c+2]=i[c]^255,i[c+3]=i[c+1]^255;for(var o=0;o<r;++o)i[c+o+4]=t[o];return(c+4+r)*8},uc=function(i,e,t,r,c,o,l,d,h,m,v){pi(e,v++,t),++c[256];for(var b=us(c,15),x=b.t,p=b.l,D=us(o,15),P=D.t,U=D.l,S=lc(x),E=S.c,W=S.n,sn=lc(P),dn=sn.c,An=sn.n,nn=new vt(19),q=0;q<E.length;++q)++nn[E[q]&31];for(var q=0;q<dn.length;++q)++nn[dn[q]&31];for(var an=us(nn,7),mn=an.t,C=an.l,I=19;I>4&&!mn[vs[I-1]];--I);var G=m+5<<3,j=fr(c,Mi)+fr(o,mr)+l,cn=fr(c,x)+fr(o,P)+l+14+3*I+fr(nn,mn)+2*nn[16]+3*nn[17]+7*nn[18];if(h>=0&&G<=j&&G<=cn)return Rc(e,v,i.subarray(h,h+m));var rn,hn,$,un;if(pi(e,v,1+(cn<j)),v+=2,cn<j){rn=ei(x,p,0),hn=x,$=ei(P,U,0),un=P;var pn=ei(mn,C,0);pi(e,v,W-257),pi(e,v+5,An-1),pi(e,v+10,I-4),v+=14;for(var q=0;q<I;++q)pi(e,v+3*q,mn[vs[q]]);v+=3*I;for(var Dn=[E,dn],L=0;L<2;++L)for(var O=Dn[L],q=0;q<O.length;++q){var R=O[q]&31;pi(e,v,pn[R]),v+=mn[R],R>15&&(pi(e,v,O[q]>>5&127),v+=O[q]>>12)}}else rn=Fl,hn=Mi,$=jl,un=mr;for(var q=0;q<d;++q){var B=r[q];if(B>255){var R=B>>18&31;hr(e,v,rn[R+257]),v+=hn[R+257],R>7&&(pi(e,v,B>>23&31),v+=yo[R]);var Y=B&31;hr(e,v,$[Y]),v+=un[Y],Y>3&&(hr(e,v,B>>5&8191),v+=vo[Y])}else hr(e,v,rn[B]),v+=hn[B]}return hr(e,v,rn[256]),v+hn[256]},zl=new Is([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),Fc=new tt(0),Hl=function(i,e,t,r,c,o){var l=o.z||i.length,d=new tt(r+l+5*(1+Math.ceil(l/7e3))+c),h=d.subarray(r,d.length-c),m=o.l,v=(o.r||0)&7;if(e){v&&(h[0]=o.r>>3);for(var b=zl[e-1],x=b>>13,p=b&8191,D=(1<<t)-1,P=o.p||new vt(32768),U=o.h||new vt(D+1),S=Math.ceil(t/3),E=2*S,W=function(zn){return(i[zn]^i[zn+1]<<S^i[zn+2]<<E)&D},sn=new Is(25e3),dn=new vt(288),An=new vt(32),nn=0,q=0,an=o.i||0,mn=0,C=o.w||0,I=0;an+2<l;++an){var G=W(an),j=an&32767,cn=U[G];if(P[j]=cn,U[G]=j,C<=an){var rn=l-an;if((nn>7e3||mn>24576)&&(rn>423||!m)){v=uc(i,h,0,sn,dn,An,q,mn,I,an-I,v),mn=nn=q=0,I=an;for(var hn=0;hn<286;++hn)dn[hn]=0;for(var hn=0;hn<30;++hn)An[hn]=0}var $=2,un=0,pn=p,Dn=j-cn&32767;if(rn>2&&G==W(an-Dn))for(var L=Math.min(x,rn)-1,O=Math.min(32767,an),R=Math.min(258,rn);Dn<=O&&--pn&&j!=cn;){if(i[an+$]==i[an+$-Dn]){for(var B=0;B<R&&i[an+B]==i[an+B-Dn];++B);if(B>$){if($=B,un=Dn,B>L)break;for(var Y=Math.min(Dn,B-2),Q=0,hn=0;hn<Y;++hn){var en=an-Dn+hn&32767,tn=P[en],kn=en-tn&32767;kn>Q&&(Q=kn,cn=en)}}}j=cn,cn=P[j],Dn+=j-cn&32767}if(un){sn[mn++]=268435456|bs[$]<<18|cc[un];var Ln=bs[$]&31,_n=cc[un]&31;q+=yo[Ln]+vo[_n],++dn[257+Ln],++An[_n],C=an+$,++nn}else sn[mn++]=i[an],++dn[i[an]]}}for(an=Math.max(an,C);an<l;++an)sn[mn++]=i[an],++dn[i[an]];v=uc(i,h,m,sn,dn,An,q,mn,I,an-I,v),m||(o.r=v&7|h[v/8|0]<<3,v-=7,o.h=U,o.p=P,o.i=an,o.w=C)}else{for(var an=o.w||0;an<l+m;an+=65535){var Cn=an+65535;Cn>=l&&(h[v/8|0]=m,Cn=l),v=Rc(h,v+1,i.subarray(an,Cn))}o.i=l}return Ec(d,0,r+_s(v)+c)},Uc=function(){var i=1,e=0;return{p:function(t){for(var r=i,c=e,o=t.length|0,l=0;l!=o;){for(var d=Math.min(l+2655,o);l<d;++l)c+=r+=t[l];r=(r&65535)+15*(r>>16),c=(c&65535)+15*(c>>16)}i=r,e=c},d:function(){return i%=65521,e%=65521,(i&255)<<24|(i&65280)<<8|(e&255)<<8|e>>8}}},Gl=function(i,e,t,r,c){if(!c&&(c={l:1},e.dictionary)){var o=e.dictionary.subarray(-32768),l=new tt(o.length+i.length);l.set(o),l.set(i,o.length),i=l,c.w=o.length}return Hl(i,e.level==null?6:e.level,e.mem==null?c.l?Math.ceil(Math.max(8,Math.min(13,Math.log(i.length)))*1.5):20:12+e.mem,t,r,c)},jc=function(i,e,t){for(;t;++e)i[e]=t,t>>>=8},Vl=function(i,e){var t=e.level,r=t==0?0:t<6?1:t==9?3:2;if(i[0]=120,i[1]=r<<6|(e.dictionary&&32),i[1]|=31-(i[0]<<8|i[1])%31,e.dictionary){var c=Uc();c.p(e.dictionary),jc(i,2,c.d())}},Wl=function(i,e){return((i[0]&15)!=8||i[0]>>4>7||(i[0]<<8|i[1])%31)&&Bt(6,"invalid zlib data"),(i[1]>>5&1)==+!e&&Bt(6,"invalid zlib data: "+(i[1]&32?"need":"unexpected")+" dictionary"),(i[1]>>3&4)+2};function xs(i,e){e||(e={});var t=Uc();t.p(i);var r=Gl(i,e,e.dictionary?6:2,4);return Vl(r,e),jc(r,r.length-4,t.d()),r}function Jl(i,e){return ql(i.subarray(Wl(i,e&&e.dictionary),-4),{i:2},e&&e.out,e&&e.dictionary)}var Yl=typeof TextDecoder<"u"&&new TextDecoder,Kl=0;try{Yl.decode(Fc,{stream:!0}),Kl=1}catch{}var Gn=function(){return typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:this}();function ds(){Gn.console&&typeof Gn.console.log=="function"&&Gn.console.log.apply(Gn.console,arguments)}var ve={log:ds,warn:function(i){Gn.console&&(typeof Gn.console.warn=="function"?Gn.console.warn.apply(Gn.console,arguments):ds.call(null,arguments))},error:function(i){Gn.console&&(typeof Gn.console.error=="function"?Gn.console.error.apply(Gn.console,arguments):ds(i))}};function hs(i,e,t){var r=new XMLHttpRequest;r.open("GET",i),r.responseType="blob",r.onload=function(){Ji(r.response,e,t)},r.onerror=function(){ve.error("could not download file")},r.send()}function dc(i){var e=new XMLHttpRequest;e.open("HEAD",i,!1);try{e.send()}catch{}return e.status>=200&&e.status<=299}function oo(i){try{i.dispatchEvent(new MouseEvent("click"))}catch{var e=document.createEvent("MouseEvents");e.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),i.dispatchEvent(e)}}var pr,Ls,Ji=Gn.saveAs||((typeof window>"u"?"undefined":fe(window))!=="object"||window!==Gn?function(){}:typeof HTMLAnchorElement<"u"&&"download"in HTMLAnchorElement.prototype?function(i,e,t){var r=Gn.URL||Gn.webkitURL,c=document.createElement("a");e=e||i.name||"download",c.download=e,c.rel="noopener",typeof i=="string"?(c.href=i,c.origin!==location.origin?dc(c.href)?hs(i,e,t):oo(c,c.target="_blank"):oo(c)):(c.href=r.createObjectURL(i),setTimeout(function(){r.revokeObjectURL(c.href)},4e4),setTimeout(function(){oo(c)},0))}:"msSaveOrOpenBlob"in navigator?function(i,e,t){if(e=e||i.name||"download",typeof i=="string")if(dc(i))hs(i,e,t);else{var r=document.createElement("a");r.href=i,r.target="_blank",setTimeout(function(){oo(r)})}else navigator.msSaveOrOpenBlob(function(c,o){return o===void 0?o={autoBom:!1}:fe(o)!=="object"&&(ve.warn("Deprecated: Expected third argument to be a object"),o={autoBom:!o}),o.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(c.type)?new Blob([String.fromCharCode(65279),c],{type:c.type}):c}(i,t),e)}:function(i,e,t,r){if((r=r||open("","_blank"))&&(r.document.title=r.document.body.innerText="downloading..."),typeof i=="string")return hs(i,e,t);var c=i.type==="application/octet-stream",o=/constructor/i.test(Gn.HTMLElement)||Gn.safari,l=/CriOS\/[\d]+/.test(navigator.userAgent);if((l||c&&o)&&(typeof FileReader>"u"?"undefined":fe(FileReader))==="object"){var d=new FileReader;d.onloadend=function(){var v=d.result;v=l?v:v.replace(/^data:[^;]*;/,"data:attachment/file;"),r?r.location.href=v:location=v,r=null},d.readAsDataURL(i)}else{var h=Gn.URL||Gn.webkitURL,m=h.createObjectURL(i);r?r.location=m:location.href=m,r=null,setTimeout(function(){h.revokeObjectURL(m)},4e4)}});/**
 * A class to parse color values
 * @author Stoyan Stefanov <sstoo@gmail.com>
 * {@link   http://www.phpied.com/rgb-color-parser-in-javascript/}
 * @license Use it if you like it
 */function Tc(i){var e;i=i||"",this.ok=!1,i.charAt(0)=="#"&&(i=i.substr(1,6)),i={aliceblue:"f0f8ff",antiquewhite:"faebd7",aqua:"00ffff",aquamarine:"7fffd4",azure:"f0ffff",beige:"f5f5dc",bisque:"ffe4c4",black:"000000",blanchedalmond:"ffebcd",blue:"0000ff",blueviolet:"8a2be2",brown:"a52a2a",burlywood:"deb887",cadetblue:"5f9ea0",chartreuse:"7fff00",chocolate:"d2691e",coral:"ff7f50",cornflowerblue:"6495ed",cornsilk:"fff8dc",crimson:"dc143c",cyan:"00ffff",darkblue:"00008b",darkcyan:"008b8b",darkgoldenrod:"b8860b",darkgray:"a9a9a9",darkgreen:"006400",darkkhaki:"bdb76b",darkmagenta:"8b008b",darkolivegreen:"556b2f",darkorange:"ff8c00",darkorchid:"9932cc",darkred:"8b0000",darksalmon:"e9967a",darkseagreen:"8fbc8f",darkslateblue:"483d8b",darkslategray:"2f4f4f",darkturquoise:"00ced1",darkviolet:"9400d3",deeppink:"ff1493",deepskyblue:"00bfff",dimgray:"696969",dodgerblue:"1e90ff",feldspar:"d19275",firebrick:"b22222",floralwhite:"fffaf0",forestgreen:"228b22",fuchsia:"ff00ff",gainsboro:"dcdcdc",ghostwhite:"f8f8ff",gold:"ffd700",goldenrod:"daa520",gray:"808080",green:"008000",greenyellow:"adff2f",honeydew:"f0fff0",hotpink:"ff69b4",indianred:"cd5c5c",indigo:"4b0082",ivory:"fffff0",khaki:"f0e68c",lavender:"e6e6fa",lavenderblush:"fff0f5",lawngreen:"7cfc00",lemonchiffon:"fffacd",lightblue:"add8e6",lightcoral:"f08080",lightcyan:"e0ffff",lightgoldenrodyellow:"fafad2",lightgrey:"d3d3d3",lightgreen:"90ee90",lightpink:"ffb6c1",lightsalmon:"ffa07a",lightseagreen:"20b2aa",lightskyblue:"87cefa",lightslateblue:"8470ff",lightslategray:"778899",lightsteelblue:"b0c4de",lightyellow:"ffffe0",lime:"00ff00",limegreen:"32cd32",linen:"faf0e6",magenta:"ff00ff",maroon:"800000",mediumaquamarine:"66cdaa",mediumblue:"0000cd",mediumorchid:"ba55d3",mediumpurple:"9370d8",mediumseagreen:"3cb371",mediumslateblue:"7b68ee",mediumspringgreen:"00fa9a",mediumturquoise:"48d1cc",mediumvioletred:"c71585",midnightblue:"191970",mintcream:"f5fffa",mistyrose:"ffe4e1",moccasin:"ffe4b5",navajowhite:"ffdead",navy:"000080",oldlace:"fdf5e6",olive:"808000",olivedrab:"6b8e23",orange:"ffa500",orangered:"ff4500",orchid:"da70d6",palegoldenrod:"eee8aa",palegreen:"98fb98",paleturquoise:"afeeee",palevioletred:"d87093",papayawhip:"ffefd5",peachpuff:"ffdab9",peru:"cd853f",pink:"ffc0cb",plum:"dda0dd",powderblue:"b0e0e6",purple:"800080",red:"ff0000",rosybrown:"bc8f8f",royalblue:"4169e1",saddlebrown:"8b4513",salmon:"fa8072",sandybrown:"f4a460",seagreen:"2e8b57",seashell:"fff5ee",sienna:"a0522d",silver:"c0c0c0",skyblue:"87ceeb",slateblue:"6a5acd",slategray:"708090",snow:"fffafa",springgreen:"00ff7f",steelblue:"4682b4",tan:"d2b48c",teal:"008080",thistle:"d8bfd8",tomato:"ff6347",turquoise:"40e0d0",violet:"ee82ee",violetred:"d02090",wheat:"f5deb3",white:"ffffff",whitesmoke:"f5f5f5",yellow:"ffff00",yellowgreen:"9acd32"}[i=(i=i.replace(/ /g,"")).toLowerCase()]||i;for(var t=[{re:/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,example:["rgb(123, 234, 45)","rgb(255,234,245)"],process:function(d){return[parseInt(d[1]),parseInt(d[2]),parseInt(d[3])]}},{re:/^(\w{2})(\w{2})(\w{2})$/,example:["#00ff00","336699"],process:function(d){return[parseInt(d[1],16),parseInt(d[2],16),parseInt(d[3],16)]}},{re:/^(\w{1})(\w{1})(\w{1})$/,example:["#fb0","f0f"],process:function(d){return[parseInt(d[1]+d[1],16),parseInt(d[2]+d[2],16),parseInt(d[3]+d[3],16)]}}],r=0;r<t.length;r++){var c=t[r].re,o=t[r].process,l=c.exec(i);l&&(e=o(l),this.r=e[0],this.g=e[1],this.b=e[2],this.ok=!0)}this.r=this.r<0||isNaN(this.r)?0:this.r>255?255:this.r,this.g=this.g<0||isNaN(this.g)?0:this.g>255?255:this.g,this.b=this.b<0||isNaN(this.b)?0:this.b>255?255:this.b,this.toRGB=function(){return"rgb("+this.r+", "+this.g+", "+this.b+")"},this.toHex=function(){var d=this.r.toString(16),h=this.g.toString(16),m=this.b.toString(16);return d.length==1&&(d="0"+d),h.length==1&&(h="0"+h),m.length==1&&(m="0"+m),"#"+d+h+m}}/**
 * @license
 * Joseph Myers does not specify a particular license for his work.
 *
 * Author: Joseph Myers
 * Accessed from: http://www.myersdaily.org/joseph/javascript/md5.js
 *
 * Modified by: Owen Leong
 */function fs(i,e){var t=i[0],r=i[1],c=i[2],o=i[3];t=$e(t,r,c,o,e[0],7,-680876936),o=$e(o,t,r,c,e[1],12,-389564586),c=$e(c,o,t,r,e[2],17,606105819),r=$e(r,c,o,t,e[3],22,-1044525330),t=$e(t,r,c,o,e[4],7,-176418897),o=$e(o,t,r,c,e[5],12,1200080426),c=$e(c,o,t,r,e[6],17,-1473231341),r=$e(r,c,o,t,e[7],22,-45705983),t=$e(t,r,c,o,e[8],7,1770035416),o=$e(o,t,r,c,e[9],12,-1958414417),c=$e(c,o,t,r,e[10],17,-42063),r=$e(r,c,o,t,e[11],22,-1990404162),t=$e(t,r,c,o,e[12],7,1804603682),o=$e(o,t,r,c,e[13],12,-40341101),c=$e(c,o,t,r,e[14],17,-1502002290),t=Qe(t,r=$e(r,c,o,t,e[15],22,1236535329),c,o,e[1],5,-165796510),o=Qe(o,t,r,c,e[6],9,-1069501632),c=Qe(c,o,t,r,e[11],14,643717713),r=Qe(r,c,o,t,e[0],20,-373897302),t=Qe(t,r,c,o,e[5],5,-701558691),o=Qe(o,t,r,c,e[10],9,38016083),c=Qe(c,o,t,r,e[15],14,-660478335),r=Qe(r,c,o,t,e[4],20,-405537848),t=Qe(t,r,c,o,e[9],5,568446438),o=Qe(o,t,r,c,e[14],9,-1019803690),c=Qe(c,o,t,r,e[3],14,-187363961),r=Qe(r,c,o,t,e[8],20,1163531501),t=Qe(t,r,c,o,e[13],5,-1444681467),o=Qe(o,t,r,c,e[2],9,-51403784),c=Qe(c,o,t,r,e[7],14,1735328473),t=nt(t,r=Qe(r,c,o,t,e[12],20,-1926607734),c,o,e[5],4,-378558),o=nt(o,t,r,c,e[8],11,-2022574463),c=nt(c,o,t,r,e[11],16,1839030562),r=nt(r,c,o,t,e[14],23,-35309556),t=nt(t,r,c,o,e[1],4,-1530992060),o=nt(o,t,r,c,e[4],11,1272893353),c=nt(c,o,t,r,e[7],16,-155497632),r=nt(r,c,o,t,e[10],23,-1094730640),t=nt(t,r,c,o,e[13],4,681279174),o=nt(o,t,r,c,e[0],11,-358537222),c=nt(c,o,t,r,e[3],16,-722521979),r=nt(r,c,o,t,e[6],23,76029189),t=nt(t,r,c,o,e[9],4,-640364487),o=nt(o,t,r,c,e[12],11,-421815835),c=nt(c,o,t,r,e[15],16,530742520),t=et(t,r=nt(r,c,o,t,e[2],23,-995338651),c,o,e[0],6,-198630844),o=et(o,t,r,c,e[7],10,1126891415),c=et(c,o,t,r,e[14],15,-1416354905),r=et(r,c,o,t,e[5],21,-57434055),t=et(t,r,c,o,e[12],6,1700485571),o=et(o,t,r,c,e[3],10,-1894986606),c=et(c,o,t,r,e[10],15,-1051523),r=et(r,c,o,t,e[1],21,-2054922799),t=et(t,r,c,o,e[8],6,1873313359),o=et(o,t,r,c,e[15],10,-30611744),c=et(c,o,t,r,e[6],15,-1560198380),r=et(r,c,o,t,e[13],21,1309151649),t=et(t,r,c,o,e[4],6,-145523070),o=et(o,t,r,c,e[11],10,-1120210379),c=et(c,o,t,r,e[2],15,718787259),r=et(r,c,o,t,e[9],21,-343485551),i[0]=Oi(t,i[0]),i[1]=Oi(r,i[1]),i[2]=Oi(c,i[2]),i[3]=Oi(o,i[3])}function bo(i,e,t,r,c,o){return e=Oi(Oi(e,i),Oi(r,o)),Oi(e<<c|e>>>32-c,t)}function $e(i,e,t,r,c,o,l){return bo(e&t|~e&r,i,e,c,o,l)}function Qe(i,e,t,r,c,o,l){return bo(e&r|t&~r,i,e,c,o,l)}function nt(i,e,t,r,c,o,l){return bo(e^t^r,i,e,c,o,l)}function et(i,e,t,r,c,o,l){return bo(t^(e|~r),i,e,c,o,l)}function Bc(i){var e,t=i.length,r=[1732584193,-271733879,-1732584194,271733878];for(e=64;e<=i.length;e+=64)fs(r,Xl(i.substring(e-64,e)));i=i.substring(e-64);var c=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];for(e=0;e<i.length;e++)c[e>>2]|=i.charCodeAt(e)<<(e%4<<3);if(c[e>>2]|=128<<(e%4<<3),e>55)for(fs(r,c),e=0;e<16;e++)c[e]=0;return c[14]=8*t,fs(r,c),r}function Xl(i){var e,t=[];for(e=0;e<64;e+=4)t[e>>2]=i.charCodeAt(e)+(i.charCodeAt(e+1)<<8)+(i.charCodeAt(e+2)<<16)+(i.charCodeAt(e+3)<<24);return t}pr=Gn.atob.bind(Gn),Ls=Gn.btoa.bind(Gn);var hc="0123456789abcdef".split("");function Zl(i){for(var e="",t=0;t<4;t++)e+=hc[i>>8*t+4&15]+hc[i>>8*t&15];return e}function $l(i){return String.fromCharCode((255&i)>>0,(65280&i)>>8,(16711680&i)>>16,(4278190080&i)>>24)}function ks(i){return Bc(i).map($l).join("")}var Ql=function(i){for(var e=0;e<i.length;e++)i[e]=Zl(i[e]);return i.join("")}(Bc("hello"))!="5d41402abc4b2a76b9719d911017c592";function Oi(i,e){if(Ql){var t=(65535&i)+(65535&e);return(i>>16)+(e>>16)+(t>>16)<<16|65535&t}return i+e&4294967295}/**
 * @license
 * FPDF is released under a permissive license: there is no usage restriction.
 * You may embed it freely in your application (commercial or not), with or
 * without modifications.
 *
 * Reference: http://www.fpdf.org/en/script/script37.php
 */function Ns(i,e){var t,r,c,o;if(i!==t){for(var l=(c=i,o=1+(256/i.length>>0),new Array(o+1).join(c)),d=[],h=0;h<256;h++)d[h]=h;var m=0;for(h=0;h<256;h++){var v=d[h];m=(m+v+l.charCodeAt(h))%256,d[h]=d[m],d[m]=v}t=i,r=d}else d=r;var b=e.length,x=0,p=0,D="";for(h=0;h<b;h++)p=(p+(v=d[x=(x+1)%256]))%256,d[x]=d[p],d[p]=v,l=d[(d[x]+d[p])%256],D+=String.fromCharCode(e.charCodeAt(h)^l);return D}/**
 * @license
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 * Author: Owen Leong (@owenl131)
 * Date: 15 Oct 2020
 * References:
 * https://www.cs.cmu.edu/~dst/Adobe/Gallery/anon21jul01-pdf-encryption.txt
 * https://github.com/foliojs/pdfkit/blob/master/lib/security.js
 * http://www.fpdf.org/en/script/script37.php
 */var fc={print:4,modify:8,copy:16,"annot-forms":32};function Pa(i,e,t,r){this.v=1,this.r=2;var c=192;i.forEach(function(d){if(fc.perm!==void 0)throw new Error("Invalid permission: "+d);c+=fc[d]}),this.padding="(¿N^NuAd\0NVÿú\b..\0¶Ðh>/\f©þdSiz";var o=(e+this.padding).substr(0,32),l=(t+this.padding).substr(0,32);this.O=this.processOwnerPassword(o,l),this.P=-(1+(255^c)),this.encryptionKey=ks(o+this.O+this.lsbFirstWord(this.P)+this.hexToBytes(r)).substr(0,5),this.U=Ns(this.encryptionKey,this.padding)}function Ia(i){if(/[^\u0000-\u00ff]/.test(i))throw new Error("Invalid PDF Name Object: "+i+", Only accept ASCII characters.");for(var e="",t=i.length,r=0;r<t;r++){var c=i.charCodeAt(r);c<33||c===35||c===37||c===40||c===41||c===47||c===60||c===62||c===91||c===93||c===123||c===125||c>126?e+="#"+("0"+c.toString(16)).slice(-2):e+=i[r]}return e}function pc(i){if(fe(i)!=="object")throw new Error("Invalid Context passed to initialize PubSub (jsPDF-module)");var e={};this.subscribe=function(t,r,c){if(c=c||!1,typeof t!="string"||typeof r!="function"||typeof c!="boolean")throw new Error("Invalid arguments passed to PubSub.subscribe (jsPDF-module)");e.hasOwnProperty(t)||(e[t]={});var o=Math.random().toString(35);return e[t][o]=[r,!!c],o},this.unsubscribe=function(t){for(var r in e)if(e[r][t])return delete e[r][t],Object.keys(e[r]).length===0&&delete e[r],!0;return!1},this.publish=function(t){if(e.hasOwnProperty(t)){var r=Array.prototype.slice.call(arguments,1),c=[];for(var o in e[t]){var l=e[t][o];try{l[0].apply(i,r)}catch(d){Gn.console&&ve.error("jsPDF PubSub Error",d.message,d)}l[1]&&c.push(o)}c.length&&c.forEach(this.unsubscribe)}},this.getTopics=function(){return e}}function mo(i){if(!(this instanceof mo))return new mo(i);var e="opacity,stroke-opacity".split(",");for(var t in i)i.hasOwnProperty(t)&&e.indexOf(t)>=0&&(this[t]=i[t]);this.id="",this.objectNumber=-1}function qc(i,e){this.gState=i,this.matrix=e,this.id="",this.objectNumber=-1}function Yi(i,e,t,r,c){if(!(this instanceof Yi))return new Yi(i,e,t,r,c);this.type=i==="axial"?2:3,this.coords=e,this.colors=t,qc.call(this,r,c)}function _a(i,e,t,r,c){if(!(this instanceof _a))return new _a(i,e,t,r,c);this.boundingBox=i,this.xStep=e,this.yStep=t,this.stream="",this.cloneIndex=0,qc.call(this,r,c)}function Hn(i){var e,t=typeof arguments[0]=="string"?arguments[0]:"p",r=arguments[1],c=arguments[2],o=arguments[3],l=[],d=1,h=16,m="S",v=null;fe(i=i||{})==="object"&&(t=i.orientation,r=i.unit||r,c=i.format||c,o=i.compress||i.compressPdf||o,(v=i.encryption||null)!==null&&(v.userPassword=v.userPassword||"",v.ownerPassword=v.ownerPassword||"",v.userPermissions=v.userPermissions||[]),d=typeof i.userUnit=="number"?Math.abs(i.userUnit):1,i.precision!==void 0&&(e=i.precision),i.floatPrecision!==void 0&&(h=i.floatPrecision),m=i.defaultPathOperation||"S"),l=i.filters||(o===!0?["FlateEncode"]:l),r=r||"mm",t=(""+(t||"P")).toLowerCase();var b=i.putOnlyUsedFonts||!1,x={},p={internal:{},__private__:{}};p.__private__.PubSub=pc;var D="1.3",P=p.__private__.getPdfVersion=function(){return D};p.__private__.setPdfVersion=function(s){D=s};var U={a0:[2383.94,3370.39],a1:[1683.78,2383.94],a2:[1190.55,1683.78],a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],a6:[297.64,419.53],a7:[209.76,297.64],a8:[147.4,209.76],a9:[104.88,147.4],a10:[73.7,104.88],b0:[2834.65,4008.19],b1:[2004.09,2834.65],b2:[1417.32,2004.09],b3:[1000.63,1417.32],b4:[708.66,1000.63],b5:[498.9,708.66],b6:[354.33,498.9],b7:[249.45,354.33],b8:[175.75,249.45],b9:[124.72,175.75],b10:[87.87,124.72],c0:[2599.37,3676.54],c1:[1836.85,2599.37],c2:[1298.27,1836.85],c3:[918.43,1298.27],c4:[649.13,918.43],c5:[459.21,649.13],c6:[323.15,459.21],c7:[229.61,323.15],c8:[161.57,229.61],c9:[113.39,161.57],c10:[79.37,113.39],dl:[311.81,623.62],letter:[612,792],"government-letter":[576,756],legal:[612,1008],"junior-legal":[576,360],ledger:[1224,792],tabloid:[792,1224],"credit-card":[153,243]};p.__private__.getPageFormats=function(){return U};var S=p.__private__.getPageFormat=function(s){return U[s]};c=c||"a4";var E={COMPAT:"compat",ADVANCED:"advanced"},W=E.COMPAT;function sn(){this.saveGraphicsState(),F(new qn(Mn,0,0,-Mn,0,yi()*Mn).toString()+" cm"),this.setFontSize(this.getFontSize()/Mn),m="n",W=E.ADVANCED}function dn(){this.restoreGraphicsState(),m="S",W=E.COMPAT}var An=p.__private__.combineFontStyleAndFontWeight=function(s,y){if(s=="bold"&&y=="normal"||s=="bold"&&y==400||s=="normal"&&y=="italic"||s=="bold"&&y=="italic")throw new Error("Invalid Combination of fontweight and fontstyle");return y&&(s=y==400||y==="normal"?s==="italic"?"italic":"normal":y!=700&&y!=="bold"||s!=="normal"?(y==700?"bold":y)+""+s:"bold"),s};p.advancedAPI=function(s){var y=W===E.COMPAT;return y&&sn.call(this),typeof s!="function"||(s(this),y&&dn.call(this)),this},p.compatAPI=function(s){var y=W===E.ADVANCED;return y&&dn.call(this),typeof s!="function"||(s(this),y&&sn.call(this)),this},p.isAdvancedAPI=function(){return W===E.ADVANCED};var nn,q=function(s){if(W!==E.ADVANCED)throw new Error(s+" is only available in 'advanced' API mode. You need to call advancedAPI() first.")},an=p.roundToPrecision=p.__private__.roundToPrecision=function(s,y){var M=e||y;if(isNaN(s)||isNaN(M))throw new Error("Invalid argument passed to jsPDF.roundToPrecision");return s.toFixed(M).replace(/0+$/,"")};nn=p.hpf=p.__private__.hpf=typeof h=="number"?function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.hpf");return an(s,h)}:h==="smart"?function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.hpf");return an(s,s>-1&&s<1?16:5)}:function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.hpf");return an(s,16)};var mn=p.f2=p.__private__.f2=function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.f2");return an(s,2)},C=p.__private__.f3=function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.f3");return an(s,3)},I=p.scale=p.__private__.scale=function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.scale");return W===E.COMPAT?s*Mn:W===E.ADVANCED?s:void 0},G=function(s){return W===E.COMPAT?yi()-s:W===E.ADVANCED?s:void 0},j=function(s){return I(G(s))};p.__private__.setPrecision=p.setPrecision=function(s){typeof parseInt(s,10)=="number"&&(e=parseInt(s,10))};var cn,rn="00000000000000000000000000000000",hn=p.__private__.getFileId=function(){return rn},$=p.__private__.setFileId=function(s){return rn=s!==void 0&&/^[a-fA-F0-9]{32}$/.test(s)?s.toUpperCase():rn.split("").map(function(){return"ABCDEF0123456789".charAt(Math.floor(16*Math.random()))}).join(""),v!==null&&(Ke=new Pa(v.userPermissions,v.userPassword,v.ownerPassword,rn)),rn};p.setFileId=function(s){return $(s),this},p.getFileId=function(){return hn()};var un=p.__private__.convertDateToPDFDate=function(s){var y=s.getTimezoneOffset(),M=y<0?"+":"-",T=Math.floor(Math.abs(y/60)),K=Math.abs(y%60),ln=[M,R(T),"'",R(K),"'"].join("");return["D:",s.getFullYear(),R(s.getMonth()+1),R(s.getDate()),R(s.getHours()),R(s.getMinutes()),R(s.getSeconds()),ln].join("")},pn=p.__private__.convertPDFDateToDate=function(s){var y=parseInt(s.substr(2,4),10),M=parseInt(s.substr(6,2),10)-1,T=parseInt(s.substr(8,2),10),K=parseInt(s.substr(10,2),10),ln=parseInt(s.substr(12,2),10),wn=parseInt(s.substr(14,2),10);return new Date(y,M,T,K,ln,wn,0)},Dn=p.__private__.setCreationDate=function(s){var y;if(s===void 0&&(s=new Date),s instanceof Date)y=un(s);else{if(!/^D:(20[0-2][0-9]|203[0-7]|19[7-9][0-9])(0[0-9]|1[0-2])([0-2][0-9]|3[0-1])(0[0-9]|1[0-9]|2[0-3])(0[0-9]|[1-5][0-9])(0[0-9]|[1-5][0-9])(\+0[0-9]|\+1[0-4]|-0[0-9]|-1[0-1])'(0[0-9]|[1-5][0-9])'?$/.test(s))throw new Error("Invalid argument passed to jsPDF.setCreationDate");y=s}return cn=y},L=p.__private__.getCreationDate=function(s){var y=cn;return s==="jsDate"&&(y=pn(cn)),y};p.setCreationDate=function(s){return Dn(s),this},p.getCreationDate=function(s){return L(s)};var O,R=p.__private__.padd2=function(s){return("0"+parseInt(s)).slice(-2)},B=p.__private__.padd2Hex=function(s){return("00"+(s=s.toString())).substr(s.length)},Y=0,Q=[],en=[],tn=0,kn=[],Ln=[],_n=!1,Cn=en,zn=function(){Y=0,tn=0,en=[],Q=[],kn=[],ai=Re(),_t=Re()};p.__private__.setCustomOutputDestination=function(s){_n=!0,Cn=s};var fn=function(s){_n||(Cn=s)};p.__private__.resetCustomOutputDestination=function(){_n=!1,Cn=en};var F=p.__private__.out=function(s){return s=s.toString(),tn+=s.length+1,Cn.push(s),Cn},Zn=p.__private__.write=function(s){return F(arguments.length===1?s.toString():Array.prototype.join.call(arguments," "))},Un=p.__private__.getArrayBuffer=function(s){for(var y=s.length,M=new ArrayBuffer(y),T=new Uint8Array(M);y--;)T[y]=s.charCodeAt(y);return M},xn=[["Helvetica","helvetica","normal","WinAnsiEncoding"],["Helvetica-Bold","helvetica","bold","WinAnsiEncoding"],["Helvetica-Oblique","helvetica","italic","WinAnsiEncoding"],["Helvetica-BoldOblique","helvetica","bolditalic","WinAnsiEncoding"],["Courier","courier","normal","WinAnsiEncoding"],["Courier-Bold","courier","bold","WinAnsiEncoding"],["Courier-Oblique","courier","italic","WinAnsiEncoding"],["Courier-BoldOblique","courier","bolditalic","WinAnsiEncoding"],["Times-Roman","times","normal","WinAnsiEncoding"],["Times-Bold","times","bold","WinAnsiEncoding"],["Times-Italic","times","italic","WinAnsiEncoding"],["Times-BoldItalic","times","bolditalic","WinAnsiEncoding"],["ZapfDingbats","zapfdingbats","normal",null],["Symbol","symbol","normal",null]];p.__private__.getStandardFonts=function(){return xn};var Nn=i.fontSize||16;p.__private__.setFontSize=p.setFontSize=function(s){return Nn=W===E.ADVANCED?s/Mn:s,this};var On,In=p.__private__.getFontSize=p.getFontSize=function(){return W===E.COMPAT?Nn:Nn*Mn},jn=i.R2L||!1;p.__private__.setR2L=p.setR2L=function(s){return jn=s,this},p.__private__.getR2L=p.getR2L=function(){return jn};var Jn,ne=p.__private__.setZoomMode=function(s){var y=[void 0,null,"fullwidth","fullheight","fullpage","original"];if(/^(?:\d+\.\d*|\d*\.\d+|\d+)%$/.test(s))On=s;else if(isNaN(s)){if(y.indexOf(s)===-1)throw new Error('zoom must be Integer (e.g. 2), a percentage Value (e.g. 300%) or fullwidth, fullheight, fullpage, original. "'+s+'" is not recognized.');On=s}else On=parseInt(s,10)};p.__private__.getZoomMode=function(){return On};var ee,re=p.__private__.setPageMode=function(s){if([void 0,null,"UseNone","UseOutlines","UseThumbs","FullScreen"].indexOf(s)==-1)throw new Error('Page mode must be one of UseNone, UseOutlines, UseThumbs, or FullScreen. "'+s+'" is not recognized.');Jn=s};p.__private__.getPageMode=function(){return Jn};var pe=p.__private__.setLayoutMode=function(s){if([void 0,null,"continuous","single","twoleft","tworight","two"].indexOf(s)==-1)throw new Error('Layout mode must be one of continuous, single, twoleft, tworight. "'+s+'" is not recognized.');ee=s};p.__private__.getLayoutMode=function(){return ee},p.__private__.setDisplayMode=p.setDisplayMode=function(s,y,M){return ne(s),pe(y),re(M),this};var Vn={title:"",subject:"",author:"",keywords:"",creator:""};p.__private__.getDocumentProperty=function(s){if(Object.keys(Vn).indexOf(s)===-1)throw new Error("Invalid argument passed to jsPDF.getDocumentProperty");return Vn[s]},p.__private__.getDocumentProperties=function(){return Vn},p.__private__.setDocumentProperties=p.setProperties=p.setDocumentProperties=function(s){for(var y in Vn)Vn.hasOwnProperty(y)&&s[y]&&(Vn[y]=s[y]);return this},p.__private__.setDocumentProperty=function(s,y){if(Object.keys(Vn).indexOf(s)===-1)throw new Error("Invalid arguments passed to jsPDF.setDocumentProperty");return Vn[s]=y};var te,Mn,Ye,se,Ct,ge={},xe={},Ht=[],le={},Ei={},ke={},Pt={},ii=null,Ne=0,Yn=[],ue=new pc(p),Ri=i.hotfixes||[],Ve={},Gt={},Vt=[],qn=function s(y,M,T,K,ln,wn){if(!(this instanceof s))return new s(y,M,T,K,ln,wn);isNaN(y)&&(y=1),isNaN(M)&&(M=0),isNaN(T)&&(T=0),isNaN(K)&&(K=1),isNaN(ln)&&(ln=0),isNaN(wn)&&(wn=0),this._matrix=[y,M,T,K,ln,wn]};Object.defineProperty(qn.prototype,"sx",{get:function(){return this._matrix[0]},set:function(s){this._matrix[0]=s}}),Object.defineProperty(qn.prototype,"shy",{get:function(){return this._matrix[1]},set:function(s){this._matrix[1]=s}}),Object.defineProperty(qn.prototype,"shx",{get:function(){return this._matrix[2]},set:function(s){this._matrix[2]=s}}),Object.defineProperty(qn.prototype,"sy",{get:function(){return this._matrix[3]},set:function(s){this._matrix[3]=s}}),Object.defineProperty(qn.prototype,"tx",{get:function(){return this._matrix[4]},set:function(s){this._matrix[4]=s}}),Object.defineProperty(qn.prototype,"ty",{get:function(){return this._matrix[5]},set:function(s){this._matrix[5]=s}}),Object.defineProperty(qn.prototype,"a",{get:function(){return this._matrix[0]},set:function(s){this._matrix[0]=s}}),Object.defineProperty(qn.prototype,"b",{get:function(){return this._matrix[1]},set:function(s){this._matrix[1]=s}}),Object.defineProperty(qn.prototype,"c",{get:function(){return this._matrix[2]},set:function(s){this._matrix[2]=s}}),Object.defineProperty(qn.prototype,"d",{get:function(){return this._matrix[3]},set:function(s){this._matrix[3]=s}}),Object.defineProperty(qn.prototype,"e",{get:function(){return this._matrix[4]},set:function(s){this._matrix[4]=s}}),Object.defineProperty(qn.prototype,"f",{get:function(){return this._matrix[5]},set:function(s){this._matrix[5]=s}}),Object.defineProperty(qn.prototype,"rotation",{get:function(){return Math.atan2(this.shx,this.sx)}}),Object.defineProperty(qn.prototype,"scaleX",{get:function(){return this.decompose().scale.sx}}),Object.defineProperty(qn.prototype,"scaleY",{get:function(){return this.decompose().scale.sy}}),Object.defineProperty(qn.prototype,"isIdentity",{get:function(){return this.sx===1&&this.shy===0&&this.shx===0&&this.sy===1&&this.tx===0&&this.ty===0}}),qn.prototype.join=function(s){return[this.sx,this.shy,this.shx,this.sy,this.tx,this.ty].map(nn).join(s)},qn.prototype.multiply=function(s){var y=s.sx*this.sx+s.shy*this.shx,M=s.sx*this.shy+s.shy*this.sy,T=s.shx*this.sx+s.sy*this.shx,K=s.shx*this.shy+s.sy*this.sy,ln=s.tx*this.sx+s.ty*this.shx+this.tx,wn=s.tx*this.shy+s.ty*this.sy+this.ty;return new qn(y,M,T,K,ln,wn)},qn.prototype.decompose=function(){var s=this.sx,y=this.shy,M=this.shx,T=this.sy,K=this.tx,ln=this.ty,wn=Math.sqrt(s*s+y*y),En=(s/=wn)*M+(y/=wn)*T;M-=s*En,T-=y*En;var Tn=Math.sqrt(M*M+T*T);return En/=Tn,s*(T/=Tn)<y*(M/=Tn)&&(s=-s,y=-y,En=-En,wn=-wn),{scale:new qn(wn,0,0,Tn,0,0),translate:new qn(1,0,0,1,K,ln),rotate:new qn(s,y,-y,s,0,0),skew:new qn(1,0,En,1,0,0)}},qn.prototype.toString=function(s){return this.join(" ")},qn.prototype.inversed=function(){var s=this.sx,y=this.shy,M=this.shx,T=this.sy,K=this.tx,ln=this.ty,wn=1/(s*T-y*M),En=T*wn,Tn=-y*wn,$n=-M*wn,Kn=s*wn;return new qn(En,Tn,$n,Kn,-En*K-$n*ln,-Tn*K-Kn*ln)},qn.prototype.applyToPoint=function(s){var y=s.x*this.sx+s.y*this.shx+this.tx,M=s.x*this.shy+s.y*this.sy+this.ty;return new ua(y,M)},qn.prototype.applyToRectangle=function(s){var y=this.applyToPoint(s),M=this.applyToPoint(new ua(s.x+s.w,s.y+s.h));return new Va(y.x,y.y,M.x-y.x,M.y-y.y)},qn.prototype.clone=function(){var s=this.sx,y=this.shy,M=this.shx,T=this.sy,K=this.tx,ln=this.ty;return new qn(s,y,M,T,K,ln)},p.Matrix=qn;var It=p.matrixMult=function(s,y){return y.multiply(s)},Wt=new qn(1,0,0,1,0,0);p.unitMatrix=p.identityMatrix=Wt;var ot=function(s,y){if(!Ei[s]){var M=(y instanceof Yi?"Sh":"P")+(Object.keys(le).length+1).toString(10);y.id=M,Ei[s]=M,le[M]=y,ue.publish("addPattern",y)}};p.ShadingPattern=Yi,p.TilingPattern=_a,p.addShadingPattern=function(s,y){return q("addShadingPattern()"),ot(s,y),this},p.beginTilingPattern=function(s){q("beginTilingPattern()"),Er(s.boundingBox[0],s.boundingBox[1],s.boundingBox[2]-s.boundingBox[0],s.boundingBox[3]-s.boundingBox[1],s.matrix)},p.endTilingPattern=function(s,y){q("endTilingPattern()"),y.stream=Ln[O].join(`
`),ot(s,y),ue.publish("endTilingPattern",y),Vt.pop().restore()};var Te=p.__private__.newObject=function(){var s=Re();return ft(s,!0),s},Re=p.__private__.newObjectDeferred=function(){return Y++,Q[Y]=function(){return tn},Y},ft=function(s,y){return y=typeof y=="boolean"&&y,Q[s]=tn,y&&F(s+" 0 obj"),s},Zi=p.__private__.newAdditionalObject=function(){var s={objId:Re(),content:""};return kn.push(s),s},ai=Re(),_t=Re(),Ot=p.__private__.decodeColorString=function(s){var y=s.split(" ");if(y.length!==2||y[1]!=="g"&&y[1]!=="G")y.length===5&&(y[4]==="k"||y[4]==="K")&&(y=[(1-y[0])*(1-y[3]),(1-y[1])*(1-y[3]),(1-y[2])*(1-y[3]),"r"]);else{var M=parseFloat(y[0]);y=[M,M,M,"r"]}for(var T="#",K=0;K<3;K++)T+=("0"+Math.floor(255*parseFloat(y[K])).toString(16)).slice(-2);return T},Mt=p.__private__.encodeColorString=function(s){var y;typeof s=="string"&&(s={ch1:s});var M=s.ch1,T=s.ch2,K=s.ch3,ln=s.ch4,wn=s.pdfColorType==="draw"?["G","RG","K"]:["g","rg","k"];if(typeof M=="string"&&M.charAt(0)!=="#"){var En=new Tc(M);if(En.ok)M=En.toHex();else if(!/^\d*\.?\d*$/.test(M))throw new Error('Invalid color "'+M+'" passed to jsPDF.encodeColorString.')}if(typeof M=="string"&&/^#[0-9A-Fa-f]{3}$/.test(M)&&(M="#"+M[1]+M[1]+M[2]+M[2]+M[3]+M[3]),typeof M=="string"&&/^#[0-9A-Fa-f]{6}$/.test(M)){var Tn=parseInt(M.substr(1),16);M=Tn>>16&255,T=Tn>>8&255,K=255&Tn}if(T===void 0||ln===void 0&&M===T&&T===K)if(typeof M=="string")y=M+" "+wn[0];else switch(s.precision){case 2:y=mn(M/255)+" "+wn[0];break;case 3:default:y=C(M/255)+" "+wn[0]}else if(ln===void 0||fe(ln)==="object"){if(ln&&!isNaN(ln.a)&&ln.a===0)return y=["1.","1.","1.",wn[1]].join(" ");if(typeof M=="string")y=[M,T,K,wn[1]].join(" ");else switch(s.precision){case 2:y=[mn(M/255),mn(T/255),mn(K/255),wn[1]].join(" ");break;default:case 3:y=[C(M/255),C(T/255),C(K/255),wn[1]].join(" ")}}else if(typeof M=="string")y=[M,T,K,ln,wn[2]].join(" ");else switch(s.precision){case 2:y=[mn(M),mn(T),mn(K),mn(ln),wn[2]].join(" ");break;case 3:default:y=[C(M),C(T),C(K),C(ln),wn[2]].join(" ")}return y},Jt=p.__private__.getFilters=function(){return l},bt=p.__private__.putStream=function(s){var y=(s=s||{}).data||"",M=s.filters||Jt(),T=s.alreadyAppliedFilters||[],K=s.addLength1||!1,ln=y.length,wn=s.objectId,En=function(Xe){return Xe};if(v!==null&&wn===void 0)throw new Error("ObjectId must be passed to putStream for file encryption");v!==null&&(En=Ke.encryptor(wn,0));var Tn={};M===!0&&(M=["FlateEncode"]);var $n=s.additionalKeyValues||[],Kn=(Tn=Hn.API.processDataByFilters!==void 0?Hn.API.processDataByFilters(y,M):{data:y,reverseChain:[]}).reverseChain+(Array.isArray(T)?T.join(" "):T.toString());if(Tn.data.length!==0&&($n.push({key:"Length",value:Tn.data.length}),K===!0&&$n.push({key:"Length1",value:ln})),Kn.length!=0)if(Kn.split("/").length-1==1)$n.push({key:"Filter",value:Kn});else{$n.push({key:"Filter",value:"["+Kn+"]"});for(var ae=0;ae<$n.length;ae+=1)if($n[ae].key==="DecodeParms"){for(var Le=[],Se=0;Se<Tn.reverseChain.split("/").length-1;Se+=1)Le.push("null");Le.push($n[ae].value),$n[ae].value="["+Le.join(" ")+"]"}}F("<<");for(var Fe=0;Fe<$n.length;Fe++)F("/"+$n[Fe].key+" "+$n[Fe].value);F(">>"),Tn.data.length!==0&&(F("stream"),F(En(Tn.data)),F("endstream"))},Yt=p.__private__.putPage=function(s){var y=s.number,M=s.data,T=s.objId,K=s.contentsObjId;ft(T,!0),F("<</Type /Page"),F("/Parent "+s.rootDictionaryObjId+" 0 R"),F("/Resources "+s.resourceDictionaryObjId+" 0 R"),F("/MediaBox ["+parseFloat(nn(s.mediaBox.bottomLeftX))+" "+parseFloat(nn(s.mediaBox.bottomLeftY))+" "+nn(s.mediaBox.topRightX)+" "+nn(s.mediaBox.topRightY)+"]"),s.cropBox!==null&&F("/CropBox ["+nn(s.cropBox.bottomLeftX)+" "+nn(s.cropBox.bottomLeftY)+" "+nn(s.cropBox.topRightX)+" "+nn(s.cropBox.topRightY)+"]"),s.bleedBox!==null&&F("/BleedBox ["+nn(s.bleedBox.bottomLeftX)+" "+nn(s.bleedBox.bottomLeftY)+" "+nn(s.bleedBox.topRightX)+" "+nn(s.bleedBox.topRightY)+"]"),s.trimBox!==null&&F("/TrimBox ["+nn(s.trimBox.bottomLeftX)+" "+nn(s.trimBox.bottomLeftY)+" "+nn(s.trimBox.topRightX)+" "+nn(s.trimBox.topRightY)+"]"),s.artBox!==null&&F("/ArtBox ["+nn(s.artBox.bottomLeftX)+" "+nn(s.artBox.bottomLeftY)+" "+nn(s.artBox.topRightX)+" "+nn(s.artBox.topRightY)+"]"),typeof s.userUnit=="number"&&s.userUnit!==1&&F("/UserUnit "+s.userUnit),ue.publish("putPage",{objId:T,pageContext:Yn[y],pageNumber:y,page:M}),F("/Contents "+K+" 0 R"),F(">>"),F("endobj");var ln=M.join(`
`);return W===E.ADVANCED&&(ln+=`
Q`),ft(K,!0),bt({data:ln,filters:Jt(),objectId:K}),F("endobj"),T},Fi=p.__private__.putPages=function(){var s,y,M=[];for(s=1;s<=Ne;s++)Yn[s].objId=Re(),Yn[s].contentsObjId=Re();for(s=1;s<=Ne;s++)M.push(Yt({number:s,data:Ln[s],objId:Yn[s].objId,contentsObjId:Yn[s].contentsObjId,mediaBox:Yn[s].mediaBox,cropBox:Yn[s].cropBox,bleedBox:Yn[s].bleedBox,trimBox:Yn[s].trimBox,artBox:Yn[s].artBox,userUnit:Yn[s].userUnit,rootDictionaryObjId:ai,resourceDictionaryObjId:_t}));ft(ai,!0),F("<</Type /Pages");var T="/Kids [";for(y=0;y<Ne;y++)T+=M[y]+" 0 R ";F(T+"]"),F("/Count "+Ne),F(">>"),F("endobj"),ue.publish("postPutPages")},$i=function(s){ue.publish("putFont",{font:s,out:F,newObject:Te,putStream:bt}),s.isAlreadyPutted!==!0&&(s.objectNumber=Te(),F("<<"),F("/Type /Font"),F("/BaseFont /"+Ia(s.postScriptName)),F("/Subtype /Type1"),typeof s.encoding=="string"&&F("/Encoding /"+s.encoding),F("/FirstChar 32"),F("/LastChar 255"),F(">>"),F("endobj"))},Qi=function(){for(var s in ge)ge.hasOwnProperty(s)&&(b===!1||b===!0&&x.hasOwnProperty(s))&&$i(ge[s])},na=function(s){s.objectNumber=Te();var y=[];y.push({key:"Type",value:"/XObject"}),y.push({key:"Subtype",value:"/Form"}),y.push({key:"BBox",value:"["+[nn(s.x),nn(s.y),nn(s.x+s.width),nn(s.y+s.height)].join(" ")+"]"}),y.push({key:"Matrix",value:"["+s.matrix.toString()+"]"});var M=s.pages[1].join(`
`);bt({data:M,additionalKeyValues:y,objectId:s.objectNumber}),F("endobj")},ea=function(){for(var s in Ve)Ve.hasOwnProperty(s)&&na(Ve[s])},gr=function(s,y){var M,T=[],K=1/(y-1);for(M=0;M<1;M+=K)T.push(M);if(T.push(1),s[0].offset!=0){var ln={offset:0,color:s[0].color};s.unshift(ln)}if(s[s.length-1].offset!=1){var wn={offset:1,color:s[s.length-1].color};s.push(wn)}for(var En="",Tn=0,$n=0;$n<T.length;$n++){for(M=T[$n];M>s[Tn+1].offset;)Tn++;var Kn=s[Tn].offset,ae=(M-Kn)/(s[Tn+1].offset-Kn),Le=s[Tn].color,Se=s[Tn+1].color;En+=B(Math.round((1-ae)*Le[0]+ae*Se[0]).toString(16))+B(Math.round((1-ae)*Le[1]+ae*Se[1]).toString(16))+B(Math.round((1-ae)*Le[2]+ae*Se[2]).toString(16))}return En.trim()},wo=function(s,y){y||(y=21);var M=Te(),T=gr(s.colors,y),K=[];K.push({key:"FunctionType",value:"0"}),K.push({key:"Domain",value:"[0.0 1.0]"}),K.push({key:"Size",value:"["+y+"]"}),K.push({key:"BitsPerSample",value:"8"}),K.push({key:"Range",value:"[0.0 1.0 0.0 1.0 0.0 1.0]"}),K.push({key:"Decode",value:"[0.0 1.0 0.0 1.0 0.0 1.0]"}),bt({data:T,additionalKeyValues:K,alreadyAppliedFilters:["/ASCIIHexDecode"],objectId:M}),F("endobj"),s.objectNumber=Te(),F("<< /ShadingType "+s.type),F("/ColorSpace /DeviceRGB");var ln="/Coords ["+nn(parseFloat(s.coords[0]))+" "+nn(parseFloat(s.coords[1]))+" ";s.type===2?ln+=nn(parseFloat(s.coords[2]))+" "+nn(parseFloat(s.coords[3])):ln+=nn(parseFloat(s.coords[2]))+" "+nn(parseFloat(s.coords[3]))+" "+nn(parseFloat(s.coords[4]))+" "+nn(parseFloat(s.coords[5])),F(ln+="]"),s.matrix&&F("/Matrix ["+s.matrix.toString()+"]"),F("/Function "+M+" 0 R"),F("/Extend [true true]"),F(">>"),F("endobj")},Ao=function(s,y){var M=Re(),T=Te();y.push({resourcesOid:M,objectOid:T}),s.objectNumber=T;var K=[];K.push({key:"Type",value:"/Pattern"}),K.push({key:"PatternType",value:"1"}),K.push({key:"PaintType",value:"1"}),K.push({key:"TilingType",value:"1"}),K.push({key:"BBox",value:"["+s.boundingBox.map(nn).join(" ")+"]"}),K.push({key:"XStep",value:nn(s.xStep)}),K.push({key:"YStep",value:nn(s.yStep)}),K.push({key:"Resources",value:M+" 0 R"}),s.matrix&&K.push({key:"Matrix",value:"["+s.matrix.toString()+"]"}),bt({data:s.stream,additionalKeyValues:K,objectId:s.objectNumber}),F("endobj")},ta=function(s){var y;for(y in le)le.hasOwnProperty(y)&&(le[y]instanceof Yi?wo(le[y]):le[y]instanceof _a&&Ao(le[y],s))},yr=function(s){for(var y in s.objectNumber=Te(),F("<<"),s)switch(y){case"opacity":F("/ca "+mn(s[y]));break;case"stroke-opacity":F("/CA "+mn(s[y]))}F(">>"),F("endobj")},xo=function(){var s;for(s in ke)ke.hasOwnProperty(s)&&yr(ke[s])},Ra=function(){for(var s in F("/XObject <<"),Ve)Ve.hasOwnProperty(s)&&Ve[s].objectNumber>=0&&F("/"+s+" "+Ve[s].objectNumber+" 0 R");ue.publish("putXobjectDict"),F(">>")},Lo=function(){Ke.oid=Te(),F("<<"),F("/Filter /Standard"),F("/V "+Ke.v),F("/R "+Ke.r),F("/U <"+Ke.toHexString(Ke.U)+">"),F("/O <"+Ke.toHexString(Ke.O)+">"),F("/P "+Ke.P),F(">>"),F("endobj")},vr=function(){for(var s in F("/Font <<"),ge)ge.hasOwnProperty(s)&&(b===!1||b===!0&&x.hasOwnProperty(s))&&F("/"+s+" "+ge[s].objectNumber+" 0 R");F(">>")},ko=function(){if(Object.keys(le).length>0){for(var s in F("/Shading <<"),le)le.hasOwnProperty(s)&&le[s]instanceof Yi&&le[s].objectNumber>=0&&F("/"+s+" "+le[s].objectNumber+" 0 R");ue.publish("putShadingPatternDict"),F(">>")}},ia=function(s){if(Object.keys(le).length>0){for(var y in F("/Pattern <<"),le)le.hasOwnProperty(y)&&le[y]instanceof p.TilingPattern&&le[y].objectNumber>=0&&le[y].objectNumber<s&&F("/"+y+" "+le[y].objectNumber+" 0 R");ue.publish("putTilingPatternDict"),F(">>")}},No=function(){if(Object.keys(ke).length>0){var s;for(s in F("/ExtGState <<"),ke)ke.hasOwnProperty(s)&&ke[s].objectNumber>=0&&F("/"+s+" "+ke[s].objectNumber+" 0 R");ue.publish("putGStateDict"),F(">>")}},Ie=function(s){ft(s.resourcesOid,!0),F("<<"),F("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]"),vr(),ko(),ia(s.objectOid),No(),Ra(),F(">>"),F("endobj")},br=function(){var s=[];Qi(),xo(),ea(),ta(s),ue.publish("putResources"),s.forEach(Ie),Ie({resourcesOid:_t,objectOid:Number.MAX_SAFE_INTEGER}),ue.publish("postPutResources")},wr=function(){ue.publish("putAdditionalObjects");for(var s=0;s<kn.length;s++){var y=kn[s];ft(y.objId,!0),F(y.content),F("endobj")}ue.publish("postPutAdditionalObjects")},Ar=function(s){xe[s.fontName]=xe[s.fontName]||{},xe[s.fontName][s.fontStyle]=s.id},Fa=function(s,y,M,T,K){var ln={id:"F"+(Object.keys(ge).length+1).toString(10),postScriptName:s,fontName:y,fontStyle:M,encoding:T,isStandardFont:K||!1,metadata:{}};return ue.publish("addFont",{font:ln,instance:this}),ge[ln.id]=ln,Ar(ln),ln.id},So=function(s){for(var y=0,M=xn.length;y<M;y++){var T=Fa.call(this,s[y][0],s[y][1],s[y][2],xn[y][3],!0);b===!1&&(x[T]=!0);var K=s[y][0].split("-");Ar({id:T,fontName:K[0],fontStyle:K[1]||""})}ue.publish("addFonts",{fonts:ge,dictionary:xe})},Dt=function(s){return s.foo=function(){try{return s.apply(this,arguments)}catch(T){var y=T.stack||"";~y.indexOf(" at ")&&(y=y.split(" at ")[1]);var M="Error in function "+y.split(`
`)[0].split("<")[0]+": "+T.message;if(!Gn.console)throw new Error(M);Gn.console.error(M,T),Gn.alert&&alert(M)}},s.foo.bar=s,s.foo},aa=function(s,y){var M,T,K,ln,wn,En,Tn,$n,Kn;if(K=(y=y||{}).sourceEncoding||"Unicode",wn=y.outputEncoding,(y.autoencode||wn)&&ge[te].metadata&&ge[te].metadata[K]&&ge[te].metadata[K].encoding&&(ln=ge[te].metadata[K].encoding,!wn&&ge[te].encoding&&(wn=ge[te].encoding),!wn&&ln.codePages&&(wn=ln.codePages[0]),typeof wn=="string"&&(wn=ln[wn]),wn)){for(Tn=!1,En=[],M=0,T=s.length;M<T;M++)($n=wn[s.charCodeAt(M)])?En.push(String.fromCharCode($n)):En.push(s[M]),En[M].charCodeAt(0)>>8&&(Tn=!0);s=En.join("")}for(M=s.length;Tn===void 0&&M!==0;)s.charCodeAt(M-1)>>8&&(Tn=!0),M--;if(!Tn)return s;for(En=y.noBOM?[]:[254,255],M=0,T=s.length;M<T;M++){if((Kn=($n=s.charCodeAt(M))>>8)>>8)throw new Error("Character at position "+M+" of string '"+s+"' exceeds 16bits. Cannot be encoded into UCS-2 BE");En.push(Kn),En.push($n-(Kn<<8))}return String.fromCharCode.apply(void 0,En)},st=p.__private__.pdfEscape=p.pdfEscape=function(s,y){return aa(s,y).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")},Ua=p.__private__.beginPage=function(s){Ln[++Ne]=[],Yn[Ne]={objId:0,contentsObjId:0,userUnit:Number(d),artBox:null,bleedBox:null,cropBox:null,trimBox:null,mediaBox:{bottomLeftX:0,bottomLeftY:0,topRightX:Number(s[0]),topRightY:Number(s[1])}},Lr(Ne),fn(Ln[O])},xr=function(s,y){var M,T,K;switch(t=y||t,typeof s=="string"&&(M=S(s.toLowerCase()),Array.isArray(M)&&(T=M[0],K=M[1])),Array.isArray(s)&&(T=s[0]*Mn,K=s[1]*Mn),isNaN(T)&&(T=c[0],K=c[1]),(T>14400||K>14400)&&(ve.warn("A page in a PDF can not be wider or taller than 14400 userUnit. jsPDF limits the width/height to 14400"),T=Math.min(14400,T),K=Math.min(14400,K)),c=[T,K],t.substr(0,1)){case"l":K>T&&(c=[K,T]);break;case"p":T>K&&(c=[K,T])}Ua(c),Ir(qa),F(Et),Ha!==0&&F(Ha+" J"),Ga!==0&&F(Ga+" j"),ue.publish("addPage",{pageNumber:Ne})},Co=function(s){s>0&&s<=Ne&&(Ln.splice(s,1),Yn.splice(s,1),Ne--,O>Ne&&(O=Ne),this.setPage(O))},Lr=function(s){s>0&&s<=Ne&&(O=s)},Po=p.__private__.getNumberOfPages=p.getNumberOfPages=function(){return Ln.length-1},kr=function(s,y,M){var T,K=void 0;return M=M||{},s=s!==void 0?s:ge[te].fontName,y=y!==void 0?y:ge[te].fontStyle,T=s.toLowerCase(),xe[T]!==void 0&&xe[T][y]!==void 0?K=xe[T][y]:xe[s]!==void 0&&xe[s][y]!==void 0?K=xe[s][y]:M.disableWarning===!1&&ve.warn("Unable to look up font label for font '"+s+"', '"+y+"'. Refer to getFontList() for available fonts."),K||M.noFallback||(K=xe.times[y])==null&&(K=xe.times.normal),K},Io=p.__private__.putInfo=function(){var s=Te(),y=function(T){return T};for(var M in v!==null&&(y=Ke.encryptor(s,0)),F("<<"),F("/Producer ("+st(y("jsPDF "+Hn.version))+")"),Vn)Vn.hasOwnProperty(M)&&Vn[M]&&F("/"+M.substr(0,1).toUpperCase()+M.substr(1)+" ("+st(y(Vn[M]))+")");F("/CreationDate ("+st(y(cn))+")"),F(">>"),F("endobj")},ja=p.__private__.putCatalog=function(s){var y=(s=s||{}).rootDictionaryObjId||ai;switch(Te(),F("<<"),F("/Type /Catalog"),F("/Pages "+y+" 0 R"),On||(On="fullwidth"),On){case"fullwidth":F("/OpenAction [3 0 R /FitH null]");break;case"fullheight":F("/OpenAction [3 0 R /FitV null]");break;case"fullpage":F("/OpenAction [3 0 R /Fit]");break;case"original":F("/OpenAction [3 0 R /XYZ null null 1]");break;default:var M=""+On;M.substr(M.length-1)==="%"&&(On=parseInt(On)/100),typeof On=="number"&&F("/OpenAction [3 0 R /XYZ null null "+mn(On)+"]")}switch(ee||(ee="continuous"),ee){case"continuous":F("/PageLayout /OneColumn");break;case"single":F("/PageLayout /SinglePage");break;case"two":case"twoleft":F("/PageLayout /TwoColumnLeft");break;case"tworight":F("/PageLayout /TwoColumnRight")}Jn&&F("/PageMode /"+Jn),ue.publish("putCatalog"),F(">>"),F("endobj")},_o=p.__private__.putTrailer=function(){F("trailer"),F("<<"),F("/Size "+(Y+1)),F("/Root "+Y+" 0 R"),F("/Info "+(Y-1)+" 0 R"),v!==null&&F("/Encrypt "+Ke.oid+" 0 R"),F("/ID [ <"+rn+"> <"+rn+"> ]"),F(">>")},Oo=p.__private__.putHeader=function(){F("%PDF-"+D),F("%ºß¬à")},Mo=p.__private__.putXRef=function(){var s="0000000000";F("xref"),F("0 "+(Y+1)),F("0000000000 65535 f ");for(var y=1;y<=Y;y++)typeof Q[y]=="function"?F((s+Q[y]()).slice(-10)+" 00000 n "):Q[y]!==void 0?F((s+Q[y]).slice(-10)+" 00000 n "):F("0000000000 00000 n ")},ri=p.__private__.buildDocument=function(){zn(),fn(en),ue.publish("buildDocument"),Oo(),Fi(),wr(),br(),v!==null&&Lo(),Io(),ja();var s=tn;return Mo(),_o(),F("startxref"),F(""+s),F("%%EOF"),fn(Ln[O]),en.join(`
`)},ra=p.__private__.getBlob=function(s){return new Blob([Un(s)],{type:"application/pdf"})},oa=p.output=p.__private__.output=Dt(function(s,y){switch(typeof(y=y||{})=="string"?y={filename:y}:y.filename=y.filename||"generated.pdf",s){case void 0:return ri();case"save":p.save(y.filename);break;case"arraybuffer":return Un(ri());case"blob":return ra(ri());case"bloburi":case"bloburl":if(Gn.URL!==void 0&&typeof Gn.URL.createObjectURL=="function")return Gn.URL&&Gn.URL.createObjectURL(ra(ri()))||void 0;ve.warn("bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.");break;case"datauristring":case"dataurlstring":var M="",T=ri();try{M=Ls(T)}catch{M=Ls(unescape(encodeURIComponent(T)))}return"data:application/pdf;filename="+y.filename+";base64,"+M;case"pdfobjectnewwindow":if(Object.prototype.toString.call(Gn)==="[object Window]"){var K="https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js",ln=' integrity="sha512-4ze/a9/4jqu+tX9dfOqJYSvyYd5M6qum/3HpCLr+/Jqf0whc37VUbkpNGHR7/8pSnCFw47T1fmIpwBV7UySh3g==" crossorigin="anonymous"';y.pdfObjectUrl&&(K=y.pdfObjectUrl,ln="");var wn='<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><script src="'+K+'"'+ln+'><\/script><script >PDFObject.embed("'+this.output("dataurlstring")+'", '+JSON.stringify(y)+");<\/script></body></html>",En=Gn.open();return En!==null&&En.document.write(wn),En}throw new Error("The option pdfobjectnewwindow just works in a browser-environment.");case"pdfjsnewwindow":if(Object.prototype.toString.call(Gn)==="[object Window]"){var Tn='<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe id="pdfViewer" src="'+(y.pdfJsUrl||"examples/PDF.js/web/viewer.html")+"?file=&downloadName="+y.filename+'" width="500px" height="400px" /></body></html>',$n=Gn.open();if($n!==null){$n.document.write(Tn);var Kn=this;$n.document.documentElement.querySelector("#pdfViewer").onload=function(){$n.document.title=y.filename,$n.document.documentElement.querySelector("#pdfViewer").contentWindow.PDFViewerApplication.open(Kn.output("bloburl"))}}return $n}throw new Error("The option pdfjsnewwindow just works in a browser-environment.");case"dataurlnewwindow":if(Object.prototype.toString.call(Gn)!=="[object Window]")throw new Error("The option dataurlnewwindow just works in a browser-environment.");var ae='<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe src="'+this.output("datauristring",y)+'"></iframe></body></html>',Le=Gn.open();if(Le!==null&&(Le.document.write(ae),Le.document.title=y.filename),Le||typeof safari>"u")return Le;break;case"datauri":case"dataurl":return Gn.document.location.href=this.output("datauristring",y);default:return null}}),Nr=function(s){return Array.isArray(Ri)===!0&&Ri.indexOf(s)>-1};switch(r){case"pt":Mn=1;break;case"mm":Mn=72/25.4;break;case"cm":Mn=72/2.54;break;case"in":Mn=72;break;case"px":Mn=Nr("px_scaling")==1?.75:96/72;break;case"pc":case"em":Mn=12;break;case"ex":Mn=6;break;default:if(typeof r!="number")throw new Error("Invalid unit: "+r);Mn=r}var Ke=null;Dn(),$();var Do=function(s){return v!==null?Ke.encryptor(s,0):function(y){return y}},Sr=p.__private__.getPageInfo=p.getPageInfo=function(s){if(isNaN(s)||s%1!=0)throw new Error("Invalid argument passed to jsPDF.getPageInfo");return{objId:Yn[s].objId,pageNumber:s,pageContext:Yn[s]}},Wn=p.__private__.getPageInfoByObjId=function(s){if(isNaN(s)||s%1!=0)throw new Error("Invalid argument passed to jsPDF.getPageInfoByObjId");for(var y in Yn)if(Yn[y].objId===s)break;return Sr(y)},Eo=p.__private__.getCurrentPageInfo=p.getCurrentPageInfo=function(){return{objId:Yn[O].objId,pageNumber:O,pageContext:Yn[O]}};p.addPage=function(){return xr.apply(this,arguments),this},p.setPage=function(){return Lr.apply(this,arguments),fn.call(this,Ln[O]),this},p.insertPage=function(s){return this.addPage(),this.movePage(O,s),this},p.movePage=function(s,y){var M,T;if(s>y){M=Ln[s],T=Yn[s];for(var K=s;K>y;K--)Ln[K]=Ln[K-1],Yn[K]=Yn[K-1];Ln[y]=M,Yn[y]=T,this.setPage(y)}else if(s<y){M=Ln[s],T=Yn[s];for(var ln=s;ln<y;ln++)Ln[ln]=Ln[ln+1],Yn[ln]=Yn[ln+1];Ln[y]=M,Yn[y]=T,this.setPage(y)}return this},p.deletePage=function(){return Co.apply(this,arguments),this},p.__private__.text=p.text=function(s,y,M,T,K){var ln,wn,En,Tn,$n,Kn,ae,Le,Se,Fe=(T=T||{}).scope||this;if(typeof s=="number"&&typeof y=="number"&&(typeof M=="string"||Array.isArray(M))){var Xe=M;M=y,y=s,s=Xe}if(arguments[3]instanceof qn?(q("The transform parameter of text() with a Matrix value"),Se=K):(En=arguments[4],Tn=arguments[5],fe(ae=arguments[3])==="object"&&ae!==null||(typeof En=="string"&&(Tn=En,En=null),typeof ae=="string"&&(Tn=ae,ae=null),typeof ae=="number"&&(En=ae,ae=null),T={flags:ae,angle:En,align:Tn})),isNaN(y)||isNaN(M)||s==null)throw new Error("Invalid arguments passed to jsPDF.text");if(s.length===0)return Fe;var qe="",Rt=!1,pt=typeof T.lineHeightFactor=="number"?T.lineHeightFactor:ji,Zt=Fe.internal.scaleFactor;function Rr(be){return be=be.split("	").join(Array(T.TabLen||9).join(" ")),st(be,ae)}function Ka(be){for(var we,Oe=be.concat(),Be=[],ui=Oe.length;ui--;)typeof(we=Oe.shift())=="string"?Be.push(we):Array.isArray(be)&&(we.length===1||we[1]===void 0&&we[2]===void 0)?Be.push(we[0]):Be.push([we[0],we[1],we[2]]);return Be}function Xa(be,we){var Oe;if(typeof be=="string")Oe=we(be)[0];else if(Array.isArray(be)){for(var Be,ui,ar=be.concat(),Aa=[],Br=ar.length;Br--;)typeof(Be=ar.shift())=="string"?Aa.push(we(Be)[0]):Array.isArray(Be)&&typeof Be[0]=="string"&&(ui=we(Be[0],Be[1],Be[2]),Aa.push([ui[0],ui[1],ui[2]]));Oe=Aa}return Oe}var ha=!1,Za=!0;if(typeof s=="string")ha=!0;else if(Array.isArray(s)){var $a=s.concat();wn=[];for(var fa,We=$a.length;We--;)(typeof(fa=$a.shift())!="string"||Array.isArray(fa)&&typeof fa[0]!="string")&&(Za=!1);ha=Za}if(ha===!1)throw new Error('Type of text must be string or Array. "'+s+'" is not recognized.');typeof s=="string"&&(s=s.match(/[\r?\n]/)?s.split(/\r\n|\r|\n/g):[s]);var pa=Nn/Fe.internal.scaleFactor,ma=pa*(pt-1);switch(T.baseline){case"bottom":M-=ma;break;case"top":M+=pa-ma;break;case"hanging":M+=pa-2*ma;break;case"middle":M+=pa/2-ma}if((Kn=T.maxWidth||0)>0&&(typeof s=="string"?s=Fe.splitTextToSize(s,Kn):Object.prototype.toString.call(s)==="[object Array]"&&(s=s.reduce(function(be,we){return be.concat(Fe.splitTextToSize(we,Kn))},[]))),ln={text:s,x:y,y:M,options:T,mutex:{pdfEscape:st,activeFontKey:te,fonts:ge,activeFontSize:Nn}},ue.publish("preProcessText",ln),s=ln.text,En=(T=ln.options).angle,!(Se instanceof qn)&&En&&typeof En=="number"){En*=Math.PI/180,T.rotationDirection===0&&(En=-En),W===E.ADVANCED&&(En=-En);var ga=Math.cos(En),Qa=Math.sin(En);Se=new qn(ga,Qa,-Qa,ga,0,0)}else En&&En instanceof qn&&(Se=En);W!==E.ADVANCED||Se||(Se=Wt),($n=T.charSpace||la)!==void 0&&(qe+=nn(I($n))+` Tc
`,this.setCharSpace(this.getCharSpace()||0)),(Le=T.horizontalScale)!==void 0&&(qe+=nn(100*Le)+` Tz
`),T.lang;var ct=-1,Go=T.renderingMode!==void 0?T.renderingMode:T.stroke,nr=Fe.internal.getCurrentPageInfo().pageContext;switch(Go){case 0:case!1:case"fill":ct=0;break;case 1:case!0:case"stroke":ct=1;break;case 2:case"fillThenStroke":ct=2;break;case 3:case"invisible":ct=3;break;case 4:case"fillAndAddForClipping":ct=4;break;case 5:case"strokeAndAddPathForClipping":ct=5;break;case 6:case"fillThenStrokeAndAddToPathForClipping":ct=6;break;case 7:case"addToPathForClipping":ct=7}var Fr=nr.usedRenderingMode!==void 0?nr.usedRenderingMode:-1;ct!==-1?qe+=ct+` Tr
`:Fr!==-1&&(qe+=`0 Tr
`),ct!==-1&&(nr.usedRenderingMode=ct),Tn=T.align||"left";var wt,ya=Nn*pt,Ur=Fe.internal.pageSize.getWidth(),jr=ge[te];$n=T.charSpace||la,Kn=T.maxWidth||0,ae=Object.assign({autoencode:!0,noBOM:!0},T.flags);var vi=[],qi=function(be){return Fe.getStringUnitWidth(be,{font:jr,charSpace:$n,fontSize:Nn,doKerning:!1})*Nn/Zt};if(Object.prototype.toString.call(s)==="[object Array]"){var lt;wn=Ka(s),Tn!=="left"&&(wt=wn.map(qi));var it,bi=0;if(Tn==="right"){y-=wt[0],s=[],We=wn.length;for(var si=0;si<We;si++)si===0?(it=Xt(y),lt=oi(M)):(it=I(bi-wt[si]),lt=-ya),s.push([wn[si],it,lt]),bi=wt[si]}else if(Tn==="center"){y-=wt[0]/2,s=[],We=wn.length;for(var ci=0;ci<We;ci++)ci===0?(it=Xt(y),lt=oi(M)):(it=I((bi-wt[ci])/2),lt=-ya),s.push([wn[ci],it,lt]),bi=wt[ci]}else if(Tn==="left"){s=[],We=wn.length;for(var va=0;va<We;va++)s.push(wn[va])}else if(Tn==="justify"&&jr.encoding==="Identity-H"){s=[],We=wn.length,Kn=Kn!==0?Kn:Ur;for(var li=0,_e=0;_e<We;_e++)if(lt=_e===0?oi(M):-ya,it=_e===0?Xt(y):li,_e<We-1){var er=I((Kn-wt[_e])/(wn[_e].split(" ").length-1)),at=wn[_e].split(" ");s.push([at[0]+" ",it,lt]),li=0;for(var At=1;At<at.length;At++){var ba=(qi(at[At-1]+" "+at[At])-qi(at[At]))*Zt+er;At==at.length-1?s.push([at[At],ba,0]):s.push([at[At]+" ",ba,0]),li-=ba}}else s.push([wn[_e],it,lt]);s.push(["",li,0])}else{if(Tn!=="justify")throw new Error('Unrecognized alignment option, use "left", "center", "right" or "justify".');for(s=[],We=wn.length,Kn=Kn!==0?Kn:Ur,_e=0;_e<We;_e++)lt=_e===0?oi(M):-ya,it=_e===0?Xt(y):0,_e<We-1?vi.push(nn(I((Kn-wt[_e])/(wn[_e].split(" ").length-1)))):vi.push(0),s.push([wn[_e],it,lt])}}var Tr=typeof T.R2L=="boolean"?T.R2L:jn;Tr===!0&&(s=Xa(s,function(be,we,Oe){return[be.split("").reverse().join(""),we,Oe]})),ln={text:s,x:y,y:M,options:T,mutex:{pdfEscape:st,activeFontKey:te,fonts:ge,activeFontSize:Nn}},ue.publish("postProcessText",ln),s=ln.text,Rt=ln.mutex.isHex||!1;var tr=ge[te].encoding;tr!=="WinAnsiEncoding"&&tr!=="StandardEncoding"||(s=Xa(s,function(be,we,Oe){return[Rr(be),we,Oe]})),wn=Ka(s),s=[];for(var zi,Hi,wi,Gi=0,wa=1,Vi=Array.isArray(wn[0])?wa:Gi,Ai="",ir=function(be,we,Oe){var Be="";return Oe instanceof qn?(Oe=typeof T.angle=="number"?It(Oe,new qn(1,0,0,1,be,we)):It(new qn(1,0,0,1,be,we),Oe),W===E.ADVANCED&&(Oe=It(new qn(1,0,0,-1,0,0),Oe)),Be=Oe.join(" ")+` Tm
`):Be=nn(be)+" "+nn(we)+` Td
`,Be},xt=0;xt<wn.length;xt++){switch(Ai="",Vi){case wa:wi=(Rt?"<":"(")+wn[xt][0]+(Rt?">":")"),zi=parseFloat(wn[xt][1]),Hi=parseFloat(wn[xt][2]);break;case Gi:wi=(Rt?"<":"(")+wn[xt]+(Rt?">":")"),zi=Xt(y),Hi=oi(M)}vi!==void 0&&vi[xt]!==void 0&&(Ai=vi[xt]+` Tw
`),xt===0?s.push(Ai+ir(zi,Hi,Se)+wi):Vi===Gi?s.push(Ai+wi):Vi===wa&&s.push(Ai+ir(zi,Hi,Se)+wi)}s=Vi===Gi?s.join(` Tj
T* `):s.join(` Tj
`),s+=` Tj
`;var Lt=`BT
/`;return Lt+=te+" "+Nn+` Tf
`,Lt+=nn(Nn*pt)+` TL
`,Lt+=Ti+`
`,Lt+=qe,Lt+=s,F(Lt+="ET"),x[te]=!0,Fe};var Ro=p.__private__.clip=p.clip=function(s){return F(s==="evenodd"?"W*":"W"),this};p.clipEvenOdd=function(){return Ro("evenodd")},p.__private__.discardPath=p.discardPath=function(){return F("n"),this};var Kt=p.__private__.isValidStyle=function(s){var y=!1;return[void 0,null,"S","D","F","DF","FD","f","f*","B","B*","n"].indexOf(s)!==-1&&(y=!0),y};p.__private__.setDefaultPathOperation=p.setDefaultPathOperation=function(s){return Kt(s)&&(m=s),this};var Cr=p.__private__.getStyle=p.getStyle=function(s){var y=m;switch(s){case"D":case"S":y="S";break;case"F":y="f";break;case"FD":case"DF":y="B";break;case"f":case"f*":case"B":case"B*":y=s}return y},Pr=p.close=function(){return F("h"),this};p.stroke=function(){return F("S"),this},p.fill=function(s){return sa("f",s),this},p.fillEvenOdd=function(s){return sa("f*",s),this},p.fillStroke=function(s){return sa("B",s),this},p.fillStrokeEvenOdd=function(s){return sa("B*",s),this};var sa=function(s,y){fe(y)==="object"?Uo(y,s):F(s)},Ta=function(s){s===null||W===E.ADVANCED&&s===void 0||(s=Cr(s),F(s))};function Fo(s,y,M,T,K){var ln=new _a(y||this.boundingBox,M||this.xStep,T||this.yStep,this.gState,K||this.matrix);ln.stream=this.stream;var wn=s+"$$"+this.cloneIndex+++"$$";return ot(wn,ln),ln}var Uo=function(s,y){var M=Ei[s.key],T=le[M];if(T instanceof Yi)F("q"),F(jo(y)),T.gState&&p.setGState(T.gState),F(s.matrix.toString()+" cm"),F("/"+M+" sh"),F("Q");else if(T instanceof _a){var K=new qn(1,0,0,-1,0,yi());s.matrix&&(K=K.multiply(s.matrix||Wt),M=Fo.call(T,s.key,s.boundingBox,s.xStep,s.yStep,K).id),F("q"),F("/Pattern cs"),F("/"+M+" scn"),T.gState&&p.setGState(T.gState),F(y),F("Q")}},jo=function(s){switch(s){case"f":case"F":return"W n";case"f*":return"W* n";case"B":return"W S";case"B*":return"W* S";case"S":return"W S";case"n":return"W n"}},Ba=p.moveTo=function(s,y){return F(nn(I(s))+" "+nn(j(y))+" m"),this},Ui=p.lineTo=function(s,y){return F(nn(I(s))+" "+nn(j(y))+" l"),this},mi=p.curveTo=function(s,y,M,T,K,ln){return F([nn(I(s)),nn(j(y)),nn(I(M)),nn(j(T)),nn(I(K)),nn(j(ln)),"c"].join(" ")),this};p.__private__.line=p.line=function(s,y,M,T,K){if(isNaN(s)||isNaN(y)||isNaN(M)||isNaN(T)||!Kt(K))throw new Error("Invalid arguments passed to jsPDF.line");return W===E.COMPAT?this.lines([[M-s,T-y]],s,y,[1,1],K||"S"):this.lines([[M-s,T-y]],s,y,[1,1]).stroke()},p.__private__.lines=p.lines=function(s,y,M,T,K,ln){var wn,En,Tn,$n,Kn,ae,Le,Se,Fe,Xe,qe,Rt;if(typeof s=="number"&&(Rt=M,M=y,y=s,s=Rt),T=T||[1,1],ln=ln||!1,isNaN(y)||isNaN(M)||!Array.isArray(s)||!Array.isArray(T)||!Kt(K)||typeof ln!="boolean")throw new Error("Invalid arguments passed to jsPDF.lines");for(Ba(y,M),wn=T[0],En=T[1],$n=s.length,Xe=y,qe=M,Tn=0;Tn<$n;Tn++)(Kn=s[Tn]).length===2?(Xe=Kn[0]*wn+Xe,qe=Kn[1]*En+qe,Ui(Xe,qe)):(ae=Kn[0]*wn+Xe,Le=Kn[1]*En+qe,Se=Kn[2]*wn+Xe,Fe=Kn[3]*En+qe,Xe=Kn[4]*wn+Xe,qe=Kn[5]*En+qe,mi(ae,Le,Se,Fe,Xe,qe));return ln&&Pr(),Ta(K),this},p.path=function(s){for(var y=0;y<s.length;y++){var M=s[y],T=M.c;switch(M.op){case"m":Ba(T[0],T[1]);break;case"l":Ui(T[0],T[1]);break;case"c":mi.apply(this,T);break;case"h":Pr()}}return this},p.__private__.rect=p.rect=function(s,y,M,T,K){if(isNaN(s)||isNaN(y)||isNaN(M)||isNaN(T)||!Kt(K))throw new Error("Invalid arguments passed to jsPDF.rect");return W===E.COMPAT&&(T=-T),F([nn(I(s)),nn(j(y)),nn(I(M)),nn(I(T)),"re"].join(" ")),Ta(K),this},p.__private__.triangle=p.triangle=function(s,y,M,T,K,ln,wn){if(isNaN(s)||isNaN(y)||isNaN(M)||isNaN(T)||isNaN(K)||isNaN(ln)||!Kt(wn))throw new Error("Invalid arguments passed to jsPDF.triangle");return this.lines([[M-s,T-y],[K-M,ln-T],[s-K,y-ln]],s,y,[1,1],wn,!0),this},p.__private__.roundedRect=p.roundedRect=function(s,y,M,T,K,ln,wn){if(isNaN(s)||isNaN(y)||isNaN(M)||isNaN(T)||isNaN(K)||isNaN(ln)||!Kt(wn))throw new Error("Invalid arguments passed to jsPDF.roundedRect");var En=4/3*(Math.SQRT2-1);return K=Math.min(K,.5*M),ln=Math.min(ln,.5*T),this.lines([[M-2*K,0],[K*En,0,K,ln-ln*En,K,ln],[0,T-2*ln],[0,ln*En,-K*En,ln,-K,ln],[2*K-M,0],[-K*En,0,-K,-ln*En,-K,-ln],[0,2*ln-T],[0,-ln*En,K*En,-ln,K,-ln]],s+K,y,[1,1],wn,!0),this},p.__private__.ellipse=p.ellipse=function(s,y,M,T,K){if(isNaN(s)||isNaN(y)||isNaN(M)||isNaN(T)||!Kt(K))throw new Error("Invalid arguments passed to jsPDF.ellipse");var ln=4/3*(Math.SQRT2-1)*M,wn=4/3*(Math.SQRT2-1)*T;return Ba(s+M,y),mi(s+M,y-wn,s+ln,y-T,s,y-T),mi(s-ln,y-T,s-M,y-wn,s-M,y),mi(s-M,y+wn,s-ln,y+T,s,y+T),mi(s+ln,y+T,s+M,y+wn,s+M,y),Ta(K),this},p.__private__.circle=p.circle=function(s,y,M,T){if(isNaN(s)||isNaN(y)||isNaN(M)||!Kt(T))throw new Error("Invalid arguments passed to jsPDF.circle");return this.ellipse(s,y,M,M,T)},p.setFont=function(s,y,M){return M&&(y=An(y,M)),te=kr(s,y,{disableWarning:!1}),this};var To=p.__private__.getFont=p.getFont=function(){return ge[kr.apply(p,arguments)]};p.__private__.getFontList=p.getFontList=function(){var s,y,M={};for(s in xe)if(xe.hasOwnProperty(s))for(y in M[s]=[],xe[s])xe[s].hasOwnProperty(y)&&M[s].push(y);return M},p.addFont=function(s,y,M,T,K){var ln=["StandardEncoding","MacRomanEncoding","Identity-H","WinAnsiEncoding"];return arguments[3]&&ln.indexOf(arguments[3])!==-1?K=arguments[3]:arguments[3]&&ln.indexOf(arguments[3])==-1&&(M=An(M,T)),K=K||"Identity-H",Fa.call(this,s,y,M,K)};var ji,qa=i.lineWidth||.200025,ca=p.__private__.getLineWidth=p.getLineWidth=function(){return qa},Ir=p.__private__.setLineWidth=p.setLineWidth=function(s){return qa=s,F(nn(I(s))+" w"),this};p.__private__.setLineDash=Hn.API.setLineDash=Hn.API.setLineDashPattern=function(s,y){if(s=s||[],y=y||0,isNaN(y)||!Array.isArray(s))throw new Error("Invalid arguments passed to jsPDF.setLineDash");return s=s.map(function(M){return nn(I(M))}).join(" "),y=nn(I(y)),F("["+s+"] "+y+" d"),this};var _r=p.__private__.getLineHeight=p.getLineHeight=function(){return Nn*ji};p.__private__.getLineHeight=p.getLineHeight=function(){return Nn*ji};var Or=p.__private__.setLineHeightFactor=p.setLineHeightFactor=function(s){return typeof(s=s||1.15)=="number"&&(ji=s),this},Mr=p.__private__.getLineHeightFactor=p.getLineHeightFactor=function(){return ji};Or(i.lineHeight);var Xt=p.__private__.getHorizontalCoordinate=function(s){return I(s)},oi=p.__private__.getVerticalCoordinate=function(s){return W===E.ADVANCED?s:Yn[O].mediaBox.topRightY-Yn[O].mediaBox.bottomLeftY-I(s)},Bo=p.__private__.getHorizontalCoordinateString=p.getHorizontalCoordinateString=function(s){return nn(Xt(s))},gi=p.__private__.getVerticalCoordinateString=p.getVerticalCoordinateString=function(s){return nn(oi(s))},Et=i.strokeColor||"0 G";p.__private__.getStrokeColor=p.getDrawColor=function(){return Ot(Et)},p.__private__.setStrokeColor=p.setDrawColor=function(s,y,M,T){return Et=Mt({ch1:s,ch2:y,ch3:M,ch4:T,pdfColorType:"draw",precision:2}),F(Et),this};var za=i.fillColor||"0 g";p.__private__.getFillColor=p.getFillColor=function(){return Ot(za)},p.__private__.setFillColor=p.setFillColor=function(s,y,M,T){return za=Mt({ch1:s,ch2:y,ch3:M,ch4:T,pdfColorType:"fill",precision:2}),F(za),this};var Ti=i.textColor||"0 g",qo=p.__private__.getTextColor=p.getTextColor=function(){return Ot(Ti)};p.__private__.setTextColor=p.setTextColor=function(s,y,M,T){return Ti=Mt({ch1:s,ch2:y,ch3:M,ch4:T,pdfColorType:"text",precision:3}),this};var la=i.charSpace,zo=p.__private__.getCharSpace=p.getCharSpace=function(){return parseFloat(la||0)};p.__private__.setCharSpace=p.setCharSpace=function(s){if(isNaN(s))throw new Error("Invalid argument passed to jsPDF.setCharSpace");return la=s,this};var Ha=0;p.CapJoinStyles={0:0,butt:0,but:0,miter:0,1:1,round:1,rounded:1,circle:1,2:2,projecting:2,project:2,square:2,bevel:2},p.__private__.setLineCap=p.setLineCap=function(s){var y=p.CapJoinStyles[s];if(y===void 0)throw new Error("Line cap style of '"+s+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return Ha=y,F(y+" J"),this};var Ga=0;p.__private__.setLineJoin=p.setLineJoin=function(s){var y=p.CapJoinStyles[s];if(y===void 0)throw new Error("Line join style of '"+s+"' is not recognized. See or extend .CapJoinStyles property for valid styles");return Ga=y,F(y+" j"),this},p.__private__.setLineMiterLimit=p.__private__.setMiterLimit=p.setLineMiterLimit=p.setMiterLimit=function(s){if(s=s||0,isNaN(s))throw new Error("Invalid argument passed to jsPDF.setLineMiterLimit");return F(nn(I(s))+" M"),this},p.GState=mo,p.setGState=function(s){(s=typeof s=="string"?ke[Pt[s]]:Dr(null,s)).equals(ii)||(F("/"+s.id+" gs"),ii=s)};var Dr=function(s,y){if(!s||!Pt[s]){var M=!1;for(var T in ke)if(ke.hasOwnProperty(T)&&ke[T].equals(y)){M=!0;break}if(M)y=ke[T];else{var K="GS"+(Object.keys(ke).length+1).toString(10);ke[K]=y,y.id=K}return s&&(Pt[s]=y.id),ue.publish("addGState",y),y}};p.addGState=function(s,y){return Dr(s,y),this},p.saveGraphicsState=function(){return F("q"),Ht.push({key:te,size:Nn,color:Ti}),this},p.restoreGraphicsState=function(){F("Q");var s=Ht.pop();return te=s.key,Nn=s.size,Ti=s.color,ii=null,this},p.setCurrentTransformationMatrix=function(s){return F(s.toString()+" cm"),this},p.comment=function(s){return F("#"+s),this};var ua=function(s,y){var M=s||0;Object.defineProperty(this,"x",{enumerable:!0,get:function(){return M},set:function(ln){isNaN(ln)||(M=parseFloat(ln))}});var T=y||0;Object.defineProperty(this,"y",{enumerable:!0,get:function(){return T},set:function(ln){isNaN(ln)||(T=parseFloat(ln))}});var K="pt";return Object.defineProperty(this,"type",{enumerable:!0,get:function(){return K},set:function(ln){K=ln.toString()}}),this},Va=function(s,y,M,T){ua.call(this,s,y),this.type="rect";var K=M||0;Object.defineProperty(this,"w",{enumerable:!0,get:function(){return K},set:function(wn){isNaN(wn)||(K=parseFloat(wn))}});var ln=T||0;return Object.defineProperty(this,"h",{enumerable:!0,get:function(){return ln},set:function(wn){isNaN(wn)||(ln=parseFloat(wn))}}),this},Wa=function(){this.page=Ne,this.currentPage=O,this.pages=Ln.slice(0),this.pagesContext=Yn.slice(0),this.x=Ye,this.y=se,this.matrix=Ct,this.width=Bi(O),this.height=yi(O),this.outputDestination=Cn,this.id="",this.objectNumber=-1};Wa.prototype.restore=function(){Ne=this.page,O=this.currentPage,Yn=this.pagesContext,Ln=this.pages,Ye=this.x,se=this.y,Ct=this.matrix,Ja(O,this.width),Ya(O,this.height),Cn=this.outputDestination};var Er=function(s,y,M,T,K){Vt.push(new Wa),Ne=O=0,Ln=[],Ye=s,se=y,Ct=K,Ua([M,T])},Ho=function(s){if(Gt[s])Vt.pop().restore();else{var y=new Wa,M="Xo"+(Object.keys(Ve).length+1).toString(10);y.id=M,Gt[s]=M,Ve[M]=y,ue.publish("addFormObject",y),Vt.pop().restore()}};for(var da in p.beginFormObject=function(s,y,M,T,K){return Er(s,y,M,T,K),this},p.endFormObject=function(s){return Ho(s),this},p.doFormObject=function(s,y){var M=Ve[Gt[s]];return F("q"),F(y.toString()+" cm"),F("/"+M.id+" Do"),F("Q"),this},p.getFormObject=function(s){var y=Ve[Gt[s]];return{x:y.x,y:y.y,width:y.width,height:y.height,matrix:y.matrix}},p.save=function(s,y){return s=s||"generated.pdf",(y=y||{}).returnPromise=y.returnPromise||!1,y.returnPromise===!1?(Ji(ra(ri()),s),typeof Ji.unload=="function"&&Gn.setTimeout&&setTimeout(Ji.unload,911),this):new Promise(function(M,T){try{var K=Ji(ra(ri()),s);typeof Ji.unload=="function"&&Gn.setTimeout&&setTimeout(Ji.unload,911),M(K)}catch(ln){T(ln.message)}})},Hn.API)Hn.API.hasOwnProperty(da)&&(da==="events"&&Hn.API.events.length?function(s,y){var M,T,K;for(K=y.length-1;K!==-1;K--)M=y[K][0],T=y[K][1],s.subscribe.apply(s,[M].concat(typeof T=="function"?[T]:T))}(ue,Hn.API.events):p[da]=Hn.API[da]);var Bi=p.getPageWidth=function(s){return(Yn[s=s||O].mediaBox.topRightX-Yn[s].mediaBox.bottomLeftX)/Mn},Ja=p.setPageWidth=function(s,y){Yn[s].mediaBox.topRightX=y*Mn+Yn[s].mediaBox.bottomLeftX},yi=p.getPageHeight=function(s){return(Yn[s=s||O].mediaBox.topRightY-Yn[s].mediaBox.bottomLeftY)/Mn},Ya=p.setPageHeight=function(s,y){Yn[s].mediaBox.topRightY=y*Mn+Yn[s].mediaBox.bottomLeftY};return p.internal={pdfEscape:st,getStyle:Cr,getFont:To,getFontSize:In,getCharSpace:zo,getTextColor:qo,getLineHeight:_r,getLineHeightFactor:Mr,getLineWidth:ca,write:Zn,getHorizontalCoordinate:Xt,getVerticalCoordinate:oi,getCoordinateString:Bo,getVerticalCoordinateString:gi,collections:{},newObject:Te,newAdditionalObject:Zi,newObjectDeferred:Re,newObjectDeferredBegin:ft,getFilters:Jt,putStream:bt,events:ue,scaleFactor:Mn,pageSize:{getWidth:function(){return Bi(O)},setWidth:function(s){Ja(O,s)},getHeight:function(){return yi(O)},setHeight:function(s){Ya(O,s)}},encryptionOptions:v,encryption:Ke,getEncryptor:Do,output:oa,getNumberOfPages:Po,pages:Ln,out:F,f2:mn,f3:C,getPageInfo:Sr,getPageInfoByObjId:Wn,getCurrentPageInfo:Eo,getPDFVersion:P,Point:ua,Rectangle:Va,Matrix:qn,hasHotfix:Nr},Object.defineProperty(p.internal.pageSize,"width",{get:function(){return Bi(O)},set:function(s){Ja(O,s)},enumerable:!0,configurable:!0}),Object.defineProperty(p.internal.pageSize,"height",{get:function(){return yi(O)},set:function(s){Ya(O,s)},enumerable:!0,configurable:!0}),So.call(p,xn),te="F1",xr(c,t),ue.publish("initialized"),p}Pa.prototype.lsbFirstWord=function(i){return String.fromCharCode(i>>0&255,i>>8&255,i>>16&255,i>>24&255)},Pa.prototype.toHexString=function(i){return i.split("").map(function(e){return("0"+(255&e.charCodeAt(0)).toString(16)).slice(-2)}).join("")},Pa.prototype.hexToBytes=function(i){for(var e=[],t=0;t<i.length;t+=2)e.push(String.fromCharCode(parseInt(i.substr(t,2),16)));return e.join("")},Pa.prototype.processOwnerPassword=function(i,e){return Ns(ks(e).substr(0,5),i)},Pa.prototype.encryptor=function(i,e){var t=ks(this.encryptionKey+String.fromCharCode(255&i,i>>8&255,i>>16&255,255&e,e>>8&255)).substr(0,10);return function(r){return Ns(t,r)}},mo.prototype.equals=function(i){var e,t="id,objectNumber,equals";if(!i||fe(i)!==fe(this))return!1;var r=0;for(e in this)if(!(t.indexOf(e)>=0)){if(this.hasOwnProperty(e)&&!i.hasOwnProperty(e)||this[e]!==i[e])return!1;r++}for(e in i)i.hasOwnProperty(e)&&t.indexOf(e)<0&&r--;return r===0},Hn.API={events:[]},Hn.version="3.0.1";var Pe=Hn.API,Os=1,Xi=function(i){return i.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")},Sa=function(i){return i.replace(/\\\\/g,"\\").replace(/\\\(/g,"(").replace(/\\\)/g,")")},Xn=function(i){return i.toFixed(2)},_i=function(i){return i.toFixed(5)};Pe.__acroform__={};var ht=function(i,e){i.prototype=Object.create(e.prototype),i.prototype.constructor=i},mc=function(i){return i*Os},Qt=function(i){var e=new Hc,t=Fn.internal.getHeight(i)||0,r=Fn.internal.getWidth(i)||0;return e.BBox=[0,0,Number(Xn(r)),Number(Xn(t))],e},nu=Pe.__acroform__.setBit=function(i,e){if(i=i||0,e=e||0,isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBit");return i|=1<<e},eu=Pe.__acroform__.clearBit=function(i,e){if(i=i||0,e=e||0,isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBit");return i&=~(1<<e)},tu=Pe.__acroform__.getBit=function(i,e){if(isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBit");return i&1<<e?1:0},Me=Pe.__acroform__.getBitForPdf=function(i,e){if(isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.getBitForPdf");return tu(i,e-1)},De=Pe.__acroform__.setBitForPdf=function(i,e){if(isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.setBitForPdf");return nu(i,e-1)},Ee=Pe.__acroform__.clearBitForPdf=function(i,e){if(isNaN(i)||isNaN(e))throw new Error("Invalid arguments passed to jsPDF.API.__acroform__.clearBitForPdf");return eu(i,e-1)},iu=Pe.__acroform__.calculateCoordinates=function(i,e){var t=e.internal.getHorizontalCoordinate,r=e.internal.getVerticalCoordinate,c=i[0],o=i[1],l=i[2],d=i[3],h={};return h.lowerLeft_X=t(c)||0,h.lowerLeft_Y=r(o+d)||0,h.upperRight_X=t(c+l)||0,h.upperRight_Y=r(o)||0,[Number(Xn(h.lowerLeft_X)),Number(Xn(h.lowerLeft_Y)),Number(Xn(h.upperRight_X)),Number(Xn(h.upperRight_Y))]},au=function(i){if(i.appearanceStreamContent)return i.appearanceStreamContent;if(i.V||i.DV){var e=[],t=i._V||i.DV,r=Ss(i,t),c=i.scope.internal.getFont(i.fontName,i.fontStyle).id;e.push("/Tx BMC"),e.push("q"),e.push("BT"),e.push(i.scope.__private__.encodeColorString(i.color)),e.push("/"+c+" "+Xn(r.fontSize)+" Tf"),e.push("1 0 0 1 0 0 Tm"),e.push(r.text),e.push("ET"),e.push("Q"),e.push("EMC");var o=Qt(i);return o.scope=i.scope,o.stream=e.join(`
`),o}},Ss=function(i,e){var t=i.fontSize===0?i.maxFontSize:i.fontSize,r={text:"",fontSize:""},c=(e=(e=e.substr(0,1)=="("?e.substr(1):e).substr(e.length-1)==")"?e.substr(0,e.length-1):e).split(" ");c=i.multiline?c.map(function(C){return C.split(`
`)}):c.map(function(C){return[C]});var o=t,l=Fn.internal.getHeight(i)||0;l=l<0?-l:l;var d=Fn.internal.getWidth(i)||0;d=d<0?-d:d;var h=function(C,I,G){if(C+1<c.length){var j=I+" "+c[C+1][0];return so(j,i,G).width<=d-4}return!1};o++;n:for(;o>0;){e="",o--;var m,v,b=so("3",i,o).height,x=i.multiline?l-o:(l-b)/2,p=x+=2,D=0,P=0,U=0;if(o<=0){e=`(...) Tj
`,e+="% Width of Text: "+so(e,i,o=12).width+", FieldWidth:"+d+`
`;break}for(var S="",E=0,W=0;W<c.length;W++)if(c.hasOwnProperty(W)){var sn=!1;if(c[W].length!==1&&U!==c[W].length-1){if((b+2)*(E+2)+2>l)continue n;S+=c[W][U],sn=!0,P=W,W--}else{S=(S+=c[W][U]+" ").substr(S.length-1)==" "?S.substr(0,S.length-1):S;var dn=parseInt(W),An=h(dn,S,o),nn=W>=c.length-1;if(An&&!nn){S+=" ",U=0;continue}if(An||nn){if(nn)P=dn;else if(i.multiline&&(b+2)*(E+2)+2>l)continue n}else{if(!i.multiline||(b+2)*(E+2)+2>l)continue n;P=dn}}for(var q="",an=D;an<=P;an++){var mn=c[an];if(i.multiline){if(an===P){q+=mn[U]+" ",U=(U+1)%mn.length;continue}if(an===D){q+=mn[mn.length-1]+" ";continue}}q+=mn[0]+" "}switch(q=q.substr(q.length-1)==" "?q.substr(0,q.length-1):q,v=so(q,i,o).width,i.textAlign){case"right":m=d-v-2;break;case"center":m=(d-v)/2;break;case"left":default:m=2}e+=Xn(m)+" "+Xn(p)+` Td
`,e+="("+Xi(q)+`) Tj
`,e+=-Xn(m)+` 0 Td
`,p=-(o+2),v=0,D=sn?P:P+1,E++,S=""}break}return r.text=e,r.fontSize=o,r},so=function(i,e,t){var r=e.scope.internal.getFont(e.fontName,e.fontStyle),c=e.scope.getStringUnitWidth(i,{font:r,fontSize:parseFloat(t),charSpace:0})*parseFloat(t);return{height:e.scope.getStringUnitWidth("3",{font:r,fontSize:parseFloat(t),charSpace:0})*parseFloat(t)*1.5,width:c}},ru={fields:[],xForms:[],acroFormDictionaryRoot:null,printedOut:!1,internal:null,isInitialized:!1},ou=function(i,e){var t={type:"reference",object:i};e.internal.getPageInfo(i.page).pageContext.annotations.find(function(r){return r.type===t.type&&r.object===t.object})===void 0&&e.internal.getPageInfo(i.page).pageContext.annotations.push(t)},su=function(i,e){for(var t in i)if(i.hasOwnProperty(t)){var r=t,c=i[t];e.internal.newObjectDeferredBegin(c.objId,!0),fe(c)==="object"&&typeof c.putStream=="function"&&c.putStream(),delete i[r]}},cu=function(i,e){if(e.scope=i,i.internal!==void 0&&(i.internal.acroformPlugin===void 0||i.internal.acroformPlugin.isInitialized===!1)){if(qt.FieldNum=0,i.internal.acroformPlugin=JSON.parse(JSON.stringify(ru)),i.internal.acroformPlugin.acroFormDictionaryRoot)throw new Error("Exception while creating AcroformDictionary");Os=i.internal.scaleFactor,i.internal.acroformPlugin.acroFormDictionaryRoot=new Gc,i.internal.acroformPlugin.acroFormDictionaryRoot.scope=i,i.internal.acroformPlugin.acroFormDictionaryRoot._eventID=i.internal.events.subscribe("postPutResources",function(){(function(t){t.internal.events.unsubscribe(t.internal.acroformPlugin.acroFormDictionaryRoot._eventID),delete t.internal.acroformPlugin.acroFormDictionaryRoot._eventID,t.internal.acroformPlugin.printedOut=!0})(i)}),i.internal.events.subscribe("buildDocument",function(){(function(t){t.internal.acroformPlugin.acroFormDictionaryRoot.objId=void 0;var r=t.internal.acroformPlugin.acroFormDictionaryRoot.Fields;for(var c in r)if(r.hasOwnProperty(c)){var o=r[c];o.objId=void 0,o.hasAnnotation&&ou(o,t)}})(i)}),i.internal.events.subscribe("putCatalog",function(){(function(t){if(t.internal.acroformPlugin.acroFormDictionaryRoot===void 0)throw new Error("putCatalogCallback: Root missing.");t.internal.write("/AcroForm "+t.internal.acroformPlugin.acroFormDictionaryRoot.objId+" 0 R")})(i)}),i.internal.events.subscribe("postPutPages",function(t){(function(r,c){var o=!r;for(var l in r||(c.internal.newObjectDeferredBegin(c.internal.acroformPlugin.acroFormDictionaryRoot.objId,!0),c.internal.acroformPlugin.acroFormDictionaryRoot.putStream()),r=r||c.internal.acroformPlugin.acroFormDictionaryRoot.Kids)if(r.hasOwnProperty(l)){var d=r[l],h=[],m=d.Rect;if(d.Rect&&(d.Rect=iu(d.Rect,c)),c.internal.newObjectDeferredBegin(d.objId,!0),d.DA=Fn.createDefaultAppearanceStream(d),fe(d)==="object"&&typeof d.getKeyValueListForStream=="function"&&(h=d.getKeyValueListForStream()),d.Rect=m,d.hasAppearanceStream&&!d.appearanceStreamContent){var v=au(d);h.push({key:"AP",value:"<</N "+v+">>"}),c.internal.acroformPlugin.xForms.push(v)}if(d.appearanceStreamContent){var b="";for(var x in d.appearanceStreamContent)if(d.appearanceStreamContent.hasOwnProperty(x)){var p=d.appearanceStreamContent[x];if(b+="/"+x+" ",b+="<<",Object.keys(p).length>=1||Array.isArray(p)){for(var l in p)if(p.hasOwnProperty(l)){var D=p[l];typeof D=="function"&&(D=D.call(c,d)),b+="/"+l+" "+D+" ",c.internal.acroformPlugin.xForms.indexOf(D)>=0||c.internal.acroformPlugin.xForms.push(D)}}else typeof(D=p)=="function"&&(D=D.call(c,d)),b+="/"+l+" "+D,c.internal.acroformPlugin.xForms.indexOf(D)>=0||c.internal.acroformPlugin.xForms.push(D);b+=">>"}h.push({key:"AP",value:`<<
`+b+">>"})}c.internal.putStream({additionalKeyValues:h,objectId:d.objId}),c.internal.out("endobj")}o&&su(c.internal.acroformPlugin.xForms,c)})(t,i)}),i.internal.acroformPlugin.isInitialized=!0}},zc=Pe.__acroform__.arrayToPdfArray=function(i,e,t){var r=function(l){return l};if(Array.isArray(i)){for(var c="[",o=0;o<i.length;o++)switch(o!==0&&(c+=" "),fe(i[o])){case"boolean":case"number":case"object":c+=i[o].toString();break;case"string":i[o].substr(0,1)!=="/"?(e!==void 0&&t&&(r=t.internal.getEncryptor(e)),c+="("+Xi(r(i[o].toString()))+")"):c+=i[o].toString()}return c+="]"}throw new Error("Invalid argument passed to jsPDF.__acroform__.arrayToPdfArray")},ps=function(i,e,t){var r=function(c){return c};return e!==void 0&&t&&(r=t.internal.getEncryptor(e)),(i=i||"").toString(),i="("+Xi(r(i))+")"},ni=function(){this._objId=void 0,this._scope=void 0,Object.defineProperty(this,"objId",{get:function(){if(this._objId===void 0){if(this.scope===void 0)return;this._objId=this.scope.internal.newObjectDeferred()}return this._objId},set:function(i){this._objId=i}}),Object.defineProperty(this,"scope",{value:this._scope,writable:!0})};ni.prototype.toString=function(){return this.objId+" 0 R"},ni.prototype.putStream=function(){var i=this.getKeyValueListForStream();this.scope.internal.putStream({data:this.stream,additionalKeyValues:i,objectId:this.objId}),this.scope.internal.out("endobj")},ni.prototype.getKeyValueListForStream=function(){var i=[],e=Object.getOwnPropertyNames(this).filter(function(o){return o!="content"&&o!="appearanceStreamContent"&&o!="scope"&&o!="objId"&&o.substring(0,1)!="_"});for(var t in e)if(Object.getOwnPropertyDescriptor(this,e[t]).configurable===!1){var r=e[t],c=this[r];c&&(Array.isArray(c)?i.push({key:r,value:zc(c,this.objId,this.scope)}):c instanceof ni?(c.scope=this.scope,i.push({key:r,value:c.objId+" 0 R"})):typeof c!="function"&&i.push({key:r,value:c}))}return i};var Hc=function(){ni.call(this),Object.defineProperty(this,"Type",{value:"/XObject",configurable:!1,writable:!0}),Object.defineProperty(this,"Subtype",{value:"/Form",configurable:!1,writable:!0}),Object.defineProperty(this,"FormType",{value:1,configurable:!1,writable:!0});var i,e=[];Object.defineProperty(this,"BBox",{configurable:!1,get:function(){return e},set:function(t){e=t}}),Object.defineProperty(this,"Resources",{value:"2 0 R",configurable:!1,writable:!0}),Object.defineProperty(this,"stream",{enumerable:!1,configurable:!0,set:function(t){i=t.trim()},get:function(){return i||null}})};ht(Hc,ni);var Gc=function(){ni.call(this);var i,e=[];Object.defineProperty(this,"Kids",{enumerable:!1,configurable:!0,get:function(){return e.length>0?e:void 0}}),Object.defineProperty(this,"Fields",{enumerable:!1,configurable:!1,get:function(){return e}}),Object.defineProperty(this,"DA",{enumerable:!1,configurable:!1,get:function(){if(i){var t=function(r){return r};return this.scope&&(t=this.scope.internal.getEncryptor(this.objId)),"("+Xi(t(i))+")"}},set:function(t){i=t}})};ht(Gc,ni);var qt=function i(){ni.call(this);var e=4;Object.defineProperty(this,"F",{enumerable:!1,configurable:!1,get:function(){return e},set:function(S){if(isNaN(S))throw new Error('Invalid value "'+S+'" for attribute F supplied.');e=S}}),Object.defineProperty(this,"showWhenPrinted",{enumerable:!0,configurable:!0,get:function(){return!!Me(e,3)},set:function(S){S?this.F=De(e,3):this.F=Ee(e,3)}});var t=0;Object.defineProperty(this,"Ff",{enumerable:!1,configurable:!1,get:function(){return t},set:function(S){if(isNaN(S))throw new Error('Invalid value "'+S+'" for attribute Ff supplied.');t=S}});var r=[];Object.defineProperty(this,"Rect",{enumerable:!1,configurable:!1,get:function(){if(r.length!==0)return r},set:function(S){r=S!==void 0?S:[]}}),Object.defineProperty(this,"x",{enumerable:!0,configurable:!0,get:function(){return!r||isNaN(r[0])?0:r[0]},set:function(S){r[0]=S}}),Object.defineProperty(this,"y",{enumerable:!0,configurable:!0,get:function(){return!r||isNaN(r[1])?0:r[1]},set:function(S){r[1]=S}}),Object.defineProperty(this,"width",{enumerable:!0,configurable:!0,get:function(){return!r||isNaN(r[2])?0:r[2]},set:function(S){r[2]=S}}),Object.defineProperty(this,"height",{enumerable:!0,configurable:!0,get:function(){return!r||isNaN(r[3])?0:r[3]},set:function(S){r[3]=S}});var c="";Object.defineProperty(this,"FT",{enumerable:!0,configurable:!1,get:function(){return c},set:function(S){switch(S){case"/Btn":case"/Tx":case"/Ch":case"/Sig":c=S;break;default:throw new Error('Invalid value "'+S+'" for attribute FT supplied.')}}});var o=null;Object.defineProperty(this,"T",{enumerable:!0,configurable:!1,get:function(){if(!o||o.length<1){if(this instanceof go)return;o="FieldObject"+i.FieldNum++}var S=function(E){return E};return this.scope&&(S=this.scope.internal.getEncryptor(this.objId)),"("+Xi(S(o))+")"},set:function(S){o=S.toString()}}),Object.defineProperty(this,"fieldName",{configurable:!0,enumerable:!0,get:function(){return o},set:function(S){o=S}});var l="helvetica";Object.defineProperty(this,"fontName",{enumerable:!0,configurable:!0,get:function(){return l},set:function(S){l=S}});var d="normal";Object.defineProperty(this,"fontStyle",{enumerable:!0,configurable:!0,get:function(){return d},set:function(S){d=S}});var h=0;Object.defineProperty(this,"fontSize",{enumerable:!0,configurable:!0,get:function(){return h},set:function(S){h=S}});var m=void 0;Object.defineProperty(this,"maxFontSize",{enumerable:!0,configurable:!0,get:function(){return m===void 0?50/Os:m},set:function(S){m=S}});var v="black";Object.defineProperty(this,"color",{enumerable:!0,configurable:!0,get:function(){return v},set:function(S){v=S}});var b="/F1 0 Tf 0 g";Object.defineProperty(this,"DA",{enumerable:!0,configurable:!1,get:function(){if(!(!b||this instanceof go||this instanceof Ki))return ps(b,this.objId,this.scope)},set:function(S){S=S.toString(),b=S}});var x=null;Object.defineProperty(this,"DV",{enumerable:!1,configurable:!1,get:function(){if(x)return this instanceof Ge?x:ps(x,this.objId,this.scope)},set:function(S){S=S.toString(),x=this instanceof Ge?S:S.substr(0,1)==="("?Sa(S.substr(1,S.length-2)):Sa(S)}}),Object.defineProperty(this,"defaultValue",{enumerable:!0,configurable:!0,get:function(){return this instanceof Ge?Sa(x.substr(1,x.length-1)):x},set:function(S){S=S.toString(),x=this instanceof Ge?"/"+S:S}});var p=null;Object.defineProperty(this,"_V",{enumerable:!1,configurable:!1,get:function(){if(p)return p},set:function(S){this.V=S}}),Object.defineProperty(this,"V",{enumerable:!1,configurable:!1,get:function(){if(p)return this instanceof Ge?p:ps(p,this.objId,this.scope)},set:function(S){S=S.toString(),p=this instanceof Ge?S:S.substr(0,1)==="("?Sa(S.substr(1,S.length-2)):Sa(S)}}),Object.defineProperty(this,"value",{enumerable:!0,configurable:!0,get:function(){return this instanceof Ge?Sa(p.substr(1,p.length-1)):p},set:function(S){S=S.toString(),p=this instanceof Ge?"/"+S:S}}),Object.defineProperty(this,"hasAnnotation",{enumerable:!0,configurable:!0,get:function(){return this.Rect}}),Object.defineProperty(this,"Type",{enumerable:!0,configurable:!1,get:function(){return this.hasAnnotation?"/Annot":null}}),Object.defineProperty(this,"Subtype",{enumerable:!0,configurable:!1,get:function(){return this.hasAnnotation?"/Widget":null}});var D,P=!1;Object.defineProperty(this,"hasAppearanceStream",{enumerable:!0,configurable:!0,get:function(){return P},set:function(S){S=!!S,P=S}}),Object.defineProperty(this,"page",{enumerable:!0,configurable:!0,get:function(){if(D)return D},set:function(S){D=S}}),Object.defineProperty(this,"readOnly",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,1)},set:function(S){S?this.Ff=De(this.Ff,1):this.Ff=Ee(this.Ff,1)}}),Object.defineProperty(this,"required",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,2)},set:function(S){S?this.Ff=De(this.Ff,2):this.Ff=Ee(this.Ff,2)}}),Object.defineProperty(this,"noExport",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,3)},set:function(S){S?this.Ff=De(this.Ff,3):this.Ff=Ee(this.Ff,3)}});var U=null;Object.defineProperty(this,"Q",{enumerable:!0,configurable:!1,get:function(){if(U!==null)return U},set:function(S){if([0,1,2].indexOf(S)===-1)throw new Error('Invalid value "'+S+'" for attribute Q supplied.');U=S}}),Object.defineProperty(this,"textAlign",{get:function(){var S;switch(U){case 0:default:S="left";break;case 1:S="center";break;case 2:S="right"}return S},configurable:!0,enumerable:!0,set:function(S){switch(S){case"right":case 2:U=2;break;case"center":case 1:U=1;break;case"left":case 0:default:U=0}}})};ht(qt,ni);var Oa=function(){qt.call(this),this.FT="/Ch",this.V="()",this.fontName="zapfdingbats";var i=0;Object.defineProperty(this,"TI",{enumerable:!0,configurable:!1,get:function(){return i},set:function(t){i=t}}),Object.defineProperty(this,"topIndex",{enumerable:!0,configurable:!0,get:function(){return i},set:function(t){i=t}});var e=[];Object.defineProperty(this,"Opt",{enumerable:!0,configurable:!1,get:function(){return zc(e,this.objId,this.scope)},set:function(t){var r,c;c=[],typeof(r=t)=="string"&&(c=function(o,l,d){d||(d=1);for(var h,m=[];h=l.exec(o);)m.push(h[d]);return m}(r,/\((.*?)\)/g)),e=c}}),this.getOptions=function(){return e},this.setOptions=function(t){e=t,this.sort&&e.sort()},this.addOption=function(t){t=(t=t||"").toString(),e.push(t),this.sort&&e.sort()},this.removeOption=function(t,r){for(r=r||!1,t=(t=t||"").toString();e.indexOf(t)!==-1&&(e.splice(e.indexOf(t),1),r!==!1););},Object.defineProperty(this,"combo",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,18)},set:function(t){t?this.Ff=De(this.Ff,18):this.Ff=Ee(this.Ff,18)}}),Object.defineProperty(this,"edit",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,19)},set:function(t){this.combo===!0&&(t?this.Ff=De(this.Ff,19):this.Ff=Ee(this.Ff,19))}}),Object.defineProperty(this,"sort",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,20)},set:function(t){t?(this.Ff=De(this.Ff,20),e.sort()):this.Ff=Ee(this.Ff,20)}}),Object.defineProperty(this,"multiSelect",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,22)},set:function(t){t?this.Ff=De(this.Ff,22):this.Ff=Ee(this.Ff,22)}}),Object.defineProperty(this,"doNotSpellCheck",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,23)},set:function(t){t?this.Ff=De(this.Ff,23):this.Ff=Ee(this.Ff,23)}}),Object.defineProperty(this,"commitOnSelChange",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,27)},set:function(t){t?this.Ff=De(this.Ff,27):this.Ff=Ee(this.Ff,27)}}),this.hasAppearanceStream=!1};ht(Oa,qt);var Ma=function(){Oa.call(this),this.fontName="helvetica",this.combo=!1};ht(Ma,Oa);var Da=function(){Ma.call(this),this.combo=!0};ht(Da,Ma);var uo=function(){Da.call(this),this.edit=!0};ht(uo,Da);var Ge=function(){qt.call(this),this.FT="/Btn",Object.defineProperty(this,"noToggleToOff",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,15)},set:function(t){t?this.Ff=De(this.Ff,15):this.Ff=Ee(this.Ff,15)}}),Object.defineProperty(this,"radio",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,16)},set:function(t){t?this.Ff=De(this.Ff,16):this.Ff=Ee(this.Ff,16)}}),Object.defineProperty(this,"pushButton",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,17)},set:function(t){t?this.Ff=De(this.Ff,17):this.Ff=Ee(this.Ff,17)}}),Object.defineProperty(this,"radioIsUnison",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,26)},set:function(t){t?this.Ff=De(this.Ff,26):this.Ff=Ee(this.Ff,26)}});var i,e={};Object.defineProperty(this,"MK",{enumerable:!1,configurable:!1,get:function(){var t=function(o){return o};if(this.scope&&(t=this.scope.internal.getEncryptor(this.objId)),Object.keys(e).length!==0){var r,c=[];for(r in c.push("<<"),e)c.push("/"+r+" ("+Xi(t(e[r]))+")");return c.push(">>"),c.join(`
`)}},set:function(t){fe(t)==="object"&&(e=t)}}),Object.defineProperty(this,"caption",{enumerable:!0,configurable:!0,get:function(){return e.CA||""},set:function(t){typeof t=="string"&&(e.CA=t)}}),Object.defineProperty(this,"AS",{enumerable:!1,configurable:!1,get:function(){return i},set:function(t){i=t}}),Object.defineProperty(this,"appearanceState",{enumerable:!0,configurable:!0,get:function(){return i.substr(1,i.length-1)},set:function(t){i="/"+t}})};ht(Ge,qt);var ho=function(){Ge.call(this),this.pushButton=!0};ht(ho,Ge);var Ea=function(){Ge.call(this),this.radio=!0,this.pushButton=!1;var i=[];Object.defineProperty(this,"Kids",{enumerable:!0,configurable:!1,get:function(){return i},set:function(e){i=e!==void 0?e:[]}})};ht(Ea,Ge);var go=function(){var i,e;qt.call(this),Object.defineProperty(this,"Parent",{enumerable:!1,configurable:!1,get:function(){return i},set:function(c){i=c}}),Object.defineProperty(this,"optionName",{enumerable:!1,configurable:!0,get:function(){return e},set:function(c){e=c}});var t,r={};Object.defineProperty(this,"MK",{enumerable:!1,configurable:!1,get:function(){var c=function(d){return d};this.scope&&(c=this.scope.internal.getEncryptor(this.objId));var o,l=[];for(o in l.push("<<"),r)l.push("/"+o+" ("+Xi(c(r[o]))+")");return l.push(">>"),l.join(`
`)},set:function(c){fe(c)==="object"&&(r=c)}}),Object.defineProperty(this,"caption",{enumerable:!0,configurable:!0,get:function(){return r.CA||""},set:function(c){typeof c=="string"&&(r.CA=c)}}),Object.defineProperty(this,"AS",{enumerable:!1,configurable:!1,get:function(){return t},set:function(c){t=c}}),Object.defineProperty(this,"appearanceState",{enumerable:!0,configurable:!0,get:function(){return t.substr(1,t.length-1)},set:function(c){t="/"+c}}),this.caption="l",this.appearanceState="Off",this._AppearanceType=Fn.RadioButton.Circle,this.appearanceStreamContent=this._AppearanceType.createAppearanceStream(this.optionName)};ht(go,qt),Ea.prototype.setAppearance=function(i){if(!("createAppearanceStream"in i)||!("getCA"in i))throw new Error("Couldn't assign Appearance to RadioButton. Appearance was Invalid!");for(var e in this.Kids)if(this.Kids.hasOwnProperty(e)){var t=this.Kids[e];t.appearanceStreamContent=i.createAppearanceStream(t.optionName),t.caption=i.getCA()}},Ea.prototype.createOption=function(i){var e=new go;return e.Parent=this,e.optionName=i,this.Kids.push(e),lu.call(this.scope,e),e};var fo=function(){Ge.call(this),this.fontName="zapfdingbats",this.caption="3",this.appearanceState="On",this.value="On",this.textAlign="center",this.appearanceStreamContent=Fn.CheckBox.createAppearanceStream()};ht(fo,Ge);var Ki=function(){qt.call(this),this.FT="/Tx",Object.defineProperty(this,"multiline",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,13)},set:function(e){e?this.Ff=De(this.Ff,13):this.Ff=Ee(this.Ff,13)}}),Object.defineProperty(this,"fileSelect",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,21)},set:function(e){e?this.Ff=De(this.Ff,21):this.Ff=Ee(this.Ff,21)}}),Object.defineProperty(this,"doNotSpellCheck",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,23)},set:function(e){e?this.Ff=De(this.Ff,23):this.Ff=Ee(this.Ff,23)}}),Object.defineProperty(this,"doNotScroll",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,24)},set:function(e){e?this.Ff=De(this.Ff,24):this.Ff=Ee(this.Ff,24)}}),Object.defineProperty(this,"comb",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,25)},set:function(e){e?this.Ff=De(this.Ff,25):this.Ff=Ee(this.Ff,25)}}),Object.defineProperty(this,"richText",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,26)},set:function(e){e?this.Ff=De(this.Ff,26):this.Ff=Ee(this.Ff,26)}});var i=null;Object.defineProperty(this,"MaxLen",{enumerable:!0,configurable:!1,get:function(){return i},set:function(e){i=e}}),Object.defineProperty(this,"maxLength",{enumerable:!0,configurable:!0,get:function(){return i},set:function(e){Number.isInteger(e)&&(i=e)}}),Object.defineProperty(this,"hasAppearanceStream",{enumerable:!0,configurable:!0,get:function(){return this.V||this.DV}})};ht(Ki,qt);var po=function(){Ki.call(this),Object.defineProperty(this,"password",{enumerable:!0,configurable:!0,get:function(){return!!Me(this.Ff,14)},set:function(i){i?this.Ff=De(this.Ff,14):this.Ff=Ee(this.Ff,14)}}),this.password=!0};ht(po,Ki);var Fn={CheckBox:{createAppearanceStream:function(){return{N:{On:Fn.CheckBox.YesNormal},D:{On:Fn.CheckBox.YesPushDown,Off:Fn.CheckBox.OffPushDown}}},YesPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=[],r=i.scope.internal.getFont(i.fontName,i.fontStyle).id,c=i.scope.__private__.encodeColorString(i.color),o=Ss(i,i.caption);return t.push("0.749023 g"),t.push("0 0 "+Xn(Fn.internal.getWidth(i))+" "+Xn(Fn.internal.getHeight(i))+" re"),t.push("f"),t.push("BMC"),t.push("q"),t.push("0 0 1 rg"),t.push("/"+r+" "+Xn(o.fontSize)+" Tf "+c),t.push("BT"),t.push(o.text),t.push("ET"),t.push("Q"),t.push("EMC"),e.stream=t.join(`
`),e},YesNormal:function(i){var e=Qt(i);e.scope=i.scope;var t=i.scope.internal.getFont(i.fontName,i.fontStyle).id,r=i.scope.__private__.encodeColorString(i.color),c=[],o=Fn.internal.getHeight(i),l=Fn.internal.getWidth(i),d=Ss(i,i.caption);return c.push("1 g"),c.push("0 0 "+Xn(l)+" "+Xn(o)+" re"),c.push("f"),c.push("q"),c.push("0 0 1 rg"),c.push("0 0 "+Xn(l-1)+" "+Xn(o-1)+" re"),c.push("W"),c.push("n"),c.push("0 g"),c.push("BT"),c.push("/"+t+" "+Xn(d.fontSize)+" Tf "+r),c.push(d.text),c.push("ET"),c.push("Q"),e.stream=c.join(`
`),e},OffPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=[];return t.push("0.749023 g"),t.push("0 0 "+Xn(Fn.internal.getWidth(i))+" "+Xn(Fn.internal.getHeight(i))+" re"),t.push("f"),e.stream=t.join(`
`),e}},RadioButton:{Circle:{createAppearanceStream:function(i){var e={D:{Off:Fn.RadioButton.Circle.OffPushDown},N:{}};return e.N[i]=Fn.RadioButton.Circle.YesNormal,e.D[i]=Fn.RadioButton.Circle.YesPushDown,e},getCA:function(){return"l"},YesNormal:function(i){var e=Qt(i);e.scope=i.scope;var t=[],r=Fn.internal.getWidth(i)<=Fn.internal.getHeight(i)?Fn.internal.getWidth(i)/4:Fn.internal.getHeight(i)/4;r=Number((.9*r).toFixed(5));var c=Fn.internal.Bezier_C,o=Number((r*c).toFixed(5));return t.push("q"),t.push("1 0 0 1 "+_i(Fn.internal.getWidth(i)/2)+" "+_i(Fn.internal.getHeight(i)/2)+" cm"),t.push(r+" 0 m"),t.push(r+" "+o+" "+o+" "+r+" 0 "+r+" c"),t.push("-"+o+" "+r+" -"+r+" "+o+" -"+r+" 0 c"),t.push("-"+r+" -"+o+" -"+o+" -"+r+" 0 -"+r+" c"),t.push(o+" -"+r+" "+r+" -"+o+" "+r+" 0 c"),t.push("f"),t.push("Q"),e.stream=t.join(`
`),e},YesPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=[],r=Fn.internal.getWidth(i)<=Fn.internal.getHeight(i)?Fn.internal.getWidth(i)/4:Fn.internal.getHeight(i)/4;r=Number((.9*r).toFixed(5));var c=Number((2*r).toFixed(5)),o=Number((c*Fn.internal.Bezier_C).toFixed(5)),l=Number((r*Fn.internal.Bezier_C).toFixed(5));return t.push("0.749023 g"),t.push("q"),t.push("1 0 0 1 "+_i(Fn.internal.getWidth(i)/2)+" "+_i(Fn.internal.getHeight(i)/2)+" cm"),t.push(c+" 0 m"),t.push(c+" "+o+" "+o+" "+c+" 0 "+c+" c"),t.push("-"+o+" "+c+" -"+c+" "+o+" -"+c+" 0 c"),t.push("-"+c+" -"+o+" -"+o+" -"+c+" 0 -"+c+" c"),t.push(o+" -"+c+" "+c+" -"+o+" "+c+" 0 c"),t.push("f"),t.push("Q"),t.push("0 g"),t.push("q"),t.push("1 0 0 1 "+_i(Fn.internal.getWidth(i)/2)+" "+_i(Fn.internal.getHeight(i)/2)+" cm"),t.push(r+" 0 m"),t.push(r+" "+l+" "+l+" "+r+" 0 "+r+" c"),t.push("-"+l+" "+r+" -"+r+" "+l+" -"+r+" 0 c"),t.push("-"+r+" -"+l+" -"+l+" -"+r+" 0 -"+r+" c"),t.push(l+" -"+r+" "+r+" -"+l+" "+r+" 0 c"),t.push("f"),t.push("Q"),e.stream=t.join(`
`),e},OffPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=[],r=Fn.internal.getWidth(i)<=Fn.internal.getHeight(i)?Fn.internal.getWidth(i)/4:Fn.internal.getHeight(i)/4;r=Number((.9*r).toFixed(5));var c=Number((2*r).toFixed(5)),o=Number((c*Fn.internal.Bezier_C).toFixed(5));return t.push("0.749023 g"),t.push("q"),t.push("1 0 0 1 "+_i(Fn.internal.getWidth(i)/2)+" "+_i(Fn.internal.getHeight(i)/2)+" cm"),t.push(c+" 0 m"),t.push(c+" "+o+" "+o+" "+c+" 0 "+c+" c"),t.push("-"+o+" "+c+" -"+c+" "+o+" -"+c+" 0 c"),t.push("-"+c+" -"+o+" -"+o+" -"+c+" 0 -"+c+" c"),t.push(o+" -"+c+" "+c+" -"+o+" "+c+" 0 c"),t.push("f"),t.push("Q"),e.stream=t.join(`
`),e}},Cross:{createAppearanceStream:function(i){var e={D:{Off:Fn.RadioButton.Cross.OffPushDown},N:{}};return e.N[i]=Fn.RadioButton.Cross.YesNormal,e.D[i]=Fn.RadioButton.Cross.YesPushDown,e},getCA:function(){return"8"},YesNormal:function(i){var e=Qt(i);e.scope=i.scope;var t=[],r=Fn.internal.calculateCross(i);return t.push("q"),t.push("1 1 "+Xn(Fn.internal.getWidth(i)-2)+" "+Xn(Fn.internal.getHeight(i)-2)+" re"),t.push("W"),t.push("n"),t.push(Xn(r.x1.x)+" "+Xn(r.x1.y)+" m"),t.push(Xn(r.x2.x)+" "+Xn(r.x2.y)+" l"),t.push(Xn(r.x4.x)+" "+Xn(r.x4.y)+" m"),t.push(Xn(r.x3.x)+" "+Xn(r.x3.y)+" l"),t.push("s"),t.push("Q"),e.stream=t.join(`
`),e},YesPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=Fn.internal.calculateCross(i),r=[];return r.push("0.749023 g"),r.push("0 0 "+Xn(Fn.internal.getWidth(i))+" "+Xn(Fn.internal.getHeight(i))+" re"),r.push("f"),r.push("q"),r.push("1 1 "+Xn(Fn.internal.getWidth(i)-2)+" "+Xn(Fn.internal.getHeight(i)-2)+" re"),r.push("W"),r.push("n"),r.push(Xn(t.x1.x)+" "+Xn(t.x1.y)+" m"),r.push(Xn(t.x2.x)+" "+Xn(t.x2.y)+" l"),r.push(Xn(t.x4.x)+" "+Xn(t.x4.y)+" m"),r.push(Xn(t.x3.x)+" "+Xn(t.x3.y)+" l"),r.push("s"),r.push("Q"),e.stream=r.join(`
`),e},OffPushDown:function(i){var e=Qt(i);e.scope=i.scope;var t=[];return t.push("0.749023 g"),t.push("0 0 "+Xn(Fn.internal.getWidth(i))+" "+Xn(Fn.internal.getHeight(i))+" re"),t.push("f"),e.stream=t.join(`
`),e}}},createDefaultAppearanceStream:function(i){var e=i.scope.internal.getFont(i.fontName,i.fontStyle).id,t=i.scope.__private__.encodeColorString(i.color);return"/"+e+" "+i.fontSize+" Tf "+t}};Fn.internal={Bezier_C:.551915024494,calculateCross:function(i){var e=Fn.internal.getWidth(i),t=Fn.internal.getHeight(i),r=Math.min(e,t);return{x1:{x:(e-r)/2,y:(t-r)/2+r},x2:{x:(e-r)/2+r,y:(t-r)/2},x3:{x:(e-r)/2,y:(t-r)/2},x4:{x:(e-r)/2+r,y:(t-r)/2+r}}}},Fn.internal.getWidth=function(i){var e=0;return fe(i)==="object"&&(e=mc(i.Rect[2])),e},Fn.internal.getHeight=function(i){var e=0;return fe(i)==="object"&&(e=mc(i.Rect[3])),e};var lu=Pe.addField=function(i){if(cu(this,i),!(i instanceof qt))throw new Error("Invalid argument passed to jsPDF.addField.");var e;return(e=i).scope.internal.acroformPlugin.printedOut&&(e.scope.internal.acroformPlugin.printedOut=!1,e.scope.internal.acroformPlugin.acroFormDictionaryRoot=null),e.scope.internal.acroformPlugin.acroFormDictionaryRoot.Fields.push(e),i.page=i.scope.internal.getCurrentPageInfo().pageNumber,this};Pe.AcroFormChoiceField=Oa,Pe.AcroFormListBox=Ma,Pe.AcroFormComboBox=Da,Pe.AcroFormEditBox=uo,Pe.AcroFormButton=Ge,Pe.AcroFormPushButton=ho,Pe.AcroFormRadioButton=Ea,Pe.AcroFormCheckBox=fo,Pe.AcroFormTextField=Ki,Pe.AcroFormPasswordField=po,Pe.AcroFormAppearance=Fn,Pe.AcroForm={ChoiceField:Oa,ListBox:Ma,ComboBox:Da,EditBox:uo,Button:Ge,PushButton:ho,RadioButton:Ea,CheckBox:fo,TextField:Ki,PasswordField:po,Appearance:Fn},Hn.AcroForm={ChoiceField:Oa,ListBox:Ma,ComboBox:Da,EditBox:uo,Button:Ge,PushButton:ho,RadioButton:Ea,CheckBox:fo,TextField:Ki,PasswordField:po,Appearance:Fn};function Vc(i){return i.reduce(function(e,t,r){return e[t]=r,e},{})}(function(i){i.__addimage__={};var e="UNKNOWN",t={PNG:[[137,80,78,71]],TIFF:[[77,77,0,42],[73,73,42,0]],JPEG:[[255,216,255,224,void 0,void 0,74,70,73,70,0],[255,216,255,225,void 0,void 0,69,120,105,102,0,0],[255,216,255,219],[255,216,255,238]],JPEG2000:[[0,0,0,12,106,80,32,32]],GIF87a:[[71,73,70,56,55,97]],GIF89a:[[71,73,70,56,57,97]],WEBP:[[82,73,70,70,void 0,void 0,void 0,void 0,87,69,66,80]],BMP:[[66,77],[66,65],[67,73],[67,80],[73,67],[80,84]]},r=i.__addimage__.getImageFileTypeByImageData=function(C,I){var G,j,cn,rn,hn,$=e;if((I=I||e)==="RGBA"||C.data!==void 0&&C.data instanceof Uint8ClampedArray&&"height"in C&&"width"in C)return"RGBA";if(An(C))for(hn in t)for(cn=t[hn],G=0;G<cn.length;G+=1){for(rn=!0,j=0;j<cn[G].length;j+=1)if(cn[G][j]!==void 0&&cn[G][j]!==C[j]){rn=!1;break}if(rn===!0){$=hn;break}}else for(hn in t)for(cn=t[hn],G=0;G<cn.length;G+=1){for(rn=!0,j=0;j<cn[G].length;j+=1)if(cn[G][j]!==void 0&&cn[G][j]!==C.charCodeAt(j)){rn=!1;break}if(rn===!0){$=hn;break}}return $===e&&I!==e&&($=I),$},c=function C(I){for(var G=this.internal.write,j=this.internal.putStream,cn=(0,this.internal.getFilters)();cn.indexOf("FlateEncode")!==-1;)cn.splice(cn.indexOf("FlateEncode"),1);I.objectId=this.internal.newObject();var rn=[];if(rn.push({key:"Type",value:"/XObject"}),rn.push({key:"Subtype",value:"/Image"}),rn.push({key:"Width",value:I.width}),rn.push({key:"Height",value:I.height}),I.colorSpace===U.INDEXED?rn.push({key:"ColorSpace",value:"[/Indexed /DeviceRGB "+(I.palette.length/3-1)+" "+("sMask"in I&&I.sMask!==void 0?I.objectId+2:I.objectId+1)+" 0 R]"}):(rn.push({key:"ColorSpace",value:"/"+I.colorSpace}),I.colorSpace===U.DEVICE_CMYK&&rn.push({key:"Decode",value:"[1 0 1 0 1 0 1 0]"})),rn.push({key:"BitsPerComponent",value:I.bitsPerComponent}),"decodeParameters"in I&&I.decodeParameters!==void 0&&rn.push({key:"DecodeParms",value:"<<"+I.decodeParameters+">>"}),"transparency"in I&&Array.isArray(I.transparency)){for(var hn="",$=0,un=I.transparency.length;$<un;$++)hn+=I.transparency[$]+" "+I.transparency[$]+" ";rn.push({key:"Mask",value:"["+hn+"]"})}I.sMask!==void 0&&rn.push({key:"SMask",value:I.objectId+1+" 0 R"});var pn=I.filter!==void 0?["/"+I.filter]:void 0;if(j({data:I.data,additionalKeyValues:rn,alreadyAppliedFilters:pn,objectId:I.objectId}),G("endobj"),"sMask"in I&&I.sMask!==void 0){var Dn="/Predictor "+I.predictor+" /Colors 1 /BitsPerComponent "+I.bitsPerComponent+" /Columns "+I.width,L={width:I.width,height:I.height,colorSpace:"DeviceGray",bitsPerComponent:I.bitsPerComponent,decodeParameters:Dn,data:I.sMask};"filter"in I&&(L.filter=I.filter),C.call(this,L)}if(I.colorSpace===U.INDEXED){var O=this.internal.newObject();j({data:q(new Uint8Array(I.palette)),objectId:O}),G("endobj")}},o=function(){var C=this.internal.collections.addImage_images;for(var I in C)c.call(this,C[I])},l=function(){var C,I=this.internal.collections.addImage_images,G=this.internal.write;for(var j in I)G("/I"+(C=I[j]).index,C.objectId,"0","R")},d=function(){this.internal.collections.addImage_images||(this.internal.collections.addImage_images={},this.internal.events.subscribe("putResources",o),this.internal.events.subscribe("putXobjectDict",l))},h=function(){var C=this.internal.collections.addImage_images;return d.call(this),C},m=function(){return Object.keys(this.internal.collections.addImage_images).length},v=function(C){return typeof i["process"+C.toUpperCase()]=="function"},b=function(C){return fe(C)==="object"&&C.nodeType===1},x=function(C,I){if(C.nodeName==="IMG"&&C.hasAttribute("src")){var G=""+C.getAttribute("src");if(G.indexOf("data:image/")===0)return pr(unescape(G).split("base64,").pop());var j=i.loadFile(G,!0);if(j!==void 0)return j}if(C.nodeName==="CANVAS"){if(C.width===0||C.height===0)throw new Error("Given canvas must have data. Canvas width: "+C.width+", height: "+C.height);var cn;switch(I){case"PNG":cn="image/png";break;case"WEBP":cn="image/webp";break;case"JPEG":case"JPG":default:cn="image/jpeg"}return pr(C.toDataURL(cn,1).split("base64,").pop())}},p=function(C){var I=this.internal.collections.addImage_images;if(I){for(var G in I)if(C===I[G].alias)return I[G]}},D=function(C,I,G){return C||I||(C=-96,I=-96),C<0&&(C=-1*G.width*72/C/this.internal.scaleFactor),I<0&&(I=-1*G.height*72/I/this.internal.scaleFactor),C===0&&(C=I*G.width/G.height),I===0&&(I=C*G.height/G.width),[C,I]},P=function(C,I,G,j,cn,rn){var hn=D.call(this,G,j,cn),$=this.internal.getCoordinateString,un=this.internal.getVerticalCoordinateString,pn=h.call(this);if(G=hn[0],j=hn[1],pn[cn.index]=cn,rn){rn*=Math.PI/180;var Dn=Math.cos(rn),L=Math.sin(rn),O=function(B){return B.toFixed(4)},R=[O(Dn),O(L),O(-1*L),O(Dn),0,0,"cm"]}this.internal.write("q"),rn?(this.internal.write([1,"0","0",1,$(C),un(I+j),"cm"].join(" ")),this.internal.write(R.join(" ")),this.internal.write([$(G),"0","0",$(j),"0","0","cm"].join(" "))):this.internal.write([$(G),"0","0",$(j),$(C),un(I+j),"cm"].join(" ")),this.isAdvancedAPI()&&this.internal.write([1,0,0,-1,0,0,"cm"].join(" ")),this.internal.write("/I"+cn.index+" Do"),this.internal.write("Q")},U=i.color_spaces={DEVICE_RGB:"DeviceRGB",DEVICE_GRAY:"DeviceGray",DEVICE_CMYK:"DeviceCMYK",CAL_GREY:"CalGray",CAL_RGB:"CalRGB",LAB:"Lab",ICC_BASED:"ICCBased",INDEXED:"Indexed",PATTERN:"Pattern",SEPARATION:"Separation",DEVICE_N:"DeviceN"};i.decode={DCT_DECODE:"DCTDecode",FLATE_DECODE:"FlateDecode",LZW_DECODE:"LZWDecode",JPX_DECODE:"JPXDecode",JBIG2_DECODE:"JBIG2Decode",ASCII85_DECODE:"ASCII85Decode",ASCII_HEX_DECODE:"ASCIIHexDecode",RUN_LENGTH_DECODE:"RunLengthDecode",CCITT_FAX_DECODE:"CCITTFaxDecode"};var S=i.image_compression={NONE:"NONE",FAST:"FAST",MEDIUM:"MEDIUM",SLOW:"SLOW"},E=i.__addimage__.sHashCode=function(C){var I,G,j=0;if(typeof C=="string")for(G=C.length,I=0;I<G;I++)j=(j<<5)-j+C.charCodeAt(I),j|=0;else if(An(C))for(G=C.byteLength/2,I=0;I<G;I++)j=(j<<5)-j+C[I],j|=0;return j},W=i.__addimage__.validateStringAsBase64=function(C){(C=C||"").toString().trim();var I=!0;return C.length===0&&(I=!1),C.length%4!=0&&(I=!1),/^[A-Za-z0-9+/]+$/.test(C.substr(0,C.length-2))===!1&&(I=!1),/^[A-Za-z0-9/][A-Za-z0-9+/]|[A-Za-z0-9+/]=|==$/.test(C.substr(-2))===!1&&(I=!1),I},sn=i.__addimage__.extractImageFromDataUrl=function(C){if(C==null||!(C=C.trim()).startsWith("data:"))return null;var I=C.indexOf(",");return I<0?null:C.substring(0,I).trim().endsWith("base64")?C.substring(I+1):null},dn=i.__addimage__.supportsArrayBuffer=function(){return typeof ArrayBuffer<"u"&&typeof Uint8Array<"u"};i.__addimage__.isArrayBuffer=function(C){return dn()&&C instanceof ArrayBuffer};var An=i.__addimage__.isArrayBufferView=function(C){return dn()&&typeof Uint32Array<"u"&&(C instanceof Int8Array||C instanceof Uint8Array||typeof Uint8ClampedArray<"u"&&C instanceof Uint8ClampedArray||C instanceof Int16Array||C instanceof Uint16Array||C instanceof Int32Array||C instanceof Uint32Array||C instanceof Float32Array||C instanceof Float64Array)},nn=i.__addimage__.binaryStringToUint8Array=function(C){for(var I=C.length,G=new Uint8Array(I),j=0;j<I;j++)G[j]=C.charCodeAt(j);return G},q=i.__addimage__.arrayBufferToBinaryString=function(C){for(var I="",G=An(C)?C:new Uint8Array(C),j=0;j<G.length;j+=8192)I+=String.fromCharCode.apply(null,G.subarray(j,j+8192));return I};i.addImage=function(){var C,I,G,j,cn,rn,hn,$,un;if(typeof arguments[1]=="number"?(I=e,G=arguments[1],j=arguments[2],cn=arguments[3],rn=arguments[4],hn=arguments[5],$=arguments[6],un=arguments[7]):(I=arguments[1],G=arguments[2],j=arguments[3],cn=arguments[4],rn=arguments[5],hn=arguments[6],$=arguments[7],un=arguments[8]),fe(C=arguments[0])==="object"&&!b(C)&&"imageData"in C){var pn=C;C=pn.imageData,I=pn.format||I||e,G=pn.x||G||0,j=pn.y||j||0,cn=pn.w||pn.width||cn,rn=pn.h||pn.height||rn,hn=pn.alias||hn,$=pn.compression||$,un=pn.rotation||pn.angle||un}var Dn=this.internal.getFilters();if($===void 0&&Dn.indexOf("FlateEncode")!==-1&&($="SLOW"),isNaN(G)||isNaN(j))throw new Error("Invalid coordinates passed to jsPDF.addImage");d.call(this);var L=an.call(this,C,I,hn,$);return P.call(this,G,j,cn,rn,L,un),this};var an=function(C,I,G,j){var cn,rn,hn;if(typeof C=="string"&&r(C)===e){C=unescape(C);var $=mn(C,!1);($!==""||($=i.loadFile(C,!0))!==void 0)&&(C=$)}if(b(C)&&(C=x(C,I)),I=r(C,I),!v(I))throw new Error("addImage does not support files of type '"+I+"', please ensure that a plugin for '"+I+"' support is added.");if(((hn=G)==null||hn.length===0)&&(G=function(un){return typeof un=="string"||An(un)?E(un):An(un.data)?E(un.data):null}(C)),(cn=p.call(this,G))||(dn()&&(C instanceof Uint8Array||I==="RGBA"||(rn=C,C=nn(C))),cn=this["process"+I.toUpperCase()](C,m.call(this),G,function(un){return un&&typeof un=="string"&&(un=un.toUpperCase()),un in i.image_compression?un:S.NONE}(j),rn)),!cn)throw new Error("An unknown error occurred whilst processing the image.");return cn},mn=i.__addimage__.convertBase64ToBinaryString=function(C,I){I=typeof I!="boolean"||I;var G,j="";if(typeof C=="string"){var cn;G=(cn=sn(C))!==null&&cn!==void 0?cn:C;try{j=pr(G)}catch(rn){if(I)throw W(G)?new Error("atob-Error in jsPDF.convertBase64ToBinaryString "+rn.message):new Error("Supplied Data is not a valid base64-String jsPDF.convertBase64ToBinaryString ")}}return j};i.getImageProperties=function(C){var I,G,j="";if(b(C)&&(C=x(C)),typeof C=="string"&&r(C)===e&&((j=mn(C,!1))===""&&(j=i.loadFile(C)||""),C=j),G=r(C),!v(G))throw new Error("addImage does not support files of type '"+G+"', please ensure that a plugin for '"+G+"' support is added.");if(!dn()||C instanceof Uint8Array||(C=nn(C)),!(I=this["process"+G.toUpperCase()](C)))throw new Error("An unknown error occurred whilst processing the image");return I.fileType=G,I}})(Hn.API),function(i){var e=function(t){if(t!==void 0&&t!="")return!0};Hn.API.events.push(["addPage",function(t){this.internal.getPageInfo(t.pageNumber).pageContext.annotations=[]}]),i.events.push(["putPage",function(t){for(var r,c,o,l=this.internal.getCoordinateString,d=this.internal.getVerticalCoordinateString,h=this.internal.getPageInfoByObjId(t.objId),m=t.pageContext.annotations,v=!1,b=0;b<m.length&&!v;b++)switch((r=m[b]).type){case"link":(e(r.options.url)||e(r.options.pageNumber))&&(v=!0);break;case"reference":case"text":case"freetext":v=!0}if(v!=0){this.internal.write("/Annots [");for(var x=0;x<m.length;x++){r=m[x];var p=this.internal.pdfEscape,D=this.internal.getEncryptor(t.objId);switch(r.type){case"reference":this.internal.write(" "+r.object.objId+" 0 R ");break;case"text":var P=this.internal.newAdditionalObject(),U=this.internal.newAdditionalObject(),S=this.internal.getEncryptor(P.objId),E=r.title||"Note";o="<</Type /Annot /Subtype /Text "+(c="/Rect ["+l(r.bounds.x)+" "+d(r.bounds.y+r.bounds.h)+" "+l(r.bounds.x+r.bounds.w)+" "+d(r.bounds.y)+"] ")+"/Contents ("+p(S(r.contents))+")",o+=" /Popup "+U.objId+" 0 R",o+=" /P "+h.objId+" 0 R",o+=" /T ("+p(S(E))+") >>",P.content=o;var W=P.objId+" 0 R";o="<</Type /Annot /Subtype /Popup "+(c="/Rect ["+l(r.bounds.x+30)+" "+d(r.bounds.y+r.bounds.h)+" "+l(r.bounds.x+r.bounds.w+30)+" "+d(r.bounds.y)+"] ")+" /Parent "+W,r.open&&(o+=" /Open true"),o+=" >>",U.content=o,this.internal.write(P.objId,"0 R",U.objId,"0 R");break;case"freetext":c="/Rect ["+l(r.bounds.x)+" "+d(r.bounds.y)+" "+l(r.bounds.x+r.bounds.w)+" "+d(r.bounds.y+r.bounds.h)+"] ";var sn=r.color||"#000000";o="<</Type /Annot /Subtype /FreeText "+c+"/Contents ("+p(D(r.contents))+")",o+=" /DS(font: Helvetica,sans-serif 12.0pt; text-align:left; color:#"+sn+")",o+=" /Border [0 0 0]",o+=" >>",this.internal.write(o);break;case"link":if(r.options.name){var dn=this.annotations._nameMap[r.options.name];r.options.pageNumber=dn.page,r.options.top=dn.y}else r.options.top||(r.options.top=0);if(c="/Rect ["+r.finalBounds.x+" "+r.finalBounds.y+" "+r.finalBounds.w+" "+r.finalBounds.h+"] ",o="",r.options.url)o="<</Type /Annot /Subtype /Link "+c+"/Border [0 0 0] /A <</S /URI /URI ("+p(D(r.options.url))+") >>";else if(r.options.pageNumber)switch(o="<</Type /Annot /Subtype /Link "+c+"/Border [0 0 0] /Dest ["+this.internal.getPageInfo(r.options.pageNumber).objId+" 0 R",r.options.magFactor=r.options.magFactor||"XYZ",r.options.magFactor){case"Fit":o+=" /Fit]";break;case"FitH":o+=" /FitH "+r.options.top+"]";break;case"FitV":r.options.left=r.options.left||0,o+=" /FitV "+r.options.left+"]";break;case"XYZ":default:var An=d(r.options.top);r.options.left=r.options.left||0,r.options.zoom===void 0&&(r.options.zoom=0),o+=" /XYZ "+r.options.left+" "+An+" "+r.options.zoom+"]"}o!=""&&(o+=" >>",this.internal.write(o))}}this.internal.write("]")}}]),i.createAnnotation=function(t){var r=this.internal.getCurrentPageInfo();switch(t.type){case"link":this.link(t.bounds.x,t.bounds.y,t.bounds.w,t.bounds.h,t);break;case"text":case"freetext":r.pageContext.annotations.push(t)}},i.link=function(t,r,c,o,l){var d=this.internal.getCurrentPageInfo(),h=this.internal.getCoordinateString,m=this.internal.getVerticalCoordinateString;d.pageContext.annotations.push({finalBounds:{x:h(t),y:m(r),w:h(t+c),h:m(r+o)},options:l,type:"link"})},i.textWithLink=function(t,r,c,o){var l,d,h=this.getTextWidth(t),m=this.internal.getLineHeight()/this.internal.scaleFactor;if(o.maxWidth!==void 0){d=o.maxWidth;var v=this.splitTextToSize(t,d).length;l=Math.ceil(m*v)}else d=h,l=m;return this.text(t,r,c,o),c+=.2*m,o.align==="center"&&(r-=h/2),o.align==="right"&&(r-=h),this.link(r,c-m,d,l,o),h},i.getTextWidth=function(t){var r=this.internal.getFontSize();return this.getStringUnitWidth(t)*r/this.internal.scaleFactor}}(Hn.API),function(i){var e={1569:[65152],1570:[65153,65154],1571:[65155,65156],1572:[65157,65158],1573:[65159,65160],1574:[65161,65162,65163,65164],1575:[65165,65166],1576:[65167,65168,65169,65170],1577:[65171,65172],1578:[65173,65174,65175,65176],1579:[65177,65178,65179,65180],1580:[65181,65182,65183,65184],1581:[65185,65186,65187,65188],1582:[65189,65190,65191,65192],1583:[65193,65194],1584:[65195,65196],1585:[65197,65198],1586:[65199,65200],1587:[65201,65202,65203,65204],1588:[65205,65206,65207,65208],1589:[65209,65210,65211,65212],1590:[65213,65214,65215,65216],1591:[65217,65218,65219,65220],1592:[65221,65222,65223,65224],1593:[65225,65226,65227,65228],1594:[65229,65230,65231,65232],1601:[65233,65234,65235,65236],1602:[65237,65238,65239,65240],1603:[65241,65242,65243,65244],1604:[65245,65246,65247,65248],1605:[65249,65250,65251,65252],1606:[65253,65254,65255,65256],1607:[65257,65258,65259,65260],1608:[65261,65262],1609:[65263,65264,64488,64489],1610:[65265,65266,65267,65268],1649:[64336,64337],1655:[64477],1657:[64358,64359,64360,64361],1658:[64350,64351,64352,64353],1659:[64338,64339,64340,64341],1662:[64342,64343,64344,64345],1663:[64354,64355,64356,64357],1664:[64346,64347,64348,64349],1667:[64374,64375,64376,64377],1668:[64370,64371,64372,64373],1670:[64378,64379,64380,64381],1671:[64382,64383,64384,64385],1672:[64392,64393],1676:[64388,64389],1677:[64386,64387],1678:[64390,64391],1681:[64396,64397],1688:[64394,64395],1700:[64362,64363,64364,64365],1702:[64366,64367,64368,64369],1705:[64398,64399,64400,64401],1709:[64467,64468,64469,64470],1711:[64402,64403,64404,64405],1713:[64410,64411,64412,64413],1715:[64406,64407,64408,64409],1722:[64414,64415],1723:[64416,64417,64418,64419],1726:[64426,64427,64428,64429],1728:[64420,64421],1729:[64422,64423,64424,64425],1733:[64480,64481],1734:[64473,64474],1735:[64471,64472],1736:[64475,64476],1737:[64482,64483],1739:[64478,64479],1740:[64508,64509,64510,64511],1744:[64484,64485,64486,64487],1746:[64430,64431],1747:[64432,64433]},t={65247:{65154:65269,65156:65271,65160:65273,65166:65275},65248:{65154:65270,65156:65272,65160:65274,65166:65276},65165:{65247:{65248:{65258:65010}}},1617:{1612:64606,1613:64607,1614:64608,1615:64609,1616:64610}},r={1612:64606,1613:64607,1614:64608,1615:64609,1616:64610},c=[1570,1571,1573,1575];i.__arabicParser__={};var o=i.__arabicParser__.isInArabicSubstitutionA=function(P){return e[P.charCodeAt(0)]!==void 0},l=i.__arabicParser__.isArabicLetter=function(P){return typeof P=="string"&&/^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+$/.test(P)},d=i.__arabicParser__.isArabicEndLetter=function(P){return l(P)&&o(P)&&e[P.charCodeAt(0)].length<=2},h=i.__arabicParser__.isArabicAlfLetter=function(P){return l(P)&&c.indexOf(P.charCodeAt(0))>=0};i.__arabicParser__.arabicLetterHasIsolatedForm=function(P){return l(P)&&o(P)&&e[P.charCodeAt(0)].length>=1};var m=i.__arabicParser__.arabicLetterHasFinalForm=function(P){return l(P)&&o(P)&&e[P.charCodeAt(0)].length>=2};i.__arabicParser__.arabicLetterHasInitialForm=function(P){return l(P)&&o(P)&&e[P.charCodeAt(0)].length>=3};var v=i.__arabicParser__.arabicLetterHasMedialForm=function(P){return l(P)&&o(P)&&e[P.charCodeAt(0)].length==4},b=i.__arabicParser__.resolveLigatures=function(P){var U=0,S=t,E="",W=0;for(U=0;U<P.length;U+=1)S[P.charCodeAt(U)]!==void 0?(W++,typeof(S=S[P.charCodeAt(U)])=="number"&&(E+=String.fromCharCode(S),S=t,W=0),U===P.length-1&&(S=t,E+=P.charAt(U-(W-1)),U-=W-1,W=0)):(S=t,E+=P.charAt(U-W),U-=W,W=0);return E};i.__arabicParser__.isArabicDiacritic=function(P){return P!==void 0&&r[P.charCodeAt(0)]!==void 0};var x=i.__arabicParser__.getCorrectForm=function(P,U,S){return l(P)?o(P)===!1?-1:!m(P)||!l(U)&&!l(S)||!l(S)&&d(U)||d(P)&&!l(U)||d(P)&&h(U)||d(P)&&d(U)?0:v(P)&&l(U)&&!d(U)&&l(S)&&m(S)?3:d(P)||!l(S)?1:2:-1},p=function(P){var U=0,S=0,E=0,W="",sn="",dn="",An=(P=P||"").split("\\s+"),nn=[];for(U=0;U<An.length;U+=1){for(nn.push(""),S=0;S<An[U].length;S+=1)W=An[U][S],sn=An[U][S-1],dn=An[U][S+1],l(W)?(E=x(W,sn,dn),nn[U]+=E!==-1?String.fromCharCode(e[W.charCodeAt(0)][E]):W):nn[U]+=W;nn[U]=b(nn[U])}return nn.join(" ")},D=i.__arabicParser__.processArabic=i.processArabic=function(){var P,U=typeof arguments[0]=="string"?arguments[0]:arguments[0].text,S=[];if(Array.isArray(U)){var E=0;for(S=[],E=0;E<U.length;E+=1)Array.isArray(U[E])?S.push([p(U[E][0]),U[E][1],U[E][2]]):S.push([p(U[E])]);P=S}else P=p(U);return typeof arguments[0]=="string"?P:(arguments[0].text=P,arguments[0])};i.events.push(["preProcessText",D])}(Hn.API),Hn.API.autoPrint=function(i){var e;switch((i=i||{}).variant=i.variant||"non-conform",i.variant){case"javascript":this.addJS("print({});");break;case"non-conform":default:this.internal.events.subscribe("postPutResources",function(){e=this.internal.newObject(),this.internal.out("<<"),this.internal.out("/S /Named"),this.internal.out("/Type /Action"),this.internal.out("/N /Print"),this.internal.out(">>"),this.internal.out("endobj")}),this.internal.events.subscribe("putCatalog",function(){this.internal.out("/OpenAction "+e+" 0 R")})}return this},function(i){var e=function(){var t=void 0;Object.defineProperty(this,"pdf",{get:function(){return t},set:function(d){t=d}});var r=150;Object.defineProperty(this,"width",{get:function(){return r},set:function(d){r=isNaN(d)||Number.isInteger(d)===!1||d<0?150:d,this.getContext("2d").pageWrapXEnabled&&(this.getContext("2d").pageWrapX=r+1)}});var c=300;Object.defineProperty(this,"height",{get:function(){return c},set:function(d){c=isNaN(d)||Number.isInteger(d)===!1||d<0?300:d,this.getContext("2d").pageWrapYEnabled&&(this.getContext("2d").pageWrapY=c+1)}});var o=[];Object.defineProperty(this,"childNodes",{get:function(){return o},set:function(d){o=d}});var l={};Object.defineProperty(this,"style",{get:function(){return l},set:function(d){l=d}}),Object.defineProperty(this,"parentNode",{})};e.prototype.getContext=function(t,r){var c;if((t=t||"2d")!=="2d")return null;for(c in r)this.pdf.context2d.hasOwnProperty(c)&&(this.pdf.context2d[c]=r[c]);return this.pdf.context2d._canvas=this,this.pdf.context2d},e.prototype.toDataURL=function(){throw new Error("toDataURL is not implemented.")},i.events.push(["initialized",function(){this.canvas=new e,this.canvas.pdf=this}])}(Hn.API),function(i){var e={left:0,top:0,bottom:0,right:0},t=!1,r=function(){this.internal.__cell__===void 0&&(this.internal.__cell__={},this.internal.__cell__.padding=3,this.internal.__cell__.headerFunction=void 0,this.internal.__cell__.margins=Object.assign({},e),this.internal.__cell__.margins.width=this.getPageWidth(),c.call(this))},c=function(){this.internal.__cell__.lastCell=new o,this.internal.__cell__.pages=1},o=function(){var h=arguments[0];Object.defineProperty(this,"x",{enumerable:!0,get:function(){return h},set:function(P){h=P}});var m=arguments[1];Object.defineProperty(this,"y",{enumerable:!0,get:function(){return m},set:function(P){m=P}});var v=arguments[2];Object.defineProperty(this,"width",{enumerable:!0,get:function(){return v},set:function(P){v=P}});var b=arguments[3];Object.defineProperty(this,"height",{enumerable:!0,get:function(){return b},set:function(P){b=P}});var x=arguments[4];Object.defineProperty(this,"text",{enumerable:!0,get:function(){return x},set:function(P){x=P}});var p=arguments[5];Object.defineProperty(this,"lineNumber",{enumerable:!0,get:function(){return p},set:function(P){p=P}});var D=arguments[6];return Object.defineProperty(this,"align",{enumerable:!0,get:function(){return D},set:function(P){D=P}}),this};o.prototype.clone=function(){return new o(this.x,this.y,this.width,this.height,this.text,this.lineNumber,this.align)},o.prototype.toArray=function(){return[this.x,this.y,this.width,this.height,this.text,this.lineNumber,this.align]},i.setHeaderFunction=function(h){return r.call(this),this.internal.__cell__.headerFunction=typeof h=="function"?h:void 0,this},i.getTextDimensions=function(h,m){r.call(this);var v=(m=m||{}).fontSize||this.getFontSize(),b=m.font||this.getFont(),x=m.scaleFactor||this.internal.scaleFactor,p=0,D=0,P=0,U=this;if(!Array.isArray(h)&&typeof h!="string"){if(typeof h!="number")throw new Error("getTextDimensions expects text-parameter to be of type String or type Number or an Array of Strings.");h=String(h)}var S=m.maxWidth;S>0?typeof h=="string"?h=this.splitTextToSize(h,S):Object.prototype.toString.call(h)==="[object Array]"&&(h=h.reduce(function(W,sn){return W.concat(U.splitTextToSize(sn,S))},[])):h=Array.isArray(h)?h:[h];for(var E=0;E<h.length;E++)p<(P=this.getStringUnitWidth(h[E],{font:b})*v)&&(p=P);return p!==0&&(D=h.length),{w:p/=x,h:Math.max((D*v*this.getLineHeightFactor()-v*(this.getLineHeightFactor()-1))/x,0)}},i.cellAddPage=function(){r.call(this),this.addPage();var h=this.internal.__cell__.margins||e;return this.internal.__cell__.lastCell=new o(h.left,h.top,void 0,void 0),this.internal.__cell__.pages+=1,this};var l=i.cell=function(){var h;h=arguments[0]instanceof o?arguments[0]:new o(arguments[0],arguments[1],arguments[2],arguments[3],arguments[4],arguments[5]),r.call(this);var m=this.internal.__cell__.lastCell,v=this.internal.__cell__.padding,b=this.internal.__cell__.margins||e,x=this.internal.__cell__.tableHeaderRow,p=this.internal.__cell__.printHeaders;return m.lineNumber!==void 0&&(m.lineNumber===h.lineNumber?(h.x=(m.x||0)+(m.width||0),h.y=m.y||0):m.y+m.height+h.height+b.bottom>this.getPageHeight()?(this.cellAddPage(),h.y=b.top,p&&x&&(this.printHeaderRow(h.lineNumber,!0),h.y+=x[0].height)):h.y=m.y+m.height||h.y),h.text[0]!==void 0&&(this.rect(h.x,h.y,h.width,h.height,t===!0?"FD":void 0),h.align==="right"?this.text(h.text,h.x+h.width-v,h.y+v,{align:"right",baseline:"top"}):h.align==="center"?this.text(h.text,h.x+h.width/2,h.y+v,{align:"center",baseline:"top",maxWidth:h.width-v-v}):this.text(h.text,h.x+v,h.y+v,{align:"left",baseline:"top",maxWidth:h.width-v-v})),this.internal.__cell__.lastCell=h,this};i.table=function(h,m,v,b,x){if(r.call(this),!v)throw new Error("No data for PDF table.");var p,D,P,U,S=[],E=[],W=[],sn={},dn={},An=[],nn=[],q=(x=x||{}).autoSize||!1,an=x.printHeaders!==!1,mn=x.css&&x.css["font-size"]!==void 0?16*x.css["font-size"]:x.fontSize||12,C=x.margins||Object.assign({width:this.getPageWidth()},e),I=typeof x.padding=="number"?x.padding:3,G=x.headerBackgroundColor||"#c8c8c8",j=x.headerTextColor||"#000";if(c.call(this),this.internal.__cell__.printHeaders=an,this.internal.__cell__.margins=C,this.internal.__cell__.table_font_size=mn,this.internal.__cell__.padding=I,this.internal.__cell__.headerBackgroundColor=G,this.internal.__cell__.headerTextColor=j,this.setFontSize(mn),b==null)E=S=Object.keys(v[0]),W=S.map(function(){return"left"});else if(Array.isArray(b)&&fe(b[0])==="object")for(S=b.map(function(pn){return pn.name}),E=b.map(function(pn){return pn.prompt||pn.name||""}),W=b.map(function(pn){return pn.align||"left"}),p=0;p<b.length;p+=1)dn[b[p].name]=b[p].width*(19.049976/25.4);else Array.isArray(b)&&typeof b[0]=="string"&&(E=S=b,W=S.map(function(){return"left"}));if(q||Array.isArray(b)&&typeof b[0]=="string")for(p=0;p<S.length;p+=1){for(sn[U=S[p]]=v.map(function(pn){return pn[U]}),this.setFont(void 0,"bold"),An.push(this.getTextDimensions(E[p],{fontSize:this.internal.__cell__.table_font_size,scaleFactor:this.internal.scaleFactor}).w),D=sn[U],this.setFont(void 0,"normal"),P=0;P<D.length;P+=1)An.push(this.getTextDimensions(D[P],{fontSize:this.internal.__cell__.table_font_size,scaleFactor:this.internal.scaleFactor}).w);dn[U]=Math.max.apply(null,An)+I+I,An=[]}if(an){var cn={};for(p=0;p<S.length;p+=1)cn[S[p]]={},cn[S[p]].text=E[p],cn[S[p]].align=W[p];var rn=d.call(this,cn,dn);nn=S.map(function(pn){return new o(h,m,dn[pn],rn,cn[pn].text,void 0,cn[pn].align)}),this.setTableHeaderRow(nn),this.printHeaderRow(1,!1)}var hn=b.reduce(function(pn,Dn){return pn[Dn.name]=Dn.align,pn},{});for(p=0;p<v.length;p+=1){"rowStart"in x&&x.rowStart instanceof Function&&x.rowStart({row:p,data:v[p]},this);var $=d.call(this,v[p],dn);for(P=0;P<S.length;P+=1){var un=v[p][S[P]];"cellStart"in x&&x.cellStart instanceof Function&&x.cellStart({row:p,col:P,data:un},this),l.call(this,new o(h,m,dn[S[P]],$,un,p+2,hn[S[P]]))}}return this.internal.__cell__.table_x=h,this.internal.__cell__.table_y=m,this};var d=function(h,m){var v=this.internal.__cell__.padding,b=this.internal.__cell__.table_font_size,x=this.internal.scaleFactor;return Object.keys(h).map(function(p){var D=h[p];return this.splitTextToSize(D.hasOwnProperty("text")?D.text:D,m[p]-v-v)},this).map(function(p){return this.getLineHeightFactor()*p.length*b/x+v+v},this).reduce(function(p,D){return Math.max(p,D)},0)};i.setTableHeaderRow=function(h){r.call(this),this.internal.__cell__.tableHeaderRow=h},i.printHeaderRow=function(h,m){if(r.call(this),!this.internal.__cell__.tableHeaderRow)throw new Error("Property tableHeaderRow does not exist.");var v;if(t=!0,typeof this.internal.__cell__.headerFunction=="function"){var b=this.internal.__cell__.headerFunction(this,this.internal.__cell__.pages);this.internal.__cell__.lastCell=new o(b[0],b[1],b[2],b[3],void 0,-1)}this.setFont(void 0,"bold");for(var x=[],p=0;p<this.internal.__cell__.tableHeaderRow.length;p+=1){v=this.internal.__cell__.tableHeaderRow[p].clone(),m&&(v.y=this.internal.__cell__.margins.top||0,x.push(v)),v.lineNumber=h;var D=this.getTextColor();this.setTextColor(this.internal.__cell__.headerTextColor),this.setFillColor(this.internal.__cell__.headerBackgroundColor),l.call(this,v),this.setTextColor(D)}x.length>0&&this.setTableHeaderRow(x),this.setFont(void 0,"normal"),t=!1}}(Hn.API);var Wc={italic:["italic","oblique","normal"],oblique:["oblique","italic","normal"],normal:["normal","oblique","italic"]},Jc=["ultra-condensed","extra-condensed","condensed","semi-condensed","normal","semi-expanded","expanded","extra-expanded","ultra-expanded"],Cs=Vc(Jc),Yc=[100,200,300,400,500,600,700,800,900],uu=Vc(Yc);function Ps(i){var e=i.family.replace(/"|'/g,"").toLowerCase(),t=function(o){return Wc[o=o||"normal"]?o:"normal"}(i.style),r=function(o){if(!o)return 400;if(typeof o=="number")return o>=100&&o<=900&&o%100==0?o:400;if(/^\d00$/.test(o))return parseInt(o);switch(o){case"bold":return 700;case"normal":default:return 400}}(i.weight),c=function(o){return typeof Cs[o=o||"normal"]=="number"?o:"normal"}(i.stretch);return{family:e,style:t,weight:r,stretch:c,src:i.src||[],ref:i.ref||{name:e,style:[c,t,r].join(" ")}}}function gc(i,e,t,r){var c;for(c=t;c>=0&&c<e.length;c+=r)if(i[e[c]])return i[e[c]];for(c=t;c>=0&&c<e.length;c-=r)if(i[e[c]])return i[e[c]]}var du={"sans-serif":"helvetica",fixed:"courier",monospace:"courier",terminal:"courier",cursive:"times",fantasy:"times",serif:"times"},yc={caption:"times",icon:"times",menu:"times","message-box":"times","small-caption":"times","status-bar":"times"};function vc(i){return[i.stretch,i.style,i.weight,i.family].join(" ")}function hu(i,e,t){for(var r=(t=t||{}).defaultFontFamily||"times",c=Object.assign({},du,t.genericFontFamilies||{}),o=null,l=null,d=0;d<e.length;++d)if(c[(o=Ps(e[d])).family]&&(o.family=c[o.family]),i.hasOwnProperty(o.family)){l=i[o.family];break}if(!(l=l||i[r]))throw new Error("Could not find a font-family for the rule '"+vc(o)+"' and default family '"+r+"'.");if(l=function(h,m){if(m[h])return m[h];var v=Cs[h],b=v<=Cs.normal?-1:1,x=gc(m,Jc,v,b);if(!x)throw new Error("Could not find a matching font-stretch value for "+h);return x}(o.stretch,l),l=function(h,m){if(m[h])return m[h];for(var v=Wc[h],b=0;b<v.length;++b)if(m[v[b]])return m[v[b]];throw new Error("Could not find a matching font-style for "+h)}(o.style,l),!(l=function(h,m){if(m[h])return m[h];if(h===400&&m[500])return m[500];if(h===500&&m[400])return m[400];var v=uu[h],b=gc(m,Yc,v,h<400?-1:1);if(!b)throw new Error("Could not find a matching font-weight for value "+h);return b}(o.weight,l)))throw new Error("Failed to resolve a font for the rule '"+vc(o)+"'.");return l}function bc(i){return i.trimLeft()}function fu(i,e){for(var t=0;t<i.length;){if(i.charAt(t)===e)return[i.substring(0,t),i.substring(t+1)];t+=1}return null}function pu(i){var e=i.match(/^(-[a-z_]|[a-z_])[a-z0-9_-]*/i);return e===null?null:[e[0],i.substring(e[0].length)]}var co,wc,Ac,ms=["times"];(function(i){var e,t,r,c,o,l,d,h,m,v=function(L){return L=L||{},this.isStrokeTransparent=L.isStrokeTransparent||!1,this.strokeOpacity=L.strokeOpacity||1,this.strokeStyle=L.strokeStyle||"#000000",this.fillStyle=L.fillStyle||"#000000",this.isFillTransparent=L.isFillTransparent||!1,this.fillOpacity=L.fillOpacity||1,this.font=L.font||"10px sans-serif",this.textBaseline=L.textBaseline||"alphabetic",this.textAlign=L.textAlign||"left",this.lineWidth=L.lineWidth||1,this.lineJoin=L.lineJoin||"miter",this.lineCap=L.lineCap||"butt",this.path=L.path||[],this.transform=L.transform!==void 0?L.transform.clone():new h,this.globalCompositeOperation=L.globalCompositeOperation||"normal",this.globalAlpha=L.globalAlpha||1,this.clip_path=L.clip_path||[],this.currentPoint=L.currentPoint||new l,this.miterLimit=L.miterLimit||10,this.lastPoint=L.lastPoint||new l,this.lineDashOffset=L.lineDashOffset||0,this.lineDash=L.lineDash||[],this.margin=L.margin||[0,0,0,0],this.prevPageLastElemOffset=L.prevPageLastElemOffset||0,this.ignoreClearRect=typeof L.ignoreClearRect!="boolean"||L.ignoreClearRect,this};i.events.push(["initialized",function(){this.context2d=new b(this),e=this.internal.f2,t=this.internal.getCoordinateString,r=this.internal.getVerticalCoordinateString,c=this.internal.getHorizontalCoordinate,o=this.internal.getVerticalCoordinate,l=this.internal.Point,d=this.internal.Rectangle,h=this.internal.Matrix,m=new v}]);var b=function(L){Object.defineProperty(this,"canvas",{get:function(){return{parentNode:!1,style:!1}}});var O=L;Object.defineProperty(this,"pdf",{get:function(){return O}});var R=!1;Object.defineProperty(this,"pageWrapXEnabled",{get:function(){return R},set:function(fn){R=!!fn}});var B=!1;Object.defineProperty(this,"pageWrapYEnabled",{get:function(){return B},set:function(fn){B=!!fn}});var Y=0;Object.defineProperty(this,"posX",{get:function(){return Y},set:function(fn){isNaN(fn)||(Y=fn)}});var Q=0;Object.defineProperty(this,"posY",{get:function(){return Q},set:function(fn){isNaN(fn)||(Q=fn)}}),Object.defineProperty(this,"margin",{get:function(){return m.margin},set:function(fn){var F;typeof fn=="number"?F=[fn,fn,fn,fn]:((F=new Array(4))[0]=fn[0],F[1]=fn.length>=2?fn[1]:F[0],F[2]=fn.length>=3?fn[2]:F[0],F[3]=fn.length>=4?fn[3]:F[1]),m.margin=F}});var en=!1;Object.defineProperty(this,"autoPaging",{get:function(){return en},set:function(fn){en=fn}});var tn=0;Object.defineProperty(this,"lastBreak",{get:function(){return tn},set:function(fn){tn=fn}});var kn=[];Object.defineProperty(this,"pageBreaks",{get:function(){return kn},set:function(fn){kn=fn}}),Object.defineProperty(this,"ctx",{get:function(){return m},set:function(fn){fn instanceof v&&(m=fn)}}),Object.defineProperty(this,"path",{get:function(){return m.path},set:function(fn){m.path=fn}});var Ln=[];Object.defineProperty(this,"ctxStack",{get:function(){return Ln},set:function(fn){Ln=fn}}),Object.defineProperty(this,"fillStyle",{get:function(){return this.ctx.fillStyle},set:function(fn){var F;F=x(fn),this.ctx.fillStyle=F.style,this.ctx.isFillTransparent=F.a===0,this.ctx.fillOpacity=F.a,this.pdf.setFillColor(F.r,F.g,F.b,{a:F.a}),this.pdf.setTextColor(F.r,F.g,F.b,{a:F.a})}}),Object.defineProperty(this,"strokeStyle",{get:function(){return this.ctx.strokeStyle},set:function(fn){var F=x(fn);this.ctx.strokeStyle=F.style,this.ctx.isStrokeTransparent=F.a===0,this.ctx.strokeOpacity=F.a,F.a===0?this.pdf.setDrawColor(255,255,255):(F.a,this.pdf.setDrawColor(F.r,F.g,F.b))}}),Object.defineProperty(this,"lineCap",{get:function(){return this.ctx.lineCap},set:function(fn){["butt","round","square"].indexOf(fn)!==-1&&(this.ctx.lineCap=fn,this.pdf.setLineCap(fn))}}),Object.defineProperty(this,"lineWidth",{get:function(){return this.ctx.lineWidth},set:function(fn){isNaN(fn)||(this.ctx.lineWidth=fn,this.pdf.setLineWidth(fn))}}),Object.defineProperty(this,"lineJoin",{get:function(){return this.ctx.lineJoin},set:function(fn){["bevel","round","miter"].indexOf(fn)!==-1&&(this.ctx.lineJoin=fn,this.pdf.setLineJoin(fn))}}),Object.defineProperty(this,"miterLimit",{get:function(){return this.ctx.miterLimit},set:function(fn){isNaN(fn)||(this.ctx.miterLimit=fn,this.pdf.setMiterLimit(fn))}}),Object.defineProperty(this,"textBaseline",{get:function(){return this.ctx.textBaseline},set:function(fn){this.ctx.textBaseline=fn}}),Object.defineProperty(this,"textAlign",{get:function(){return this.ctx.textAlign},set:function(fn){["right","end","center","left","start"].indexOf(fn)!==-1&&(this.ctx.textAlign=fn)}});var _n=null;function Cn(fn,F){if(_n===null){var Zn=function(Un){var xn=[];return Object.keys(Un).forEach(function(Nn){Un[Nn].forEach(function(On){var In=null;switch(On){case"bold":In={family:Nn,weight:"bold"};break;case"italic":In={family:Nn,style:"italic"};break;case"bolditalic":In={family:Nn,weight:"bold",style:"italic"};break;case"":case"normal":In={family:Nn}}In!==null&&(In.ref={name:Nn,style:On},xn.push(In))})}),xn}(fn.getFontList());_n=function(Un){for(var xn={},Nn=0;Nn<Un.length;++Nn){var On=Ps(Un[Nn]),In=On.family,jn=On.stretch,Jn=On.style,ne=On.weight;xn[In]=xn[In]||{},xn[In][jn]=xn[In][jn]||{},xn[In][jn][Jn]=xn[In][jn][Jn]||{},xn[In][jn][Jn][ne]=On}return xn}(Zn.concat(F))}return _n}var zn=null;Object.defineProperty(this,"fontFaces",{get:function(){return zn},set:function(fn){_n=null,zn=fn}}),Object.defineProperty(this,"font",{get:function(){return this.ctx.font},set:function(fn){var F;if(this.ctx.font=fn,(F=/^\s*(?=(?:(?:[-a-z]+\s*){0,2}(italic|oblique))?)(?=(?:(?:[-a-z]+\s*){0,2}(small-caps))?)(?=(?:(?:[-a-z]+\s*){0,2}(bold(?:er)?|lighter|[1-9]00))?)(?:(?:normal|\1|\2|\3)\s*){0,3}((?:xx?-)?(?:small|large)|medium|smaller|larger|[.\d]+(?:\%|in|[cem]m|ex|p[ctx]))(?:\s*\/\s*(normal|[.\d]+(?:\%|in|[cem]m|ex|p[ctx])))?\s*([-_,\"\'\sa-z]+?)\s*$/i.exec(fn))!==null){var Zn=F[1];F[2];var Un=F[3],xn=F[4];F[5];var Nn=F[6],On=/^([.\d]+)((?:%|in|[cem]m|ex|p[ctx]))$/i.exec(xn)[2];xn=Math.floor(On==="px"?parseFloat(xn)*this.pdf.internal.scaleFactor:On==="em"?parseFloat(xn)*this.pdf.getFontSize():parseFloat(xn)*this.pdf.internal.scaleFactor),this.pdf.setFontSize(xn);var In=function(Vn){var te,Mn,Ye=[],se=Vn.trim();if(se==="")return ms;if(se in yc)return[yc[se]];for(;se!=="";){switch(Mn=null,te=(se=bc(se)).charAt(0)){case'"':case"'":Mn=fu(se.substring(1),te);break;default:Mn=pu(se)}if(Mn===null||(Ye.push(Mn[0]),(se=bc(Mn[1]))!==""&&se.charAt(0)!==","))return ms;se=se.replace(/^,/,"")}return Ye}(Nn);if(this.fontFaces){var jn=hu(Cn(this.pdf,this.fontFaces),In.map(function(Vn){return{family:Vn,stretch:"normal",weight:Un,style:Zn}}));this.pdf.setFont(jn.ref.name,jn.ref.style)}else{var Jn="";(Un==="bold"||parseInt(Un,10)>=700||Zn==="bold")&&(Jn="bold"),Zn==="italic"&&(Jn+="italic"),Jn.length===0&&(Jn="normal");for(var ne="",ee={arial:"Helvetica",Arial:"Helvetica",verdana:"Helvetica",Verdana:"Helvetica",helvetica:"Helvetica",Helvetica:"Helvetica","sans-serif":"Helvetica",fixed:"Courier",monospace:"Courier",terminal:"Courier",cursive:"Times",fantasy:"Times",serif:"Times"},re=0;re<In.length;re++){if(this.pdf.internal.getFont(In[re],Jn,{noFallback:!0,disableWarning:!0})!==void 0){ne=In[re];break}if(Jn==="bolditalic"&&this.pdf.internal.getFont(In[re],"bold",{noFallback:!0,disableWarning:!0})!==void 0)ne=In[re],Jn="bold";else if(this.pdf.internal.getFont(In[re],"normal",{noFallback:!0,disableWarning:!0})!==void 0){ne=In[re],Jn="normal";break}}if(ne===""){for(var pe=0;pe<In.length;pe++)if(ee[In[pe]]){ne=ee[In[pe]];break}}ne=ne===""?"Times":ne,this.pdf.setFont(ne,Jn)}}}}),Object.defineProperty(this,"globalCompositeOperation",{get:function(){return this.ctx.globalCompositeOperation},set:function(fn){this.ctx.globalCompositeOperation=fn}}),Object.defineProperty(this,"globalAlpha",{get:function(){return this.ctx.globalAlpha},set:function(fn){this.ctx.globalAlpha=fn}}),Object.defineProperty(this,"lineDashOffset",{get:function(){return this.ctx.lineDashOffset},set:function(fn){this.ctx.lineDashOffset=fn,Dn.call(this)}}),Object.defineProperty(this,"lineDash",{get:function(){return this.ctx.lineDash},set:function(fn){this.ctx.lineDash=fn,Dn.call(this)}}),Object.defineProperty(this,"ignoreClearRect",{get:function(){return this.ctx.ignoreClearRect},set:function(fn){this.ctx.ignoreClearRect=!!fn}})};b.prototype.setLineDash=function(L){this.lineDash=L},b.prototype.getLineDash=function(){return this.lineDash.length%2?this.lineDash.concat(this.lineDash):this.lineDash.slice()},b.prototype.fill=function(){sn.call(this,"fill",!1)},b.prototype.stroke=function(){sn.call(this,"stroke",!1)},b.prototype.beginPath=function(){this.path=[{type:"begin"}]},b.prototype.moveTo=function(L,O){if(isNaN(L)||isNaN(O))throw ve.error("jsPDF.context2d.moveTo: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.moveTo");var R=this.ctx.transform.applyToPoint(new l(L,O));this.path.push({type:"mt",x:R.x,y:R.y}),this.ctx.lastPoint=new l(L,O)},b.prototype.closePath=function(){var L=new l(0,0),O=0;for(O=this.path.length-1;O!==-1;O--)if(this.path[O].type==="begin"&&fe(this.path[O+1])==="object"&&typeof this.path[O+1].x=="number"){L=new l(this.path[O+1].x,this.path[O+1].y);break}this.path.push({type:"close"}),this.ctx.lastPoint=new l(L.x,L.y)},b.prototype.lineTo=function(L,O){if(isNaN(L)||isNaN(O))throw ve.error("jsPDF.context2d.lineTo: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.lineTo");var R=this.ctx.transform.applyToPoint(new l(L,O));this.path.push({type:"lt",x:R.x,y:R.y}),this.ctx.lastPoint=new l(R.x,R.y)},b.prototype.clip=function(){this.ctx.clip_path=JSON.parse(JSON.stringify(this.path)),sn.call(this,null,!0)},b.prototype.quadraticCurveTo=function(L,O,R,B){if(isNaN(R)||isNaN(B)||isNaN(L)||isNaN(O))throw ve.error("jsPDF.context2d.quadraticCurveTo: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.quadraticCurveTo");var Y=this.ctx.transform.applyToPoint(new l(R,B)),Q=this.ctx.transform.applyToPoint(new l(L,O));this.path.push({type:"qct",x1:Q.x,y1:Q.y,x:Y.x,y:Y.y}),this.ctx.lastPoint=new l(Y.x,Y.y)},b.prototype.bezierCurveTo=function(L,O,R,B,Y,Q){if(isNaN(Y)||isNaN(Q)||isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B))throw ve.error("jsPDF.context2d.bezierCurveTo: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.bezierCurveTo");var en=this.ctx.transform.applyToPoint(new l(Y,Q)),tn=this.ctx.transform.applyToPoint(new l(L,O)),kn=this.ctx.transform.applyToPoint(new l(R,B));this.path.push({type:"bct",x1:tn.x,y1:tn.y,x2:kn.x,y2:kn.y,x:en.x,y:en.y}),this.ctx.lastPoint=new l(en.x,en.y)},b.prototype.arc=function(L,O,R,B,Y,Q){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B)||isNaN(Y))throw ve.error("jsPDF.context2d.arc: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.arc");if(Q=!!Q,!this.ctx.transform.isIdentity){var en=this.ctx.transform.applyToPoint(new l(L,O));L=en.x,O=en.y;var tn=this.ctx.transform.applyToPoint(new l(0,R)),kn=this.ctx.transform.applyToPoint(new l(0,0));R=Math.sqrt(Math.pow(tn.x-kn.x,2)+Math.pow(tn.y-kn.y,2))}Math.abs(Y-B)>=2*Math.PI&&(B=0,Y=2*Math.PI),this.path.push({type:"arc",x:L,y:O,radius:R,startAngle:B,endAngle:Y,counterclockwise:Q})},b.prototype.arcTo=function(L,O,R,B,Y){throw new Error("arcTo not implemented.")},b.prototype.rect=function(L,O,R,B){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B))throw ve.error("jsPDF.context2d.rect: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.rect");this.moveTo(L,O),this.lineTo(L+R,O),this.lineTo(L+R,O+B),this.lineTo(L,O+B),this.lineTo(L,O),this.lineTo(L+R,O),this.lineTo(L,O)},b.prototype.fillRect=function(L,O,R,B){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B))throw ve.error("jsPDF.context2d.fillRect: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.fillRect");if(!p.call(this)){var Y={};this.lineCap!=="butt"&&(Y.lineCap=this.lineCap,this.lineCap="butt"),this.lineJoin!=="miter"&&(Y.lineJoin=this.lineJoin,this.lineJoin="miter"),this.beginPath(),this.rect(L,O,R,B),this.fill(),Y.hasOwnProperty("lineCap")&&(this.lineCap=Y.lineCap),Y.hasOwnProperty("lineJoin")&&(this.lineJoin=Y.lineJoin)}},b.prototype.strokeRect=function(L,O,R,B){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B))throw ve.error("jsPDF.context2d.strokeRect: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.strokeRect");D.call(this)||(this.beginPath(),this.rect(L,O,R,B),this.stroke())},b.prototype.clearRect=function(L,O,R,B){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B))throw ve.error("jsPDF.context2d.clearRect: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.clearRect");this.ignoreClearRect||(this.fillStyle="#ffffff",this.fillRect(L,O,R,B))},b.prototype.save=function(L){L=typeof L!="boolean"||L;for(var O=this.pdf.internal.getCurrentPageInfo().pageNumber,R=0;R<this.pdf.internal.getNumberOfPages();R++)this.pdf.setPage(R+1),this.pdf.internal.out("q");if(this.pdf.setPage(O),L){this.ctx.fontSize=this.pdf.internal.getFontSize();var B=new v(this.ctx);this.ctxStack.push(this.ctx),this.ctx=B}},b.prototype.restore=function(L){L=typeof L!="boolean"||L;for(var O=this.pdf.internal.getCurrentPageInfo().pageNumber,R=0;R<this.pdf.internal.getNumberOfPages();R++)this.pdf.setPage(R+1),this.pdf.internal.out("Q");this.pdf.setPage(O),L&&this.ctxStack.length!==0&&(this.ctx=this.ctxStack.pop(),this.fillStyle=this.ctx.fillStyle,this.strokeStyle=this.ctx.strokeStyle,this.font=this.ctx.font,this.lineCap=this.ctx.lineCap,this.lineWidth=this.ctx.lineWidth,this.lineJoin=this.ctx.lineJoin,this.lineDash=this.ctx.lineDash,this.lineDashOffset=this.ctx.lineDashOffset)},b.prototype.toDataURL=function(){throw new Error("toDataUrl not implemented.")};var x=function(L){var O,R,B,Y;if(L.isCanvasGradient===!0&&(L=L.getColor()),!L)return{r:0,g:0,b:0,a:0,style:L};if(/transparent|rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*0+\s*\)/.test(L))O=0,R=0,B=0,Y=0;else{var Q=/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(L);if(Q!==null)O=parseInt(Q[1]),R=parseInt(Q[2]),B=parseInt(Q[3]),Y=1;else if((Q=/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/.exec(L))!==null)O=parseInt(Q[1]),R=parseInt(Q[2]),B=parseInt(Q[3]),Y=parseFloat(Q[4]);else{if(Y=1,typeof L=="string"&&L.charAt(0)!=="#"){var en=new Tc(L);L=en.ok?en.toHex():"#000000"}L.length===4?(O=L.substring(1,2),O+=O,R=L.substring(2,3),R+=R,B=L.substring(3,4),B+=B):(O=L.substring(1,3),R=L.substring(3,5),B=L.substring(5,7)),O=parseInt(O,16),R=parseInt(R,16),B=parseInt(B,16)}}return{r:O,g:R,b:B,a:Y,style:L}},p=function(){return this.ctx.isFillTransparent||this.globalAlpha==0},D=function(){return!!(this.ctx.isStrokeTransparent||this.globalAlpha==0)};b.prototype.fillText=function(L,O,R,B){if(isNaN(O)||isNaN(R)||typeof L!="string")throw ve.error("jsPDF.context2d.fillText: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.fillText");if(B=isNaN(B)?void 0:B,!p.call(this)){var Y=$(this.ctx.transform.rotation),Q=this.ctx.transform.scaleX;I.call(this,{text:L,x:O,y:R,scale:Q,angle:Y,align:this.textAlign,maxWidth:B})}},b.prototype.strokeText=function(L,O,R,B){if(isNaN(O)||isNaN(R)||typeof L!="string")throw ve.error("jsPDF.context2d.strokeText: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.strokeText");if(!D.call(this)){B=isNaN(B)?void 0:B;var Y=$(this.ctx.transform.rotation),Q=this.ctx.transform.scaleX;I.call(this,{text:L,x:O,y:R,scale:Q,renderingMode:"stroke",angle:Y,align:this.textAlign,maxWidth:B})}},b.prototype.measureText=function(L){if(typeof L!="string")throw ve.error("jsPDF.context2d.measureText: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.measureText");var O=this.pdf,R=this.pdf.internal.scaleFactor,B=O.internal.getFontSize(),Y=O.getStringUnitWidth(L)*B/O.internal.scaleFactor,Q=function(en){var tn=(en=en||{}).width||0;return Object.defineProperty(this,"width",{get:function(){return tn}}),this};return new Q({width:Y*=Math.round(96*R/72*1e4)/1e4})},b.prototype.scale=function(L,O){if(isNaN(L)||isNaN(O))throw ve.error("jsPDF.context2d.scale: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.scale");var R=new h(L,0,0,O,0,0);this.ctx.transform=this.ctx.transform.multiply(R)},b.prototype.rotate=function(L){if(isNaN(L))throw ve.error("jsPDF.context2d.rotate: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.rotate");var O=new h(Math.cos(L),Math.sin(L),-Math.sin(L),Math.cos(L),0,0);this.ctx.transform=this.ctx.transform.multiply(O)},b.prototype.translate=function(L,O){if(isNaN(L)||isNaN(O))throw ve.error("jsPDF.context2d.translate: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.translate");var R=new h(1,0,0,1,L,O);this.ctx.transform=this.ctx.transform.multiply(R)},b.prototype.transform=function(L,O,R,B,Y,Q){if(isNaN(L)||isNaN(O)||isNaN(R)||isNaN(B)||isNaN(Y)||isNaN(Q))throw ve.error("jsPDF.context2d.transform: Invalid arguments",arguments),new Error("Invalid arguments passed to jsPDF.context2d.transform");var en=new h(L,O,R,B,Y,Q);this.ctx.transform=this.ctx.transform.multiply(en)},b.prototype.setTransform=function(L,O,R,B,Y,Q){L=isNaN(L)?1:L,O=isNaN(O)?0:O,R=isNaN(R)?0:R,B=isNaN(B)?1:B,Y=isNaN(Y)?0:Y,Q=isNaN(Q)?0:Q,this.ctx.transform=new h(L,O,R,B,Y,Q)};var P=function(){return this.margin[0]>0||this.margin[1]>0||this.margin[2]>0||this.margin[3]>0};b.prototype.drawImage=function(L,O,R,B,Y,Q,en,tn,kn){var Ln=this.pdf.getImageProperties(L),_n=1,Cn=1,zn=1,fn=1;B!==void 0&&tn!==void 0&&(zn=tn/B,fn=kn/Y,_n=Ln.width/B*tn/B,Cn=Ln.height/Y*kn/Y),Q===void 0&&(Q=O,en=R,O=0,R=0),B!==void 0&&tn===void 0&&(tn=B,kn=Y),B===void 0&&tn===void 0&&(tn=Ln.width,kn=Ln.height);for(var F,Zn=this.ctx.transform.decompose(),Un=$(Zn.rotate.shx),xn=new h,Nn=(xn=(xn=(xn=xn.multiply(Zn.translate)).multiply(Zn.skew)).multiply(Zn.scale)).applyToRectangle(new d(Q-O*zn,en-R*fn,B*_n,Y*Cn)),On=U.call(this,Nn),In=[],jn=0;jn<On.length;jn+=1)In.indexOf(On[jn])===-1&&In.push(On[jn]);if(W(In),this.autoPaging)for(var Jn=In[0],ne=In[In.length-1],ee=Jn;ee<ne+1;ee++){this.pdf.setPage(ee);var re=this.pdf.internal.pageSize.width-this.margin[3]-this.margin[1],pe=ee===1?this.posY+this.margin[0]:this.margin[0],Vn=this.pdf.internal.pageSize.height-this.posY-this.margin[0]-this.margin[2],te=this.pdf.internal.pageSize.height-this.margin[0]-this.margin[2],Mn=ee===1?0:Vn+(ee-2)*te;if(this.ctx.clip_path.length!==0){var Ye=this.path;F=JSON.parse(JSON.stringify(this.ctx.clip_path)),this.path=E(F,this.posX+this.margin[3],-Mn+pe+this.ctx.prevPageLastElemOffset),dn.call(this,"fill",!0),this.path=Ye}var se=JSON.parse(JSON.stringify(Nn));se=E([se],this.posX+this.margin[3],-Mn+pe+this.ctx.prevPageLastElemOffset)[0];var Ct=(ee>Jn||ee<ne)&&P.call(this);Ct&&(this.pdf.saveGraphicsState(),this.pdf.rect(this.margin[3],this.margin[0],re,te,null).clip().discardPath()),this.pdf.addImage(L,"JPEG",se.x,se.y,se.w,se.h,null,null,Un),Ct&&this.pdf.restoreGraphicsState()}else this.pdf.addImage(L,"JPEG",Nn.x,Nn.y,Nn.w,Nn.h,null,null,Un)};var U=function(L,O,R){var B=[];O=O||this.pdf.internal.pageSize.width,R=R||this.pdf.internal.pageSize.height-this.margin[0]-this.margin[2];var Y=this.posY+this.ctx.prevPageLastElemOffset;switch(L.type){default:case"mt":case"lt":B.push(Math.floor((L.y+Y)/R)+1);break;case"arc":B.push(Math.floor((L.y+Y-L.radius)/R)+1),B.push(Math.floor((L.y+Y+L.radius)/R)+1);break;case"qct":var Q=un(this.ctx.lastPoint.x,this.ctx.lastPoint.y,L.x1,L.y1,L.x,L.y);B.push(Math.floor((Q.y+Y)/R)+1),B.push(Math.floor((Q.y+Q.h+Y)/R)+1);break;case"bct":var en=pn(this.ctx.lastPoint.x,this.ctx.lastPoint.y,L.x1,L.y1,L.x2,L.y2,L.x,L.y);B.push(Math.floor((en.y+Y)/R)+1),B.push(Math.floor((en.y+en.h+Y)/R)+1);break;case"rect":B.push(Math.floor((L.y+Y)/R)+1),B.push(Math.floor((L.y+L.h+Y)/R)+1)}for(var tn=0;tn<B.length;tn+=1)for(;this.pdf.internal.getNumberOfPages()<B[tn];)S.call(this);return B},S=function(){var L=this.fillStyle,O=this.strokeStyle,R=this.font,B=this.lineCap,Y=this.lineWidth,Q=this.lineJoin;this.pdf.addPage(),this.fillStyle=L,this.strokeStyle=O,this.font=R,this.lineCap=B,this.lineWidth=Y,this.lineJoin=Q},E=function(L,O,R){for(var B=0;B<L.length;B++)switch(L[B].type){case"bct":L[B].x2+=O,L[B].y2+=R;case"qct":L[B].x1+=O,L[B].y1+=R;case"mt":case"lt":case"arc":default:L[B].x+=O,L[B].y+=R}return L},W=function(L){return L.sort(function(O,R){return O-R})},sn=function(L,O){for(var R,B,Y=this.fillStyle,Q=this.strokeStyle,en=this.lineCap,tn=this.lineWidth,kn=Math.abs(tn*this.ctx.transform.scaleX),Ln=this.lineJoin,_n=JSON.parse(JSON.stringify(this.path)),Cn=JSON.parse(JSON.stringify(this.path)),zn=[],fn=0;fn<Cn.length;fn++)if(Cn[fn].x!==void 0)for(var F=U.call(this,Cn[fn]),Zn=0;Zn<F.length;Zn+=1)zn.indexOf(F[Zn])===-1&&zn.push(F[Zn]);for(var Un=0;Un<zn.length;Un++)for(;this.pdf.internal.getNumberOfPages()<zn[Un];)S.call(this);if(W(zn),this.autoPaging)for(var xn=zn[0],Nn=zn[zn.length-1],On=xn;On<Nn+1;On++){this.pdf.setPage(On),this.fillStyle=Y,this.strokeStyle=Q,this.lineCap=en,this.lineWidth=kn,this.lineJoin=Ln;var In=this.pdf.internal.pageSize.width-this.margin[3]-this.margin[1],jn=On===1?this.posY+this.margin[0]:this.margin[0],Jn=this.pdf.internal.pageSize.height-this.posY-this.margin[0]-this.margin[2],ne=this.pdf.internal.pageSize.height-this.margin[0]-this.margin[2],ee=On===1?0:Jn+(On-2)*ne;if(this.ctx.clip_path.length!==0){var re=this.path;R=JSON.parse(JSON.stringify(this.ctx.clip_path)),this.path=E(R,this.posX+this.margin[3],-ee+jn+this.ctx.prevPageLastElemOffset),dn.call(this,L,!0),this.path=re}if(B=JSON.parse(JSON.stringify(_n)),this.path=E(B,this.posX+this.margin[3],-ee+jn+this.ctx.prevPageLastElemOffset),O===!1||On===0){var pe=(On>xn||On<Nn)&&P.call(this);pe&&(this.pdf.saveGraphicsState(),this.pdf.rect(this.margin[3],this.margin[0],In,ne,null).clip().discardPath()),dn.call(this,L,O),pe&&this.pdf.restoreGraphicsState()}this.lineWidth=tn}else this.lineWidth=kn,dn.call(this,L,O),this.lineWidth=tn;this.path=_n},dn=function(L,O){if((L!=="stroke"||O||!D.call(this))&&(L==="stroke"||O||!p.call(this))){for(var R,B,Y=[],Q=this.path,en=0;en<Q.length;en++){var tn=Q[en];switch(tn.type){case"begin":Y.push({begin:!0});break;case"close":Y.push({close:!0});break;case"mt":Y.push({start:tn,deltas:[],abs:[]});break;case"lt":var kn=Y.length;if(Q[en-1]&&!isNaN(Q[en-1].x)&&(R=[tn.x-Q[en-1].x,tn.y-Q[en-1].y],kn>0)){for(;kn>=0;kn--)if(Y[kn-1].close!==!0&&Y[kn-1].begin!==!0){Y[kn-1].deltas.push(R),Y[kn-1].abs.push(tn);break}}break;case"bct":R=[tn.x1-Q[en-1].x,tn.y1-Q[en-1].y,tn.x2-Q[en-1].x,tn.y2-Q[en-1].y,tn.x-Q[en-1].x,tn.y-Q[en-1].y],Y[Y.length-1].deltas.push(R);break;case"qct":var Ln=Q[en-1].x+2/3*(tn.x1-Q[en-1].x),_n=Q[en-1].y+2/3*(tn.y1-Q[en-1].y),Cn=tn.x+2/3*(tn.x1-tn.x),zn=tn.y+2/3*(tn.y1-tn.y),fn=tn.x,F=tn.y;R=[Ln-Q[en-1].x,_n-Q[en-1].y,Cn-Q[en-1].x,zn-Q[en-1].y,fn-Q[en-1].x,F-Q[en-1].y],Y[Y.length-1].deltas.push(R);break;case"arc":Y.push({deltas:[],abs:[],arc:!0}),Array.isArray(Y[Y.length-1].abs)&&Y[Y.length-1].abs.push(tn)}}B=O?null:L==="stroke"?"stroke":"fill";for(var Zn=!1,Un=0;Un<Y.length;Un++)if(Y[Un].arc)for(var xn=Y[Un].abs,Nn=0;Nn<xn.length;Nn++){var On=xn[Nn];On.type==="arc"?q.call(this,On.x,On.y,On.radius,On.startAngle,On.endAngle,On.counterclockwise,void 0,O,!Zn):G.call(this,On.x,On.y),Zn=!0}else if(Y[Un].close===!0)this.pdf.internal.out("h"),Zn=!1;else if(Y[Un].begin!==!0){var In=Y[Un].start.x,jn=Y[Un].start.y;j.call(this,Y[Un].deltas,In,jn),Zn=!0}B&&an.call(this,B),O&&mn.call(this)}},An=function(L){var O=this.pdf.internal.getFontSize()/this.pdf.internal.scaleFactor,R=O*(this.pdf.internal.getLineHeightFactor()-1);switch(this.ctx.textBaseline){case"bottom":return L-R;case"top":return L+O-R;case"hanging":return L+O-2*R;case"middle":return L+O/2-R;case"ideographic":return L;case"alphabetic":default:return L}},nn=function(L){return L+this.pdf.internal.getFontSize()/this.pdf.internal.scaleFactor*(this.pdf.internal.getLineHeightFactor()-1)};b.prototype.createLinearGradient=function(){var L=function(){};return L.colorStops=[],L.addColorStop=function(O,R){this.colorStops.push([O,R])},L.getColor=function(){return this.colorStops.length===0?"#000000":this.colorStops[0][1]},L.isCanvasGradient=!0,L},b.prototype.createPattern=function(){return this.createLinearGradient()},b.prototype.createRadialGradient=function(){return this.createLinearGradient()};var q=function(L,O,R,B,Y,Q,en,tn,kn){for(var Ln=rn.call(this,R,B,Y,Q),_n=0;_n<Ln.length;_n++){var Cn=Ln[_n];_n===0&&(kn?C.call(this,Cn.x1+L,Cn.y1+O):G.call(this,Cn.x1+L,Cn.y1+O)),cn.call(this,L,O,Cn.x2,Cn.y2,Cn.x3,Cn.y3,Cn.x4,Cn.y4)}tn?mn.call(this):an.call(this,en)},an=function(L){switch(L){case"stroke":this.pdf.internal.out("S");break;case"fill":this.pdf.internal.out("f")}},mn=function(){this.pdf.clip(),this.pdf.discardPath()},C=function(L,O){this.pdf.internal.out(t(L)+" "+r(O)+" m")},I=function(L){var O;switch(L.align){case"right":case"end":O="right";break;case"center":O="center";break;case"left":case"start":default:O="left"}var R=this.pdf.getTextDimensions(L.text),B=An.call(this,L.y),Y=nn.call(this,B)-R.h,Q=this.ctx.transform.applyToPoint(new l(L.x,B)),en=this.ctx.transform.decompose(),tn=new h;tn=(tn=(tn=tn.multiply(en.translate)).multiply(en.skew)).multiply(en.scale);for(var kn,Ln,_n,Cn=this.ctx.transform.applyToRectangle(new d(L.x,B,R.w,R.h)),zn=tn.applyToRectangle(new d(L.x,Y,R.w,R.h)),fn=U.call(this,zn),F=[],Zn=0;Zn<fn.length;Zn+=1)F.indexOf(fn[Zn])===-1&&F.push(fn[Zn]);if(W(F),this.autoPaging)for(var Un=F[0],xn=F[F.length-1],Nn=Un;Nn<xn+1;Nn++){this.pdf.setPage(Nn);var On=Nn===1?this.posY+this.margin[0]:this.margin[0],In=this.pdf.internal.pageSize.height-this.posY-this.margin[0]-this.margin[2],jn=this.pdf.internal.pageSize.height-this.margin[2],Jn=jn-this.margin[0],ne=this.pdf.internal.pageSize.width-this.margin[1],ee=ne-this.margin[3],re=Nn===1?0:In+(Nn-2)*Jn;if(this.ctx.clip_path.length!==0){var pe=this.path;kn=JSON.parse(JSON.stringify(this.ctx.clip_path)),this.path=E(kn,this.posX+this.margin[3],-1*re+On),dn.call(this,"fill",!0),this.path=pe}var Vn=E([JSON.parse(JSON.stringify(zn))],this.posX+this.margin[3],-re+On+this.ctx.prevPageLastElemOffset)[0];L.scale>=.01&&(Ln=this.pdf.internal.getFontSize(),this.pdf.setFontSize(Ln*L.scale),_n=this.lineWidth,this.lineWidth=_n*L.scale);var te=this.autoPaging!=="text";if(te||Vn.y+Vn.h<=jn){if(te||Vn.y>=On&&Vn.x<=ne){var Mn=te?L.text:this.pdf.splitTextToSize(L.text,L.maxWidth||ne-Vn.x)[0],Ye=E([JSON.parse(JSON.stringify(Cn))],this.posX+this.margin[3],-re+On+this.ctx.prevPageLastElemOffset)[0],se=te&&(Nn>Un||Nn<xn)&&P.call(this);se&&(this.pdf.saveGraphicsState(),this.pdf.rect(this.margin[3],this.margin[0],ee,Jn,null).clip().discardPath()),this.pdf.text(Mn,Ye.x,Ye.y,{angle:L.angle,align:O,renderingMode:L.renderingMode}),se&&this.pdf.restoreGraphicsState()}}else Vn.y<jn&&(this.ctx.prevPageLastElemOffset+=jn-Vn.y);L.scale>=.01&&(this.pdf.setFontSize(Ln),this.lineWidth=_n)}else L.scale>=.01&&(Ln=this.pdf.internal.getFontSize(),this.pdf.setFontSize(Ln*L.scale),_n=this.lineWidth,this.lineWidth=_n*L.scale),this.pdf.text(L.text,Q.x+this.posX,Q.y+this.posY,{angle:L.angle,align:O,renderingMode:L.renderingMode,maxWidth:L.maxWidth}),L.scale>=.01&&(this.pdf.setFontSize(Ln),this.lineWidth=_n)},G=function(L,O,R,B){R=R||0,B=B||0,this.pdf.internal.out(t(L+R)+" "+r(O+B)+" l")},j=function(L,O,R){return this.pdf.lines(L,O,R,null,null)},cn=function(L,O,R,B,Y,Q,en,tn){this.pdf.internal.out([e(c(R+L)),e(o(B+O)),e(c(Y+L)),e(o(Q+O)),e(c(en+L)),e(o(tn+O)),"c"].join(" "))},rn=function(L,O,R,B){for(var Y=2*Math.PI,Q=Math.PI/2;O>R;)O-=Y;var en=Math.abs(R-O);en<Y&&B&&(en=Y-en);for(var tn=[],kn=B?-1:1,Ln=O;en>1e-5;){var _n=Ln+kn*Math.min(en,Q);tn.push(hn.call(this,L,Ln,_n)),en-=Math.abs(_n-Ln),Ln=_n}return tn},hn=function(L,O,R){var B=(R-O)/2,Y=L*Math.cos(B),Q=L*Math.sin(B),en=Y,tn=-Q,kn=en*en+tn*tn,Ln=kn+en*Y+tn*Q,_n=4/3*(Math.sqrt(2*kn*Ln)-Ln)/(en*Q-tn*Y),Cn=en-_n*tn,zn=tn+_n*en,fn=Cn,F=-zn,Zn=B+O,Un=Math.cos(Zn),xn=Math.sin(Zn);return{x1:L*Math.cos(O),y1:L*Math.sin(O),x2:Cn*Un-zn*xn,y2:Cn*xn+zn*Un,x3:fn*Un-F*xn,y3:fn*xn+F*Un,x4:L*Math.cos(R),y4:L*Math.sin(R)}},$=function(L){return 180*L/Math.PI},un=function(L,O,R,B,Y,Q){var en=L+.5*(R-L),tn=O+.5*(B-O),kn=Y+.5*(R-Y),Ln=Q+.5*(B-Q),_n=Math.min(L,Y,en,kn),Cn=Math.max(L,Y,en,kn),zn=Math.min(O,Q,tn,Ln),fn=Math.max(O,Q,tn,Ln);return new d(_n,zn,Cn-_n,fn-zn)},pn=function(L,O,R,B,Y,Q,en,tn){var kn,Ln,_n,Cn,zn,fn,F,Zn,Un,xn,Nn,On,In,jn,Jn=R-L,ne=B-O,ee=Y-R,re=Q-B,pe=en-Y,Vn=tn-Q;for(Ln=0;Ln<41;Ln++)Un=(F=(_n=L+(kn=Ln/40)*Jn)+kn*((zn=R+kn*ee)-_n))+kn*(zn+kn*(Y+kn*pe-zn)-F),xn=(Zn=(Cn=O+kn*ne)+kn*((fn=B+kn*re)-Cn))+kn*(fn+kn*(Q+kn*Vn-fn)-Zn),Ln==0?(Nn=Un,On=xn,In=Un,jn=xn):(Nn=Math.min(Nn,Un),On=Math.min(On,xn),In=Math.max(In,Un),jn=Math.max(jn,xn));return new d(Math.round(Nn),Math.round(On),Math.round(In-Nn),Math.round(jn-On))},Dn=function(){if(this.prevLineDash||this.ctx.lineDash.length||this.ctx.lineDashOffset){var L,O,R=(L=this.ctx.lineDash,O=this.ctx.lineDashOffset,JSON.stringify({lineDash:L,lineDashOffset:O}));this.prevLineDash!==R&&(this.pdf.setLineDash(this.ctx.lineDash,this.ctx.lineDashOffset),this.prevLineDash=R)}}})(Hn.API),function(i){var e=function(o){var l,d,h,m,v,b,x,p,D,P;for(d=[],h=0,m=(o+=l="\0\0\0\0".slice(o.length%4||4)).length;m>h;h+=4)(v=(o.charCodeAt(h)<<24)+(o.charCodeAt(h+1)<<16)+(o.charCodeAt(h+2)<<8)+o.charCodeAt(h+3))!==0?(b=(v=((v=((v=((v=(v-(P=v%85))/85)-(D=v%85))/85)-(p=v%85))/85)-(x=v%85))/85)%85,d.push(b+33,x+33,p+33,D+33,P+33)):d.push(122);return function(U,S){for(var E=S;E>0;E--)U.pop()}(d,l.length),String.fromCharCode.apply(String,d)+"~>"},t=function(o){var l,d,h,m,v,b=String,x="length",p=255,D="charCodeAt",P="slice",U="replace";for(o[P](-2),o=o[P](0,-2)[U](/\s/g,"")[U]("z","!!!!!"),h=[],m=0,v=(o+=l="uuuuu"[P](o[x]%5||5))[x];v>m;m+=5)d=52200625*(o[D](m)-33)+614125*(o[D](m+1)-33)+7225*(o[D](m+2)-33)+85*(o[D](m+3)-33)+(o[D](m+4)-33),h.push(p&d>>24,p&d>>16,p&d>>8,p&d);return function(S,E){for(var W=E;W>0;W--)S.pop()}(h,l[x]),b.fromCharCode.apply(b,h)},r=function(o){var l=new RegExp(/^([0-9A-Fa-f]{2})+$/);if((o=o.replace(/\s/g,"")).indexOf(">")!==-1&&(o=o.substr(0,o.indexOf(">"))),o.length%2&&(o+="0"),l.test(o)===!1)return"";for(var d="",h=0;h<o.length;h+=2)d+=String.fromCharCode("0x"+(o[h]+o[h+1]));return d},c=function(o){for(var l=new Uint8Array(o.length),d=o.length;d--;)l[d]=o.charCodeAt(d);return o=(l=xs(l)).reduce(function(h,m){return h+String.fromCharCode(m)},"")};i.processDataByFilters=function(o,l){var d=0,h=o||"",m=[];for(typeof(l=l||[])=="string"&&(l=[l]),d=0;d<l.length;d+=1)switch(l[d]){case"ASCII85Decode":case"/ASCII85Decode":h=t(h),m.push("/ASCII85Encode");break;case"ASCII85Encode":case"/ASCII85Encode":h=e(h),m.push("/ASCII85Decode");break;case"ASCIIHexDecode":case"/ASCIIHexDecode":h=r(h),m.push("/ASCIIHexEncode");break;case"ASCIIHexEncode":case"/ASCIIHexEncode":h=h.split("").map(function(v){return("0"+v.charCodeAt().toString(16)).slice(-2)}).join("")+">",m.push("/ASCIIHexDecode");break;case"FlateEncode":case"/FlateEncode":h=c(h),m.push("/FlateDecode");break;default:throw new Error('The filter: "'+l[d]+'" is not implemented')}return{data:h,reverseChain:m.reverse().join(" ")}}}(Hn.API),function(i){i.loadFile=function(e,t,r){return function(c,o,l){o=o!==!1,l=typeof l=="function"?l:function(){};var d=void 0;try{d=function(h,m,v){var b=new XMLHttpRequest,x=0,p=function(D){var P=D.length,U=[],S=String.fromCharCode;for(x=0;x<P;x+=1)U.push(S(255&D.charCodeAt(x)));return U.join("")};if(b.open("GET",h,!m),b.overrideMimeType("text/plain; charset=x-user-defined"),m===!1&&(b.onload=function(){b.status===200?v(p(this.responseText)):v(void 0)}),b.send(null),m&&b.status===200)return p(b.responseText)}(c,o,l)}catch{}return d}(e,t,r)},i.loadImageFile=i.loadFile}(Hn.API),function(i){function e(){return(Gn.html2canvas?Promise.resolve(Gn.html2canvas):ys(()=>import("./html2canvas.esm-e0a7d97b.js"),[])).catch(function(l){return Promise.reject(new Error("Could not load html2canvas: "+l))}).then(function(l){return l.default?l.default:l})}function t(){return(Gn.DOMPurify?Promise.resolve(Gn.DOMPurify):ys(()=>import("./purify.es-31816194.js"),[])).catch(function(l){return Promise.reject(new Error("Could not load dompurify: "+l))}).then(function(l){return l.default?l.default:l})}var r=function(l){var d=fe(l);return d==="undefined"?"undefined":d==="string"||l instanceof String?"string":d==="number"||l instanceof Number?"number":d==="function"||l instanceof Function?"function":l&&l.constructor===Array?"array":l&&l.nodeType===1?"element":d==="object"?"object":"unknown"},c=function(l,d){var h=document.createElement(l);for(var m in d.className&&(h.className=d.className),d.innerHTML&&d.dompurify&&(h.innerHTML=d.dompurify.sanitize(d.innerHTML)),d.style)h.style[m]=d.style[m];return h},o=function l(d){var h=Object.assign(l.convert(Promise.resolve()),JSON.parse(JSON.stringify(l.template))),m=l.convert(Promise.resolve(),h);return m=(m=m.setProgress(1,l,1,[l])).set(d)};(o.prototype=Object.create(Promise.prototype)).constructor=o,o.convert=function(l,d){return l.__proto__=d||o.prototype,l},o.template={prop:{src:null,container:null,overlay:null,canvas:null,img:null,pdf:null,pageSize:null,callback:function(){}},progress:{val:0,state:null,n:0,stack:[]},opt:{filename:"file.pdf",margin:[0,0,0,0],enableLinks:!0,x:0,y:0,html2canvas:{},jsPDF:{},backgroundColor:"transparent"}},o.prototype.from=function(l,d){return this.then(function(){switch(d=d||function(h){switch(r(h)){case"string":return"string";case"element":return h.nodeName.toLowerCase()==="canvas"?"canvas":"element";default:return"unknown"}}(l)){case"string":return this.then(t).then(function(h){return this.set({src:c("div",{innerHTML:l,dompurify:h})})});case"element":return this.set({src:l});case"canvas":return this.set({canvas:l});case"img":return this.set({img:l});default:return this.error("Unknown source type.")}})},o.prototype.to=function(l){switch(l){case"container":return this.toContainer();case"canvas":return this.toCanvas();case"img":return this.toImg();case"pdf":return this.toPdf();default:return this.error("Invalid target.")}},o.prototype.toContainer=function(){return this.thenList([function(){return this.prop.src||this.error("Cannot duplicate - no source HTML.")},function(){return this.prop.pageSize||this.setPageSize()}]).then(function(){var l={position:"relative",display:"inline-block",width:(typeof this.opt.width!="number"||isNaN(this.opt.width)||typeof this.opt.windowWidth!="number"||isNaN(this.opt.windowWidth)?Math.max(this.prop.src.clientWidth,this.prop.src.scrollWidth,this.prop.src.offsetWidth):this.opt.windowWidth)+"px",left:0,right:0,top:0,margin:"auto",backgroundColor:this.opt.backgroundColor},d=function h(m,v){for(var b=m.nodeType===3?document.createTextNode(m.nodeValue):m.cloneNode(!1),x=m.firstChild;x;x=x.nextSibling)v!==!0&&x.nodeType===1&&x.nodeName==="SCRIPT"||b.appendChild(h(x,v));return m.nodeType===1&&(m.nodeName==="CANVAS"?(b.width=m.width,b.height=m.height,b.getContext("2d").drawImage(m,0,0)):m.nodeName!=="TEXTAREA"&&m.nodeName!=="SELECT"||(b.value=m.value),b.addEventListener("load",function(){b.scrollTop=m.scrollTop,b.scrollLeft=m.scrollLeft},!0)),b}(this.prop.src,this.opt.html2canvas.javascriptEnabled);d.tagName==="BODY"&&(l.height=Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.clientHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight)+"px"),this.prop.overlay=c("div",{className:"html2pdf__overlay",style:{position:"fixed",overflow:"hidden",zIndex:1e3,left:"-100000px",right:0,bottom:0,top:0}}),this.prop.container=c("div",{className:"html2pdf__container",style:l}),this.prop.container.appendChild(d),this.prop.container.firstChild.appendChild(c("div",{style:{clear:"both",border:"0 none transparent",margin:0,padding:0,height:0}})),this.prop.container.style.float="none",this.prop.overlay.appendChild(this.prop.container),document.body.appendChild(this.prop.overlay),this.prop.container.firstChild.style.position="relative",this.prop.container.height=Math.max(this.prop.container.firstChild.clientHeight,this.prop.container.firstChild.scrollHeight,this.prop.container.firstChild.offsetHeight)+"px"})},o.prototype.toCanvas=function(){var l=[function(){return document.body.contains(this.prop.container)||this.toContainer()}];return this.thenList(l).then(e).then(function(d){var h=Object.assign({},this.opt.html2canvas);return delete h.onrendered,d(this.prop.container,h)}).then(function(d){(this.opt.html2canvas.onrendered||function(){})(d),this.prop.canvas=d,document.body.removeChild(this.prop.overlay)})},o.prototype.toContext2d=function(){var l=[function(){return document.body.contains(this.prop.container)||this.toContainer()}];return this.thenList(l).then(e).then(function(d){var h=this.opt.jsPDF,m=this.opt.fontFaces,v=typeof this.opt.width!="number"||isNaN(this.opt.width)||typeof this.opt.windowWidth!="number"||isNaN(this.opt.windowWidth)?1:this.opt.width/this.opt.windowWidth,b=Object.assign({async:!0,allowTaint:!0,scale:v,scrollX:this.opt.scrollX||0,scrollY:this.opt.scrollY||0,backgroundColor:"#ffffff",imageTimeout:15e3,logging:!0,proxy:null,removeContainer:!0,foreignObjectRendering:!1,useCORS:!1},this.opt.html2canvas);if(delete b.onrendered,h.context2d.autoPaging=this.opt.autoPaging===void 0||this.opt.autoPaging,h.context2d.posX=this.opt.x,h.context2d.posY=this.opt.y,h.context2d.margin=this.opt.margin,h.context2d.fontFaces=m,m)for(var x=0;x<m.length;++x){var p=m[x],D=p.src.find(function(P){return P.format==="truetype"});D&&h.addFont(D.url,p.ref.name,p.ref.style)}return b.windowHeight=b.windowHeight||0,b.windowHeight=b.windowHeight==0?Math.max(this.prop.container.clientHeight,this.prop.container.scrollHeight,this.prop.container.offsetHeight):b.windowHeight,h.context2d.save(!0),d(this.prop.container,b)}).then(function(d){this.opt.jsPDF.context2d.restore(!0),(this.opt.html2canvas.onrendered||function(){})(d),this.prop.canvas=d,document.body.removeChild(this.prop.overlay)})},o.prototype.toImg=function(){return this.thenList([function(){return this.prop.canvas||this.toCanvas()}]).then(function(){var l=this.prop.canvas.toDataURL("image/"+this.opt.image.type,this.opt.image.quality);this.prop.img=document.createElement("img"),this.prop.img.src=l})},o.prototype.toPdf=function(){return this.thenList([function(){return this.toContext2d()}]).then(function(){this.prop.pdf=this.prop.pdf||this.opt.jsPDF})},o.prototype.output=function(l,d,h){return(h=h||"pdf").toLowerCase()==="img"||h.toLowerCase()==="image"?this.outputImg(l,d):this.outputPdf(l,d)},o.prototype.outputPdf=function(l,d){return this.thenList([function(){return this.prop.pdf||this.toPdf()}]).then(function(){return this.prop.pdf.output(l,d)})},o.prototype.outputImg=function(l){return this.thenList([function(){return this.prop.img||this.toImg()}]).then(function(){switch(l){case void 0:case"img":return this.prop.img;case"datauristring":case"dataurlstring":return this.prop.img.src;case"datauri":case"dataurl":return document.location.href=this.prop.img.src;default:throw'Image output type "'+l+'" is not supported.'}})},o.prototype.save=function(l){return this.thenList([function(){return this.prop.pdf||this.toPdf()}]).set(l?{filename:l}:null).then(function(){this.prop.pdf.save(this.opt.filename)})},o.prototype.doCallback=function(){return this.thenList([function(){return this.prop.pdf||this.toPdf()}]).then(function(){this.prop.callback(this.prop.pdf)})},o.prototype.set=function(l){if(r(l)!=="object")return this;var d=Object.keys(l||{}).map(function(h){if(h in o.template.prop)return function(){this.prop[h]=l[h]};switch(h){case"margin":return this.setMargin.bind(this,l.margin);case"jsPDF":return function(){return this.opt.jsPDF=l.jsPDF,this.setPageSize()};case"pageSize":return this.setPageSize.bind(this,l.pageSize);default:return function(){this.opt[h]=l[h]}}},this);return this.then(function(){return this.thenList(d)})},o.prototype.get=function(l,d){return this.then(function(){var h=l in o.template.prop?this.prop[l]:this.opt[l];return d?d(h):h})},o.prototype.setMargin=function(l){return this.then(function(){switch(r(l)){case"number":l=[l,l,l,l];case"array":if(l.length===2&&(l=[l[0],l[1],l[0],l[1]]),l.length===4)break;default:return this.error("Invalid margin array.")}this.opt.margin=l}).then(this.setPageSize)},o.prototype.setPageSize=function(l){function d(h,m){return Math.floor(h*m/72*96)}return this.then(function(){(l=l||Hn.getPageSize(this.opt.jsPDF)).hasOwnProperty("inner")||(l.inner={width:l.width-this.opt.margin[1]-this.opt.margin[3],height:l.height-this.opt.margin[0]-this.opt.margin[2]},l.inner.px={width:d(l.inner.width,l.k),height:d(l.inner.height,l.k)},l.inner.ratio=l.inner.height/l.inner.width),this.prop.pageSize=l})},o.prototype.setProgress=function(l,d,h,m){return l!=null&&(this.progress.val=l),d!=null&&(this.progress.state=d),h!=null&&(this.progress.n=h),m!=null&&(this.progress.stack=m),this.progress.ratio=this.progress.val/this.progress.state,this},o.prototype.updateProgress=function(l,d,h,m){return this.setProgress(l?this.progress.val+l:null,d||null,h?this.progress.n+h:null,m?this.progress.stack.concat(m):null)},o.prototype.then=function(l,d){var h=this;return this.thenCore(l,d,function(m,v){return h.updateProgress(null,null,1,[m]),Promise.prototype.then.call(this,function(b){return h.updateProgress(null,m),b}).then(m,v).then(function(b){return h.updateProgress(1),b})})},o.prototype.thenCore=function(l,d,h){h=h||Promise.prototype.then,l&&(l=l.bind(this)),d&&(d=d.bind(this));var m=Promise.toString().indexOf("[native code]")!==-1&&Promise.name==="Promise"?this:o.convert(Object.assign({},this),Promise.prototype),v=h.call(m,l,d);return o.convert(v,this.__proto__)},o.prototype.thenExternal=function(l,d){return Promise.prototype.then.call(this,l,d)},o.prototype.thenList=function(l){var d=this;return l.forEach(function(h){d=d.thenCore(h)}),d},o.prototype.catch=function(l){l&&(l=l.bind(this));var d=Promise.prototype.catch.call(this,l);return o.convert(d,this)},o.prototype.catchExternal=function(l){return Promise.prototype.catch.call(this,l)},o.prototype.error=function(l){return this.then(function(){throw new Error(l)})},o.prototype.using=o.prototype.set,o.prototype.saveAs=o.prototype.save,o.prototype.export=o.prototype.output,o.prototype.run=o.prototype.then,Hn.getPageSize=function(l,d,h){if(fe(l)==="object"){var m=l;l=m.orientation,d=m.unit||d,h=m.format||h}d=d||"mm",h=h||"a4",l=(""+(l||"P")).toLowerCase();var v,b=(""+h).toLowerCase(),x={a0:[2383.94,3370.39],a1:[1683.78,2383.94],a2:[1190.55,1683.78],a3:[841.89,1190.55],a4:[595.28,841.89],a5:[419.53,595.28],a6:[297.64,419.53],a7:[209.76,297.64],a8:[147.4,209.76],a9:[104.88,147.4],a10:[73.7,104.88],b0:[2834.65,4008.19],b1:[2004.09,2834.65],b2:[1417.32,2004.09],b3:[1000.63,1417.32],b4:[708.66,1000.63],b5:[498.9,708.66],b6:[354.33,498.9],b7:[249.45,354.33],b8:[175.75,249.45],b9:[124.72,175.75],b10:[87.87,124.72],c0:[2599.37,3676.54],c1:[1836.85,2599.37],c2:[1298.27,1836.85],c3:[918.43,1298.27],c4:[649.13,918.43],c5:[459.21,649.13],c6:[323.15,459.21],c7:[229.61,323.15],c8:[161.57,229.61],c9:[113.39,161.57],c10:[79.37,113.39],dl:[311.81,623.62],letter:[612,792],"government-letter":[576,756],legal:[612,1008],"junior-legal":[576,360],ledger:[1224,792],tabloid:[792,1224],"credit-card":[153,243]};switch(d){case"pt":v=1;break;case"mm":v=72/25.4;break;case"cm":v=72/2.54;break;case"in":v=72;break;case"px":v=.75;break;case"pc":case"em":v=12;break;case"ex":v=6;break;default:throw"Invalid unit: "+d}var p,D=0,P=0;if(x.hasOwnProperty(b))D=x[b][1]/v,P=x[b][0]/v;else try{D=h[1],P=h[0]}catch{throw new Error("Invalid format: "+h)}if(l==="p"||l==="portrait")l="p",P>D&&(p=P,P=D,D=p);else{if(l!=="l"&&l!=="landscape")throw"Invalid orientation: "+l;l="l",D>P&&(p=P,P=D,D=p)}return{width:P,height:D,unit:d,k:v,orientation:l}},i.html=function(l,d){(d=d||{}).callback=d.callback||function(){},d.html2canvas=d.html2canvas||{},d.html2canvas.canvas=d.html2canvas.canvas||this.canvas,d.jsPDF=d.jsPDF||this,d.fontFaces=d.fontFaces?d.fontFaces.map(Ps):null;var h=new o(d);return d.worker?h:h.from(l).doCallback()}}(Hn.API),Hn.API.addJS=function(i){return Ac=i,this.internal.events.subscribe("postPutResources",function(){co=this.internal.newObject(),this.internal.out("<<"),this.internal.out("/Names [(EmbeddedJS) "+(co+1)+" 0 R]"),this.internal.out(">>"),this.internal.out("endobj"),wc=this.internal.newObject(),this.internal.out("<<"),this.internal.out("/S /JavaScript"),this.internal.out("/JS ("+Ac+")"),this.internal.out(">>"),this.internal.out("endobj")}),this.internal.events.subscribe("putCatalog",function(){co!==void 0&&wc!==void 0&&this.internal.out("/Names <</JavaScript "+co+" 0 R>>")}),this},function(i){var e;i.events.push(["postPutResources",function(){var t=this,r=/^(\d+) 0 obj$/;if(this.outline.root.children.length>0)for(var c=t.outline.render().split(/\r\n/),o=0;o<c.length;o++){var l=c[o],d=r.exec(l);if(d!=null){var h=d[1];t.internal.newObjectDeferredBegin(h,!1)}t.internal.write(l)}if(this.outline.createNamedDestinations){var m=this.internal.pages.length,v=[];for(o=0;o<m;o++){var b=t.internal.newObject();v.push(b);var x=t.internal.getPageInfo(o+1);t.internal.write("<< /D["+x.objId+" 0 R /XYZ null null null]>> endobj")}var p=t.internal.newObject();for(t.internal.write("<< /Names [ "),o=0;o<v.length;o++)t.internal.write("(page_"+(o+1)+")"+v[o]+" 0 R");t.internal.write(" ] >>","endobj"),e=t.internal.newObject(),t.internal.write("<< /Dests "+p+" 0 R"),t.internal.write(">>","endobj")}}]),i.events.push(["putCatalog",function(){this.outline.root.children.length>0&&(this.internal.write("/Outlines",this.outline.makeRef(this.outline.root)),this.outline.createNamedDestinations&&this.internal.write("/Names "+e+" 0 R"))}]),i.events.push(["initialized",function(){var t=this;t.outline={createNamedDestinations:!1,root:{children:[]}},t.outline.add=function(r,c,o){var l={title:c,options:o,children:[]};return r==null&&(r=this.root),r.children.push(l),l},t.outline.render=function(){return this.ctx={},this.ctx.val="",this.ctx.pdf=t,this.genIds_r(this.root),this.renderRoot(this.root),this.renderItems(this.root),this.ctx.val},t.outline.genIds_r=function(r){r.id=t.internal.newObjectDeferred();for(var c=0;c<r.children.length;c++)this.genIds_r(r.children[c])},t.outline.renderRoot=function(r){this.objStart(r),this.line("/Type /Outlines"),r.children.length>0&&(this.line("/First "+this.makeRef(r.children[0])),this.line("/Last "+this.makeRef(r.children[r.children.length-1]))),this.line("/Count "+this.count_r({count:0},r)),this.objEnd()},t.outline.renderItems=function(r){for(var c=this.ctx.pdf.internal.getVerticalCoordinateString,o=0;o<r.children.length;o++){var l=r.children[o];this.objStart(l),this.line("/Title "+this.makeString(l.title)),this.line("/Parent "+this.makeRef(r)),o>0&&this.line("/Prev "+this.makeRef(r.children[o-1])),o<r.children.length-1&&this.line("/Next "+this.makeRef(r.children[o+1])),l.children.length>0&&(this.line("/First "+this.makeRef(l.children[0])),this.line("/Last "+this.makeRef(l.children[l.children.length-1])));var d=this.count=this.count_r({count:0},l);if(d>0&&this.line("/Count "+d),l.options&&l.options.pageNumber){var h=t.internal.getPageInfo(l.options.pageNumber);this.line("/Dest ["+h.objId+" 0 R /XYZ 0 "+c(0)+" 0]")}this.objEnd()}for(var m=0;m<r.children.length;m++)this.renderItems(r.children[m])},t.outline.line=function(r){this.ctx.val+=r+`\r
`},t.outline.makeRef=function(r){return r.id+" 0 R"},t.outline.makeString=function(r){return"("+t.internal.pdfEscape(r)+")"},t.outline.objStart=function(r){this.ctx.val+=`\r
`+r.id+` 0 obj\r
<<\r
`},t.outline.objEnd=function(){this.ctx.val+=`>> \r
endobj\r
`},t.outline.count_r=function(r,c){for(var o=0;o<c.children.length;o++)r.count++,this.count_r(r,c.children[o]);return r.count}}])}(Hn.API),function(i){var e=[192,193,194,195,196,197,198,199];i.processJPEG=function(t,r,c,o,l,d){var h,m=this.decode.DCT_DECODE,v=null;if(typeof t=="string"||this.__addimage__.isArrayBuffer(t)||this.__addimage__.isArrayBufferView(t)){switch(t=l||t,t=this.__addimage__.isArrayBuffer(t)?new Uint8Array(t):t,(h=function(b){for(var x,p=256*b.charCodeAt(4)+b.charCodeAt(5),D=b.length,P={width:0,height:0,numcomponents:1},U=4;U<D;U+=2){if(U+=p,e.indexOf(b.charCodeAt(U+1))!==-1){x=256*b.charCodeAt(U+5)+b.charCodeAt(U+6),P={width:256*b.charCodeAt(U+7)+b.charCodeAt(U+8),height:x,numcomponents:b.charCodeAt(U+9)};break}p=256*b.charCodeAt(U+2)+b.charCodeAt(U+3)}return P}(t=this.__addimage__.isArrayBufferView(t)?this.__addimage__.arrayBufferToBinaryString(t):t)).numcomponents){case 1:d=this.color_spaces.DEVICE_GRAY;break;case 4:d=this.color_spaces.DEVICE_CMYK;break;case 3:d=this.color_spaces.DEVICE_RGB}v={data:t,width:h.width,height:h.height,colorSpace:d,bitsPerComponent:8,filter:m,index:r,alias:c}}return v}}(Hn.API);var Ca,lo,xc,Lc,kc,mu=function(){var i,e,t;function r(o){var l,d,h,m,v,b,x,p,D,P,U,S,E,W;for(this.data=o,this.pos=8,this.palette=[],this.imgData=[],this.transparency={},this.animation=null,this.text={},b=null;;){switch(l=this.readUInt32(),D=(function(){var sn,dn;for(dn=[],sn=0;sn<4;++sn)dn.push(String.fromCharCode(this.data[this.pos++]));return dn}).call(this).join("")){case"IHDR":this.width=this.readUInt32(),this.height=this.readUInt32(),this.bits=this.data[this.pos++],this.colorType=this.data[this.pos++],this.compressionMethod=this.data[this.pos++],this.filterMethod=this.data[this.pos++],this.interlaceMethod=this.data[this.pos++];break;case"acTL":this.animation={numFrames:this.readUInt32(),numPlays:this.readUInt32()||1/0,frames:[]};break;case"PLTE":this.palette=this.read(l);break;case"fcTL":b&&this.animation.frames.push(b),this.pos+=4,b={width:this.readUInt32(),height:this.readUInt32(),xOffset:this.readUInt32(),yOffset:this.readUInt32()},v=this.readUInt16(),m=this.readUInt16()||100,b.delay=1e3*v/m,b.disposeOp=this.data[this.pos++],b.blendOp=this.data[this.pos++],b.data=[];break;case"IDAT":case"fdAT":for(D==="fdAT"&&(this.pos+=4,l-=4),o=(b!=null?b.data:void 0)||this.imgData,S=0;0<=l?S<l:S>l;0<=l?++S:--S)o.push(this.data[this.pos++]);break;case"tRNS":switch(this.transparency={},this.colorType){case 3:if(h=this.palette.length/3,this.transparency.indexed=this.read(l),this.transparency.indexed.length>h)throw new Error("More transparent colors than palette size");if((P=h-this.transparency.indexed.length)>0)for(E=0;0<=P?E<P:E>P;0<=P?++E:--E)this.transparency.indexed.push(255);break;case 0:this.transparency.grayscale=this.read(l)[0];break;case 2:this.transparency.rgb=this.read(l)}break;case"tEXt":x=(U=this.read(l)).indexOf(0),p=String.fromCharCode.apply(String,U.slice(0,x)),this.text[p]=String.fromCharCode.apply(String,U.slice(x+1));break;case"IEND":return b&&this.animation.frames.push(b),this.colors=(function(){switch(this.colorType){case 0:case 3:case 4:return 1;case 2:case 6:return 3}}).call(this),this.hasAlphaChannel=(W=this.colorType)===4||W===6,d=this.colors+(this.hasAlphaChannel?1:0),this.pixelBitlength=this.bits*d,this.colorSpace=(function(){switch(this.colors){case 1:return"DeviceGray";case 3:return"DeviceRGB"}}).call(this),void(this.imgData=new Uint8Array(this.imgData));default:this.pos+=l}if(this.pos+=4,this.pos>this.data.length)throw new Error("Incomplete or corrupt PNG file")}}r.prototype.read=function(o){var l,d;for(d=[],l=0;0<=o?l<o:l>o;0<=o?++l:--l)d.push(this.data[this.pos++]);return d},r.prototype.readUInt32=function(){return this.data[this.pos++]<<24|this.data[this.pos++]<<16|this.data[this.pos++]<<8|this.data[this.pos++]},r.prototype.readUInt16=function(){return this.data[this.pos++]<<8|this.data[this.pos++]},r.prototype.decodePixels=function(o){var l=this.pixelBitlength/8,d=new Uint8Array(this.width*this.height*l),h=0,m=this;if(o==null&&(o=this.imgData),o.length===0)return new Uint8Array(0);function v(b,x,p,D){var P,U,S,E,W,sn,dn,An,nn,q,an,mn,C,I,G,j,cn,rn,hn,$,un,pn=Math.ceil((m.width-b)/p),Dn=Math.ceil((m.height-x)/D),L=m.width==pn&&m.height==Dn;for(I=l*pn,mn=L?d:new Uint8Array(I*Dn),sn=o.length,C=0,U=0;C<Dn&&h<sn;){switch(o[h++]){case 0:for(E=cn=0;cn<I;E=cn+=1)mn[U++]=o[h++];break;case 1:for(E=rn=0;rn<I;E=rn+=1)P=o[h++],W=E<l?0:mn[U-l],mn[U++]=(P+W)%256;break;case 2:for(E=hn=0;hn<I;E=hn+=1)P=o[h++],S=(E-E%l)/l,G=C&&mn[(C-1)*I+S*l+E%l],mn[U++]=(G+P)%256;break;case 3:for(E=$=0;$<I;E=$+=1)P=o[h++],S=(E-E%l)/l,W=E<l?0:mn[U-l],G=C&&mn[(C-1)*I+S*l+E%l],mn[U++]=(P+Math.floor((W+G)/2))%256;break;case 4:for(E=un=0;un<I;E=un+=1)P=o[h++],S=(E-E%l)/l,W=E<l?0:mn[U-l],C===0?G=j=0:(G=mn[(C-1)*I+S*l+E%l],j=S&&mn[(C-1)*I+(S-1)*l+E%l]),dn=W+G-j,An=Math.abs(dn-W),q=Math.abs(dn-G),an=Math.abs(dn-j),nn=An<=q&&An<=an?W:q<=an?G:j,mn[U++]=(P+nn)%256;break;default:throw new Error("Invalid filter algorithm: "+o[h-1])}if(!L){var O=((x+C*D)*m.width+b)*l,R=C*I;for(E=0;E<pn;E+=1){for(var B=0;B<l;B+=1)d[O++]=mn[R++];O+=(p-1)*l}}C++}}return o=Jl(o),m.interlaceMethod==1?(v(0,0,8,8),v(4,0,8,8),v(0,4,4,8),v(2,0,4,4),v(0,2,2,4),v(1,0,2,2),v(0,1,1,2)):v(0,0,1,1),d},r.prototype.decodePalette=function(){var o,l,d,h,m,v,b,x,p;for(d=this.palette,v=this.transparency.indexed||[],m=new Uint8Array((v.length||0)+d.length),h=0,o=0,l=b=0,x=d.length;b<x;l=b+=3)m[h++]=d[l],m[h++]=d[l+1],m[h++]=d[l+2],m[h++]=(p=v[o++])!=null?p:255;return m},r.prototype.copyToImageData=function(o,l){var d,h,m,v,b,x,p,D,P,U,S;if(h=this.colors,P=null,d=this.hasAlphaChannel,this.palette.length&&(P=(S=this._decodedPalette)!=null?S:this._decodedPalette=this.decodePalette(),h=4,d=!0),D=(m=o.data||o).length,b=P||l,v=x=0,h===1)for(;v<D;)p=P?4*l[v/4]:x,U=b[p++],m[v++]=U,m[v++]=U,m[v++]=U,m[v++]=d?b[p++]:255,x=p;else for(;v<D;)p=P?4*l[v/4]:x,m[v++]=b[p++],m[v++]=b[p++],m[v++]=b[p++],m[v++]=d?b[p++]:255,x=p},r.prototype.decode=function(){var o;return o=new Uint8Array(this.width*this.height*4),this.copyToImageData(o,this.decodePixels()),o};var c=function(){if(Object.prototype.toString.call(Gn)==="[object Window]"){try{e=Gn.document.createElement("canvas"),t=e.getContext("2d")}catch{return!1}return!0}return!1};return c(),i=function(o){var l;if(c()===!0)return t.width=o.width,t.height=o.height,t.clearRect(0,0,o.width,o.height),t.putImageData(o,0,0),(l=new Image).src=e.toDataURL(),l;throw new Error("This method requires a Browser with Canvas-capability.")},r.prototype.decodeFrames=function(o){var l,d,h,m,v,b,x,p;if(this.animation){for(p=[],d=v=0,b=(x=this.animation.frames).length;v<b;d=++v)l=x[d],h=o.createImageData(l.width,l.height),m=this.decodePixels(new Uint8Array(l.data)),this.copyToImageData(h,m),l.imageData=h,p.push(l.image=i(h));return p}},r.prototype.renderFrame=function(o,l){var d,h,m;return d=(h=this.animation.frames)[l],m=h[l-1],l===0&&o.clearRect(0,0,this.width,this.height),(m!=null?m.disposeOp:void 0)===1?o.clearRect(m.xOffset,m.yOffset,m.width,m.height):(m!=null?m.disposeOp:void 0)===2&&o.putImageData(m.imageData,m.xOffset,m.yOffset),d.blendOp===0&&o.clearRect(d.xOffset,d.yOffset,d.width,d.height),o.drawImage(d.image,d.xOffset,d.yOffset)},r.prototype.animate=function(o){var l,d,h,m,v,b,x=this;return d=0,b=this.animation,m=b.numFrames,h=b.frames,v=b.numPlays,(l=function(){var p,D;if(p=d++%m,D=h[p],x.renderFrame(o,p),m>1&&d/m<v)return x.animation._timeout=setTimeout(l,D.delay)})()},r.prototype.stopAnimation=function(){var o;return clearTimeout((o=this.animation)!=null?o._timeout:void 0)},r.prototype.render=function(o){var l,d;return o._png&&o._png.stopAnimation(),o._png=this,o.width=this.width,o.height=this.height,l=o.getContext("2d"),this.animation?(this.decodeFrames(l),this.animate(l)):(d=l.createImageData(this.width,this.height),this.copyToImageData(d,this.decodePixels()),l.putImageData(d,0,0))},r}();/**
 * @license
 *
 * Copyright (c) 2014 James Robb, https://github.com/jamesbrobb
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ====================================================================
 *//**
 * @license
 * (c) Dean McNamee <dean@gmail.com>, 2013.
 *
 * https://github.com/deanm/omggif
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 *
 * omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
 * including animation and compression.  It does not rely on any specific
 * underlying system, so should run in the browser, Node, or Plask.
 */function gu(i){var e=0;if(i[e++]!==71||i[e++]!==73||i[e++]!==70||i[e++]!==56||(i[e++]+1&253)!=56||i[e++]!==97)throw new Error("Invalid GIF 87a/89a header.");var t=i[e++]|i[e++]<<8,r=i[e++]|i[e++]<<8,c=i[e++],o=c>>7,l=1<<(7&c)+1;i[e++],i[e++];var d=null,h=null;o&&(d=e,h=l,e+=3*l);var m=!0,v=[],b=0,x=null,p=0,D=null;for(this.width=t,this.height=r;m&&e<i.length;)switch(i[e++]){case 33:switch(i[e++]){case 255:if(i[e]!==11||i[e+1]==78&&i[e+2]==69&&i[e+3]==84&&i[e+4]==83&&i[e+5]==67&&i[e+6]==65&&i[e+7]==80&&i[e+8]==69&&i[e+9]==50&&i[e+10]==46&&i[e+11]==48&&i[e+12]==3&&i[e+13]==1&&i[e+16]==0)e+=14,D=i[e++]|i[e++]<<8,e++;else for(e+=12;;){if(!((C=i[e++])>=0))throw Error("Invalid block size");if(C===0)break;e+=C}break;case 249:if(i[e++]!==4||i[e+4]!==0)throw new Error("Invalid graphics extension block.");var P=i[e++];b=i[e++]|i[e++]<<8,x=i[e++],!(1&P)&&(x=null),p=P>>2&7,e++;break;case 254:for(;;){if(!((C=i[e++])>=0))throw Error("Invalid block size");if(C===0)break;e+=C}break;default:throw new Error("Unknown graphic control label: 0x"+i[e-1].toString(16))}break;case 44:var U=i[e++]|i[e++]<<8,S=i[e++]|i[e++]<<8,E=i[e++]|i[e++]<<8,W=i[e++]|i[e++]<<8,sn=i[e++],dn=sn>>6&1,An=1<<(7&sn)+1,nn=d,q=h,an=!1;sn>>7&&(an=!0,nn=e,q=An,e+=3*An);var mn=e;for(e++;;){var C;if(!((C=i[e++])>=0))throw Error("Invalid block size");if(C===0)break;e+=C}v.push({x:U,y:S,width:E,height:W,has_local_palette:an,palette_offset:nn,palette_size:q,data_offset:mn,data_length:e-mn,transparent_index:x,interlaced:!!dn,delay:b,disposal:p});break;case 59:m=!1;break;default:throw new Error("Unknown gif block: 0x"+i[e-1].toString(16))}this.numFrames=function(){return v.length},this.loopCount=function(){return D},this.frameInfo=function(I){if(I<0||I>=v.length)throw new Error("Frame index out of range.");return v[I]},this.decodeAndBlitFrameBGRA=function(I,G){var j=this.frameInfo(I),cn=j.width*j.height,rn=new Uint8Array(cn);Nc(i,j.data_offset,rn,cn);var hn=j.palette_offset,$=j.transparent_index;$===null&&($=256);var un=j.width,pn=t-un,Dn=un,L=4*(j.y*t+j.x),O=4*((j.y+j.height)*t+j.x),R=L,B=4*pn;j.interlaced===!0&&(B+=4*t*7);for(var Y=8,Q=0,en=rn.length;Q<en;++Q){var tn=rn[Q];if(Dn===0&&(Dn=un,(R+=B)>=O&&(B=4*pn+4*t*(Y-1),R=L+(un+pn)*(Y<<1),Y>>=1)),tn===$)R+=4;else{var kn=i[hn+3*tn],Ln=i[hn+3*tn+1],_n=i[hn+3*tn+2];G[R++]=_n,G[R++]=Ln,G[R++]=kn,G[R++]=255}--Dn}},this.decodeAndBlitFrameRGBA=function(I,G){var j=this.frameInfo(I),cn=j.width*j.height,rn=new Uint8Array(cn);Nc(i,j.data_offset,rn,cn);var hn=j.palette_offset,$=j.transparent_index;$===null&&($=256);var un=j.width,pn=t-un,Dn=un,L=4*(j.y*t+j.x),O=4*((j.y+j.height)*t+j.x),R=L,B=4*pn;j.interlaced===!0&&(B+=4*t*7);for(var Y=8,Q=0,en=rn.length;Q<en;++Q){var tn=rn[Q];if(Dn===0&&(Dn=un,(R+=B)>=O&&(B=4*pn+4*t*(Y-1),R=L+(un+pn)*(Y<<1),Y>>=1)),tn===$)R+=4;else{var kn=i[hn+3*tn],Ln=i[hn+3*tn+1],_n=i[hn+3*tn+2];G[R++]=kn,G[R++]=Ln,G[R++]=_n,G[R++]=255}--Dn}}}function Nc(i,e,t,r){for(var c=i[e++],o=1<<c,l=o+1,d=l+1,h=c+1,m=(1<<h)-1,v=0,b=0,x=0,p=i[e++],D=new Int32Array(4096),P=null;;){for(;v<16&&p!==0;)b|=i[e++]<<v,v+=8,p===1?p=i[e++]:--p;if(v<h)break;var U=b&m;if(b>>=h,v-=h,U!==o){if(U===l)break;for(var S=U<d?U:P,E=0,W=S;W>o;)W=D[W]>>8,++E;var sn=W;if(x+E+(S!==U?1:0)>r)return void ve.log("Warning, gif stream longer than expected.");t[x++]=sn;var dn=x+=E;for(S!==U&&(t[x++]=sn),W=S;E--;)W=D[W],t[--dn]=255&W,W>>=8;P!==null&&d<4096&&(D[d++]=P<<8|sn,d>=m+1&&h<12&&(++h,m=m<<1|1)),P=U}else d=l+1,m=(1<<(h=c+1))-1,P=null}return x!==r&&ve.log("Warning, gif stream shorter than expected."),t}/**
 * @license
  Copyright (c) 2008, Adobe Systems Incorporated
  All rights reserved.

  Redistribution and use in source and binary forms, with or without 
  modification, are permitted provided that the following conditions are
  met:

  * Redistributions of source code must retain the above copyright notice, 
    this list of conditions and the following disclaimer.
  
  * Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the 
    documentation and/or other materials provided with the distribution.
  
  * Neither the name of Adobe Systems Incorporated nor the names of its 
    contributors may be used to endorse or promote products derived from 
    this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
  THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
  PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR 
  CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/function gs(i){var e,t,r,c,o,l=Math.floor,d=new Array(64),h=new Array(64),m=new Array(64),v=new Array(64),b=new Array(65535),x=new Array(65535),p=new Array(64),D=new Array(64),P=[],U=0,S=7,E=new Array(64),W=new Array(64),sn=new Array(64),dn=new Array(256),An=new Array(2048),nn=[0,1,5,6,14,15,27,28,2,4,7,13,16,26,29,42,3,8,12,17,25,30,41,43,9,11,18,24,31,40,44,53,10,19,23,32,39,45,52,54,20,22,33,38,46,51,55,60,21,34,37,47,50,56,59,61,35,36,48,49,57,58,62,63],q=[0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0],an=[0,1,2,3,4,5,6,7,8,9,10,11],mn=[0,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125],C=[1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250],I=[0,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0],G=[0,1,2,3,4,5,6,7,8,9,10,11],j=[0,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119],cn=[0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250];function rn(L,O){for(var R=0,B=0,Y=new Array,Q=1;Q<=16;Q++){for(var en=1;en<=L[Q];en++)Y[O[B]]=[],Y[O[B]][0]=R,Y[O[B]][1]=Q,B++,R++;R*=2}return Y}function hn(L){for(var O=L[0],R=L[1]-1;R>=0;)O&1<<R&&(U|=1<<S),R--,--S<0&&(U==255?($(255),$(0)):$(U),S=7,U=0)}function $(L){P.push(L)}function un(L){$(L>>8&255),$(255&L)}function pn(L,O,R,B,Y){for(var Q,en=Y[0],tn=Y[240],kn=function(xn,Nn){var On,In,jn,Jn,ne,ee,re,pe,Vn,te,Mn=0;for(Vn=0;Vn<8;++Vn){On=xn[Mn],In=xn[Mn+1],jn=xn[Mn+2],Jn=xn[Mn+3],ne=xn[Mn+4],ee=xn[Mn+5],re=xn[Mn+6];var Ye=On+(pe=xn[Mn+7]),se=On-pe,Ct=In+re,ge=In-re,xe=jn+ee,Ht=jn-ee,le=Jn+ne,Ei=Jn-ne,ke=Ye+le,Pt=Ye-le,ii=Ct+xe,Ne=Ct-xe;xn[Mn]=ke+ii,xn[Mn+4]=ke-ii;var Yn=.707106781*(Ne+Pt);xn[Mn+2]=Pt+Yn,xn[Mn+6]=Pt-Yn;var ue=.382683433*((ke=Ei+Ht)-(Ne=ge+se)),Ri=.5411961*ke+ue,Ve=1.306562965*Ne+ue,Gt=.707106781*(ii=Ht+ge),Vt=se+Gt,qn=se-Gt;xn[Mn+5]=qn+Ri,xn[Mn+3]=qn-Ri,xn[Mn+1]=Vt+Ve,xn[Mn+7]=Vt-Ve,Mn+=8}for(Mn=0,Vn=0;Vn<8;++Vn){On=xn[Mn],In=xn[Mn+8],jn=xn[Mn+16],Jn=xn[Mn+24],ne=xn[Mn+32],ee=xn[Mn+40],re=xn[Mn+48];var It=On+(pe=xn[Mn+56]),Wt=On-pe,ot=In+re,Te=In-re,Re=jn+ee,ft=jn-ee,Zi=Jn+ne,ai=Jn-ne,_t=It+Zi,Ot=It-Zi,Mt=ot+Re,Jt=ot-Re;xn[Mn]=_t+Mt,xn[Mn+32]=_t-Mt;var bt=.707106781*(Jt+Ot);xn[Mn+16]=Ot+bt,xn[Mn+48]=Ot-bt;var Yt=.382683433*((_t=ai+ft)-(Jt=Te+Wt)),Fi=.5411961*_t+Yt,$i=1.306562965*Jt+Yt,Qi=.707106781*(Mt=ft+Te),na=Wt+Qi,ea=Wt-Qi;xn[Mn+40]=ea+Fi,xn[Mn+24]=ea-Fi,xn[Mn+8]=na+$i,xn[Mn+56]=na-$i,Mn++}for(Vn=0;Vn<64;++Vn)te=xn[Vn]*Nn[Vn],p[Vn]=te>0?te+.5|0:te-.5|0;return p}(L,O),Ln=0;Ln<64;++Ln)D[nn[Ln]]=kn[Ln];var _n=D[0]-R;R=D[0],_n==0?hn(B[0]):(hn(B[x[Q=32767+_n]]),hn(b[Q]));for(var Cn=63;Cn>0&&D[Cn]==0;)Cn--;if(Cn==0)return hn(en),R;for(var zn,fn=1;fn<=Cn;){for(var F=fn;D[fn]==0&&fn<=Cn;)++fn;var Zn=fn-F;if(Zn>=16){zn=Zn>>4;for(var Un=1;Un<=zn;++Un)hn(tn);Zn&=15}Q=32767+D[fn],hn(Y[(Zn<<4)+x[Q]]),hn(b[Q]),fn++}return Cn!=63&&hn(en),R}function Dn(L){L=Math.min(Math.max(L,1),100),o!=L&&(function(O){for(var R=[16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99],B=0;B<64;B++){var Y=l((R[B]*O+50)/100);Y=Math.min(Math.max(Y,1),255),d[nn[B]]=Y}for(var Q=[17,18,24,47,99,99,99,99,18,21,26,66,99,99,99,99,24,26,56,99,99,99,99,99,47,66,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99],en=0;en<64;en++){var tn=l((Q[en]*O+50)/100);tn=Math.min(Math.max(tn,1),255),h[nn[en]]=tn}for(var kn=[1,1.387039845,1.306562965,1.175875602,1,.785694958,.5411961,.275899379],Ln=0,_n=0;_n<8;_n++)for(var Cn=0;Cn<8;Cn++)m[Ln]=1/(d[nn[Ln]]*kn[_n]*kn[Cn]*8),v[Ln]=1/(h[nn[Ln]]*kn[_n]*kn[Cn]*8),Ln++}(L<50?Math.floor(5e3/L):Math.floor(200-2*L)),o=L)}this.encode=function(L,O){O&&Dn(O),P=new Array,U=0,S=7,un(65496),un(65504),un(16),$(74),$(70),$(73),$(70),$(0),$(1),$(1),$(0),un(1),un(1),$(0),$(0),function(){un(65499),un(132),$(0);for(var In=0;In<64;In++)$(d[In]);$(1);for(var jn=0;jn<64;jn++)$(h[jn])}(),function(In,jn){un(65472),un(17),$(8),un(jn),un(In),$(3),$(1),$(17),$(0),$(2),$(17),$(1),$(3),$(17),$(1)}(L.width,L.height),function(){un(65476),un(418),$(0);for(var In=0;In<16;In++)$(q[In+1]);for(var jn=0;jn<=11;jn++)$(an[jn]);$(16);for(var Jn=0;Jn<16;Jn++)$(mn[Jn+1]);for(var ne=0;ne<=161;ne++)$(C[ne]);$(1);for(var ee=0;ee<16;ee++)$(I[ee+1]);for(var re=0;re<=11;re++)$(G[re]);$(17);for(var pe=0;pe<16;pe++)$(j[pe+1]);for(var Vn=0;Vn<=161;Vn++)$(cn[Vn])}(),un(65498),un(12),$(3),$(1),$(0),$(2),$(17),$(3),$(17),$(0),$(63),$(0);var R=0,B=0,Y=0;U=0,S=7,this.encode.displayName="_encode_";for(var Q,en,tn,kn,Ln,_n,Cn,zn,fn,F=L.data,Zn=L.width,Un=L.height,xn=4*Zn,Nn=0;Nn<Un;){for(Q=0;Q<xn;){for(Ln=xn*Nn+Q,Cn=-1,zn=0,fn=0;fn<64;fn++)_n=Ln+(zn=fn>>3)*xn+(Cn=4*(7&fn)),Nn+zn>=Un&&(_n-=xn*(Nn+1+zn-Un)),Q+Cn>=xn&&(_n-=Q+Cn-xn+4),en=F[_n++],tn=F[_n++],kn=F[_n++],E[fn]=(An[en]+An[tn+256>>0]+An[kn+512>>0]>>16)-128,W[fn]=(An[en+768>>0]+An[tn+1024>>0]+An[kn+1280>>0]>>16)-128,sn[fn]=(An[en+1280>>0]+An[tn+1536>>0]+An[kn+1792>>0]>>16)-128;R=pn(E,m,R,e,r),B=pn(W,v,B,t,c),Y=pn(sn,v,Y,t,c),Q+=32}Nn+=8}if(S>=0){var On=[];On[1]=S+1,On[0]=(1<<S+1)-1,hn(On)}return un(65497),new Uint8Array(P)},i=i||50,function(){for(var L=String.fromCharCode,O=0;O<256;O++)dn[O]=L(O)}(),e=rn(q,an),t=rn(I,G),r=rn(mn,C),c=rn(j,cn),function(){for(var L=1,O=2,R=1;R<=15;R++){for(var B=L;B<O;B++)x[32767+B]=R,b[32767+B]=[],b[32767+B][1]=R,b[32767+B][0]=B;for(var Y=-(O-1);Y<=-L;Y++)x[32767+Y]=R,b[32767+Y]=[],b[32767+Y][1]=R,b[32767+Y][0]=O-1+Y;L<<=1,O<<=1}}(),function(){for(var L=0;L<256;L++)An[L]=19595*L,An[L+256>>0]=38470*L,An[L+512>>0]=7471*L+32768,An[L+768>>0]=-11059*L,An[L+1024>>0]=-21709*L,An[L+1280>>0]=32768*L+8421375,An[L+1536>>0]=-27439*L,An[L+1792>>0]=-5329*L}(),Dn(i)}/**
 * @license
 * Copyright (c) 2017 Aras Abbasi
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */function Tt(i,e){if(this.pos=0,this.buffer=i,this.datav=new DataView(i.buffer),this.is_with_alpha=!!e,this.bottom_up=!0,this.flag=String.fromCharCode(this.buffer[0])+String.fromCharCode(this.buffer[1]),this.pos+=2,["BM","BA","CI","CP","IC","PT"].indexOf(this.flag)===-1)throw new Error("Invalid BMP File");this.parseHeader(),this.parseBGR()}function Sc(i){function e(q){if(!q)throw Error("assert :P")}function t(q,an,mn){for(var C=0;4>C;C++)if(q[an+C]!=mn.charCodeAt(C))return!0;return!1}function r(q,an,mn,C,I){for(var G=0;G<I;G++)q[an+G]=mn[C+G]}function c(q,an,mn,C){for(var I=0;I<C;I++)q[an+I]=mn}function o(q){return new Int32Array(q)}function l(q,an){for(var mn=[],C=0;C<q;C++)mn.push(new an);return mn}function d(q,an){var mn=[];return function C(I,G,j){for(var cn=j[G],rn=0;rn<cn&&(I.push(j.length>G+1?[]:new an),!(j.length<G+1));rn++)C(I[rn],G+1,j)}(mn,0,q),mn}var h=function(){var q=this;function an(n,a){for(var u=1<<a-1>>>0;n&u;)u>>>=1;return u?(n&u-1)+u:n}function mn(n,a,u,f,g){e(!(f%u));do n[a+(f-=u)]=g;while(0<f)}function C(n,a,u,f,g){if(e(2328>=g),512>=g)var w=o(512);else if((w=o(g))==null)return 0;return function(A,k,N,_,z,X){var Z,J,vn=k,on=1<<N,H=o(16),V=o(16);for(e(z!=0),e(_!=null),e(A!=null),e(0<N),J=0;J<z;++J){if(15<_[J])return 0;++H[_[J]]}if(H[0]==z)return 0;for(V[1]=0,Z=1;15>Z;++Z){if(H[Z]>1<<Z)return 0;V[Z+1]=V[Z]+H[Z]}for(J=0;J<z;++J)Z=_[J],0<_[J]&&(X[V[Z]++]=J);if(V[15]==1)return(_=new I).g=0,_.value=X[0],mn(A,vn,1,on,_),on;var gn,bn=-1,yn=on-1,Rn=0,Sn=1,Bn=1,Pn=1<<N;for(J=0,Z=1,z=2;Z<=N;++Z,z<<=1){if(Sn+=Bn<<=1,0>(Bn-=H[Z]))return 0;for(;0<H[Z];--H[Z])(_=new I).g=Z,_.value=X[J++],mn(A,vn+Rn,z,Pn,_),Rn=an(Rn,Z)}for(Z=N+1,z=2;15>=Z;++Z,z<<=1){if(Sn+=Bn<<=1,0>(Bn-=H[Z]))return 0;for(;0<H[Z];--H[Z]){if(_=new I,(Rn&yn)!=bn){for(vn+=Pn,gn=1<<(bn=Z)-N;15>bn&&!(0>=(gn-=H[bn]));)++bn,gn<<=1;on+=Pn=1<<(gn=bn-N),A[k+(bn=Rn&yn)].g=gn+N,A[k+bn].value=vn-k-bn}_.g=Z-N,_.value=X[J++],mn(A,vn+(Rn>>N),z,Pn,_),Rn=an(Rn,Z)}}return Sn!=2*V[15]-1?0:on}(n,a,u,f,g,w)}function I(){this.value=this.g=0}function G(){this.value=this.g=0}function j(){this.G=l(5,I),this.H=o(5),this.jc=this.Qb=this.qb=this.nd=0,this.pd=l(We,G)}function cn(n,a,u,f){e(n!=null),e(a!=null),e(2147483648>f),n.Ca=254,n.I=0,n.b=-8,n.Ka=0,n.oa=a,n.pa=u,n.Jd=a,n.Yc=u+f,n.Zc=4<=f?u+f-4+1:u,Q(n)}function rn(n,a){for(var u=0;0<a--;)u|=tn(n,128)<<a;return u}function hn(n,a){var u=rn(n,a);return en(n)?-u:u}function $(n,a,u,f){var g,w=0;for(e(n!=null),e(a!=null),e(4294967288>f),n.Sb=f,n.Ra=0,n.u=0,n.h=0,4<f&&(f=4),g=0;g<f;++g)w+=a[u+g]<<8*g;n.Ra=w,n.bb=f,n.oa=a,n.pa=u}function un(n){for(;8<=n.u&&n.bb<n.Sb;)n.Ra>>>=8,n.Ra+=n.oa[n.pa+n.bb]<<ga-8>>>0,++n.bb,n.u-=8;R(n)&&(n.h=1,n.u=0)}function pn(n,a){if(e(0<=a),!n.h&&a<=ma){var u=O(n)&pa[a];return n.u+=a,un(n),u}return n.h=1,n.u=0}function Dn(){this.b=this.Ca=this.I=0,this.oa=[],this.pa=0,this.Jd=[],this.Yc=0,this.Zc=[],this.Ka=0}function L(){this.Ra=0,this.oa=[],this.h=this.u=this.bb=this.Sb=this.pa=0}function O(n){return n.Ra>>>(n.u&ga-1)>>>0}function R(n){return e(n.bb<=n.Sb),n.h||n.bb==n.Sb&&n.u>ga}function B(n,a){n.u=a,n.h=R(n)}function Y(n){n.u>=Qa&&(e(n.u>=Qa),un(n))}function Q(n){e(n!=null&&n.oa!=null),n.pa<n.Zc?(n.I=(n.oa[n.pa++]|n.I<<8)>>>0,n.b+=8):(e(n!=null&&n.oa!=null),n.pa<n.Yc?(n.b+=8,n.I=n.oa[n.pa++]|n.I<<8):n.Ka?n.b=0:(n.I<<=8,n.b+=8,n.Ka=1))}function en(n){return rn(n,1)}function tn(n,a){var u=n.Ca;0>n.b&&Q(n);var f=n.b,g=u*a>>>8,w=(n.I>>>f>g)+0;for(w?(u-=g,n.I-=g+1<<f>>>0):u=g+1,f=u,g=0;256<=f;)g+=8,f>>=8;return f=7^g+ct[f],n.b-=f,n.Ca=(u<<f)-1,w}function kn(n,a,u){n[a+0]=u>>24&255,n[a+1]=u>>16&255,n[a+2]=u>>8&255,n[a+3]=u>>0&255}function Ln(n,a){return n[a+0]<<0|n[a+1]<<8}function _n(n,a){return Ln(n,a)|n[a+2]<<16}function Cn(n,a){return Ln(n,a)|Ln(n,a+2)<<16}function zn(n,a){var u=1<<a;return e(n!=null),e(0<a),n.X=o(u),n.X==null?0:(n.Mb=32-a,n.Xa=a,1)}function fn(n,a){e(n!=null),e(a!=null),e(n.Xa==a.Xa),r(a.X,0,n.X,0,1<<a.Xa)}function F(){this.X=[],this.Xa=this.Mb=0}function Zn(n,a,u,f){e(u!=null),e(f!=null);var g=u[0],w=f[0];return g==0&&(g=(n*w+a/2)/a),w==0&&(w=(a*g+n/2)/n),0>=g||0>=w?0:(u[0]=g,f[0]=w,1)}function Un(n,a){return n+(1<<a)-1>>>a}function xn(n,a){return((4278255360&n)+(4278255360&a)>>>0&4278255360)+((16711935&n)+(16711935&a)>>>0&16711935)>>>0}function Nn(n,a){q[a]=function(u,f,g,w,A,k,N){var _;for(_=0;_<A;++_){var z=q[n](k[N+_-1],g,w+_);k[N+_]=xn(u[f+_],z)}}}function On(){this.ud=this.hd=this.jd=0}function In(n,a){return((4278124286&(n^a))>>>1)+(n&a)>>>0}function jn(n){return 0<=n&&256>n?n:0>n?0:255<n?255:void 0}function Jn(n,a){return jn(n+(n-a+.5>>1))}function ne(n,a,u){return Math.abs(a-u)-Math.abs(n-u)}function ee(n,a,u,f,g,w,A){for(f=w[A-1],u=0;u<g;++u)w[A+u]=f=xn(n[a+u],f)}function re(n,a,u,f,g){var w;for(w=0;w<u;++w){var A=n[a+w],k=A>>8&255,N=16711935&(N=(N=16711935&A)+((k<<16)+k));f[g+w]=(4278255360&A)+N>>>0}}function pe(n,a){a.jd=n>>0&255,a.hd=n>>8&255,a.ud=n>>16&255}function Vn(n,a,u,f,g,w){var A;for(A=0;A<f;++A){var k=a[u+A],N=k>>>8,_=k,z=255&(z=(z=k>>>16)+((n.jd<<24>>24)*(N<<24>>24)>>>5));_=255&(_=(_=_+((n.hd<<24>>24)*(N<<24>>24)>>>5))+((n.ud<<24>>24)*(z<<24>>24)>>>5)),g[w+A]=(4278255360&k)+(z<<16)+_}}function te(n,a,u,f,g){q[a]=function(w,A,k,N,_,z,X,Z,J){for(N=X;N<Z;++N)for(X=0;X<J;++X)_[z++]=g(k[f(w[A++])])},q[n]=function(w,A,k,N,_,z,X){var Z=8>>w.b,J=w.Ea,vn=w.K[0],on=w.w;if(8>Z)for(w=(1<<w.b)-1,on=(1<<Z)-1;A<k;++A){var H,V=0;for(H=0;H<J;++H)H&w||(V=f(N[_++])),z[X++]=g(vn[V&on]),V>>=Z}else q["VP8LMapColor"+u](N,_,vn,on,z,X,A,k,J)}}function Mn(n,a,u,f,g){for(u=a+u;a<u;){var w=n[a++];f[g++]=w>>16&255,f[g++]=w>>8&255,f[g++]=w>>0&255}}function Ye(n,a,u,f,g){for(u=a+u;a<u;){var w=n[a++];f[g++]=w>>16&255,f[g++]=w>>8&255,f[g++]=w>>0&255,f[g++]=w>>24&255}}function se(n,a,u,f,g){for(u=a+u;a<u;){var w=(A=n[a++])>>16&240|A>>12&15,A=A>>0&240|A>>28&15;f[g++]=w,f[g++]=A}}function Ct(n,a,u,f,g){for(u=a+u;a<u;){var w=(A=n[a++])>>16&248|A>>13&7,A=A>>5&224|A>>3&31;f[g++]=w,f[g++]=A}}function ge(n,a,u,f,g){for(u=a+u;a<u;){var w=n[a++];f[g++]=w>>0&255,f[g++]=w>>8&255,f[g++]=w>>16&255}}function xe(n,a,u,f,g,w){if(w==0)for(u=a+u;a<u;)kn(f,((w=n[a++])[0]>>24|w[1]>>8&65280|w[2]<<8&16711680|w[3]<<24)>>>0),g+=32;else r(f,g,n,a,u)}function Ht(n,a){q[a][0]=q[n+"0"],q[a][1]=q[n+"1"],q[a][2]=q[n+"2"],q[a][3]=q[n+"3"],q[a][4]=q[n+"4"],q[a][5]=q[n+"5"],q[a][6]=q[n+"6"],q[a][7]=q[n+"7"],q[a][8]=q[n+"8"],q[a][9]=q[n+"9"],q[a][10]=q[n+"10"],q[a][11]=q[n+"11"],q[a][12]=q[n+"12"],q[a][13]=q[n+"13"],q[a][14]=q[n+"0"],q[a][15]=q[n+"0"]}function le(n){return n==Jo||n==Yo||n==Wr||n==Ko}function Ei(){this.eb=[],this.size=this.A=this.fb=0}function ke(){this.y=[],this.f=[],this.ea=[],this.F=[],this.Tc=this.Ed=this.Cd=this.Fd=this.lb=this.Db=this.Ab=this.fa=this.J=this.W=this.N=this.O=0}function Pt(){this.Rd=this.height=this.width=this.S=0,this.f={},this.f.RGBA=new Ei,this.f.kb=new ke,this.sd=null}function ii(){this.width=[0],this.height=[0],this.Pd=[0],this.Qd=[0],this.format=[0]}function Ne(){this.Id=this.fd=this.Md=this.hb=this.ib=this.da=this.bd=this.cd=this.j=this.v=this.Da=this.Sd=this.ob=0}function Yn(n){return alert("todo:WebPSamplerProcessPlane"),n.T}function ue(n,a){var u=n.T,f=a.ba.f.RGBA,g=f.eb,w=f.fb+n.ka*f.A,A=Nt[a.ba.S],k=n.y,N=n.O,_=n.f,z=n.N,X=n.ea,Z=n.W,J=a.cc,vn=a.dc,on=a.Mc,H=a.Nc,V=n.ka,gn=n.ka+n.T,bn=n.U,yn=bn+1>>1;for(V==0?A(k,N,null,null,_,z,X,Z,_,z,X,Z,g,w,null,null,bn):(A(a.ec,a.fc,k,N,J,vn,on,H,_,z,X,Z,g,w-f.A,g,w,bn),++u);V+2<gn;V+=2)J=_,vn=z,on=X,H=Z,z+=n.Rc,Z+=n.Rc,w+=2*f.A,A(k,(N+=2*n.fa)-n.fa,k,N,J,vn,on,H,_,z,X,Z,g,w-f.A,g,w,bn);return N+=n.fa,n.j+gn<n.o?(r(a.ec,a.fc,k,N,bn),r(a.cc,a.dc,_,z,yn),r(a.Mc,a.Nc,X,Z,yn),u--):1&gn||A(k,N,null,null,_,z,X,Z,_,z,X,Z,g,w+f.A,null,null,bn),u}function Ri(n,a,u){var f=n.F,g=[n.J];if(f!=null){var w=n.U,A=a.ba.S,k=A==Vr||A==Wr;a=a.ba.f.RGBA;var N=[0],_=n.ka;N[0]=n.T,n.Kb&&(_==0?--N[0]:(--_,g[0]-=n.width),n.j+n.ka+n.T==n.o&&(N[0]=n.o-n.j-_));var z=a.eb;_=a.fb+_*a.A,n=we(f,g[0],n.width,w,N,z,_+(k?0:3),a.A),e(u==N),n&&le(A)&&Lt(z,_,k,w,N,a.A)}return 0}function Ve(n){var a=n.ma,u=a.ba.S,f=11>u,g=u==Hr||u==Gr||u==Vr||u==Wo||u==12||le(u);if(a.memory=null,a.Ib=null,a.Jb=null,a.Nd=null,!Za(a.Oa,n,g?11:12))return 0;if(g&&le(u)&&wn(),n.da)alert("todo:use_scaling");else{if(f){if(a.Ib=Yn,n.Kb){if(u=n.U+1>>1,a.memory=o(n.U+2*u),a.memory==null)return 0;a.ec=a.memory,a.fc=0,a.cc=a.ec,a.dc=a.fc+n.U,a.Mc=a.cc,a.Nc=a.dc+u,a.Ib=ue,wn()}}else alert("todo:EmitYUV");g&&(a.Jb=Ri,f&&K())}if(f&&!zs){for(n=0;256>n;++n)ml[n]=89858*(n-128)+Yr>>Jr,vl[n]=-22014*(n-128)+Yr,yl[n]=-45773*(n-128),gl[n]=113618*(n-128)+Yr>>Jr;for(n=or;n<$o;++n)a=76283*(n-16)+Yr>>Jr,bl[n-or]=pt(a,255),wl[n-or]=pt(a+8>>4,15);zs=1}return 1}function Gt(n){var a=n.ma,u=n.U,f=n.T;return e(!(1&n.ka)),0>=u||0>=f?0:(u=a.Ib(n,a),a.Jb!=null&&a.Jb(n,a,u),a.Dc+=u,1)}function Vt(n){n.ma.memory=null}function qn(n,a,u,f){return pn(n,8)!=47?0:(a[0]=pn(n,14)+1,u[0]=pn(n,14)+1,f[0]=pn(n,1),pn(n,3)!=0?0:!n.h)}function It(n,a){if(4>n)return n+1;var u=n-2>>1;return(2+(1&n)<<u)+pn(a,u)+1}function Wt(n,a){return 120<a?a-120:1<=(u=((u=el[a-1])>>4)*n+(8-(15&u)))?u:1;var u}function ot(n,a,u){var f=O(u),g=n[a+=255&f].g-8;return 0<g&&(B(u,u.u+8),f=O(u),a+=n[a].value,a+=f&(1<<g)-1),B(u,u.u+n[a].g),n[a].value}function Te(n,a,u){return u.g+=n.g,u.value+=n.value<<a>>>0,e(8>=u.g),n.g}function Re(n,a,u){var f=n.xc;return e((a=f==0?0:n.vc[n.md*(u>>f)+(a>>f)])<n.Wb),n.Ya[a]}function ft(n,a,u,f){var g=n.ab,w=n.c*a,A=n.C;a=A+a;var k=u,N=f;for(f=n.Ta,u=n.Ua;0<g--;){var _=n.gc[g],z=A,X=a,Z=k,J=N,vn=(N=f,k=u,_.Ea);switch(e(z<X),e(X<=_.nc),_.hc){case 2:Fr(Z,J,(X-z)*vn,N,k);break;case 0:var on=z,H=X,V=N,gn=k,bn=(Pn=_).Ea;on==0&&(Go(Z,J,null,null,1,V,gn),ee(Z,J+1,0,0,bn-1,V,gn+1),J+=bn,gn+=bn,++on);for(var yn=1<<Pn.b,Rn=yn-1,Sn=Un(bn,Pn.b),Bn=Pn.K,Pn=Pn.w+(on>>Pn.b)*Sn;on<H;){var ce=Bn,de=Pn,oe=1;for(nr(Z,J,V,gn-bn,1,V,gn);oe<bn;){var ie=(oe&~Rn)+yn;ie>bn&&(ie=bn),(0,vi[ce[de++]>>8&15])(Z,J+ +oe,V,gn+oe-bn,ie-oe,V,gn+oe),oe=ie}J+=bn,gn+=bn,++on&Rn||(Pn+=Sn)}X!=_.nc&&r(N,k-vn,N,k+(X-z-1)*vn,vn);break;case 1:for(vn=Z,H=J,bn=(Z=_.Ea)-(gn=Z&~(V=(J=1<<_.b)-1)),on=Un(Z,_.b),yn=_.K,_=_.w+(z>>_.b)*on;z<X;){for(Rn=yn,Sn=_,Bn=new On,Pn=H+gn,ce=H+Z;H<Pn;)pe(Rn[Sn++],Bn),qi(Bn,vn,H,J,N,k),H+=J,k+=J;H<ce&&(pe(Rn[Sn++],Bn),qi(Bn,vn,H,bn,N,k),H+=bn,k+=bn),++z&V||(_+=on)}break;case 3:if(Z==N&&J==k&&0<_.b){for(H=N,Z=vn=k+(X-z)*vn-(gn=(X-z)*Un(_.Ea,_.b)),J=N,V=k,on=[],gn=(bn=gn)-1;0<=gn;--gn)on[gn]=J[V+gn];for(gn=bn-1;0<=gn;--gn)H[Z+gn]=on[gn];wt(_,z,X,N,vn,N,k)}else wt(_,z,X,Z,J,N,k)}k=f,N=u}N!=u&&r(f,u,k,N,w)}function Zi(n,a){var u=n.V,f=n.Ba+n.c*n.C,g=a-n.C;if(e(a<=n.l.o),e(16>=g),0<g){var w=n.l,A=n.Ta,k=n.Ua,N=w.width;if(ft(n,g,u,f),g=k=[k],e((u=n.C)<(f=a)),e(w.v<w.va),f>w.o&&(f=w.o),u<w.j){var _=w.j-u;u=w.j,g[0]+=_*N}if(u>=f?u=0:(g[0]+=4*w.v,w.ka=u-w.j,w.U=w.va-w.v,w.T=f-u,u=1),u){if(k=k[0],11>(u=n.ca).S){var z=u.f.RGBA,X=(f=u.S,g=w.U,w=w.T,_=z.eb,z.A),Z=w;for(z=z.fb+n.Ma*z.A;0<Z--;){var J=A,vn=k,on=g,H=_,V=z;switch(f){case zr:lt(J,vn,on,H,V);break;case Hr:it(J,vn,on,H,V);break;case Jo:it(J,vn,on,H,V),Lt(H,V,0,on,1,0);break;case Ms:ci(J,vn,on,H,V);break;case Gr:xe(J,vn,on,H,V,1);break;case Yo:xe(J,vn,on,H,V,1),Lt(H,V,0,on,1,0);break;case Vr:xe(J,vn,on,H,V,0);break;case Wr:xe(J,vn,on,H,V,0),Lt(H,V,1,on,1,0);break;case Wo:bi(J,vn,on,H,V);break;case Ko:bi(J,vn,on,H,V),be(H,V,on,1,0);break;case Ds:si(J,vn,on,H,V);break;default:e(0)}k+=N,z+=X}n.Ma+=w}else alert("todo:EmitRescaledRowsYUVA");e(n.Ma<=u.height)}}n.C=a,e(n.C<=n.i)}function ai(n){var a;if(0<n.ua)return 0;for(a=0;a<n.Wb;++a){var u=n.Ya[a].G,f=n.Ya[a].H;if(0<u[1][f[1]+0].g||0<u[2][f[2]+0].g||0<u[3][f[3]+0].g)return 0}return 1}function _t(n,a,u,f,g,w){if(n.Z!=0){var A=n.qd,k=n.rd;for(e(Li[n.Z]!=null);a<u;++a)Li[n.Z](A,k,f,g,f,g,w),A=f,k=g,g+=w;n.qd=A,n.rd=k}}function Ot(n,a){var u=n.l.ma,f=u.Z==0||u.Z==1?n.l.j:n.C;if(f=n.C<f?f:n.C,e(a<=n.l.o),a>f){var g=n.l.width,w=u.ca,A=u.tb+g*f,k=n.V,N=n.Ba+n.c*f,_=n.gc;e(n.ab==1),e(_[0].hc==3),Ur(_[0],f,a,k,N,w,A),_t(u,f,a,w,A,g)}n.C=n.Ma=a}function Mt(n,a,u,f,g,w,A){var k=n.$/f,N=n.$%f,_=n.m,z=n.s,X=u+n.$,Z=X;g=u+f*g;var J=u+f*w,vn=280+z.ua,on=n.Pb?k:16777216,H=0<z.ua?z.Wa:null,V=z.wc,gn=X<J?Re(z,N,k):null;e(n.C<w),e(J<=g);var bn=!1;n:for(;;){for(;bn||X<J;){var yn=0;if(k>=on){var Rn=X-u;e((on=n).Pb),on.wd=on.m,on.xd=Rn,0<on.s.ua&&fn(on.s.Wa,on.s.vb),on=k+il}if(N&V||(gn=Re(z,N,k)),e(gn!=null),gn.Qb&&(a[X]=gn.qb,bn=!0),!bn)if(Y(_),gn.jc){yn=_,Rn=a;var Sn=X,Bn=gn.pd[O(yn)&We-1];e(gn.jc),256>Bn.g?(B(yn,yn.u+Bn.g),Rn[Sn]=Bn.value,yn=0):(B(yn,yn.u+Bn.g-256),e(256<=Bn.value),yn=Bn.value),yn==0&&(bn=!0)}else yn=ot(gn.G[0],gn.H[0],_);if(_.h)break;if(bn||256>yn){if(!bn)if(gn.nd)a[X]=(gn.qb|yn<<8)>>>0;else{if(Y(_),bn=ot(gn.G[1],gn.H[1],_),Y(_),Rn=ot(gn.G[2],gn.H[2],_),Sn=ot(gn.G[3],gn.H[3],_),_.h)break;a[X]=(Sn<<24|bn<<16|yn<<8|Rn)>>>0}if(bn=!1,++X,++N>=f&&(N=0,++k,A!=null&&k<=w&&!(k%16)&&A(n,k),H!=null))for(;Z<X;)yn=a[Z++],H.X[(506832829*yn&4294967295)>>>H.Mb]=yn}else if(280>yn){if(yn=It(yn-256,_),Rn=ot(gn.G[4],gn.H[4],_),Y(_),Rn=Wt(f,Rn=It(Rn,_)),_.h)break;if(X-u<Rn||g-X<yn)break n;for(Sn=0;Sn<yn;++Sn)a[X+Sn]=a[X+Sn-Rn];for(X+=yn,N+=yn;N>=f;)N-=f,++k,A!=null&&k<=w&&!(k%16)&&A(n,k);if(e(X<=g),N&V&&(gn=Re(z,N,k)),H!=null)for(;Z<X;)yn=a[Z++],H.X[(506832829*yn&4294967295)>>>H.Mb]=yn}else{if(!(yn<vn))break n;for(bn=yn-280,e(H!=null);Z<X;)yn=a[Z++],H.X[(506832829*yn&4294967295)>>>H.Mb]=yn;yn=X,e(!(bn>>>(Rn=H).Xa)),a[yn]=Rn.X[bn],bn=!0}bn||e(_.h==R(_))}if(n.Pb&&_.h&&X<g)e(n.m.h),n.a=5,n.m=n.wd,n.$=n.xd,0<n.s.ua&&fn(n.s.vb,n.s.Wa);else{if(_.h)break n;A!=null&&A(n,k>w?w:k),n.a=0,n.$=X-u}return 1}return n.a=3,0}function Jt(n){e(n!=null),n.vc=null,n.yc=null,n.Ya=null;var a=n.Wa;a!=null&&(a.X=null),n.vb=null,e(n!=null)}function bt(){var n=new Ho;return n==null?null:(n.a=0,n.xb=Fs,Ht("Predictor","VP8LPredictors"),Ht("Predictor","VP8LPredictors_C"),Ht("PredictorAdd","VP8LPredictorsAdd"),Ht("PredictorAdd","VP8LPredictorsAdd_C"),Fr=re,qi=Vn,lt=Mn,it=Ye,bi=se,si=Ct,ci=ge,q.VP8LMapColor32b=ya,q.VP8LMapColor8b=jr,n)}function Yt(n,a,u,f,g){var w=1,A=[n],k=[a],N=f.m,_=f.s,z=null,X=0;n:for(;;){if(u)for(;w&&pn(N,1);){var Z=A,J=k,vn=f,on=1,H=vn.m,V=vn.gc[vn.ab],gn=pn(H,2);if(vn.Oc&1<<gn)w=0;else{switch(vn.Oc|=1<<gn,V.hc=gn,V.Ea=Z[0],V.nc=J[0],V.K=[null],++vn.ab,e(4>=vn.ab),gn){case 0:case 1:V.b=pn(H,3)+2,on=Yt(Un(V.Ea,V.b),Un(V.nc,V.b),0,vn,V.K),V.K=V.K[0];break;case 3:var bn,yn=pn(H,8)+1,Rn=16<yn?0:4<yn?1:2<yn?2:3;if(Z[0]=Un(V.Ea,Rn),V.b=Rn,bn=on=Yt(yn,1,0,vn,V.K)){var Sn,Bn=yn,Pn=V,ce=1<<(8>>Pn.b),de=o(ce);if(de==null)bn=0;else{var oe=Pn.K[0],ie=Pn.w;for(de[0]=Pn.K[0][0],Sn=1;Sn<1*Bn;++Sn)de[Sn]=xn(oe[ie+Sn],de[Sn-1]);for(;Sn<4*ce;++Sn)de[Sn]=0;Pn.K[0]=null,Pn.K[0]=de,bn=1}}on=bn;break;case 2:break;default:e(0)}w=on}}if(A=A[0],k=k[0],w&&pn(N,1)&&!(w=1<=(X=pn(N,4))&&11>=X)){f.a=3;break n}var ye;if(ye=w)e:{var me,Qn,Ue,ut=f,je=A,dt=k,he=X,gt=u,yt=ut.m,ze=ut.s,Je=[null],rt=1,St=0,$t=tl[he];t:for(;;){if(gt&&pn(yt,1)){var He=pn(yt,3)+2,hi=Un(je,He),Wi=Un(dt,He),xa=hi*Wi;if(!Yt(hi,Wi,0,ut,Je))break t;for(Je=Je[0],ze.xc=He,me=0;me<xa;++me){var ki=Je[me]>>8&65535;Je[me]=ki,ki>=rt&&(rt=ki+1)}}if(yt.h)break t;for(Qn=0;5>Qn;++Qn){var Ce=Es[Qn];!Qn&&0<he&&(Ce+=1<<he),St<Ce&&(St=Ce)}var Qo=l(rt*$t,I),Vs=rt,Ws=l(Vs,j);if(Ws==null)var Xr=null;else e(65536>=Vs),Xr=Ws;var sr=o(St);if(Xr==null||sr==null||Qo==null){ut.a=1;break t}var Zr=Qo;for(me=Ue=0;me<rt;++me){var Ut=Xr[me],La=Ut.G,ka=Ut.H,Js=0,$r=1,Ys=0;for(Qn=0;5>Qn;++Qn){Ce=Es[Qn],La[Qn]=Zr,ka[Qn]=Ue,!Qn&&0<he&&(Ce+=1<<he);a:{var Qr,ns=Ce,no=ut,cr=sr,Ll=Zr,kl=Ue,es=0,Ni=no.m,Nl=pn(Ni,1);if(c(cr,0,0,ns),Nl){var Sl=pn(Ni,1)+1,Cl=pn(Ni,1),Ks=pn(Ni,Cl==0?1:8);cr[Ks]=1,Sl==2&&(cr[Ks=pn(Ni,8)]=1);var eo=1}else{var Xs=o(19),Zs=pn(Ni,4)+4;if(19<Zs){no.a=3;var to=0;break a}for(Qr=0;Qr<Zs;++Qr)Xs[nl[Qr]]=pn(Ni,3);var ts=void 0,lr=void 0,$s=no,Pl=Xs,io=ns,Qs=cr,is=0,Si=$s.m,nc=8,ec=l(128,I);i:for(;C(ec,0,7,Pl,19);){if(pn(Si,1)){var Il=2+2*pn(Si,3);if((ts=2+pn(Si,Il))>io)break i}else ts=io;for(lr=0;lr<io&&ts--;){Y(Si);var tc=ec[0+(127&O(Si))];B(Si,Si.u+tc.g);var Na=tc.value;if(16>Na)Qs[lr++]=Na,Na!=0&&(nc=Na);else{var _l=Na==16,ic=Na-16,Ol=$c[ic],ac=pn(Si,Zc[ic])+Ol;if(lr+ac>io)break i;for(var Ml=_l?nc:0;0<ac--;)Qs[lr++]=Ml}}is=1;break i}is||($s.a=3),eo=is}(eo=eo&&!Ni.h)&&(es=C(Ll,kl,8,cr,ns)),eo&&es!=0?to=es:(no.a=3,to=0)}if(to==0)break t;if($r&&Qc[Qn]==1&&($r=Zr[Ue].g==0),Js+=Zr[Ue].g,Ue+=to,3>=Qn){var ur,as=sr[0];for(ur=1;ur<Ce;++ur)sr[ur]>as&&(as=sr[ur]);Ys+=as}}if(Ut.nd=$r,Ut.Qb=0,$r&&(Ut.qb=(La[3][ka[3]+0].value<<24|La[1][ka[1]+0].value<<16|La[2][ka[2]+0].value)>>>0,Js==0&&256>La[0][ka[0]+0].value&&(Ut.Qb=1,Ut.qb+=La[0][ka[0]+0].value<<8)),Ut.jc=!Ut.Qb&&6>Ys,Ut.jc){var ao,fi=Ut;for(ao=0;ao<We;++ao){var Ci=ao,Pi=fi.pd[Ci],ro=fi.G[0][fi.H[0]+Ci];256<=ro.value?(Pi.g=ro.g+256,Pi.value=ro.value):(Pi.g=0,Pi.value=0,Ci>>=Te(ro,8,Pi),Ci>>=Te(fi.G[1][fi.H[1]+Ci],16,Pi),Ci>>=Te(fi.G[2][fi.H[2]+Ci],0,Pi),Te(fi.G[3][fi.H[3]+Ci],24,Pi))}}}ze.vc=Je,ze.Wb=rt,ze.Ya=Xr,ze.yc=Qo,ye=1;break e}ye=0}if(!(w=ye)){f.a=3;break n}if(0<X){if(_.ua=1<<X,!zn(_.Wa,X)){f.a=1,w=0;break n}}else _.ua=0;var rs=f,rc=A,Dl=k,os=rs.s,ss=os.xc;if(rs.c=rc,rs.i=Dl,os.md=Un(rc,ss),os.wc=ss==0?-1:(1<<ss)-1,u){f.xb=ul;break n}if((z=o(A*k))==null){f.a=1,w=0;break n}w=(w=Mt(f,z,0,A,k,k,null))&&!N.h;break n}return w?(g!=null?g[0]=z:(e(z==null),e(u)),f.$=0,u||Jt(_)):Jt(_),w}function Fi(n,a){var u=n.c*n.i,f=u+a+16*a;return e(n.c<=a),n.V=o(f),n.V==null?(n.Ta=null,n.Ua=0,n.a=1,0):(n.Ta=n.V,n.Ua=n.Ba+u+a,1)}function $i(n,a){var u=n.C,f=a-u,g=n.V,w=n.Ba+n.c*u;for(e(a<=n.l.o);0<f;){var A=16<f?16:f,k=n.l.ma,N=n.l.width,_=N*A,z=k.ca,X=k.tb+N*u,Z=n.Ta,J=n.Ua;ft(n,A,g,w),Oe(Z,J,z,X,_),_t(k,u,u+A,z,X,N),f-=A,g+=A*n.c,u+=A}e(u==a),n.C=n.Ma=a}function Qi(){this.ub=this.yd=this.td=this.Rb=0}function na(){this.Kd=this.Ld=this.Ud=this.Td=this.i=this.c=0}function ea(){this.Fb=this.Bb=this.Cb=0,this.Zb=o(4),this.Lb=o(4)}function gr(){this.Yb=function(){var n=[];return function a(u,f,g){for(var w=g[f],A=0;A<w&&(u.push(g.length>f+1?[]:0),!(g.length<f+1));A++)a(u[A],f+1,g)}(n,0,[3,11]),n}()}function wo(){this.jb=o(3),this.Wc=d([4,8],gr),this.Xc=d([4,17],gr)}function Ao(){this.Pc=this.wb=this.Tb=this.zd=0,this.vd=new o(4),this.od=new o(4)}function ta(){this.ld=this.La=this.dd=this.tc=0}function yr(){this.Na=this.la=0}function xo(){this.Sc=[0,0],this.Eb=[0,0],this.Qc=[0,0],this.ia=this.lc=0}function Ra(){this.ad=o(384),this.Za=0,this.Ob=o(16),this.$b=this.Ad=this.ia=this.Gc=this.Hc=this.Dd=0}function Lo(){this.uc=this.M=this.Nb=0,this.wa=Array(new ta),this.Y=0,this.ya=Array(new Ra),this.aa=0,this.l=new ia}function vr(){this.y=o(16),this.f=o(8),this.ea=o(8)}function ko(){this.cb=this.a=0,this.sc="",this.m=new Dn,this.Od=new Qi,this.Kc=new na,this.ed=new Ao,this.Qa=new ea,this.Ic=this.$c=this.Aa=0,this.D=new Lo,this.Xb=this.Va=this.Hb=this.zb=this.yb=this.Ub=this.za=0,this.Jc=l(8,Dn),this.ia=0,this.pb=l(4,xo),this.Pa=new wo,this.Bd=this.kc=0,this.Ac=[],this.Bc=0,this.zc=[0,0,0,0],this.Gd=Array(new vr),this.Hd=0,this.rb=Array(new yr),this.sb=0,this.wa=Array(new ta),this.Y=0,this.oc=[],this.pc=0,this.sa=[],this.ta=0,this.qa=[],this.ra=0,this.Ha=[],this.B=this.R=this.Ia=0,this.Ec=[],this.M=this.ja=this.Vb=this.Fc=0,this.ya=Array(new Ra),this.L=this.aa=0,this.gd=d([4,2],ta),this.ga=null,this.Fa=[],this.Cc=this.qc=this.P=0,this.Gb=[],this.Uc=0,this.mb=[],this.nb=0,this.rc=[],this.Ga=this.Vc=0}function ia(){this.T=this.U=this.ka=this.height=this.width=0,this.y=[],this.f=[],this.ea=[],this.Rc=this.fa=this.W=this.N=this.O=0,this.ma="void",this.put="VP8IoPutHook",this.ac="VP8IoSetupHook",this.bc="VP8IoTeardownHook",this.ha=this.Kb=0,this.data=[],this.hb=this.ib=this.da=this.o=this.j=this.va=this.v=this.Da=this.ob=this.w=0,this.F=[],this.J=0}function No(){var n=new ko;return n!=null&&(n.a=0,n.sc="OK",n.cb=0,n.Xb=0,rr||(rr=Ar)),n}function Ie(n,a,u){return n.a==0&&(n.a=a,n.sc=u,n.cb=0),0}function br(n,a,u){return 3<=u&&n[a+0]==157&&n[a+1]==1&&n[a+2]==42}function wr(n,a){if(n==null)return 0;if(n.a=0,n.sc="OK",a==null)return Ie(n,2,"null VP8Io passed to VP8GetHeaders()");var u=a.data,f=a.w,g=a.ha;if(4>g)return Ie(n,7,"Truncated header.");var w=u[f+0]|u[f+1]<<8|u[f+2]<<16,A=n.Od;if(A.Rb=!(1&w),A.td=w>>1&7,A.yd=w>>4&1,A.ub=w>>5,3<A.td)return Ie(n,3,"Incorrect keyframe parameters.");if(!A.yd)return Ie(n,4,"Frame not displayable.");f+=3,g-=3;var k=n.Kc;if(A.Rb){if(7>g)return Ie(n,7,"cannot parse picture header");if(!br(u,f,g))return Ie(n,3,"Bad code word");k.c=16383&(u[f+4]<<8|u[f+3]),k.Td=u[f+4]>>6,k.i=16383&(u[f+6]<<8|u[f+5]),k.Ud=u[f+6]>>6,f+=7,g-=7,n.za=k.c+15>>4,n.Ub=k.i+15>>4,a.width=k.c,a.height=k.i,a.Da=0,a.j=0,a.v=0,a.va=a.width,a.o=a.height,a.da=0,a.ib=a.width,a.hb=a.height,a.U=a.width,a.T=a.height,c((w=n.Pa).jb,0,255,w.jb.length),e((w=n.Qa)!=null),w.Cb=0,w.Bb=0,w.Fb=1,c(w.Zb,0,0,w.Zb.length),c(w.Lb,0,0,w.Lb)}if(A.ub>g)return Ie(n,7,"bad partition length");cn(w=n.m,u,f,A.ub),f+=A.ub,g-=A.ub,A.Rb&&(k.Ld=en(w),k.Kd=en(w)),k=n.Qa;var N,_=n.Pa;if(e(w!=null),e(k!=null),k.Cb=en(w),k.Cb){if(k.Bb=en(w),en(w)){for(k.Fb=en(w),N=0;4>N;++N)k.Zb[N]=en(w)?hn(w,7):0;for(N=0;4>N;++N)k.Lb[N]=en(w)?hn(w,6):0}if(k.Bb)for(N=0;3>N;++N)_.jb[N]=en(w)?rn(w,8):255}else k.Bb=0;if(w.Ka)return Ie(n,3,"cannot parse segment header");if((k=n.ed).zd=en(w),k.Tb=rn(w,6),k.wb=rn(w,3),k.Pc=en(w),k.Pc&&en(w)){for(_=0;4>_;++_)en(w)&&(k.vd[_]=hn(w,6));for(_=0;4>_;++_)en(w)&&(k.od[_]=hn(w,6))}if(n.L=k.Tb==0?0:k.zd?1:2,w.Ka)return Ie(n,3,"cannot parse filter header");var z=g;if(g=N=f,f=N+z,k=z,n.Xb=(1<<rn(n.m,2))-1,z<3*(_=n.Xb))u=7;else{for(N+=3*_,k-=3*_,z=0;z<_;++z){var X=u[g+0]|u[g+1]<<8|u[g+2]<<16;X>k&&(X=k),cn(n.Jc[+z],u,N,X),N+=X,k-=X,g+=3}cn(n.Jc[+_],u,N,k),u=N<f?0:5}if(u!=0)return Ie(n,u,"cannot parse partitions");for(u=rn(N=n.m,7),g=en(N)?hn(N,4):0,f=en(N)?hn(N,4):0,k=en(N)?hn(N,4):0,_=en(N)?hn(N,4):0,N=en(N)?hn(N,4):0,z=n.Qa,X=0;4>X;++X){if(z.Cb){var Z=z.Zb[X];z.Fb||(Z+=u)}else{if(0<X){n.pb[X]=n.pb[0];continue}Z=u}var J=n.pb[X];J.Sc[0]=Xo[pt(Z+g,127)],J.Sc[1]=Zo[pt(Z+0,127)],J.Eb[0]=2*Xo[pt(Z+f,127)],J.Eb[1]=101581*Zo[pt(Z+k,127)]>>16,8>J.Eb[1]&&(J.Eb[1]=8),J.Qc[0]=Xo[pt(Z+_,117)],J.Qc[1]=Zo[pt(Z+N,127)],J.lc=Z+N}if(!A.Rb)return Ie(n,4,"Not a key frame.");for(en(w),A=n.Pa,u=0;4>u;++u){for(g=0;8>g;++g)for(f=0;3>f;++f)for(k=0;11>k;++k)_=tn(w,cl[u][g][f][k])?rn(w,8):ol[u][g][f][k],A.Wc[u][g].Yb[f][k]=_;for(g=0;17>g;++g)A.Xc[u][g]=A.Wc[u][ll[g]]}return n.kc=en(w),n.kc&&(n.Bd=rn(w,8)),n.cb=1}function Ar(n,a,u,f,g,w,A){var k=a[g].Yb[u];for(u=0;16>g;++g){if(!tn(n,k[u+0]))return g;for(;!tn(n,k[u+1]);)if(k=a[++g].Yb[0],u=0,g==16)return 16;var N=a[g+1].Yb;if(tn(n,k[u+2])){var _=n,z=0;if(tn(_,(Z=k)[(X=u)+3]))if(tn(_,Z[X+6])){for(k=0,X=2*(z=tn(_,Z[X+8]))+(Z=tn(_,Z[X+9+z])),z=0,Z=al[X];Z[k];++k)z+=z+tn(_,Z[k]);z+=3+(8<<X)}else tn(_,Z[X+7])?(z=7+2*tn(_,165),z+=tn(_,145)):z=5+tn(_,159);else z=tn(_,Z[X+4])?3+tn(_,Z[X+5]):2;k=N[2]}else z=1,k=N[1];N=A+rl[g],0>(_=n).b&&Q(_);var X,Z=_.b,J=(X=_.Ca>>1)-(_.I>>Z)>>31;--_.b,_.Ca+=J,_.Ca|=1,_.I-=(X+1&J)<<Z,w[N]=((z^J)-J)*f[(0<g)+0]}return 16}function Fa(n){var a=n.rb[n.sb-1];a.la=0,a.Na=0,c(n.zc,0,0,n.zc.length),n.ja=0}function So(n,a){if(n==null)return 0;if(a==null)return Ie(n,2,"NULL VP8Io parameter in VP8Decode().");if(!n.cb&&!wr(n,a))return 0;if(e(n.cb),a.ac==null||a.ac(a)){a.ob&&(n.L=0);var u=Kr[n.L];if(n.L==2?(n.yb=0,n.zb=0):(n.yb=a.v-u>>4,n.zb=a.j-u>>4,0>n.yb&&(n.yb=0),0>n.zb&&(n.zb=0)),n.Va=a.o+15+u>>4,n.Hb=a.va+15+u>>4,n.Hb>n.za&&(n.Hb=n.za),n.Va>n.Ub&&(n.Va=n.Ub),0<n.L){var f=n.ed;for(u=0;4>u;++u){var g;if(n.Qa.Cb){var w=n.Qa.Lb[u];n.Qa.Fb||(w+=f.Tb)}else w=f.Tb;for(g=0;1>=g;++g){var A=n.gd[u][g],k=w;if(f.Pc&&(k+=f.vd[0],g&&(k+=f.od[0])),0<(k=0>k?0:63<k?63:k)){var N=k;0<f.wb&&(N=4<f.wb?N>>2:N>>1)>9-f.wb&&(N=9-f.wb),1>N&&(N=1),A.dd=N,A.tc=2*k+N,A.ld=40<=k?2:15<=k?1:0}else A.tc=0;A.La=g}}}u=0}else Ie(n,6,"Frame setup failed"),u=n.a;if(u=u==0){if(u){n.$c=0,0<n.Aa||(n.Ic=xl);n:{u=n.Ic,f=4*(N=n.za);var _=32*N,z=N+1,X=0<n.L?N*(0<n.Aa?2:1):0,Z=(n.Aa==2?2:1)*N;if((A=f+832+(g=3*(16*u+Kr[n.L])/2*_)+(w=n.Fa!=null&&0<n.Fa.length?n.Kc.c*n.Kc.i:0))!=A)u=0;else{if(A>n.Vb){if(n.Vb=0,n.Ec=o(A),n.Fc=0,n.Ec==null){u=Ie(n,1,"no memory during frame initialization.");break n}n.Vb=A}A=n.Ec,k=n.Fc,n.Ac=A,n.Bc=k,k+=f,n.Gd=l(_,vr),n.Hd=0,n.rb=l(z+1,yr),n.sb=1,n.wa=X?l(X,ta):null,n.Y=0,n.D.Nb=0,n.D.wa=n.wa,n.D.Y=n.Y,0<n.Aa&&(n.D.Y+=N),e(!0),n.oc=A,n.pc=k,k+=832,n.ya=l(Z,Ra),n.aa=0,n.D.ya=n.ya,n.D.aa=n.aa,n.Aa==2&&(n.D.aa+=N),n.R=16*N,n.B=8*N,N=(_=Kr[n.L])*n.R,_=_/2*n.B,n.sa=A,n.ta=k+N,n.qa=n.sa,n.ra=n.ta+16*u*n.R+_,n.Ha=n.qa,n.Ia=n.ra+8*u*n.B+_,n.$c=0,k+=g,n.mb=w?A:null,n.nb=w?k:null,e(k+w<=n.Fc+n.Vb),Fa(n),c(n.Ac,n.Bc,0,f),u=1}}if(u){if(a.ka=0,a.y=n.sa,a.O=n.ta,a.f=n.qa,a.N=n.ra,a.ea=n.Ha,a.Vd=n.Ia,a.fa=n.R,a.Rc=n.B,a.F=null,a.J=0,!Br){for(u=-255;255>=u;++u)Be[255+u]=0>u?-u:u;for(u=-1020;1020>=u;++u)ui[1020+u]=-128>u?-128:127<u?127:u;for(u=-112;112>=u;++u)ar[112+u]=-16>u?-16:15<u?15:u;for(u=-255;510>=u;++u)Aa[255+u]=0>u?0:255<u?255:u;Br=1}va=Io,li=Co,er=Lr,at=Po,At=kr,_e=xr,ba=za,Tr=Ti,tr=zo,zi=Ha,Hi=qo,wi=la,Gi=Ga,wa=Dr,Vi=Mr,Ai=Xt,ir=oi,xt=Bo,Ft[0]=Kt,Ft[1]=_o,Ft[2]=Eo,Ft[3]=Ro,Ft[4]=Cr,Ft[5]=sa,Ft[6]=Pr,Ft[7]=Ta,Ft[8]=Uo,Ft[9]=Fo,xi[0]=Nr,xi[1]=Mo,xi[2]=ri,xi[3]=ra,xi[4]=Ke,xi[5]=Do,xi[6]=Sr,di[0]=mi,di[1]=Oo,di[2]=jo,di[3]=Ba,di[4]=ji,di[5]=To,di[6]=qa,u=1}else u=0}u&&(u=function(J,vn){for(J.M=0;J.M<J.Va;++J.M){var on,H=J.Jc[J.M&J.Xb],V=J.m,gn=J;for(on=0;on<gn.za;++on){var bn=V,yn=gn,Rn=yn.Ac,Sn=yn.Bc+4*on,Bn=yn.zc,Pn=yn.ya[yn.aa+on];if(yn.Qa.Bb?Pn.$b=tn(bn,yn.Pa.jb[0])?2+tn(bn,yn.Pa.jb[2]):tn(bn,yn.Pa.jb[1]):Pn.$b=0,yn.kc&&(Pn.Ad=tn(bn,yn.Bd)),Pn.Za=!tn(bn,145)+0,Pn.Za){var ce=Pn.Ob,de=0;for(yn=0;4>yn;++yn){var oe,ie=Bn[0+yn];for(oe=0;4>oe;++oe){ie=sl[Rn[Sn+oe]][ie];for(var ye=Rs[tn(bn,ie[0])];0<ye;)ye=Rs[2*ye+tn(bn,ie[ye])];ie=-ye,Rn[Sn+oe]=ie}r(ce,de,Rn,Sn,4),de+=4,Bn[0+yn]=ie}}else ie=tn(bn,156)?tn(bn,128)?1:3:tn(bn,163)?2:0,Pn.Ob[0]=ie,c(Rn,Sn,ie,4),c(Bn,0,ie,4);Pn.Dd=tn(bn,142)?tn(bn,114)?tn(bn,183)?1:3:2:0}if(gn.m.Ka)return Ie(J,7,"Premature end-of-partition0 encountered.");for(;J.ja<J.za;++J.ja){if(gn=H,bn=(V=J).rb[V.sb-1],Rn=V.rb[V.sb+V.ja],on=V.ya[V.aa+V.ja],Sn=V.kc?on.Ad:0)bn.la=Rn.la=0,on.Za||(bn.Na=Rn.Na=0),on.Hc=0,on.Gc=0,on.ia=0;else{var me,Qn;if(bn=Rn,Rn=gn,Sn=V.Pa.Xc,Bn=V.ya[V.aa+V.ja],Pn=V.pb[Bn.$b],yn=Bn.ad,ce=0,de=V.rb[V.sb-1],ie=oe=0,c(yn,ce,0,384),Bn.Za)var Ue=0,ut=Sn[3];else{ye=o(16);var je=bn.Na+de.Na;if(je=rr(Rn,Sn[1],je,Pn.Eb,0,ye,0),bn.Na=de.Na=(0<je)+0,1<je)va(ye,0,yn,ce);else{var dt=ye[0]+3>>3;for(ye=0;256>ye;ye+=16)yn[ce+ye]=dt}Ue=1,ut=Sn[0]}var he=15&bn.la,gt=15&de.la;for(ye=0;4>ye;++ye){var yt=1&gt;for(dt=Qn=0;4>dt;++dt)he=he>>1|(yt=(je=rr(Rn,ut,je=yt+(1&he),Pn.Sc,Ue,yn,ce))>Ue)<<7,Qn=Qn<<2|(3<je?3:1<je?2:yn[ce+0]!=0),ce+=16;he>>=4,gt=gt>>1|yt<<7,oe=(oe<<8|Qn)>>>0}for(ut=he,Ue=gt>>4,me=0;4>me;me+=2){for(Qn=0,he=bn.la>>4+me,gt=de.la>>4+me,ye=0;2>ye;++ye){for(yt=1&gt,dt=0;2>dt;++dt)je=yt+(1&he),he=he>>1|(yt=0<(je=rr(Rn,Sn[2],je,Pn.Qc,0,yn,ce)))<<3,Qn=Qn<<2|(3<je?3:1<je?2:yn[ce+0]!=0),ce+=16;he>>=2,gt=gt>>1|yt<<5}ie|=Qn<<4*me,ut|=he<<4<<me,Ue|=(240&gt)<<me}bn.la=ut,de.la=Ue,Bn.Hc=oe,Bn.Gc=ie,Bn.ia=43690&ie?0:Pn.ia,Sn=!(oe|ie)}if(0<V.L&&(V.wa[V.Y+V.ja]=V.gd[on.$b][on.Za],V.wa[V.Y+V.ja].La|=!Sn),gn.Ka)return Ie(J,7,"Premature end-of-file encountered.")}if(Fa(J),V=vn,gn=1,on=(H=J).D,bn=0<H.L&&H.M>=H.zb&&H.M<=H.Va,H.Aa==0)n:{if(on.M=H.M,on.uc=bn,Xa(H,on),gn=1,on=(Qn=H.D).Nb,bn=(ie=Kr[H.L])*H.R,Rn=ie/2*H.B,ye=16*on*H.R,dt=8*on*H.B,Sn=H.sa,Bn=H.ta-bn+ye,Pn=H.qa,yn=H.ra-Rn+dt,ce=H.Ha,de=H.Ia-Rn+dt,gt=(he=Qn.M)==0,oe=he>=H.Va-1,H.Aa==2&&Xa(H,Qn),Qn.uc)for(yt=(je=H).D.M,e(je.D.uc),Qn=je.yb;Qn<je.Hb;++Qn){Ue=Qn,ut=yt;var ze=(Je=(Ce=je).D).Nb;me=Ce.R;var Je=Je.wa[Je.Y+Ue],rt=Ce.sa,St=Ce.ta+16*ze*me+16*Ue,$t=Je.dd,He=Je.tc;if(He!=0)if(e(3<=He),Ce.L==1)0<Ue&&Ai(rt,St,me,He+4),Je.La&&xt(rt,St,me,He),0<ut&&Vi(rt,St,me,He+4),Je.La&&ir(rt,St,me,He);else{var hi=Ce.B,Wi=Ce.qa,xa=Ce.ra+8*ze*hi+8*Ue,ki=Ce.Ha,Ce=Ce.Ia+8*ze*hi+8*Ue;ze=Je.ld,0<Ue&&(Tr(rt,St,me,He+4,$t,ze),zi(Wi,xa,ki,Ce,hi,He+4,$t,ze)),Je.La&&(wi(rt,St,me,He,$t,ze),wa(Wi,xa,ki,Ce,hi,He,$t,ze)),0<ut&&(ba(rt,St,me,He+4,$t,ze),tr(Wi,xa,ki,Ce,hi,He+4,$t,ze)),Je.La&&(Hi(rt,St,me,He,$t,ze),Gi(Wi,xa,ki,Ce,hi,He,$t,ze))}}if(H.ia&&alert("todo:DitherRow"),V.put!=null){if(Qn=16*he,he=16*(he+1),gt?(V.y=H.sa,V.O=H.ta+ye,V.f=H.qa,V.N=H.ra+dt,V.ea=H.Ha,V.W=H.Ia+dt):(Qn-=ie,V.y=Sn,V.O=Bn,V.f=Pn,V.N=yn,V.ea=ce,V.W=de),oe||(he-=ie),he>V.o&&(he=V.o),V.F=null,V.J=null,H.Fa!=null&&0<H.Fa.length&&Qn<he&&(V.J=Ya(H,V,Qn,he-Qn),V.F=H.mb,V.F==null&&V.F.length==0)){gn=Ie(H,3,"Could not decode alpha data.");break n}Qn<V.j&&(ie=V.j-Qn,Qn=V.j,e(!(1&ie)),V.O+=H.R*ie,V.N+=H.B*(ie>>1),V.W+=H.B*(ie>>1),V.F!=null&&(V.J+=V.width*ie)),Qn<he&&(V.O+=V.v,V.N+=V.v>>1,V.W+=V.v>>1,V.F!=null&&(V.J+=V.v),V.ka=Qn-V.j,V.U=V.va-V.v,V.T=he-Qn,gn=V.put(V))}on+1!=H.Ic||oe||(r(H.sa,H.ta-bn,Sn,Bn+16*H.R,bn),r(H.qa,H.ra-Rn,Pn,yn+8*H.B,Rn),r(H.Ha,H.Ia-Rn,ce,de+8*H.B,Rn))}if(!gn)return Ie(J,6,"Output aborted.")}return 1}(n,a)),a.bc!=null&&a.bc(a),u&=1}return u?(n.cb=0,u):0}function Dt(n,a,u,f,g){g=n[a+u+32*f]+(g>>3),n[a+u+32*f]=-256&g?0>g?0:255:g}function aa(n,a,u,f,g,w){Dt(n,a,0,u,f+g),Dt(n,a,1,u,f+w),Dt(n,a,2,u,f-w),Dt(n,a,3,u,f-g)}function st(n){return(20091*n>>16)+n}function Ua(n,a,u,f){var g,w=0,A=o(16);for(g=0;4>g;++g){var k=n[a+0]+n[a+8],N=n[a+0]-n[a+8],_=(35468*n[a+4]>>16)-st(n[a+12]),z=st(n[a+4])+(35468*n[a+12]>>16);A[w+0]=k+z,A[w+1]=N+_,A[w+2]=N-_,A[w+3]=k-z,w+=4,a++}for(g=w=0;4>g;++g)k=(n=A[w+0]+4)+A[w+8],N=n-A[w+8],_=(35468*A[w+4]>>16)-st(A[w+12]),Dt(u,f,0,0,k+(z=st(A[w+4])+(35468*A[w+12]>>16))),Dt(u,f,1,0,N+_),Dt(u,f,2,0,N-_),Dt(u,f,3,0,k-z),w++,f+=32}function xr(n,a,u,f){var g=n[a+0]+4,w=35468*n[a+4]>>16,A=st(n[a+4]),k=35468*n[a+1]>>16;aa(u,f,0,g+A,n=st(n[a+1]),k),aa(u,f,1,g+w,n,k),aa(u,f,2,g-w,n,k),aa(u,f,3,g-A,n,k)}function Co(n,a,u,f,g){Ua(n,a,u,f),g&&Ua(n,a+16,u,f+4)}function Lr(n,a,u,f){li(n,a+0,u,f,1),li(n,a+32,u,f+128,1)}function Po(n,a,u,f){var g;for(n=n[a+0]+4,g=0;4>g;++g)for(a=0;4>a;++a)Dt(u,f,a,g,n)}function kr(n,a,u,f){n[a+0]&&at(n,a+0,u,f),n[a+16]&&at(n,a+16,u,f+4),n[a+32]&&at(n,a+32,u,f+128),n[a+48]&&at(n,a+48,u,f+128+4)}function Io(n,a,u,f){var g,w=o(16);for(g=0;4>g;++g){var A=n[a+0+g]+n[a+12+g],k=n[a+4+g]+n[a+8+g],N=n[a+4+g]-n[a+8+g],_=n[a+0+g]-n[a+12+g];w[0+g]=A+k,w[8+g]=A-k,w[4+g]=_+N,w[12+g]=_-N}for(g=0;4>g;++g)A=(n=w[0+4*g]+3)+w[3+4*g],k=w[1+4*g]+w[2+4*g],N=w[1+4*g]-w[2+4*g],_=n-w[3+4*g],u[f+0]=A+k>>3,u[f+16]=_+N>>3,u[f+32]=A-k>>3,u[f+48]=_-N>>3,f+=64}function ja(n,a,u){var f,g=a-32,w=mt,A=255-n[g-1];for(f=0;f<u;++f){var k,N=w,_=A+n[a-1];for(k=0;k<u;++k)n[a+k]=N[_+n[g+k]];a+=32}}function _o(n,a){ja(n,a,4)}function Oo(n,a){ja(n,a,8)}function Mo(n,a){ja(n,a,16)}function ri(n,a){var u;for(u=0;16>u;++u)r(n,a+32*u,n,a-32,16)}function ra(n,a){var u;for(u=16;0<u;--u)c(n,a,n[a-1],16),a+=32}function oa(n,a,u){var f;for(f=0;16>f;++f)c(a,u+32*f,n,16)}function Nr(n,a){var u,f=16;for(u=0;16>u;++u)f+=n[a-1+32*u]+n[a+u-32];oa(f>>5,n,a)}function Ke(n,a){var u,f=8;for(u=0;16>u;++u)f+=n[a-1+32*u];oa(f>>4,n,a)}function Do(n,a){var u,f=8;for(u=0;16>u;++u)f+=n[a+u-32];oa(f>>4,n,a)}function Sr(n,a){oa(128,n,a)}function Wn(n,a,u){return n+2*a+u+2>>2}function Eo(n,a){var u,f=a-32;for(f=new Uint8Array([Wn(n[f-1],n[f+0],n[f+1]),Wn(n[f+0],n[f+1],n[f+2]),Wn(n[f+1],n[f+2],n[f+3]),Wn(n[f+2],n[f+3],n[f+4])]),u=0;4>u;++u)r(n,a+32*u,f,0,f.length)}function Ro(n,a){var u=n[a-1],f=n[a-1+32],g=n[a-1+64],w=n[a-1+96];kn(n,a+0,16843009*Wn(n[a-1-32],u,f)),kn(n,a+32,16843009*Wn(u,f,g)),kn(n,a+64,16843009*Wn(f,g,w)),kn(n,a+96,16843009*Wn(g,w,w))}function Kt(n,a){var u,f=4;for(u=0;4>u;++u)f+=n[a+u-32]+n[a-1+32*u];for(f>>=3,u=0;4>u;++u)c(n,a+32*u,f,4)}function Cr(n,a){var u=n[a-1+0],f=n[a-1+32],g=n[a-1+64],w=n[a-1-32],A=n[a+0-32],k=n[a+1-32],N=n[a+2-32],_=n[a+3-32];n[a+0+96]=Wn(f,g,n[a-1+96]),n[a+1+96]=n[a+0+64]=Wn(u,f,g),n[a+2+96]=n[a+1+64]=n[a+0+32]=Wn(w,u,f),n[a+3+96]=n[a+2+64]=n[a+1+32]=n[a+0+0]=Wn(A,w,u),n[a+3+64]=n[a+2+32]=n[a+1+0]=Wn(k,A,w),n[a+3+32]=n[a+2+0]=Wn(N,k,A),n[a+3+0]=Wn(_,N,k)}function Pr(n,a){var u=n[a+1-32],f=n[a+2-32],g=n[a+3-32],w=n[a+4-32],A=n[a+5-32],k=n[a+6-32],N=n[a+7-32];n[a+0+0]=Wn(n[a+0-32],u,f),n[a+1+0]=n[a+0+32]=Wn(u,f,g),n[a+2+0]=n[a+1+32]=n[a+0+64]=Wn(f,g,w),n[a+3+0]=n[a+2+32]=n[a+1+64]=n[a+0+96]=Wn(g,w,A),n[a+3+32]=n[a+2+64]=n[a+1+96]=Wn(w,A,k),n[a+3+64]=n[a+2+96]=Wn(A,k,N),n[a+3+96]=Wn(k,N,N)}function sa(n,a){var u=n[a-1+0],f=n[a-1+32],g=n[a-1+64],w=n[a-1-32],A=n[a+0-32],k=n[a+1-32],N=n[a+2-32],_=n[a+3-32];n[a+0+0]=n[a+1+64]=w+A+1>>1,n[a+1+0]=n[a+2+64]=A+k+1>>1,n[a+2+0]=n[a+3+64]=k+N+1>>1,n[a+3+0]=N+_+1>>1,n[a+0+96]=Wn(g,f,u),n[a+0+64]=Wn(f,u,w),n[a+0+32]=n[a+1+96]=Wn(u,w,A),n[a+1+32]=n[a+2+96]=Wn(w,A,k),n[a+2+32]=n[a+3+96]=Wn(A,k,N),n[a+3+32]=Wn(k,N,_)}function Ta(n,a){var u=n[a+0-32],f=n[a+1-32],g=n[a+2-32],w=n[a+3-32],A=n[a+4-32],k=n[a+5-32],N=n[a+6-32],_=n[a+7-32];n[a+0+0]=u+f+1>>1,n[a+1+0]=n[a+0+64]=f+g+1>>1,n[a+2+0]=n[a+1+64]=g+w+1>>1,n[a+3+0]=n[a+2+64]=w+A+1>>1,n[a+0+32]=Wn(u,f,g),n[a+1+32]=n[a+0+96]=Wn(f,g,w),n[a+2+32]=n[a+1+96]=Wn(g,w,A),n[a+3+32]=n[a+2+96]=Wn(w,A,k),n[a+3+64]=Wn(A,k,N),n[a+3+96]=Wn(k,N,_)}function Fo(n,a){var u=n[a-1+0],f=n[a-1+32],g=n[a-1+64],w=n[a-1+96];n[a+0+0]=u+f+1>>1,n[a+2+0]=n[a+0+32]=f+g+1>>1,n[a+2+32]=n[a+0+64]=g+w+1>>1,n[a+1+0]=Wn(u,f,g),n[a+3+0]=n[a+1+32]=Wn(f,g,w),n[a+3+32]=n[a+1+64]=Wn(g,w,w),n[a+3+64]=n[a+2+64]=n[a+0+96]=n[a+1+96]=n[a+2+96]=n[a+3+96]=w}function Uo(n,a){var u=n[a-1+0],f=n[a-1+32],g=n[a-1+64],w=n[a-1+96],A=n[a-1-32],k=n[a+0-32],N=n[a+1-32],_=n[a+2-32];n[a+0+0]=n[a+2+32]=u+A+1>>1,n[a+0+32]=n[a+2+64]=f+u+1>>1,n[a+0+64]=n[a+2+96]=g+f+1>>1,n[a+0+96]=w+g+1>>1,n[a+3+0]=Wn(k,N,_),n[a+2+0]=Wn(A,k,N),n[a+1+0]=n[a+3+32]=Wn(u,A,k),n[a+1+32]=n[a+3+64]=Wn(f,u,A),n[a+1+64]=n[a+3+96]=Wn(g,f,u),n[a+1+96]=Wn(w,g,f)}function jo(n,a){var u;for(u=0;8>u;++u)r(n,a+32*u,n,a-32,8)}function Ba(n,a){var u;for(u=0;8>u;++u)c(n,a,n[a-1],8),a+=32}function Ui(n,a,u){var f;for(f=0;8>f;++f)c(a,u+32*f,n,8)}function mi(n,a){var u,f=8;for(u=0;8>u;++u)f+=n[a+u-32]+n[a-1+32*u];Ui(f>>4,n,a)}function To(n,a){var u,f=4;for(u=0;8>u;++u)f+=n[a+u-32];Ui(f>>3,n,a)}function ji(n,a){var u,f=4;for(u=0;8>u;++u)f+=n[a-1+32*u];Ui(f>>3,n,a)}function qa(n,a){Ui(128,n,a)}function ca(n,a,u){var f=n[a-u],g=n[a+0],w=3*(g-f)+Vo[1020+n[a-2*u]-n[a+u]],A=qr[112+(w+4>>3)];n[a-u]=mt[255+f+qr[112+(w+3>>3)]],n[a+0]=mt[255+g-A]}function Ir(n,a,u,f){var g=n[a+0],w=n[a+u];return kt[255+n[a-2*u]-n[a-u]]>f||kt[255+w-g]>f}function _r(n,a,u,f){return 4*kt[255+n[a-u]-n[a+0]]+kt[255+n[a-2*u]-n[a+u]]<=f}function Or(n,a,u,f,g){var w=n[a-3*u],A=n[a-2*u],k=n[a-u],N=n[a+0],_=n[a+u],z=n[a+2*u],X=n[a+3*u];return 4*kt[255+k-N]+kt[255+A-_]>f?0:kt[255+n[a-4*u]-w]<=g&&kt[255+w-A]<=g&&kt[255+A-k]<=g&&kt[255+X-z]<=g&&kt[255+z-_]<=g&&kt[255+_-N]<=g}function Mr(n,a,u,f){var g=2*f+1;for(f=0;16>f;++f)_r(n,a+f,u,g)&&ca(n,a+f,u)}function Xt(n,a,u,f){var g=2*f+1;for(f=0;16>f;++f)_r(n,a+f*u,1,g)&&ca(n,a+f*u,1)}function oi(n,a,u,f){var g;for(g=3;0<g;--g)Mr(n,a+=4*u,u,f)}function Bo(n,a,u,f){var g;for(g=3;0<g;--g)Xt(n,a+=4,u,f)}function gi(n,a,u,f,g,w,A,k){for(w=2*w+1;0<g--;){if(Or(n,a,u,w,A))if(Ir(n,a,u,k))ca(n,a,u);else{var N=n,_=a,z=u,X=N[_-2*z],Z=N[_-z],J=N[_+0],vn=N[_+z],on=N[_+2*z],H=27*(gn=Vo[1020+3*(J-Z)+Vo[1020+X-vn]])+63>>7,V=18*gn+63>>7,gn=9*gn+63>>7;N[_-3*z]=mt[255+N[_-3*z]+gn],N[_-2*z]=mt[255+X+V],N[_-z]=mt[255+Z+H],N[_+0]=mt[255+J-H],N[_+z]=mt[255+vn-V],N[_+2*z]=mt[255+on-gn]}a+=f}}function Et(n,a,u,f,g,w,A,k){for(w=2*w+1;0<g--;){if(Or(n,a,u,w,A))if(Ir(n,a,u,k))ca(n,a,u);else{var N=n,_=a,z=u,X=N[_-z],Z=N[_+0],J=N[_+z],vn=qr[112+((on=3*(Z-X))+4>>3)],on=qr[112+(on+3>>3)],H=vn+1>>1;N[_-2*z]=mt[255+N[_-2*z]+H],N[_-z]=mt[255+X+on],N[_+0]=mt[255+Z-vn],N[_+z]=mt[255+J-H]}a+=f}}function za(n,a,u,f,g,w){gi(n,a,u,1,16,f,g,w)}function Ti(n,a,u,f,g,w){gi(n,a,1,u,16,f,g,w)}function qo(n,a,u,f,g,w){var A;for(A=3;0<A;--A)Et(n,a+=4*u,u,1,16,f,g,w)}function la(n,a,u,f,g,w){var A;for(A=3;0<A;--A)Et(n,a+=4,1,u,16,f,g,w)}function zo(n,a,u,f,g,w,A,k){gi(n,a,g,1,8,w,A,k),gi(u,f,g,1,8,w,A,k)}function Ha(n,a,u,f,g,w,A,k){gi(n,a,1,g,8,w,A,k),gi(u,f,1,g,8,w,A,k)}function Ga(n,a,u,f,g,w,A,k){Et(n,a+4*g,g,1,8,w,A,k),Et(u,f+4*g,g,1,8,w,A,k)}function Dr(n,a,u,f,g,w,A,k){Et(n,a+4,1,g,8,w,A,k),Et(u,f+4,1,g,8,w,A,k)}function ua(){this.ba=new Pt,this.ec=[],this.cc=[],this.Mc=[],this.Dc=this.Nc=this.dc=this.fc=0,this.Oa=new Ne,this.memory=0,this.Ib="OutputFunc",this.Jb="OutputAlphaFunc",this.Nd="OutputRowFunc"}function Va(){this.data=[],this.offset=this.kd=this.ha=this.w=0,this.na=[],this.xa=this.gb=this.Ja=this.Sa=this.P=0}function Wa(){this.nc=this.Ea=this.b=this.hc=0,this.K=[],this.w=0}function Er(){this.ua=0,this.Wa=new F,this.vb=new F,this.md=this.xc=this.wc=0,this.vc=[],this.Wb=0,this.Ya=new j,this.yc=new I}function Ho(){this.xb=this.a=0,this.l=new ia,this.ca=new Pt,this.V=[],this.Ba=0,this.Ta=[],this.Ua=0,this.m=new L,this.Pb=0,this.wd=new L,this.Ma=this.$=this.C=this.i=this.c=this.xd=0,this.s=new Er,this.ab=0,this.gc=l(4,Wa),this.Oc=0}function da(){this.Lc=this.Z=this.$a=this.i=this.c=0,this.l=new ia,this.ic=0,this.ca=[],this.tb=0,this.qd=null,this.rd=0}function Bi(n,a,u,f,g,w,A){for(n=n==null?0:n[a+0],a=0;a<A;++a)g[w+a]=n+u[f+a]&255,n=g[w+a]}function Ja(n,a,u,f,g,w,A){var k;if(n==null)Bi(null,null,u,f,g,w,A);else for(k=0;k<A;++k)g[w+k]=n[a+k]+u[f+k]&255}function yi(n,a,u,f,g,w,A){if(n==null)Bi(null,null,u,f,g,w,A);else{var k,N=n[a+0],_=N,z=N;for(k=0;k<A;++k)_=z+(N=n[a+k])-_,z=u[f+k]+(-256&_?0>_?0:255:_)&255,_=N,g[w+k]=z}}function Ya(n,a,u,f){var g=a.width,w=a.o;if(e(n!=null&&a!=null),0>u||0>=f||u+f>w)return null;if(!n.Cc){if(n.ga==null){var A;if(n.ga=new da,(A=n.ga==null)||(A=a.width*a.o,e(n.Gb.length==0),n.Gb=o(A),n.Uc=0,n.Gb==null?A=0:(n.mb=n.Gb,n.nb=n.Uc,n.rc=null,A=1),A=!A),!A){A=n.ga;var k=n.Fa,N=n.P,_=n.qc,z=n.mb,X=n.nb,Z=N+1,J=_-1,vn=A.l;if(e(k!=null&&z!=null&&a!=null),Li[0]=null,Li[1]=Bi,Li[2]=Ja,Li[3]=yi,A.ca=z,A.tb=X,A.c=a.width,A.i=a.height,e(0<A.c&&0<A.i),1>=_)a=0;else if(A.$a=k[N+0]>>0&3,A.Z=k[N+0]>>2&3,A.Lc=k[N+0]>>4&3,N=k[N+0]>>6&3,0>A.$a||1<A.$a||4<=A.Z||1<A.Lc||N)a=0;else if(vn.put=Gt,vn.ac=Ve,vn.bc=Vt,vn.ma=A,vn.width=a.width,vn.height=a.height,vn.Da=a.Da,vn.v=a.v,vn.va=a.va,vn.j=a.j,vn.o=a.o,A.$a)n:{e(A.$a==1),a=bt();e:for(;;){if(a==null){a=0;break n}if(e(A!=null),A.mc=a,a.c=A.c,a.i=A.i,a.l=A.l,a.l.ma=A,a.l.width=A.c,a.l.height=A.i,a.a=0,$(a.m,k,Z,J),!Yt(A.c,A.i,1,a,null)||(a.ab==1&&a.gc[0].hc==3&&ai(a.s)?(A.ic=1,k=a.c*a.i,a.Ta=null,a.Ua=0,a.V=o(k),a.Ba=0,a.V==null?(a.a=1,a=0):a=1):(A.ic=0,a=Fi(a,A.c)),!a))break e;a=1;break n}A.mc=null,a=0}else a=J>=A.c*A.i;A=!a}if(A)return null;n.ga.Lc!=1?n.Ga=0:f=w-u}e(n.ga!=null),e(u+f<=w);n:{if(a=(k=n.ga).c,w=k.l.o,k.$a==0){if(Z=n.rc,J=n.Vc,vn=n.Fa,N=n.P+1+u*a,_=n.mb,z=n.nb+u*a,e(N<=n.P+n.qc),k.Z!=0)for(e(Li[k.Z]!=null),A=0;A<f;++A)Li[k.Z](Z,J,vn,N,_,z,a),Z=_,J=z,z+=a,N+=a;else for(A=0;A<f;++A)r(_,z,vn,N,a),Z=_,J=z,z+=a,N+=a;n.rc=Z,n.Vc=J}else{if(e(k.mc!=null),a=u+f,e((A=k.mc)!=null),e(a<=A.i),A.C>=a)a=1;else if(k.ic||K(),k.ic){k=A.V,Z=A.Ba,J=A.c;var on=A.i,H=(vn=1,N=A.$/J,_=A.$%J,z=A.m,X=A.s,A.$),V=J*on,gn=J*a,bn=X.wc,yn=H<gn?Re(X,_,N):null;e(H<=V),e(a<=on),e(ai(X));e:for(;;){for(;!z.h&&H<gn;){if(_&bn||(yn=Re(X,_,N)),e(yn!=null),Y(z),256>(on=ot(yn.G[0],yn.H[0],z)))k[Z+H]=on,++H,++_>=J&&(_=0,++N<=a&&!(N%16)&&Ot(A,N));else{if(!(280>on)){vn=0;break e}on=It(on-256,z);var Rn,Sn=ot(yn.G[4],yn.H[4],z);if(Y(z),!(H>=(Sn=Wt(J,Sn=It(Sn,z)))&&V-H>=on)){vn=0;break e}for(Rn=0;Rn<on;++Rn)k[Z+H+Rn]=k[Z+H+Rn-Sn];for(H+=on,_+=on;_>=J;)_-=J,++N<=a&&!(N%16)&&Ot(A,N);H<gn&&_&bn&&(yn=Re(X,_,N))}e(z.h==R(z))}Ot(A,N>a?a:N);break e}!vn||z.h&&H<V?(vn=0,A.a=z.h?5:3):A.$=H,a=vn}else a=Mt(A,A.V,A.Ba,A.c,A.i,a,$i);if(!a){f=0;break n}}u+f>=w&&(n.Cc=1),f=1}if(!f)return null;if(n.Cc&&((f=n.ga)!=null&&(f.mc=null),n.ga=null,0<n.Ga))return alert("todo:WebPDequantizeLevels"),null}return n.nb+u*g}function s(n,a,u,f,g,w){for(;0<g--;){var A,k=n,N=a+(u?1:0),_=n,z=a+(u?0:3);for(A=0;A<f;++A){var X=_[z+4*A];X!=255&&(X*=32897,k[N+4*A+0]=k[N+4*A+0]*X>>23,k[N+4*A+1]=k[N+4*A+1]*X>>23,k[N+4*A+2]=k[N+4*A+2]*X>>23)}a+=w}}function y(n,a,u,f,g){for(;0<f--;){var w;for(w=0;w<u;++w){var A=n[a+2*w+0],k=15&(_=n[a+2*w+1]),N=4369*k,_=(240&_|_>>4)*N>>16;n[a+2*w+0]=(240&A|A>>4)*N>>16&240|(15&A|A<<4)*N>>16>>4&15,n[a+2*w+1]=240&_|k}a+=g}}function M(n,a,u,f,g,w,A,k){var N,_,z=255;for(_=0;_<g;++_){for(N=0;N<f;++N){var X=n[a+N];w[A+4*N]=X,z&=X}a+=u,A+=k}return z!=255}function T(n,a,u,f,g){var w;for(w=0;w<g;++w)u[f+w]=n[a+w]>>8}function K(){Lt=s,be=y,we=M,Oe=T}function ln(n,a,u){q[n]=function(f,g,w,A,k,N,_,z,X,Z,J,vn,on,H,V,gn,bn){var yn,Rn=bn-1>>1,Sn=k[N+0]|_[z+0]<<16,Bn=X[Z+0]|J[vn+0]<<16;e(f!=null);var Pn=3*Sn+Bn+131074>>2;for(a(f[g+0],255&Pn,Pn>>16,on,H),w!=null&&(Pn=3*Bn+Sn+131074>>2,a(w[A+0],255&Pn,Pn>>16,V,gn)),yn=1;yn<=Rn;++yn){var ce=k[N+yn]|_[z+yn]<<16,de=X[Z+yn]|J[vn+yn]<<16,oe=Sn+ce+Bn+de+524296,ie=oe+2*(ce+Bn)>>3;Pn=ie+Sn>>1,Sn=(oe=oe+2*(Sn+de)>>3)+ce>>1,a(f[g+2*yn-1],255&Pn,Pn>>16,on,H+(2*yn-1)*u),a(f[g+2*yn-0],255&Sn,Sn>>16,on,H+(2*yn-0)*u),w!=null&&(Pn=oe+Bn>>1,Sn=ie+de>>1,a(w[A+2*yn-1],255&Pn,Pn>>16,V,gn+(2*yn-1)*u),a(w[A+2*yn+0],255&Sn,Sn>>16,V,gn+(2*yn+0)*u)),Sn=ce,Bn=de}1&bn||(Pn=3*Sn+Bn+131074>>2,a(f[g+bn-1],255&Pn,Pn>>16,on,H+(bn-1)*u),w!=null&&(Pn=3*Bn+Sn+131074>>2,a(w[A+bn-1],255&Pn,Pn>>16,V,gn+(bn-1)*u)))}}function wn(){Nt[zr]=dl,Nt[Hr]=Us,Nt[Ms]=hl,Nt[Gr]=js,Nt[Vr]=Ts,Nt[Wo]=Bs,Nt[Ds]=fl,Nt[Jo]=Us,Nt[Yo]=js,Nt[Wr]=Ts,Nt[Ko]=Bs}function En(n){return n&~pl?0>n?0:255:n>>qs}function Tn(n,a){return En((19077*n>>8)+(26149*a>>8)-14234)}function $n(n,a,u){return En((19077*n>>8)-(6419*a>>8)-(13320*u>>8)+8708)}function Kn(n,a){return En((19077*n>>8)+(33050*a>>8)-17685)}function ae(n,a,u,f,g){f[g+0]=Tn(n,u),f[g+1]=$n(n,a,u),f[g+2]=Kn(n,a)}function Le(n,a,u,f,g){f[g+0]=Kn(n,a),f[g+1]=$n(n,a,u),f[g+2]=Tn(n,u)}function Se(n,a,u,f,g){var w=$n(n,a,u);a=w<<3&224|Kn(n,a)>>3,f[g+0]=248&Tn(n,u)|w>>5,f[g+1]=a}function Fe(n,a,u,f,g){var w=240&Kn(n,a)|15;f[g+0]=240&Tn(n,u)|$n(n,a,u)>>4,f[g+1]=w}function Xe(n,a,u,f,g){f[g+0]=255,ae(n,a,u,f,g+1)}function qe(n,a,u,f,g){Le(n,a,u,f,g),f[g+3]=255}function Rt(n,a,u,f,g){ae(n,a,u,f,g),f[g+3]=255}function pt(n,a){return 0>n?0:n>a?a:n}function Zt(n,a,u){q[n]=function(f,g,w,A,k,N,_,z,X){for(var Z=z+(-2&X)*u;z!=Z;)a(f[g+0],w[A+0],k[N+0],_,z),a(f[g+1],w[A+0],k[N+0],_,z+u),g+=2,++A,++N,z+=2*u;1&X&&a(f[g+0],w[A+0],k[N+0],_,z)}}function Rr(n,a,u){return u==0?n==0?a==0?6:5:a==0?4:0:u}function Ka(n,a,u,f,g){switch(n>>>30){case 3:li(a,u,f,g,0);break;case 2:_e(a,u,f,g);break;case 1:at(a,u,f,g)}}function Xa(n,a){var u,f,g=a.M,w=a.Nb,A=n.oc,k=n.pc+40,N=n.oc,_=n.pc+584,z=n.oc,X=n.pc+600;for(u=0;16>u;++u)A[k+32*u-1]=129;for(u=0;8>u;++u)N[_+32*u-1]=129,z[X+32*u-1]=129;for(0<g?A[k-1-32]=N[_-1-32]=z[X-1-32]=129:(c(A,k-32-1,127,21),c(N,_-32-1,127,9),c(z,X-32-1,127,9)),f=0;f<n.za;++f){var Z=a.ya[a.aa+f];if(0<f){for(u=-1;16>u;++u)r(A,k+32*u-4,A,k+32*u+12,4);for(u=-1;8>u;++u)r(N,_+32*u-4,N,_+32*u+4,4),r(z,X+32*u-4,z,X+32*u+4,4)}var J=n.Gd,vn=n.Hd+f,on=Z.ad,H=Z.Hc;if(0<g&&(r(A,k-32,J[vn].y,0,16),r(N,_-32,J[vn].f,0,8),r(z,X-32,J[vn].ea,0,8)),Z.Za){var V=A,gn=k-32+16;for(0<g&&(f>=n.za-1?c(V,gn,J[vn].y[15],4):r(V,gn,J[vn+1].y,0,4)),u=0;4>u;u++)V[gn+128+u]=V[gn+256+u]=V[gn+384+u]=V[gn+0+u];for(u=0;16>u;++u,H<<=2)V=A,gn=k+Hs[u],Ft[Z.Ob[u]](V,gn),Ka(H,on,16*+u,V,gn)}else if(V=Rr(f,g,Z.Ob[0]),xi[V](A,k),H!=0)for(u=0;16>u;++u,H<<=2)Ka(H,on,16*+u,A,k+Hs[u]);for(u=Z.Gc,V=Rr(f,g,Z.Dd),di[V](N,_),di[V](z,X),H=on,V=N,gn=_,255&(Z=u>>0)&&(170&Z?er(H,256,V,gn):At(H,256,V,gn)),Z=z,H=X,255&(u>>=8)&&(170&u?er(on,320,Z,H):At(on,320,Z,H)),g<n.Ub-1&&(r(J[vn].y,0,A,k+480,16),r(J[vn].f,0,N,_+224,8),r(J[vn].ea,0,z,X+224,8)),u=8*w*n.B,J=n.sa,vn=n.ta+16*f+16*w*n.R,on=n.qa,Z=n.ra+8*f+u,H=n.Ha,V=n.Ia+8*f+u,u=0;16>u;++u)r(J,vn+u*n.R,A,k+32*u,16);for(u=0;8>u;++u)r(on,Z+u*n.B,N,_+32*u,8),r(H,V+u*n.B,z,X+32*u,8)}}function ha(n,a,u,f,g,w,A,k,N){var _=[0],z=[0],X=0,Z=N!=null?N.kd:0,J=N??new Va;if(n==null||12>u)return 7;J.data=n,J.w=a,J.ha=u,a=[a],u=[u],J.gb=[J.gb];n:{var vn=a,on=u,H=J.gb;if(e(n!=null),e(on!=null),e(H!=null),H[0]=0,12<=on[0]&&!t(n,vn[0],"RIFF")){if(t(n,vn[0]+8,"WEBP")){H=3;break n}var V=Cn(n,vn[0]+4);if(12>V||4294967286<V){H=3;break n}if(Z&&V>on[0]-8){H=7;break n}H[0]=V,vn[0]+=12,on[0]-=12}H=0}if(H!=0)return H;for(V=0<J.gb[0],u=u[0];;){n:{var gn=n;on=a,H=u;var bn=_,yn=z,Rn=vn=[0];if((Pn=X=[X])[0]=0,8>H[0])H=7;else{if(!t(gn,on[0],"VP8X")){if(Cn(gn,on[0]+4)!=10){H=3;break n}if(18>H[0]){H=7;break n}var Sn=Cn(gn,on[0]+8),Bn=1+_n(gn,on[0]+12);if(2147483648<=Bn*(gn=1+_n(gn,on[0]+15))){H=3;break n}Rn!=null&&(Rn[0]=Sn),bn!=null&&(bn[0]=Bn),yn!=null&&(yn[0]=gn),on[0]+=18,H[0]-=18,Pn[0]=1}H=0}}if(X=X[0],vn=vn[0],H!=0)return H;if(on=!!(2&vn),!V&&X)return 3;if(w!=null&&(w[0]=!!(16&vn)),A!=null&&(A[0]=on),k!=null&&(k[0]=0),A=_[0],vn=z[0],X&&on&&N==null){H=0;break}if(4>u){H=7;break}if(V&&X||!V&&!X&&!t(n,a[0],"ALPH")){u=[u],J.na=[J.na],J.P=[J.P],J.Sa=[J.Sa];n:{Sn=n,H=a,V=u;var Pn=J.gb;bn=J.na,yn=J.P,Rn=J.Sa,Bn=22,e(Sn!=null),e(V!=null),gn=H[0];var ce=V[0];for(e(bn!=null),e(Rn!=null),bn[0]=null,yn[0]=null,Rn[0]=0;;){if(H[0]=gn,V[0]=ce,8>ce){H=7;break n}var de=Cn(Sn,gn+4);if(4294967286<de){H=3;break n}var oe=8+de+1&-2;if(Bn+=oe,0<Pn&&Bn>Pn){H=3;break n}if(!t(Sn,gn,"VP8 ")||!t(Sn,gn,"VP8L")){H=0;break n}if(ce[0]<oe){H=7;break n}t(Sn,gn,"ALPH")||(bn[0]=Sn,yn[0]=gn+8,Rn[0]=de),gn+=oe,ce-=oe}}if(u=u[0],J.na=J.na[0],J.P=J.P[0],J.Sa=J.Sa[0],H!=0)break}u=[u],J.Ja=[J.Ja],J.xa=[J.xa];n:if(Pn=n,H=a,V=u,bn=J.gb[0],yn=J.Ja,Rn=J.xa,Sn=H[0],gn=!t(Pn,Sn,"VP8 "),Bn=!t(Pn,Sn,"VP8L"),e(Pn!=null),e(V!=null),e(yn!=null),e(Rn!=null),8>V[0])H=7;else{if(gn||Bn){if(Pn=Cn(Pn,Sn+4),12<=bn&&Pn>bn-12){H=3;break n}if(Z&&Pn>V[0]-8){H=7;break n}yn[0]=Pn,H[0]+=8,V[0]-=8,Rn[0]=Bn}else Rn[0]=5<=V[0]&&Pn[Sn+0]==47&&!(Pn[Sn+4]>>5),yn[0]=V[0];H=0}if(u=u[0],J.Ja=J.Ja[0],J.xa=J.xa[0],a=a[0],H!=0)break;if(4294967286<J.Ja)return 3;if(k==null||on||(k[0]=J.xa?2:1),A=[A],vn=[vn],J.xa){if(5>u){H=7;break}k=A,Z=vn,on=w,n==null||5>u?n=0:5<=u&&n[a+0]==47&&!(n[a+4]>>5)?(V=[0],Pn=[0],bn=[0],$(yn=new L,n,a,u),qn(yn,V,Pn,bn)?(k!=null&&(k[0]=V[0]),Z!=null&&(Z[0]=Pn[0]),on!=null&&(on[0]=bn[0]),n=1):n=0):n=0}else{if(10>u){H=7;break}k=vn,n==null||10>u||!br(n,a+3,u-3)?n=0:(Z=n[a+0]|n[a+1]<<8|n[a+2]<<16,on=16383&(n[a+7]<<8|n[a+6]),n=16383&(n[a+9]<<8|n[a+8]),1&Z||3<(Z>>1&7)||!(Z>>4&1)||Z>>5>=J.Ja||!on||!n?n=0:(A&&(A[0]=on),k&&(k[0]=n),n=1))}if(!n||(A=A[0],vn=vn[0],X&&(_[0]!=A||z[0]!=vn)))return 3;N!=null&&(N[0]=J,N.offset=a-N.w,e(4294967286>a-N.w),e(N.offset==N.ha-u));break}return H==0||H==7&&X&&N==null?(w!=null&&(w[0]|=J.na!=null&&0<J.na.length),f!=null&&(f[0]=A),g!=null&&(g[0]=vn),0):H}function Za(n,a,u){var f=a.width,g=a.height,w=0,A=0,k=f,N=g;if(a.Da=n!=null&&0<n.Da,a.Da&&(k=n.cd,N=n.bd,w=n.v,A=n.j,11>u||(w&=-2,A&=-2),0>w||0>A||0>=k||0>=N||w+k>f||A+N>g))return 0;if(a.v=w,a.j=A,a.va=w+k,a.o=A+N,a.U=k,a.T=N,a.da=n!=null&&0<n.da,a.da){if(!Zn(k,N,u=[n.ib],w=[n.hb]))return 0;a.ib=u[0],a.hb=w[0]}return a.ob=n!=null&&n.ob,a.Kb=n==null||!n.Sd,a.da&&(a.ob=a.ib<3*f/4&&a.hb<3*g/4,a.Kb=0),1}function $a(n){if(n==null)return 2;if(11>n.S){var a=n.f.RGBA;a.fb+=(n.height-1)*a.A,a.A=-a.A}else a=n.f.kb,n=n.height,a.O+=(n-1)*a.fa,a.fa=-a.fa,a.N+=(n-1>>1)*a.Ab,a.Ab=-a.Ab,a.W+=(n-1>>1)*a.Db,a.Db=-a.Db,a.F!=null&&(a.J+=(n-1)*a.lb,a.lb=-a.lb);return 0}function fa(n,a,u,f){if(f==null||0>=n||0>=a)return 2;if(u!=null){if(u.Da){var g=u.cd,w=u.bd,A=-2&u.v,k=-2&u.j;if(0>A||0>k||0>=g||0>=w||A+g>n||k+w>a)return 2;n=g,a=w}if(u.da){if(!Zn(n,a,g=[u.ib],w=[u.hb]))return 2;n=g[0],a=w[0]}}f.width=n,f.height=a;n:{var N=f.width,_=f.height;if(n=f.S,0>=N||0>=_||!(n>=zr&&13>n))n=2;else{if(0>=f.Rd&&f.sd==null){A=w=g=a=0;var z=(k=N*Gs[n])*_;if(11>n||(w=(_+1)/2*(a=(N+1)/2),n==12&&(A=(g=N)*_)),(_=o(z+2*w+A))==null){n=1;break n}f.sd=_,11>n?((N=f.f.RGBA).eb=_,N.fb=0,N.A=k,N.size=z):((N=f.f.kb).y=_,N.O=0,N.fa=k,N.Fd=z,N.f=_,N.N=0+z,N.Ab=a,N.Cd=w,N.ea=_,N.W=0+z+w,N.Db=a,N.Ed=w,n==12&&(N.F=_,N.J=0+z+2*w),N.Tc=A,N.lb=g)}if(a=1,g=f.S,w=f.width,A=f.height,g>=zr&&13>g)if(11>g)n=f.f.RGBA,a&=(k=Math.abs(n.A))*(A-1)+w<=n.size,a&=k>=w*Gs[g],a&=n.eb!=null;else{n=f.f.kb,k=(w+1)/2,z=(A+1)/2,N=Math.abs(n.fa),_=Math.abs(n.Ab);var X=Math.abs(n.Db),Z=Math.abs(n.lb),J=Z*(A-1)+w;a&=N*(A-1)+w<=n.Fd,a&=_*(z-1)+k<=n.Cd,a=(a&=X*(z-1)+k<=n.Ed)&N>=w&_>=k&X>=k,a&=n.y!=null,a&=n.f!=null,a&=n.ea!=null,g==12&&(a&=Z>=w,a&=J<=n.Tc,a&=n.F!=null)}else a=0;n=a?0:2}}return n!=0||u!=null&&u.fd&&(n=$a(f)),n}var We=64,pa=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535,131071,262143,524287,1048575,2097151,4194303,8388607,16777215],ma=24,ga=32,Qa=8,ct=[0,0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7];Nn("Predictor0","PredictorAdd0"),q.Predictor0=function(){return 4278190080},q.Predictor1=function(n){return n},q.Predictor2=function(n,a,u){return a[u+0]},q.Predictor3=function(n,a,u){return a[u+1]},q.Predictor4=function(n,a,u){return a[u-1]},q.Predictor5=function(n,a,u){return In(In(n,a[u+1]),a[u+0])},q.Predictor6=function(n,a,u){return In(n,a[u-1])},q.Predictor7=function(n,a,u){return In(n,a[u+0])},q.Predictor8=function(n,a,u){return In(a[u-1],a[u+0])},q.Predictor9=function(n,a,u){return In(a[u+0],a[u+1])},q.Predictor10=function(n,a,u){return In(In(n,a[u-1]),In(a[u+0],a[u+1]))},q.Predictor11=function(n,a,u){var f=a[u+0];return 0>=ne(f>>24&255,n>>24&255,(a=a[u-1])>>24&255)+ne(f>>16&255,n>>16&255,a>>16&255)+ne(f>>8&255,n>>8&255,a>>8&255)+ne(255&f,255&n,255&a)?f:n},q.Predictor12=function(n,a,u){var f=a[u+0];return(jn((n>>24&255)+(f>>24&255)-((a=a[u-1])>>24&255))<<24|jn((n>>16&255)+(f>>16&255)-(a>>16&255))<<16|jn((n>>8&255)+(f>>8&255)-(a>>8&255))<<8|jn((255&n)+(255&f)-(255&a)))>>>0},q.Predictor13=function(n,a,u){var f=a[u-1];return(Jn((n=In(n,a[u+0]))>>24&255,f>>24&255)<<24|Jn(n>>16&255,f>>16&255)<<16|Jn(n>>8&255,f>>8&255)<<8|Jn(n>>0&255,f>>0&255))>>>0};var Go=q.PredictorAdd0;q.PredictorAdd1=ee,Nn("Predictor2","PredictorAdd2"),Nn("Predictor3","PredictorAdd3"),Nn("Predictor4","PredictorAdd4"),Nn("Predictor5","PredictorAdd5"),Nn("Predictor6","PredictorAdd6"),Nn("Predictor7","PredictorAdd7"),Nn("Predictor8","PredictorAdd8"),Nn("Predictor9","PredictorAdd9"),Nn("Predictor10","PredictorAdd10"),Nn("Predictor11","PredictorAdd11"),Nn("Predictor12","PredictorAdd12"),Nn("Predictor13","PredictorAdd13");var nr=q.PredictorAdd2;te("ColorIndexInverseTransform","MapARGB","32b",function(n){return n>>8&255},function(n){return n}),te("VP8LColorIndexInverseTransformAlpha","MapAlpha","8b",function(n){return n},function(n){return n>>8&255});var Fr,wt=q.ColorIndexInverseTransform,ya=q.MapARGB,Ur=q.VP8LColorIndexInverseTransformAlpha,jr=q.MapAlpha,vi=q.VP8LPredictorsAdd=[];vi.length=16,(q.VP8LPredictors=[]).length=16,(q.VP8LPredictorsAdd_C=[]).length=16,(q.VP8LPredictors_C=[]).length=16;var qi,lt,it,bi,si,ci,va,li,_e,er,at,At,ba,Tr,tr,zi,Hi,wi,Gi,wa,Vi,Ai,ir,xt,Lt,be,we,Oe,Be=o(511),ui=o(2041),ar=o(225),Aa=o(767),Br=0,Vo=ui,qr=ar,mt=Aa,kt=Be,zr=0,Hr=1,Ms=2,Gr=3,Vr=4,Wo=5,Ds=6,Jo=7,Yo=8,Wr=9,Ko=10,Zc=[2,3,7],$c=[3,3,11],Es=[280,256,256,256,40],Qc=[0,1,1,1,0],nl=[17,18,0,1,2,3,4,5,16,6,7,8,9,10,11,12,13,14,15],el=[24,7,23,25,40,6,39,41,22,26,38,42,56,5,55,57,21,27,54,58,37,43,72,4,71,73,20,28,53,59,70,74,36,44,88,69,75,52,60,3,87,89,19,29,86,90,35,45,68,76,85,91,51,61,104,2,103,105,18,30,102,106,34,46,84,92,67,77,101,107,50,62,120,1,119,121,83,93,17,31,100,108,66,78,118,122,33,47,117,123,49,63,99,109,82,94,0,116,124,65,79,16,32,98,110,48,115,125,81,95,64,114,126,97,111,80,113,127,96,112],tl=[2954,2956,2958,2962,2970,2986,3018,3082,3212,3468,3980,5004],il=8,Xo=[4,5,6,7,8,9,10,10,11,12,13,14,15,16,17,17,18,19,20,20,21,21,22,22,23,23,24,25,25,26,27,28,29,30,31,32,33,34,35,36,37,37,38,39,40,41,42,43,44,45,46,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,76,77,78,79,80,81,82,83,84,85,86,87,88,89,91,93,95,96,98,100,101,102,104,106,108,110,112,114,116,118,122,124,126,128,130,132,134,136,138,140,143,145,148,151,154,157],Zo=[4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,60,62,64,66,68,70,72,74,76,78,80,82,84,86,88,90,92,94,96,98,100,102,104,106,108,110,112,114,116,119,122,125,128,131,134,137,140,143,146,149,152,155,158,161,164,167,170,173,177,181,185,189,193,197,201,205,209,213,217,221,225,229,234,239,245,249,254,259,264,269,274,279,284],rr=null,al=[[173,148,140,0],[176,155,140,135,0],[180,157,141,134,130,0],[254,254,243,230,196,177,153,140,133,130,129,0]],rl=[0,1,4,8,5,2,3,6,9,12,13,10,7,11,14,15],Rs=[-0,1,-1,2,-2,3,4,6,-3,5,-4,-5,-6,7,-7,8,-8,-9],ol=[[[[128,128,128,128,128,128,128,128,128,128,128],[128,128,128,128,128,128,128,128,128,128,128],[128,128,128,128,128,128,128,128,128,128,128]],[[253,136,254,255,228,219,128,128,128,128,128],[189,129,242,255,227,213,255,219,128,128,128],[106,126,227,252,214,209,255,255,128,128,128]],[[1,98,248,255,236,226,255,255,128,128,128],[181,133,238,254,221,234,255,154,128,128,128],[78,134,202,247,198,180,255,219,128,128,128]],[[1,185,249,255,243,255,128,128,128,128,128],[184,150,247,255,236,224,128,128,128,128,128],[77,110,216,255,236,230,128,128,128,128,128]],[[1,101,251,255,241,255,128,128,128,128,128],[170,139,241,252,236,209,255,255,128,128,128],[37,116,196,243,228,255,255,255,128,128,128]],[[1,204,254,255,245,255,128,128,128,128,128],[207,160,250,255,238,128,128,128,128,128,128],[102,103,231,255,211,171,128,128,128,128,128]],[[1,152,252,255,240,255,128,128,128,128,128],[177,135,243,255,234,225,128,128,128,128,128],[80,129,211,255,194,224,128,128,128,128,128]],[[1,1,255,128,128,128,128,128,128,128,128],[246,1,255,128,128,128,128,128,128,128,128],[255,128,128,128,128,128,128,128,128,128,128]]],[[[198,35,237,223,193,187,162,160,145,155,62],[131,45,198,221,172,176,220,157,252,221,1],[68,47,146,208,149,167,221,162,255,223,128]],[[1,149,241,255,221,224,255,255,128,128,128],[184,141,234,253,222,220,255,199,128,128,128],[81,99,181,242,176,190,249,202,255,255,128]],[[1,129,232,253,214,197,242,196,255,255,128],[99,121,210,250,201,198,255,202,128,128,128],[23,91,163,242,170,187,247,210,255,255,128]],[[1,200,246,255,234,255,128,128,128,128,128],[109,178,241,255,231,245,255,255,128,128,128],[44,130,201,253,205,192,255,255,128,128,128]],[[1,132,239,251,219,209,255,165,128,128,128],[94,136,225,251,218,190,255,255,128,128,128],[22,100,174,245,186,161,255,199,128,128,128]],[[1,182,249,255,232,235,128,128,128,128,128],[124,143,241,255,227,234,128,128,128,128,128],[35,77,181,251,193,211,255,205,128,128,128]],[[1,157,247,255,236,231,255,255,128,128,128],[121,141,235,255,225,227,255,255,128,128,128],[45,99,188,251,195,217,255,224,128,128,128]],[[1,1,251,255,213,255,128,128,128,128,128],[203,1,248,255,255,128,128,128,128,128,128],[137,1,177,255,224,255,128,128,128,128,128]]],[[[253,9,248,251,207,208,255,192,128,128,128],[175,13,224,243,193,185,249,198,255,255,128],[73,17,171,221,161,179,236,167,255,234,128]],[[1,95,247,253,212,183,255,255,128,128,128],[239,90,244,250,211,209,255,255,128,128,128],[155,77,195,248,188,195,255,255,128,128,128]],[[1,24,239,251,218,219,255,205,128,128,128],[201,51,219,255,196,186,128,128,128,128,128],[69,46,190,239,201,218,255,228,128,128,128]],[[1,191,251,255,255,128,128,128,128,128,128],[223,165,249,255,213,255,128,128,128,128,128],[141,124,248,255,255,128,128,128,128,128,128]],[[1,16,248,255,255,128,128,128,128,128,128],[190,36,230,255,236,255,128,128,128,128,128],[149,1,255,128,128,128,128,128,128,128,128]],[[1,226,255,128,128,128,128,128,128,128,128],[247,192,255,128,128,128,128,128,128,128,128],[240,128,255,128,128,128,128,128,128,128,128]],[[1,134,252,255,255,128,128,128,128,128,128],[213,62,250,255,255,128,128,128,128,128,128],[55,93,255,128,128,128,128,128,128,128,128]],[[128,128,128,128,128,128,128,128,128,128,128],[128,128,128,128,128,128,128,128,128,128,128],[128,128,128,128,128,128,128,128,128,128,128]]],[[[202,24,213,235,186,191,220,160,240,175,255],[126,38,182,232,169,184,228,174,255,187,128],[61,46,138,219,151,178,240,170,255,216,128]],[[1,112,230,250,199,191,247,159,255,255,128],[166,109,228,252,211,215,255,174,128,128,128],[39,77,162,232,172,180,245,178,255,255,128]],[[1,52,220,246,198,199,249,220,255,255,128],[124,74,191,243,183,193,250,221,255,255,128],[24,71,130,219,154,170,243,182,255,255,128]],[[1,182,225,249,219,240,255,224,128,128,128],[149,150,226,252,216,205,255,171,128,128,128],[28,108,170,242,183,194,254,223,255,255,128]],[[1,81,230,252,204,203,255,192,128,128,128],[123,102,209,247,188,196,255,233,128,128,128],[20,95,153,243,164,173,255,203,128,128,128]],[[1,222,248,255,216,213,128,128,128,128,128],[168,175,246,252,235,205,255,255,128,128,128],[47,116,215,255,211,212,255,255,128,128,128]],[[1,121,236,253,212,214,255,255,128,128,128],[141,84,213,252,201,202,255,219,128,128,128],[42,80,160,240,162,185,255,205,128,128,128]],[[1,1,255,128,128,128,128,128,128,128,128],[244,1,255,128,128,128,128,128,128,128,128],[238,1,255,128,128,128,128,128,128,128,128]]]],sl=[[[231,120,48,89,115,113,120,152,112],[152,179,64,126,170,118,46,70,95],[175,69,143,80,85,82,72,155,103],[56,58,10,171,218,189,17,13,152],[114,26,17,163,44,195,21,10,173],[121,24,80,195,26,62,44,64,85],[144,71,10,38,171,213,144,34,26],[170,46,55,19,136,160,33,206,71],[63,20,8,114,114,208,12,9,226],[81,40,11,96,182,84,29,16,36]],[[134,183,89,137,98,101,106,165,148],[72,187,100,130,157,111,32,75,80],[66,102,167,99,74,62,40,234,128],[41,53,9,178,241,141,26,8,107],[74,43,26,146,73,166,49,23,157],[65,38,105,160,51,52,31,115,128],[104,79,12,27,217,255,87,17,7],[87,68,71,44,114,51,15,186,23],[47,41,14,110,182,183,21,17,194],[66,45,25,102,197,189,23,18,22]],[[88,88,147,150,42,46,45,196,205],[43,97,183,117,85,38,35,179,61],[39,53,200,87,26,21,43,232,171],[56,34,51,104,114,102,29,93,77],[39,28,85,171,58,165,90,98,64],[34,22,116,206,23,34,43,166,73],[107,54,32,26,51,1,81,43,31],[68,25,106,22,64,171,36,225,114],[34,19,21,102,132,188,16,76,124],[62,18,78,95,85,57,50,48,51]],[[193,101,35,159,215,111,89,46,111],[60,148,31,172,219,228,21,18,111],[112,113,77,85,179,255,38,120,114],[40,42,1,196,245,209,10,25,109],[88,43,29,140,166,213,37,43,154],[61,63,30,155,67,45,68,1,209],[100,80,8,43,154,1,51,26,71],[142,78,78,16,255,128,34,197,171],[41,40,5,102,211,183,4,1,221],[51,50,17,168,209,192,23,25,82]],[[138,31,36,171,27,166,38,44,229],[67,87,58,169,82,115,26,59,179],[63,59,90,180,59,166,93,73,154],[40,40,21,116,143,209,34,39,175],[47,15,16,183,34,223,49,45,183],[46,17,33,183,6,98,15,32,183],[57,46,22,24,128,1,54,17,37],[65,32,73,115,28,128,23,128,205],[40,3,9,115,51,192,18,6,223],[87,37,9,115,59,77,64,21,47]],[[104,55,44,218,9,54,53,130,226],[64,90,70,205,40,41,23,26,57],[54,57,112,184,5,41,38,166,213],[30,34,26,133,152,116,10,32,134],[39,19,53,221,26,114,32,73,255],[31,9,65,234,2,15,1,118,73],[75,32,12,51,192,255,160,43,51],[88,31,35,67,102,85,55,186,85],[56,21,23,111,59,205,45,37,192],[55,38,70,124,73,102,1,34,98]],[[125,98,42,88,104,85,117,175,82],[95,84,53,89,128,100,113,101,45],[75,79,123,47,51,128,81,171,1],[57,17,5,71,102,57,53,41,49],[38,33,13,121,57,73,26,1,85],[41,10,67,138,77,110,90,47,114],[115,21,2,10,102,255,166,23,6],[101,29,16,10,85,128,101,196,26],[57,18,10,102,102,213,34,20,43],[117,20,15,36,163,128,68,1,26]],[[102,61,71,37,34,53,31,243,192],[69,60,71,38,73,119,28,222,37],[68,45,128,34,1,47,11,245,171],[62,17,19,70,146,85,55,62,70],[37,43,37,154,100,163,85,160,1],[63,9,92,136,28,64,32,201,85],[75,15,9,9,64,255,184,119,16],[86,6,28,5,64,255,25,248,1],[56,8,17,132,137,255,55,116,128],[58,15,20,82,135,57,26,121,40]],[[164,50,31,137,154,133,25,35,218],[51,103,44,131,131,123,31,6,158],[86,40,64,135,148,224,45,183,128],[22,26,17,131,240,154,14,1,209],[45,16,21,91,64,222,7,1,197],[56,21,39,155,60,138,23,102,213],[83,12,13,54,192,255,68,47,28],[85,26,85,85,128,128,32,146,171],[18,11,7,63,144,171,4,4,246],[35,27,10,146,174,171,12,26,128]],[[190,80,35,99,180,80,126,54,45],[85,126,47,87,176,51,41,20,32],[101,75,128,139,118,146,116,128,85],[56,41,15,176,236,85,37,9,62],[71,30,17,119,118,255,17,18,138],[101,38,60,138,55,70,43,26,142],[146,36,19,30,171,255,97,27,20],[138,45,61,62,219,1,81,188,64],[32,41,20,117,151,142,20,21,163],[112,19,12,61,195,128,48,4,24]]],cl=[[[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[176,246,255,255,255,255,255,255,255,255,255],[223,241,252,255,255,255,255,255,255,255,255],[249,253,253,255,255,255,255,255,255,255,255]],[[255,244,252,255,255,255,255,255,255,255,255],[234,254,254,255,255,255,255,255,255,255,255],[253,255,255,255,255,255,255,255,255,255,255]],[[255,246,254,255,255,255,255,255,255,255,255],[239,253,254,255,255,255,255,255,255,255,255],[254,255,254,255,255,255,255,255,255,255,255]],[[255,248,254,255,255,255,255,255,255,255,255],[251,255,254,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,253,254,255,255,255,255,255,255,255,255],[251,254,254,255,255,255,255,255,255,255,255],[254,255,254,255,255,255,255,255,255,255,255]],[[255,254,253,255,254,255,255,255,255,255,255],[250,255,254,255,254,255,255,255,255,255,255],[254,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]]],[[[217,255,255,255,255,255,255,255,255,255,255],[225,252,241,253,255,255,254,255,255,255,255],[234,250,241,250,253,255,253,254,255,255,255]],[[255,254,255,255,255,255,255,255,255,255,255],[223,254,254,255,255,255,255,255,255,255,255],[238,253,254,254,255,255,255,255,255,255,255]],[[255,248,254,255,255,255,255,255,255,255,255],[249,254,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,253,255,255,255,255,255,255,255,255,255],[247,254,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,253,254,255,255,255,255,255,255,255,255],[252,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,254,254,255,255,255,255,255,255,255,255],[253,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,254,253,255,255,255,255,255,255,255,255],[250,255,255,255,255,255,255,255,255,255,255],[254,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]]],[[[186,251,250,255,255,255,255,255,255,255,255],[234,251,244,254,255,255,255,255,255,255,255],[251,251,243,253,254,255,254,255,255,255,255]],[[255,253,254,255,255,255,255,255,255,255,255],[236,253,254,255,255,255,255,255,255,255,255],[251,253,253,254,254,255,255,255,255,255,255]],[[255,254,254,255,255,255,255,255,255,255,255],[254,254,254,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,254,255,255,255,255,255,255,255,255,255],[254,254,255,255,255,255,255,255,255,255,255],[254,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[254,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]]],[[[248,255,255,255,255,255,255,255,255,255,255],[250,254,252,254,255,255,255,255,255,255,255],[248,254,249,253,255,255,255,255,255,255,255]],[[255,253,253,255,255,255,255,255,255,255,255],[246,253,253,255,255,255,255,255,255,255,255],[252,254,251,254,254,255,255,255,255,255,255]],[[255,254,252,255,255,255,255,255,255,255,255],[248,254,253,255,255,255,255,255,255,255,255],[253,255,254,254,255,255,255,255,255,255,255]],[[255,251,254,255,255,255,255,255,255,255,255],[245,251,254,255,255,255,255,255,255,255,255],[253,253,254,255,255,255,255,255,255,255,255]],[[255,251,253,255,255,255,255,255,255,255,255],[252,253,254,255,255,255,255,255,255,255,255],[255,254,255,255,255,255,255,255,255,255,255]],[[255,252,255,255,255,255,255,255,255,255,255],[249,255,254,255,255,255,255,255,255,255,255],[255,255,254,255,255,255,255,255,255,255,255]],[[255,255,253,255,255,255,255,255,255,255,255],[250,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]],[[255,255,255,255,255,255,255,255,255,255,255],[254,255,255,255,255,255,255,255,255,255,255],[255,255,255,255,255,255,255,255,255,255,255]]]],ll=[0,1,2,3,6,4,5,6,6,6,6,6,6,6,6,7,0],xi=[],Ft=[],di=[],ul=1,Fs=2,Li=[],Nt=[];ln("UpsampleRgbLinePair",ae,3),ln("UpsampleBgrLinePair",Le,3),ln("UpsampleRgbaLinePair",Rt,4),ln("UpsampleBgraLinePair",qe,4),ln("UpsampleArgbLinePair",Xe,4),ln("UpsampleRgba4444LinePair",Fe,2),ln("UpsampleRgb565LinePair",Se,2);var dl=q.UpsampleRgbLinePair,hl=q.UpsampleBgrLinePair,Us=q.UpsampleRgbaLinePair,js=q.UpsampleBgraLinePair,Ts=q.UpsampleArgbLinePair,Bs=q.UpsampleRgba4444LinePair,fl=q.UpsampleRgb565LinePair,Jr=16,Yr=1<<Jr-1,or=-227,$o=482,qs=6,pl=(256<<qs)-1,zs=0,ml=o(256),gl=o(256),yl=o(256),vl=o(256),bl=o($o-or),wl=o($o-or);Zt("YuvToRgbRow",ae,3),Zt("YuvToBgrRow",Le,3),Zt("YuvToRgbaRow",Rt,4),Zt("YuvToBgraRow",qe,4),Zt("YuvToArgbRow",Xe,4),Zt("YuvToRgba4444Row",Fe,2),Zt("YuvToRgb565Row",Se,2);var Hs=[0,4,8,12,128,132,136,140,256,260,264,268,384,388,392,396],Kr=[0,2,8],Al=[8,7,6,4,4,2,2,2,1,1,1,1],xl=1;this.WebPDecodeRGBA=function(n,a,u,f,g){var w=Hr,A=new ua,k=new Pt;A.ba=k,k.S=w,k.width=[k.width],k.height=[k.height];var N=k.width,_=k.height,z=new ii;if(z==null||n==null)var X=2;else e(z!=null),X=ha(n,a,u,z.width,z.height,z.Pd,z.Qd,z.format,null);if(X!=0?N=0:(N!=null&&(N[0]=z.width[0]),_!=null&&(_[0]=z.height[0]),N=1),N){k.width=k.width[0],k.height=k.height[0],f!=null&&(f[0]=k.width),g!=null&&(g[0]=k.height);n:{if(f=new ia,(g=new Va).data=n,g.w=a,g.ha=u,g.kd=1,a=[0],e(g!=null),((n=ha(g.data,g.w,g.ha,null,null,null,a,null,g))==0||n==7)&&a[0]&&(n=4),(a=n)==0){if(e(A!=null),f.data=g.data,f.w=g.w+g.offset,f.ha=g.ha-g.offset,f.put=Gt,f.ac=Ve,f.bc=Vt,f.ma=A,g.xa){if((n=bt())==null){A=1;break n}if(function(Z,J){var vn=[0],on=[0],H=[0];e:for(;;){if(Z==null)return 0;if(J==null)return Z.a=2,0;if(Z.l=J,Z.a=0,$(Z.m,J.data,J.w,J.ha),!qn(Z.m,vn,on,H)){Z.a=3;break e}if(Z.xb=Fs,J.width=vn[0],J.height=on[0],!Yt(vn[0],on[0],1,Z,null))break e;return 1}return e(Z.a!=0),0}(n,f)){if(f=(a=fa(f.width,f.height,A.Oa,A.ba))==0){e:{f=n;t:for(;;){if(f==null){f=0;break e}if(e(f.s.yc!=null),e(f.s.Ya!=null),e(0<f.s.Wb),e((u=f.l)!=null),e((g=u.ma)!=null),f.xb!=0){if(f.ca=g.ba,f.tb=g.tb,e(f.ca!=null),!Za(g.Oa,u,Gr)){f.a=2;break t}if(!Fi(f,u.width)||u.da)break t;if((u.da||le(f.ca.S))&&K(),11>f.ca.S||(alert("todo:WebPInitConvertARGBToYUV"),f.ca.f.kb.F!=null&&K()),f.Pb&&0<f.s.ua&&f.s.vb.X==null&&!zn(f.s.vb,f.s.Wa.Xa)){f.a=1;break t}f.xb=0}if(!Mt(f,f.V,f.Ba,f.c,f.i,u.o,Zi))break t;g.Dc=f.Ma,f=1;break e}e(f.a!=0),f=0}f=!f}f&&(a=n.a)}else a=n.a}else{if((n=new No)==null){A=1;break n}if(n.Fa=g.na,n.P=g.P,n.qc=g.Sa,wr(n,f)){if((a=fa(f.width,f.height,A.Oa,A.ba))==0){if(n.Aa=0,u=A.Oa,e((g=n)!=null),u!=null){if(0<(N=0>(N=u.Md)?0:100<N?255:255*N/100)){for(_=z=0;4>_;++_)12>(X=g.pb[_]).lc&&(X.ia=N*Al[0>X.lc?0:X.lc]>>3),z|=X.ia;z&&(alert("todo:VP8InitRandom"),g.ia=1)}g.Ga=u.Id,100<g.Ga?g.Ga=100:0>g.Ga&&(g.Ga=0)}So(n,f)||(a=n.a)}}else a=n.a}a==0&&A.Oa!=null&&A.Oa.fd&&(a=$a(A.ba))}A=a}w=A!=0?null:11>w?k.f.RGBA.eb:k.f.kb.y}else w=null;return w};var Gs=[3,4,3,4,4,2,2,4,4,4,2,1,1]};function m(q,an){for(var mn="",C=0;C<4;C++)mn+=String.fromCharCode(q[an++]);return mn}function v(q,an){return(q[an+0]<<0|q[an+1]<<8|q[an+2]<<16)>>>0}function b(q,an){return(q[an+0]<<0|q[an+1]<<8|q[an+2]<<16|q[an+3]<<24)>>>0}new h;var x=[0],p=[0],D=[],P=new h,U=i,S=function(q,an){var mn={},C=0,I=!1,G=0,j=0;if(mn.frames=[],!function(O,R,B,Y){for(var Q=0;Q<Y;Q++)if(O[R+Q]!=B.charCodeAt(Q))return!0;return!1}(q,an,"RIFF",4)){for(b(q,an+=4),an+=8;an<q.length;){var cn=m(q,an),rn=b(q,an+=4);an+=4;var hn=rn+(1&rn);switch(cn){case"VP8 ":case"VP8L":mn.frames[C]===void 0&&(mn.frames[C]={}),(pn=mn.frames[C]).src_off=I?j:an-8,pn.src_size=G+rn+8,C++,I&&(I=!1,G=0,j=0);break;case"VP8X":(pn=mn.header={}).feature_flags=q[an];var $=an+4;pn.canvas_width=1+v(q,$),$+=3,pn.canvas_height=1+v(q,$),$+=3;break;case"ALPH":I=!0,G=hn+8,j=an-8;break;case"ANIM":(pn=mn.header).bgcolor=b(q,an),$=an+4,pn.loop_count=(Dn=q)[(L=$)+0]<<0|Dn[L+1]<<8,$+=2;break;case"ANMF":var un,pn;(pn=mn.frames[C]={}).offset_x=2*v(q,an),an+=3,pn.offset_y=2*v(q,an),an+=3,pn.width=1+v(q,an),an+=3,pn.height=1+v(q,an),an+=3,pn.duration=v(q,an),an+=3,un=q[an++],pn.dispose=1&un,pn.blend=un>>1&1}cn!="ANMF"&&(an+=hn)}var Dn,L;return mn}}(U,0);S.response=U,S.rgbaoutput=!0,S.dataurl=!1;var E=S.header?S.header:null,W=S.frames?S.frames:null;if(E){E.loop_counter=E.loop_count,x=[E.canvas_height],p=[E.canvas_width];for(var sn=0;sn<W.length&&W[sn].blend!=0;sn++);}var dn=W[0],An=P.WebPDecodeRGBA(U,dn.src_off,dn.src_size,p,x);dn.rgba=An,dn.imgwidth=p[0],dn.imgheight=x[0];for(var nn=0;nn<p[0]*x[0]*4;nn++)D[nn]=An[nn];return this.width=p,this.height=x,this.data=D,this}(function(i){var e=function(){return typeof xs=="function"},t=function(x,p,D,P){var U=4,S=l;switch(P){case i.image_compression.FAST:U=1,S=o;break;case i.image_compression.MEDIUM:U=6,S=d;break;case i.image_compression.SLOW:U=9,S=h}x=r(x,p,D,S);var E=xs(x,{level:U});return i.__addimage__.arrayBufferToBinaryString(E)},r=function(x,p,D,P){for(var U,S,E,W=x.length/p,sn=new Uint8Array(x.length+W),dn=v(),An=0;An<W;An+=1){if(E=An*p,U=x.subarray(E,E+p),P)sn.set(P(U,D,S),E+An);else{for(var nn,q=dn.length,an=[];nn<q;nn+=1)an[nn]=dn[nn](U,D,S);var mn=b(an.concat());sn.set(an[mn],E+An)}S=U}return sn},c=function(x){var p=Array.apply([],x);return p.unshift(0),p},o=function(x,p){var D,P=[],U=x.length;P[0]=1;for(var S=0;S<U;S+=1)D=x[S-p]||0,P[S+1]=x[S]-D+256&255;return P},l=function(x,p,D){var P,U=[],S=x.length;U[0]=2;for(var E=0;E<S;E+=1)P=D&&D[E]||0,U[E+1]=x[E]-P+256&255;return U},d=function(x,p,D){var P,U,S=[],E=x.length;S[0]=3;for(var W=0;W<E;W+=1)P=x[W-p]||0,U=D&&D[W]||0,S[W+1]=x[W]+256-(P+U>>>1)&255;return S},h=function(x,p,D){var P,U,S,E,W=[],sn=x.length;W[0]=4;for(var dn=0;dn<sn;dn+=1)P=x[dn-p]||0,U=D&&D[dn]||0,S=D&&D[dn-p]||0,E=m(P,U,S),W[dn+1]=x[dn]-E+256&255;return W},m=function(x,p,D){if(x===p&&p===D)return x;var P=Math.abs(p-D),U=Math.abs(x-D),S=Math.abs(x+p-D-D);return P<=U&&P<=S?x:U<=S?p:D},v=function(){return[c,o,l,d,h]},b=function(x){var p=x.map(function(D){return D.reduce(function(P,U){return P+Math.abs(U)},0)});return p.indexOf(Math.min.apply(null,p))};i.processPNG=function(x,p,D,P){var U,S,E,W,sn,dn,An,nn,q,an,mn,C,I,G,j,cn=this.decode.FLATE_DECODE,rn="";if(this.__addimage__.isArrayBuffer(x)&&(x=new Uint8Array(x)),this.__addimage__.isArrayBufferView(x)){if(x=(E=new mu(x)).imgData,S=E.bits,U=E.colorSpace,sn=E.colors,[4,6].indexOf(E.colorType)!==-1){if(E.bits===8){q=(nn=E.pixelBitlength==32?new Uint32Array(E.decodePixels().buffer):E.pixelBitlength==16?new Uint16Array(E.decodePixels().buffer):new Uint8Array(E.decodePixels().buffer)).length,mn=new Uint8Array(q*E.colors),an=new Uint8Array(q);var hn,$=E.pixelBitlength-E.bits;for(G=0,j=0;G<q;G++){for(I=nn[G],hn=0;hn<$;)mn[j++]=I>>>hn&255,hn+=E.bits;an[G]=I>>>hn&255}}if(E.bits===16){q=(nn=new Uint32Array(E.decodePixels().buffer)).length,mn=new Uint8Array(q*(32/E.pixelBitlength)*E.colors),an=new Uint8Array(q*(32/E.pixelBitlength)),C=E.colors>1,G=0,j=0;for(var un=0;G<q;)I=nn[G++],mn[j++]=I>>>0&255,C&&(mn[j++]=I>>>16&255,I=nn[G++],mn[j++]=I>>>0&255),an[un++]=I>>>16&255;S=8}P!==i.image_compression.NONE&&e()?(x=t(mn,E.width*E.colors,E.colors,P),An=t(an,E.width,1,P)):(x=mn,An=an,cn=void 0)}if(E.colorType===3&&(U=this.color_spaces.INDEXED,dn=E.palette,E.transparency.indexed)){var pn=E.transparency.indexed,Dn=0;for(G=0,q=pn.length;G<q;++G)Dn+=pn[G];if((Dn/=255)===q-1&&pn.indexOf(0)!==-1)W=[pn.indexOf(0)];else if(Dn!==q){for(nn=E.decodePixels(),an=new Uint8Array(nn.length),G=0,q=nn.length;G<q;G++)an[G]=pn[nn[G]];An=t(an,E.width,1)}}var L=function(O){var R;switch(O){case i.image_compression.FAST:R=11;break;case i.image_compression.MEDIUM:R=13;break;case i.image_compression.SLOW:R=14;break;default:R=12}return R}(P);return cn===this.decode.FLATE_DECODE&&(rn="/Predictor "+L+" "),rn+="/Colors "+sn+" /BitsPerComponent "+S+" /Columns "+E.width,(this.__addimage__.isArrayBuffer(x)||this.__addimage__.isArrayBufferView(x))&&(x=this.__addimage__.arrayBufferToBinaryString(x)),(An&&this.__addimage__.isArrayBuffer(An)||this.__addimage__.isArrayBufferView(An))&&(An=this.__addimage__.arrayBufferToBinaryString(An)),{alias:D,data:x,index:p,filter:cn,decodeParameters:rn,transparency:W,palette:dn,sMask:An,predictor:L,width:E.width,height:E.height,bitsPerComponent:S,colorSpace:U}}}})(Hn.API),function(i){i.processGIF89A=function(e,t,r,c){var o=new gu(e),l=o.width,d=o.height,h=[];o.decodeAndBlitFrameRGBA(0,h);var m={data:h,width:l,height:d},v=new gs(100).encode(m,100);return i.processJPEG.call(this,v,t,r,c)},i.processGIF87A=i.processGIF89A}(Hn.API),Tt.prototype.parseHeader=function(){if(this.fileSize=this.datav.getUint32(this.pos,!0),this.pos+=4,this.reserved=this.datav.getUint32(this.pos,!0),this.pos+=4,this.offset=this.datav.getUint32(this.pos,!0),this.pos+=4,this.headerSize=this.datav.getUint32(this.pos,!0),this.pos+=4,this.width=this.datav.getUint32(this.pos,!0),this.pos+=4,this.height=this.datav.getInt32(this.pos,!0),this.pos+=4,this.planes=this.datav.getUint16(this.pos,!0),this.pos+=2,this.bitPP=this.datav.getUint16(this.pos,!0),this.pos+=2,this.compress=this.datav.getUint32(this.pos,!0),this.pos+=4,this.rawSize=this.datav.getUint32(this.pos,!0),this.pos+=4,this.hr=this.datav.getUint32(this.pos,!0),this.pos+=4,this.vr=this.datav.getUint32(this.pos,!0),this.pos+=4,this.colors=this.datav.getUint32(this.pos,!0),this.pos+=4,this.importantColors=this.datav.getUint32(this.pos,!0),this.pos+=4,this.bitPP===16&&this.is_with_alpha&&(this.bitPP=15),this.bitPP<15){var i=this.colors===0?1<<this.bitPP:this.colors;this.palette=new Array(i);for(var e=0;e<i;e++){var t=this.datav.getUint8(this.pos++,!0),r=this.datav.getUint8(this.pos++,!0),c=this.datav.getUint8(this.pos++,!0),o=this.datav.getUint8(this.pos++,!0);this.palette[e]={red:c,green:r,blue:t,quad:o}}}this.height<0&&(this.height*=-1,this.bottom_up=!1)},Tt.prototype.parseBGR=function(){this.pos=this.offset;try{var i="bit"+this.bitPP,e=this.width*this.height*4;this.data=new Uint8Array(e),this[i]()}catch(t){ve.log("bit decode error:"+t)}},Tt.prototype.bit1=function(){var i,e=Math.ceil(this.width/8),t=e%4;for(i=this.height-1;i>=0;i--){for(var r=this.bottom_up?i:this.height-1-i,c=0;c<e;c++)for(var o=this.datav.getUint8(this.pos++,!0),l=r*this.width*4+8*c*4,d=0;d<8&&8*c+d<this.width;d++){var h=this.palette[o>>7-d&1];this.data[l+4*d]=h.blue,this.data[l+4*d+1]=h.green,this.data[l+4*d+2]=h.red,this.data[l+4*d+3]=255}t!==0&&(this.pos+=4-t)}},Tt.prototype.bit4=function(){for(var i=Math.ceil(this.width/2),e=i%4,t=this.height-1;t>=0;t--){for(var r=this.bottom_up?t:this.height-1-t,c=0;c<i;c++){var o=this.datav.getUint8(this.pos++,!0),l=r*this.width*4+2*c*4,d=o>>4,h=15&o,m=this.palette[d];if(this.data[l]=m.blue,this.data[l+1]=m.green,this.data[l+2]=m.red,this.data[l+3]=255,2*c+1>=this.width)break;m=this.palette[h],this.data[l+4]=m.blue,this.data[l+4+1]=m.green,this.data[l+4+2]=m.red,this.data[l+4+3]=255}e!==0&&(this.pos+=4-e)}},Tt.prototype.bit8=function(){for(var i=this.width%4,e=this.height-1;e>=0;e--){for(var t=this.bottom_up?e:this.height-1-e,r=0;r<this.width;r++){var c=this.datav.getUint8(this.pos++,!0),o=t*this.width*4+4*r;if(c<this.palette.length){var l=this.palette[c];this.data[o]=l.red,this.data[o+1]=l.green,this.data[o+2]=l.blue,this.data[o+3]=255}else this.data[o]=255,this.data[o+1]=255,this.data[o+2]=255,this.data[o+3]=255}i!==0&&(this.pos+=4-i)}},Tt.prototype.bit15=function(){for(var i=this.width%3,e=parseInt("11111",2),t=this.height-1;t>=0;t--){for(var r=this.bottom_up?t:this.height-1-t,c=0;c<this.width;c++){var o=this.datav.getUint16(this.pos,!0);this.pos+=2;var l=(o&e)/e*255|0,d=(o>>5&e)/e*255|0,h=(o>>10&e)/e*255|0,m=o>>15?255:0,v=r*this.width*4+4*c;this.data[v]=h,this.data[v+1]=d,this.data[v+2]=l,this.data[v+3]=m}this.pos+=i}},Tt.prototype.bit16=function(){for(var i=this.width%3,e=parseInt("11111",2),t=parseInt("111111",2),r=this.height-1;r>=0;r--){for(var c=this.bottom_up?r:this.height-1-r,o=0;o<this.width;o++){var l=this.datav.getUint16(this.pos,!0);this.pos+=2;var d=(l&e)/e*255|0,h=(l>>5&t)/t*255|0,m=(l>>11)/e*255|0,v=c*this.width*4+4*o;this.data[v]=m,this.data[v+1]=h,this.data[v+2]=d,this.data[v+3]=255}this.pos+=i}},Tt.prototype.bit24=function(){for(var i=this.height-1;i>=0;i--){for(var e=this.bottom_up?i:this.height-1-i,t=0;t<this.width;t++){var r=this.datav.getUint8(this.pos++,!0),c=this.datav.getUint8(this.pos++,!0),o=this.datav.getUint8(this.pos++,!0),l=e*this.width*4+4*t;this.data[l]=o,this.data[l+1]=c,this.data[l+2]=r,this.data[l+3]=255}this.pos+=this.width%4}},Tt.prototype.bit32=function(){for(var i=this.height-1;i>=0;i--)for(var e=this.bottom_up?i:this.height-1-i,t=0;t<this.width;t++){var r=this.datav.getUint8(this.pos++,!0),c=this.datav.getUint8(this.pos++,!0),o=this.datav.getUint8(this.pos++,!0),l=this.datav.getUint8(this.pos++,!0),d=e*this.width*4+4*t;this.data[d]=o,this.data[d+1]=c,this.data[d+2]=r,this.data[d+3]=l}},Tt.prototype.getData=function(){return this.data},function(i){i.processBMP=function(e,t,r,c){var o=new Tt(e,!1),l=o.width,d=o.height,h={data:o.getData(),width:l,height:d},m=new gs(100).encode(h,100);return i.processJPEG.call(this,m,t,r,c)}}(Hn.API),Sc.prototype.getData=function(){return this.data},function(i){i.processWEBP=function(e,t,r,c){var o=new Sc(e),l=o.width,d=o.height,h={data:o.getData(),width:l,height:d},m=new gs(100).encode(h,100);return i.processJPEG.call(this,m,t,r,c)}}(Hn.API),Hn.API.processRGBA=function(i,e,t){for(var r=i.data,c=r.length,o=new Uint8Array(c/4*3),l=new Uint8Array(c/4),d=0,h=0,m=0;m<c;m+=4){var v=r[m],b=r[m+1],x=r[m+2],p=r[m+3];o[d++]=v,o[d++]=b,o[d++]=x,l[h++]=p}var D=this.__addimage__.arrayBufferToBinaryString(o);return{alpha:this.__addimage__.arrayBufferToBinaryString(l),data:D,index:e,alias:t,colorSpace:"DeviceRGB",bitsPerComponent:8,width:i.width,height:i.height}},Hn.API.setLanguage=function(i){return this.internal.languageSettings===void 0&&(this.internal.languageSettings={},this.internal.languageSettings.isSubscribed=!1),{af:"Afrikaans",sq:"Albanian",ar:"Arabic (Standard)","ar-DZ":"Arabic (Algeria)","ar-BH":"Arabic (Bahrain)","ar-EG":"Arabic (Egypt)","ar-IQ":"Arabic (Iraq)","ar-JO":"Arabic (Jordan)","ar-KW":"Arabic (Kuwait)","ar-LB":"Arabic (Lebanon)","ar-LY":"Arabic (Libya)","ar-MA":"Arabic (Morocco)","ar-OM":"Arabic (Oman)","ar-QA":"Arabic (Qatar)","ar-SA":"Arabic (Saudi Arabia)","ar-SY":"Arabic (Syria)","ar-TN":"Arabic (Tunisia)","ar-AE":"Arabic (U.A.E.)","ar-YE":"Arabic (Yemen)",an:"Aragonese",hy:"Armenian",as:"Assamese",ast:"Asturian",az:"Azerbaijani",eu:"Basque",be:"Belarusian",bn:"Bengali",bs:"Bosnian",br:"Breton",bg:"Bulgarian",my:"Burmese",ca:"Catalan",ch:"Chamorro",ce:"Chechen",zh:"Chinese","zh-HK":"Chinese (Hong Kong)","zh-CN":"Chinese (PRC)","zh-SG":"Chinese (Singapore)","zh-TW":"Chinese (Taiwan)",cv:"Chuvash",co:"Corsican",cr:"Cree",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch (Standard)","nl-BE":"Dutch (Belgian)",en:"English","en-AU":"English (Australia)","en-BZ":"English (Belize)","en-CA":"English (Canada)","en-IE":"English (Ireland)","en-JM":"English (Jamaica)","en-NZ":"English (New Zealand)","en-PH":"English (Philippines)","en-ZA":"English (South Africa)","en-TT":"English (Trinidad & Tobago)","en-GB":"English (United Kingdom)","en-US":"English (United States)","en-ZW":"English (Zimbabwe)",eo:"Esperanto",et:"Estonian",fo:"Faeroese",fj:"Fijian",fi:"Finnish",fr:"French (Standard)","fr-BE":"French (Belgium)","fr-CA":"French (Canada)","fr-FR":"French (France)","fr-LU":"French (Luxembourg)","fr-MC":"French (Monaco)","fr-CH":"French (Switzerland)",fy:"Frisian",fur:"Friulian",gd:"Gaelic (Scots)","gd-IE":"Gaelic (Irish)",gl:"Galacian",ka:"Georgian",de:"German (Standard)","de-AT":"German (Austria)","de-DE":"German (Germany)","de-LI":"German (Liechtenstein)","de-LU":"German (Luxembourg)","de-CH":"German (Switzerland)",el:"Greek",gu:"Gujurati",ht:"Haitian",he:"Hebrew",hi:"Hindi",hu:"Hungarian",is:"Icelandic",id:"Indonesian",iu:"Inuktitut",ga:"Irish",it:"Italian (Standard)","it-CH":"Italian (Switzerland)",ja:"Japanese",kn:"Kannada",ks:"Kashmiri",kk:"Kazakh",km:"Khmer",ky:"Kirghiz",tlh:"Klingon",ko:"Korean","ko-KP":"Korean (North Korea)","ko-KR":"Korean (South Korea)",la:"Latin",lv:"Latvian",lt:"Lithuanian",lb:"Luxembourgish",mk:"North Macedonia",ms:"Malay",ml:"Malayalam",mt:"Maltese",mi:"Maori",mr:"Marathi",mo:"Moldavian",nv:"Navajo",ng:"Ndonga",ne:"Nepali",no:"Norwegian",nb:"Norwegian (Bokmal)",nn:"Norwegian (Nynorsk)",oc:"Occitan",or:"Oriya",om:"Oromo",fa:"Persian","fa-IR":"Persian/Iran",pl:"Polish",pt:"Portuguese","pt-BR":"Portuguese (Brazil)",pa:"Punjabi","pa-IN":"Punjabi (India)","pa-PK":"Punjabi (Pakistan)",qu:"Quechua",rm:"Rhaeto-Romanic",ro:"Romanian","ro-MO":"Romanian (Moldavia)",ru:"Russian","ru-MO":"Russian (Moldavia)",sz:"Sami (Lappish)",sg:"Sango",sa:"Sanskrit",sc:"Sardinian",sd:"Sindhi",si:"Singhalese",sr:"Serbian",sk:"Slovak",sl:"Slovenian",so:"Somani",sb:"Sorbian",es:"Spanish","es-AR":"Spanish (Argentina)","es-BO":"Spanish (Bolivia)","es-CL":"Spanish (Chile)","es-CO":"Spanish (Colombia)","es-CR":"Spanish (Costa Rica)","es-DO":"Spanish (Dominican Republic)","es-EC":"Spanish (Ecuador)","es-SV":"Spanish (El Salvador)","es-GT":"Spanish (Guatemala)","es-HN":"Spanish (Honduras)","es-MX":"Spanish (Mexico)","es-NI":"Spanish (Nicaragua)","es-PA":"Spanish (Panama)","es-PY":"Spanish (Paraguay)","es-PE":"Spanish (Peru)","es-PR":"Spanish (Puerto Rico)","es-ES":"Spanish (Spain)","es-UY":"Spanish (Uruguay)","es-VE":"Spanish (Venezuela)",sx:"Sutu",sw:"Swahili",sv:"Swedish","sv-FI":"Swedish (Finland)","sv-SV":"Swedish (Sweden)",ta:"Tamil",tt:"Tatar",te:"Teluga",th:"Thai",tig:"Tigre",ts:"Tsonga",tn:"Tswana",tr:"Turkish",tk:"Turkmen",uk:"Ukrainian",hsb:"Upper Sorbian",ur:"Urdu",ve:"Venda",vi:"Vietnamese",vo:"Volapuk",wa:"Walloon",cy:"Welsh",xh:"Xhosa",ji:"Yiddish",zu:"Zulu"}[i]!==void 0&&(this.internal.languageSettings.languageCode=i,this.internal.languageSettings.isSubscribed===!1&&(this.internal.events.subscribe("putCatalog",function(){this.internal.write("/Lang ("+this.internal.languageSettings.languageCode+")")}),this.internal.languageSettings.isSubscribed=!0)),this},Ca=Hn.API,lo=Ca.getCharWidthsArray=function(i,e){var t,r,c=(e=e||{}).font||this.internal.getFont(),o=e.fontSize||this.internal.getFontSize(),l=e.charSpace||this.internal.getCharSpace(),d=e.widths?e.widths:c.metadata.Unicode.widths,h=d.fof?d.fof:1,m=e.kerning?e.kerning:c.metadata.Unicode.kerning,v=m.fof?m.fof:1,b=e.doKerning!==!1,x=0,p=i.length,D=0,P=d[0]||h,U=[];for(t=0;t<p;t++)r=i.charCodeAt(t),typeof c.metadata.widthOfString=="function"?U.push((c.metadata.widthOfGlyph(c.metadata.characterToGlyph(r))+l*(1e3/o)||0)/1e3):(x=b&&fe(m[r])==="object"&&!isNaN(parseInt(m[r][D],10))?m[r][D]/v:0,U.push((d[r]||P)/h+x)),D=r;return U},xc=Ca.getStringUnitWidth=function(i,e){var t=(e=e||{}).fontSize||this.internal.getFontSize(),r=e.font||this.internal.getFont(),c=e.charSpace||this.internal.getCharSpace();return Ca.processArabic&&(i=Ca.processArabic(i)),typeof r.metadata.widthOfString=="function"?r.metadata.widthOfString(i,t,c)/t:lo.apply(this,arguments).reduce(function(o,l){return o+l},0)},Lc=function(i,e,t,r){for(var c=[],o=0,l=i.length,d=0;o!==l&&d+e[o]<t;)d+=e[o],o++;c.push(i.slice(0,o));var h=o;for(d=0;o!==l;)d+e[o]>r&&(c.push(i.slice(h,o)),d=0,h=o),d+=e[o],o++;return h!==o&&c.push(i.slice(h,o)),c},kc=function(i,e,t){t||(t={});var r,c,o,l,d,h,m,v=[],b=[v],x=t.textIndent||0,p=0,D=0,P=i.split(" "),U=lo.apply(this,[" ",t])[0];if(h=t.lineIndent===-1?P[0].length+2:t.lineIndent||0){var S=Array(h).join(" "),E=[];P.map(function(sn){(sn=sn.split(/\s*\n/)).length>1?E=E.concat(sn.map(function(dn,An){return(An&&dn.length?`
`:"")+dn})):E.push(sn[0])}),P=E,h=xc.apply(this,[S,t])}for(o=0,l=P.length;o<l;o++){var W=0;if(r=P[o],h&&r[0]==`
`&&(r=r.substr(1),W=1),x+p+(D=(c=lo.apply(this,[r,t])).reduce(function(sn,dn){return sn+dn},0))>e||W){if(D>e){for(d=Lc.apply(this,[r,c,e-(x+p),e]),v.push(d.shift()),v=[d.pop()];d.length;)b.push([d.shift()]);D=c.slice(r.length-(v[0]?v[0].length:0)).reduce(function(sn,dn){return sn+dn},0)}else v=[r];b.push(v),x=D+h,p=U}else v.push(r),x+=p+D,p=U}return m=h?function(sn,dn){return(dn?S:"")+sn.join(" ")}:function(sn){return sn.join(" ")},b.map(m)},Ca.splitTextToSize=function(i,e,t){var r,c=(t=t||{}).fontSize||this.internal.getFontSize(),o=(function(v){if(v.widths&&v.kerning)return{widths:v.widths,kerning:v.kerning};var b=this.internal.getFont(v.fontName,v.fontStyle);return b.metadata.Unicode?{widths:b.metadata.Unicode.widths||{0:1},kerning:b.metadata.Unicode.kerning||{}}:{font:b.metadata,fontSize:this.internal.getFontSize(),charSpace:this.internal.getCharSpace()}}).call(this,t);r=Array.isArray(i)?i:String(i).split(/\r?\n/);var l=1*this.internal.scaleFactor*e/c;o.textIndent=t.textIndent?1*t.textIndent*this.internal.scaleFactor/c:0,o.lineIndent=t.lineIndent;var d,h,m=[];for(d=0,h=r.length;d<h;d++)m=m.concat(kc.apply(this,[r[d],l,o]));return m},function(i){i.__fontmetrics__=i.__fontmetrics__||{};for(var e="klmnopqrstuvwxyz",t={},r={},c=0;c<e.length;c++)t[e[c]]="0123456789abcdef"[c],r["0123456789abcdef"[c]]=e[c];var o=function(b){return"0x"+parseInt(b,10).toString(16)},l=i.__fontmetrics__.compress=function(b){var x,p,D,P,U=["{"];for(var S in b){if(x=b[S],isNaN(parseInt(S,10))?p="'"+S+"'":(S=parseInt(S,10),p=(p=o(S).slice(2)).slice(0,-1)+r[p.slice(-1)]),typeof x=="number")x<0?(D=o(x).slice(3),P="-"):(D=o(x).slice(2),P=""),D=P+D.slice(0,-1)+r[D.slice(-1)];else{if(fe(x)!=="object")throw new Error("Don't know what to do with value type "+fe(x)+".");D=l(x)}U.push(p+D)}return U.push("}"),U.join("")},d=i.__fontmetrics__.uncompress=function(b){if(typeof b!="string")throw new Error("Invalid argument passed to uncompress.");for(var x,p,D,P,U={},S=1,E=U,W=[],sn="",dn="",An=b.length-1,nn=1;nn<An;nn+=1)(P=b[nn])=="'"?x?(D=x.join(""),x=void 0):x=[]:x?x.push(P):P=="{"?(W.push([E,D]),E={},D=void 0):P=="}"?((p=W.pop())[0][p[1]]=E,D=void 0,E=p[0]):P=="-"?S=-1:D===void 0?t.hasOwnProperty(P)?(sn+=t[P],D=parseInt(sn,16)*S,S=1,sn=""):sn+=P:t.hasOwnProperty(P)?(dn+=t[P],E[D]=parseInt(dn,16)*S,S=1,D=void 0,dn=""):dn+=P;return U},h={codePages:["WinAnsiEncoding"],WinAnsiEncoding:d("{19m8n201n9q201o9r201s9l201t9m201u8m201w9n201x9o201y8o202k8q202l8r202m9p202q8p20aw8k203k8t203t8v203u9v2cq8s212m9t15m8w15n9w2dw9s16k8u16l9u17s9z17x8y17y9y}")},m={Unicode:{Courier:h,"Courier-Bold":h,"Courier-BoldOblique":h,"Courier-Oblique":h,Helvetica:h,"Helvetica-Bold":h,"Helvetica-BoldOblique":h,"Helvetica-Oblique":h,"Times-Roman":h,"Times-Bold":h,"Times-BoldItalic":h,"Times-Italic":h}},v={Unicode:{"Courier-Oblique":d("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-BoldItalic":d("{'widths'{k3o2q4ycx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2r202m2n2n3m2o3m2p5n202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5n4l4m4m4m4n4m4o4s4p4m4q4m4r4s4s4y4t2r4u3m4v4m4w3x4x5t4y4s4z4s5k3x5l4s5m4m5n3r5o3x5p4s5q4m5r5t5s4m5t3x5u3x5v2l5w1w5x2l5y3t5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q2l6r3m6s3r6t1w6u1w6v3m6w1w6x4y6y3r6z3m7k3m7l3m7m2r7n2r7o1w7p3r7q2w7r4m7s3m7t2w7u2r7v2n7w1q7x2n7y3t202l3mcl4mal2ram3man3mao3map3mar3mas2lat4uau1uav3maw3way4uaz2lbk2sbl3t'fof'6obo2lbp3tbq3mbr1tbs2lbu1ybv3mbz3mck4m202k3mcm4mcn4mco4mcp4mcq5ycr4mcs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz2w203k6o212m6o2dw2l2cq2l3t3m3u2l17s3x19m3m}'kerning'{cl{4qu5kt5qt5rs17ss5ts}201s{201ss}201t{cks4lscmscnscoscpscls2wu2yu201ts}201x{2wu2yu}2k{201ts}2w{4qx5kx5ou5qx5rs17su5tu}2x{17su5tu5ou}2y{4qx5kx5ou5qx5rs17ss5ts}'fof'-6ofn{17sw5tw5ou5qw5rs}7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qs}3v{17su5tu5os5qs}7p{17su5tu}ck{4qu5kt5qt5rs17ss5ts}4l{4qu5kt5qt5rs17ss5ts}cm{4qu5kt5qt5rs17ss5ts}cn{4qu5kt5qt5rs17ss5ts}co{4qu5kt5qt5rs17ss5ts}cp{4qu5kt5qt5rs17ss5ts}6l{4qu5ou5qw5rt17su5tu}5q{ckuclucmucnucoucpu4lu}5r{ckuclucmucnucoucpu4lu}7q{cksclscmscnscoscps4ls}6p{4qu5ou5qw5rt17sw5tw}ek{4qu5ou5qw5rt17su5tu}el{4qu5ou5qw5rt17su5tu}em{4qu5ou5qw5rt17su5tu}en{4qu5ou5qw5rt17su5tu}eo{4qu5ou5qw5rt17su5tu}ep{4qu5ou5qw5rt17su5tu}es{17ss5ts5qs4qu}et{4qu5ou5qw5rt17sw5tw}eu{4qu5ou5qw5rt17ss5ts}ev{17ss5ts5qs4qu}6z{17sw5tw5ou5qw5rs}fm{17sw5tw5ou5qw5rs}7n{201ts}fo{17sw5tw5ou5qw5rs}fp{17sw5tw5ou5qw5rs}fq{17sw5tw5ou5qw5rs}7r{cksclscmscnscoscps4ls}fs{17sw5tw5ou5qw5rs}ft{17su5tu}fu{17su5tu}fv{17su5tu}fw{17su5tu}fz{cksclscmscnscoscps4ls}}}"),"Helvetica-Bold":d("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),Courier:d("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-BoldOblique":d("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Bold":d("{'widths'{k3q2q5ncx2r201n3m201o6o201s2l201t2l201u2l201w3m201x3m201y3m2k1t2l2l202m2n2n3m2o3m2p6o202q6o2r1w2s2l2t2l2u3m2v3t2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w3t3x3t3y3t3z3m4k5x4l4s4m4m4n4s4o4s4p4m4q3x4r4y4s4y4t2r4u3m4v4y4w4m4x5y4y4s4z4y5k3x5l4y5m4s5n3r5o4m5p4s5q4s5r6o5s4s5t4s5u4m5v2l5w1w5x2l5y3u5z3m6k2l6l3m6m3r6n2w6o3r6p2w6q2l6r3m6s3r6t1w6u2l6v3r6w1w6x5n6y3r6z3m7k3r7l3r7m2w7n2r7o2l7p3r7q3m7r4s7s3m7t3m7u2w7v2r7w1q7x2r7y3o202l3mcl4sal2lam3man3mao3map3mar3mas2lat4uau1yav3maw3tay4uaz2lbk2sbl3t'fof'6obo2lbp3rbr1tbs2lbu2lbv3mbz3mck4s202k3mcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw2r2m3rcy2rcz2rdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3rek3mel3mem3men3meo3mep3meq4ser2wes2wet2weu2wev2wew1wex1wey1wez1wfl3rfm3mfn3mfo3mfp3mfq3mfr3tfs3mft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3m3u2l17s4s19m3m}'kerning'{cl{4qt5ks5ot5qy5rw17sv5tv}201t{cks4lscmscnscoscpscls4wv}2k{201ts}2w{4qu5ku7mu5os5qx5ru17su5tu}2x{17su5tu5ou5qs}2y{4qv5kv7mu5ot5qz5ru17su5tu}'fof'-6o7t{cksclscmscnscoscps4ls}3u{17su5tu5os5qu}3v{17su5tu5os5qu}fu{17su5tu5ou5qu}7p{17su5tu5ou5qu}ck{4qt5ks5ot5qy5rw17sv5tv}4l{4qt5ks5ot5qy5rw17sv5tv}cm{4qt5ks5ot5qy5rw17sv5tv}cn{4qt5ks5ot5qy5rw17sv5tv}co{4qt5ks5ot5qy5rw17sv5tv}cp{4qt5ks5ot5qy5rw17sv5tv}6l{17st5tt5ou5qu}17s{ckuclucmucnucoucpu4lu4wu}5o{ckuclucmucnucoucpu4lu4wu}5q{ckzclzcmzcnzcozcpz4lz4wu}5r{ckxclxcmxcnxcoxcpx4lx4wu}5t{ckuclucmucnucoucpu4lu4wu}7q{ckuclucmucnucoucpu4lu}6p{17sw5tw5ou5qu}ek{17st5tt5qu}el{17st5tt5ou5qu}em{17st5tt5qu}en{17st5tt5qu}eo{17st5tt5qu}ep{17st5tt5ou5qu}es{17ss5ts5qu}et{17sw5tw5ou5qu}eu{17sw5tw5ou5qu}ev{17ss5ts5qu}6z{17sw5tw5ou5qu5rs}fm{17sw5tw5ou5qu5rs}fn{17sw5tw5ou5qu5rs}fo{17sw5tw5ou5qu5rs}fp{17sw5tw5ou5qu5rs}fq{17sw5tw5ou5qu5rs}7r{cktcltcmtcntcotcpt4lt5os}fs{17sw5tw5ou5qu5rs}ft{17su5tu5ou5qu}7m{5os}fv{17su5tu5ou5qu}fw{17su5tu5ou5qu}fz{cksclscmscnscoscps4ls}}}"),Symbol:d("{'widths'{k3uaw4r19m3m2k1t2l2l202m2y2n3m2p5n202q6o3k3m2s2l2t2l2v3r2w1t3m3m2y1t2z1wbk2sbl3r'fof'6o3n3m3o3m3p3m3q3m3r3m3s3m3t3m3u1w3v1w3w3r3x3r3y3r3z2wbp3t3l3m5v2l5x2l5z3m2q4yfr3r7v3k7w1o7x3k}'kerning'{'fof'-6o}}"),Helvetica:d("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}"),"Helvetica-BoldOblique":d("{'widths'{k3s2q4scx1w201n3r201o6o201s1w201t1w201u1w201w3m201x3m201y3m2k1w2l2l202m2n2n3r2o3r2p5t202q6o2r1s2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v2l3w3u3x3u3y3u3z3x4k6l4l4s4m4s4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3r4v4s4w3x4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v2l5w1w5x2l5y3u5z3r6k2l6l3r6m3x6n3r6o3x6p3r6q2l6r3x6s3x6t1w6u1w6v3r6w1w6x5t6y3x6z3x7k3x7l3x7m2r7n3r7o2l7p3x7q3r7r4y7s3r7t3r7u3m7v2r7w1w7x2r7y3u202l3rcl4sal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3xbq3rbr1wbs2lbu2obv3rbz3xck4s202k3rcm4scn4sco4scp4scq6ocr4scs4mct4mcu4mcv4mcw1w2m2zcy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3res3ret3reu3rev3rew1wex1wey1wez1wfl3xfm3xfn3xfo3xfp3xfq3xfr3ufs3xft3xfu3xfv3xfw3xfz3r203k6o212m6o2dw2l2cq2l3t3r3u2l17s4m19m3r}'kerning'{cl{4qs5ku5ot5qs17sv5tv}201t{2ww4wy2yw}201w{2ks}201x{2ww4wy2yw}2k{201ts201xs}2w{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}2x{5ow5qs}2y{7qs4qu5kw5os5qw5rs17su5tu7tsfzs}'fof'-6o7p{17su5tu5ot}ck{4qs5ku5ot5qs17sv5tv}4l{4qs5ku5ot5qs17sv5tv}cm{4qs5ku5ot5qs17sv5tv}cn{4qs5ku5ot5qs17sv5tv}co{4qs5ku5ot5qs17sv5tv}cp{4qs5ku5ot5qs17sv5tv}6l{17st5tt5os}17s{2kwclvcmvcnvcovcpv4lv4wwckv}5o{2kucltcmtcntcotcpt4lt4wtckt}5q{2ksclscmscnscoscps4ls4wvcks}5r{2ks4ws}5t{2kwclvcmvcnvcovcpv4lv4wwckv}eo{17st5tt5os}fu{17su5tu5ot}6p{17ss5ts}ek{17st5tt5os}el{17st5tt5os}em{17st5tt5os}en{17st5tt5os}6o{201ts}ep{17st5tt5os}es{17ss5ts}et{17ss5ts}eu{17ss5ts}ev{17ss5ts}6z{17su5tu5os5qt}fm{17su5tu5os5qt}fn{17su5tu5os5qt}fo{17su5tu5os5qt}fp{17su5tu5os5qt}fq{17su5tu5os5qt}fs{17su5tu5os5qt}ft{17su5tu5ot}7m{5os}fv{17su5tu5ot}fw{17su5tu5ot}}}"),ZapfDingbats:d("{'widths'{k4u2k1w'fof'6o}'kerning'{'fof'-6o}}"),"Courier-Bold":d("{'widths'{k3w'fof'6o}'kerning'{'fof'-6o}}"),"Times-Italic":d("{'widths'{k3n2q4ycx2l201n3m201o5t201s2l201t2l201u2l201w3r201x3r201y3r2k1t2l2l202m2n2n3m2o3m2p5n202q5t2r1p2s2l2t2l2u3m2v4n2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v2l3w4n3x4n3y4n3z3m4k5w4l3x4m3x4n4m4o4s4p3x4q3x4r4s4s4s4t2l4u2w4v4m4w3r4x5n4y4m4z4s5k3x5l4s5m3x5n3m5o3r5p4s5q3x5r5n5s3x5t3r5u3r5v2r5w1w5x2r5y2u5z3m6k2l6l3m6m3m6n2w6o3m6p2w6q1w6r3m6s3m6t1w6u1w6v2w6w1w6x4s6y3m6z3m7k3m7l3m7m2r7n2r7o1w7p3m7q2w7r4m7s2w7t2w7u2r7v2s7w1v7x2s7y3q202l3mcl3xal2ram3man3mao3map3mar3mas2lat4wau1vav3maw4nay4waz2lbk2sbl4n'fof'6obo2lbp3mbq3obr1tbs2lbu1zbv3mbz3mck3x202k3mcm3xcn3xco3xcp3xcq5tcr4mcs3xct3xcu3xcv3xcw2l2m2ucy2lcz2ldl4mdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek3mel3mem3men3meo3mep3meq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr4nfs3mft3mfu3mfv3mfw3mfz2w203k6o212m6m2dw2l2cq2l3t3m3u2l17s3r19m3m}'kerning'{cl{5kt4qw}201s{201sw}201t{201tw2wy2yy6q-t}201x{2wy2yy}2k{201tw}2w{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}2x{17ss5ts5os}2y{7qs4qy7rs5ky7mw5os5qx5ru17su5tu}'fof'-6o6t{17ss5ts5qs}7t{5os}3v{5qs}7p{17su5tu5qs}ck{5kt4qw}4l{5kt4qw}cm{5kt4qw}cn{5kt4qw}co{5kt4qw}cp{5kt4qw}6l{4qs5ks5ou5qw5ru17su5tu}17s{2ks}5q{ckvclvcmvcnvcovcpv4lv}5r{ckuclucmucnucoucpu4lu}5t{2ks}6p{4qs5ks5ou5qw5ru17su5tu}ek{4qs5ks5ou5qw5ru17su5tu}el{4qs5ks5ou5qw5ru17su5tu}em{4qs5ks5ou5qw5ru17su5tu}en{4qs5ks5ou5qw5ru17su5tu}eo{4qs5ks5ou5qw5ru17su5tu}ep{4qs5ks5ou5qw5ru17su5tu}es{5ks5qs4qs}et{4qs5ks5ou5qw5ru17su5tu}eu{4qs5ks5qw5ru17su5tu}ev{5ks5qs4qs}ex{17ss5ts5qs}6z{4qv5ks5ou5qw5ru17su5tu}fm{4qv5ks5ou5qw5ru17su5tu}fn{4qv5ks5ou5qw5ru17su5tu}fo{4qv5ks5ou5qw5ru17su5tu}fp{4qv5ks5ou5qw5ru17su5tu}fq{4qv5ks5ou5qw5ru17su5tu}7r{5os}fs{4qv5ks5ou5qw5ru17su5tu}ft{17su5tu5qs}fu{17su5tu5qs}fv{17su5tu5qs}fw{17su5tu5qs}}}"),"Times-Roman":d("{'widths'{k3n2q4ycx2l201n3m201o6o201s2l201t2l201u2l201w2w201x2w201y2w2k1t2l2l202m2n2n3m2o3m2p5n202q6o2r1m2s2l2t2l2u3m2v3s2w1t2x2l2y1t2z1w3k3m3l3m3m3m3n3m3o3m3p3m3q3m3r3m3s3m203t2l203u2l3v1w3w3s3x3s3y3s3z2w4k5w4l4s4m4m4n4m4o4s4p3x4q3r4r4s4s4s4t2l4u2r4v4s4w3x4x5t4y4s4z4s5k3r5l4s5m4m5n3r5o3x5p4s5q4s5r5y5s4s5t4s5u3x5v2l5w1w5x2l5y2z5z3m6k2l6l2w6m3m6n2w6o3m6p2w6q2l6r3m6s3m6t1w6u1w6v3m6w1w6x4y6y3m6z3m7k3m7l3m7m2l7n2r7o1w7p3m7q3m7r4s7s3m7t3m7u2w7v3k7w1o7x3k7y3q202l3mcl4sal2lam3man3mao3map3mar3mas2lat4wau1vav3maw3say4waz2lbk2sbl3s'fof'6obo2lbp3mbq2xbr1tbs2lbu1zbv3mbz2wck4s202k3mcm4scn4sco4scp4scq5tcr4mcs3xct3xcu3xcv3xcw2l2m2tcy2lcz2ldl4sdm4sdn4sdo4sdp4sdq4sds4sdt4sdu4sdv4sdw4sdz3mek2wel2wem2wen2weo2wep2weq4mer2wes2wet2weu2wev2wew1wex1wey1wez1wfl3mfm3mfn3mfo3mfp3mfq3mfr3sfs3mft3mfu3mfv3mfw3mfz3m203k6o212m6m2dw2l2cq2l3t3m3u1w17s4s19m3m}'kerning'{cl{4qs5ku17sw5ou5qy5rw201ss5tw201ws}201s{201ss}201t{ckw4lwcmwcnwcowcpwclw4wu201ts}2k{201ts}2w{4qs5kw5os5qx5ru17sx5tx}2x{17sw5tw5ou5qu}2y{4qs5kw5os5qx5ru17sx5tx}'fof'-6o7t{ckuclucmucnucoucpu4lu5os5rs}3u{17su5tu5qs}3v{17su5tu5qs}7p{17sw5tw5qs}ck{4qs5ku17sw5ou5qy5rw201ss5tw201ws}4l{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cm{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cn{4qs5ku17sw5ou5qy5rw201ss5tw201ws}co{4qs5ku17sw5ou5qy5rw201ss5tw201ws}cp{4qs5ku17sw5ou5qy5rw201ss5tw201ws}6l{17su5tu5os5qw5rs}17s{2ktclvcmvcnvcovcpv4lv4wuckv}5o{ckwclwcmwcnwcowcpw4lw4wu}5q{ckyclycmycnycoycpy4ly4wu5ms}5r{cktcltcmtcntcotcpt4lt4ws}5t{2ktclvcmvcnvcovcpv4lv4wuckv}7q{cksclscmscnscoscps4ls}6p{17su5tu5qw5rs}ek{5qs5rs}el{17su5tu5os5qw5rs}em{17su5tu5os5qs5rs}en{17su5qs5rs}eo{5qs5rs}ep{17su5tu5os5qw5rs}es{5qs}et{17su5tu5qw5rs}eu{17su5tu5qs5rs}ev{5qs}6z{17sv5tv5os5qx5rs}fm{5os5qt5rs}fn{17sv5tv5os5qx5rs}fo{17sv5tv5os5qx5rs}fp{5os5qt5rs}fq{5os5qt5rs}7r{ckuclucmucnucoucpu4lu5os}fs{17sv5tv5os5qx5rs}ft{17ss5ts5qs}fu{17sw5tw5qs}fv{17sw5tw5qs}fw{17ss5ts5qs}fz{ckuclucmucnucoucpu4lu5os5rs}}}"),"Helvetica-Oblique":d("{'widths'{k3p2q4mcx1w201n3r201o6o201s1q201t1q201u1q201w2l201x2l201y2l2k1w2l1w202m2n2n3r2o3r2p5t202q6o2r1n2s2l2t2l2u2r2v3u2w1w2x2l2y1w2z1w3k3r3l3r3m3r3n3r3o3r3p3r3q3r3r3r3s3r203t2l203u2l3v1w3w3u3x3u3y3u3z3r4k6p4l4m4m4m4n4s4o4s4p4m4q3x4r4y4s4s4t1w4u3m4v4m4w3r4x5n4y4s4z4y5k4m5l4y5m4s5n4m5o3x5p4s5q4m5r5y5s4m5t4m5u3x5v1w5w1w5x1w5y2z5z3r6k2l6l3r6m3r6n3m6o3r6p3r6q1w6r3r6s3r6t1q6u1q6v3m6w1q6x5n6y3r6z3r7k3r7l3r7m2l7n3m7o1w7p3r7q3m7r4s7s3m7t3m7u3m7v2l7w1u7x2l7y3u202l3rcl4mal2lam3ran3rao3rap3rar3ras2lat4tau2pav3raw3uay4taz2lbk2sbl3u'fof'6obo2lbp3rbr1wbs2lbu2obv3rbz3xck4m202k3rcm4mcn4mco4mcp4mcq6ocr4scs4mct4mcu4mcv4mcw1w2m2ncy1wcz1wdl4sdm4ydn4ydo4ydp4ydq4yds4ydt4sdu4sdv4sdw4sdz3xek3rel3rem3ren3reo3rep3req5ter3mes3ret3reu3rev3rew1wex1wey1wez1wfl3rfm3rfn3rfo3rfp3rfq3rfr3ufs3xft3rfu3rfv3rfw3rfz3m203k6o212m6o2dw2l2cq2l3t3r3u1w17s4m19m3r}'kerning'{5q{4wv}cl{4qs5kw5ow5qs17sv5tv}201t{2wu4w1k2yu}201x{2wu4wy2yu}17s{2ktclucmucnu4otcpu4lu4wycoucku}2w{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}2x{17sy5ty5oy5qs}2y{7qs4qz5k1m17sy5ow5qx5rsfsu5ty7tufzu}'fof'-6o7p{17sv5tv5ow}ck{4qs5kw5ow5qs17sv5tv}4l{4qs5kw5ow5qs17sv5tv}cm{4qs5kw5ow5qs17sv5tv}cn{4qs5kw5ow5qs17sv5tv}co{4qs5kw5ow5qs17sv5tv}cp{4qs5kw5ow5qs17sv5tv}6l{17sy5ty5ow}do{17st5tt}4z{17st5tt}7s{fst}dm{17st5tt}dn{17st5tt}5o{ckwclwcmwcnwcowcpw4lw4wv}dp{17st5tt}dq{17st5tt}7t{5ow}ds{17st5tt}5t{2ktclucmucnu4otcpu4lu4wycoucku}fu{17sv5tv5ow}6p{17sy5ty5ow5qs}ek{17sy5ty5ow}el{17sy5ty5ow}em{17sy5ty5ow}en{5ty}eo{17sy5ty5ow}ep{17sy5ty5ow}es{17sy5ty5qs}et{17sy5ty5ow5qs}eu{17sy5ty5ow5qs}ev{17sy5ty5ow5qs}6z{17sy5ty5ow5qs}fm{17sy5ty5ow5qs}fn{17sy5ty5ow5qs}fo{17sy5ty5ow5qs}fp{17sy5ty5qs}fq{17sy5ty5ow5qs}7r{5ow}fs{17sy5ty5ow5qs}ft{17sv5tv5ow}7m{5ow}fv{17sv5tv5ow}fw{17sv5tv5ow}}}")}};i.events.push(["addFont",function(b){var x=b.font,p=v.Unicode[x.postScriptName];p&&(x.metadata.Unicode={},x.metadata.Unicode.widths=p.widths,x.metadata.Unicode.kerning=p.kerning);var D=m.Unicode[x.postScriptName];D&&(x.metadata.Unicode.encoding=D,x.encoding=D.codePages[0])}])}(Hn.API),function(i){var e=function(t){for(var r=t.length,c=new Uint8Array(r),o=0;o<r;o++)c[o]=t.charCodeAt(o);return c};i.API.events.push(["addFont",function(t){var r=void 0,c=t.font,o=t.instance;if(!c.isStandardFont){if(o===void 0)throw new Error("Font does not exist in vFS, import fonts or remove declaration doc.addFont('"+c.postScriptName+"').");if(typeof(r=o.existsFileInVFS(c.postScriptName)===!1?o.loadFile(c.postScriptName):o.getFileFromVFS(c.postScriptName))!="string")throw new Error("Font is not stored as string-data in vFS, import fonts or remove declaration doc.addFont('"+c.postScriptName+"').");(function(l,d){d=/^\x00\x01\x00\x00/.test(d)?e(d):e(pr(d)),l.metadata=i.API.TTFFont.open(d),l.metadata.Unicode=l.metadata.Unicode||{encoding:{},kerning:{},widths:[]},l.metadata.glyIdsUsed=[0]})(c,r)}}])}(Hn),function(i){function e(){return(Gn.canvg?Promise.resolve(Gn.canvg):ys(()=>import("./index.es-acf0663a.js"),["assets/index.es-acf0663a.js","assets/main-3fc9fb98.js","assets/main-1fca26cb.css"])).catch(function(t){return Promise.reject(new Error("Could not load canvg: "+t))}).then(function(t){return t.default?t.default:t})}Hn.API.addSvgAsImage=function(t,r,c,o,l,d,h,m){if(isNaN(r)||isNaN(c))throw ve.error("jsPDF.addSvgAsImage: Invalid coordinates",arguments),new Error("Invalid coordinates passed to jsPDF.addSvgAsImage");if(isNaN(o)||isNaN(l))throw ve.error("jsPDF.addSvgAsImage: Invalid measurements",arguments),new Error("Invalid measurements (width and/or height) passed to jsPDF.addSvgAsImage");var v=document.createElement("canvas");v.width=o,v.height=l;var b=v.getContext("2d");b.fillStyle="#fff",b.fillRect(0,0,v.width,v.height);var x={ignoreMouse:!0,ignoreAnimation:!0,ignoreDimensions:!0},p=this;return e().then(function(D){return D.fromString(b,t,x)},function(){return Promise.reject(new Error("Could not load canvg."))}).then(function(D){return D.render(x)}).then(function(){p.addImage(v.toDataURL("image/jpeg",1),r,c,o,l,h,m)})}}(),Hn.API.putTotalPages=function(i){var e,t=0;parseInt(this.internal.getFont().id.substr(1),10)<15?(e=new RegExp(i,"g"),t=this.internal.getNumberOfPages()):(e=new RegExp(this.pdfEscape16(i,this.internal.getFont()),"g"),t=this.pdfEscape16(this.internal.getNumberOfPages()+"",this.internal.getFont()));for(var r=1;r<=this.internal.getNumberOfPages();r++)for(var c=0;c<this.internal.pages[r].length;c++)this.internal.pages[r][c]=this.internal.pages[r][c].replace(e,t);return this},Hn.API.viewerPreferences=function(i,e){var t;i=i||{},e=e||!1;var r,c,o,l={HideToolbar:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.3},HideMenubar:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.3},HideWindowUI:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.3},FitWindow:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.3},CenterWindow:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.3},DisplayDocTitle:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.4},NonFullScreenPageMode:{defaultValue:"UseNone",value:"UseNone",type:"name",explicitSet:!1,valueSet:["UseNone","UseOutlines","UseThumbs","UseOC"],pdfVersion:1.3},Direction:{defaultValue:"L2R",value:"L2R",type:"name",explicitSet:!1,valueSet:["L2R","R2L"],pdfVersion:1.3},ViewArea:{defaultValue:"CropBox",value:"CropBox",type:"name",explicitSet:!1,valueSet:["MediaBox","CropBox","TrimBox","BleedBox","ArtBox"],pdfVersion:1.4},ViewClip:{defaultValue:"CropBox",value:"CropBox",type:"name",explicitSet:!1,valueSet:["MediaBox","CropBox","TrimBox","BleedBox","ArtBox"],pdfVersion:1.4},PrintArea:{defaultValue:"CropBox",value:"CropBox",type:"name",explicitSet:!1,valueSet:["MediaBox","CropBox","TrimBox","BleedBox","ArtBox"],pdfVersion:1.4},PrintClip:{defaultValue:"CropBox",value:"CropBox",type:"name",explicitSet:!1,valueSet:["MediaBox","CropBox","TrimBox","BleedBox","ArtBox"],pdfVersion:1.4},PrintScaling:{defaultValue:"AppDefault",value:"AppDefault",type:"name",explicitSet:!1,valueSet:["AppDefault","None"],pdfVersion:1.6},Duplex:{defaultValue:"",value:"none",type:"name",explicitSet:!1,valueSet:["Simplex","DuplexFlipShortEdge","DuplexFlipLongEdge","none"],pdfVersion:1.7},PickTrayByPDFSize:{defaultValue:!1,value:!1,type:"boolean",explicitSet:!1,valueSet:[!0,!1],pdfVersion:1.7},PrintPageRange:{defaultValue:"",value:"",type:"array",explicitSet:!1,valueSet:null,pdfVersion:1.7},NumCopies:{defaultValue:1,value:1,type:"integer",explicitSet:!1,valueSet:null,pdfVersion:1.7}},d=Object.keys(l),h=[],m=0,v=0,b=0;function x(D,P){var U,S=!1;for(U=0;U<D.length;U+=1)D[U]===P&&(S=!0);return S}if(this.internal.viewerpreferences===void 0&&(this.internal.viewerpreferences={},this.internal.viewerpreferences.configuration=JSON.parse(JSON.stringify(l)),this.internal.viewerpreferences.isSubscribed=!1),t=this.internal.viewerpreferences.configuration,i==="reset"||e===!0){var p=d.length;for(b=0;b<p;b+=1)t[d[b]].value=t[d[b]].defaultValue,t[d[b]].explicitSet=!1}if(fe(i)==="object"){for(c in i)if(o=i[c],x(d,c)&&o!==void 0){if(t[c].type==="boolean"&&typeof o=="boolean")t[c].value=o;else if(t[c].type==="name"&&x(t[c].valueSet,o))t[c].value=o;else if(t[c].type==="integer"&&Number.isInteger(o))t[c].value=o;else if(t[c].type==="array"){for(m=0;m<o.length;m+=1)if(r=!0,o[m].length===1&&typeof o[m][0]=="number")h.push(String(o[m]-1));else if(o[m].length>1){for(v=0;v<o[m].length;v+=1)typeof o[m][v]!="number"&&(r=!1);r===!0&&h.push([o[m][0]-1,o[m][1]-1].join(" "))}t[c].value="["+h.join(" ")+"]"}else t[c].value=t[c].defaultValue;t[c].explicitSet=!0}}return this.internal.viewerpreferences.isSubscribed===!1&&(this.internal.events.subscribe("putCatalog",function(){var D,P=[];for(D in t)t[D].explicitSet===!0&&(t[D].type==="name"?P.push("/"+D+" /"+t[D].value):P.push("/"+D+" "+t[D].value));P.length!==0&&this.internal.write(`/ViewerPreferences
<<
`+P.join(`
`)+`
>>`)}),this.internal.viewerpreferences.isSubscribed=!0),this.internal.viewerpreferences.configuration=t,this},function(i){var e=function(){var r='<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:jspdf="'+this.internal.__metadata__.namespaceuri+'"><jspdf:metadata>',c=unescape(encodeURIComponent('<x:xmpmeta xmlns:x="adobe:ns:meta/">')),o=unescape(encodeURIComponent(r)),l=unescape(encodeURIComponent(this.internal.__metadata__.metadata)),d=unescape(encodeURIComponent("</jspdf:metadata></rdf:Description></rdf:RDF>")),h=unescape(encodeURIComponent("</x:xmpmeta>")),m=o.length+l.length+d.length+c.length+h.length;this.internal.__metadata__.metadata_object_number=this.internal.newObject(),this.internal.write("<< /Type /Metadata /Subtype /XML /Length "+m+" >>"),this.internal.write("stream"),this.internal.write(c+o+l+d+h),this.internal.write("endstream"),this.internal.write("endobj")},t=function(){this.internal.__metadata__.metadata_object_number&&this.internal.write("/Metadata "+this.internal.__metadata__.metadata_object_number+" 0 R")};i.addMetadata=function(r,c){return this.internal.__metadata__===void 0&&(this.internal.__metadata__={metadata:r,namespaceuri:c||"http://jspdf.default.namespaceuri/"},this.internal.events.subscribe("putCatalog",t),this.internal.events.subscribe("postPutResources",e)),this}}(Hn.API),function(i){var e=i.API,t=e.pdfEscape16=function(o,l){for(var d,h=l.metadata.Unicode.widths,m=["","0","00","000","0000"],v=[""],b=0,x=o.length;b<x;++b){if(d=l.metadata.characterToGlyph(o.charCodeAt(b)),l.metadata.glyIdsUsed.push(d),l.metadata.toUnicode[d]=o.charCodeAt(b),h.indexOf(d)==-1&&(h.push(d),h.push([parseInt(l.metadata.widthOfGlyph(d),10)])),d=="0")return v.join("");d=d.toString(16),v.push(m[4-d.length],d)}return v.join("")},r=function(o){var l,d,h,m,v,b,x;for(v=`/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000><ffff>
endcodespacerange`,h=[],b=0,x=(d=Object.keys(o).sort(function(p,D){return p-D})).length;b<x;b++)l=d[b],h.length>=100&&(v+=`
`+h.length+` beginbfchar
`+h.join(`
`)+`
endbfchar`,h=[]),o[l]!==void 0&&o[l]!==null&&typeof o[l].toString=="function"&&(m=("0000"+o[l].toString(16)).slice(-4),l=("0000"+(+l).toString(16)).slice(-4),h.push("<"+l+"><"+m+">"));return h.length&&(v+=`
`+h.length+` beginbfchar
`+h.join(`
`)+`
endbfchar
`),v+=`endcmap
CMapName currentdict /CMap defineresource pop
end
end`};e.events.push(["putFont",function(o){(function(l){var d=l.font,h=l.out,m=l.newObject,v=l.putStream;if(d.metadata instanceof i.API.TTFFont&&d.encoding==="Identity-H"){for(var b=d.metadata.Unicode.widths,x=d.metadata.subset.encode(d.metadata.glyIdsUsed,1),p="",D=0;D<x.length;D++)p+=String.fromCharCode(x[D]);var P=m();v({data:p,addLength1:!0,objectId:P}),h("endobj");var U=m();v({data:r(d.metadata.toUnicode),addLength1:!0,objectId:U}),h("endobj");var S=m();h("<<"),h("/Type /FontDescriptor"),h("/FontName /"+Ia(d.fontName)),h("/FontFile2 "+P+" 0 R"),h("/FontBBox "+i.API.PDFObject.convert(d.metadata.bbox)),h("/Flags "+d.metadata.flags),h("/StemV "+d.metadata.stemV),h("/ItalicAngle "+d.metadata.italicAngle),h("/Ascent "+d.metadata.ascender),h("/Descent "+d.metadata.decender),h("/CapHeight "+d.metadata.capHeight),h(">>"),h("endobj");var E=m();h("<<"),h("/Type /Font"),h("/BaseFont /"+Ia(d.fontName)),h("/FontDescriptor "+S+" 0 R"),h("/W "+i.API.PDFObject.convert(b)),h("/CIDToGIDMap /Identity"),h("/DW 1000"),h("/Subtype /CIDFontType2"),h("/CIDSystemInfo"),h("<<"),h("/Supplement 0"),h("/Registry (Adobe)"),h("/Ordering ("+d.encoding+")"),h(">>"),h(">>"),h("endobj"),d.objectNumber=m(),h("<<"),h("/Type /Font"),h("/Subtype /Type0"),h("/ToUnicode "+U+" 0 R"),h("/BaseFont /"+Ia(d.fontName)),h("/Encoding /"+d.encoding),h("/DescendantFonts ["+E+" 0 R]"),h(">>"),h("endobj"),d.isAlreadyPutted=!0}})(o)}]),e.events.push(["putFont",function(o){(function(l){var d=l.font,h=l.out,m=l.newObject,v=l.putStream;if(d.metadata instanceof i.API.TTFFont&&d.encoding==="WinAnsiEncoding"){for(var b=d.metadata.rawData,x="",p=0;p<b.length;p++)x+=String.fromCharCode(b[p]);var D=m();v({data:x,addLength1:!0,objectId:D}),h("endobj");var P=m();v({data:r(d.metadata.toUnicode),addLength1:!0,objectId:P}),h("endobj");var U=m();h("<<"),h("/Descent "+d.metadata.decender),h("/CapHeight "+d.metadata.capHeight),h("/StemV "+d.metadata.stemV),h("/Type /FontDescriptor"),h("/FontFile2 "+D+" 0 R"),h("/Flags 96"),h("/FontBBox "+i.API.PDFObject.convert(d.metadata.bbox)),h("/FontName /"+Ia(d.fontName)),h("/ItalicAngle "+d.metadata.italicAngle),h("/Ascent "+d.metadata.ascender),h(">>"),h("endobj"),d.objectNumber=m();for(var S=0;S<d.metadata.hmtx.widths.length;S++)d.metadata.hmtx.widths[S]=parseInt(d.metadata.hmtx.widths[S]*(1e3/d.metadata.head.unitsPerEm));h("<</Subtype/TrueType/Type/Font/ToUnicode "+P+" 0 R/BaseFont/"+Ia(d.fontName)+"/FontDescriptor "+U+" 0 R/Encoding/"+d.encoding+" /FirstChar 29 /LastChar 255 /Widths "+i.API.PDFObject.convert(d.metadata.hmtx.widths)+">>"),h("endobj"),d.isAlreadyPutted=!0}})(o)}]);var c=function(o){var l,d=o.text||"",h=o.x,m=o.y,v=o.options||{},b=o.mutex||{},x=b.pdfEscape,p=b.activeFontKey,D=b.fonts,P=p,U="",S=0,E="",W=D[P].encoding;if(D[P].encoding!=="Identity-H")return{text:d,x:h,y:m,options:v,mutex:b};for(E=d,P=p,Array.isArray(d)&&(E=d[0]),S=0;S<E.length;S+=1)D[P].metadata.hasOwnProperty("cmap")&&(l=D[P].metadata.cmap.unicode.codeMap[E[S].charCodeAt(0)]),l||E[S].charCodeAt(0)<256&&D[P].metadata.hasOwnProperty("Unicode")?U+=E[S]:U+="";var sn="";return parseInt(P.slice(1))<14||W==="WinAnsiEncoding"?sn=x(U,P).split("").map(function(dn){return dn.charCodeAt(0).toString(16)}).join(""):W==="Identity-H"&&(sn=t(U,D[P])),b.isHex=!0,{text:sn,x:h,y:m,options:v,mutex:b}};e.events.push(["postProcessText",function(o){var l=o.text||"",d=[],h={text:l,x:o.x,y:o.y,options:o.options,mutex:o.mutex};if(Array.isArray(l)){var m=0;for(m=0;m<l.length;m+=1)Array.isArray(l[m])&&l[m].length===3?d.push([c(Object.assign({},h,{text:l[m][0]})).text,l[m][1],l[m][2]]):d.push(c(Object.assign({},h,{text:l[m]})).text);o.text=d}else o.text=c(Object.assign({},h,{text:l})).text}])}(Hn),function(i){var e=function(){return this.internal.vFS===void 0&&(this.internal.vFS={}),!0};i.existsFileInVFS=function(t){return e.call(this),this.internal.vFS[t]!==void 0},i.addFileToVFS=function(t,r){return e.call(this),this.internal.vFS[t]=r,this},i.getFileFromVFS=function(t){return e.call(this),this.internal.vFS[t]!==void 0?this.internal.vFS[t]:null}}(Hn.API),function(i){i.__bidiEngine__=i.prototype.__bidiEngine__=function(r){var c,o,l,d,h,m,v,b=e,x=[[0,3,0,1,0,0,0],[0,3,0,1,2,2,0],[0,3,0,17,2,0,1],[0,3,5,5,4,1,0],[0,3,21,21,4,0,1],[0,3,5,5,4,2,0]],p=[[2,0,1,1,0,1,0],[2,0,1,1,0,2,0],[2,0,2,1,3,2,0],[2,0,2,33,3,1,1]],D={L:0,R:1,EN:2,AN:3,N:4,B:5,S:6},P={0:0,5:1,6:2,7:3,32:4,251:5,254:6,255:7},U=["(",")","(","<",">","<","[","]","[","{","}","{","«","»","«","‹","›","‹","⁅","⁆","⁅","⁽","⁾","⁽","₍","₎","₍","≤","≥","≤","〈","〉","〈","﹙","﹚","﹙","﹛","﹜","﹛","﹝","﹞","﹝","﹤","﹥","﹤"],S=new RegExp(/^([1-4|9]|1[0-9]|2[0-9]|3[0168]|4[04589]|5[012]|7[78]|159|16[0-9]|17[0-2]|21[569]|22[03489]|250)$/),E=!1,W=0;this.__bidiEngine__={};var sn=function(C){var I=C.charCodeAt(),G=I>>8,j=P[G];return j!==void 0?b[256*j+(255&I)]:G===252||G===253?"AL":S.test(G)?"L":G===8?"R":"N"},dn=function(C){for(var I,G=0;G<C.length;G++){if((I=sn(C.charAt(G)))==="L")return!1;if(I==="R")return!0}return!1},An=function(C,I,G,j){var cn,rn,hn,$,un=I[j];switch(un){case"L":case"R":E=!1;break;case"N":case"AN":break;case"EN":E&&(un="AN");break;case"AL":E=!0,un="R";break;case"WS":un="N";break;case"CS":j<1||j+1>=I.length||(cn=G[j-1])!=="EN"&&cn!=="AN"||(rn=I[j+1])!=="EN"&&rn!=="AN"?un="N":E&&(rn="AN"),un=rn===cn?rn:"N";break;case"ES":un=(cn=j>0?G[j-1]:"B")==="EN"&&j+1<I.length&&I[j+1]==="EN"?"EN":"N";break;case"ET":if(j>0&&G[j-1]==="EN"){un="EN";break}if(E){un="N";break}for(hn=j+1,$=I.length;hn<$&&I[hn]==="ET";)hn++;un=hn<$&&I[hn]==="EN"?"EN":"N";break;case"NSM":if(l&&!d){for($=I.length,hn=j+1;hn<$&&I[hn]==="NSM";)hn++;if(hn<$){var pn=C[j],Dn=pn>=1425&&pn<=2303||pn===64286;if(cn=I[hn],Dn&&(cn==="R"||cn==="AL")){un="R";break}}}un=j<1||(cn=I[j-1])==="B"?"N":G[j-1];break;case"B":E=!1,c=!0,un=W;break;case"S":o=!0,un="N";break;case"LRE":case"RLE":case"LRO":case"RLO":case"PDF":E=!1;break;case"BN":un="N"}return un},nn=function(C,I,G){var j=C.split("");return G&&q(j,G,{hiLevel:W}),j.reverse(),I&&I.reverse(),j.join("")},q=function(C,I,G){var j,cn,rn,hn,$,un=-1,pn=C.length,Dn=0,L=[],O=W?p:x,R=[];for(E=!1,c=!1,o=!1,cn=0;cn<pn;cn++)R[cn]=sn(C[cn]);for(rn=0;rn<pn;rn++){if($=Dn,L[rn]=An(C,R,L,rn),j=240&(Dn=O[$][D[L[rn]]]),Dn&=15,I[rn]=hn=O[Dn][5],j>0)if(j===16){for(cn=un;cn<rn;cn++)I[cn]=1;un=-1}else un=-1;if(O[Dn][6])un===-1&&(un=rn);else if(un>-1){for(cn=un;cn<rn;cn++)I[cn]=hn;un=-1}R[rn]==="B"&&(I[rn]=0),G.hiLevel|=hn}o&&function(B,Y,Q){for(var en=0;en<Q;en++)if(B[en]==="S"){Y[en]=W;for(var tn=en-1;tn>=0&&B[tn]==="WS";tn--)Y[tn]=W}}(R,I,pn)},an=function(C,I,G,j,cn){if(!(cn.hiLevel<C)){if(C===1&&W===1&&!c)return I.reverse(),void(G&&G.reverse());for(var rn,hn,$,un,pn=I.length,Dn=0;Dn<pn;){if(j[Dn]>=C){for($=Dn+1;$<pn&&j[$]>=C;)$++;for(un=Dn,hn=$-1;un<hn;un++,hn--)rn=I[un],I[un]=I[hn],I[hn]=rn,G&&(rn=G[un],G[un]=G[hn],G[hn]=rn);Dn=$}Dn++}}},mn=function(C,I,G){var j=C.split(""),cn={hiLevel:W};return G||(G=[]),q(j,G,cn),function(rn,hn,$){if($.hiLevel!==0&&v)for(var un,pn=0;pn<rn.length;pn++)hn[pn]===1&&(un=U.indexOf(rn[pn]))>=0&&(rn[pn]=U[un+1])}(j,G,cn),an(2,j,I,G,cn),an(1,j,I,G,cn),j.join("")};return this.__bidiEngine__.doBidiReorder=function(C,I,G){if(function(cn,rn){if(rn)for(var hn=0;hn<cn.length;hn++)rn[hn]=hn;d===void 0&&(d=dn(cn)),m===void 0&&(m=dn(cn))}(C,I),l||!h||m)if(l&&h&&d^m)W=d?1:0,C=nn(C,I,G);else if(!l&&h&&m)W=d?1:0,C=mn(C,I,G),C=nn(C,I);else if(!l||d||h||m){if(l&&!h&&d^m)C=nn(C,I),d?(W=0,C=mn(C,I,G)):(W=1,C=mn(C,I,G),C=nn(C,I));else if(l&&d&&!h&&m)W=1,C=mn(C,I,G),C=nn(C,I);else if(!l&&!h&&d^m){var j=v;d?(W=1,C=mn(C,I,G),W=0,v=!1,C=mn(C,I,G),v=j):(W=0,C=mn(C,I,G),C=nn(C,I),W=1,v=!1,C=mn(C,I,G),v=j,C=nn(C,I))}}else W=0,C=mn(C,I,G);else W=d?1:0,C=mn(C,I,G);return C},this.__bidiEngine__.setOptions=function(C){C&&(l=C.isInputVisual,h=C.isOutputVisual,d=C.isInputRtl,m=C.isOutputRtl,v=C.isSymmetricSwapping)},this.__bidiEngine__.setOptions(r),this.__bidiEngine__};var e=["BN","BN","BN","BN","BN","BN","BN","BN","BN","S","B","S","WS","B","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","B","B","B","S","WS","N","N","ET","ET","ET","N","N","N","N","N","ES","CS","ES","CS","CS","EN","EN","EN","EN","EN","EN","EN","EN","EN","EN","CS","N","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","N","BN","BN","BN","BN","BN","BN","B","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","BN","CS","N","ET","ET","ET","ET","N","N","N","N","L","N","N","BN","N","N","ET","ET","EN","EN","N","L","N","N","N","EN","L","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","L","L","L","L","L","L","L","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","L","N","N","N","N","N","ET","N","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","R","NSM","R","NSM","NSM","R","NSM","NSM","R","NSM","N","N","N","N","N","N","N","N","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","N","N","N","N","N","R","R","R","R","R","N","N","N","N","N","N","N","N","N","N","N","AN","AN","AN","AN","AN","AN","N","N","AL","ET","ET","AL","CS","AL","N","N","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","AL","AL","N","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","AN","AN","AN","AN","AN","AN","AN","AN","AN","AN","ET","AN","AN","AL","AL","AL","NSM","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","NSM","NSM","NSM","NSM","NSM","NSM","NSM","AN","N","NSM","NSM","NSM","NSM","NSM","NSM","AL","AL","NSM","NSM","N","NSM","NSM","NSM","NSM","AL","AL","EN","EN","EN","EN","EN","EN","EN","EN","EN","EN","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","N","AL","AL","NSM","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","N","N","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","AL","N","N","N","N","N","N","N","N","N","N","N","N","N","N","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","R","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","R","R","N","N","N","N","R","N","N","N","N","N","WS","WS","WS","WS","WS","WS","WS","WS","WS","WS","WS","BN","BN","BN","L","R","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","WS","B","LRE","RLE","PDF","LRO","RLO","CS","ET","ET","ET","ET","ET","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","CS","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","WS","BN","BN","BN","BN","BN","N","LRI","RLI","FSI","PDI","BN","BN","BN","BN","BN","BN","EN","L","N","N","EN","EN","EN","EN","EN","EN","ES","ES","N","N","N","L","EN","EN","EN","EN","EN","EN","EN","EN","EN","EN","ES","ES","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","ET","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","L","L","L","L","L","L","L","N","N","N","N","N","N","N","N","N","N","N","N","L","L","L","L","L","N","N","N","N","N","R","NSM","R","R","R","R","R","R","R","R","R","R","ES","R","R","R","R","R","R","R","R","R","R","R","R","R","N","R","R","R","R","R","N","R","N","R","R","N","R","R","N","R","R","R","R","R","R","R","R","R","R","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","NSM","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","CS","N","CS","N","N","CS","N","N","N","N","N","N","N","N","N","ET","N","N","ES","ES","N","N","N","N","N","ET","ET","N","N","N","N","N","AL","AL","AL","AL","AL","N","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","AL","N","N","BN","N","N","N","ET","ET","ET","N","N","N","N","N","ES","CS","ES","CS","CS","EN","EN","EN","EN","EN","EN","EN","EN","EN","EN","CS","N","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","N","N","N","N","N","N","N","N","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","L","N","N","N","L","L","L","L","L","L","N","N","L","L","L","L","L","L","N","N","L","L","L","L","L","L","N","N","L","L","L","N","N","N","ET","ET","N","N","N","ET","ET","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N","N"],t=new i.__bidiEngine__({isInputVisual:!0});i.API.events.push(["postProcessText",function(r){var c=r.text;r.x,r.y;var o=r.options||{};r.mutex,o.lang;var l=[];if(o.isInputVisual=typeof o.isInputVisual!="boolean"||o.isInputVisual,t.setOptions(o),Object.prototype.toString.call(c)==="[object Array]"){var d=0;for(l=[],d=0;d<c.length;d+=1)Object.prototype.toString.call(c[d])==="[object Array]"?l.push([t.doBidiReorder(c[d][0]),c[d][1],c[d][2]]):l.push([t.doBidiReorder(c[d])]);r.text=l}else r.text=t.doBidiReorder(c);t.setOptions({isInputVisual:!0})}])}(Hn),Hn.API.TTFFont=function(){function i(e){var t;if(this.rawData=e,t=this.contents=new Di(e),this.contents.pos=4,t.readString(4)==="ttcf")throw new Error("TTCF not supported.");t.pos=0,this.parse(),this.subset=new Ou(this),this.registerTTF()}return i.open=function(e){return new i(e)},i.prototype.parse=function(){return this.directory=new yu(this.contents),this.head=new bu(this),this.name=new ku(this),this.cmap=new Kc(this),this.toUnicode={},this.hhea=new wu(this),this.maxp=new Nu(this),this.hmtx=new Su(this),this.post=new xu(this),this.os2=new Au(this),this.loca=new _u(this),this.glyf=new Cu(this),this.ascender=this.os2.exists&&this.os2.ascender||this.hhea.ascender,this.decender=this.os2.exists&&this.os2.decender||this.hhea.decender,this.lineGap=this.os2.exists&&this.os2.lineGap||this.hhea.lineGap,this.bbox=[this.head.xMin,this.head.yMin,this.head.xMax,this.head.yMax]},i.prototype.registerTTF=function(){var e,t,r,c,o;if(this.scaleFactor=1e3/this.head.unitsPerEm,this.bbox=(function(){var l,d,h,m;for(m=[],l=0,d=(h=this.bbox).length;l<d;l++)e=h[l],m.push(Math.round(e*this.scaleFactor));return m}).call(this),this.stemV=0,this.post.exists?(r=255&(c=this.post.italic_angle),32768&(t=c>>16)&&(t=-(1+(65535^t))),this.italicAngle=+(t+"."+r)):this.italicAngle=0,this.ascender=Math.round(this.ascender*this.scaleFactor),this.decender=Math.round(this.decender*this.scaleFactor),this.lineGap=Math.round(this.lineGap*this.scaleFactor),this.capHeight=this.os2.exists&&this.os2.capHeight||this.ascender,this.xHeight=this.os2.exists&&this.os2.xHeight||0,this.familyClass=(this.os2.exists&&this.os2.familyClass||0)>>8,this.isSerif=(o=this.familyClass)===1||o===2||o===3||o===4||o===5||o===7,this.isScript=this.familyClass===10,this.flags=0,this.post.isFixedPitch&&(this.flags|=1),this.isSerif&&(this.flags|=2),this.isScript&&(this.flags|=8),this.italicAngle!==0&&(this.flags|=64),this.flags|=32,!this.cmap.unicode)throw new Error("No unicode cmap for font")},i.prototype.characterToGlyph=function(e){var t;return((t=this.cmap.unicode)!=null?t.codeMap[e]:void 0)||0},i.prototype.widthOfGlyph=function(e){var t;return t=1e3/this.head.unitsPerEm,this.hmtx.forGlyph(e).advance*t},i.prototype.widthOfString=function(e,t,r){var c,o,l,d;for(l=0,o=0,d=(e=""+e).length;0<=d?o<d:o>d;o=0<=d?++o:--o)c=e.charCodeAt(o),l+=this.widthOfGlyph(this.characterToGlyph(c))+r*(1e3/t)||0;return l*(t/1e3)},i.prototype.lineHeight=function(e,t){var r;return t==null&&(t=!1),r=t?this.lineGap:0,(this.ascender+r-this.decender)/1e3*e},i}();var zt,Di=function(){function i(e){this.data=e??[],this.pos=0,this.length=this.data.length}return i.prototype.readByte=function(){return this.data[this.pos++]},i.prototype.writeByte=function(e){return this.data[this.pos++]=e},i.prototype.readUInt32=function(){return 16777216*this.readByte()+(this.readByte()<<16)+(this.readByte()<<8)+this.readByte()},i.prototype.writeUInt32=function(e){return this.writeByte(e>>>24&255),this.writeByte(e>>16&255),this.writeByte(e>>8&255),this.writeByte(255&e)},i.prototype.readInt32=function(){var e;return(e=this.readUInt32())>=2147483648?e-4294967296:e},i.prototype.writeInt32=function(e){return e<0&&(e+=4294967296),this.writeUInt32(e)},i.prototype.readUInt16=function(){return this.readByte()<<8|this.readByte()},i.prototype.writeUInt16=function(e){return this.writeByte(e>>8&255),this.writeByte(255&e)},i.prototype.readInt16=function(){var e;return(e=this.readUInt16())>=32768?e-65536:e},i.prototype.writeInt16=function(e){return e<0&&(e+=65536),this.writeUInt16(e)},i.prototype.readString=function(e){var t,r;for(r=[],t=0;0<=e?t<e:t>e;t=0<=e?++t:--t)r[t]=String.fromCharCode(this.readByte());return r.join("")},i.prototype.writeString=function(e){var t,r,c;for(c=[],t=0,r=e.length;0<=r?t<r:t>r;t=0<=r?++t:--t)c.push(this.writeByte(e.charCodeAt(t)));return c},i.prototype.readShort=function(){return this.readInt16()},i.prototype.writeShort=function(e){return this.writeInt16(e)},i.prototype.readLongLong=function(){var e,t,r,c,o,l,d,h;return e=this.readByte(),t=this.readByte(),r=this.readByte(),c=this.readByte(),o=this.readByte(),l=this.readByte(),d=this.readByte(),h=this.readByte(),128&e?-1*(72057594037927940*(255^e)+281474976710656*(255^t)+1099511627776*(255^r)+4294967296*(255^c)+16777216*(255^o)+65536*(255^l)+256*(255^d)+(255^h)+1):72057594037927940*e+281474976710656*t+1099511627776*r+4294967296*c+16777216*o+65536*l+256*d+h},i.prototype.writeLongLong=function(e){var t,r;return t=Math.floor(e/4294967296),r=4294967295&e,this.writeByte(t>>24&255),this.writeByte(t>>16&255),this.writeByte(t>>8&255),this.writeByte(255&t),this.writeByte(r>>24&255),this.writeByte(r>>16&255),this.writeByte(r>>8&255),this.writeByte(255&r)},i.prototype.readInt=function(){return this.readInt32()},i.prototype.writeInt=function(e){return this.writeInt32(e)},i.prototype.read=function(e){var t,r;for(t=[],r=0;0<=e?r<e:r>e;r=0<=e?++r:--r)t.push(this.readByte());return t},i.prototype.write=function(e){var t,r,c,o;for(o=[],r=0,c=e.length;r<c;r++)t=e[r],o.push(this.writeByte(t));return o},i}(),yu=function(){var i;function e(t){var r,c,o;for(this.scalarType=t.readInt(),this.tableCount=t.readShort(),this.searchRange=t.readShort(),this.entrySelector=t.readShort(),this.rangeShift=t.readShort(),this.tables={},c=0,o=this.tableCount;0<=o?c<o:c>o;c=0<=o?++c:--c)r={tag:t.readString(4),checksum:t.readInt(),offset:t.readInt(),length:t.readInt()},this.tables[r.tag]=r}return e.prototype.encode=function(t){var r,c,o,l,d,h,m,v,b,x,p,D,P;for(P in p=Object.keys(t).length,h=Math.log(2),b=16*Math.floor(Math.log(p)/h),l=Math.floor(b/h),v=16*p-b,(c=new Di).writeInt(this.scalarType),c.writeShort(p),c.writeShort(b),c.writeShort(l),c.writeShort(v),o=16*p,m=c.pos+o,d=null,D=[],t)for(x=t[P],c.writeString(P),c.writeInt(i(x)),c.writeInt(m),c.writeInt(x.length),D=D.concat(x),P==="head"&&(d=m),m+=x.length;m%4;)D.push(0),m++;return c.write(D),r=2981146554-i(c.data),c.pos=d+8,c.writeUInt32(r),c.data},i=function(t){var r,c,o,l;for(t=Xc.call(t);t.length%4;)t.push(0);for(o=new Di(t),c=0,r=0,l=t.length;r<l;r=r+=4)c+=o.readUInt32();return 4294967295&c},e}(),vu={}.hasOwnProperty,ti=function(i,e){for(var t in e)vu.call(e,t)&&(i[t]=e[t]);function r(){this.constructor=i}return r.prototype=e.prototype,i.prototype=new r,i.__super__=e.prototype,i};zt=function(){function i(e){var t;this.file=e,t=this.file.directory.tables[this.tag],this.exists=!!t,t&&(this.offset=t.offset,this.length=t.length,this.parse(this.file.contents))}return i.prototype.parse=function(){},i.prototype.encode=function(){},i.prototype.raw=function(){return this.exists?(this.file.contents.pos=this.offset,this.file.contents.read(this.length)):null},i}();var bu=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="head",e.prototype.parse=function(t){return t.pos=this.offset,this.version=t.readInt(),this.revision=t.readInt(),this.checkSumAdjustment=t.readInt(),this.magicNumber=t.readInt(),this.flags=t.readShort(),this.unitsPerEm=t.readShort(),this.created=t.readLongLong(),this.modified=t.readLongLong(),this.xMin=t.readShort(),this.yMin=t.readShort(),this.xMax=t.readShort(),this.yMax=t.readShort(),this.macStyle=t.readShort(),this.lowestRecPPEM=t.readShort(),this.fontDirectionHint=t.readShort(),this.indexToLocFormat=t.readShort(),this.glyphDataFormat=t.readShort()},e.prototype.encode=function(t){var r;return(r=new Di).writeInt(this.version),r.writeInt(this.revision),r.writeInt(this.checkSumAdjustment),r.writeInt(this.magicNumber),r.writeShort(this.flags),r.writeShort(this.unitsPerEm),r.writeLongLong(this.created),r.writeLongLong(this.modified),r.writeShort(this.xMin),r.writeShort(this.yMin),r.writeShort(this.xMax),r.writeShort(this.yMax),r.writeShort(this.macStyle),r.writeShort(this.lowestRecPPEM),r.writeShort(this.fontDirectionHint),r.writeShort(t),r.writeShort(this.glyphDataFormat),r.data},e}(),Cc=function(){function i(e,t){var r,c,o,l,d,h,m,v,b,x,p,D,P,U,S,E,W;switch(this.platformID=e.readUInt16(),this.encodingID=e.readShort(),this.offset=t+e.readInt(),b=e.pos,e.pos=this.offset,this.format=e.readUInt16(),this.length=e.readUInt16(),this.language=e.readUInt16(),this.isUnicode=this.platformID===3&&this.encodingID===1&&this.format===4||this.platformID===0&&this.format===4,this.codeMap={},this.format){case 0:for(h=0;h<256;++h)this.codeMap[h]=e.readByte();break;case 4:for(p=e.readUInt16(),x=p/2,e.pos+=6,o=function(){var sn,dn;for(dn=[],h=sn=0;0<=x?sn<x:sn>x;h=0<=x?++sn:--sn)dn.push(e.readUInt16());return dn}(),e.pos+=2,P=function(){var sn,dn;for(dn=[],h=sn=0;0<=x?sn<x:sn>x;h=0<=x?++sn:--sn)dn.push(e.readUInt16());return dn}(),m=function(){var sn,dn;for(dn=[],h=sn=0;0<=x?sn<x:sn>x;h=0<=x?++sn:--sn)dn.push(e.readUInt16());return dn}(),v=function(){var sn,dn;for(dn=[],h=sn=0;0<=x?sn<x:sn>x;h=0<=x?++sn:--sn)dn.push(e.readUInt16());return dn}(),c=(this.length-e.pos+this.offset)/2,d=function(){var sn,dn;for(dn=[],h=sn=0;0<=c?sn<c:sn>c;h=0<=c?++sn:--sn)dn.push(e.readUInt16());return dn}(),h=S=0,W=o.length;S<W;h=++S)for(U=o[h],r=E=D=P[h];D<=U?E<=U:E>=U;r=D<=U?++E:--E)v[h]===0?l=r+m[h]:(l=d[v[h]/2+(r-D)-(x-h)]||0)!==0&&(l+=m[h]),this.codeMap[r]=65535&l}e.pos=b}return i.encode=function(e,t){var r,c,o,l,d,h,m,v,b,x,p,D,P,U,S,E,W,sn,dn,An,nn,q,an,mn,C,I,G,j,cn,rn,hn,$,un,pn,Dn,L,O,R,B,Y,Q,en,tn,kn,Ln,_n;switch(j=new Di,l=Object.keys(e).sort(function(Cn,zn){return Cn-zn}),t){case"macroman":for(P=0,U=function(){var Cn=[];for(D=0;D<256;++D)Cn.push(0);return Cn}(),E={0:0},o={},cn=0,un=l.length;cn<un;cn++)E[tn=e[c=l[cn]]]==null&&(E[tn]=++P),o[c]={old:e[c],new:E[e[c]]},U[c]=E[e[c]];return j.writeUInt16(1),j.writeUInt16(0),j.writeUInt32(12),j.writeUInt16(0),j.writeUInt16(262),j.writeUInt16(0),j.write(U),{charMap:o,subtable:j.data,maxGlyphID:P+1};case"unicode":for(I=[],b=[],W=0,E={},r={},S=m=null,rn=0,pn=l.length;rn<pn;rn++)E[dn=e[c=l[rn]]]==null&&(E[dn]=++W),r[c]={old:dn,new:E[dn]},d=E[dn]-c,S!=null&&d===m||(S&&b.push(S),I.push(c),m=d),S=c;for(S&&b.push(S),b.push(65535),I.push(65535),mn=2*(an=I.length),q=2*Math.pow(Math.log(an)/Math.LN2,2),x=Math.log(q/2)/Math.LN2,nn=2*an-q,h=[],An=[],p=[],D=hn=0,Dn=I.length;hn<Dn;D=++hn){if(C=I[D],v=b[D],C===65535){h.push(0),An.push(0);break}if(C-(G=r[C].new)>=32768)for(h.push(0),An.push(2*(p.length+an-D)),c=$=C;C<=v?$<=v:$>=v;c=C<=v?++$:--$)p.push(r[c].new);else h.push(G-C),An.push(0)}for(j.writeUInt16(3),j.writeUInt16(1),j.writeUInt32(12),j.writeUInt16(4),j.writeUInt16(16+8*an+2*p.length),j.writeUInt16(0),j.writeUInt16(mn),j.writeUInt16(q),j.writeUInt16(x),j.writeUInt16(nn),Q=0,L=b.length;Q<L;Q++)c=b[Q],j.writeUInt16(c);for(j.writeUInt16(0),en=0,O=I.length;en<O;en++)c=I[en],j.writeUInt16(c);for(kn=0,R=h.length;kn<R;kn++)d=h[kn],j.writeUInt16(d);for(Ln=0,B=An.length;Ln<B;Ln++)sn=An[Ln],j.writeUInt16(sn);for(_n=0,Y=p.length;_n<Y;_n++)P=p[_n],j.writeUInt16(P);return{charMap:r,subtable:j.data,maxGlyphID:W+1}}},i}(),Kc=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="cmap",e.prototype.parse=function(t){var r,c,o;for(t.pos=this.offset,this.version=t.readUInt16(),o=t.readUInt16(),this.tables=[],this.unicode=null,c=0;0<=o?c<o:c>o;c=0<=o?++c:--c)r=new Cc(t,this.offset),this.tables.push(r),r.isUnicode&&this.unicode==null&&(this.unicode=r);return!0},e.encode=function(t,r){var c,o;return r==null&&(r="macroman"),c=Cc.encode(t,r),(o=new Di).writeUInt16(0),o.writeUInt16(1),c.table=o.data.concat(c.subtable),c},e}(),wu=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="hhea",e.prototype.parse=function(t){return t.pos=this.offset,this.version=t.readInt(),this.ascender=t.readShort(),this.decender=t.readShort(),this.lineGap=t.readShort(),this.advanceWidthMax=t.readShort(),this.minLeftSideBearing=t.readShort(),this.minRightSideBearing=t.readShort(),this.xMaxExtent=t.readShort(),this.caretSlopeRise=t.readShort(),this.caretSlopeRun=t.readShort(),this.caretOffset=t.readShort(),t.pos+=8,this.metricDataFormat=t.readShort(),this.numberOfMetrics=t.readUInt16()},e}(),Au=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="OS/2",e.prototype.parse=function(t){if(t.pos=this.offset,this.version=t.readUInt16(),this.averageCharWidth=t.readShort(),this.weightClass=t.readUInt16(),this.widthClass=t.readUInt16(),this.type=t.readShort(),this.ySubscriptXSize=t.readShort(),this.ySubscriptYSize=t.readShort(),this.ySubscriptXOffset=t.readShort(),this.ySubscriptYOffset=t.readShort(),this.ySuperscriptXSize=t.readShort(),this.ySuperscriptYSize=t.readShort(),this.ySuperscriptXOffset=t.readShort(),this.ySuperscriptYOffset=t.readShort(),this.yStrikeoutSize=t.readShort(),this.yStrikeoutPosition=t.readShort(),this.familyClass=t.readShort(),this.panose=function(){var r,c;for(c=[],r=0;r<10;++r)c.push(t.readByte());return c}(),this.charRange=function(){var r,c;for(c=[],r=0;r<4;++r)c.push(t.readInt());return c}(),this.vendorID=t.readString(4),this.selection=t.readShort(),this.firstCharIndex=t.readShort(),this.lastCharIndex=t.readShort(),this.version>0&&(this.ascent=t.readShort(),this.descent=t.readShort(),this.lineGap=t.readShort(),this.winAscent=t.readShort(),this.winDescent=t.readShort(),this.codePageRange=function(){var r,c;for(c=[],r=0;r<2;r=++r)c.push(t.readInt());return c}(),this.version>1))return this.xHeight=t.readShort(),this.capHeight=t.readShort(),this.defaultChar=t.readShort(),this.breakChar=t.readShort(),this.maxContext=t.readShort()},e}(),xu=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="post",e.prototype.parse=function(t){var r,c,o;switch(t.pos=this.offset,this.format=t.readInt(),this.italicAngle=t.readInt(),this.underlinePosition=t.readShort(),this.underlineThickness=t.readShort(),this.isFixedPitch=t.readInt(),this.minMemType42=t.readInt(),this.maxMemType42=t.readInt(),this.minMemType1=t.readInt(),this.maxMemType1=t.readInt(),this.format){case 65536:break;case 131072:var l;for(c=t.readUInt16(),this.glyphNameIndex=[],l=0;0<=c?l<c:l>c;l=0<=c?++l:--l)this.glyphNameIndex.push(t.readUInt16());for(this.names=[],o=[];t.pos<this.offset+this.length;)r=t.readByte(),o.push(this.names.push(t.readString(r)));return o;case 151552:return c=t.readUInt16(),this.offsets=t.read(c);case 196608:break;case 262144:return this.map=(function(){var d,h,m;for(m=[],l=d=0,h=this.file.maxp.numGlyphs;0<=h?d<h:d>h;l=0<=h?++d:--d)m.push(t.readUInt32());return m}).call(this)}},e}(),Lu=function(i,e){this.raw=i,this.length=i.length,this.platformID=e.platformID,this.encodingID=e.encodingID,this.languageID=e.languageID},ku=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="name",e.prototype.parse=function(t){var r,c,o,l,d,h,m,v,b,x,p;for(t.pos=this.offset,t.readShort(),r=t.readShort(),h=t.readShort(),c=[],l=0;0<=r?l<r:l>r;l=0<=r?++l:--l)c.push({platformID:t.readShort(),encodingID:t.readShort(),languageID:t.readShort(),nameID:t.readShort(),length:t.readShort(),offset:this.offset+h+t.readShort()});for(m={},l=b=0,x=c.length;b<x;l=++b)o=c[l],t.pos=o.offset,v=t.readString(o.length),d=new Lu(v,o),m[p=o.nameID]==null&&(m[p]=[]),m[o.nameID].push(d);this.strings=m,this.copyright=m[0],this.fontFamily=m[1],this.fontSubfamily=m[2],this.uniqueSubfamily=m[3],this.fontName=m[4],this.version=m[5];try{this.postscriptName=m[6][0].raw.replace(/[\x00-\x19\x80-\xff]/g,"")}catch{this.postscriptName=m[4][0].raw.replace(/[\x00-\x19\x80-\xff]/g,"")}return this.trademark=m[7],this.manufacturer=m[8],this.designer=m[9],this.description=m[10],this.vendorUrl=m[11],this.designerUrl=m[12],this.license=m[13],this.licenseUrl=m[14],this.preferredFamily=m[15],this.preferredSubfamily=m[17],this.compatibleFull=m[18],this.sampleText=m[19]},e}(),Nu=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="maxp",e.prototype.parse=function(t){return t.pos=this.offset,this.version=t.readInt(),this.numGlyphs=t.readUInt16(),this.maxPoints=t.readUInt16(),this.maxContours=t.readUInt16(),this.maxCompositePoints=t.readUInt16(),this.maxComponentContours=t.readUInt16(),this.maxZones=t.readUInt16(),this.maxTwilightPoints=t.readUInt16(),this.maxStorage=t.readUInt16(),this.maxFunctionDefs=t.readUInt16(),this.maxInstructionDefs=t.readUInt16(),this.maxStackElements=t.readUInt16(),this.maxSizeOfInstructions=t.readUInt16(),this.maxComponentElements=t.readUInt16(),this.maxComponentDepth=t.readUInt16()},e}(),Su=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="hmtx",e.prototype.parse=function(t){var r,c,o,l,d,h,m;for(t.pos=this.offset,this.metrics=[],r=0,h=this.file.hhea.numberOfMetrics;0<=h?r<h:r>h;r=0<=h?++r:--r)this.metrics.push({advance:t.readUInt16(),lsb:t.readInt16()});for(o=this.file.maxp.numGlyphs-this.file.hhea.numberOfMetrics,this.leftSideBearings=function(){var v,b;for(b=[],r=v=0;0<=o?v<o:v>o;r=0<=o?++v:--v)b.push(t.readInt16());return b}(),this.widths=(function(){var v,b,x,p;for(p=[],v=0,b=(x=this.metrics).length;v<b;v++)l=x[v],p.push(l.advance);return p}).call(this),c=this.widths[this.widths.length-1],m=[],r=d=0;0<=o?d<o:d>o;r=0<=o?++d:--d)m.push(this.widths.push(c));return m},e.prototype.forGlyph=function(t){return t in this.metrics?this.metrics[t]:{advance:this.metrics[this.metrics.length-1].advance,lsb:this.leftSideBearings[t-this.metrics.length]}},e}(),Xc=[].slice,Cu=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="glyf",e.prototype.parse=function(){return this.cache={}},e.prototype.glyphFor=function(t){var r,c,o,l,d,h,m,v,b,x;return t in this.cache?this.cache[t]:(l=this.file.loca,r=this.file.contents,c=l.indexOf(t),(o=l.lengthOf(t))===0?this.cache[t]=null:(r.pos=this.offset+c,d=(h=new Di(r.read(o))).readShort(),v=h.readShort(),x=h.readShort(),m=h.readShort(),b=h.readShort(),this.cache[t]=d===-1?new Iu(h,v,x,m,b):new Pu(h,d,v,x,m,b),this.cache[t]))},e.prototype.encode=function(t,r,c){var o,l,d,h,m;for(d=[],l=[],h=0,m=r.length;h<m;h++)o=t[r[h]],l.push(d.length),o&&(d=d.concat(o.encode(c)));return l.push(d.length),{table:d,offsets:l}},e}(),Pu=function(){function i(e,t,r,c,o,l){this.raw=e,this.numberOfContours=t,this.xMin=r,this.yMin=c,this.xMax=o,this.yMax=l,this.compound=!1}return i.prototype.encode=function(){return this.raw.data},i}(),Iu=function(){function i(e,t,r,c,o){var l,d;for(this.raw=e,this.xMin=t,this.yMin=r,this.xMax=c,this.yMax=o,this.compound=!0,this.glyphIDs=[],this.glyphOffsets=[],l=this.raw;d=l.readShort(),this.glyphOffsets.push(l.pos),this.glyphIDs.push(l.readUInt16()),32&d;)l.pos+=1&d?4:2,128&d?l.pos+=8:64&d?l.pos+=4:8&d&&(l.pos+=2)}return i.prototype.encode=function(){var e,t,r;for(t=new Di(Xc.call(this.raw.data)),e=0,r=this.glyphIDs.length;e<r;++e)t.pos=this.glyphOffsets[e];return t.data},i}(),_u=function(i){function e(){return e.__super__.constructor.apply(this,arguments)}return ti(e,zt),e.prototype.tag="loca",e.prototype.parse=function(t){var r,c;return t.pos=this.offset,r=this.file.head.indexToLocFormat,this.offsets=r===0?(function(){var o,l;for(l=[],c=0,o=this.length;c<o;c+=2)l.push(2*t.readUInt16());return l}).call(this):(function(){var o,l;for(l=[],c=0,o=this.length;c<o;c+=4)l.push(t.readUInt32());return l}).call(this)},e.prototype.indexOf=function(t){return this.offsets[t]},e.prototype.lengthOf=function(t){return this.offsets[t+1]-this.offsets[t]},e.prototype.encode=function(t,r){for(var c=new Uint32Array(this.offsets.length),o=0,l=0,d=0;d<c.length;++d)if(c[d]=o,l<r.length&&r[l]==d){++l,c[d]=o;var h=this.offsets[d],m=this.offsets[d+1]-h;m>0&&(o+=m)}for(var v=new Array(4*c.length),b=0;b<c.length;++b)v[4*b+3]=255&c[b],v[4*b+2]=(65280&c[b])>>8,v[4*b+1]=(16711680&c[b])>>16,v[4*b]=(4278190080&c[b])>>24;return v},e}(),Ou=function(){function i(e){this.font=e,this.subset={},this.unicodes={},this.next=33}return i.prototype.generateCmap=function(){var e,t,r,c,o;for(t in c=this.font.cmap.tables[0].codeMap,e={},o=this.subset)r=o[t],e[t]=c[r];return e},i.prototype.glyphsFor=function(e){var t,r,c,o,l,d,h;for(c={},l=0,d=e.length;l<d;l++)c[o=e[l]]=this.font.glyf.glyphFor(o);for(o in t=[],c)(r=c[o])!=null&&r.compound&&t.push.apply(t,r.glyphIDs);if(t.length>0)for(o in h=this.glyphsFor(t))r=h[o],c[o]=r;return c},i.prototype.encode=function(e,t){var r,c,o,l,d,h,m,v,b,x,p,D,P,U,S;for(c in r=Kc.encode(this.generateCmap(),"unicode"),l=this.glyphsFor(e),p={0:0},S=r.charMap)p[(h=S[c]).old]=h.new;for(D in x=r.maxGlyphID,l)D in p||(p[D]=x++);return v=function(E){var W,sn;for(W in sn={},E)sn[E[W]]=W;return sn}(p),b=Object.keys(v).sort(function(E,W){return E-W}),P=function(){var E,W,sn;for(sn=[],E=0,W=b.length;E<W;E++)d=b[E],sn.push(v[d]);return sn}(),o=this.font.glyf.encode(l,P,p),m=this.font.loca.encode(o.offsets,P),U={cmap:this.font.cmap.raw(),glyf:o.table,loca:m,hmtx:this.font.hmtx.raw(),hhea:this.font.hhea.raw(),maxp:this.font.maxp.raw(),post:this.font.post.raw(),name:this.font.name.raw(),head:this.font.head.encode(t)},this.font.os2.exists&&(U["OS/2"]=this.font.os2.raw()),this.font.directory.encode(U)},i}();Hn.API.PDFObject=function(){var i;function e(){}return i=function(t,r){return(Array(r+1).join("0")+t).slice(-r)},e.convert=function(t){var r,c,o,l;if(Array.isArray(t))return"["+function(){var d,h,m;for(m=[],d=0,h=t.length;d<h;d++)r=t[d],m.push(e.convert(r));return m}().join(" ")+"]";if(typeof t=="string")return"/"+t;if(t!=null&&t.isString)return"("+t+")";if(t instanceof Date)return"(D:"+i(t.getUTCFullYear(),4)+i(t.getUTCMonth(),2)+i(t.getUTCDate(),2)+i(t.getUTCHours(),2)+i(t.getUTCMinutes(),2)+i(t.getUTCSeconds(),2)+"Z)";if({}.toString.call(t)==="[object Object]"){for(c in o=["<<"],t)l=t[c],o.push("/"+c+" "+e.convert(l));return o.push(">>"),o.join(`
`)}return""+t},e}();const Mu=`[
  {
    "name": "Acacia confusa",
    "category": "Ritual / Visionary",
    "contraindications": "Mental health conditions, SSRIs/MAOIs",
    "description": "A Taiwanese tree whose root bark is rich in DMT and related tryptamines. Commonly used in DIY Ayahuasca analogs or 'Anahuasca' brews.",
    "drugInteractions": "MAOIs, antidepressants — risky",
    "duration": "4–6 hrs",
    "effects": [
      "Visual distortion",
      "mystical states",
      "introspection"
    ],
    "id": "acacia-confusa",
    "intensity": "Strong",
    "legalStatus": "DMT restricted in many countries",
    "mechanismOfAction": "DMT – 5-HT2A agonist; requires MAOI for oral activity",
    "onset": "20–45 min",
    "pharmacokinetics": "Onset: 20–45 min (oral w/ MAOI); Duration: 4–6 hrs",
    "preparation": "Root bark boiled with MAOI plant (e.g. Syrian Rue) to activate",
    "region": "Taiwan, Philippines, Pacific Islands",
    "safetyRating": "high",
    "scientificName": "Acacia confusa",
    "sideEffects": "Strong visuals, nausea, anxiety",
    "tags": [
      "⚠️ caution",
      "🌿 root bark",
      "🧪 dmt"
    ],
    "therapeuticUses": "Spiritual exploration, traditional cleansing (when combined with MAOI)",
    "toxicity": "Low physiological, high psychological risk",
    "toxicityLD50": "Not established",
    "activeConstituents": [
      {
        "name": "DMT",
        "type": "tryptamine",
        "effect": "potent visionary"
      }
    ],
    "affiliateLink": "",
    "slug": "acacia-confusa",
    "tagCount": 3
  },
  {
    "name": "Acorus gramineus",
    "category": "Ethnobotanical / Rare",
    "contraindications": "Pregnancy, long-term use caution due to β-asarone.",
    "description": "Asian sweet flag containing β-asarone, sometimes taken for cognition.",
    "drugInteractions": "May enhance CNS depressants.",
    "duration": "Unknown",
    "effects": [
      "Cognitive clarity",
      "trippy effects (debated)"
    ],
    "id": "acorus-gramineus",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Contains β-asarone; may modulate acetylcholine and GABA pathways; traditional use for cognition.",
    "onset": "15-45 min",
    "pharmacokinetics": "Oral tea or tincture; slow onset (~1 hr); mild duration (2–3 hrs).",
    "preparation": "Tea or chewed",
    "region": "🇨🇳 East Asia",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Nausea at high doses, possible carcinogenic risk with long-term β-asarone exposure.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💊 oral",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Cognitive enhancement, anxiety, neuroprotective potential.",
    "toxicity": "Concerns over β-asarone carcinogenicity in some studies.",
    "toxicityLD50": "β-asarone LD50 (rat, oral): ~310 mg/kg.",
    "affiliateLink": "",
    "slug": "acorus-gramineus",
    "tagCount": 4
  },
  {
    "name": "African Dream Root",
    "category": "Oneirogen",
    "contraindications": "None well established",
    "description": "A sacred dream-enhancing root used by the Xhosa people of South Africa to induce powerful and meaningful dreams.",
    "drugInteractions": "Unknown",
    "duration": "During REM sleep",
    "effects": [
      "Vivid dreams",
      "lucidity",
      "spiritual connection"
    ],
    "id": "african-dream-root",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Likely saponins and triterpenoids affecting sleep cycles",
    "onset": "During sleep",
    "pharmacokinetics": "Onset: Sleep onset; Duration: dream state",
    "preparation": "Root is soaked and whipped into a frothy tea",
    "region": "South Africa",
    "safetyRating": "low",
    "scientificName": "Silene capensis",
    "sideEffects": "Mild nausea or grogginess if overdosed",
    "tags": [
      "✅ safe",
      "🌙 dream",
      "🧘 ancestral"
    ],
    "therapeuticUses": "Dream recall, ancestral communication (traditional)",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "african-dream-root",
    "tagCount": 3
  },
  {
    "name": "Alchornea castaneifolia",
    "category": "Ritual / Visionary",
    "contraindications": "Pregnancy",
    "description": "Used in Amazonian shamanic rituals for its spiritual and anti-inflammatory effects. Often included in Ayahuasca blends.",
    "drugInteractions": "Unknown",
    "duration": "2–6 hrs",
    "effects": [
      "Anti-inflammatory",
      "spiritual clarity",
      "energetic cleansing"
    ],
    "id": "alchornea-castaneifolia",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Unknown; may involve tannins and flavonoids",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–6 hrs",
    "preparation": "Bark decoction or infused in Ayahuasca",
    "region": "Amazon basin",
    "safetyRating": "low",
    "scientificName": "Alchornea castaneifolia",
    "sideEffects": "Minimal; bitter taste",
    "tags": [
      "✅ safe",
      "🌿 amazon",
      "🧘 cleanse"
    ],
    "therapeuticUses": "Rheumatism, arthritis, spiritual cleansing",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "alchornea-castaneifolia",
    "tagCount": 3
  },
  {
    "name": "Anadenanthera colubrina (Cebíl)",
    "category": "Ethnobotanical / Rare",
    "contraindications": "Cardiovascular disorders, psychiatric conditions, and pregnancy.",
    "description": "South American tree whose snuffable seeds contain bufotenin.",
    "drugInteractions": "Concomitant use with SSRIs or MAOIs may risk serotonin syndrome [1, 0].",
    "duration": "Unknown",
    "effects": [
      "Entheogenic snuff",
      "alternate reality feel"
    ],
    "id": "anadenanthera-colubrina-cebl",
    "intensity": "High",
    "legalStatus": "Restricted in many regions",
    "mechanismOfAction": "Bufotenin acts as a potent and non-selective serotonin receptor agonist at 5-HT₁A, 5-HT₂A, 5-HT₂C, and 5-HT₃ receptors, and serves as a specific serotonin releasing agent [1, 0].",
    "onset": "Varies",
    "pharmacokinetics": "When insufflated, bufotenin is rapidly absorbed nasally with onset in 5–15 min and duration around 1–2 h [1, 1].",
    "preparation": "South American use",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Prominent cardiovascular changes, nausea, vomiting, and dizziness [1, 0, 1, 1].",
    "tags": [
      "⚠️ restricted"
    ],
    "therapeuticUses": "Traditionally used as a snuff for visionary and divinatory rituals in South American cultures [1, 1].",
    "toxicity": "No documented human LD50; rodent LD50 approximately 200–300 mg/kg (intraperitoneal) [1, 0].",
    "toxicityLD50": "No documented human LD50; rodent LD50 approximately 200–300 mg/kg (intraperitoneal) [1, 0].",
    "affiliateLink": "",
    "slug": "anadenanthera-colubrina-cebl",
    "tagCount": 1
  },
  {
    "name": "Artemisia vulgaris (Mugwort)",
    "category": "Oneirogen",
    "contraindications": "Not well documented",
    "description": "Common European mugwort used in dream pillows and as bitter tonic.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Lucid dreaming",
      "light hallucinations"
    ],
    "id": "artemisia-vulgaris-mugwort",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "5-15 min",
    "pharmacokinetics": "Not well documented",
    "preparation": "Smoke, tea, or ritual incense",
    "region": "🇪🇺 Europe",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌬️ smokable",
      "🕯️ ritual",
      "🧠 dream"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "artemisia-vulgaris-mugwort",
    "tagCount": 5
  },
  {
    "name": "Bacopa monnieri",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, lactation, hypersensitivity to any component [0, 5].",
    "description": "Aquatic herb taken long-term to improve memory and concentration.",
    "drugInteractions": "No major interactions documented; caution with sedatives [0, 5].",
    "duration": "Unknown",
    "effects": [
      "Memory enhancer",
      "mild calming"
    ],
    "id": "bacopa-monnieri",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Contains bacosides A and B which enhance cholinergic transmission, antioxidant defenses, and modulate neurotransmitter levels (serotonin, dopamine) [0, 0, 0, 2].",
    "onset": "30-60 min",
    "pharmacokinetics": "Oral preparations (extracts or powder); onset 30–60 min; requires chronic dosing for peak cognitive benefits [0, 5].",
    "preparation": "Tea, capsule",
    "region": "🇮🇳 India",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Gastrointestinal upset (nausea, increased motility), fatigue, dry mouth [0, 5].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💊 oral",
      "💫 euphoria",
      "🧘 sedation"
    ],
    "therapeuticUses": "Cognitive enhancement (memory, learning), anxiety reduction, ADHD management [0, 1, 0, 6].",
    "toxicity": "Generally non-toxic; no serious adverse effects at recommended doses; rodent LD50 not well established [0, 6].",
    "toxicityLD50": "Generally non-toxic; no serious adverse effects at recommended doses; rodent LD50 not well established [0, 6].",
    "affiliateLink": "",
    "slug": "bacopa-monnieri",
    "tagCount": 5
  },
  {
    "name": "Belladonna",
    "category": "Deliriant / Toxic",
    "contraindications": "Cardiovascular disease, glaucoma, pregnancy.",
    "description": "Deadly nightshade once used for trance and as a cosmetic poison.",
    "drugInteractions": "CNS depressants, anticholinergic drugs.",
    "duration": "Unknown",
    "effects": [
      "Hallucinations",
      "dreamlike confusion"
    ],
    "id": "belladonna",
    "intensity": "High",
    "legalStatus": "Controlled / Toxic",
    "mechanismOfAction": "Tropane alkaloids block acetylcholine; causes anticholinergic delirium.",
    "onset": "Varies",
    "pharmacokinetics": "Oral or topical; onset ~30–90 mins; effects last 4–12 hrs.",
    "preparation": "Highly toxic – not for casual use",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Dry mouth, hallucinations, delirium, elevated pulse.",
    "tags": [
      "☠️ toxic"
    ],
    "therapeuticUses": "Historically used for pain, muscle spasms, and cosmetic dilation.",
    "toxicity": "Highly toxic; accidental ingestion can be fatal.",
    "toxicityLD50": "Atropine LD50 (rat, oral): ~453 mg/kg.",
    "affiliateLink": "",
    "slug": "belladonna",
    "tagCount": 1
  },
  {
    "name": "Betel Nut",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, cardiovascular conditions",
    "description": "A widely used masticatory stimulant in Asia and the Pacific, often combined with lime and betel leaf.",
    "drugInteractions": "Stimulants, parasympathomimetics",
    "duration": "Unknown",
    "effects": [
      "Stimulation",
      "warmth",
      "mild euphoria"
    ],
    "id": "betel-nut",
    "intensity": "Unknown",
    "legalStatus": "Unknown",
    "mechanismOfAction": "Arecoline acts as a muscarinic cholinergic agonist",
    "onset": "Unknown",
    "pharmacokinetics": "Not well documented",
    "preparation": "Chewed with lime and leaf",
    "region": "South and Southeast Asia",
    "safetyRating": "Unknown",
    "scientificName": "Areca catechu",
    "sideEffects": "Addiction, oral cancer with chronic use",
    "tags": [],
    "therapeuticUses": "Traditional digestive stimulant",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "betel-nut",
    "tagCount": 0
  },
  {
    "name": "Blue Lotus",
    "category": "Oneirogen",
    "contraindications": "Pregnancy",
    "description": "Sacred Egyptian flower associated with dream states and aphrodisiac properties. Contains aporphine alkaloids.",
    "drugInteractions": "Avoid sedatives",
    "duration": "2–4 hrs",
    "effects": [
      "Mild euphoria",
      "lucid dreaming",
      "relaxation"
    ],
    "id": "blue-lotus",
    "intensity": "Mild",
    "legalStatus": "Legal in most countries",
    "mechanismOfAction": "Aporphine acts as dopamine receptor agonist",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 2–4 hrs",
    "preparation": "Tea, wine soak, or vaporized",
    "region": "Egypt, India",
    "safetyRating": "low",
    "scientificName": "Nymphaea caerulea",
    "sideEffects": "Mild drowsiness, vivid dreams",
    "tags": [
      "✅ safe",
      "🌸 calm",
      "😊 euphoria"
    ],
    "therapeuticUses": "Anxiety, mild sedation, aphrodisiac",
    "toxicity": "Low",
    "toxicityLD50": "Not known",
    "affiliateLink": "",
    "slug": "blue-lotus",
    "tagCount": 3
  },
  {
    "name": "Blue Lotus (Nymphaea caerulea)",
    "category": "Other",
    "contraindications": "Pregnancy, avoid with dopaminergic drugs.",
    "description": "Sacred water lily delivering gentle euphoria and relaxation.",
    "drugInteractions": "Potential additive effects with CNS depressants.",
    "duration": "Unknown",
    "effects": [
      "Euphoria",
      "aphrodisiac",
      "dreamy calm"
    ],
    "id": "blue-lotus-nymphaea-caerulea",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Contains aporphine and nuciferine; dopamine receptor modulation and mild sedative effect.",
    "onset": "1-5 min",
    "pharmacokinetics": "Smoked or soaked in wine; onset rapid (5–20 min); duration ~1–3 hrs.",
    "preparation": "Wine soak, smoke, tea",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Drowsiness, mild dizziness at high doses.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌬️ smokable",
      "🧘 sedation"
    ],
    "therapeuticUses": "Mild euphoria, anxiety relief, and aphrodisiac in traditional use.",
    "toxicity": "Low toxicity; no serious effects reported from traditional use.",
    "toxicityLD50": "Not established; no reported lethal doses.",
    "affiliateLink": "",
    "slug": "blue-lotus-nymphaea-caerulea",
    "tagCount": 4
  },
  {
    "name": "Bobinsana",
    "category": "Ritual / Visionary",
    "contraindications": "Pregnancy, psychiatric disorders",
    "description": "A flowering Amazonian shrub used in master plant dieta and as an adjunct to Ayahuasca ceremonies for emotional healing and dream clarity.",
    "drugInteractions": "Unknown; caution with serotonergics",
    "duration": "2–6 hrs",
    "effects": [
      "Heart-opening",
      "emotional clarity",
      "mild euphoria"
    ],
    "id": "bobinsana",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Unknown; possibly serotonergic modulation or mild MAOI",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–6 hrs",
    "preparation": "Decoction from bark or leaves in dieta; often macerated",
    "region": "Amazon basin (Peru, Ecuador)",
    "safetyRating": "low",
    "scientificName": "Calliandra angustifolia",
    "sideEffects": "Drowsiness, mild emotional vulnerability",
    "tags": [
      "✅ safe",
      "🌿 herbal",
      "🧘 calm"
    ],
    "therapeuticUses": "Emotional trauma healing, dream support",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "bobinsana",
    "tagCount": 3
  },
  {
    "name": "Brugmansia",
    "category": "Ritual / Visionary",
    "contraindications": "All unsupervised use",
    "description": "Powerful and dangerous deliriant used in South American shamanism. Highly toxic and not recommended for casual use.",
    "drugInteractions": "Anticholinergics, CNS depressants",
    "duration": "Unknown",
    "effects": [
      "Hallucinations",
      "delirium",
      "disorientation"
    ],
    "id": "brugmansia",
    "intensity": "Unknown",
    "legalStatus": "Unknown",
    "mechanismOfAction": "Tropane alkaloids (scopolamine, atropine)",
    "onset": "Unknown",
    "pharmacokinetics": "Not well documented",
    "preparation": "Smoked or brewed (shamanic contexts only)",
    "region": "South America",
    "safetyRating": "Unknown",
    "scientificName": "Brugmansia suaveolens",
    "sideEffects": "Extreme confusion, memory loss, risk of death",
    "tags": [],
    "therapeuticUses": "Historical use in asthma and pain (no modern safe use)",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "brugmansia",
    "tagCount": 0
  },
  {
    "name": "Caapi",
    "category": "Ritual / Visionary",
    "contraindications": "SSRIs, MAOIs, pregnancy",
    "description": "The vine of the soul used in Ayahuasca. Contains harmala alkaloids and facilitates DMT absorption in the brew.",
    "drugInteractions": "All serotonergic substances",
    "duration": "Unknown",
    "effects": [
      "MAOI effects",
      "spiritual opening",
      "purging"
    ],
    "id": "caapi",
    "intensity": "Unknown",
    "legalStatus": "Unknown",
    "mechanismOfAction": "Reversible MAO-A inhibition (harmine, harmaline)",
    "onset": "Unknown",
    "pharmacokinetics": "Not well documented",
    "preparation": "Brewed with DMT-containing plants",
    "region": "Amazon basin",
    "safetyRating": "Unknown",
    "scientificName": "Banisteriopsis caapi",
    "sideEffects": "Nausea, purging, dizziness",
    "tags": [],
    "therapeuticUses": "Ayahuasca therapy for PTSD, depression",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "caapi",
    "tagCount": 0
  },
  {
    "name": "Calea zacatechichi",
    "category": "Oneirogen",
    "contraindications": "Pregnancy, sedative use",
    "description": "Known as the 'dream herb' of the Chontal people of Mexico, Calea is traditionally used to enhance dreams and mental clarity during sleep.",
    "drugInteractions": "Avoid sedatives, alcohol",
    "duration": "4–8 hrs",
    "effects": [
      "Lucid dreaming",
      "dream recall",
      "hypnagogic imagery"
    ],
    "id": "calea-zacatechichi",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "May modulate GABAergic or cholinergic pathways; unclear",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 4–8 hrs",
    "preparation": "Tea from dried leaves or smoked before bed",
    "region": "Mexico, Central America",
    "safetyRating": "low",
    "scientificName": "Calea ternifolia (zacatechichi)",
    "sideEffects": "Bitterness, mild nausea",
    "tags": [
      "✅ safe",
      "🌙 dream",
      "🧘 calm"
    ],
    "therapeuticUses": "Sleep induction, dream work",
    "toxicity": "Low",
    "toxicityLD50": "Not known",
    "affiliateLink": "",
    "slug": "calea-zacatechichi",
    "tagCount": 3
  },
  {
    "name": "California Poppy",
    "category": "Dissociative / Sedative",
    "contraindications": "Not for use in pregnancy or with other CNS depressants.",
    "description": "California's state flower containing non-addictive sedative alkaloids.",
    "drugInteractions": "May amplify effects of benzodiazepines and alcohol.",
    "duration": "Unknown",
    "effects": [
      "Gentle sedative",
      "dreamlike calm"
    ],
    "id": "california-poppy",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Mild GABAergic activity and opioid receptor affinity (non-narcotic).",
    "onset": "15-45 min",
    "pharmacokinetics": "Oral (tea or tincture); onset ~30 min; lasts 2–3 hrs.",
    "preparation": "Tea, tincture, or extract",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Drowsiness, vivid dreams, dizziness.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🧘 sedation"
    ],
    "therapeuticUses": "Used for anxiety, insomnia, and pain management.",
    "toxicity": "Low toxicity; non-habit-forming.",
    "toxicityLD50": "No known LD50 in humans; safe at standard doses.",
    "affiliateLink": "",
    "slug": "california-poppy",
    "tagCount": 4
  },
  {
    "name": "Celastrus paniculatus",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy",
    "description": "Often called the 'Intellect Tree', this Ayurvedic plant is used to support memory, learning, and vivid dreams. Contains sesquiterpenes that may stimulate cholinergic activity.",
    "drugInteractions": "None well documented",
    "duration": "4–6 hrs",
    "effects": [
      "Cognitive clarity",
      "memory enhancement",
      "dream vividness"
    ],
    "id": "celastrus-paniculatus",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Cholinergic modulation; antioxidant and neuroprotective effects",
    "onset": "45–90 min",
    "pharmacokinetics": "Onset: 45–90 min; Duration: 4–6 hrs",
    "preparation": "Seeds chewed, oil taken orally, or powdered for tea",
    "region": "India, Sri Lanka, Southeast Asia",
    "safetyRating": "low",
    "scientificName": "Celastrus paniculatus",
    "sideEffects": "Headache or stimulation at high doses",
    "tags": [
      "✅ safe",
      "🌿 herbal",
      "🧠 nootropic"
    ],
    "therapeuticUses": "Memory support, neuroprotection, dream recall",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "celastrus-paniculatus",
    "tagCount": 3
  },
  {
    "name": "Celastrus paniculatus (Intellect Tree)",
    "category": "Other",
    "contraindications": "Not well documented",
    "description": "Indian vine whose oil is consumed to sharpen memory and dream vividly.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Lucid dreaming",
      "cognitive enhancer"
    ],
    "id": "celastrus-paniculatus-intellect-tree",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "Varies",
    "pharmacokinetics": "Not well documented",
    "preparation": "Oil or seeds consumed",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "✅ safe",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "celastrus-paniculatus-intellect-tree",
    "tagCount": 2
  },
  {
    "name": "Chacruna",
    "category": "Ritual / Visionary",
    "contraindications": "Mental health disorders, SSRIs, MAOIs",
    "description": "A key component of traditional Ayahuasca brews, Chacruna contains DMT and is often combined with MAOIs like Banisteriopsis caapi to make it orally active.",
    "drugInteractions": "Dangerous with antidepressants or stimulants",
    "duration": "4–6 hrs",
    "effects": [
      "Visionary states",
      "spiritual insight",
      "hallucinations"
    ],
    "id": "chacruna",
    "intensity": "Strong",
    "legalStatus": "DMT is controlled in most countries",
    "mechanismOfAction": "DMT – 5-HT2A receptor agonist; requires MAOI to be active orally",
    "onset": "20–40 min (oral with MAOI)",
    "pharmacokinetics": "Onset: 20–40 min (with MAOI); Duration: 4–6 hrs",
    "preparation": "Boiled with Banisteriopsis caapi in traditional Ayahuasca brews",
    "region": "Amazon basin (Peru, Brazil, Colombia)",
    "safetyRating": "high",
    "scientificName": "Psychotria viridis",
    "sideEffects": "Intense visuals, vomiting, nausea",
    "tags": [
      "⚠️ caution",
      "🧠 vision",
      "🧪 dmt"
    ],
    "therapeuticUses": "Spiritual healing, emotional release (as part of Ayahuasca)",
    "toxicity": "Low physical toxicity, high psychological risk",
    "toxicityLD50": "Not established in humans",
    "affiliateLink": "",
    "slug": "chacruna",
    "tagCount": 3
  },
  {
    "name": "Chiric Sanango",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, cardiovascular conditions.",
    "description": "Amazonian shrub added to ayahuasca for introspection and cleansing.",
    "drugInteractions": "Other serotonergic or cholinergic agents.",
    "duration": "Unknown",
    "effects": [
      "Shadow work",
      "spiritual clearing"
    ],
    "id": "chiric-sanango",
    "intensity": "High",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Contains β-carboline alkaloids (harmine, harmaline) and coumarins (scopoletin) that may inhibit monoamine oxidase and modulate serotonergic/cholinergic systems [0, 11, 0, 1].",
    "onset": "15-45 min",
    "pharmacokinetics": "Traditionally infused or added to ayahuasca; alkaloids absorbed orally; onset ~30–60 min; duration several hours [0, 10].",
    "preparation": "Amazonian brew; not casual use",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Dizziness, nausea, muscle tremors, delirium at high doses [0, 11].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation"
    ],
    "therapeuticUses": "Potentiates ayahuasca, used in Amazonian rituals for introspection and mild hallucinations [0, 4].",
    "toxicity": "Toxic in high doses; caution advised.",
    "toxicityLD50": "LD50 not established; considered mildly toxic in large doses due to cholinergic effects.",
    "affiliateLink": "",
    "slug": "chiric-sanango",
    "tagCount": 3
  },
  {
    "name": "Clavo huasca",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, blood pressure meds",
    "description": "Amazonian vine used in both physical and spiritual medicine. Traditionally consumed as a libido enhancer and pre-Ayahuasca preparation.",
    "drugInteractions": "Avoid CNS depressants, alcohol",
    "duration": "3–6 hrs",
    "effects": [
      "Aphrodisiac",
      "calming",
      "digestive"
    ],
    "id": "clavo-huasca",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Alkaloids may modulate dopamine and serotonin; warming vasodilator",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–4 hrs",
    "preparation": "Bark decoction or tincture",
    "region": "Amazon Basin",
    "safetyRating": "low",
    "scientificName": "Tynanthus panurensis",
    "sideEffects": "Mild hypotension or fatigue",
    "tags": [
      "✅ safe",
      "🌿 amazonian",
      "🔥 aphrodisiac"
    ],
    "therapeuticUses": "Aphrodisiac, digestive aid in Amazonian medicine",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "clavo-huasca",
    "tagCount": 3
  },
  {
    "name": "Copal",
    "category": "Ritual / Visionary",
    "contraindications": "Not well documented",
    "description": "Resin from Bursera trees burned ceremonially to purify and induce trance.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Purifying",
      "sacred aroma",
      "trance enhancement"
    ],
    "id": "copal",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "5-20 min",
    "pharmacokinetics": "Not well documented",
    "preparation": "Burned as incense",
    "region": "🌐 Global / Ritual",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "✅ safe",
      "🔮 ritual",
      "🕯️ ritual"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "copal",
    "tagCount": 3
  },
  {
    "name": "Cyperus articulatus",
    "category": "Ritual / Visionary",
    "contraindications": "Unknown",
    "description": "Known as Piripiri or Guinea Rush, this sedge is used in Afro-Caribbean and Amazonian rituals for mild visionary states and spiritual grounding.",
    "drugInteractions": "Unknown",
    "duration": "2–5 hrs",
    "effects": [
      "Calm",
      "focus",
      "light trance"
    ],
    "id": "cyperus-articulatus",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Unknown; may involve sesquiterpenes",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 2–5 hrs",
    "preparation": "Rhizome decoction or powder",
    "region": "Africa, Caribbean, Amazon",
    "safetyRating": "low",
    "scientificName": "Cyperus articulatus",
    "sideEffects": "Rare; mild sedation",
    "tags": [
      "✅ safe",
      "🌿 piripiri",
      "🧘 ritual"
    ],
    "therapeuticUses": "Spiritual clarity, dream work, digestion",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "cyperus-articulatus",
    "tagCount": 3
  },
  {
    "name": "Damiana",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, urinary tract conditions",
    "description": "Used traditionally in Mexico and Central America for libido, relaxation, and mild stimulation. Sometimes blended in herbal smoking mixes.",
    "drugInteractions": "May interact with blood sugar meds",
    "duration": "2–4 hrs",
    "effects": [
      "Mood boost",
      "aphrodisiac",
      "relaxation"
    ],
    "id": "damiana",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "May modulate serotonin and GABA; unclear primary target",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 2–4 hrs",
    "preparation": "Tea, tincture, smoking blends",
    "region": "Mexico, Texas, Central America",
    "safetyRating": "low",
    "scientificName": "Turnera diffusa",
    "sideEffects": "Mild headaches or GI discomfort",
    "tags": [
      "✅ safe",
      "🔥 aphrodisiac",
      "😊 mood"
    ],
    "therapeuticUses": "Libido, nervous system support, mild stimulant",
    "toxicity": "Low",
    "toxicityLD50": "Not well established",
    "affiliateLink": "",
    "slug": "damiana",
    "tagCount": 3
  },
  {
    "name": "Desfontainia spinosa",
    "category": "Ritual / Visionary",
    "contraindications": "Mental illness, cardiovascular risk, pregnancy",
    "description": "A rare South American shrub used by the Mapuche and other indigenous groups in Chile and Colombia as a ritual intoxicant. Known for unpredictable and potent effects.",
    "drugInteractions": "Unknown; avoid CNS drugs",
    "duration": "3–6 hrs",
    "effects": [
      "Hallucinations",
      "disorientation",
      "dreamlike state"
    ],
    "id": "desfontainia-spinosa",
    "intensity": "Strong",
    "legalStatus": "Legal but obscure",
    "mechanismOfAction": "Unknown; possibly tropane alkaloid activity or diterpenes",
    "onset": "30–90 min",
    "pharmacokinetics": "Onset: 30–90 min; Duration: 3–6 hrs",
    "preparation": "Infusion of leaves or berries; sometimes smoked",
    "region": "Chile, Colombia, Andes",
    "safetyRating": "high",
    "scientificName": "Desfontainia spinosa",
    "sideEffects": "Strong nausea, confusion, pupil dilation",
    "tags": [
      "⚠️ rare",
      "🌿 andes",
      "🧠 vision"
    ],
    "therapeuticUses": "Traditional visionary plant; not clinically established",
    "toxicity": "Potentially high at ritual doses",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "desfontainia-spinosa",
    "tagCount": 3
  },
  {
    "name": "Eleutherococcus senticosus (Siberian Ginseng)",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Hypertension, pregnancy, hormone-sensitive conditions.",
    "description": "Adaptogenic root boosting stamina and immune function.",
    "drugInteractions": "May interact with stimulants, immunosuppressants, and anticoagulants.",
    "duration": "Unknown",
    "effects": [
      "Balanced energy",
      "mood resilience"
    ],
    "id": "eleutherococcus-senticosus-siberian-ginseng",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Adaptogenic modulation of HPA axis and immune response; contains eleutherosides influencing stress resilience.",
    "onset": "30-60 min",
    "pharmacokinetics": "Oral onset in 30–60 minutes; active glycosides metabolized hepatically.",
    "preparation": "Tea or extract",
    "region": "🇨🇳 East Asia",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Mild insomnia, irritability, nervousness in high doses.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💫 euphoria"
    ],
    "therapeuticUses": "Fatigue, immune support, cognitive performance under stress.",
    "toxicity": "Generally considered safe when used short-term. Long-term effects less studied.",
    "toxicityLD50": "No established LD50; high doses in animals show minimal acute toxicity.",
    "affiliateLink": "",
    "slug": "eleutherococcus-senticosus-siberian-ginseng",
    "tagCount": 3
  },
  {
    "name": "Entada rheedii",
    "category": "Oneirogen",
    "contraindications": "Pregnancy, lactation, hypersensitivity [0, 6].",
    "description": "Seed from a tropical vine used in African traditions to induce vivid dreams.",
    "drugInteractions": "May potentiate CNS depressants; caution with anticholinergics [0, 6].",
    "duration": "Unknown",
    "effects": [
      "Dream enhancement",
      "trance"
    ],
    "id": "entada-rheedii",
    "intensity": "Moderate",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "30-60 min",
    "pharmacokinetics": "Traditionally consumed as cold water infusion; onset ~1–2 h; effects last ~6–8 h [0, 11].",
    "preparation": "Seed powder or chew",
    "region": "🇲🇽 Latin America",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Mild GI upset, drowsiness; rare nausea [0, 6].",
    "tags": [
      "✅ safe",
      "💊 oral",
      "🧠 dream"
    ],
    "therapeuticUses": "Dream enhancement, lucid dreaming, traditional remedy for diarrhea and stomach aches [0, 6, 0, 11].",
    "toxicity": "Low; no severe toxicity reported in traditional use [0, 6].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "entada-rheedii",
    "tagCount": 3
  },
  {
    "name": "Eschscholzia californica (California poppy)",
    "category": "Dissociative / Sedative",
    "contraindications": "Glaucoma, MAOI therapy, pregnancy, lactation [2, 9].",
    "description": "Gentle sedative flower used for anxiety and sleep support.",
    "drugInteractions": "Additive CNS depression with sedatives, barbiturates; caution with blood thinners and antihypertensives [2, 8].",
    "duration": "Unknown",
    "effects": [
      "Sleep aid",
      "mild dreamlike calm"
    ],
    "id": "eschscholzia-californica-california-poppy",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "15-45 min",
    "pharmacokinetics": "Oral (tea, extract); onset 30–60 min; duration ~4 h; bioavailability of key alkaloids moderate [2, 3].",
    "preparation": "Tea, tincture",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "High doses may cause residual sedation (\\"hangover\\"), nausea, dizziness; avoid operating machinery [2, 8, 2, 9].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🧘 sedation"
    ],
    "therapeuticUses": "Anxiety reduction, insomnia aid, mild analgesic, vasomotor headache relief [2, 3, 2, 7].",
    "toxicity": "Low; no significant toxicity at therapeutic doses [2, 9].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "eschscholzia-californica-california-poppy",
    "tagCount": 4
  },
  {
    "name": "Frankincense (Boswellia)",
    "category": "Other",
    "contraindications": "Not well documented",
    "description": "Resin incense with boswellic acids studied for anti-inflammatory effects.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Trance",
      "meditative awareness"
    ],
    "id": "frankincense-boswellia",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "Varies",
    "pharmacokinetics": "Not well documented",
    "preparation": "Resin burned",
    "region": "🌐 Global / Ritual",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "✅ safe"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "frankincense-boswellia",
    "tagCount": 1
  },
  {
    "name": "Guayusa",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, heart conditions, anxiety",
    "description": "A caffeinated Amazonian holly used in dream rituals and for morning alertness. Known for smooth energy and calming clarity.",
    "drugInteractions": "Stimulants, caffeine",
    "duration": "3–5 hrs",
    "effects": [
      "Stimulation",
      "mental clarity",
      "lucid dreaming"
    ],
    "id": "guayusa",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Caffeine and theobromine – adenosine antagonists",
    "onset": "15–30 min",
    "pharmacokinetics": "Onset: 15–30 min; Duration: 3–5 hrs",
    "preparation": "Brewed as tea from dried leaves",
    "region": "Ecuador, Peru, Amazon",
    "safetyRating": "low",
    "scientificName": "Ilex guayusa",
    "sideEffects": "Restlessness, jitteriness in sensitive individuals",
    "tags": [
      "stimulant",
      "✅ safe",
      "🌿 herbal"
    ],
    "therapeuticUses": "Energy, focus, lucid dreaming support",
    "toxicity": "Low",
    "toxicityLD50": "~190 mg/kg (caffeine)",
    "affiliateLink": "",
    "slug": "guayusa",
    "tagCount": 3
  },
  {
    "name": "Heimia salicifolia (Sinicuichi)",
    "category": "Dissociative / Sedative",
    "contraindications": "Avoid with alcohol or CNS depressants, pregnancy [9, 4].",
    "description": "Mexican shrub whose fermented leaves produce mild auditory shifts.",
    "drugInteractions": "None known; caution with psychiatric medications [9, 4].",
    "duration": "Unknown",
    "effects": [
      "Auditory hallucinations",
      "slowed time"
    ],
    "id": "heimia-salicifolia-sinicuichi",
    "intensity": "Moderate",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Alkaloids may affect auditory processing and blood flow, potentially modulating neurotransmission [9, 4].",
    "onset": "15-45 min",
    "pharmacokinetics": "Traditionally fermented sun tea; slow onset 15–45 min; duration ~2–3 h [9, 4].",
    "preparation": "Fermented sun tea",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Dry mouth, muscle relaxation, altered hearing [9, 4].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🧪 fermented"
    ],
    "therapeuticUses": "Divination, auditory changes, euphoria in folk practices [9, 4].",
    "toxicity": "Low toxicity; high doses may cause mild sedation or nausea [9, 4].",
    "toxicityLD50": "Not well established; no fatal doses reported in traditional use.",
    "affiliateLink": "",
    "slug": "heimia-salicifolia-sinicuichi",
    "tagCount": 4
  },
  {
    "name": "Henbane",
    "category": "Deliriant / Toxic",
    "contraindications": "Not well documented",
    "description": "Nightshade containing tropane alkaloids causing powerful delirium.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Delirium",
      "hallucinations",
      "anticholinergic"
    ],
    "id": "henbane",
    "intensity": "High",
    "legalStatus": "Controlled / Toxic",
    "mechanismOfAction": "Unknown",
    "onset": "Varies",
    "pharmacokinetics": "Not well documented",
    "preparation": "Historically ritual; dangerous/toxic",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "☠️ toxic",
      "🕯️ ritual"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "henbane",
    "tagCount": 2
  },
  {
    "name": "Hop Flowers",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, estrogen-sensitive conditions (e.g. breast cancer).",
    "description": "Bitter cones of Humulus lupulus used for relaxation and sleep.",
    "drugInteractions": "May enhance sedatives, alcohol, and hypnotics.",
    "duration": "Unknown",
    "effects": [
      "Relaxation",
      "dream enhancement"
    ],
    "id": "hop-flowers",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Binds to GABA-A receptors, promoting sedation and relaxation.",
    "onset": "15-45 min",
    "pharmacokinetics": "Oral or inhaled; onset ~20–40 min; duration ~2–4 hrs.",
    "preparation": "Tea or herbal pillow",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Drowsiness, mild headache, possible hormonal effects in large doses.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation"
    ],
    "therapeuticUses": "Used as a mild sleep aid, anxiety reducer, and dream enhancer.",
    "toxicity": "Very low toxicity; generally regarded as safe.",
    "toxicityLD50": "No human LD50; high safety margin reported in herbal use.",
    "affiliateLink": "",
    "slug": "hop-flowers",
    "tagCount": 3
  },
  {
    "name": "Indian Lotus",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy (caution), hypotension",
    "description": "Sacred flower in Buddhism and Hinduism, with mild psychoactive and calming properties. Often used in teas or tinctures.",
    "drugInteractions": "Sedatives, CNS depressants",
    "duration": "2–4 hrs",
    "effects": [
      "Calm",
      "mild euphoria",
      "dreaminess"
    ],
    "id": "Unknown",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Likely GABAergic and dopaminergic effects (alkaloids: nuciferine, aporphine)",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–4 hrs",
    "preparation": "Tea from flowers or stamens; also smoked",
    "region": "India, Southeast Asia",
    "safetyRating": "low",
    "scientificName": "Nelumbo nucifera",
    "sideEffects": "Drowsiness, dizziness",
    "tags": [
      "🌊 spiritual",
      "🌸 sacred",
      "🧘 calm"
    ],
    "therapeuticUses": "Stress, anxiety, spiritual use",
    "toxicity": "Low",
    "toxicityLD50": "Not known",
    "affiliateLink": "",
    "slug": "indian-lotus",
    "tagCount": 3
  },
  {
    "name": "Indian Pipe",
    "category": "Dissociative / Sedative",
    "contraindications": "Unknown; limited modern use",
    "description": "A ghostly white forest plant used in Native American medicine for pain and spiritual insight. Non-photosynthetic and mysterious.",
    "drugInteractions": "Possibly CNS depressants",
    "duration": "2–4 hrs",
    "effects": [
      "Analgesia",
      "calm",
      "emotional detachment"
    ],
    "id": "Unknown",
    "intensity": "Mild",
    "legalStatus": "Legal (but rare and protected in places)",
    "mechanismOfAction": "Contains monotropin; acts possibly on NMDA or opioid systems (hypothetical)",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–4 hrs",
    "preparation": "Tincture of fresh or dried plant",
    "region": "Temperate forests of North America and Asia",
    "safetyRating": "medium",
    "scientificName": "Monotropa uniflora",
    "sideEffects": "Unknown at pharmacological doses; rare usage",
    "tags": [
      "🌲 pain relief",
      "👻 ghost plant",
      "🧠 emotional"
    ],
    "therapeuticUses": "Pain relief, emotional trauma support (traditional)",
    "toxicity": "Unknown",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "indian-pipe",
    "tagCount": 3
  },
  {
    "name": "Ipomoea tricolor (Heavenly Blue)",
    "category": "Ethnobotanical / Rare",
    "contraindications": "Cardiovascular disorders, psychiatric conditions [0, 5].",
    "description": "Ornamental morning glory whose seeds induce LSD-like visions.",
    "drugInteractions": "SSRIs/MAOIs [0, 5].",
    "duration": "Unknown",
    "effects": [
      "LSD-like visuals",
      "spiritual confusion"
    ],
    "id": "ipomoea-tricolor-heavenly-blue",
    "intensity": "High",
    "legalStatus": "Restricted in some countries",
    "mechanismOfAction": "Unknown",
    "onset": "30-90 min",
    "pharmacokinetics": "Oral ingestion onset 45–120 min; duration 4–10 h; hepatic metabolism [0, 5].",
    "preparation": "Seeds ground and cold infused",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Nausea, vasoconstriction, headache [0, 5].",
    "tags": [
      "⚠️ restricted"
    ],
    "therapeuticUses": "Visionary experiences, ethnobotanical use [0, 5].",
    "toxicity": "Low; rodent LD50 ~200–300 mg/kg [0, 5].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "ipomoea-tricolor-heavenly-blue",
    "tagCount": 1
  },
  {
    "name": "Justicia pectoralis",
    "category": "Ritual / Visionary",
    "contraindications": "Liver disorders, pregnancy",
    "description": "Aromatic herb called tilo, brewed or smoked for calming effects.",
    "drugInteractions": "Coumarin-sensitive meds (e.g., blood thinners)",
    "duration": "2–5 hrs",
    "effects": [
      "Relaxation",
      "light euphoria",
      "spiritual dreams"
    ],
    "id": "justicia-pectoralis",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Likely GABAergic; coumarins may modulate CNS",
    "onset": "15–45 min",
    "pharmacokinetics": "Onset: 15–45 min; Duration: 2–5 hrs",
    "preparation": "Smoked or made into tea",
    "region": "Amazon basin",
    "safetyRating": "medium",
    "scientificName": "Justicia pectoralis",
    "sideEffects": "Liver risk in excess due to coumarin",
    "tags": [
      "✅ legal",
      "🌿 ayahuasca-additive",
      "🧘 calm"
    ],
    "therapeuticUses": "Anxiety, insomnia, spiritual enhancement",
    "toxicity": "Low–moderate with excess",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "justicia-pectoralis",
    "tagCount": 3
  },
  {
    "name": "Kanna",
    "category": "Empathogen / Euphoriant",
    "contraindications": "SSRIs, MAOIs, bipolar disorder",
    "description": "A South African succulent traditionally chewed or snuffed to reduce anxiety and induce euphoria.",
    "drugInteractions": "Antidepressants, serotonergic agents",
    "duration": "1–3 hrs",
    "effects": [
      "Mood lift",
      "calm euphoria",
      "focus"
    ],
    "id": "Unknown",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Serotonin reuptake inhibition (mesembrine alkaloids)",
    "onset": "15–30 min",
    "pharmacokinetics": "Onset: 15–30 min; Duration: 1–3 hrs",
    "preparation": "Fermented and dried material chewed, snuffed, or made into tincture",
    "region": "Southern Africa",
    "safetyRating": "medium",
    "scientificName": "Sceletium tortuosum",
    "sideEffects": "Headache, nausea, serotonin syndrome (in excess or with SSRIs)",
    "tags": [
      "🌼 euphoric",
      "🧘 calm",
      "🧬 natural ssri"
    ],
    "therapeuticUses": "Anxiety, stress, social comfort",
    "toxicity": "Low",
    "toxicityLD50": "Not established (safe in traditional use)",
    "affiliateLink": "",
    "slug": "kanna",
    "tagCount": 3
  },
  {
    "name": "Kava",
    "category": "Dissociative / Sedative",
    "contraindications": "Liver conditions, alcohol, sedatives",
    "description": "South Pacific root brew known for its relaxing and anxiolytic effects.",
    "drugInteractions": "CNS depressants, alcohol, liver-metabolized drugs",
    "duration": "3–6 hrs",
    "effects": [
      "Relaxation",
      "social ease",
      "mild euphoria"
    ],
    "id": "kava",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal; restricted in some EU countries",
    "mechanismOfAction": "Kavalactones modulate GABA, block sodium and calcium channels",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 3–6 hrs",
    "preparation": "Pounded root mixed in water and strained",
    "region": "Polynesia, Micronesia, Melanesia",
    "safetyRating": "medium",
    "scientificName": "Piper methysticum",
    "sideEffects": "Liver strain (rare), drowsiness",
    "tags": [
      "🌿 root",
      "🍵 social",
      "🧘 calm"
    ],
    "therapeuticUses": "Anxiety, stress, sleep aid",
    "toxicity": "Low to moderate; caution with prolonged use",
    "toxicityLD50": "~4.3 g/kg (rats, oral)",
    "activeConstituents": [
      {
        "name": "Kavalactones",
        "type": "alkaloid",
        "effect": "anxiolytic"
      }
    ],
    "affiliateLink": "",
    "slug": "kava",
    "tagCount": 3
  },
  {
    "name": "Kra Thum Na / Kok",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Not well documented",
    "description": "Southeast Asian tree related to kratom with stimulating leaves.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Stimulation",
      "kratom-like body feel"
    ],
    "id": "kra-thum-na--kok",
    "intensity": "Moderate",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "15-45 min",
    "pharmacokinetics": "Not well documented",
    "preparation": "Capsule or tea",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💊 oral",
      "💫 euphoria"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "kra-thum-na--kok",
    "tagCount": 4
  },
  {
    "name": "Lactuca canadensis",
    "category": "Dissociative / Sedative",
    "contraindications": "Sedatives, pregnancy",
    "description": "Wild lettuce species containing lactucarium for gentle analgesia.",
    "drugInteractions": "CNS depressants, alcohol",
    "duration": "3–5 hrs",
    "effects": [
      "Relaxation",
      "pain relief",
      "drowsiness"
    ],
    "id": "lactuca-canadensis",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Mild opioid-like action via lactucin/lactucopicrin",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 3–5 hrs",
    "preparation": "Latex or leaf infusion, tincture, or smoke",
    "region": "North America",
    "safetyRating": "low",
    "scientificName": "Lactuca canadensis",
    "sideEffects": "Drowsiness, GI upset at high doses",
    "tags": [
      "✅ safe",
      "🌿 opium lettuce",
      "😴 sedative"
    ],
    "therapeuticUses": "Insomnia, pain, cough relief",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "lactuca-canadensis",
    "tagCount": 3
  },
  {
    "name": "Mandrake Root",
    "category": "Deliriant / Toxic",
    "contraindications": "Pregnancy, glaucoma, heart conditions.",
    "description": "Mythic Mediterranean root with hallucinogenic tropane alkaloids.",
    "drugInteractions": "Potentiates other anticholinergics, CNS depressants.",
    "duration": "Unknown",
    "effects": [
      "Narcotic",
      "visionary trance"
    ],
    "id": "mandrake-root",
    "intensity": "High",
    "legalStatus": "Controlled / Toxic",
    "mechanismOfAction": "Contains tropane alkaloids (scopolamine, atropine); anticholinergic deliriant.",
    "onset": "Varies",
    "pharmacokinetics": "Oral or transdermal; slow absorption; long-lasting (6–12 hrs).",
    "preparation": "Traditional ceremonial use only",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Dry mouth, confusion, hallucinations, elevated heart rate.",
    "tags": [
      "☠️ toxic"
    ],
    "therapeuticUses": "Historically used as anesthetic, antispasmodic, and in witchcraft.",
    "toxicity": "Highly toxic in moderate doses.",
    "toxicityLD50": "Scopolamine LD50 (rat, oral): ~310 mg/kg.",
    "affiliateLink": "",
    "slug": "mandrake-root",
    "tagCount": 1
  },
  {
    "name": "Melissa officinalis (Lemon balm)",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, known Asteraceae allergy [0, 16].",
    "description": "Lemony herb easing anxiety and digestive upset while calming the mind.",
    "drugInteractions": "May potentiate sedatives, anticoagulants; caution with CNS depressants [0, 16].",
    "duration": "Unknown",
    "effects": [
      "Anxiolytic",
      "cognitive calming"
    ],
    "id": "melissa-officinalis-lemon-balm",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "15-30 min",
    "pharmacokinetics": "Oral onset 30–60 min; active compounds absorbed in GI tract; hepatic metabolism; renal excretion [0, 0].",
    "preparation": "Tea, tincture, or smoke",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Drowsiness; possible allergic reactions; GI upset at high doses [0, 0].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🌬️ smokable",
      "🧘 sedation",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Anxiety, insomnia, nervous tension, digestive aid [0, 8].",
    "toxicity": "Low; safe at therapeutic doses [0, 0].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "melissa-officinalis-lemon-balm",
    "tagCount": 6
  },
  {
    "name": "Mimosa hostilis",
    "category": "Ritual / Visionary",
    "contraindications": "Mental disorders, MAOIs, SSRIs",
    "description": "Highly sought after for its DMT-rich root bark. Used in Anahuasca brews as a substitute for chacruna or yopo.",
    "drugInteractions": "MAOIs, antidepressants",
    "duration": "4–6 hrs",
    "effects": [
      "Visionary states",
      "purging",
      "emotional release"
    ],
    "id": "mimosa-hostilis",
    "intensity": "Strong",
    "legalStatus": "DMT controlled in many countries",
    "mechanismOfAction": "DMT – 5-HT2A agonist (requires MAOI orally)",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min (with MAOI); Duration: 4–6 hrs",
    "preparation": "Bark decoction brewed with MAOI like Syrian Rue",
    "region": "Brazil, Central America",
    "safetyRating": "high",
    "scientificName": "Mimosa tenuiflora",
    "sideEffects": "Intense purging, nausea, anxiety",
    "tags": [
      "⚠️ visionary",
      "🌿 anahuasca",
      "🧪 dmt"
    ],
    "therapeuticUses": "Spiritual healing, insight, skin regeneration (topical)",
    "toxicity": "Low physiological, high psychological",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "mimosa-hostilis",
    "tagCount": 3
  },
  {
    "name": "Nelumbo nucifera",
    "category": "Oneirogen",
    "contraindications": "Sedatives, pregnancy",
    "description": "Sacred lotus revered for tranquil, mildly euphoric properties.",
    "drugInteractions": "Avoid CNS depressants",
    "duration": "2–4 hrs",
    "effects": [
      "Relaxation",
      "dream enhancement",
      "calm euphoria"
    ],
    "id": "nelumbo-nucifera",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Dopamine receptor agonism (aporphine alkaloids)",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 2–4 hrs",
    "preparation": "Petals steeped in wine, tea, or smoked",
    "region": "India, China, Southeast Asia",
    "safetyRating": "low",
    "scientificName": "Nelumbo nucifera",
    "sideEffects": "Sedation, mild dizziness",
    "tags": [
      "✅ safe",
      "🌸 calm",
      "🧘 meditation"
    ],
    "therapeuticUses": "Calm, aphrodisiac, meditation support",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "nelumbo-nucifera",
    "tagCount": 3
  },
  {
    "name": "Nymphaea ampla",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Not well documented",
    "description": "Central American water lily providing mild euphoria and sedation.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Sedative",
      "euphoric",
      "dreamlike states"
    ],
    "id": "nymphaea-ampla",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "15-45 min",
    "pharmacokinetics": "Not well documented",
    "preparation": "Tea or smoke",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌬️ smokable",
      "💫 euphoria"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "nymphaea-ampla",
    "tagCount": 4
  },
  {
    "name": "Ocimum sanctum (Holy Basil / Tulsi)",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, diabetes medication.",
    "description": "Sacred basil revered in Ayurveda for uplifting and adaptogenic qualities.",
    "drugInteractions": "May potentiate anti-diabetic, anticoagulant, or sedative drugs.",
    "duration": "Unknown",
    "effects": [
      "Mood lift",
      "sacred calm",
      "spiritual focus"
    ],
    "id": "ocimum-sanctum-holy-basil--tulsi",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Modulates cortisol, inflammation, and neurotransmitters; contains eugenol, ursolic acid, and apigenin.",
    "onset": "15-30 min",
    "pharmacokinetics": "Rapid absorption via oral tea/tincture; hepatic metabolism.",
    "preparation": "Tea or incense",
    "region": "🇮🇳 India",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "May lower blood sugar, mild sedation, mild nausea.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💫 euphoria",
      "🕯️ ritual",
      "🧘 sedation"
    ],
    "therapeuticUses": "Adaptogen, anxiety, spiritual focus, blood sugar balance.",
    "toxicity": "Pending",
    "toxicityLD50": "Pending",
    "affiliateLink": "",
    "slug": "ocimum-sanctum-holy-basil--tulsi",
    "tagCount": 5
  },
  {
    "name": "Passionflower",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, CNS depressants",
    "description": "Climbing vine traditionally brewed for anxiety relief and restful sleep.",
    "drugInteractions": "CNS depressants, MAOIs",
    "duration": "3–6 hrs",
    "effects": [
      "Relaxation",
      "mild sedation",
      "anxiolytic"
    ],
    "id": "passionflower",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "GABAergic (modulation of GABA_A receptors), mild MAOI",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 3–6 hrs",
    "preparation": "Tea from aerial parts or tincture",
    "region": "Southeastern U.S., Latin America",
    "safetyRating": "low",
    "scientificName": "Passiflora incarnata",
    "sideEffects": "Drowsiness, dizziness",
    "tags": [
      "✅ safe",
      "🌿 sedative",
      "🧘 calm"
    ],
    "therapeuticUses": "Anxiety, insomnia, nervous restlessness",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "activeConstituents": [
      {
        "name": "Flavonoids",
        "type": "alkaloid",
        "effect": "anxiolytic"
      }
    ],
    "affiliateLink": "",
    "slug": "passionflower",
    "tagCount": 3
  },
  {
    "name": "Pedicularis densiflora (Indian warrior)",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, use with other sedatives [2, 0].",
    "description": "North American wildflower smoked for muscle relaxation.",
    "drugInteractions": "Additive effects with CNS depressants [2, 0].",
    "duration": "Unknown",
    "effects": [
      "Muscle relaxation",
      "mild body high"
    ],
    "id": "pedicularis-densiflora-indian-warrior",
    "intensity": "Moderate",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Muscle relaxant potential via GABAergic modulation [2, 0].",
    "onset": "5-15 min",
    "pharmacokinetics": "Smoked or tea; onset rapid (minutes); duration ~2–3 h [2, 0].",
    "preparation": "Smoked or tea",
    "region": "🌍 Africa, 🇮🇳 India",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Drowsiness, dizziness [2, 0].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🌬️ smokable"
    ],
    "therapeuticUses": "Muscle tension, pain relief, sleep aid applications [2, 0].",
    "toxicity": "Low; limited data on long-term use [2, 0].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "pedicularis-densiflora-indian-warrior",
    "tagCount": 4
  },
  {
    "name": "Pedicularis groenlandica",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, lactation [0, 7].",
    "description": "High-elevation lousewort prized for soothing tense muscles.",
    "drugInteractions": "Additive with CNS depressants [0, 7].",
    "duration": "Unknown",
    "effects": [
      "Stronger relaxation",
      "tension relief"
    ],
    "id": "pedicularis-groenlandica",
    "intensity": "Moderate",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "5-15 min",
    "pharmacokinetics": "Oral infusion onset ~30 min; duration ~4 h; metabolites excreted renally [0, 7].",
    "preparation": "Smoked or tea",
    "region": "🌍 Africa",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Rare; possible GI upset [0, 7].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🌬️ smokable"
    ],
    "therapeuticUses": "Muscle relaxant, antioxidant, antimicrobial, traditional remedy for pain and inflammation [0, 7].",
    "toxicity": "Low; no significant toxicity reported [0, 7].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "pedicularis-groenlandica",
    "tagCount": 4
  },
  {
    "name": "Petasites hybridus",
    "category": "Dissociative / Sedative",
    "contraindications": "Liver conditions, pregnancy, raw extract use",
    "description": "Also known as Butterbur, this European root was historically used as a remedy for migraines and spasms. Contains pyrrolizidine alkaloids, so safe extracts must be purified.",
    "drugInteractions": "Avoid hepatotoxic meds",
    "duration": "4–6 hrs",
    "effects": [
      "Relaxation",
      "muscle relief",
      "headache reduction"
    ],
    "id": "petasites-hybridus",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal with restrictions (PA-free only)",
    "mechanismOfAction": "Antispasmodic and anti-inflammatory effects; calcium channel modulation",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 4–6 hrs",
    "preparation": "Purified root extracts or capsules (PA-free only)",
    "region": "Europe, Asia",
    "safetyRating": "medium",
    "scientificName": "Petasites hybridus",
    "sideEffects": "Liver toxicity risk from unpurified products",
    "tags": [
      "⚠️ pa toxins",
      "🌿 herbal",
      "🧠 headache"
    ],
    "therapeuticUses": "Migraine prevention, allergies, anxiety",
    "toxicity": "Moderate to high (raw plant)",
    "toxicityLD50": "~950 mg/kg (mouse, oral, unpurified)",
    "affiliateLink": "",
    "slug": "petasites-hybridus",
    "tagCount": 3
  },
  {
    "name": "Piper auritum (Root beer plant)",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy; safrole-containing extracts discouraged [1, 11].",
    "description": "Sassafras-scented leaf from Mexico used culinary and for mild mood lift.",
    "drugInteractions": "CYP450 substrates; caution with anticoagulants [0, 19].",
    "duration": "Unknown",
    "effects": [
      "Calming",
      "warming",
      "euphoric"
    ],
    "id": "piper-auritum-root-beer-plant",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Contains safrole and other volatile oils; possible mild dopaminergic stimulation and GI modulation.",
    "onset": "15-30 min",
    "pharmacokinetics": "Oral infusion or extract onset 30–60 min; hepatic metabolism; renal excretion [0, 11].",
    "preparation": "Tea or culinary use",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "High doses may cause GI upset; safrole is a potential carcinogen [1, 11].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "💫 euphoria",
      "🧘 sedation"
    ],
    "therapeuticUses": "Digestive aid, anti-inflammatory, antimutagen, diuretic, antipyretic [0, 11].",
    "toxicity": "Safrole hepatotoxic; use sparingly [1, 11].",
    "toxicityLD50": "LD50 (rats, oral) safrole ~1,950 mg/kg; safrole is hepatotoxic at high doses.",
    "affiliateLink": "",
    "slug": "piper-auritum-root-beer-plant",
    "tagCount": 4
  },
  {
    "name": "Rhodiola rosea",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Bipolar disorder, stimulants, pregnancy.",
    "description": "Hardy root enhancing endurance and stress tolerance via adaptogens.",
    "drugInteractions": "May affect antidepressants, stimulants, or MAOIs.",
    "duration": "Unknown",
    "effects": [
      "Focus",
      "reduced fatigue",
      "mind clarity"
    ],
    "id": "rhodiola-rosea",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Influences serotonin, norepinephrine, dopamine; modulates HPA axis and stress adaptation via rosavins and salidroside.",
    "onset": "30-60 min",
    "pharmacokinetics": "Absorbed orally; peak plasma ~1-2 hours; active compounds metabolized in liver, excreted renally.",
    "preparation": "Capsule, tincture",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Irritability, dry mouth, dizziness (rare, dose-dependent).",
    "tags": [
      "✅ safe",
      "💊 oral",
      "💫 euphoria",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Fatigue, stress resilience, cognitive enhancement, mild depression.",
    "toxicity": "Mild toxicity; high doses may cause irritability or insomnia.",
    "toxicityLD50": "LD50 (rats, oral) >28,000 mg/kg; very low toxicity.",
    "affiliateLink": "",
    "slug": "rhodiola-rosea",
    "tagCount": 4
  },
  {
    "name": "Rivea corymbosa",
    "category": "Ethnobotanical / Rare",
    "contraindications": "Cardiovascular disease, pregnancy [0, 4].",
    "description": "Morning glory species with LSA seeds used in ancient Mexican rituals.",
    "drugInteractions": "Serotonergic medications [0, 12].",
    "duration": "Unknown",
    "effects": [
      "Dreamy visuals",
      "nausea",
      "traditional Mazatec use"
    ],
    "id": "rivea-corymbosa",
    "intensity": "High",
    "legalStatus": "Restricted in some countries",
    "mechanismOfAction": "Unknown",
    "onset": "30-90 min",
    "pharmacokinetics": "Insufflated or ingested; onset 20–60 min; duration 4–8 h; hepatic metabolism [0, 12].",
    "preparation": "Seeds ground and cold infused",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Nausea, vasoconstriction, dizziness [0, 4].",
    "tags": [
      "⚠️ restricted"
    ],
    "therapeuticUses": "Entheogenic snuff (ololiuqui) in Mesoamerican rituals [0, 4].",
    "toxicity": "Low; moderate overdose risk [0, 12].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "rivea-corymbosa",
    "tagCount": 1
  },
  {
    "name": "Salvia divinorum",
    "category": "Dissociative / Sedative",
    "contraindications": "Psychiatric disorders, cardiovascular instability; avoid in those at risk for psychosis [3, 2].",
    "description": "Mazatec entheogen with powerful, short-lived visionary effects.",
    "drugInteractions": "CNS depressants may potentiate sedative effects; caution when coadministered [3, 3].",
    "duration": "Unknown",
    "effects": [
      "Total dissociation",
      "entity contact"
    ],
    "id": "salvia-divinorum",
    "intensity": "High",
    "legalStatus": "Restricted in many regions",
    "mechanismOfAction": "Unknown",
    "onset": "1-5 min",
    "pharmacokinetics": "Absorbed via oral mucosa, smoking or vaporization; rapid onset (seconds–minutes), short duration (~15–30 min), quickly metabolized to inactive salvinorin B [3, 1].",
    "preparation": "Smoked, intense, short duration",
    "region": "🇲🇽 Latin America",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Tiredness, dizziness, amnesia, potential for transient psychosis in vulnerable individuals [3, 2].",
    "tags": [
      "⚠️ restricted",
      "🌀 dissociation",
      "🌬️ smokable"
    ],
    "therapeuticUses": "Visionary experiences in traditional Mazatec rituals; investigated for analgesic and anti-inflammatory properties [3, 0].",
    "toxicity": "Low toxicity; animal studies show minimal organ damage even at high doses [3, 3].",
    "toxicityLD50": "LD50 not established; salvinorin A active at microgram levels with no evidence of physical toxicity.",
    "affiliateLink": "",
    "slug": "salvia-divinorum",
    "tagCount": 3
  },
  {
    "name": "Sceletium tortuosum (Kanna)",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Do not combine with other serotonergic substances; pregnancy [9, 4].",
    "description": "South African succulent chewed to elevate mood and decrease tension.",
    "drugInteractions": "SSRIs, MAOIs, stimulants [9, 4].",
    "duration": "Unknown",
    "effects": [
      "Mood lift",
      "empathy",
      "sociability"
    ],
    "id": "sceletium-tortuosum-kanna",
    "intensity": "Moderate",
    "legalStatus": "Legal, sometimes restricted",
    "mechanismOfAction": "Selective serotonin reuptake inhibition (SSRI) and phosphodiesterase-4 (PDE4) inhibition [9, 4].",
    "onset": "30-60 min",
    "pharmacokinetics": "Oral onset 20–60 min; duration 2–4 h [9, 4].",
    "preparation": "Chew, snuff, extract",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Headache, nausea, mild sedation [9, 4].",
    "tags": [
      "⚠️ restricted",
      "💊 oral",
      "💫 euphoria"
    ],
    "therapeuticUses": "Mood enhancement, anti-anxiety, social facilitation [9, 4].",
    "toxicity": "Low toxicity at traditional doses [9, 4].",
    "toxicityLD50": "Not established in humans; high safety margin observed in animal studies.",
    "affiliateLink": "",
    "slug": "sceletium-tortuosum-kanna",
    "tagCount": 3
  },
  {
    "name": "Scullcap (Scutellaria)",
    "category": "Dissociative / Sedative",
    "contraindications": "Liver issues; consult provider before long-term use.",
    "description": "Calming mint-family herb rich in baicalin used as nerve tonic.",
    "drugInteractions": "Additive effects with sedatives or anxiolytics.",
    "duration": "Unknown",
    "effects": [
      "Relaxing",
      "anxiety-reducing",
      "dream support"
    ],
    "id": "scullcap-scutellaria",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Flavonoids and baicalin modulate GABA-A receptors and inhibit inflammation.",
    "onset": "15-45 min",
    "pharmacokinetics": "Taken orally; onset ~30 min; effects last ~2–4 hrs.",
    "preparation": "Tea or tincture",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Rarely causes liver enzyme elevation or drowsiness.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation"
    ],
    "therapeuticUses": "Calming, anticonvulsant, neuroprotective.",
    "toxicity": "Generally safe, though adulterants in supplements have caused concern.",
    "toxicityLD50": "No standard LD50 data; high therapeutic margin.",
    "affiliateLink": "",
    "slug": "scullcap-scutellaria",
    "tagCount": 3
  },
  {
    "name": "Scutellaria lateriflora",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, CNS depressants",
    "description": "Commonly known as Skullcap, this North American herb has a long history in Western herbalism for treating nervous tension and insomnia.",
    "drugInteractions": "CNS depressants, alcohol, benzodiazepines",
    "duration": "3–5 hrs",
    "effects": [
      "Mild sedation",
      "anxiety relief",
      "mental clarity"
    ],
    "id": "scutellaria-lateriflora",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "GABA_A receptor modulation (baicalin and other flavonoids)",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 3–5 hrs",
    "preparation": "Tea, tincture, capsules",
    "region": "North America",
    "safetyRating": "low",
    "scientificName": "Scutellaria lateriflora",
    "sideEffects": "Drowsiness, dizziness at high doses",
    "tags": [
      "✅ safe",
      "🌿 herbal",
      "😴 sedative"
    ],
    "therapeuticUses": "Anxiety, stress, insomnia, PMS",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "scutellaria-lateriflora",
    "tagCount": 3
  },
  {
    "name": "Silene capensis",
    "category": "Oneirogen",
    "contraindications": "Pregnancy",
    "description": "Known as 'Xhosa Dream Root', Silene capensis is a sacred plant used by the Xhosa people of South Africa for initiating vivid and prophetic dreams.",
    "drugInteractions": "None well documented",
    "duration": "6–8 hrs",
    "effects": [
      "Lucid dreaming",
      "enhanced dream recall",
      "vivid visions"
    ],
    "id": "silene-capensis",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Likely acts on cholinergic and serotonergic systems; exact mechanism unknown",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 6–8 hrs",
    "preparation": "Root is powdered and stirred into water until it foams; consumed before bed",
    "region": "South Africa",
    "safetyRating": "low",
    "scientificName": "Silene capensis",
    "sideEffects": "Mild nausea if taken in excess",
    "tags": [
      "✅ safe",
      "🌙 dream",
      "🧠 vision"
    ],
    "therapeuticUses": "Dream enhancement, ancestral communication",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "silene-capensis",
    "tagCount": 3
  },
  {
    "name": "Silphium (extinct)",
    "category": "Other",
    "contraindications": "Not well documented",
    "description": "Famed classical herb believed to have contraceptive and psychoactive resins.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Ancient psychoactive/contraceptive herb"
    ],
    "id": "silphium-extinct",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "Varies",
    "pharmacokinetics": "Not well documented",
    "preparation": "No longer available but worth note",
    "region": "🌎 Unknown / Global",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "✅ safe"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "silphium-extinct",
    "tagCount": 1
  },
  {
    "name": "Sinicuichi",
    "category": "Oneirogen",
    "contraindications": "Pregnancy, driving",
    "description": "Used traditionally in Central America as a 'sun opener,' believed to enhance memory and auditory perception. Alters sound and memory in dreamlike ways.",
    "drugInteractions": "Avoid CNS depressants or alcohol",
    "duration": "4–6 hrs",
    "effects": [
      "Auditory distortion",
      "dreamy state",
      "euphoria"
    ],
    "id": "sinicuichi",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Alkaloids may modulate GABA and acetylcholine systems",
    "onset": "30–90 min",
    "pharmacokinetics": "Onset: 30–90 min; Duration: 4–6 hrs",
    "preparation": "Sun-fermented tea from leaves",
    "region": "Mexico, Central America",
    "safetyRating": "medium",
    "scientificName": "Heimia salicifolia",
    "sideEffects": "Dry mouth, yellow vision, dizziness",
    "tags": [
      "🌞 sun",
      "🎧 auditory",
      "🧠 dream"
    ],
    "therapeuticUses": "Folk use for memory and dream recall",
    "toxicity": "Low to moderate; not well studied",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "sinicuichi",
    "tagCount": 3
  },
  {
    "name": "Sweetgrass",
    "category": "Ritual / Visionary",
    "contraindications": "Not well documented",
    "description": "Vanilla-scented grass braided and burned to invite positive spirits.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Positive energy",
      "spiritual invocation"
    ],
    "id": "sweetgrass",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "Varies",
    "pharmacokinetics": "Not well documented",
    "preparation": "Burned or braided for ceremonies",
    "region": "🌐 Global / Ritual",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "✅ safe",
      "🔮 ritual"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "sweetgrass",
    "tagCount": 2
  },
  {
    "name": "Tagetes lucida (Mexican Tarragon)",
    "category": "Other",
    "contraindications": "Pregnancy, concurrent sedatives.",
    "description": "Sweet marigold used as tea or incense for clear dreams and calm.",
    "drugInteractions": "Benzodiazepines and serotonergic drugs.",
    "duration": "Unknown",
    "effects": [
      "Visionary dreams",
      "clarity"
    ],
    "id": "tagetes-lucida-mexican-tarragon",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Coumarins (dimethylfraxetin, herniarin) and essential oils (methyl eugenol, estragole) interact with GABAₐ and 5-HT₁ₐ receptors, producing anxiolytic and sedative effects [2, 2, 2, 10].",
    "onset": "1-5 min",
    "pharmacokinetics": "Consumed as tea or tincture; onset ~20–30 min; duration ~2–4 hours [2, 2].",
    "preparation": "Tea, incense, or smoke",
    "region": "🇲🇽 Latin America",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Mild GI upset, potential photosensitivity [2, 3].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌬️ smokable",
      "🕯️ ritual",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Anxiolytic, digestive aid, ritual incense for purification [2, 10].",
    "toxicity": "Low; traditional use generally safe.",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "tagetes-lucida-mexican-tarragon",
    "tagCount": 5
  },
  {
    "name": "Tilia europaea (Linden flower)",
    "category": "Dissociative / Sedative",
    "contraindications": "Not well documented",
    "description": "Soothing tree blossoms steeped as tea for relaxation and cold relief.",
    "drugInteractions": "Not well documented",
    "duration": "Unknown",
    "effects": [
      "Calming",
      "relaxing",
      "mild dream aid"
    ],
    "id": "tilia-europaea-linden-flower",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Unknown",
    "onset": "15-30 min",
    "pharmacokinetics": "Not well documented",
    "preparation": "Tea",
    "region": "🇪🇺 Europe",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Not well documented",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🧘 sedation"
    ],
    "therapeuticUses": "Not well documented",
    "toxicity": "Unknown",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "tilia-europaea-linden-flower",
    "tagCount": 4
  },
  {
    "name": "Toloache",
    "category": "Ritual / Visionary",
    "contraindications": "Everything — extremely risky",
    "description": "A powerful and dangerous tropane alkaloid plant traditionally used in witchcraft and shamanic rituals. Highly toxic.",
    "drugInteractions": "All CNS-affecting meds",
    "duration": "8–24 hrs",
    "effects": [
      "Delirium",
      "hallucinations",
      "disorientation"
    ],
    "id": "toloache",
    "intensity": "Extremely strong",
    "legalStatus": "Legal but restricted in many countries",
    "mechanismOfAction": "Anticholinergic – blocks acetylcholine via scopolamine, atropine",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 8–24 hrs",
    "preparation": "Seeds, leaves or flowers ingested or smoked (strongly discouraged)",
    "region": "Americas, Mediterranean",
    "safetyRating": "very high",
    "scientificName": "Datura spp.",
    "sideEffects": "Severe hallucinations, amnesia, potential death",
    "tags": [
      "☠️ toxic",
      "⚠️ caution",
      "🧠 vision"
    ],
    "therapeuticUses": "Rarely used medically; historically for pain/spiritual rites",
    "toxicity": "Very high",
    "toxicityLD50": "~50 mg/kg (atropine/scopolamine)",
    "affiliateLink": "",
    "slug": "toloache",
    "tagCount": 3
  },
  {
    "name": "Turnera diffusa",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy, MAOI coadministration.",
    "description": "Fragrant shrub known as damiana, smoked or brewed as aphrodisiac and relaxant.",
    "drugInteractions": "Serotonergic medications.",
    "duration": "Unknown",
    "effects": [
      "aphrodisiac",
      "mood-enhancing",
      "anxiolytic"
    ],
    "id": "turnera-diffusa",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Likely modulates serotonin, dopamine, and GABA neurotransmission via flavonoids and tannins [8, 6].",
    "onset": "1-5 min",
    "pharmacokinetics": "Tea or smoked; onset ~30–45 min; duration ~2–4 hours [8, 6].",
    "preparation": "Tea or smoke",
    "region": "Texas, Mexico, Central America",
    "safetyRating": 1,
    "scientificName": "Turnera diffusa",
    "sideEffects": "Mild headache, insomnia at high doses [8, 6].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌬️ smokable",
      "💫 euphoria"
    ],
    "therapeuticUses": "Aphrodisiac, mood enhancement, stress relief [8, 6].",
    "toxicity": "Low in traditional doses.",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "turnera-diffusa",
    "tagCount": 4
  },
  {
    "name": "Turnera ulmifolia",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Pregnancy",
    "description": "Closely related to Damiana (Turnera diffusa), this species is also used traditionally in folk medicine for reproductive health and mood.",
    "drugInteractions": "Unknown",
    "duration": "2–4 hrs",
    "effects": [
      "Relaxation",
      "mood elevation",
      "aphrodisiac"
    ],
    "id": "turnera-ulmifolia",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Unknown; may modulate GABA or serotonin",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 2–4 hrs",
    "preparation": "Tea from dried leaves or tincture",
    "region": "Central and South America",
    "safetyRating": "low",
    "scientificName": "Turnera ulmifolia",
    "sideEffects": "Mild sedation",
    "tags": [
      "✅ safe",
      "🌺 aphrodisiac",
      "😊 mood"
    ],
    "therapeuticUses": "Libido, menstrual cramps, anxiety",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "turnera-ulmifolia",
    "tagCount": 3
  },
  {
    "name": "Urtica dioica",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, blood thinners",
    "description": "Known as stinging nettle, this European herb has been used for centuries to relieve joint pain, allergies, and fatigue. Its psychoactivity is subtle, mostly somatic.",
    "drugInteractions": "Diuretics, anticoagulants",
    "duration": "3–6 hrs",
    "effects": [
      "Stimulation",
      "anti-inflammatory",
      "tonic"
    ],
    "id": "urtica-dioica",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Histamine release and anti-inflammatory cytokine modulation",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 3–6 hrs",
    "preparation": "Dried leaves as tea or extract",
    "region": "Europe, North America, Asia",
    "safetyRating": "low",
    "scientificName": "Urtica dioica",
    "sideEffects": "Mild stomach upset, skin irritation",
    "tags": [
      "✅ safe",
      "🌿 anti-inflammatory",
      "🧘 mild"
    ],
    "therapeuticUses": "Allergies, joint pain, urinary tract support",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "urtica-dioica",
    "tagCount": 3
  },
  {
    "name": "Viola odorata (Sweet violet)",
    "category": "Dissociative / Sedative",
    "contraindications": "None known in normal amounts; avoid if allergic.",
    "description": "Fragrant violet whose flowers are a mild sedative and expectorant.",
    "drugInteractions": "Minimal; theoretically additive with CNS depressants.",
    "duration": "Unknown",
    "effects": [
      "Mild sedative",
      "calming",
      "gentle dreaminess"
    ],
    "id": "viola-odorata-sweet-violet",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Mild central sedative via salicylates and alkaloids; may influence serotonin and prostaglandin pathways.",
    "onset": "15-30 min",
    "pharmacokinetics": "Taken as tea or syrup; onset ~30 min; short duration.",
    "preparation": "Tea or syrup",
    "region": "🇪🇺 Europe",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Very rare; may include mild drowsiness or nausea.",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "🧘 sedation"
    ],
    "therapeuticUses": "Cough suppressant, mild anxiolytic, anti-inflammatory, gentle sleep aid.",
    "toxicity": "Regarded as very safe in traditional herbalism.",
    "toxicityLD50": "No human LD50 data; extremely low toxicity reported.",
    "affiliateLink": "",
    "slug": "viola-odorata-sweet-violet",
    "tagCount": 4
  },
  {
    "name": "Virola spp.",
    "category": "Ethnobotanical / Rare",
    "contraindications": "Mental health disorders, heart issues, MAOI interactions.",
    "description": "Amazonian trees producing DMT-rich resins for shamanic snuffs.",
    "drugInteractions": "Dangerous with SSRIs, MAOIs, and other serotonergic substances.",
    "duration": "Unknown",
    "effects": [
      "DMT-containing tree resin"
    ],
    "id": "virola-spp",
    "intensity": "High",
    "legalStatus": "Restricted / Controlled",
    "mechanismOfAction": "Contains DMT, 5-MeO-DMT, and beta-carbolines; classic tryptamine entheogen profile.",
    "onset": "1-3 min",
    "pharmacokinetics": "Insufflated or oral with MAOIs; fast onset if smoked or snuffed.",
    "preparation": "Used in Amazonian snuffs",
    "region": "🇲🇽 Latin America",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Nausea, intense hallucinations, elevated heart rate.",
    "tags": [
      "⚠️ restricted"
    ],
    "therapeuticUses": "Used in Amazonian shamanic healing rituals; possible antidepressant potential.",
    "toxicity": "Can be overwhelming; physical toxicity low but psychological risks high.",
    "toxicityLD50": "No established LD50 for DMT in humans; low systemic toxicity at typical doses.",
    "affiliateLink": "",
    "slug": "virola-spp",
    "tagCount": 1
  },
  {
    "name": "Virola theiodora",
    "category": "Ritual / Visionary",
    "contraindications": "MAOIs, mental health issues",
    "description": "A snuff plant from the Amazon containing DMT and 5-MeO-DMT. Used by Yanomami and other tribes for potent visionary rituals.",
    "drugInteractions": "MAOIs, antidepressants",
    "duration": "20–60 min",
    "effects": [
      "Strong visuals",
      "spiritual experiences",
      "disorientation"
    ],
    "id": "virola-theiodora",
    "intensity": "Very strong",
    "legalStatus": "DMT controlled in most countries",
    "mechanismOfAction": "DMT and 5-MeO-DMT – 5-HT2A agonists",
    "onset": "1–3 min",
    "pharmacokinetics": "Onset: 1–3 min; Duration: 20–60 min",
    "preparation": "Bark resin dried and insufflated as snuff",
    "region": "Amazon (Brazil, Venezuela)",
    "safetyRating": "high",
    "scientificName": "Virola theiodora",
    "sideEffects": "Nausea, tremors, vomiting",
    "tags": [
      "⚠️ vision",
      "🌬️ snuff",
      "🧠 dmt"
    ],
    "therapeuticUses": "Shamanic ritual; purging and vision work",
    "toxicity": "High psychological, moderate physical",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "virola-theiodora",
    "tagCount": 3
  },
  {
    "name": "Voacanga africana",
    "category": "Ritual / Visionary",
    "contraindications": "Heart conditions, psychiatric disorders",
    "description": "A powerful African plant containing voacangine and iboga alkaloids. Used traditionally in ritual contexts and studied as a potential ibogaine precursor.",
    "drugInteractions": "Avoid all stimulants, antidepressants, MAOIs",
    "duration": "6–12 hrs",
    "effects": [
      "Stimulation",
      "psychedelic effects",
      "cardiovascular activation"
    ],
    "id": "voacanga-africana",
    "intensity": "Strong",
    "legalStatus": "Unscheduled; may be regulated for alkaloids",
    "mechanismOfAction": "Voacangine is a prodrug to ibogaine (NMDA antagonist, serotonin transporter blocker)",
    "onset": "30–90 min",
    "pharmacokinetics": "Onset: 30–90 min; Duration: 6–12 hrs",
    "preparation": "Bark decoction or purified alkaloids; high potency",
    "region": "West Africa",
    "safetyRating": "high",
    "scientificName": "Voacanga africana",
    "sideEffects": "Vomiting, overstimulation, visual distortions",
    "tags": [
      "⚠️ caution",
      "🌍 african",
      "🧠 vision"
    ],
    "therapeuticUses": "Experimental use in addiction therapy (via ibogaine synthesis)",
    "toxicity": "High in overdose; cardiotoxic potential",
    "toxicityLD50": "~90–120 mg/kg (est. voacangine)",
    "affiliateLink": "",
    "slug": "voacanga-africana",
    "tagCount": 3
  },
  {
    "name": "White Lily",
    "category": "Oneirogen",
    "contraindications": "Pregnancy",
    "description": "Related to Blue Lotus, this sacred flower from Mesoamerican traditions is used to promote meditation and lucid dreaming.",
    "drugInteractions": "Avoid CNS depressants",
    "duration": "2–4 hrs",
    "effects": [
      "Calm",
      "light sedation",
      "dream potentiation"
    ],
    "id": "white-lily",
    "intensity": "Mild",
    "legalStatus": "Legal",
    "mechanismOfAction": "Contains aporphine alkaloids (dopamine agonist)",
    "onset": "20–40 min",
    "pharmacokinetics": "Onset: 20–40 min; Duration: 2–4 hrs",
    "preparation": "Soaked in wine, steeped as tea, or smoked",
    "region": "Mexico, Central America",
    "safetyRating": "low",
    "scientificName": "Nymphaea ampla",
    "sideEffects": "Drowsiness, vivid dreams",
    "tags": [
      "✅ safe",
      "🌸 calm",
      "🌿 sedative"
    ],
    "therapeuticUses": "Relaxation, aphrodisiac, dream enhancement",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "white-lily",
    "tagCount": 3
  },
  {
    "name": "White Sage",
    "category": "Ritual / Visionary",
    "contraindications": "Asthma, pregnancy, respiratory disorders.",
    "description": "Aromatic sage revered for cleansing rituals and mental clarity.",
    "drugInteractions": "None significant documented.",
    "duration": "Unknown",
    "effects": [
      "Clarity",
      "purification",
      "spiritual reset"
    ],
    "id": "white-sage",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "1,8-Cineole and α-thujone inhibit pro-inflammatory cytokines (TNFα, IL-1β) and arachidonic acid metabolism; antimicrobial and antiviral effects via NF-κB inhibition [0, 19, 0, 4].",
    "onset": "5-20 min",
    "pharmacokinetics": "Inhaled or topical; rapid local absorption; systemic exposure minimal; metabolites excreted renally [0, 4].",
    "preparation": "Burned as incense",
    "region": "🌐 Global / Ritual",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "Respiratory irritation, asthmatic exacerbation, headaches at high exposure [0, 19].",
    "tags": [
      "✅ safe",
      "🔮 ritual",
      "🕯️ ritual",
      "🧠 cognitive"
    ],
    "therapeuticUses": "Smudging rituals for purification, antimicrobial, respiratory support, mental clarity [0, 19].",
    "toxicity": "Very low; excessive inhalation may cause dizziness or nausea [0, 4].",
    "toxicityLD50": "Unknown",
    "affiliateLink": "",
    "slug": "white-sage",
    "tagCount": 4
  },
  {
    "name": "Wild Lettuce",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, CNS depressants",
    "description": "Leafy plant exuding sedative latex historically called 'lettuce opium.'",
    "drugInteractions": "Avoid with sedatives, opioids",
    "duration": "3–6 hrs",
    "effects": [
      "Sedation",
      "pain relief",
      "light euphoria"
    ],
    "id": "wild-lettuce",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Lactucin and lactucopicrin may act as acetylcholinesterase inhibitors",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 3–6 hrs",
    "preparation": "Tincture, dried leaf tea, smoked",
    "region": "Europe, North America",
    "safetyRating": "medium",
    "scientificName": "Lactuca virosa",
    "sideEffects": "Drowsiness, nausea at high doses",
    "tags": [
      "✅ safe",
      "🌿 herbal",
      "😴 sedative"
    ],
    "therapeuticUses": "Insomnia, pain relief, cough suppression",
    "toxicity": "Low in traditional doses",
    "toxicityLD50": "Not established",
    "affiliateLink": "",
    "slug": "wild-lettuce",
    "tagCount": 3
  },
  {
    "name": "Withania somnifera (Ashwagandha)",
    "category": "Dissociative / Sedative",
    "contraindications": "Pregnancy, hyperthyroidism, autoimmune diseases [0, 1].",
    "description": "Indian nightshade root that reduces stress hormones and promotes sleep.",
    "drugInteractions": "Immunosuppressants, sedatives, thyroid medications [0, 24].",
    "duration": "Unknown",
    "effects": [
      "Grounded calm",
      "dream support"
    ],
    "id": "withania-somnifera-ashwagandha",
    "intensity": "Mild",
    "legalStatus": "Legal / Unregulated",
    "mechanismOfAction": "Modulates GABAergic and serotonergic activity; reduces cortisol; withanolides are primary active compounds.",
    "onset": "30-60 min",
    "pharmacokinetics": "Oral onset 30–60 min; withanolides bioavailable; hepatic metabolism; renal excretion [0, 17].",
    "preparation": "Tea or capsule",
    "region": "🇮🇳 India",
    "safetyRating": 1,
    "scientificName": "Unknown",
    "sideEffects": "GI upset, drowsiness, rare thyroid hormone changes [0, 9].",
    "tags": [
      "☕ brewable",
      "✅ safe",
      "🌀 dissociation",
      "💊 oral",
      "🧘 sedation"
    ],
    "therapeuticUses": "Adaptogen, anti-stress, anxiolytic, neuroprotective, anti-inflammatory, immune support [0, 1, 0, 17].",
    "toxicity": "Low; well-tolerated in clinical studies [0, 1].",
    "toxicityLD50": "LD50 (rats, oral) ~4650 mg/kg; relatively low acute toxicity.",
    "affiliateLink": "",
    "slug": "withania-somnifera-ashwagandha",
    "tagCount": 5
  },
  {
    "name": "Wormwood",
    "category": "Oneirogen",
    "contraindications": "Pregnancy, epilepsy, high doses",
    "description": "Key ingredient in absinthe. Contains thujone, which is a GABA_A antagonist and neurostimulant in high doses. Historically used for dreaming, digestion, and ritual.",
    "drugInteractions": "Avoid alcohol, CNS drugs",
    "duration": "4–6 hrs",
    "effects": [
      "Lucid dreams",
      "stimulating",
      "mental clarity"
    ],
    "id": "wormwood",
    "intensity": "Mild to moderate",
    "legalStatus": "Restricted in high-thujone formulations",
    "mechanismOfAction": "Thujone – GABA_A receptor antagonist",
    "onset": "30–60 min",
    "pharmacokinetics": "Onset: 30–60 min; Duration: 4–6 hrs",
    "preparation": "Tincture, tea, or absinthe-style extract",
    "region": "Europe, Asia, North America",
    "safetyRating": "medium",
    "scientificName": "Artemisia absinthium",
    "sideEffects": "Headache, nausea, tremors at high doses",
    "tags": [
      "⚠️ caution",
      "🌙 dream",
      "🌿 bitter"
    ],
    "therapeuticUses": "Digestive tonic, dream work, antiparasitic",
    "toxicity": "Neurotoxic in large doses",
    "toxicityLD50": "~30 mg/kg (thujone)",
    "activeConstituents": [
      {
        "name": "Thujone",
        "type": "terpenoid",
        "effect": "GABA_A antagonist"
      }
    ],
    "affiliateLink": "",
    "slug": "wormwood",
    "tagCount": 3
  },
  {
    "name": "Yerba Mate",
    "category": "Empathogen / Euphoriant",
    "contraindications": "Anxiety, heart conditions, ulcers",
    "description": "South American herbal stimulant rich in caffeine, theobromine, and theophylline. Traditionally shared as a communal energizing tea.",
    "drugInteractions": "CNS stimulants, caffeine",
    "duration": "3–5 hrs",
    "effects": [
      "Stimulation",
      "focus",
      "social energy"
    ],
    "id": "yerba-mate",
    "intensity": "Mild to moderate",
    "legalStatus": "Legal",
    "mechanismOfAction": "Adenosine receptor antagonism (via caffeine/theobromine)",
    "onset": "10–30 min",
    "pharmacokinetics": "Onset: 10–30 min; Duration: 3–5 hrs",
    "preparation": "Hot infusion or cold-brewed (tereré)",
    "region": "Argentina, Paraguay, Brazil",
    "safetyRating": "medium",
    "scientificName": "Ilex paraguariensis",
    "sideEffects": "Jitteriness, insomnia, GI discomfort in sensitive individuals",
    "tags": [
      "stimulant",
      "🌿 social",
      "🔥 energy"
    ],
    "therapeuticUses": "Energy, mental clarity, digestion",
    "toxicity": "Low to moderate (long-term use linked to GI issues)",
    "toxicityLD50": "~192 mg/kg (caffeine)",
    "affiliateLink": "",
    "slug": "yerba-mate",
    "tagCount": 3
  },
  {
    "name": "Yopo",
    "category": "Ritual / Visionary",
    "contraindications": "Asthma, mental health disorders, MAOIs",
    "description": "Used in Amazonian rituals, Yopo seeds are ground and insufflated to induce powerful entheogenic experiences. Contains bufotenine, DMT, and 5-MeO-DMT.",
    "drugInteractions": "Avoid with antidepressants or MAOIs",
    "duration": "30–60 min",
    "effects": [
      "Intense visions",
      "altered time perception",
      "spiritual insight"
    ],
    "id": "yopo",
    "intensity": "Very strong",
    "legalStatus": "Controlled in many countries due to DMT content",
    "mechanismOfAction": "5-HT2A receptor agonist (bufotenine, DMT, 5-MeO-DMT)",
    "onset": "1–5 min",
    "pharmacokinetics": "Onset: 1–5 min; Duration: 30–60 min",
    "preparation": "Roasted, ground seeds mixed with alkaline ash and blown nasally",
    "region": "South America (Orinoco, Amazon basin)",
    "safetyRating": "high",
    "scientificName": "Anadenanthera peregrina",
    "sideEffects": "Intense nausea, disorientation, respiratory irritation",
    "tags": [
      "⚠️ caution",
      "🌬️ snuff",
      "🧠 vision"
    ],
    "therapeuticUses": "Shamanic healing, insight rituals",
    "toxicity": "High risk with improper use; bufotenine toxic at high dose",
    "toxicityLD50": "50–80 mg/kg (bufotenine, mice)",
    "affiliateLink": "",
    "slug": "yopo",
    "tagCount": 3
  },
  {
    "name": "Amanita muscaria",
    "scientificName": "Amanita muscaria",
    "category": "Ritual / Visionary",
    "tags": [
      "⚠️ caution",
      "🍄 mushroom"
    ],
    "effects": [
      "Euphoria",
      "dissociation",
      "dreamlike state"
    ],
    "mechanismOfAction": "Ibotenic acid and muscimol act as GABA agonists and NMDA antagonists after decarboxylation.",
    "therapeuticUses": "Shamanic ritual, historical analgesic and sedative use.",
    "pharmacokinetics": "Onset 30–90 min; duration 4–8 hrs when ingested.",
    "toxicity": "Can cause nausea, delirium, or poisoning if dose is high or raw mushrooms consumed.",
    "toxicityLD50": "LD50 ~38 mg/kg (muscimol, mice)",
    "intensity": "Moderate to strong",
    "onset": "30–90 min",
    "duration": "4–8 hrs",
    "region": "Northern Hemisphere, boreal forests",
    "legalStatus": "Legal in most countries",
    "safetyRating": "medium",
    "preparation": "Traditionally dried or parboiled to convert ibotenic acid to muscimol.",
    "contraindications": "Avoid with sedatives or psychiatric conditions.",
    "sideEffects": "Nausea, ataxia, delirium",
    "drugInteractions": "Potentiates sedatives and alcohol",
    "description": "Iconic red-capped mushroom used in Siberian shamanism and folklore. Psychoactive when properly prepared.",
    "affiliateLink": "",
    "slug": "amanita-muscaria",
    "tagCount": 2
  },
  {
    "name": "Valerian Root",
    "scientificName": "Valeriana officinalis",
    "category": "Sedative / Anxiolytic",
    "tags": [
      "🌿 root",
      "😴 sleep"
    ],
    "effects": [
      "Relaxation",
      "improved sleep",
      "mild anxiolysis"
    ],
    "mechanismOfAction": "Valerenic acid modulates GABA receptors and may inhibit GABA breakdown.",
    "therapeuticUses": "Insomnia, anxiety, muscle tension.",
    "pharmacokinetics": "Oral; onset ~30 min; peak 1–2 hrs; duration ~4 hrs.",
    "toxicity": "Generally safe; high doses may cause headaches or dizziness.",
    "toxicityLD50": "LD50 >3 g/kg (mouse, extract)",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "4 hrs",
    "region": "Europe, North America",
    "legalStatus": "Legal",
    "safetyRating": "low",
    "preparation": "Dried root used as tea, tincture, or capsule.",
    "contraindications": "Avoid with other sedatives or during pregnancy.",
    "sideEffects": "Drowsiness, vivid dreams",
    "drugInteractions": "Additive with benzodiazepines or alcohol",
    "description": "Traditional European herb valued for calming and sleep-promoting properties.",
    "affiliateLink": "",
    "slug": "valerian-root",
    "tagCount": 2
  },
  {
    "name": "Huperzia serrata",
    "scientificName": "Huperzia serrata",
    "category": "Nootropic / Cognitive",
    "tags": [
      "⚗️ alkaloid",
      "🧠 memory"
    ],
    "effects": [
      "Improved memory",
      "alertness"
    ],
    "mechanismOfAction": "Provides huperzine A, a reversible acetylcholinesterase inhibitor.",
    "therapeuticUses": "Memory enhancement, research for Alzheimer’s disease.",
    "pharmacokinetics": "Oral; onset within 30 min; duration 6–8 hrs.",
    "toxicity": "Generally safe at low doses; high doses may cause cholinergic effects.",
    "toxicityLD50": "LD50 >2 mg/kg (rats, huperzine A)",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "6–8 hrs",
    "region": "China, Southeast Asia",
    "legalStatus": "Legal in most countries",
    "safetyRating": "medium",
    "preparation": "Standardized extract or whole plant tea.",
    "contraindications": "Bradycardia, cholinergic medications.",
    "sideEffects": "Nausea, sweating, muscle twitching at high doses",
    "drugInteractions": "Potentiates cholinergic drugs or acetylcholinesterase inhibitors",
    "description": "Club moss used in Traditional Chinese Medicine; source of huperzine A nootropic.",
    "affiliateLink": "",
    "slug": "huperzia-serrata",
    "tagCount": 2
  },
  {
    "name": "Syrian Rue",
    "scientificName": "Peganum harmala",
    "category": "Ritual / MAOI",
    "tags": [
      "⚠️ maoi",
      "🌿 seeds"
    ],
    "effects": [
      "MAOI effects",
      "mild hallucinations",
      "dream enhancement"
    ],
    "mechanismOfAction": "Harmala alkaloids reversibly inhibit MAO-A and MAO-B.",
    "therapeuticUses": "Used in Middle Eastern rituals; sometimes combined with DMT for oral activity.",
    "pharmacokinetics": "Oral ingestion; onset 20–40 min; duration 4–6 hrs.",
    "toxicity": "High doses cause nausea, tremors, or hallucinations.",
    "toxicityLD50": "LD50 ~150 mg/kg (harmaline, mice)",
    "intensity": "Moderate",
    "onset": "20–40 min",
    "duration": "4–6 hrs",
    "region": "Middle East, Central Asia",
    "legalStatus": "Restricted in some countries",
    "safetyRating": "medium",
    "preparation": "Seeds ground for tea or extracted.",
    "contraindications": "Avoid with SSRIs, stimulants, or liver disease.",
    "sideEffects": "Nausea, vomiting, weakness",
    "drugInteractions": "Dangerous with other MAOIs or serotonergic drugs",
    "description": "Potent MAOI seed used traditionally for protection and divination.",
    "affiliateLink": "",
    "slug": "syrian-rue",
    "tagCount": 2
  },
  {
    "name": "Wild Dagga",
    "scientificName": "Leonotis leonurus",
    "category": "Relaxant / Euphoric",
    "tags": [
      "🌿 smoke",
      "🦁 dagga"
    ],
    "effects": [
      "Mild euphoria",
      "relaxation"
    ],
    "mechanismOfAction": "Contains leonurine; may act on serotonin and cannabinoid receptors.",
    "therapeuticUses": "Folk remedy for coughs, fever and as a mild psychoactive when smoked.",
    "pharmacokinetics": "Smoked or brewed; onset within minutes; duration ~1–3 hrs.",
    "toxicity": "Low; high doses may cause dizziness or nausea.",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "Minutes",
    "duration": "1–3 hrs",
    "region": "Southern Africa",
    "legalStatus": "Legal",
    "safetyRating": "low",
    "preparation": "Dried leaves or flowers smoked or brewed as tea.",
    "contraindications": "Avoid during pregnancy or with heart conditions.",
    "sideEffects": "Dry mouth, slight dizziness",
    "drugInteractions": "May potentiate other sedatives",
    "description": "Orange-flowered shrub also called lion’s tail; smoked traditionally for mild cannabis-like effects.",
    "affiliateLink": "",
    "slug": "wild-dagga",
    "tagCount": 2
  },
  {
    "name": "Yohimbe",
    "scientificName": "Pausinystalia johimbe",
    "category": "Stimulant / Aphrodisiac",
    "tags": [
      "🌳 bark",
      "🔥 libido"
    ],
    "effects": [
      "Stimulation",
      "increased libido",
      "elevated heart rate"
    ],
    "mechanismOfAction": "Yohimbine blocks alpha-2 adrenergic receptors leading to increased norepinephrine release.",
    "therapeuticUses": "Used for erectile dysfunction and as a stimulant.",
    "pharmacokinetics": "Oral; onset ~30 min; duration 2–4 hrs.",
    "toxicity": "High doses cause anxiety, hypertension, or hallucinations.",
    "toxicityLD50": "LD50 ~50 mg/kg (rats, yohimbine)",
    "intensity": "Moderate",
    "onset": "30 min",
    "duration": "2–4 hrs",
    "region": "West Africa",
    "legalStatus": "Restricted or prescription in some countries",
    "safetyRating": "medium",
    "preparation": "Bark extracts or standardized tablets.",
    "contraindications": "Heart disease, anxiety disorders, MAOIs.",
    "sideEffects": "Increased blood pressure, jitteriness, insomnia",
    "drugInteractions": "Interacts with stimulants and antihypertensives",
    "description": "West African tree bark rich in yohimbine, historically used as an aphrodisiac and stimulant.",
    "affiliateLink": "",
    "slug": "yohimbe",
    "tagCount": 2
  },
  {
    "name": "Khat",
    "scientificName": "Catha edulis",
    "category": "Stimulant / Euphoric",
    "tags": [
      "⚠️ controlled",
      "🌿 leaves"
    ],
    "effects": [
      "Euphoria",
      "alertness",
      "appetite suppression"
    ],
    "mechanismOfAction": "Cathinone alkaloids release dopamine and norepinephrine.",
    "therapeuticUses": "Social stimulant chewed in East Africa and the Arabian Peninsula.",
    "pharmacokinetics": "Chewed fresh leaves; onset 15–30 min; duration 3–5 hrs.",
    "toxicity": "Excess use leads to insomnia, hypertension, or dependency.",
    "toxicityLD50": "Cathinone LD50 ~75 mg/kg (rats)",
    "intensity": "Moderate",
    "onset": "15–30 min",
    "duration": "3–5 hrs",
    "region": "Horn of Africa, Yemen",
    "legalStatus": "Illegal or controlled in many countries",
    "safetyRating": "medium",
    "preparation": "Fresh leaves chewed slowly.",
    "contraindications": "Heart issues, pregnancy, MAOIs.",
    "sideEffects": "Dry mouth, increased heart rate, insomnia",
    "drugInteractions": "Avoid with stimulants or MAOIs",
    "description": "Evergreen shrub whose fresh leaves are chewed for stimulant and euphoric effects in social settings.",
    "affiliateLink": "",
    "slug": "khat",
    "tagCount": 2
  },
  {
    "name": "Camellia sinensis",
    "scientificName": "Camellia sinensis",
    "category": "Stimulant / Nootropic",
    "tags": [
      "☕ caffeine",
      "🍵 tea"
    ],
    "effects": [
      "Alertness",
      "relaxed focus"
    ],
    "mechanismOfAction": "Caffeine antagonizes adenosine receptors; L-theanine modulates glutamate and GABA.",
    "therapeuticUses": "Improved cognition, antioxidant, metabolism boost.",
    "pharmacokinetics": "Beverage; onset 15 min; peak 30–60 min; duration 2–4 hrs.",
    "toxicity": "High intake can cause jitteriness or insomnia.",
    "toxicityLD50": "Caffeine LD50 ~190 mg/kg (rats)",
    "intensity": "Mild",
    "onset": "15 min",
    "duration": "2–4 hrs",
    "region": "China, India, worldwide cultivation",
    "legalStatus": "Legal",
    "safetyRating": "low",
    "preparation": "Leaves steeped in hot water; various fermentations (green, black, oolong).",
    "contraindications": "Heart conditions, pregnancy (high amounts).",
    "sideEffects": "Jitters, insomnia, digestive upset",
    "drugInteractions": "Potentiates other stimulants; may reduce sedative efficacy",
    "description": "Source of green and black tea; contains caffeine and theanine for balanced stimulation.",
    "affiliateLink": "",
    "slug": "camellia-sinensis",
    "tagCount": 2
  },
  {
    "name": "Ephedra sinica",
    "scientificName": "Ephedra sinica",
    "category": "Stimulant / Decongestant",
    "tags": [
      "⚠️ potent",
      "🌿 ma huang"
    ],
    "effects": [
      "Energy boost",
      "bronchodilation"
    ],
    "mechanismOfAction": "Ephedrine and pseudoephedrine stimulate adrenergic receptors and release norepinephrine.",
    "therapeuticUses": "Traditional Chinese medicine for asthma, colds, and as a stimulant.",
    "pharmacokinetics": "Oral; onset ~20 min; duration 4–6 hrs.",
    "toxicity": "High doses can raise blood pressure and cause cardiovascular stress.",
    "toxicityLD50": "Ephedrine LD50 ~50 mg/kg (rats)",
    "intensity": "Strong",
    "onset": "20 min",
    "duration": "4–6 hrs",
    "region": "China and Central Asia",
    "legalStatus": "Regulated in many countries",
    "safetyRating": "medium",
    "preparation": "Dried stems brewed as tea or processed into extract.",
    "contraindications": "Heart disease, hypertension, MAOIs.",
    "sideEffects": "Jitters, elevated heart rate, insomnia",
    "drugInteractions": "Dangerous with other stimulants or MAOIs",
    "description": "Shrubby plant known as Ma Huang; source of ephedrine used both medicinally and recreationally.",
    "affiliateLink": "",
    "slug": "ephedra-sinica",
    "tagCount": 2
  },
  {
    "name": "Sassafras",
    "scientificName": "Sassafras albidum",
    "category": "Stimulant / Traditional",
    "tags": [
      "🌳 root bark",
      "🌿 tea"
    ],
    "effects": [
      "Mild euphoria",
      "warmth"
    ],
    "mechanismOfAction": "Safrole may modulate dopamine release and acts as a mild hallucinogen at high doses.",
    "therapeuticUses": "Historically used as spring tonic, aromatic beverage, and folk medicine.",
    "pharmacokinetics": "Brewed as tea; onset 20–40 min; duration 2–4 hrs.",
    "toxicity": "Safrole is hepatotoxic and potentially carcinogenic in high amounts.",
    "toxicityLD50": "Safrole LD50 ~1.95 g/kg (rats)",
    "intensity": "Mild",
    "onset": "20–40 min",
    "duration": "2–4 hrs",
    "region": "Eastern North America",
    "legalStatus": "Restricted as food additive in the U.S.",
    "safetyRating": "medium",
    "preparation": "Root bark traditionally brewed or distilled into oil of sassafras.",
    "contraindications": "Liver disease, pregnancy.",
    "sideEffects": "Nausea, possible hepatotoxicity",
    "drugInteractions": "May interact with MAOIs or increase hepatotoxic drugs",
    "description": "Fragrant tree whose root bark and oil were once common flavorings; contains safrole with mild psychoactive properties.",
    "affiliateLink": "",
    "slug": "sassafras",
    "tagCount": 2
  },
  {
    "name": "Guarana",
    "scientificName": "Paullinia cupana",
    "category": "Stimulant / Nootropic",
    "tags": [
      "☕ high caffeine",
      "🍫 seed"
    ],
    "effects": [
      "Energy",
      "mental focus"
    ],
    "mechanismOfAction": "Seeds contain high caffeine content that blocks adenosine receptors.",
    "therapeuticUses": "Fatigue reduction, weight loss aid, traditional tonic.",
    "pharmacokinetics": "Oral; onset 20 min; peak 1 hr; duration 4–6 hrs.",
    "toxicity": "Overuse leads to restlessness, insomnia, or tachycardia.",
    "toxicityLD50": "Caffeine LD50 ~190 mg/kg (rats)",
    "intensity": "Moderate",
    "onset": "20 min",
    "duration": "4–6 hrs",
    "region": "Amazon basin",
    "legalStatus": "Legal",
    "safetyRating": "low",
    "preparation": "Roasted seeds ground into powder for drinks or capsules.",
    "contraindications": "Heart problems, pregnancy, sensitivity to caffeine.",
    "sideEffects": "Jitteriness, stomach upset",
    "drugInteractions": "Potentiates other stimulants; may interfere with sedatives",
    "description": "Climbing plant native to Brazil; its seeds provide a potent caffeine kick and are popular in energy drinks.",
    "affiliateLink": "",
    "slug": "guarana",
    "tagCount": 2
  },
  {
    "name": "Hawaiian Baby Woodrose",
    "scientificName": "Argyreia nervosa",
    "category": "Psychedelic / LSA",
    "tags": [
      "⚠️ nausea",
      "🌱 seeds"
    ],
    "effects": [
      "Visual distortions",
      "euphoria",
      "introspection"
    ],
    "mechanismOfAction": "Seeds contain ergoline alkaloids (LSA) that act on serotonin receptors similarly to LSD but with milder potency.",
    "therapeuticUses": "Occasional spiritual or introspective use; historically as ornamental and traditional medicine.",
    "pharmacokinetics": "Oral; onset 30–90 min; duration 6–10 hrs.",
    "toxicity": "Seeds can cause severe nausea and vasoconstriction at high doses.",
    "toxicityLD50": "Not well established for humans; animal data scarce",
    "intensity": "Strong",
    "onset": "30–90 min",
    "duration": "6–10 hrs",
    "region": "India, tropical regions",
    "legalStatus": "Seeds legal in many places; extraction may be controlled",
    "safetyRating": "medium",
    "preparation": "Seeds scraped and chewed or ground; often cold-water extracted.",
    "contraindications": "Pregnancy, liver issues, MAOIs.",
    "sideEffects": "Nausea, vasoconstriction, sedation",
    "drugInteractions": "Avoid with vasoconstrictors or other psychedelics",
    "description": "Climber with heart-shaped leaves; its seeds contain LSA and are used as a legal alternative to LSD experiences.",
    "affiliateLink": "",
    "slug": "hawaiian-baby-woodrose",
    "tagCount": 2
  },
  {
    "name": "Tabernanthe iboga",
    "scientificName": "Tabernanthe iboga",
    "category": "Ritual / Visionary",
    "tags": [
      "⚠️ intense",
      "🌿 root bark"
    ],
    "effects": [
      "Powerful visions",
      "spiritual insight",
      "stimulation"
    ],
    "mechanismOfAction": "Ibogaine acts on NMDA, kappa-opioid, and serotonin systems while promoting neurotrophic factors.",
    "therapeuticUses": "Traditional Bwiti initiation; studied for addiction interruption.",
    "pharmacokinetics": "Oral; onset 1–3 hrs; duration 12–24 hrs.",
    "toxicity": "Cardiotoxic and neurotoxic at high doses; medical supervision required.",
    "toxicityLD50": "Ibogaine LD50 ~50 mg/kg (mice)",
    "intensity": "Very strong",
    "onset": "1–3 hrs",
    "duration": "12–24 hrs",
    "region": "Central Africa",
    "legalStatus": "Controlled or prescription in many countries",
    "safetyRating": "low",
    "preparation": "Root bark chewed or made into extracts; used ceremonially.",
    "contraindications": "Heart conditions, psychiatric disorders, MAOIs.",
    "sideEffects": "Nausea, ataxia, prolonged recovery",
    "drugInteractions": "Dangerous with other stimulants or opioids",
    "description": "Sacred shrub central to Bwiti ceremonies; contains ibogaine producing intense visionary states and potential addiction therapy.",
    "affiliateLink": "",
    "slug": "tabernanthe-iboga",
    "tagCount": 2
  },
  {
    "name": "LSD",
    "scientificName": "Lysergic acid diethylamide",
    "category": "Psychedelic",
    "effects": [
      "Intense visuals",
      "ego dissolution",
      "synesthesia"
    ],
    "preparation": "Oral blotter or liquid",
    "intensity": "High",
    "onset": "30-90 min",
    "legalStatus": "Controlled / Illegal in many regions",
    "region": "🌎 Synthetic",
    "tags": [
      "⚠️ restricted",
      "🌀 visionary",
      "💊 oral"
    ],
    "mechanismOfAction": "Potent 5-HT2A receptor agonist affecting serotonin and dopamine systems.",
    "pharmacokinetics": "Oral administration with effects lasting 8-12 h; hepatic metabolism to inactive metabolites.",
    "therapeuticUses": "Investigated for cluster headaches, anxiety, and addiction therapy.",
    "sideEffects": "Anxiety, confusion, possible flashbacks at high doses.",
    "contraindications": "Psychosis, severe cardiovascular disease.",
    "drugInteractions": "SSRIs may blunt effects; MAOIs potentiate.",
    "toxicity": "Very low physiological toxicity but strong psychological effects.",
    "toxicityLD50": ">14 mg/kg (mice, intravenous)",
    "id": "lsd",
    "description": "Semi-synthetic ergoline discovered in 1938; among the most potent psychedelics.",
    "safetyRating": 2,
    "affiliateLink": "",
    "slug": "lsd",
    "tagCount": 3
  },
  {
    "name": "Psilocybin",
    "scientificName": "Psilocybin",
    "category": "Psychedelic",
    "effects": [
      "Visual patterns",
      "mystical insight",
      "emotional release"
    ],
    "preparation": "Consumed as dried mushrooms or extract",
    "intensity": "Moderate",
    "onset": "20-60 min",
    "legalStatus": "Controlled in many countries",
    "region": "🌎 Global",
    "tags": [
      "⚠️ restricted",
      "🌀 visionary",
      "💊 oral"
    ],
    "mechanismOfAction": "Converted to psilocin which acts as 5-HT2A agonist.",
    "pharmacokinetics": "Oral onset ~30 min; duration 4-6 h; metabolized hepatically.",
    "therapeuticUses": "Promising treatment for depression, addiction, and end-of-life anxiety.",
    "sideEffects": "Nausea, anxiety, transient increase in heart rate.",
    "contraindications": "Psychosis, uncontrolled hypertension.",
    "drugInteractions": "SSRIs may reduce effects; avoid MAOIs.",
    "toxicity": "Low toxicity; wide margin of safety.",
    "toxicityLD50": "285 mg/kg (rats, oral) for psilocybin",
    "id": "psilocybin",
    "description": "Active compound in psychedelic mushrooms producing profound perceptual changes.",
    "safetyRating": 2,
    "affiliateLink": "",
    "slug": "psilocybin",
    "tagCount": 3
  },
  {
    "name": "Mescaline",
    "scientificName": "3,4,5-trimethoxyphenethylamine",
    "category": "Psychedelic",
    "effects": [
      "Color enhancement",
      "empathy",
      "spiritual visions"
    ],
    "preparation": "Ingested cactus buttons or purified sulfate",
    "intensity": "Moderate",
    "onset": "45-120 min",
    "legalStatus": "Controlled in many regions",
    "region": "🌎 Americas",
    "tags": [
      "⚠️ restricted",
      "🌀 visionary",
      "💊 oral"
    ],
    "mechanismOfAction": "Phenethylamine psychedelic acting on 5-HT2A and dopamine receptors.",
    "pharmacokinetics": "Oral absorption with peak at 2 h; duration 8-12 h; renal excretion.",
    "therapeuticUses": "Traditional sacrament; studied for alcoholism and psychotherapy.",
    "sideEffects": "Nausea, increased heart rate, dilated pupils.",
    "contraindications": "Heart disease, pregnancy.",
    "drugInteractions": "MAOIs and sympathomimetics may potentiate.",
    "toxicity": "Low physiological toxicity; psychological effects strong.",
    "toxicityLD50": ">1,000 mg/kg (rats, oral)",
    "id": "mescaline",
    "description": "Classic phenethylamine psychedelic from peyote and San Pedro cacti.",
    "safetyRating": 2,
    "affiliateLink": "",
    "slug": "mescaline",
    "tagCount": 3
  },
  {
    "name": "Acacia maidenii",
    "scientificName": "Acacia maidenii",
    "category": "Ritual / Visionary",
    "tags": [
      "australian",
      "dmt",
      "tree"
    ],
    "effects": [
      "strong visuals",
      "mystical experience",
      "euphoria"
    ],
    "mechanismOfAction": "Root bark contains DMT that acts as a 5‑HT2A agonist; requires MAOI inhibition for oral activity",
    "therapeuticUses": "Used in entheogenic brews for introspection and spiritual healing",
    "pharmacokinetics": "Smoked onset 2–3 min, duration 15–30 min; oral with MAOI onset 20–45 min, duration 4–6 h",
    "toxicity": "Low physiological toxicity but intense psychological effects",
    "toxicityLD50": "Not established",
    "intensity": "Strong",
    "onset": "2–45 min depending on route",
    "duration": "15 min – 6 h depending on route",
    "region": "Native to eastern Australia",
    "legalStatus": "DMT restricted in many countries",
    "safetyRating": "Medium",
    "preparation": "Root bark traditionally combined with MAOI plants or smoked",
    "contraindications": "Mental illness, MAOI or SSRI medication",
    "sideEffects": "Nausea, anxiety, profound alterations of perception",
    "drugInteractions": "Dangerous with MAOIs or serotonergic drugs",
    "description": "Australian acacia tree whose bark is rich in DMT and sometimes used in ayahuasca analogues.",
    "id": "acacia-maidenii",
    "affiliateLink": "",
    "slug": "acacia-maidenii",
    "tagCount": 3
  },
  {
    "name": "Acorus calamus",
    "scientificName": "Acorus calamus",
    "category": "Calming / Dream",
    "tags": [
      "dream",
      "root",
      "sedative"
    ],
    "effects": [
      "calm",
      "mild euphoria",
      "dream enhancement"
    ],
    "mechanismOfAction": "Contains beta‑asarone which may modulate GABA and serotonin receptors",
    "therapeuticUses": "Traditionally used for digestion, anxiety and divination",
    "pharmacokinetics": "Onset ~30 min orally, lasting 2–4 h",
    "toxicity": "Beta‑asarone may be carcinogenic in high doses",
    "toxicityLD50": "Exceeds 1 g/kg in rodents",
    "intensity": "Mild",
    "onset": "Around 30 min",
    "duration": "2–4 h",
    "region": "Europe, Asia, North America",
    "legalStatus": "Generally legal, though some preparations restricted",
    "safetyRating": "Low–Medium",
    "preparation": "Dried rhizome chewed or made into tea",
    "contraindications": "Pregnancy, high doses, liver disease",
    "sideEffects": "Nausea, vomiting at large doses",
    "drugInteractions": "Potential additive effects with other sedatives",
    "description": "Fragrant wetland herb known as Sweet Flag; historically used for relaxation and vivid dreams.",
    "id": "acorus-calamus",
    "affiliateLink": "",
    "slug": "acorus-calamus",
    "tagCount": 3
  },
  {
    "name": "Albizia julibrissin",
    "scientificName": "Albizia julibrissin",
    "category": "Calming / Mood",
    "tags": [
      "tcm",
      "anxiolytic",
      "flower"
    ],
    "effects": [
      "uplifted mood",
      "relaxation",
      "mild sedation"
    ],
    "mechanismOfAction": "Contains saponins and flavonoids thought to modulate serotonin and GABA",
    "therapeuticUses": "Traditional Chinese medicine uses the bark and flowers as a calming antidepressant",
    "pharmacokinetics": "Onset 30–60 min orally; effects last 3–5 h",
    "toxicity": "Low",
    "toxicityLD50": "Not well established",
    "intensity": "Mild",
    "onset": "30–60 min",
    "duration": "3–5 h",
    "region": "Native to Asia, cultivated elsewhere",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Dried bark or flowers taken as teas or tinctures",
    "contraindications": "None known, though caution with sedatives",
    "sideEffects": "Rare drowsiness in sensitive individuals",
    "drugInteractions": "May enhance other sedatives or antidepressants",
    "description": "Often called Persian silk tree; valued in Asian herbalism for its tranquil and mood-brightening properties.",
    "id": "albizia-julibrissin",
    "affiliateLink": "",
    "slug": "albizia-julibrissin",
    "tagCount": 3
  },
  {
    "name": "Anemone pulsatilla",
    "scientificName": "Pulsatilla vulgaris",
    "category": "Sedative / Analgesic",
    "tags": [
      "anodyne",
      "folk",
      "sedative"
    ],
    "effects": [
      "calm",
      "pain relief",
      "mild altered awareness"
    ],
    "mechanismOfAction": "Contains lactones derived from protoanemonin that depress the central nervous system",
    "therapeuticUses": "European folk remedy for anxiety, insomnia and menstrual pain",
    "pharmacokinetics": "Onset 20–30 min, lasting 2–4 h when taken orally",
    "toxicity": "Fresh plant is irritant and toxic until dried",
    "toxicityLD50": "Not well established",
    "intensity": "Mild",
    "onset": "20–30 min",
    "duration": "2–4 h",
    "region": "Europe and western Asia",
    "legalStatus": "Legal but not widely sold",
    "safetyRating": "Medium due to fresh plant toxicity",
    "preparation": "Only dried aerial parts are infused as tea",
    "contraindications": "Pregnancy, open wounds, large doses",
    "sideEffects": "Nausea, stomach irritation if taken fresh",
    "drugInteractions": "May potentiate other sedatives or analgesics",
    "description": "Also called Pasque Flower; once used by herbalists for calming nerves and relieving pain.",
    "id": "anemone-pulsatilla",
    "affiliateLink": "",
    "slug": "anemone-pulsatilla",
    "tagCount": 3
  },
  {
    "name": "Argemone mexicana",
    "scientificName": "Argemone mexicana",
    "category": "Sedative / Analgesic",
    "tags": [
      "alkaloid",
      "folk medicine",
      "poppy"
    ],
    "effects": [
      "relaxation",
      "analgesia",
      "slight euphoria"
    ],
    "mechanismOfAction": "Isoquinoline alkaloids interact with opioid and dopamine receptors",
    "therapeuticUses": "Mexican and Ayurvedic traditions use it for pain, insomnia and mild narcotic effects",
    "pharmacokinetics": "Onset 20–30 min orally, lasting 3–6 h",
    "toxicity": "Seeds and latex can be hepatotoxic in high doses",
    "toxicityLD50": "Not well quantified",
    "intensity": "Moderate",
    "onset": "20–30 min",
    "duration": "3–6 h",
    "region": "Native to tropical America; naturalized worldwide",
    "legalStatus": "Legal but sometimes regulated due to toxicity",
    "safetyRating": "Low–Medium",
    "preparation": "Dried leaves or latex smoked or brewed sparingly",
    "contraindications": "Liver disorders, pregnancy, high doses",
    "sideEffects": "Headache, stomach upset, potential liver damage",
    "drugInteractions": "Avoid combining with alcohol or other depressants",
    "description": "Spiny yellow poppy whose milky latex was historically used for pain relief and sedation.",
    "id": "argemone-mexicana",
    "affiliateLink": "",
    "slug": "argemone-mexicana",
    "tagCount": 3
  },
  {
    "name": "Combretum quadrangulare",
    "scientificName": "Combretum quadrangulare",
    "category": "Stimulant",
    "tags": [
      "sakae naa",
      "southeast asia",
      "energy"
    ],
    "effects": [
      "heightened alertness",
      "subtle euphoria",
      "increased focus"
    ],
    "mechanismOfAction": "Leaves contain combretol and related alkaloids acting on adrenergic systems",
    "therapeuticUses": "Traditional stimulant and tonic in Laos and Thailand",
    "pharmacokinetics": "Onset about 30 min orally; effects up to 4–6 h",
    "toxicity": "Limited data but appears low at customary doses",
    "toxicityLD50": "Not established",
    "intensity": "Mild to Moderate",
    "onset": "30 min",
    "duration": "4–6 h",
    "region": "Laos, Cambodia, Thailand",
    "legalStatus": "Legal with little regulation",
    "safetyRating": "Medium",
    "preparation": "Leaves brewed as tea or smoked similar to kratom",
    "contraindications": "Hypertension, heart conditions",
    "sideEffects": "Jitters, insomnia if overused",
    "drugInteractions": "May potentiate other stimulants",
    "description": "Often marketed as “Sakae Naa,” this plant is used as a mild energizing substitute for kratom.",
    "id": "combretum-quadrangulare",
    "affiliateLink": "",
    "slug": "combretum-quadrangulare",
    "tagCount": 3
  },
  {
    "name": "Corydalis yanhusuo",
    "scientificName": "Corydalis yanhusuo",
    "category": "Sedative / Analgesic",
    "tags": [
      "tcm",
      "dopamine",
      "pain relief"
    ],
    "effects": [
      "analgesia",
      "relaxation",
      "subtle dreaminess"
    ],
    "mechanismOfAction": "Alkaloids such as tetrahydropalmatine act on dopamine and GABA receptors",
    "therapeuticUses": "Traditional Chinese remedy for pain and insomnia",
    "pharmacokinetics": "Onset 20–40 min orally, lasting 3–5 h",
    "toxicity": "Overuse may cause liver stress",
    "toxicityLD50": ">1 g/kg in rodents",
    "intensity": "Moderate",
    "onset": "20–40 min",
    "duration": "3–5 h",
    "region": "China and East Asia",
    "legalStatus": "Legal",
    "safetyRating": "Medium",
    "preparation": "Rhizome taken in decoctions or powdered extracts",
    "contraindications": "Pregnancy, liver disease, large doses",
    "sideEffects": "Drowsiness, dizziness",
    "drugInteractions": "May potentiate sedatives or dopaminergic drugs",
    "description": "Tubers of this Asian herb provide notable pain relief and a tranquil state when used as tea or pills.",
    "id": "corydalis-yanhusuo",
    "affiliateLink": "",
    "slug": "corydalis-yanhusuo",
    "tagCount": 3
  },
  {
    "name": "Desmanthus illinoensis",
    "scientificName": "Desmanthus illinoensis",
    "category": "Ritual / Visionary",
    "tags": [
      "american",
      "dmt",
      "root"
    ],
    "effects": [
      "visual enhancements",
      "introspection",
      "altered perception"
    ],
    "mechanismOfAction": "Root bark contains DMT; usually combined with MAOIs to be active orally",
    "therapeuticUses": "Used in underground ayahuasca analogs for spiritual exploration",
    "pharmacokinetics": "Smoked onset 2–3 min; oral with MAOI onset 20–45 min; duration up to 6 h",
    "toxicity": "Low physiological, high psychological risk",
    "toxicityLD50": "Not established",
    "intensity": "Strong",
    "onset": "2–45 min depending on route",
    "duration": "15 min – 6 h",
    "region": "Central and southern United States",
    "legalStatus": "DMT restricted in many countries",
    "safetyRating": "Medium",
    "preparation": "Root bark powdered for extraction or brewed with MAOI plant",
    "contraindications": "Mental health issues, MAOI or SSRI medication",
    "sideEffects": "Nausea, anxiety, powerful visions",
    "drugInteractions": "Dangerous with MAOIs or serotonergic drugs",
    "description": "Also called Illinois Bundleflower; its root bark contains notable amounts of DMT.",
    "id": "desmanthus-illinoensis",
    "affiliateLink": "",
    "slug": "desmanthus-illinoensis",
    "tagCount": 3
  },
  {
    "name": "Erythrina mulungu",
    "scientificName": "Erythrina mulungu",
    "category": "Sedative / Anxiolytic",
    "tags": [
      "brazil",
      "root",
      "sleep"
    ],
    "effects": [
      "deep relaxation",
      "anxiety relief",
      "sleepiness"
    ],
    "mechanismOfAction": "Erythrinan alkaloids interact with GABA receptors causing CNS depression",
    "therapeuticUses": "South American remedy for insomnia and stress",
    "pharmacokinetics": "Onset ~30 min orally; effects last 4–6 h",
    "toxicity": "Relatively safe at moderate doses",
    "toxicityLD50": "Not well documented",
    "intensity": "Moderate",
    "onset": "30 min",
    "duration": "4–6 h",
    "region": "Brazil and neighboring countries",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Bark decoction or tincture consumed before sleep",
    "contraindications": "Pregnancy, combining with strong sedatives",
    "sideEffects": "Drowsiness, lowered blood pressure",
    "drugInteractions": "May potentiate other CNS depressants",
    "description": "Flowering tree whose bark is prized in Brazilian folk medicine for calming nerves and promoting sleep.",
    "id": "erythrina-mulungu",
    "affiliateLink": "",
    "slug": "erythrina-mulungu",
    "tagCount": 3
  },
  {
    "name": "Erythrina americana",
    "scientificName": "Erythrina americana",
    "category": "Sedative / Anxiolytic",
    "tags": [
      "mexico",
      "flower",
      "sleep"
    ],
    "effects": [
      "relaxation",
      "dreaminess",
      "reduced anxiety"
    ],
    "mechanismOfAction": "Contains erythrinan alkaloids acting as GABAergic depressants",
    "therapeuticUses": "Mexican folk remedy for insomnia and nervous tension",
    "pharmacokinetics": "Onset 30–45 min orally; duration 3–5 h",
    "toxicity": "Low to moderate",
    "toxicityLD50": "Not well established",
    "intensity": "Mild to Moderate",
    "onset": "30–45 min",
    "duration": "3–5 h",
    "region": "Mexico",
    "legalStatus": "Legal",
    "safetyRating": "Medium",
    "preparation": "Flowers or bark steeped as tea",
    "contraindications": "Pregnancy, combining with CNS depressants",
    "sideEffects": "Drowsiness, dizziness",
    "drugInteractions": "May enhance effects of other sedatives",
    "description": "Known locally as Colorín; its red flowers are brewed into a soothing bedtime drink.",
    "id": "erythrina-americana",
    "affiliateLink": "",
    "slug": "erythrina-americana",
    "tagCount": 3
  },
  {
    "name": "Galbulimima belgraveana",
    "scientificName": "Galbulimima belgraveana",
    "category": "Ritual / Visionary",
    "tags": [
      "papua new guinea",
      "hallucinogen",
      "tree"
    ],
    "effects": [
      "dreamlike visions",
      "dizziness",
      "altered consciousness"
    ],
    "mechanismOfAction": "Contains himbacine-type alkaloids with muscarinic antagonist activity",
    "therapeuticUses": "Used by Papuan tribes for shamanic rituals and hunting magic",
    "pharmacokinetics": "Onset 30–60 min when consumed, lasting 4–8 h",
    "toxicity": "Reports of toxicity at high doses; data limited",
    "toxicityLD50": "Not established",
    "intensity": "Moderate to Strong",
    "onset": "30–60 min",
    "duration": "4–8 h",
    "region": "Papua New Guinea and northern Australia",
    "legalStatus": "Little formal regulation",
    "safetyRating": "Low–Medium",
    "preparation": "Bark or leaves boiled into a decoction, sometimes mixed with ginger",
    "contraindications": "Unknown; caution due to potent effects",
    "sideEffects": "Nausea, vertigo, intense dreams",
    "drugInteractions": "Avoid combining with other anticholinergics",
    "description": "Rare rainforest tree providing psychoactive bark traditionally used in New Guinea for visionary experiences.",
    "id": "galbulimima-belgraveana",
    "affiliateLink": "",
    "slug": "galbulimima-belgraveana",
    "tagCount": 3
  },
  {
    "name": "Alpinia galanga",
    "scientificName": "Alpinia galanga",
    "category": "Stimulant",
    "tags": [
      "aromatic",
      "galangal",
      "spice"
    ],
    "effects": [
      "warm stimulation",
      "mild euphoria",
      "enhanced circulation"
    ],
    "mechanismOfAction": "Contains eugenol and cineole that increase circulation and mild CNS stimulation",
    "therapeuticUses": "Used in Southeast Asian medicine for digestion and fatigue",
    "pharmacokinetics": "Onset 20–40 min, duration 2–4 h",
    "toxicity": "Generally safe as a culinary spice",
    "toxicityLD50": ">3 g/kg in rodents",
    "intensity": "Mild",
    "onset": "20–40 min",
    "duration": "2–4 h",
    "region": "Indonesia, Thailand, Malaysia",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Rhizome chewed fresh, powdered in capsules, or brewed as tea",
    "contraindications": "Gastric ulcers, anticoagulant medication",
    "sideEffects": "Heartburn or mild agitation at high doses",
    "drugInteractions": "May alter absorption of other stimulants or anticoagulants",
    "description": "A common culinary spice known as galangal that offers gentle stimulation and a warming effect.",
    "id": "alpinia-galanga",
    "affiliateLink": "",
    "slug": "alpinia-galanga",
    "tagCount": 3
  },
  {
    "name": "Leonurus sibiricus",
    "scientificName": "Leonurus sibiricus",
    "category": "Calming / Dream",
    "tags": [
      "marihuanilla",
      "mint family",
      "sedative"
    ],
    "effects": [
      "mild sedation",
      "light euphoria",
      "dream enhancement"
    ],
    "mechanismOfAction": "Contains leonurine and other alkaloids that depress CNS activity",
    "therapeuticUses": "Used in Latin American and Asian folk medicine for relaxation and spiritual rituals",
    "pharmacokinetics": "Onset 20–30 min when smoked or brewed; effects last 2–4 h",
    "toxicity": "Considered safe in moderate amounts",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "20–30 min",
    "duration": "2–4 h",
    "region": "Native to Asia, cultivated in the Americas",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Leaves smoked or steeped as tea",
    "contraindications": "None known",
    "sideEffects": "Drowsiness at high doses",
    "drugInteractions": "May enhance effects of other sedatives",
    "description": "Sometimes called Marihuanilla or Siberian motherwort, providing gentle calming effects and subtle dreaminess.",
    "id": "leonurus-sibiricus",
    "affiliateLink": "",
    "slug": "leonurus-sibiricus",
    "tagCount": 3
  },
  {
    "name": "Lagochilus inebrians",
    "scientificName": "Lagochilus inebrians",
    "category": "Sedative / Euphoric",
    "tags": [
      "central asia",
      "calming",
      "intoxicating mint"
    ],
    "effects": [
      "relaxation",
      "mild euphoria",
      "reduced anxiety"
    ],
    "mechanismOfAction": "Contains lagochilin which depresses the CNS and may interact with GABA",
    "therapeuticUses": "Folk remedy in Uzbekistan and Kazakhstan for tension and insomnia",
    "pharmacokinetics": "Onset about 30 min orally or smoked; duration 3–5 h",
    "toxicity": "Little toxicity noted at customary doses",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "~30 min",
    "duration": "3–5 h",
    "region": "Central Asia",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Leaves brewed as tea or smoked alone or with other herbs",
    "contraindications": "None documented but caution when operating machinery",
    "sideEffects": "Drowsiness",
    "drugInteractions": "Could potentiate other depressants",
    "description": "Known as intoxicating mint; produces a pleasant calm and slight euphoria when brewed.",
    "id": "lagochilus-inebrians",
    "affiliateLink": "",
    "slug": "lagochilus-inebrians",
    "tagCount": 3
  },
  {
    "name": "Nicotiana rustica",
    "scientificName": "Nicotiana rustica",
    "category": "Stimulant / Ritual",
    "tags": [
      "mapacho",
      "nicotine",
      "tobacco"
    ],
    "effects": [
      "alertness",
      "intense buzz",
      "clearing of thoughts"
    ],
    "mechanismOfAction": "High nicotine plus MAO‑inhibiting beta‑carbolines stimulate nicotinic receptors and inhibit MAO",
    "therapeuticUses": "Used by Amazonian shamans for cleansing and focus",
    "pharmacokinetics": "Smoked onset immediate, duration 30–60 min; oral snuff onset ~5 min",
    "toxicity": "High nicotine content can be poisonous in large amounts",
    "toxicityLD50": "Nicotine LD50 ~50 mg/kg (mouse)",
    "intensity": "Strong",
    "onset": "Immediate when smoked",
    "duration": "30–60 min",
    "region": "South America and worldwide cultivation",
    "legalStatus": "Legal but regulated like tobacco",
    "safetyRating": "Low–Medium",
    "preparation": "Leaves dried and smoked, snuffed, or used in liquid extracts",
    "contraindications": "Heart disease, pregnancy, hypertension",
    "sideEffects": "Nausea, increased heart rate, dizziness",
    "drugInteractions": "Strongly potentiated by MAOIs; interacts with many medications",
    "description": "Potent tobacco species used ceremonially in the Amazon, far stronger than common N. tabacum.",
    "id": "nicotiana-rustica",
    "affiliateLink": "",
    "slug": "nicotiana-rustica",
    "tagCount": 3
  },
  {
    "name": "Nymphaea lotus",
    "scientificName": "Nymphaea lotus",
    "category": "Calming / Dream",
    "tags": [
      "egyptian lotus",
      "sedative",
      "water lily"
    ],
    "effects": [
      "relaxation",
      "dream enhancement",
      "mild euphoria"
    ],
    "mechanismOfAction": "Contains aporphine alkaloids that act on dopamine and serotonin receptors",
    "therapeuticUses": "Used in ancient Egypt for sedation and ritual ceremonies",
    "pharmacokinetics": "Onset 20–30 min when brewed; duration about 2–5 h",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "20–30 min",
    "duration": "2–5 h",
    "region": "Africa and Southeast Asia",
    "legalStatus": "Generally legal",
    "safetyRating": "High",
    "preparation": "Dried flowers steeped as tea or soaked in wine",
    "contraindications": "None known but caution with sedatives",
    "sideEffects": "Drowsiness at high doses",
    "drugInteractions": "May add to effects of other sedatives",
    "description": "Also called the Egyptian white lotus, historically revered for its gentle calming and dreamlike qualities.",
    "id": "nymphaea-lotus",
    "affiliateLink": "",
    "slug": "nymphaea-lotus",
    "tagCount": 3
  },
  {
    "name": "Psychotria carthagenensis",
    "scientificName": "Psychotria carthagenensis",
    "category": "Ritual / Visionary",
    "tags": [
      "amazon",
      "dmt",
      "chaliponga"
    ],
    "effects": [
      "visual effects",
      "introspection",
      "spiritual insight"
    ],
    "mechanismOfAction": "Leaves contain N,N-dimethyltryptamine acting as a serotonin agonist; requires MAO inhibition orally",
    "therapeuticUses": "Used in ayahuasca analogues for visionary experiences",
    "pharmacokinetics": "Onset 20–45 min orally with MAOI, duration 4–6 h",
    "toxicity": "Low physiological but intense psychological effects",
    "toxicityLD50": "Not established",
    "intensity": "Strong",
    "onset": "20–45 min",
    "duration": "4–6 h",
    "region": "Amazon Basin",
    "legalStatus": "DMT restricted in many countries",
    "safetyRating": "Medium",
    "preparation": "Leaves brewed with MAOI plants to form ayahuasca-style brews",
    "contraindications": "Mental health conditions, MAOI or SSRI medication",
    "sideEffects": "Nausea, intense visions, possible anxiety",
    "drugInteractions": "Dangerous with serotonergic drugs or other MAOIs",
    "description": "Amazonian shrub also known as Chaliponga; its DMT-rich leaves are valued in shamanic ceremonies.",
    "id": "psychotria-carthagenensis",
    "affiliateLink": "",
    "slug": "psychotria-carthagenensis",
    "tagCount": 3
  },
  {
    "name": "Mucuna pruriens",
    "scientificName": "Mucuna pruriens",
    "category": "Stimulant / Nootropic",
    "tags": [
      "ayurveda",
      "dopamine",
      "velvet bean"
    ],
    "effects": [
      "increased motivation",
      "energy",
      "elevated mood"
    ],
    "mechanismOfAction": "Seeds contain L‑DOPA which increases brain dopamine levels",
    "therapeuticUses": "Used in Ayurveda for Parkinson's disease, mood disorders and vitality",
    "pharmacokinetics": "Onset around 30 min, duration 4–6 h",
    "toxicity": "Generally safe at typical doses; high doses may cause nausea",
    "toxicityLD50": ">6 g/kg in rodents",
    "intensity": "Moderate",
    "onset": "30 min",
    "duration": "4–6 h",
    "region": "Tropical Asia and Africa",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Powdered seeds or extract taken in capsules or smoothies",
    "contraindications": "Psychosis, concurrent L‑DOPA medication",
    "sideEffects": "Nausea or headache with excessive intake",
    "drugInteractions": "Avoid with MAOIs or dopamine medications",
    "description": "Also called Velvet Bean; boosts dopamine and serves as a traditional tonic in Ayurvedic practice.",
    "id": "mucuna-pruriens",
    "affiliateLink": "",
    "slug": "mucuna-pruriens",
    "tagCount": 3
  },
  {
    "name": "Paullinia yoco",
    "scientificName": "Paullinia yoco",
    "category": "Stimulant / Ritual",
    "tags": [
      "amazon",
      "caffeine",
      "vine"
    ],
    "effects": [
      "alertness",
      "energy",
      "reduced fatigue"
    ],
    "mechanismOfAction": "Bark rich in caffeine acts as an adenosine receptor antagonist",
    "therapeuticUses": "Used by indigenous Amazonian peoples for stamina on hunts",
    "pharmacokinetics": "Onset 10–20 min when brewed; duration 2–4 h",
    "toxicity": "Comparable to other caffeinated products",
    "toxicityLD50": "Caffeine LD50 ~192 mg/kg in rats",
    "intensity": "Moderate",
    "onset": "10–20 min",
    "duration": "2–4 h",
    "region": "Amazon rainforest",
    "legalStatus": "Generally legal",
    "safetyRating": "High",
    "preparation": "Bark strips boiled into a strong caffeinated drink",
    "contraindications": "Heart problems, insomnia, sensitivity to caffeine",
    "sideEffects": "Jitters, rapid heartbeat, sleeplessness",
    "drugInteractions": "Potentiates other stimulants and certain medications",
    "description": "Liana used by several Amazonian tribes; the bark yields a potent caffeinated beverage for energy.",
    "id": "paullinia-yoco",
    "affiliateLink": "",
    "slug": "paullinia-yoco",
    "tagCount": 3
  },
  {
    "name": "Tetradenia riparia",
    "scientificName": "Tetradenia riparia",
    "category": "Calming / Analgesic",
    "tags": [
      "african",
      "iboza",
      "aromatic"
    ],
    "effects": [
      "relaxation",
      "pain relief",
      "lightheadedness"
    ],
    "mechanismOfAction": "Aromatic diterpenes may modulate GABA and opioid receptors",
    "therapeuticUses": "Used in African folk medicine for headaches and anxiety",
    "pharmacokinetics": "Onset 20–30 min as tea or smoked, lasting 2–4 h",
    "toxicity": "Limited research; appears safe in small amounts",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "20–30 min",
    "duration": "2–4 h",
    "region": "Eastern and southern Africa",
    "legalStatus": "Legal",
    "safetyRating": "Medium",
    "preparation": "Leaves brewed as tea or smoked; also used as incense",
    "contraindications": "Pregnancy, caution with hypotensive drugs",
    "sideEffects": "Dizziness, low blood pressure",
    "drugInteractions": "May enhance sedatives or blood pressure medications",
    "description": "Fragrant African shrub sometimes called Iboza; provides a relaxing effect and mild pain relief.",
    "id": "tetradenia-riparia",
    "affiliateLink": "",
    "slug": "tetradenia-riparia",
    "tagCount": 3
  },
  {
    "name": "Tabernaemontana undulata",
    "scientificName": "Tabernaemontana undulata",
    "category": "Analgesic / Visionary",
    "tags": [
      "amazon",
      "uchu sanango",
      "iboga alkaloids"
    ],
    "effects": [
      "tingling sensation",
      "dream enhancement",
      "altered perception"
    ],
    "mechanismOfAction": "Contains iboga-type alkaloids affecting serotonin and NMDA receptors",
    "therapeuticUses": "Amazonian tribes use the bark for hunting preparation and pain",
    "pharmacokinetics": "Onset 15–30 min when chewed or brewed; duration 2–5 h",
    "toxicity": "High doses may be neurotoxic or cardiotoxic",
    "toxicityLD50": "Not well known",
    "intensity": "Moderate to Strong",
    "onset": "15–30 min",
    "duration": "2–5 h",
    "region": "Western Amazon",
    "legalStatus": "Mostly legal but little researched",
    "safetyRating": "Low–Medium",
    "preparation": "Bark or root pieces chewed or made into a tea",
    "contraindications": "Heart problems, pregnancy, mental illness",
    "sideEffects": "Nausea, numbness, dizziness",
    "drugInteractions": "Avoid with other serotonergic or stimulant substances",
    "description": "Also called Uchu Sanango; this rare shrub contains iboga-like compounds and is used in shamanic practices.",
    "id": "tabernaemontana-undulata",
    "affiliateLink": "",
    "slug": "tabernaemontana-undulata",
    "tagCount": 3
  },
  {
    "name": "Aquilaria malaccensis",
    "scientificName": "Aquilaria malaccensis",
    "category": "Calming / Aromatic",
    "tags": [
      "agarwood",
      "incense",
      "sedative"
    ],
    "effects": [
      "tranquil mind",
      "subtle euphoria",
      "aromatic relaxation"
    ],
    "mechanismOfAction": "Resin rich in sesquiterpenes acts via GABAergic and dopaminergic pathways when inhaled",
    "therapeuticUses": "Used in traditional Asian medicine and incense for calming and meditation",
    "pharmacokinetics": "Effects appear within minutes when smoked or heated, lasting 1–2 h",
    "toxicity": "Considered safe in incense amounts",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "Within minutes when inhaled",
    "duration": "1–2 h",
    "region": "Southeast Asia",
    "legalStatus": "Cultivation regulated due to overharvesting but use is legal",
    "safetyRating": "High",
    "preparation": "Resinous wood chips burned as incense or ground and smoked",
    "contraindications": "Respiratory issues when inhaled heavily",
    "sideEffects": "Mild headache if smoke inhaled in excess",
    "drugInteractions": "Unknown; likely minimal",
    "description": "Source of precious agarwood resin, producing a soothing aroma and subtle psychoactive calm when burned.",
    "id": "aquilaria-malaccensis",
    "affiliateLink": "",
    "slug": "aquilaria-malaccensis",
    "tagCount": 3
  },
  {
    "name": "Argyreia speciosa",
    "scientificName": "Argyreia speciosa",
    "category": "Ritual / Visionary",
    "tags": [
      "indian morning glory",
      "lsa",
      "seeds"
    ],
    "effects": [
      "closed-eye visuals",
      "euphoria",
      "enhanced introspection"
    ],
    "mechanismOfAction": "Seeds contain lysergic acid amide (LSA) acting on serotonin receptors",
    "therapeuticUses": "Occasionally used in Ayurveda as a tonic and for spiritual rituals",
    "pharmacokinetics": "Onset 1–2 h orally, duration 6–8 h",
    "toxicity": "Nausea common; large doses may be hepatotoxic",
    "toxicityLD50": "Not established",
    "intensity": "Moderate to Strong",
    "onset": "1–2 h",
    "duration": "6–8 h",
    "region": "India and Southeast Asia",
    "legalStatus": "Seeds legal though extraction of LSA may be restricted",
    "safetyRating": "Medium",
    "preparation": "Seeds ground and ingested after cold‑water extraction",
    "contraindications": "Pregnancy, mental health disorders",
    "sideEffects": "Nausea, vasoconstriction, drowsiness",
    "drugInteractions": "Avoid with other serotonergic agents",
    "description": "Close relative of Hawaiian Baby Woodrose with LSA‑containing seeds used in some Indian traditions.",
    "id": "argyreia-speciosa",
    "affiliateLink": "",
    "slug": "argyreia-speciosa",
    "tagCount": 3
  },
  {
    "name": "Zanthoxylum clava-herculis",
    "scientificName": "Zanthoxylum clava-herculis",
    "category": "Analgesic / Stimulant",
    "tags": [
      "north america",
      "tingling",
      "toothache tree"
    ],
    "effects": [
      "mouth numbness",
      "mild stimulation",
      "pain relief"
    ],
    "mechanismOfAction": "Bark contains sanshools that cause paresthesia and stimulate trigeminal nerves",
    "therapeuticUses": "Native American remedy for toothaches and sore throats; also used as a tonic",
    "pharmacokinetics": "Onset within minutes when chewed; duration 1–3 h",
    "toxicity": "Low in customary doses",
    "toxicityLD50": "Not established",
    "intensity": "Mild",
    "onset": "Within minutes",
    "duration": "1–3 h",
    "region": "Southeastern United States",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Fresh bark chewed or made into tincture",
    "contraindications": "Mouth ulcers or sensitive gums",
    "sideEffects": "Tingling, salivation, mild stomach upset",
    "drugInteractions": "May interact with other numbing agents",
    "description": "Also called the toothache tree; its bark creates a tingling numbness and light stimulation when chewed.",
    "id": "zanthoxylum-clava-herculis",
    "affiliateLink": "",
    "slug": "zanthoxylum-clava-herculis",
    "tagCount": 3
  },
  {
    "name": "Adhatoda vasica",
    "scientificName": "Justicia adhatoda",
    "category": "Stimulant / Bronchodilator",
    "tags": [
      "ayurveda",
      "respiratory",
      "vasaka"
    ],
    "effects": [
      "clear breathing",
      "mild stimulation",
      "warming"
    ],
    "mechanismOfAction": "Alkaloids such as vasicine act as bronchodilators and respiratory stimulants",
    "therapeuticUses": "Ayurvedic herb for asthma, coughs and general vitality",
    "pharmacokinetics": "Onset 30 min orally; effects last about 3–4 h",
    "toxicity": "Generally safe at therapeutic doses",
    "toxicityLD50": ">2 g/kg in rodents",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "3–4 h",
    "region": "Indian subcontinent",
    "legalStatus": "Legal",
    "safetyRating": "High",
    "preparation": "Leaves brewed as tea or taken as syrup",
    "contraindications": "Pregnancy; high doses may cause vomiting",
    "sideEffects": "Digestive upset at large doses",
    "drugInteractions": "May potentiate other bronchodilators",
    "description": "Known as Vasaka or Malabar nut, this shrub’s leaves ease breathing and offer a subtle stimulating effect.",
    "id": "adhatoda-vasica",
    "affiliateLink": "",
    "slug": "adhatoda-vasica",
    "tagCount": 3
  },
  {
    "name": "Amanita pantherina",
    "scientificName": "Amanita pantherina",
    "category": "Deliriant / Sedative",
    "tags": [
      "muscimol",
      "mushroom",
      "panther cap"
    ],
    "effects": [
      "sedation",
      "confusion",
      "dizziness"
    ],
    "mechanismOfAction": "Contains muscimol and ibotenic acid acting on GABA receptors",
    "therapeuticUses": "Traditional Siberian shamanic use; rarely employed medically",
    "sideEffects": "Nausea, loss of coordination, delirium",
    "contraindications": "Mental illness, combining with other depressants",
    "drugInteractions": "Enhances effects of alcohol and sedatives",
    "preparation": "Caps or dried material ingested carefully",
    "pharmacokinetics": "Onset 30–90 min orally; duration 6–8 h",
    "onset": "30–90 min",
    "duration": "6–8 h",
    "intensity": "Strong",
    "region": "Northern Hemisphere",
    "legalStatus": "Varies; unscheduled in many countries",
    "toxicity": "Potentially toxic at high doses",
    "toxicityLD50": "Not well established",
    "safetyRating": "Low",
    "affiliateLink": "",
    "slug": "amanita-pantherina",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Cannabis sativa",
    "scientificName": "Cannabis sativa",
    "category": "Psychedelic / Relaxant",
    "tags": [
      "cbd",
      "thc",
      "marijuana"
    ],
    "effects": [
      "euphoria",
      "relaxation",
      "altered perception"
    ],
    "mechanismOfAction": "THC acts on cannabinoid receptors CB1 and CB2",
    "therapeuticUses": "Pain relief, appetite stimulation, anxiety reduction",
    "sideEffects": "Dry mouth, short-term memory impairment, anxiety in high doses",
    "contraindications": "Psychosis, heart conditions, pregnancy",
    "drugInteractions": "May interact with CNS depressants and alcohol",
    "preparation": "Smoked, vaporized, or ingested as edibles",
    "pharmacokinetics": "Onset seconds to minutes when smoked; effects last 2–4 h",
    "onset": "Seconds–30 min",
    "duration": "2–6 h",
    "intensity": "Variable",
    "region": "Cultivated worldwide",
    "legalStatus": "Varies by jurisdiction",
    "toxicity": "Low physiological toxicity",
    "toxicityLD50": ">1 g/kg THC in animals",
    "safetyRating": "Medium",
    "affiliateLink": "",
    "slug": "cannabis-sativa",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Claviceps purpurea",
    "scientificName": "Claviceps purpurea",
    "category": "Ergolines / Toxic",
    "tags": [
      "ergot",
      "fungus",
      "vasoconstrictor"
    ],
    "effects": [
      "vasoconstriction",
      "hallucinations",
      "numbness"
    ],
    "mechanismOfAction": "Produces ergot alkaloids acting on serotonin and adrenergic receptors",
    "therapeuticUses": "Historically used to induce labor and treat migraines",
    "sideEffects": "Nausea, convulsions, gangrene in high doses",
    "contraindications": "Pregnancy, vascular disease",
    "drugInteractions": "Potentiates triptans and other vasoconstrictors",
    "preparation": "Dried sclerotia ground or extracted (not recommended)",
    "pharmacokinetics": "Onset 30–60 min; duration 6–12 h",
    "onset": "30–60 min",
    "duration": "6–12 h",
    "intensity": "Strong",
    "region": "Worldwide on cereal grains",
    "legalStatus": "Controlled in many countries",
    "toxicity": "High; risk of ergotism",
    "toxicityLD50": "~5 mg/kg lysergic acid amide (mouse)",
    "safetyRating": "Very Low",
    "affiliateLink": "",
    "slug": "claviceps-purpurea",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Coleus blumei",
    "scientificName": "Plectranthus scutellarioides",
    "category": "Psychedelic / Ornamental",
    "tags": [
      "lamiaceae",
      "painted nettle",
      "visionary"
    ],
    "effects": [
      "mild visuals",
      "color enhancement",
      "relaxation"
    ],
    "mechanismOfAction": "Unclear; may act on serotonergic pathways",
    "therapeuticUses": "Rarely used; some folk use for divination",
    "sideEffects": "Headache, nausea at high doses",
    "contraindications": "None known",
    "drugInteractions": "Unknown",
    "preparation": "Leaves chewed or brewed as tea",
    "pharmacokinetics": "Onset 20–40 min; duration 2–4 h",
    "onset": "20–40 min",
    "duration": "2–4 h",
    "intensity": "Mild",
    "region": "Tropical Asia",
    "legalStatus": "Legal",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "safetyRating": "Medium",
    "affiliateLink": "",
    "slug": "coleus-blumei",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Echinopsis pachanoi",
    "scientificName": "Echinopsis pachanoi",
    "category": "Psychedelic Cactus",
    "tags": [
      "san pedro",
      "cactus",
      "mescaline"
    ],
    "effects": [
      "visuals",
      "euphoria",
      "spiritual insight"
    ],
    "mechanismOfAction": "Contains mescaline, a 5‑HT2A agonist phenethylamine",
    "therapeuticUses": "Andean traditional medicine for divination and healing",
    "sideEffects": "Nausea, increased heart rate, anxiety",
    "contraindications": "Heart issues, mental disorders",
    "drugInteractions": "Avoid combining with stimulants or MAOIs",
    "preparation": "Fresh or dried cactus brewed or eaten",
    "pharmacokinetics": "Onset 1–2 h; duration 10–14 h",
    "onset": "1–2 h",
    "duration": "10–14 h",
    "intensity": "Strong",
    "region": "Andes, cultivated worldwide",
    "legalStatus": "Cactus legal in many areas; mescaline often controlled",
    "toxicity": "Low physiological but intense psychological effects",
    "toxicityLD50": "Not well established",
    "safetyRating": "Medium",
    "affiliateLink": "",
    "slug": "echinopsis-pachanoi",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Erythroxylum coca",
    "scientificName": "Erythroxylum coca",
    "category": "Stimulant",
    "tags": [
      "andes",
      "alkaloid",
      "coca leaf"
    ],
    "effects": [
      "alertness",
      "reduced fatigue",
      "mild euphoria"
    ],
    "mechanismOfAction": "Leaves contain cocaine acting as a dopamine and norepinephrine reuptake inhibitor",
    "therapeuticUses": "Altitude sickness relief, energy boost, appetite suppression",
    "sideEffects": "Increased heart rate, insomnia, potential dependence",
    "contraindications": "Heart disease, pregnancy, hypertension",
    "drugInteractions": "Dangerous with MAOIs or stimulants",
    "preparation": "Leaves chewed with lime or brewed as tea",
    "pharmacokinetics": "Onset within minutes when chewed; duration 1–2 h",
    "onset": "Minutes",
    "duration": "1–2 h",
    "intensity": "Moderate",
    "region": "Andean South America",
    "legalStatus": "Cultivation regulated; cocaine controlled",
    "toxicity": "Low in leaf form; purified alkaloid is addictive",
    "toxicityLD50": "~95 mg/kg (rat, cocaine)",
    "safetyRating": "Low",
    "affiliateLink": "",
    "slug": "erythroxylum-coca",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Ginkgo biloba",
    "scientificName": "Ginkgo biloba",
    "category": "Nootropic / Circulatory",
    "tags": [
      "ancient",
      "blood flow",
      "memory"
    ],
    "effects": [
      "improved cognition",
      "circulation boost",
      "alertness"
    ],
    "mechanismOfAction": "Flavone glycosides and terpenoids enhance blood flow and modulate neurotransmission",
    "therapeuticUses": "Used for memory loss, dementia, and circulatory issues",
    "sideEffects": "Headache, upset stomach, possible bleeding risk",
    "contraindications": "Bleeding disorders, anticoagulant use",
    "drugInteractions": "Potentiates blood thinners like warfarin",
    "preparation": "Leaf extracts as tablets or tea",
    "pharmacokinetics": "Onset gradual with regular dosing; effects build over weeks",
    "onset": "Weeks of regular use",
    "duration": "Chronic use required",
    "intensity": "Mild",
    "region": "China, cultivated worldwide",
    "legalStatus": "Legal",
    "toxicity": "Low",
    "toxicityLD50": ">5 g/kg in animals",
    "safetyRating": "High",
    "affiliateLink": "",
    "slug": "ginkgo-biloba",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Helichrysum odoratissimum",
    "scientificName": "Helichrysum odoratissimum",
    "category": "Calming / Ritual",
    "tags": [
      "south africa",
      "imphepho",
      "smoke"
    ],
    "effects": [
      "relaxation",
      "mild euphoria",
      "dream enhancement"
    ],
    "mechanismOfAction": "Aromatic compounds interact with GABA and serotonin systems",
    "therapeuticUses": "Used by South African healers for cleansing and ancestor communication",
    "sideEffects": "Mild headache from smoke inhalation",
    "contraindications": "Asthma or respiratory issues when smoked",
    "drugInteractions": "Unknown",
    "preparation": "Dried leaves burned as incense or smoked",
    "pharmacokinetics": "Effects felt within minutes when inhaled; last 1–2 h",
    "onset": "Within minutes",
    "duration": "1–2 h",
    "intensity": "Mild",
    "region": "Southern Africa",
    "legalStatus": "Legal",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "safetyRating": "High",
    "affiliateLink": "",
    "slug": "helichrysum-odoratissimum",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Hypericum perforatum",
    "scientificName": "Hypericum perforatum",
    "category": "Antidepressant / Nootropic",
    "tags": [
      "maoi",
      "st. john's wort",
      "mood"
    ],
    "effects": [
      "improved mood",
      "reduced anxiety",
      "light sedation"
    ],
    "mechanismOfAction": "Hyperforin and hypericin inhibit reuptake of serotonin, dopamine, and norepinephrine",
    "therapeuticUses": "Mild to moderate depression, anxiety, sleep issues",
    "sideEffects": "Photosensitivity, dry mouth, gastrointestinal upset",
    "contraindications": "Use with SSRIs, pregnancy, strong sunlight exposure",
    "drugInteractions": "Strong inducer of liver enzymes, reduces efficacy of many medications",
    "preparation": "Dried flowering tops as tea or tincture",
    "pharmacokinetics": "Onset weeks with regular use; duration ongoing",
    "onset": "Weeks",
    "duration": "Ongoing with daily use",
    "intensity": "Mild",
    "region": "Europe, naturalized elsewhere",
    "legalStatus": "Legal",
    "toxicity": "Low to moderate",
    "toxicityLD50": ">2 g/kg in rodents",
    "safetyRating": "Medium",
    "affiliateLink": "",
    "slug": "hypericum-perforatum",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Ilex vomitoria",
    "scientificName": "Ilex vomitoria",
    "category": "Stimulant / Ritual",
    "tags": [
      "north america",
      "caffeine",
      "yaupon"
    ],
    "effects": [
      "alertness",
      "mild euphoria",
      "cleansing"
    ],
    "mechanismOfAction": "Contains caffeine and theobromine acting as adenosine receptor antagonists",
    "therapeuticUses": "Native American ceremonial drink for stimulation and purification",
    "sideEffects": "Nausea in excess, insomnia",
    "contraindications": "Heart conditions, pregnancy, anxiety disorders",
    "drugInteractions": "Additive with other stimulants",
    "preparation": "Leaves roasted and brewed as black drink",
    "pharmacokinetics": "Onset 15–30 min; duration 2–4 h",
    "onset": "15–30 min",
    "duration": "2–4 h",
    "intensity": "Moderate",
    "region": "Southeastern United States",
    "legalStatus": "Legal",
    "toxicity": "Low",
    "toxicityLD50": ">1 g/kg caffeine in animals",
    "safetyRating": "Medium",
    "affiliateLink": "",
    "slug": "ilex-vomitoria",
    "tagCount": 3,
    "description": "No description available"
  },
  {
    "name": "Centella asiatica",
    "scientificName": "Centella asiatica",
    "category": "Cognitive",
    "effects": [
      "Mental clarity",
      "calm focus"
    ],
    "preparation": "Tea or capsules",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "4-6 hrs",
    "legalStatus": "Legal",
    "region": "Asia",
    "tags": [
      "✅ safe",
      "🌿 leaf",
      "🧠 cognitive"
    ],
    "mechanismOfAction": "Triterpenoids may modulate GABA and promote neurogenesis",
    "pharmacokinetics": "Oral; active compounds absorb within an hour",
    "therapeuticUses": "Memory enhancement, anxiety relief",
    "sideEffects": "Rare headache or nausea",
    "contraindications": "Pregnancy, liver issues",
    "drugInteractions": "May potentiate sedatives",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Known as gotu kola, used in Ayurvedic medicine to aid cognition.",
    "safetyRating": 1,
    "id": "centella-asiatica",
    "activeConstituents": [
      {
        "name": "asiaticoside",
        "type": "triterpenoid",
        "effect": "nootropic"
      }
    ],
    "affiliateLink": "",
    "slug": "centella-asiatica",
    "tagCount": 3
  },
  {
    "name": "Eschscholzia californica",
    "scientificName": "Eschscholzia californica",
    "category": "Dissociative / Sedative",
    "effects": [
      "Sedation",
      "mild euphoria"
    ],
    "preparation": "Tincture or smoked",
    "intensity": "Mild",
    "onset": "20 min",
    "duration": "2-4 hrs",
    "legalStatus": "Legal",
    "region": "North America",
    "tags": [
      "✅ safe",
      "🌿 flower",
      "💤 sedation"
    ],
    "mechanismOfAction": "Protopine alkaloids interact with GABA receptors",
    "pharmacokinetics": "Oral or smoked; quick onset",
    "therapeuticUses": "Anxiety and sleep support",
    "sideEffects": "Drowsiness",
    "contraindications": "Use caution with other sedatives",
    "drugInteractions": "Potentiates CNS depressants",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "California poppy with gentle relaxing properties.",
    "safetyRating": 1,
    "id": "eschscholzia-californica",
    "activeConstituents": [
      {
        "name": "protopine",
        "type": "alkaloid",
        "effect": "sedative"
      }
    ],
    "affiliateLink": "",
    "slug": "eschscholzia-californica",
    "tagCount": 3
  },
  {
    "name": "Leonotis leonurus",
    "scientificName": "Leonotis leonurus",
    "category": "Ritual / Visionary",
    "effects": [
      "Mild euphoria",
      "relaxation"
    ],
    "preparation": "Dried leaves smoked",
    "intensity": "Mild",
    "onset": "Immediate when smoked",
    "duration": "1-2 hrs",
    "legalStatus": "Legal",
    "region": "South Africa",
    "tags": [
      "✅ safe",
      "🌿 leaf",
      "🧪 alkaloid"
    ],
    "mechanismOfAction": "Leonurine may act on serotonin receptors",
    "pharmacokinetics": "Smoked; onset within minutes",
    "therapeuticUses": "Traditional relaxant and ritual smoke",
    "sideEffects": "Dizziness with heavy use",
    "contraindications": "None known",
    "drugInteractions": "Limited data",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Also called Wild Dagga, smoked for gentle euphoric effects.",
    "safetyRating": 1,
    "id": "leonotis-leonurus",
    "activeConstituents": [
      {
        "name": "leonurine",
        "type": "alkaloid",
        "effect": "relaxant"
      }
    ],
    "affiliateLink": "",
    "slug": "leonotis-leonurus",
    "tagCount": 3
  },
  {
    "name": "Uncaria tomentosa",
    "scientificName": "Uncaria tomentosa",
    "category": "Other",
    "effects": [
      "Immune modulation"
    ],
    "preparation": "Bark decoction or capsules",
    "intensity": "Mild",
    "onset": "1 hr",
    "duration": "Varies",
    "legalStatus": "Legal",
    "region": "Amazon",
    "tags": [
      "✅ safe",
      "🌿 bark",
      "🛡️ immune"
    ],
    "mechanismOfAction": "Oxindole alkaloids stimulate immune function",
    "pharmacokinetics": "Oral; absorption within an hour",
    "therapeuticUses": "Anti-inflammatory, immune support",
    "sideEffects": "Stomach upset in some",
    "contraindications": "Autoimmune conditions caution",
    "drugInteractions": "May interact with immunosuppressants",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Known as Cat's Claw, used in Peruvian medicine.",
    "safetyRating": 1,
    "id": "uncaria-tomentosa",
    "activeConstituents": [
      {
        "name": "mitraphylline",
        "type": "alkaloid",
        "effect": "immunomodulator"
      }
    ],
    "affiliateLink": "",
    "slug": "uncaria-tomentosa",
    "tagCount": 3
  },
  {
    "name": "Myristica fragrans",
    "scientificName": "Myristica fragrans",
    "category": "Ritual / Visionary",
    "effects": [
      "Deliriant states",
      "nausea"
    ],
    "preparation": "Ground seed orally",
    "intensity": "Strong",
    "onset": "2-3 hrs",
    "duration": "12 hrs or more",
    "legalStatus": "Legal",
    "region": "Indonesia",
    "tags": [
      "⚠️ caution",
      "🌿 seed",
      "🧪 phenethylamine"
    ],
    "mechanismOfAction": "Myristicin metabolizes to MMDA-like compounds",
    "pharmacokinetics": "Slow oral absorption; long duration",
    "therapeuticUses": "Rarely used therapeutically",
    "sideEffects": "Nausea, dehydration, delirium",
    "contraindications": "Pregnancy, psychiatric conditions",
    "drugInteractions": "Potential MAOI interaction",
    "toxicity": "High at large doses",
    "toxicityLD50": "Myristicin LD50 ~400 mg/kg (mouse)",
    "description": "Nutmeg seeds can be psychoactive in large amounts.",
    "safetyRating": 3,
    "id": "myristica-fragrans",
    "activeConstituents": [
      {
        "name": "myristicin",
        "type": "phenylpropene",
        "effect": "deliriant"
      }
    ],
    "affiliateLink": "",
    "slug": "myristica-fragrans",
    "tagCount": 3
  },
  {
    "name": "Pausinystalia yohimbe",
    "scientificName": "Pausinystalia yohimbe",
    "category": "Stimulant",
    "effects": [
      "Aphrodisiac",
      "stimulant"
    ],
    "preparation": "Bark extract",
    "intensity": "Moderate",
    "onset": "30 min",
    "duration": "2-4 hrs",
    "legalStatus": "Regulated in some regions",
    "region": "Africa",
    "tags": [
      "⚠️ caution",
      "🌿 bark",
      "🔥 intensity"
    ],
    "mechanismOfAction": "Yohimbine is an adrenergic receptor antagonist",
    "pharmacokinetics": "Oral; peak plasma in 45 min",
    "therapeuticUses": "Erectile dysfunction treatment",
    "sideEffects": "Anxiety, hypertension",
    "contraindications": "Heart disease, anxiety disorders",
    "drugInteractions": "MAOIs, stimulants",
    "toxicity": "Moderate",
    "toxicityLD50": "Yohimbine LD50 ~50 mg/kg (mouse)",
    "description": "Potent bark traditionally used as an aphrodisiac.",
    "safetyRating": 3,
    "id": "pausinystalia-yohimbe",
    "activeConstituents": [
      {
        "name": "yohimbine",
        "type": "alkaloid",
        "effect": "stimulant"
      }
    ],
    "affiliateLink": "",
    "slug": "pausinystalia-yohimbe",
    "tagCount": 3
  },
  {
    "name": "Eleutherococcus senticosus",
    "scientificName": "Eleutherococcus senticosus",
    "category": "Stimulant / Adaptogen",
    "effects": [
      "Energy",
      "stress resistance"
    ],
    "preparation": "Root extract",
    "intensity": "Mild",
    "onset": "1 hr",
    "duration": "6 hrs",
    "legalStatus": "Legal",
    "region": "Siberia",
    "tags": [
      "stimulant",
      "✅ safe",
      "🌿 root"
    ],
    "mechanismOfAction": "Eleutherosides modulate stress hormones",
    "pharmacokinetics": "Oral; slow onset",
    "therapeuticUses": "Enhance stamina and immune function",
    "sideEffects": "Insomnia in sensitive individuals",
    "contraindications": "Hypertension",
    "drugInteractions": "May interact with digoxin",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Also called Siberian ginseng, popular adaptogen.",
    "safetyRating": 1,
    "id": "eleutherococcus-senticosus",
    "activeConstituents": [
      {
        "name": "eleutheroside B",
        "type": "phenylpropanoid",
        "effect": "adaptogen"
      }
    ],
    "affiliateLink": "",
    "slug": "eleutherococcus-senticosus",
    "tagCount": 3
  },
  {
    "name": "Ptychopetalum olacoides",
    "scientificName": "Ptychopetalum olacoides",
    "category": "Stimulant",
    "effects": [
      "Libido boost",
      "mild stimulation"
    ],
    "preparation": "Bark tincture",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "2-3 hrs",
    "legalStatus": "Legal",
    "region": "Amazon",
    "tags": [
      "stimulant",
      "✅ safe",
      "🌿 bark"
    ],
    "mechanismOfAction": "Alkaloids may act on dopamine pathways",
    "pharmacokinetics": "Oral tincture; moderate onset",
    "therapeuticUses": "Aphrodisiac and tonic",
    "sideEffects": "Rare insomnia",
    "contraindications": "Pregnancy",
    "drugInteractions": "None known",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Known as Muira puama, used for vitality and libido.",
    "safetyRating": 1,
    "id": "ptychopetalum-olacoides",
    "activeConstituents": [
      {
        "name": "muirapuamine",
        "type": "alkaloid",
        "effect": "stimulant"
      }
    ],
    "affiliateLink": "",
    "slug": "ptychopetalum-olacoides",
    "tagCount": 3
  },
  {
    "name": "Cola nitida",
    "scientificName": "Cola nitida",
    "category": "Stimulant",
    "effects": [
      "Alertness",
      "reduced fatigue"
    ],
    "preparation": "Chewed seeds or beverages",
    "intensity": "Moderate",
    "onset": "Immediate when chewed",
    "duration": "2-3 hrs",
    "legalStatus": "Legal",
    "region": "Africa",
    "tags": [
      "stimulant",
      "✅ safe",
      "🌿 seed"
    ],
    "mechanismOfAction": "Caffeine and kolanin stimulate CNS",
    "pharmacokinetics": "Chewed; caffeine absorbed quickly",
    "therapeuticUses": "Traditional energizer",
    "sideEffects": "Insomnia, jitteriness",
    "contraindications": "Heart conditions, pregnancy",
    "drugInteractions": "Other stimulants",
    "toxicity": "Moderate",
    "toxicityLD50": "Caffeine LD50 ~192 mg/kg (rat)",
    "description": "Kola nut used in energy drinks and ceremonies.",
    "safetyRating": 2,
    "id": "cola-nitida",
    "activeConstituents": [
      {
        "name": "caffeine",
        "type": "alkaloid",
        "effect": "stimulant"
      }
    ],
    "affiliateLink": "",
    "slug": "cola-nitida",
    "tagCount": 3
  },
  {
    "name": "Gynostemma pentaphyllum",
    "scientificName": "Gynostemma pentaphyllum",
    "category": "Other",
    "effects": [
      "Adaptogenic",
      "anti-inflammatory"
    ],
    "preparation": "Tea infusion",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "2-4 hrs",
    "legalStatus": "Legal",
    "region": "China",
    "tags": [
      "✅ safe",
      "🌿 leaf"
    ],
    "mechanismOfAction": "Gypenosides modulate nitric oxide and cortisol",
    "pharmacokinetics": "Oral; moderate absorption",
    "therapeuticUses": "Stress resilience, metabolic support",
    "sideEffects": "Rare digestive upset",
    "contraindications": "None known",
    "drugInteractions": "May enhance anticoagulants",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Called Jiaogulan, reputed longevity herb.",
    "safetyRating": 1,
    "id": "gynostemma-pentaphyllum",
    "activeConstituents": [
      {
        "name": "gypenoside XL",
        "type": "saponin",
        "effect": "adaptogen"
      }
    ],
    "affiliateLink": "",
    "slug": "gynostemma-pentaphyllum",
    "tagCount": 2
  },
  {
    "name": "Silybum marianum",
    "scientificName": "Silybum marianum",
    "category": "Other",
    "effects": [
      "Liver protection"
    ],
    "preparation": "Seed extract",
    "intensity": "Mild",
    "onset": "1 hr",
    "duration": "4 hrs",
    "legalStatus": "Legal",
    "region": "Mediterranean",
    "tags": [
      "✅ safe",
      "🌿 seed"
    ],
    "mechanismOfAction": "Silymarin acts as antioxidant and hepatoprotective",
    "pharmacokinetics": "Oral; low bioavailability improved with extract",
    "therapeuticUses": "Liver detox support",
    "sideEffects": "Digestive upset",
    "contraindications": "Allergy to Asteraceae",
    "drugInteractions": "May affect drug metabolism",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Milk thistle seeds support liver function.",
    "safetyRating": 1,
    "id": "silybum-marianum",
    "activeConstituents": [
      {
        "name": "silymarin",
        "type": "flavonolignan",
        "effect": "hepatoprotective"
      }
    ],
    "affiliateLink": "",
    "slug": "silybum-marianum",
    "tagCount": 2
  },
  {
    "name": "Piper methysticum",
    "scientificName": "Piper methysticum",
    "category": "Dissociative / Sedative",
    "effects": [
      "Anxiolytic",
      "sedation"
    ],
    "preparation": "Root beverage",
    "intensity": "Moderate",
    "onset": "20 min",
    "duration": "3-6 hrs",
    "legalStatus": "Regulated in some countries",
    "region": "Pacific Islands",
    "tags": [
      "⚠️ caution",
      "🌿 root",
      "💤 sedation"
    ],
    "mechanismOfAction": "Kavalactones modulate GABA receptors",
    "pharmacokinetics": "Oral; active within 20-30 min",
    "therapeuticUses": "Anxiety relief, social relaxation",
    "sideEffects": "Drowsiness, potential hepatotoxicity",
    "contraindications": "Liver disease, heavy alcohol use",
    "drugInteractions": "Potentiates sedatives and alcohol",
    "toxicity": "Moderate",
    "toxicityLD50": "Kavain LD50 ~920 mg/kg (mouse)",
    "description": "Kava root beverage with calming properties.",
    "safetyRating": 2,
    "id": "piper-methysticum",
    "activeConstituents": [
      {
        "name": "kavain",
        "type": "lactone",
        "effect": "anxiolytic"
      }
    ],
    "affiliateLink": "",
    "slug": "piper-methysticum",
    "tagCount": 3
  },
  {
    "name": "Uncaria rhynchophylla",
    "scientificName": "Uncaria rhynchophylla",
    "category": "Dissociative / Sedative",
    "effects": [
      "Calming",
      "anticonvulsant"
    ],
    "preparation": "Hook vine decoction",
    "intensity": "Mild",
    "onset": "30 min",
    "duration": "3 hrs",
    "legalStatus": "Legal",
    "region": "China",
    "tags": [
      "✅ safe",
      "🌿 vine",
      "💤 sedation"
    ],
    "mechanismOfAction": "Rhynchophylline blocks NMDA receptors",
    "pharmacokinetics": "Oral; moderate absorption",
    "therapeuticUses": "Traditional treatment for tremors and agitation",
    "sideEffects": "Drowsiness",
    "contraindications": "None documented",
    "drugInteractions": "May potentiate sedatives",
    "toxicity": "Low",
    "toxicityLD50": "Not established",
    "description": "Known as Gou Teng in Chinese medicine.",
    "safetyRating": 1,
    "id": "uncaria-rhynchophylla",
    "activeConstituents": [
      {
        "name": "rhynchophylline",
        "type": "alkaloid",
        "effect": "calming"
      }
    ],
    "affiliateLink": "",
    "slug": "uncaria-rhynchophylla",
    "tagCount": 3
  },
  {
    "name": "Mandrake",
    "scientificName": "Mandragora officinarum",
    "category": "Ritual / Visionary",
    "effects": [
      "hallucinations",
      "sedation"
    ],
    "mechanismOfAction": "Tropane alkaloids block muscarinic acetylcholine receptors",
    "activeConstituents": [
      {
        "name": "scopolamine",
        "type": "alkaloid",
        "effect": "deliriant"
      }
    ],
    "preparation": "Dried root or wine infusion (rare due to toxicity)",
    "dosage": "0.1–0.3 g dried root",
    "onset": "20–60 min",
    "duration": "4–8 hrs",
    "safetyRating": 5,
    "toxicityLD50": "~50 mg/kg (mice, scopolamine)",
    "legalStatus": "Cultivation legal in most regions",
    "region": "Mediterranean",
    "tags": [
      "☠️ toxic",
      "🌿 root"
    ],
    "affiliateLink": "https://www.etsy.com/market/mandrake_root",
    "description": "Legendary root used in magic rituals; highly toxic.",
    "id": "mandrake",
    "therapeuticUses": "Historical anesthetic",
    "sideEffects": "Confusion, dry mouth, delirium",
    "contraindications": "Heart conditions, pregnancy",
    "drugInteractions": "Anticholinergic medications",
    "toxicity": "High",
    "pharmacokinetics": "Absorbed orally; hepatic metabolism",
    "slug": "mandrake",
    "tagCount": 2
  },
  {
    "name": "Foxglove",
    "scientificName": "Digitalis purpurea",
    "category": "Other",
    "effects": [
      "cardiac stimulation"
    ],
    "mechanismOfAction": "Cardiac glycosides inhibit Na⁺/K⁺-ATPase",
    "activeConstituents": [
      {
        "name": "digitoxin",
        "type": "glycoside",
        "effect": "cardiotonic"
      }
    ],
    "preparation": "Carefully dosed leaf extract",
    "dosage": "0.1 g dried leaf equivalent",
    "onset": "30–60 min",
    "duration": "6–12 hrs",
    "safetyRating": 5,
    "toxicityLD50": "3 mg/kg (digitoxin, oral)",
    "legalStatus": "Regulated as medicinal",
    "region": "Europe",
    "tags": [
      "☠️ toxic",
      "💊 oral"
    ],
    "affiliateLink": "",
    "description": "Source of cardiac glycosides used for heart failure; overdose is fatal.",
    "id": "foxglove",
    "therapeuticUses": "Heart failure medication",
    "sideEffects": "Arrhythmia, vision changes",
    "contraindications": "Existing heart disease without supervision",
    "drugInteractions": "Diuretics, calcium channel blockers",
    "toxicity": "Very high",
    "pharmacokinetics": "Long half-life; renal excretion",
    "slug": "foxglove",
    "tagCount": 2
  },
  {
    "name": "Jimson Weed",
    "scientificName": "Datura stramonium",
    "category": "Ritual / Visionary",
    "effects": [
      "delirium",
      "hallucinations"
    ],
    "mechanismOfAction": "Scopolamine and atropine block muscarinic receptors",
    "activeConstituents": [
      {
        "name": "atropine",
        "type": "alkaloid",
        "effect": "deliriant"
      }
    ],
    "preparation": "Seeds or leaves consumed (dangerous)",
    "dosage": "5–15 seeds",
    "onset": "30–60 min",
    "duration": "8–24 hrs",
    "safetyRating": 5,
    "toxicityLD50": "~50 mg/kg (atropine)",
    "legalStatus": "Unregulated but dangerous",
    "region": "Worldwide",
    "tags": [
      "☠️ toxic",
      "⚠️ caution"
    ],
    "affiliateLink": "",
    "description": "Common weed producing powerful delirium when misused.",
    "id": "datura-stramonium",
    "therapeuticUses": "Historically asthma treatment",
    "sideEffects": "Severe confusion, elevated heart rate",
    "contraindications": "Heart conditions, mental illness",
    "drugInteractions": "Anticholinergics, antihistamines",
    "toxicity": "Very high",
    "pharmacokinetics": "Oral absorption; hepatic metabolism",
    "slug": "jimson-weed",
    "tagCount": 2
  },
  {
    "name": "Yellow Horned Poppy",
    "scientificName": "Glaucium flavum",
    "category": "Other",
    "effects": [
      "mild euphoria",
      "sedation"
    ],
    "mechanismOfAction": "Contains glaucine, a bronchodilator acting on dopamine receptors",
    "activeConstituents": [
      {
        "name": "glaucine",
        "type": "alkaloid",
        "effect": "sedative"
      }
    ],
    "preparation": "Dried latex or seeds smoked",
    "dosage": "10–20 mg glaucine",
    "onset": "20–40 min",
    "duration": "2–4 hrs",
    "safetyRating": 3,
    "toxicityLD50": ">300 mg/kg (mice)",
    "legalStatus": "Varies",
    "region": "Mediterranean",
    "tags": [
      "🌀 visionary",
      "💊 oral"
    ],
    "affiliateLink": "",
    "description": "Coastal poppy used occasionally for its glaucine content.",
    "id": "glaucium-flavum",
    "therapeuticUses": "Cough suppressant",
    "sideEffects": "Dizziness, nausea",
    "contraindications": "Pregnancy",
    "drugInteractions": "CNS depressants",
    "toxicity": "Moderate",
    "pharmacokinetics": "Metabolized hepatically",
    "slug": "yellow-horned-poppy",
    "tagCount": 2
  },
  {
    "name": "Carolina Jessamine",
    "scientificName": "Gelsemium sempervirens",
    "category": "Other",
    "effects": [
      "relaxation",
      "sedation"
    ],
    "mechanismOfAction": "Gelsemine acts on glycine and nicotinic receptors",
    "activeConstituents": [
      {
        "name": "gelsemine",
        "type": "alkaloid",
        "effect": "sedative"
      }
    ],
    "preparation": "Low-dose tincture",
    "dosage": "5–10 drops tincture",
    "onset": "20–40 min",
    "duration": "2–3 hrs",
    "safetyRating": 4,
    "toxicityLD50": ">10 mg/kg (mice)",
    "legalStatus": "Ornamental; toxic",
    "region": "Southern USA",
    "tags": [
      "⚠️ caution"
    ],
    "affiliateLink": "",
    "description": "Fragrant vine with toxic yet calming alkaloids.",
    "id": "gelsemium-sempervirens",
    "therapeuticUses": "Folk remedy for anxiety",
    "sideEffects": "Respiratory depression in overdose",
    "contraindications": "Pregnancy, heart issues",
    "drugInteractions": "Sedatives, muscle relaxants",
    "toxicity": "High",
    "pharmacokinetics": "Unknown",
    "slug": "carolina-jessamine",
    "tagCount": 1
  },
  {
    "name": "Opium Poppy",
    "scientificName": "Papaver somniferum",
    "category": "Other",
    "effects": [
      "analgesia",
      "euphoria"
    ],
    "mechanismOfAction": "Morphine alkaloids activate mu-opioid receptors",
    "activeConstituents": [
      {
        "name": "morphine",
        "type": "alkaloid",
        "effect": "analgesic"
      }
    ],
    "preparation": "Dried latex smoked or eaten",
    "dosage": "50–200 mg opium",
    "onset": "10–30 min",
    "duration": "4–6 hrs",
    "safetyRating": 5,
    "toxicityLD50": "~150 mg/kg (morphine, rats)",
    "legalStatus": "Highly controlled",
    "region": "Worldwide",
    "tags": [
      "☠️ addictive",
      "💊 oral"
    ],
    "affiliateLink": "",
    "description": "Primary source of medicinal opiates.",
    "id": "papaver-somniferum",
    "therapeuticUses": "Pain relief",
    "sideEffects": "Respiratory depression, addiction",
    "contraindications": "Respiratory issues, pregnancy",
    "drugInteractions": "CNS depressants, alcohol",
    "toxicity": "High",
    "pharmacokinetics": "Metabolized in liver; renal excretion",
    "slug": "opium-poppy",
    "tagCount": 2
  },
  {
    "name": "Coffee",
    "scientificName": "Coffea arabica",
    "category": "Stimulant",
    "effects": [
      "alertness",
      "energy"
    ],
    "mechanismOfAction": "Caffeine blocks adenosine receptors increasing neurotransmitter release",
    "activeConstituents": [
      {
        "name": "caffeine",
        "type": "xanthine",
        "effect": "stimulant"
      }
    ],
    "preparation": "Roasted beans brewed",
    "dosage": "50–150 mg caffeine",
    "onset": "10–20 min",
    "duration": "2–4 hrs",
    "safetyRating": 2,
    "toxicityLD50": "~192 mg/kg (rats)",
    "legalStatus": "Legal",
    "region": "Worldwide",
    "tags": [
      "☕ brewable"
    ],
    "affiliateLink": "https://www.amazon.com/s?k=coffee+beans",
    "description": "Beloved beverage plant containing caffeine.",
    "id": "coffea-arabica",
    "therapeuticUses": "Fatigue reduction",
    "sideEffects": "Jitters, insomnia",
    "contraindications": "Heart arrhythmia",
    "drugInteractions": "Stimulants, MAOIs",
    "toxicity": "Low",
    "pharmacokinetics": "Rapid GI absorption; hepatic metabolism",
    "slug": "coffee",
    "tagCount": 1
  },
  {
    "name": "Asian Ginseng",
    "scientificName": "Panax ginseng",
    "category": "Empathogen / Euphoriant",
    "effects": [
      "vitality",
      "adaptogen"
    ],
    "mechanismOfAction": "Ginsenosides modulate HPA axis and nitric oxide pathways",
    "activeConstituents": [
      {
        "name": "ginsenosides",
        "type": "triterpenoid",
        "effect": "adaptogenic"
      }
    ],
    "preparation": "Root decoction or capsules",
    "dosage": "1–2 g dried root",
    "onset": "30–60 min",
    "duration": "6–8 hrs",
    "safetyRating": 2,
    "toxicityLD50": ">2000 mg/kg (rats)",
    "legalStatus": "Legal",
    "region": "Asia",
    "tags": [
      "🌿 root",
      "💊 oral"
    ],
    "affiliateLink": "https://www.amazon.com/s?k=panax+ginseng",
    "description": "Classic tonic herb for stamina and cognition.",
    "id": "panax-ginseng",
    "therapeuticUses": "Energy, immune support",
    "sideEffects": "Headache, insomnia",
    "contraindications": "Hypertension",
    "drugInteractions": "Stimulants, anticoagulants",
    "toxicity": "Low",
    "pharmacokinetics": "Slow cumulative effects with regular use",
    "slug": "asian-ginseng",
    "tagCount": 2
  },
  {
    "name": "American Ginseng",
    "scientificName": "Panax quinquefolius",
    "category": "Empathogen / Euphoriant",
    "effects": [
      "calm energy"
    ],
    "mechanismOfAction": "Similar ginsenosides modulate neurotransmitters",
    "activeConstituents": [
      {
        "name": "ginsenosides",
        "type": "triterpenoid",
        "effect": "adaptogenic"
      }
    ],
    "preparation": "Chewed root or tea",
    "dosage": "1–3 g dried root",
    "onset": "30–60 min",
    "duration": "4–6 hrs",
    "safetyRating": 2,
    "toxicityLD50": ">2000 mg/kg (rats)",
    "legalStatus": "Legal",
    "region": "North America",
    "tags": [
      "🌿 root",
      "💊 oral"
    ],
    "affiliateLink": "https://www.amazon.com/s?k=american+ginseng",
    "description": "North American species prized for restorative effects.",
    "id": "panax-quinquefolius",
    "therapeuticUses": "Energy, stress relief",
    "sideEffects": "Headache, insomnia",
    "contraindications": "Hypertension",
    "drugInteractions": "Stimulants, anticoagulants",
    "toxicity": "Low",
    "pharmacokinetics": "Similar to Panax ginseng",
    "slug": "american-ginseng",
    "tagCount": 2
  },
  {
    "name": "Kratom",
    "scientificName": "Mitragyna speciosa",
    "category": "Stimulant",
    "effects": [
      "euphoria",
      "pain relief"
    ],
    "mechanismOfAction": "Mitragynine acts on opioid receptors",
    "activeConstituents": [
      {
        "name": "mitragynine",
        "type": "indole alkaloid",
        "effect": "analgesic"
      }
    ],
    "preparation": "Dried leaf powder or tea",
    "dosage": "2–5 g leaf powder",
    "onset": "10–30 min",
    "duration": "3–6 hrs",
    "safetyRating": 3,
    "toxicityLD50": ">400 mg/kg (rats)",
    "legalStatus": "Varies by country",
    "region": "Southeast Asia",
    "tags": [
      "🌀 euphoric",
      "💊 oral"
    ],
    "affiliateLink": "https://www.ethnobotanicalshaman.shop/kratom",
    "description": "Popular herbal stimulant and analgesic.",
    "id": "mitragyna-speciosa",
    "therapeuticUses": "Pain management, energy",
    "sideEffects": "Nausea, dependence",
    "contraindications": "Opioid addiction recovery",
    "drugInteractions": "Opioids, depressants",
    "toxicity": "Moderate",
    "pharmacokinetics": "Metabolized in liver via CYP enzymes",
    "slug": "kratom",
    "tagCount": 2
  },
  {
    "name": "Peruvian Torch",
    "scientificName": "Echinopsis peruviana",
    "category": "Psychedelic",
    "effects": [
      "visions",
      "empathy"
    ],
    "mechanismOfAction": "Mescaline acts as a 5-HT2A agonist",
    "activeConstituents": [
      {
        "name": "mescaline",
        "type": "phenethylamine",
        "effect": "psychedelic"
      }
    ],
    "preparation": "Fresh or dried cactus consumed",
    "dosage": "20–30 cm fresh cactus",
    "onset": "1–2 hrs",
    "duration": "8–12 hrs",
    "safetyRating": 3,
    "toxicityLD50": ">1 g/kg (rats)",
    "legalStatus": "Cactus legal; mescaline controlled",
    "region": "Andes",
    "tags": [
      "🌀 visionary",
      "🌵 cactus"
    ],
    "affiliateLink": "",
    "description": "Cactus rich in mescaline similar to San Pedro.",
    "id": "echinopsis-peruviana",
    "therapeuticUses": "Spiritual insight",
    "sideEffects": "Nausea, dilated pupils",
    "contraindications": "Heart issues, pregnancy",
    "drugInteractions": "MAOIs, stimulants",
    "toxicity": "Low",
    "pharmacokinetics": "Slow GI absorption",
    "slug": "peruvian-torch",
    "tagCount": 2
  },
  {
    "name": "Chaliponga",
    "scientificName": "Diplopterys cabrerana",
    "category": "Ritual / Visionary",
    "effects": [
      "visions",
      "introspection"
    ],
    "mechanismOfAction": "Leaves contain DMT and 5-MeO-DMT acting on serotonin receptors",
    "activeConstituents": [
      {
        "name": "DMT",
        "type": "tryptamine",
        "effect": "visionary"
      }
    ],
    "preparation": "Leaves brewed with MAOIs",
    "dosage": "25–50 g leaves",
    "onset": "30–60 min",
    "duration": "4–6 hrs",
    "safetyRating": 4,
    "toxicityLD50": "Not established",
    "legalStatus": "DMT restricted in most regions",
    "region": "Amazon",
    "tags": [
      "⚠️ caution",
      "🧪 dmt"
    ],
    "affiliateLink": "",
    "description": "Ayahuasca admixture leaf high in tryptamines.",
    "id": "diplopterys-cabrerana",
    "therapeuticUses": "Shamanic healing",
    "sideEffects": "Nausea, intense visions",
    "contraindications": "Mental health disorders",
    "drugInteractions": "MAOIs, SSRIs",
    "toxicity": "Low physiological",
    "pharmacokinetics": "Requires MAOI for oral activity",
    "slug": "chaliponga",
    "tagCount": 2
  },
  {
    "name": "Mormon Tea",
    "scientificName": "Ephedra nevadensis",
    "category": "Stimulant",
    "effects": [
      "mild stimulation"
    ],
    "mechanismOfAction": "Contains ephedrine-like alkaloids releasing norepinephrine",
    "activeConstituents": [
      {
        "name": "ephedrine analogs",
        "type": "alkaloid",
        "effect": "stimulant"
      }
    ],
    "preparation": "Stems brewed as tea",
    "dosage": "5–10 g dried stems",
    "onset": "15–30 min",
    "duration": "1–2 hrs",
    "safetyRating": 2,
    "toxicityLD50": ">500 mg/kg (mice)",
    "legalStatus": "Legal",
    "region": "North America",
    "tags": [
      "☕ brewable"
    ],
    "affiliateLink": "",
    "description": "Mild stimulant desert shrub without strong ephedra content.",
    "id": "ephedra-nevadensis",
    "therapeuticUses": "Decongestant",
    "sideEffects": "Increased heart rate",
    "contraindications": "Hypertension",
    "drugInteractions": "Stimulants, decongestants",
    "toxicity": "Low",
    "pharmacokinetics": "Rapid onset when brewed",
    "slug": "mormon-tea",
    "tagCount": 1
  },
  {
    "name": "Coca",
    "scientificName": "Erythroxylum coca",
    "category": "Stimulant",
    "effects": [
      "euphoria",
      "energy"
    ],
    "mechanismOfAction": "Cocaine inhibits monoamine reuptake",
    "activeConstituents": [
      {
        "name": "cocaine",
        "type": "alkaloid",
        "effect": "stimulant"
      }
    ],
    "preparation": "Leaves chewed with lime or brewed",
    "dosage": "1–3 g dried leaves",
    "onset": "5–10 min",
    "duration": "30–60 min",
    "safetyRating": 4,
    "toxicityLD50": "95 mg/kg (mice)",
    "legalStatus": "Controlled in most countries",
    "region": "Andes",
    "tags": [
      "⚠️ restricted",
      "🌿 leaf"
    ],
    "affiliateLink": "",
    "description": "Traditional Andean stimulant leaf.",
    "id": "erythroxylum-coca",
    "therapeuticUses": "Altitude sickness",
    "sideEffects": "Elevated heart rate, insomnia",
    "contraindications": "Heart issues, pregnancy",
    "drugInteractions": "Stimulants, MAOIs",
    "toxicity": "High in purified form",
    "pharmacokinetics": "Rapid absorption through oral mucosa",
    "slug": "coca",
    "tagCount": 2
  },
  {
    "name": "Sanango",
    "scientificName": "Tabernaemontana sananho",
    "category": "Ritual / Visionary",
    "effects": [
      "dream enhancement",
      "mild stimulation"
    ],
    "mechanismOfAction": "Iboga-type alkaloids act on NMDA and serotonin receptors",
    "activeConstituents": [
      {
        "name": "ibogamine",
        "type": "indole alkaloid",
        "effect": "visionary"
      }
    ],
    "preparation": "Root or bark decoction",
    "dosage": "10–20 g root",
    "onset": "30–60 min",
    "duration": "4–8 hrs",
    "safetyRating": 3,
    "toxicityLD50": "Not established",
    "legalStatus": "Unregulated",
    "region": "Amazon",
    "tags": [
      "🌿 root"
    ],
    "affiliateLink": "",
    "description": "Shamanic plant sometimes added to ayahuasca.",
    "id": "tabernaemontana-sananho",
    "therapeuticUses": "Traditional spiritual healer",
    "sideEffects": "Nausea",
    "contraindications": "Heart conditions",
    "drugInteractions": "MAOIs",
    "toxicity": "Low",
    "pharmacokinetics": "Little studied",
    "slug": "sanango",
    "tagCount": 1
  },
  {
    "name": "Kieli",
    "scientificName": "Solandra maxima",
    "category": "Ritual / Visionary",
    "effects": [
      "visions",
      "disorientation"
    ],
    "mechanismOfAction": "Tropane alkaloids similar to datura",
    "activeConstituents": [
      {
        "name": "atropine",
        "type": "alkaloid",
        "effect": "deliriant"
      }
    ],
    "preparation": "Flowers brewed or smoked (hazardous)",
    "dosage": "unknown",
    "onset": "20–40 min",
    "duration": "6–12 hrs",
    "safetyRating": 5,
    "toxicityLD50": "Unknown",
    "legalStatus": "Unregulated",
    "region": "Mexico",
    "tags": [
      "☠️ toxic"
    ],
    "affiliateLink": "",
    "description": "Rarely used solanaceous vine with powerful effects.",
    "id": "solandra-maxima",
    "therapeuticUses": "Visionary rituals",
    "sideEffects": "Severe confusion, amnesia",
    "contraindications": "Pregnancy, heart issues",
    "drugInteractions": "Anticholinergics",
    "toxicity": "High",
    "pharmacokinetics": "Likely similar to datura",
    "slug": "kieli",
    "tagCount": 1
  },
  {
    "name": "Flame Lily",
    "scientificName": "Gloriosa superba",
    "category": "Other",
    "effects": [
      "intense nausea",
      "weak delirium"
    ],
    "mechanismOfAction": "Contains colchicine disrupting microtubules",
    "activeConstituents": [
      {
        "name": "colchicine",
        "type": "alkaloid",
        "effect": "cytotoxic"
      }
    ],
    "preparation": "Seeds or tubers occasionally ingested (dangerous)",
    "dosage": "<5 seeds",
    "onset": "1–3 hrs",
    "duration": "12–24 hrs",
    "safetyRating": 5,
    "toxicityLD50": "20 mg/kg (mice)",
    "legalStatus": "Ornamental; toxic",
    "region": "Africa, Asia",
    "tags": [
      "☠️ toxic"
    ],
    "affiliateLink": "",
    "description": "Highly poisonous ornamental sometimes misused.",
    "id": "gloriosa-superba",
    "therapeuticUses": "Traditional poison and medicine",
    "sideEffects": "Severe vomiting, organ failure",
    "contraindications": "Any internal use",
    "drugInteractions": "None documented",
    "toxicity": "Very high",
    "pharmacokinetics": "Rapid GI absorption",
    "slug": "flame-lily",
    "tagCount": 1
  },
  {
    "name": "Giant Reed",
    "scientificName": "Arundo donax",
    "category": "Ritual / Visionary",
    "effects": [
      "mild visions"
    ],
    "mechanismOfAction": "Root bark may contain DMT and bufotenine",
    "activeConstituents": [
      {
        "name": "DMT",
        "type": "tryptamine",
        "effect": "visionary"
      }
    ],
    "preparation": "Root bark extracted",
    "dosage": "Unknown",
    "onset": "20–60 min",
    "duration": "2–4 hrs",
    "safetyRating": 4,
    "toxicityLD50": "Not established",
    "legalStatus": "Invasive species control",
    "region": "Mediterranean, Americas",
    "tags": [
      "🌿 root bark"
    ],
    "affiliateLink": "",
    "description": "Invasive reed rumored to contain tryptamines.",
    "id": "arundo-donax",
    "therapeuticUses": "Experimental entheogen",
    "sideEffects": "Nausea",
    "contraindications": "Limited data",
    "drugInteractions": "MAOIs",
    "toxicity": "Unknown",
    "pharmacokinetics": "Poorly studied",
    "slug": "giant-reed",
    "tagCount": 1
  },
  {
    "name": "Bolivian Torch",
    "scientificName": "Echinopsis lageniformis",
    "category": "Psychedelic",
    "effects": [
      "visions",
      "clarity"
    ],
    "mechanismOfAction": "Mescaline as 5-HT2A agonist",
    "activeConstituents": [
      {
        "name": "mescaline",
        "type": "phenethylamine",
        "effect": "psychedelic"
      }
    ],
    "preparation": "Fresh or dried cactus consumed",
    "dosage": "20–40 cm fresh cactus",
    "onset": "1–2 hrs",
    "duration": "8–12 hrs",
    "safetyRating": 3,
    "toxicityLD50": ">1 g/kg (rats)",
    "legalStatus": "Cactus legal; mescaline controlled",
    "region": "Andes",
    "tags": [
      "🌵 cactus"
    ],
    "affiliateLink": "",
    "description": "Another mescaline-rich Andean cactus.",
    "id": "echinopsis-lageniformis",
    "therapeuticUses": "Visionary rituals",
    "sideEffects": "Nausea",
    "contraindications": "Heart conditions",
    "drugInteractions": "MAOIs",
    "toxicity": "Low",
    "pharmacokinetics": "Similar to other mescaline cacti",
    "slug": "bolivian-torch",
    "tagCount": 1
  },
  {
    "name": "Yarrow",
    "scientificName": "Achillea millefolium",
    "category": "Sedative / Analgesic",
    "effects": [
      "relaxation",
      "pain relief"
    ],
    "mechanismOfAction": "Sesquiterpene lactones like chamazulene reduce inflammation and may calm nerves",
    "activeConstituents": [
      {
        "name": "chamazulene",
        "type": "terpene"
      },
      {
        "name": "thujone",
        "type": "monoterpene"
      }
    ],
    "preparation": "Flowering tops brewed as tea or tincture",
    "dosage": "2-4 g dried herb",
    "onset": "30 min",
    "duration": "2-4 hrs",
    "safetyRating": 1,
    "toxicityLD50": "~1.3 g/kg (rats, extract)",
    "legalStatus": "Legal",
    "region": "Northern Hemisphere",
    "tags": [
      "🌼 flower",
      "😊 mild"
    ],
    "affiliateLink": "",
    "description": "Common meadow herb with mild soothing effects.",
    "id": "achillea-millefolium",
    "therapeuticUses": "Digestive aid, wound healing, relaxation",
    "sideEffects": "Allergic reactions in some",
    "contraindications": "Pregnancy, Asteraceae allergy",
    "drugInteractions": "May enhance sedatives",
    "toxicity": "Low",
    "pharmacokinetics": "Tea absorbed within 30 min",
    "slug": "yarrow",
    "tagCount": 2
  },
  {
    "name": "Heimia myrtifolia",
    "scientificName": "Heimia myrtifolia",
    "category": "Dissociative / Sedative",
    "effects": [
      "auditory shift",
      "relaxation"
    ],
    "mechanismOfAction": "Alkaloids like vertine may alter neurotransmission",
    "activeConstituents": [
      {
        "name": "vertine",
        "type": "alkaloid"
      }
    ],
    "preparation": "Leaves fermented as sun tea",
    "dosage": "1-2 g leaves",
    "onset": "30-45 min",
    "duration": "2-3 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not established",
    "legalStatus": "Legal",
    "region": "Mexico",
    "tags": [
      "🌀 altered sound",
      "🌿 leaf"
    ],
    "affiliateLink": "",
    "description": "Relative of Sinicuichi used similarly for mild trance",
    "id": "heimia-myrtifolia",
    "therapeuticUses": "Folk auditory enhancement",
    "sideEffects": "Dry mouth",
    "contraindications": "Pregnancy",
    "drugInteractions": "Caution with CNS depressants",
    "toxicity": "Low",
    "pharmacokinetics": "Fermented tea slowly absorbed",
    "slug": "heimia-myrtifolia",
    "tagCount": 2
  },
  {
    "name": "Kratom Hybrids",
    "scientificName": "Mitragyna speciosa hybrids",
    "category": "Stimulant / Analgesic",
    "effects": [
      "energy",
      "pain relief"
    ],
    "mechanismOfAction": "Indole alkaloids act as partial mu-opioid agonists",
    "activeConstituents": [
      {
        "name": "mitragynine",
        "type": "indole alkaloid"
      },
      {
        "name": "7-hydroxymitragynine",
        "type": "indole alkaloid"
      }
    ],
    "preparation": "Powdered leaves brewed or capsulated",
    "dosage": "2-5 g leaf",
    "onset": "15-30 min",
    "duration": "3-5 hrs",
    "safetyRating": 2,
    "toxicityLD50": ">200 mg/kg (rats, mitragynine)",
    "legalStatus": "Varies by region",
    "region": "Cultivated Southeast Asia",
    "tags": [
      "⚠️ use caution",
      "🍃 leaf"
    ],
    "affiliateLink": "",
    "description": "Selective breeding of kratom species for varied alkaloid ratios",
    "id": "kratom-hybrids",
    "therapeuticUses": "Pain relief, mood lift",
    "sideEffects": "Nausea, dependency",
    "contraindications": "Heart conditions, MAOIs",
    "drugInteractions": "Opioids and sedatives",
    "toxicity": "Moderate",
    "pharmacokinetics": "Oral powder absorbed within 30 min",
    "slug": "kratom-hybrids",
    "tagCount": 2
  },
  {
    "name": "Psychotria carthaginensis",
    "scientificName": "Psychotria carthaginensis",
    "category": "Psychedelic",
    "effects": [
      "visions",
      "euphoria"
    ],
    "mechanismOfAction": "Leaves contain DMT acting on 5-HT2A when combined with MAOI",
    "activeConstituents": [
      {
        "name": "DMT",
        "type": "tryptamine"
      }
    ],
    "preparation": "Leaves brewed with MAOI",
    "dosage": "50-100 g fresh leaves",
    "onset": "20-40 min (with MAOI)",
    "duration": "2-4 hrs",
    "safetyRating": 2,
    "toxicityLD50": "Not established",
    "legalStatus": "Often legal; DMT controlled",
    "region": "South America",
    "tags": [
      "🌿 ayahuasca",
      "🍃 leaf"
    ],
    "affiliateLink": "",
    "description": "Chacruna relative sometimes used as admixture in brews",
    "id": "psychotria-carthaginensis",
    "therapeuticUses": "Visionary states",
    "sideEffects": "Nausea with MAOI",
    "contraindications": "Mental health disorders",
    "drugInteractions": "MAOIs, SSRIs",
    "toxicity": "Low",
    "pharmacokinetics": "Oral brew with MAOI",
    "slug": "psychotria-carthaginensis",
    "tagCount": 2
  },
  {
    "name": "Salvia apiana",
    "scientificName": "Salvia apiana",
    "category": "Ritual / Aromatic",
    "effects": [
      "calm",
      "clarity"
    ],
    "mechanismOfAction": "Essential oils like cineole and thujone provide mild GABA modulation",
    "activeConstituents": [
      {
        "name": "cineole",
        "type": "terpene"
      },
      {
        "name": "thujone",
        "type": "monoterpene"
      }
    ],
    "preparation": "Leaves burned as incense or brewed",
    "dosage": "Smoke small bundle or 1 g in tea",
    "onset": "Immediate when inhaled",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not well studied",
    "legalStatus": "Legal",
    "region": "Southwestern US",
    "tags": [
      "🌿 ritual",
      "🪔 incense"
    ],
    "affiliateLink": "",
    "description": "White sage revered for cleansing ceremonies",
    "id": "salvia-apiana",
    "therapeuticUses": "Purification rites, relaxation",
    "sideEffects": "Rare allergic cough",
    "contraindications": "Pregnancy high doses",
    "drugInteractions": "None known",
    "toxicity": "Low",
    "pharmacokinetics": "Inhaled smoke acts quickly",
    "slug": "salvia-apiana",
    "tagCount": 2
  },
  {
    "name": "Polygala tenuifolia",
    "scientificName": "Polygala tenuifolia",
    "category": "Nootropic / Adaptogen",
    "effects": [
      "focus",
      "mood lift"
    ],
    "mechanismOfAction": "Tenuigenin saponins modulate neurochemistry and neurotrophic factors",
    "activeConstituents": [
      {
        "name": "tenuigenin",
        "type": "glycoside"
      }
    ],
    "preparation": "Root decoction or capsules",
    "dosage": "1-2 g root",
    "onset": "30 min",
    "duration": "4-6 hrs",
    "safetyRating": 1,
    "toxicityLD50": ">3 g/kg (rats)",
    "legalStatus": "Legal",
    "region": "East Asia",
    "tags": [
      "🧠 focus"
    ],
    "affiliateLink": "",
    "description": "Called Yuan Zhi in TCM; promotes mental clarity",
    "id": "polygala-tenuifolia",
    "therapeuticUses": "Memory, stress",
    "sideEffects": "GI upset",
    "contraindications": "Severe gastritis",
    "drugInteractions": "None known",
    "toxicity": "Low",
    "pharmacokinetics": "Oral decoction absorbed within an hour",
    "slug": "polygala-tenuifolia",
    "tagCount": 1
  },
  {
    "name": "Nicotiana tabacum",
    "scientificName": "Nicotiana tabacum",
    "category": "Stimulant",
    "effects": [
      "alertness",
      "mild euphoria"
    ],
    "mechanismOfAction": "Nicotine stimulates nicotinic acetylcholine receptors releasing dopamine",
    "activeConstituents": [
      {
        "name": "nicotine",
        "type": "alkaloid"
      }
    ],
    "preparation": "Leaves smoked or chewed",
    "dosage": "1-2 cigarettes equivalent",
    "onset": "Seconds",
    "duration": "1-2 hrs",
    "safetyRating": 2,
    "toxicityLD50": "50 mg/kg (rats)",
    "legalStatus": "Regulated",
    "region": "Worldwide",
    "tags": [
      "⚠️ addictive",
      "🚬 smoke"
    ],
    "affiliateLink": "",
    "description": "Common tobacco plant widely used recreationally",
    "id": "nicotiana-tabacum",
    "therapeuticUses": "Traditional ceremonies, appetite suppression",
    "sideEffects": "Addiction, cardiovascular strain",
    "contraindications": "Heart disease, pregnancy",
    "drugInteractions": "Additive with stimulants",
    "toxicity": "Moderate",
    "pharmacokinetics": "Inhaled nicotine reaches brain in seconds",
    "slug": "nicotiana-tabacum",
    "tagCount": 2
  },
  {
    "name": "Sida acuta",
    "scientificName": "Sida acuta",
    "category": "Stimulant / Nootropic",
    "effects": [
      "energy",
      "focus"
    ],
    "mechanismOfAction": "Contains ephedrine-like alkaloids stimulating adrenergic receptors",
    "activeConstituents": [
      {
        "name": "ephedrine-like alkaloids",
        "type": "alkaloid"
      }
    ],
    "preparation": "Leaves chewed or brewed",
    "dosage": "1-3 g dried leaf",
    "onset": "20 min",
    "duration": "3-5 hrs",
    "safetyRating": 2,
    "toxicityLD50": "Not established",
    "legalStatus": "Varies",
    "region": "Tropical regions",
    "tags": [
      "stimulant",
      "🍃 leaf"
    ],
    "affiliateLink": "",
    "description": "Weedy plant sometimes used as a mild stimulant",
    "id": "sida-acuta",
    "therapeuticUses": "Traditional fever remedy",
    "sideEffects": "Increased heart rate",
    "contraindications": "Hypertension",
    "drugInteractions": "Stimulants",
    "toxicity": "Moderate",
    "pharmacokinetics": "Oral tea",
    "slug": "sida-acuta",
    "tagCount": 2
  },
  {
    "name": "Aegle marmelos",
    "scientificName": "Aegle marmelos",
    "category": "Digestive / Mild Sedative",
    "effects": [
      "calm",
      "digestive relief"
    ],
    "mechanismOfAction": "Coumarins like marmelosin exhibit mild sedative and GI effects",
    "activeConstituents": [
      {
        "name": "marmelosin",
        "type": "coumarin"
      }
    ],
    "preparation": "Fruit pulp dried or leaves as tea",
    "dosage": "5-10 g dried fruit",
    "onset": "30 min",
    "duration": "2-4 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not established",
    "legalStatus": "Legal",
    "region": "South Asia",
    "tags": [
      "🌿 ayurveda",
      "🍈 fruit"
    ],
    "affiliateLink": "",
    "description": "Bael tree used in Ayurvedic medicine for digestion and calm",
    "id": "aegle-marmelos",
    "therapeuticUses": "Digestive tonic",
    "sideEffects": "Constipation in high amounts",
    "contraindications": "Severe GI obstruction",
    "drugInteractions": "None significant",
    "toxicity": "Low",
    "pharmacokinetics": "Oral",
    "slug": "aegle-marmelos",
    "tagCount": 2
  },
  {
    "name": "Hibiscus sabdariffa",
    "scientificName": "Hibiscus sabdariffa",
    "category": "Relaxant / Beverage",
    "effects": [
      "mild calm",
      "vitamin C"
    ],
    "mechanismOfAction": "Anthocyanins provide antioxidant and hypotensive actions",
    "activeConstituents": [
      {
        "name": "anthocyanins",
        "type": "flavonoid"
      }
    ],
    "preparation": "Dried calyces brewed as tea",
    "dosage": "2-4 g dried",
    "onset": "15 min",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": ">5 g/kg (rats)",
    "legalStatus": "Legal",
    "region": "Tropics",
    "tags": [
      "🍵 tea"
    ],
    "affiliateLink": "",
    "description": "Roselle flowers used for tart refreshing tea",
    "id": "hibiscus-sabdariffa",
    "therapeuticUses": "Cooling beverage, mild relaxation",
    "sideEffects": "Acidic on stomach",
    "contraindications": "Pregnancy large amounts",
    "drugInteractions": "May potentiate antihypertensives",
    "toxicity": "Low",
    "pharmacokinetics": "Water infusion",
    "slug": "hibiscus-sabdariffa",
    "tagCount": 1
  },
  {
    "name": "Verbena officinalis",
    "scientificName": "Verbena officinalis",
    "category": "Mild Sedative",
    "effects": [
      "relaxation",
      "digestive aid"
    ],
    "mechanismOfAction": "Iridoid glycosides like verbenalin may influence GABA",
    "activeConstituents": [
      {
        "name": "verbenalin",
        "type": "glycoside"
      }
    ],
    "preparation": "Herb infused as tea",
    "dosage": "2-3 g dried",
    "onset": "30 min",
    "duration": "1-3 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not established",
    "legalStatus": "Legal",
    "region": "Europe",
    "tags": [
      "🌿 tea"
    ],
    "affiliateLink": "",
    "description": "Common vervain valued for gentle calming",
    "id": "verbena-officinalis",
    "therapeuticUses": "Tension, digestion",
    "sideEffects": "Rare GI upset",
    "contraindications": "Pregnancy",
    "drugInteractions": "None known",
    "toxicity": "Low",
    "pharmacokinetics": "Oral infusion",
    "slug": "verbena-officinalis",
    "tagCount": 1
  },
  {
    "name": "Hyssopus officinalis",
    "scientificName": "Hyssopus officinalis",
    "category": "Stimulant / Expectorant",
    "effects": [
      "respiratory relief",
      "mild alertness"
    ],
    "mechanismOfAction": "Monoterpenes like pinocamphone stimulate circulation",
    "activeConstituents": [
      {
        "name": "pinocamphone",
        "type": "monoterpene"
      }
    ],
    "preparation": "Leaf tea or essential oil inhalation",
    "dosage": "1-2 g dried leaf",
    "onset": "20 min",
    "duration": "2-4 hrs",
    "safetyRating": 2,
    "toxicityLD50": ">1 g/kg (oil)",
    "legalStatus": "Legal",
    "region": "Mediterranean",
    "tags": [
      "⚠️ strong oil",
      "🍵 tea"
    ],
    "affiliateLink": "",
    "description": "Traditional biblical herb used for colds and rituals",
    "id": "hyssopus-officinalis",
    "therapeuticUses": "Coughs, focus",
    "sideEffects": "High doses may cause seizures",
    "contraindications": "Epilepsy, pregnancy",
    "drugInteractions": "Other stimulants",
    "toxicity": "Moderate",
    "pharmacokinetics": "Tea uptake within 30 min",
    "slug": "hyssopus-officinalis",
    "tagCount": 2
  },
  {
    "name": "Marrubium vulgare",
    "scientificName": "Marrubium vulgare",
    "category": "Expectorant / Bitter",
    "effects": [
      "digestive stimulation",
      "clear lungs"
    ],
    "mechanismOfAction": "Diterpene lactone marrubiin stimulates mucus production",
    "activeConstituents": [
      {
        "name": "marrubiin",
        "type": "diterpenoid"
      }
    ],
    "preparation": "Aerial parts brewed or candies",
    "dosage": "1-2 g dried",
    "onset": "30 min",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not established",
    "legalStatus": "Legal",
    "region": "Europe, North Africa",
    "tags": [
      "🍬 candy"
    ],
    "affiliateLink": "",
    "description": "Also known as Horehound, used in cough drops",
    "id": "marrubium-vulgare",
    "therapeuticUses": "Coughs, digestion",
    "sideEffects": "Bitter taste",
    "contraindications": "Pregnancy high doses",
    "drugInteractions": "None noted",
    "toxicity": "Low",
    "pharmacokinetics": "Oral",
    "slug": "marrubium-vulgare",
    "tagCount": 1
  },
  {
    "name": "Thymus vulgaris",
    "scientificName": "Thymus vulgaris",
    "category": "Aromatic / Antimicrobial",
    "effects": [
      "alertness",
      "respiratory relief"
    ],
    "mechanismOfAction": "Essential oil rich in thymol acts as antimicrobial and mild stimulant",
    "activeConstituents": [
      {
        "name": "thymol",
        "type": "phenolic"
      }
    ],
    "preparation": "Leaf tea or inhalation",
    "dosage": "1 g dried leaf",
    "onset": "20 min",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": "880 mg/kg (rats, thymol)",
    "legalStatus": "Legal",
    "region": "Mediterranean",
    "tags": [
      "🌿 culinary"
    ],
    "affiliateLink": "",
    "description": "Common thyme used medicinally and as spice",
    "id": "thymus-vulgaris",
    "therapeuticUses": "Coughs, focus",
    "sideEffects": "GI upset high doses",
    "contraindications": "Pregnancy large doses",
    "drugInteractions": "Anticoagulants",
    "toxicity": "Low",
    "pharmacokinetics": "Oral or inhaled",
    "slug": "thymus-vulgaris",
    "tagCount": 1
  },
  {
    "name": "Lavandula angustifolia",
    "scientificName": "Lavandula angustifolia",
    "category": "Relaxant / Aromatic",
    "effects": [
      "calm",
      "sleep aid"
    ],
    "mechanismOfAction": "Linalool and linalyl acetate modulate GABA",
    "activeConstituents": [
      {
        "name": "linalool",
        "type": "terpene"
      }
    ],
    "preparation": "Flowers infused or essential oil inhaled",
    "dosage": "1-2 g dried or few drops oil",
    "onset": "15 min",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": ">2 g/kg (rats, oil)",
    "legalStatus": "Legal",
    "region": "Mediterranean",
    "tags": [
      "🌸 aroma"
    ],
    "affiliateLink": "",
    "description": "Fragrant lavender widely used for relaxation",
    "id": "lavandula-angustifolia",
    "therapeuticUses": "Anxiety, insomnia",
    "sideEffects": "Rare skin irritation",
    "contraindications": "Pregnancy large amounts",
    "drugInteractions": "Sedatives",
    "toxicity": "Low",
    "pharmacokinetics": "Inhaled or oral",
    "slug": "lavandula-angustifolia",
    "tagCount": 1
  },
  {
    "name": "Echinacea purpurea",
    "scientificName": "Echinacea purpurea",
    "category": "Immune / Mild Stimulant",
    "effects": [
      "immune boost",
      "slight energy"
    ],
    "mechanismOfAction": "Phenolic compounds like echinacoside modulate immune response",
    "activeConstituents": [
      {
        "name": "echinacoside",
        "type": "phenolic"
      }
    ],
    "preparation": "Root or herb tea, tincture",
    "dosage": "1-2 g dried",
    "onset": "30 min",
    "duration": "1-2 hrs",
    "safetyRating": 1,
    "toxicityLD50": ">2.5 g/kg (rats)",
    "legalStatus": "Legal",
    "region": "North America",
    "tags": [
      "🌿 root"
    ],
    "affiliateLink": "",
    "description": "Purple coneflower commonly used for colds",
    "id": "echinacea-purpurea",
    "therapeuticUses": "Immune support",
    "sideEffects": "Rare allergic rash",
    "contraindications": "Autoimmune disorders",
    "drugInteractions": "Immunosuppressants",
    "toxicity": "Low",
    "pharmacokinetics": "Oral",
    "slug": "echinacea-purpurea",
    "tagCount": 1
  },
  {
    "name": "Valeriana jatamansi",
    "scientificName": "Valeriana jatamansi",
    "category": "Sedative / Anxiolytic",
    "effects": [
      "calming",
      "sleep"
    ],
    "mechanismOfAction": "Sesquiterpenes like valeranon interact with GABA",
    "activeConstituents": [
      {
        "name": "valeranon",
        "type": "sesquiterpene"
      }
    ],
    "preparation": "Root decoction or powder",
    "dosage": "1-3 g root",
    "onset": "30 min",
    "duration": "4-6 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not established",
    "legalStatus": "Legal",
    "region": "India",
    "tags": [
      "🌿 root"
    ],
    "affiliateLink": "",
    "description": "Indian valerian used similarly to V. officinalis",
    "id": "valeriana-jatamansi",
    "therapeuticUses": "Insomnia, anxiety",
    "sideEffects": "Drowsiness",
    "contraindications": "Pregnancy",
    "drugInteractions": "Sedatives",
    "toxicity": "Low",
    "pharmacokinetics": "Oral",
    "slug": "valeriana-jatamansi",
    "tagCount": 1
  },
  {
    "name": "Erythroxylum catuaba",
    "scientificName": "Erythroxylum catuaba",
    "category": "Stimulant / Aphrodisiac",
    "effects": [
      "mild euphoria",
      "libido boost"
    ],
    "mechanismOfAction": "Alkaloids like catuabine may modulate dopamine",
    "activeConstituents": [
      {
        "name": "catuabine",
        "type": "alkaloid"
      }
    ],
    "preparation": "Bark decoction",
    "dosage": "1-2 g bark",
    "onset": "30-60 min",
    "duration": "2-4 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not well documented",
    "legalStatus": "Legal",
    "region": "Brazil",
    "tags": [
      "🌳 bark"
    ],
    "affiliateLink": "",
    "description": "Amazonian tonic reputed to enhance vitality",
    "id": "erythroxylum-catuaba",
    "therapeuticUses": "Aphrodisiac, tonic",
    "sideEffects": "Restlessness",
    "contraindications": "Insomnia",
    "drugInteractions": "Stimulants",
    "toxicity": "Low",
    "pharmacokinetics": "Oral decoction",
    "slug": "erythroxylum-catuaba",
    "tagCount": 1
  },
  {
    "name": "Nymphaea rubra",
    "scientificName": "Nymphaea rubra",
    "category": "Sedative / Euphoric",
    "effects": [
      "calming",
      "dreamy state"
    ],
    "mechanismOfAction": "Alkaloids like apomorphine interact with dopamine receptors",
    "activeConstituents": [
      {
        "name": "apomorphine",
        "type": "alkaloid"
      }
    ],
    "preparation": "Petals smoked or soaked in wine",
    "dosage": "3-5 g petals",
    "onset": "30 min",
    "duration": "3-4 hrs",
    "safetyRating": 1,
    "toxicityLD50": "Not well studied",
    "legalStatus": "Varies",
    "region": "South Asia",
    "tags": [
      "🌸 flower"
    ],
    "affiliateLink": "",
    "description": "Red lotus used similarly to blue lotus for relaxation",
    "id": "nymphaea-rubra",
    "therapeuticUses": "Mild euphoria, aphrodisiac",
    "sideEffects": "Drowsiness",
    "contraindications": "Pregnancy",
    "drugInteractions": "Sedatives",
    "toxicity": "Low",
    "pharmacokinetics": "Oral or smoked",
    "slug": "nymphaea-rubra",
    "tagCount": 1
  },
  {
    "name": "Gymnema sylvestre",
    "scientificName": "Gymnema sylvestre",
    "category": "Metabolic / Nootropic",
    "effects": [
      "reduced sweet taste",
      "focus"
    ],
    "mechanismOfAction": "Gymnemic acids block sweet receptors and modulate glucose absorption",
    "activeConstituents": [
      {
        "name": "gymnemic acids",
        "type": "triterpenoid"
      }
    ],
    "preparation": "Leaves chewed or extracted",
    "dosage": "0.5-1 g leaf",
    "onset": "15 min",
    "duration": "2-4 hrs",
    "safetyRating": 1,
    "toxicityLD50": ">3 g/kg (rats)",
    "legalStatus": "Legal",
    "region": "India",
    "tags": [
      "🍃 leaf"
    ],
    "affiliateLink": "",
    "description": "Ayurvedic herb that dulls sugar perception",
    "id": "gymnema-sylvestre",
    "therapeuticUses": "Diabetes support, appetite",
    "sideEffects": "Temporary loss of sweet taste",
    "contraindications": "Hypoglycemia",
    "drugInteractions": "Antidiabetic drugs",
    "toxicity": "Low",
    "pharmacokinetics": "Chewed or tea",
    "slug": "gymnema-sylvestre",
    "tagCount": 1
  }
]`,Du=Mu.replace(/NaN/g,"null"),Eu=JSON.parse(Du),Ru=["affiliateLink","activeConstituents","mechanismOfAction","legalStatus"];function Fu(i){return i.filter(e=>!Ru.some(t=>{const r=e[t];return r==null||(Array.isArray(r)?r.length===0:r==="")}))}const Pc=["name","category","effects","tags","mechanismOfAction","legalStatus"];function Uu(){const[i,e]=oc.useState(Pc),t=oc.useMemo(()=>Fu(Eu),[]),r=d=>{e(h=>h.includes(d)?h.filter(m=>m!==d):[...h,d])},c=()=>{const d=[i.join(",")];t.forEach(v=>{const b=i.map(x=>{const p=v[x];return`"${Array.isArray(p)?p.join(" | "):p??""}"`});d.push(b.join(","))});const h=d.join(`
`),m=new Blob([h],{type:"text/csv;charset=utf-8"});sc.saveAs(m,`herbs-${Date.now()}.csv`)},o=()=>{const d=new Blob([JSON.stringify(t,null,2)],{type:"application/json"});sc.saveAs(d,`herbs-${Date.now()}.json`)},l=()=>{const d=new Hn;let h=10;d.setFontSize(12),t.forEach((m,v)=>{v&&v%2===0&&(d.addPage(),h=10),d.text(`Name: ${m.name}`,10,h),d.text(`Category: ${m.category}`,10,h+6),d.text(`Effects: ${(m.effects||[]).join(", ")}`,10,h+12),d.text(`Tags: ${(m.tags||[]).join(", ")}`,10,h+18),h+=40}),d.save(`herbs-${Date.now()}.pdf`)};return Ze.jsxs("div",{className:"min-h-screen px-4 pt-20",children:[Ze.jsxs(El,{children:[Ze.jsx("title",{children:"Downloads - The Hippie Scientist"}),Ze.jsx("meta",{name:"description",content:"Download the herb database in multiple formats."})]}),Ze.jsxs("div",{className:"mx-auto max-w-3xl space-y-6",children:[Ze.jsx("h1",{className:"text-gradient mb-4 text-center text-5xl font-bold",children:"Export Herb Data"}),Ze.jsxs("p",{className:"text-center text-sand",children:[t.length," herbs · Exported ",new Date().toLocaleString()]}),Ze.jsxs("div",{className:"flex flex-wrap justify-center gap-4",children:[Ze.jsx("button",{onClick:c,className:"rounded-md bg-psychedelic-purple px-4 py-2 font-medium text-white hover:bg-psychedelic-pink",children:"Download CSV"}),Ze.jsx("button",{onClick:o,className:"rounded-md bg-cosmic-forest px-4 py-2 font-medium text-white hover:bg-emerald-700",children:"Download JSON"}),Ze.jsx("button",{onClick:l,className:"rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700",children:"Download PDF"})]}),Ze.jsxs("div",{className:"mt-6 space-y-2",children:[Ze.jsx("p",{className:"text-sand",children:"Select fields for CSV:"}),Ze.jsx("div",{className:"flex flex-wrap gap-2",children:Pc.map(d=>Ze.jsxs("label",{className:"flex items-center gap-1 text-sand",children:[Ze.jsx("input",{type:"checkbox",checked:i.includes(d),onChange:()=>r(d)}),d]},d))})]})]})]})}const Tu=Object.freeze(Object.defineProperty({__proto__:null,default:Uu},Symbol.toStringTag,{value:"Module"}));export{Tu as D,fe as _};

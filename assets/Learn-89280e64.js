import{j as B,m as Ye,g as $e,o as Rt,R as ze,A as Tr,W as Pr}from"./main-d8dcffa7.js";const Lr=({children:e,className:n})=>B.jsxs(Ye.section,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},className:`relative my-12 overflow-hidden rounded-xl border border-gray-300 bg-white/60 p-6 shadow-glow backdrop-blur-lg dark:border-bark dark:bg-bark/60 ${n??""}`,children:[B.jsx("div",{className:"absolute inset-x-0 top-0 h-px animate-pulse bg-gradient-to-r from-transparent via-lichen/30 to-transparent"}),e,B.jsx("div",{className:"absolute inset-x-0 bottom-0 h-px animate-pulse bg-gradient-to-r from-transparent via-comet/30 to-transparent"})]}),Mr=Lr;function Dr(e,n){const t=n||{};return(e[e.length-1]===""?[...e,""]:e).join((t.padRight?" ":"")+","+(t.padLeft===!1?"":" ")).trim()}const zr=/^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,Br=/^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,Nr={};function qn(e,n){return((n||Nr).jsx?Br:zr).test(e)}const Rr=/[ \t\n\f\r]/g;function Or(e){return typeof e=="object"?e.type==="text"?Gn(e.value):!1:Gn(e)}function Gn(e){return e.replace(Rr,"")===""}class He{constructor(n,t,r){this.normal=t,this.property=n,r&&(this.space=r)}}He.prototype.normal={};He.prototype.property={};He.prototype.space=void 0;function Ot(e,n){const t={},r={};for(const i of e)Object.assign(t,i.property),Object.assign(r,i.normal);return new He(t,r,n)}function dn(e){return e.toLowerCase()}class Z{constructor(n,t){this.attribute=t,this.property=n}}Z.prototype.attribute="";Z.prototype.booleanish=!1;Z.prototype.boolean=!1;Z.prototype.commaOrSpaceSeparated=!1;Z.prototype.commaSeparated=!1;Z.prototype.defined=!1;Z.prototype.mustUseProperty=!1;Z.prototype.number=!1;Z.prototype.overloadedBoolean=!1;Z.prototype.property="";Z.prototype.spaceSeparated=!1;Z.prototype.space=void 0;let Fr=0;const P=ke(),G=ke(),mn=ke(),b=ke(),F=ke(),Ae=ke(),ne=ke();function ke(){return 2**++Fr}const gn=Object.freeze(Object.defineProperty({__proto__:null,boolean:P,booleanish:G,commaOrSpaceSeparated:ne,commaSeparated:Ae,number:b,overloadedBoolean:mn,spaceSeparated:F},Symbol.toStringTag,{value:"Module"})),tn=Object.keys(gn);class En extends Z{constructor(n,t,r,i){let a=-1;if(super(n,t),Kn(this,"space",i),typeof r=="number")for(;++a<tn.length;){const o=tn[a];Kn(this,tn[a],(r&gn[o])===gn[o])}}}En.prototype.defined=!0;function Kn(e,n,t){t&&(e[n]=t)}function Te(e){const n={},t={};for(const[r,i]of Object.entries(e.properties)){const a=new En(r,e.transform(e.attributes||{},r),i,e.space);e.mustUseProperty&&e.mustUseProperty.includes(r)&&(a.mustUseProperty=!0),n[r]=a,t[dn(r)]=r,t[dn(a.attribute)]=r}return new He(n,t,e.space)}const Ft=Te({properties:{ariaActiveDescendant:null,ariaAtomic:G,ariaAutoComplete:null,ariaBusy:G,ariaChecked:G,ariaColCount:b,ariaColIndex:b,ariaColSpan:b,ariaControls:F,ariaCurrent:null,ariaDescribedBy:F,ariaDetails:null,ariaDisabled:G,ariaDropEffect:F,ariaErrorMessage:null,ariaExpanded:G,ariaFlowTo:F,ariaGrabbed:G,ariaHasPopup:null,ariaHidden:G,ariaInvalid:null,ariaKeyShortcuts:null,ariaLabel:null,ariaLabelledBy:F,ariaLevel:b,ariaLive:null,ariaModal:G,ariaMultiLine:G,ariaMultiSelectable:G,ariaOrientation:null,ariaOwns:F,ariaPlaceholder:null,ariaPosInSet:b,ariaPressed:G,ariaReadOnly:G,ariaRelevant:null,ariaRequired:G,ariaRoleDescription:F,ariaRowCount:b,ariaRowIndex:b,ariaRowSpan:b,ariaSelected:G,ariaSetSize:b,ariaSort:null,ariaValueMax:b,ariaValueMin:b,ariaValueNow:b,ariaValueText:null,role:null},transform(e,n){return n==="role"?n:"aria-"+n.slice(4).toLowerCase()}});function _t(e,n){return n in e?e[n]:n}function Ht(e,n){return _t(e,n.toLowerCase())}const _r=Te({attributes:{acceptcharset:"accept-charset",classname:"class",htmlfor:"for",httpequiv:"http-equiv"},mustUseProperty:["checked","multiple","muted","selected"],properties:{abbr:null,accept:Ae,acceptCharset:F,accessKey:F,action:null,allow:null,allowFullScreen:P,allowPaymentRequest:P,allowUserMedia:P,alt:null,as:null,async:P,autoCapitalize:null,autoComplete:F,autoFocus:P,autoPlay:P,blocking:F,capture:null,charSet:null,checked:P,cite:null,className:F,cols:b,colSpan:null,content:null,contentEditable:G,controls:P,controlsList:F,coords:b|Ae,crossOrigin:null,data:null,dateTime:null,decoding:null,default:P,defer:P,dir:null,dirName:null,disabled:P,download:mn,draggable:G,encType:null,enterKeyHint:null,fetchPriority:null,form:null,formAction:null,formEncType:null,formMethod:null,formNoValidate:P,formTarget:null,headers:F,height:b,hidden:mn,high:b,href:null,hrefLang:null,htmlFor:F,httpEquiv:F,id:null,imageSizes:null,imageSrcSet:null,inert:P,inputMode:null,integrity:null,is:null,isMap:P,itemId:null,itemProp:F,itemRef:F,itemScope:P,itemType:F,kind:null,label:null,lang:null,language:null,list:null,loading:null,loop:P,low:b,manifest:null,max:null,maxLength:b,media:null,method:null,min:null,minLength:b,multiple:P,muted:P,name:null,nonce:null,noModule:P,noValidate:P,onAbort:null,onAfterPrint:null,onAuxClick:null,onBeforeMatch:null,onBeforePrint:null,onBeforeToggle:null,onBeforeUnload:null,onBlur:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onContextLost:null,onContextMenu:null,onContextRestored:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnded:null,onError:null,onFocus:null,onFormData:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLanguageChange:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadEnd:null,onLoadStart:null,onMessage:null,onMessageError:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRejectionHandled:null,onReset:null,onResize:null,onScroll:null,onScrollEnd:null,onSecurityPolicyViolation:null,onSeeked:null,onSeeking:null,onSelect:null,onSlotChange:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnhandledRejection:null,onUnload:null,onVolumeChange:null,onWaiting:null,onWheel:null,open:P,optimum:b,pattern:null,ping:F,placeholder:null,playsInline:P,popover:null,popoverTarget:null,popoverTargetAction:null,poster:null,preload:null,readOnly:P,referrerPolicy:null,rel:F,required:P,reversed:P,rows:b,rowSpan:b,sandbox:F,scope:null,scoped:P,seamless:P,selected:P,shadowRootClonable:P,shadowRootDelegatesFocus:P,shadowRootMode:null,shape:null,size:b,sizes:null,slot:null,span:b,spellCheck:G,src:null,srcDoc:null,srcLang:null,srcSet:null,start:b,step:null,style:null,tabIndex:b,target:null,title:null,translate:null,type:null,typeMustMatch:P,useMap:null,value:G,width:b,wrap:null,writingSuggestions:null,align:null,aLink:null,archive:F,axis:null,background:null,bgColor:null,border:b,borderColor:null,bottomMargin:b,cellPadding:null,cellSpacing:null,char:null,charOff:null,classId:null,clear:null,code:null,codeBase:null,codeType:null,color:null,compact:P,declare:P,event:null,face:null,frame:null,frameBorder:null,hSpace:b,leftMargin:b,link:null,longDesc:null,lowSrc:null,marginHeight:b,marginWidth:b,noResize:P,noHref:P,noShade:P,noWrap:P,object:null,profile:null,prompt:null,rev:null,rightMargin:b,rules:null,scheme:null,scrolling:G,standby:null,summary:null,text:null,topMargin:b,valueType:null,version:null,vAlign:null,vLink:null,vSpace:b,allowTransparency:null,autoCorrect:null,autoSave:null,disablePictureInPicture:P,disableRemotePlayback:P,prefix:null,property:null,results:b,security:null,unselectable:null},space:"html",transform:Ht}),Hr=Te({attributes:{accentHeight:"accent-height",alignmentBaseline:"alignment-baseline",arabicForm:"arabic-form",baselineShift:"baseline-shift",capHeight:"cap-height",className:"class",clipPath:"clip-path",clipRule:"clip-rule",colorInterpolation:"color-interpolation",colorInterpolationFilters:"color-interpolation-filters",colorProfile:"color-profile",colorRendering:"color-rendering",crossOrigin:"crossorigin",dataType:"datatype",dominantBaseline:"dominant-baseline",enableBackground:"enable-background",fillOpacity:"fill-opacity",fillRule:"fill-rule",floodColor:"flood-color",floodOpacity:"flood-opacity",fontFamily:"font-family",fontSize:"font-size",fontSizeAdjust:"font-size-adjust",fontStretch:"font-stretch",fontStyle:"font-style",fontVariant:"font-variant",fontWeight:"font-weight",glyphName:"glyph-name",glyphOrientationHorizontal:"glyph-orientation-horizontal",glyphOrientationVertical:"glyph-orientation-vertical",hrefLang:"hreflang",horizAdvX:"horiz-adv-x",horizOriginX:"horiz-origin-x",horizOriginY:"horiz-origin-y",imageRendering:"image-rendering",letterSpacing:"letter-spacing",lightingColor:"lighting-color",markerEnd:"marker-end",markerMid:"marker-mid",markerStart:"marker-start",navDown:"nav-down",navDownLeft:"nav-down-left",navDownRight:"nav-down-right",navLeft:"nav-left",navNext:"nav-next",navPrev:"nav-prev",navRight:"nav-right",navUp:"nav-up",navUpLeft:"nav-up-left",navUpRight:"nav-up-right",onAbort:"onabort",onActivate:"onactivate",onAfterPrint:"onafterprint",onBeforePrint:"onbeforeprint",onBegin:"onbegin",onCancel:"oncancel",onCanPlay:"oncanplay",onCanPlayThrough:"oncanplaythrough",onChange:"onchange",onClick:"onclick",onClose:"onclose",onCopy:"oncopy",onCueChange:"oncuechange",onCut:"oncut",onDblClick:"ondblclick",onDrag:"ondrag",onDragEnd:"ondragend",onDragEnter:"ondragenter",onDragExit:"ondragexit",onDragLeave:"ondragleave",onDragOver:"ondragover",onDragStart:"ondragstart",onDrop:"ondrop",onDurationChange:"ondurationchange",onEmptied:"onemptied",onEnd:"onend",onEnded:"onended",onError:"onerror",onFocus:"onfocus",onFocusIn:"onfocusin",onFocusOut:"onfocusout",onHashChange:"onhashchange",onInput:"oninput",onInvalid:"oninvalid",onKeyDown:"onkeydown",onKeyPress:"onkeypress",onKeyUp:"onkeyup",onLoad:"onload",onLoadedData:"onloadeddata",onLoadedMetadata:"onloadedmetadata",onLoadStart:"onloadstart",onMessage:"onmessage",onMouseDown:"onmousedown",onMouseEnter:"onmouseenter",onMouseLeave:"onmouseleave",onMouseMove:"onmousemove",onMouseOut:"onmouseout",onMouseOver:"onmouseover",onMouseUp:"onmouseup",onMouseWheel:"onmousewheel",onOffline:"onoffline",onOnline:"ononline",onPageHide:"onpagehide",onPageShow:"onpageshow",onPaste:"onpaste",onPause:"onpause",onPlay:"onplay",onPlaying:"onplaying",onPopState:"onpopstate",onProgress:"onprogress",onRateChange:"onratechange",onRepeat:"onrepeat",onReset:"onreset",onResize:"onresize",onScroll:"onscroll",onSeeked:"onseeked",onSeeking:"onseeking",onSelect:"onselect",onShow:"onshow",onStalled:"onstalled",onStorage:"onstorage",onSubmit:"onsubmit",onSuspend:"onsuspend",onTimeUpdate:"ontimeupdate",onToggle:"ontoggle",onUnload:"onunload",onVolumeChange:"onvolumechange",onWaiting:"onwaiting",onZoom:"onzoom",overlinePosition:"overline-position",overlineThickness:"overline-thickness",paintOrder:"paint-order",panose1:"panose-1",pointerEvents:"pointer-events",referrerPolicy:"referrerpolicy",renderingIntent:"rendering-intent",shapeRendering:"shape-rendering",stopColor:"stop-color",stopOpacity:"stop-opacity",strikethroughPosition:"strikethrough-position",strikethroughThickness:"strikethrough-thickness",strokeDashArray:"stroke-dasharray",strokeDashOffset:"stroke-dashoffset",strokeLineCap:"stroke-linecap",strokeLineJoin:"stroke-linejoin",strokeMiterLimit:"stroke-miterlimit",strokeOpacity:"stroke-opacity",strokeWidth:"stroke-width",tabIndex:"tabindex",textAnchor:"text-anchor",textDecoration:"text-decoration",textRendering:"text-rendering",transformOrigin:"transform-origin",typeOf:"typeof",underlinePosition:"underline-position",underlineThickness:"underline-thickness",unicodeBidi:"unicode-bidi",unicodeRange:"unicode-range",unitsPerEm:"units-per-em",vAlphabetic:"v-alphabetic",vHanging:"v-hanging",vIdeographic:"v-ideographic",vMathematical:"v-mathematical",vectorEffect:"vector-effect",vertAdvY:"vert-adv-y",vertOriginX:"vert-origin-x",vertOriginY:"vert-origin-y",wordSpacing:"word-spacing",writingMode:"writing-mode",xHeight:"x-height",playbackOrder:"playbackorder",timelineBegin:"timelinebegin"},properties:{about:ne,accentHeight:b,accumulate:null,additive:null,alignmentBaseline:null,alphabetic:b,amplitude:b,arabicForm:null,ascent:b,attributeName:null,attributeType:null,azimuth:b,bandwidth:null,baselineShift:null,baseFrequency:null,baseProfile:null,bbox:null,begin:null,bias:b,by:null,calcMode:null,capHeight:b,className:F,clip:null,clipPath:null,clipPathUnits:null,clipRule:null,color:null,colorInterpolation:null,colorInterpolationFilters:null,colorProfile:null,colorRendering:null,content:null,contentScriptType:null,contentStyleType:null,crossOrigin:null,cursor:null,cx:null,cy:null,d:null,dataType:null,defaultAction:null,descent:b,diffuseConstant:b,direction:null,display:null,dur:null,divisor:b,dominantBaseline:null,download:P,dx:null,dy:null,edgeMode:null,editable:null,elevation:b,enableBackground:null,end:null,event:null,exponent:b,externalResourcesRequired:null,fill:null,fillOpacity:b,fillRule:null,filter:null,filterRes:null,filterUnits:null,floodColor:null,floodOpacity:null,focusable:null,focusHighlight:null,fontFamily:null,fontSize:null,fontSizeAdjust:null,fontStretch:null,fontStyle:null,fontVariant:null,fontWeight:null,format:null,fr:null,from:null,fx:null,fy:null,g1:Ae,g2:Ae,glyphName:Ae,glyphOrientationHorizontal:null,glyphOrientationVertical:null,glyphRef:null,gradientTransform:null,gradientUnits:null,handler:null,hanging:b,hatchContentUnits:null,hatchUnits:null,height:null,href:null,hrefLang:null,horizAdvX:b,horizOriginX:b,horizOriginY:b,id:null,ideographic:b,imageRendering:null,initialVisibility:null,in:null,in2:null,intercept:b,k:b,k1:b,k2:b,k3:b,k4:b,kernelMatrix:ne,kernelUnitLength:null,keyPoints:null,keySplines:null,keyTimes:null,kerning:null,lang:null,lengthAdjust:null,letterSpacing:null,lightingColor:null,limitingConeAngle:b,local:null,markerEnd:null,markerMid:null,markerStart:null,markerHeight:null,markerUnits:null,markerWidth:null,mask:null,maskContentUnits:null,maskUnits:null,mathematical:null,max:null,media:null,mediaCharacterEncoding:null,mediaContentEncodings:null,mediaSize:b,mediaTime:null,method:null,min:null,mode:null,name:null,navDown:null,navDownLeft:null,navDownRight:null,navLeft:null,navNext:null,navPrev:null,navRight:null,navUp:null,navUpLeft:null,navUpRight:null,numOctaves:null,observer:null,offset:null,onAbort:null,onActivate:null,onAfterPrint:null,onBeforePrint:null,onBegin:null,onCancel:null,onCanPlay:null,onCanPlayThrough:null,onChange:null,onClick:null,onClose:null,onCopy:null,onCueChange:null,onCut:null,onDblClick:null,onDrag:null,onDragEnd:null,onDragEnter:null,onDragExit:null,onDragLeave:null,onDragOver:null,onDragStart:null,onDrop:null,onDurationChange:null,onEmptied:null,onEnd:null,onEnded:null,onError:null,onFocus:null,onFocusIn:null,onFocusOut:null,onHashChange:null,onInput:null,onInvalid:null,onKeyDown:null,onKeyPress:null,onKeyUp:null,onLoad:null,onLoadedData:null,onLoadedMetadata:null,onLoadStart:null,onMessage:null,onMouseDown:null,onMouseEnter:null,onMouseLeave:null,onMouseMove:null,onMouseOut:null,onMouseOver:null,onMouseUp:null,onMouseWheel:null,onOffline:null,onOnline:null,onPageHide:null,onPageShow:null,onPaste:null,onPause:null,onPlay:null,onPlaying:null,onPopState:null,onProgress:null,onRateChange:null,onRepeat:null,onReset:null,onResize:null,onScroll:null,onSeeked:null,onSeeking:null,onSelect:null,onShow:null,onStalled:null,onStorage:null,onSubmit:null,onSuspend:null,onTimeUpdate:null,onToggle:null,onUnload:null,onVolumeChange:null,onWaiting:null,onZoom:null,opacity:null,operator:null,order:null,orient:null,orientation:null,origin:null,overflow:null,overlay:null,overlinePosition:b,overlineThickness:b,paintOrder:null,panose1:null,path:null,pathLength:b,patternContentUnits:null,patternTransform:null,patternUnits:null,phase:null,ping:F,pitch:null,playbackOrder:null,pointerEvents:null,points:null,pointsAtX:b,pointsAtY:b,pointsAtZ:b,preserveAlpha:null,preserveAspectRatio:null,primitiveUnits:null,propagate:null,property:ne,r:null,radius:null,referrerPolicy:null,refX:null,refY:null,rel:ne,rev:ne,renderingIntent:null,repeatCount:null,repeatDur:null,requiredExtensions:ne,requiredFeatures:ne,requiredFonts:ne,requiredFormats:ne,resource:null,restart:null,result:null,rotate:null,rx:null,ry:null,scale:null,seed:null,shapeRendering:null,side:null,slope:null,snapshotTime:null,specularConstant:b,specularExponent:b,spreadMethod:null,spacing:null,startOffset:null,stdDeviation:null,stemh:null,stemv:null,stitchTiles:null,stopColor:null,stopOpacity:null,strikethroughPosition:b,strikethroughThickness:b,string:null,stroke:null,strokeDashArray:ne,strokeDashOffset:null,strokeLineCap:null,strokeLineJoin:null,strokeMiterLimit:b,strokeOpacity:b,strokeWidth:null,style:null,surfaceScale:b,syncBehavior:null,syncBehaviorDefault:null,syncMaster:null,syncTolerance:null,syncToleranceDefault:null,systemLanguage:ne,tabIndex:b,tableValues:null,target:null,targetX:b,targetY:b,textAnchor:null,textDecoration:null,textRendering:null,textLength:null,timelineBegin:null,title:null,transformBehavior:null,type:null,typeOf:ne,to:null,transform:null,transformOrigin:null,u1:null,u2:null,underlinePosition:b,underlineThickness:b,unicode:null,unicodeBidi:null,unicodeRange:null,unitsPerEm:b,values:null,vAlphabetic:b,vMathematical:b,vectorEffect:null,vHanging:b,vIdeographic:b,version:null,vertAdvY:b,vertOriginX:b,vertOriginY:b,viewBox:null,viewTarget:null,visibility:null,width:null,widths:null,wordSpacing:null,writingMode:null,x:null,x1:null,x2:null,xChannelSelector:null,xHeight:b,y:null,y1:null,y2:null,yChannelSelector:null,z:null,zoomAndPan:null},space:"svg",transform:_t}),jt=Te({properties:{xLinkActuate:null,xLinkArcRole:null,xLinkHref:null,xLinkRole:null,xLinkShow:null,xLinkTitle:null,xLinkType:null},space:"xlink",transform(e,n){return"xlink:"+n.slice(5).toLowerCase()}}),Ut=Te({attributes:{xmlnsxlink:"xmlns:xlink"},properties:{xmlnsXLink:null,xmlns:null},space:"xmlns",transform:Ht}),Vt=Te({properties:{xmlBase:null,xmlLang:null,xmlSpace:null},space:"xml",transform(e,n){return"xml:"+n.slice(3).toLowerCase()}}),jr={classId:"classID",dataType:"datatype",itemId:"itemID",strokeDashArray:"strokeDasharray",strokeDashOffset:"strokeDashoffset",strokeLineCap:"strokeLinecap",strokeLineJoin:"strokeLinejoin",strokeMiterLimit:"strokeMiterlimit",typeOf:"typeof",xLinkActuate:"xlinkActuate",xLinkArcRole:"xlinkArcrole",xLinkHref:"xlinkHref",xLinkRole:"xlinkRole",xLinkShow:"xlinkShow",xLinkTitle:"xlinkTitle",xLinkType:"xlinkType",xmlnsXLink:"xmlnsXlink"},Ur=/[A-Z]/g,Yn=/-[a-z]/g,Vr=/^data[-\w.:]+$/i;function Wr(e,n){const t=dn(n);let r=n,i=Z;if(t in e.normal)return e.property[e.normal[t]];if(t.length>4&&t.slice(0,4)==="data"&&Vr.test(n)){if(n.charAt(4)==="-"){const a=n.slice(5).replace(Yn,Gr);r="data"+a.charAt(0).toUpperCase()+a.slice(1)}else{const a=n.slice(4);if(!Yn.test(a)){let o=a.replace(Ur,qr);o.charAt(0)!=="-"&&(o="-"+o),n="data"+o}}i=En}return new i(r,n)}function qr(e){return"-"+e.toLowerCase()}function Gr(e){return e.charAt(1).toUpperCase()}const Kr=Ot([Ft,_r,jt,Ut,Vt],"html"),An=Ot([Ft,Hr,jt,Ut,Vt],"svg");function Yr(e){return e.join(" ").trim()}var In={},$n=/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,$r=/\n/g,Xr=/^\s*/,Qr=/^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,Jr=/^:\s*/,Zr=/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,ei=/^[;\s]*/,ni=/^\s+|\s+$/g,ti=`
`,Xn="/",Qn="*",we="",ri="comment",ii="declaration",ai=function(e,n){if(typeof e!="string")throw new TypeError("First argument must be a string");if(!e)return[];n=n||{};var t=1,r=1;function i(y){var w=y.match($r);w&&(t+=w.length);var A=y.lastIndexOf(ti);r=~A?y.length-A:r+y.length}function a(){var y={line:t,column:r};return function(w){return w.position=new o(y),c(),w}}function o(y){this.start=y,this.end={line:t,column:r},this.source=n.source}o.prototype.content=e;function l(y){var w=new Error(n.source+":"+t+":"+r+": "+y);if(w.reason=y,w.filename=n.source,w.line=t,w.column=r,w.source=e,!n.silent)throw w}function s(y){var w=y.exec(e);if(w){var A=w[0];return i(A),e=e.slice(A.length),w}}function c(){s(Xr)}function u(y){var w;for(y=y||[];w=h();)w!==!1&&y.push(w);return y}function h(){var y=a();if(!(Xn!=e.charAt(0)||Qn!=e.charAt(1))){for(var w=2;we!=e.charAt(w)&&(Qn!=e.charAt(w)||Xn!=e.charAt(w+1));)++w;if(w+=2,we===e.charAt(w-1))return l("End of comment missing");var A=e.slice(2,w-2);return r+=2,i(A),e=e.slice(w),r+=2,y({type:ri,comment:A})}}function m(){var y=a(),w=s(Qr);if(w){if(h(),!s(Jr))return l("property missing ':'");var A=s(Zr),k=y({type:ii,property:Jn(w[0].replace($n,we)),value:A?Jn(A[0].replace($n,we)):we});return s(ei),k}}function p(){var y=[];u(y);for(var w;w=m();)w!==!1&&(y.push(w),u(y));return y}return c(),p()};function Jn(e){return e?e.replace(ni,we):we}var oi=$e&&$e.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(In,"__esModule",{value:!0});In.default=si;var li=oi(ai);function si(e,n){var t=null;if(!e||typeof e!="string")return t;var r=(0,li.default)(e),i=typeof n=="function";return r.forEach(function(a){if(a.type==="declaration"){var o=a.property,l=a.value;i?n(o,l,a):l&&(t=t||{},t[o]=l)}}),t}var Je={};Object.defineProperty(Je,"__esModule",{value:!0});Je.camelCase=void 0;var ui=/^--[a-zA-Z0-9_-]+$/,ci=/-([a-z])/g,pi=/^[^-]+$/,hi=/^-(webkit|moz|ms|o|khtml)-/,fi=/^-(ms)-/,di=function(e){return!e||pi.test(e)||ui.test(e)},mi=function(e,n){return n.toUpperCase()},Zn=function(e,n){return"".concat(n,"-")},gi=function(e,n){return n===void 0&&(n={}),di(e)?e:(e=e.toLowerCase(),n.reactCompat?e=e.replace(fi,Zn):e=e.replace(hi,Zn),e.replace(ci,mi))};Je.camelCase=gi;var yi=$e&&$e.__importDefault||function(e){return e&&e.__esModule?e:{default:e}},xi=yi(In),bi=Je;function yn(e,n){var t={};return!e||typeof e!="string"||(0,xi.default)(e,function(r,i){r&&i&&(t[(0,bi.camelCase)(r,n)]=i)}),t}yn.default=yn;var wi=yn;const ki=Rt(wi),Wt=qt("end"),Tn=qt("start");function qt(e){return n;function n(t){const r=t&&t.position&&t.position[e]||{};if(typeof r.line=="number"&&r.line>0&&typeof r.column=="number"&&r.column>0)return{line:r.line,column:r.column,offset:typeof r.offset=="number"&&r.offset>-1?r.offset:void 0}}}function Si(e){const n=Tn(e),t=Wt(e);if(n&&t)return{start:n,end:t}}function Re(e){return!e||typeof e!="object"?"":"position"in e||"type"in e?et(e.position):"start"in e||"end"in e?et(e):"line"in e||"column"in e?xn(e):""}function xn(e){return nt(e&&e.line)+":"+nt(e&&e.column)}function et(e){return xn(e&&e.start)+"-"+xn(e&&e.end)}function nt(e){return e&&typeof e=="number"?e:1}class X extends Error{constructor(n,t,r){super(),typeof t=="string"&&(r=t,t=void 0);let i="",a={},o=!1;if(t&&("line"in t&&"column"in t?a={place:t}:"start"in t&&"end"in t?a={place:t}:"type"in t?a={ancestors:[t],place:t.position}:a={...t}),typeof n=="string"?i=n:!a.cause&&n&&(o=!0,i=n.message,a.cause=n),!a.ruleId&&!a.source&&typeof r=="string"){const s=r.indexOf(":");s===-1?a.ruleId=r:(a.source=r.slice(0,s),a.ruleId=r.slice(s+1))}if(!a.place&&a.ancestors&&a.ancestors){const s=a.ancestors[a.ancestors.length-1];s&&(a.place=s.position)}const l=a.place&&"start"in a.place?a.place.start:a.place;this.ancestors=a.ancestors||void 0,this.cause=a.cause||void 0,this.column=l?l.column:void 0,this.fatal=void 0,this.file,this.message=i,this.line=l?l.line:void 0,this.name=Re(a.place)||"1:1",this.place=a.place||void 0,this.reason=this.message,this.ruleId=a.ruleId||void 0,this.source=a.source||void 0,this.stack=o&&a.cause&&typeof a.cause.stack=="string"?a.cause.stack:"",this.actual,this.expected,this.note,this.url}}X.prototype.file="";X.prototype.name="";X.prototype.reason="";X.prototype.message="";X.prototype.stack="";X.prototype.column=void 0;X.prototype.line=void 0;X.prototype.ancestors=void 0;X.prototype.cause=void 0;X.prototype.fatal=void 0;X.prototype.place=void 0;X.prototype.ruleId=void 0;X.prototype.source=void 0;const Pn={}.hasOwnProperty,vi=new Map,Ci=/[A-Z]/g,Ei=new Set(["table","tbody","thead","tfoot","tr"]),Ai=new Set(["td","th"]),Gt="https://github.com/syntax-tree/hast-util-to-jsx-runtime";function Ii(e,n){if(!n||n.Fragment===void 0)throw new TypeError("Expected `Fragment` in options");const t=n.filePath||void 0;let r;if(n.development){if(typeof n.jsxDEV!="function")throw new TypeError("Expected `jsxDEV` in options when `development: true`");r=Ni(t,n.jsxDEV)}else{if(typeof n.jsx!="function")throw new TypeError("Expected `jsx` in production options");if(typeof n.jsxs!="function")throw new TypeError("Expected `jsxs` in production options");r=Bi(t,n.jsx,n.jsxs)}const i={Fragment:n.Fragment,ancestors:[],components:n.components||{},create:r,elementAttributeNameCase:n.elementAttributeNameCase||"react",evaluater:n.createEvaluater?n.createEvaluater():void 0,filePath:t,ignoreInvalidStyle:n.ignoreInvalidStyle||!1,passKeys:n.passKeys!==!1,passNode:n.passNode||!1,schema:n.space==="svg"?An:Kr,stylePropertyNameCase:n.stylePropertyNameCase||"dom",tableCellAlignToStyle:n.tableCellAlignToStyle!==!1},a=Kt(i,e,void 0);return a&&typeof a!="string"?a:i.create(e,i.Fragment,{children:a||void 0},void 0)}function Kt(e,n,t){if(n.type==="element")return Ti(e,n,t);if(n.type==="mdxFlowExpression"||n.type==="mdxTextExpression")return Pi(e,n);if(n.type==="mdxJsxFlowElement"||n.type==="mdxJsxTextElement")return Mi(e,n,t);if(n.type==="mdxjsEsm")return Li(e,n);if(n.type==="root")return Di(e,n,t);if(n.type==="text")return zi(e,n)}function Ti(e,n,t){const r=e.schema;let i=r;n.tagName.toLowerCase()==="svg"&&r.space==="html"&&(i=An,e.schema=i),e.ancestors.push(n);const a=$t(e,n.tagName,!1),o=Ri(e,n);let l=Mn(e,n);return Ei.has(n.tagName)&&(l=l.filter(function(s){return typeof s=="string"?!Or(s):!0})),Yt(e,o,a,n),Ln(o,l),e.ancestors.pop(),e.schema=r,e.create(n,a,o,t)}function Pi(e,n){if(n.data&&n.data.estree&&e.evaluater){const r=n.data.estree.body[0];return r.type,e.evaluater.evaluateExpression(r.expression)}_e(e,n.position)}function Li(e,n){if(n.data&&n.data.estree&&e.evaluater)return e.evaluater.evaluateProgram(n.data.estree);_e(e,n.position)}function Mi(e,n,t){const r=e.schema;let i=r;n.name==="svg"&&r.space==="html"&&(i=An,e.schema=i),e.ancestors.push(n);const a=n.name===null?e.Fragment:$t(e,n.name,!0),o=Oi(e,n),l=Mn(e,n);return Yt(e,o,a,n),Ln(o,l),e.ancestors.pop(),e.schema=r,e.create(n,a,o,t)}function Di(e,n,t){const r={};return Ln(r,Mn(e,n)),e.create(n,e.Fragment,r,t)}function zi(e,n){return n.value}function Yt(e,n,t,r){typeof t!="string"&&t!==e.Fragment&&e.passNode&&(n.node=r)}function Ln(e,n){if(n.length>0){const t=n.length>1?n:n[0];t&&(e.children=t)}}function Bi(e,n,t){return r;function r(i,a,o,l){const c=Array.isArray(o.children)?t:n;return l?c(a,o,l):c(a,o)}}function Ni(e,n){return t;function t(r,i,a,o){const l=Array.isArray(a.children),s=Tn(r);return n(i,a,o,l,{columnNumber:s?s.column-1:void 0,fileName:e,lineNumber:s?s.line:void 0},void 0)}}function Ri(e,n){const t={};let r,i;for(i in n.properties)if(i!=="children"&&Pn.call(n.properties,i)){const a=Fi(e,i,n.properties[i]);if(a){const[o,l]=a;e.tableCellAlignToStyle&&o==="align"&&typeof l=="string"&&Ai.has(n.tagName)?r=l:t[o]=l}}if(r){const a=t.style||(t.style={});a[e.stylePropertyNameCase==="css"?"text-align":"textAlign"]=r}return t}function Oi(e,n){const t={};for(const r of n.attributes)if(r.type==="mdxJsxExpressionAttribute")if(r.data&&r.data.estree&&e.evaluater){const a=r.data.estree.body[0];a.type;const o=a.expression;o.type;const l=o.properties[0];l.type,Object.assign(t,e.evaluater.evaluateExpression(l.argument))}else _e(e,n.position);else{const i=r.name;let a;if(r.value&&typeof r.value=="object")if(r.value.data&&r.value.data.estree&&e.evaluater){const l=r.value.data.estree.body[0];l.type,a=e.evaluater.evaluateExpression(l.expression)}else _e(e,n.position);else a=r.value===null?!0:r.value;t[i]=a}return t}function Mn(e,n){const t=[];let r=-1;const i=e.passKeys?new Map:vi;for(;++r<n.children.length;){const a=n.children[r];let o;if(e.passKeys){const s=a.type==="element"?a.tagName:a.type==="mdxJsxFlowElement"||a.type==="mdxJsxTextElement"?a.name:void 0;if(s){const c=i.get(s)||0;o=s+"-"+c,i.set(s,c+1)}}const l=Kt(e,a,o);l!==void 0&&t.push(l)}return t}function Fi(e,n,t){const r=Wr(e.schema,n);if(!(t==null||typeof t=="number"&&Number.isNaN(t))){if(Array.isArray(t)&&(t=r.commaSeparated?Dr(t):Yr(t)),r.property==="style"){let i=typeof t=="object"?t:_i(e,String(t));return e.stylePropertyNameCase==="css"&&(i=Hi(i)),["style",i]}return[e.elementAttributeNameCase==="react"&&r.space?jr[r.property]||r.property:r.attribute,t]}}function _i(e,n){try{return ki(n,{reactCompat:!0})}catch(t){if(e.ignoreInvalidStyle)return{};const r=t,i=new X("Cannot parse `style` attribute",{ancestors:e.ancestors,cause:r,ruleId:"style",source:"hast-util-to-jsx-runtime"});throw i.file=e.filePath||void 0,i.url=Gt+"#cannot-parse-style-attribute",i}}function $t(e,n,t){let r;if(!t)r={type:"Literal",value:n};else if(n.includes(".")){const i=n.split(".");let a=-1,o;for(;++a<i.length;){const l=qn(i[a])?{type:"Identifier",name:i[a]}:{type:"Literal",value:i[a]};o=o?{type:"MemberExpression",object:o,property:l,computed:!!(a&&l.type==="Literal"),optional:!1}:l}r=o}else r=qn(n)&&!/^[a-z]/.test(n)?{type:"Identifier",name:n}:{type:"Literal",value:n};if(r.type==="Literal"){const i=r.value;return Pn.call(e.components,i)?e.components[i]:i}if(e.evaluater)return e.evaluater.evaluateExpression(r);_e(e)}function _e(e,n){const t=new X("Cannot handle MDX estrees without `createEvaluater`",{ancestors:e.ancestors,place:n,ruleId:"mdx-estree",source:"hast-util-to-jsx-runtime"});throw t.file=e.filePath||void 0,t.url=Gt+"#cannot-handle-mdx-estrees-without-createevaluater",t}function Hi(e){const n={};let t;for(t in e)Pn.call(e,t)&&(n[ji(t)]=e[t]);return n}function ji(e){let n=e.replace(Ci,Ui);return n.slice(0,3)==="ms-"&&(n="-"+n),n}function Ui(e){return"-"+e.toLowerCase()}const rn={action:["form"],cite:["blockquote","del","ins","q"],data:["object"],formAction:["button","input"],href:["a","area","base","link"],icon:["menuitem"],itemId:null,manifest:["html"],ping:["a","area"],poster:["video"],src:["audio","embed","iframe","img","input","script","source","track","video"]},Vi={};function Wi(e,n){const t=n||Vi,r=typeof t.includeImageAlt=="boolean"?t.includeImageAlt:!0,i=typeof t.includeHtml=="boolean"?t.includeHtml:!0;return Xt(e,r,i)}function Xt(e,n,t){if(qi(e)){if("value"in e)return e.type==="html"&&!t?"":e.value;if(n&&"alt"in e&&e.alt)return e.alt;if("children"in e)return tt(e.children,n,t)}return Array.isArray(e)?tt(e,n,t):""}function tt(e,n,t){const r=[];let i=-1;for(;++i<e.length;)r[i]=Xt(e[i],n,t);return r.join("")}function qi(e){return!!(e&&typeof e=="object")}const rt=document.createElement("i");function Dn(e){const n="&"+e+";";rt.innerHTML=n;const t=rt.textContent;return t.charCodeAt(t.length-1)===59&&e!=="semi"||t===n?!1:t}function ce(e,n,t,r){const i=e.length;let a=0,o;if(n<0?n=-n>i?0:i+n:n=n>i?i:n,t=t>0?t:0,r.length<1e4)o=Array.from(r),o.unshift(n,t),e.splice(...o);else for(t&&e.splice(n,t);a<r.length;)o=r.slice(a,a+1e4),o.unshift(n,0),e.splice(...o),a+=1e4,n+=1e4}function re(e,n){return e.length>0?(ce(e,e.length,0,n),e):n}const it={}.hasOwnProperty;function Gi(e){const n={};let t=-1;for(;++t<e.length;)Ki(n,e[t]);return n}function Ki(e,n){let t;for(t in n){const i=(it.call(e,t)?e[t]:void 0)||(e[t]={}),a=n[t];let o;if(a)for(o in a){it.call(i,o)||(i[o]=[]);const l=a[o];Yi(i[o],Array.isArray(l)?l:l?[l]:[])}}}function Yi(e,n){let t=-1;const r=[];for(;++t<n.length;)(n[t].add==="after"?e:r).push(n[t]);ce(e,0,0,r)}function Qt(e,n){const t=Number.parseInt(e,n);return t<9||t===11||t>13&&t<32||t>126&&t<160||t>55295&&t<57344||t>64975&&t<65008||(t&65535)===65535||(t&65535)===65534||t>1114111?"�":String.fromCodePoint(t)}function Ie(e){return e.replace(/[\t\n\r ]+/g," ").replace(/^ | $/g,"").toLowerCase().toUpperCase()}const ue=ye(/[A-Za-z]/),te=ye(/[\dA-Za-z]/),$i=ye(/[#-'*+\--9=?A-Z^-~]/);function bn(e){return e!==null&&(e<32||e===127)}const wn=ye(/\d/),Xi=ye(/[\dA-Fa-f]/),Qi=ye(/[!-/:-@[-`{-~]/);function I(e){return e!==null&&e<-2}function J(e){return e!==null&&(e<0||e===32)}function z(e){return e===-2||e===-1||e===32}const Ji=ye(/\p{P}|\p{S}/u),Zi=ye(/\s/);function ye(e){return n;function n(t){return t!==null&&t>-1&&e.test(String.fromCharCode(t))}}function Pe(e){const n=[];let t=-1,r=0,i=0;for(;++t<e.length;){const a=e.charCodeAt(t);let o="";if(a===37&&te(e.charCodeAt(t+1))&&te(e.charCodeAt(t+2)))i=2;else if(a<128)/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(a))||(o=String.fromCharCode(a));else if(a>55295&&a<57344){const l=e.charCodeAt(t+1);a<56320&&l>56319&&l<57344?(o=String.fromCharCode(a,l),i=1):o="�"}else o=String.fromCharCode(a);o&&(n.push(e.slice(r,t),encodeURIComponent(o)),r=t+i+1,o=""),i&&(t+=i,i=0)}return n.join("")+e.slice(r)}function _(e,n,t,r){const i=r?r-1:Number.POSITIVE_INFINITY;let a=0;return o;function o(s){return z(s)?(e.enter(t),l(s)):n(s)}function l(s){return z(s)&&a++<i?(e.consume(s),l):(e.exit(t),n(s))}}const ea={tokenize:na};function na(e){const n=e.attempt(this.parser.constructs.contentInitial,r,i);let t;return n;function r(l){if(l===null){e.consume(l);return}return e.enter("lineEnding"),e.consume(l),e.exit("lineEnding"),_(e,n,"linePrefix")}function i(l){return e.enter("paragraph"),a(l)}function a(l){const s=e.enter("chunkText",{contentType:"text",previous:t});return t&&(t.next=s),t=s,o(l)}function o(l){if(l===null){e.exit("chunkText"),e.exit("paragraph"),e.consume(l);return}return I(l)?(e.consume(l),e.exit("chunkText"),a):(e.consume(l),o)}}const ta={tokenize:ra},at={tokenize:ia};function ra(e){const n=this,t=[];let r=0,i,a,o;return l;function l(v){if(r<t.length){const j=t[r];return n.containerState=j[1],e.attempt(j[0].continuation,s,c)(v)}return c(v)}function s(v){if(r++,n.containerState._closeFlow){n.containerState._closeFlow=void 0,i&&L();const j=n.events.length;let V=j,x;for(;V--;)if(n.events[V][0]==="exit"&&n.events[V][1].type==="chunkFlow"){x=n.events[V][1].end;break}k(r);let N=j;for(;N<n.events.length;)n.events[N][1].end={...x},N++;return ce(n.events,V+1,0,n.events.slice(j)),n.events.length=N,c(v)}return l(v)}function c(v){if(r===t.length){if(!i)return m(v);if(i.currentConstruct&&i.currentConstruct.concrete)return y(v);n.interrupt=!!(i.currentConstruct&&!i._gfmTableDynamicInterruptHack)}return n.containerState={},e.check(at,u,h)(v)}function u(v){return i&&L(),k(r),m(v)}function h(v){return n.parser.lazy[n.now().line]=r!==t.length,o=n.now().offset,y(v)}function m(v){return n.containerState={},e.attempt(at,p,y)(v)}function p(v){return r++,t.push([n.currentConstruct,n.containerState]),m(v)}function y(v){if(v===null){i&&L(),k(0),e.consume(v);return}return i=i||n.parser.flow(n.now()),e.enter("chunkFlow",{_tokenizer:i,contentType:"flow",previous:a}),w(v)}function w(v){if(v===null){A(e.exit("chunkFlow"),!0),k(0),e.consume(v);return}return I(v)?(e.consume(v),A(e.exit("chunkFlow")),r=0,n.interrupt=void 0,l):(e.consume(v),w)}function A(v,j){const V=n.sliceStream(v);if(j&&V.push(null),v.previous=a,a&&(a.next=v),a=v,i.defineSkip(v.start),i.write(V),n.parser.lazy[v.start.line]){let x=i.events.length;for(;x--;)if(i.events[x][1].start.offset<o&&(!i.events[x][1].end||i.events[x][1].end.offset>o))return;const N=n.events.length;let W=N,R,H;for(;W--;)if(n.events[W][0]==="exit"&&n.events[W][1].type==="chunkFlow"){if(R){H=n.events[W][1].end;break}R=!0}for(k(r),x=N;x<n.events.length;)n.events[x][1].end={...H},x++;ce(n.events,W+1,0,n.events.slice(N)),n.events.length=x}}function k(v){let j=t.length;for(;j-- >v;){const V=t[j];n.containerState=V[1],V[0].exit.call(n,e)}t.length=v}function L(){i.write([null]),a=void 0,i=void 0,n.containerState._closeFlow=void 0}}function ia(e,n,t){return _(e,e.attempt(this.parser.constructs.document,n,t),"linePrefix",this.parser.constructs.disable.null.includes("codeIndented")?void 0:4)}function ot(e){if(e===null||J(e)||Zi(e))return 1;if(Ji(e))return 2}function zn(e,n,t){const r=[];let i=-1;for(;++i<e.length;){const a=e[i].resolveAll;a&&!r.includes(a)&&(n=a(n,t),r.push(a))}return n}const kn={name:"attention",resolveAll:aa,tokenize:oa};function aa(e,n){let t=-1,r,i,a,o,l,s,c,u;for(;++t<e.length;)if(e[t][0]==="enter"&&e[t][1].type==="attentionSequence"&&e[t][1]._close){for(r=t;r--;)if(e[r][0]==="exit"&&e[r][1].type==="attentionSequence"&&e[r][1]._open&&n.sliceSerialize(e[r][1]).charCodeAt(0)===n.sliceSerialize(e[t][1]).charCodeAt(0)){if((e[r][1]._close||e[t][1]._open)&&(e[t][1].end.offset-e[t][1].start.offset)%3&&!((e[r][1].end.offset-e[r][1].start.offset+e[t][1].end.offset-e[t][1].start.offset)%3))continue;s=e[r][1].end.offset-e[r][1].start.offset>1&&e[t][1].end.offset-e[t][1].start.offset>1?2:1;const h={...e[r][1].end},m={...e[t][1].start};lt(h,-s),lt(m,s),o={type:s>1?"strongSequence":"emphasisSequence",start:h,end:{...e[r][1].end}},l={type:s>1?"strongSequence":"emphasisSequence",start:{...e[t][1].start},end:m},a={type:s>1?"strongText":"emphasisText",start:{...e[r][1].end},end:{...e[t][1].start}},i={type:s>1?"strong":"emphasis",start:{...o.start},end:{...l.end}},e[r][1].end={...o.start},e[t][1].start={...l.end},c=[],e[r][1].end.offset-e[r][1].start.offset&&(c=re(c,[["enter",e[r][1],n],["exit",e[r][1],n]])),c=re(c,[["enter",i,n],["enter",o,n],["exit",o,n],["enter",a,n]]),c=re(c,zn(n.parser.constructs.insideSpan.null,e.slice(r+1,t),n)),c=re(c,[["exit",a,n],["enter",l,n],["exit",l,n],["exit",i,n]]),e[t][1].end.offset-e[t][1].start.offset?(u=2,c=re(c,[["enter",e[t][1],n],["exit",e[t][1],n]])):u=0,ce(e,r-1,t-r+3,c),t=r+c.length-u-2;break}}for(t=-1;++t<e.length;)e[t][1].type==="attentionSequence"&&(e[t][1].type="data");return e}function oa(e,n){const t=this.parser.constructs.attentionMarkers.null,r=this.previous,i=ot(r);let a;return o;function o(s){return a=s,e.enter("attentionSequence"),l(s)}function l(s){if(s===a)return e.consume(s),l;const c=e.exit("attentionSequence"),u=ot(s),h=!u||u===2&&i||t.includes(s),m=!i||i===2&&u||t.includes(r);return c._open=!!(a===42?h:h&&(i||!m)),c._close=!!(a===42?m:m&&(u||!h)),n(s)}}function lt(e,n){e.column+=n,e.offset+=n,e._bufferIndex+=n}const la={name:"autolink",tokenize:sa};function sa(e,n,t){let r=0;return i;function i(p){return e.enter("autolink"),e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.enter("autolinkProtocol"),a}function a(p){return ue(p)?(e.consume(p),o):p===64?t(p):c(p)}function o(p){return p===43||p===45||p===46||te(p)?(r=1,l(p)):c(p)}function l(p){return p===58?(e.consume(p),r=0,s):(p===43||p===45||p===46||te(p))&&r++<32?(e.consume(p),l):(r=0,c(p))}function s(p){return p===62?(e.exit("autolinkProtocol"),e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.exit("autolink"),n):p===null||p===32||p===60||bn(p)?t(p):(e.consume(p),s)}function c(p){return p===64?(e.consume(p),u):$i(p)?(e.consume(p),c):t(p)}function u(p){return te(p)?h(p):t(p)}function h(p){return p===46?(e.consume(p),r=0,u):p===62?(e.exit("autolinkProtocol").type="autolinkEmail",e.enter("autolinkMarker"),e.consume(p),e.exit("autolinkMarker"),e.exit("autolink"),n):m(p)}function m(p){if((p===45||te(p))&&r++<63){const y=p===45?m:h;return e.consume(p),y}return t(p)}}const Ze={partial:!0,tokenize:ua};function ua(e,n,t){return r;function r(a){return z(a)?_(e,i,"linePrefix")(a):i(a)}function i(a){return a===null||I(a)?n(a):t(a)}}const Jt={continuation:{tokenize:pa},exit:ha,name:"blockQuote",tokenize:ca};function ca(e,n,t){const r=this;return i;function i(o){if(o===62){const l=r.containerState;return l.open||(e.enter("blockQuote",{_container:!0}),l.open=!0),e.enter("blockQuotePrefix"),e.enter("blockQuoteMarker"),e.consume(o),e.exit("blockQuoteMarker"),a}return t(o)}function a(o){return z(o)?(e.enter("blockQuotePrefixWhitespace"),e.consume(o),e.exit("blockQuotePrefixWhitespace"),e.exit("blockQuotePrefix"),n):(e.exit("blockQuotePrefix"),n(o))}}function pa(e,n,t){const r=this;return i;function i(o){return z(o)?_(e,a,"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(o):a(o)}function a(o){return e.attempt(Jt,n,t)(o)}}function ha(e){e.exit("blockQuote")}const Zt={name:"characterEscape",tokenize:fa};function fa(e,n,t){return r;function r(a){return e.enter("characterEscape"),e.enter("escapeMarker"),e.consume(a),e.exit("escapeMarker"),i}function i(a){return Qi(a)?(e.enter("characterEscapeValue"),e.consume(a),e.exit("characterEscapeValue"),e.exit("characterEscape"),n):t(a)}}const er={name:"characterReference",tokenize:da};function da(e,n,t){const r=this;let i=0,a,o;return l;function l(h){return e.enter("characterReference"),e.enter("characterReferenceMarker"),e.consume(h),e.exit("characterReferenceMarker"),s}function s(h){return h===35?(e.enter("characterReferenceMarkerNumeric"),e.consume(h),e.exit("characterReferenceMarkerNumeric"),c):(e.enter("characterReferenceValue"),a=31,o=te,u(h))}function c(h){return h===88||h===120?(e.enter("characterReferenceMarkerHexadecimal"),e.consume(h),e.exit("characterReferenceMarkerHexadecimal"),e.enter("characterReferenceValue"),a=6,o=Xi,u):(e.enter("characterReferenceValue"),a=7,o=wn,u(h))}function u(h){if(h===59&&i){const m=e.exit("characterReferenceValue");return o===te&&!Dn(r.sliceSerialize(m))?t(h):(e.enter("characterReferenceMarker"),e.consume(h),e.exit("characterReferenceMarker"),e.exit("characterReference"),n)}return o(h)&&i++<a?(e.consume(h),u):t(h)}}const st={partial:!0,tokenize:ga},ut={concrete:!0,name:"codeFenced",tokenize:ma};function ma(e,n,t){const r=this,i={partial:!0,tokenize:V};let a=0,o=0,l;return s;function s(x){return c(x)}function c(x){const N=r.events[r.events.length-1];return a=N&&N[1].type==="linePrefix"?N[2].sliceSerialize(N[1],!0).length:0,l=x,e.enter("codeFenced"),e.enter("codeFencedFence"),e.enter("codeFencedFenceSequence"),u(x)}function u(x){return x===l?(o++,e.consume(x),u):o<3?t(x):(e.exit("codeFencedFenceSequence"),z(x)?_(e,h,"whitespace")(x):h(x))}function h(x){return x===null||I(x)?(e.exit("codeFencedFence"),r.interrupt?n(x):e.check(st,w,j)(x)):(e.enter("codeFencedFenceInfo"),e.enter("chunkString",{contentType:"string"}),m(x))}function m(x){return x===null||I(x)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),h(x)):z(x)?(e.exit("chunkString"),e.exit("codeFencedFenceInfo"),_(e,p,"whitespace")(x)):x===96&&x===l?t(x):(e.consume(x),m)}function p(x){return x===null||I(x)?h(x):(e.enter("codeFencedFenceMeta"),e.enter("chunkString",{contentType:"string"}),y(x))}function y(x){return x===null||I(x)?(e.exit("chunkString"),e.exit("codeFencedFenceMeta"),h(x)):x===96&&x===l?t(x):(e.consume(x),y)}function w(x){return e.attempt(i,j,A)(x)}function A(x){return e.enter("lineEnding"),e.consume(x),e.exit("lineEnding"),k}function k(x){return a>0&&z(x)?_(e,L,"linePrefix",a+1)(x):L(x)}function L(x){return x===null||I(x)?e.check(st,w,j)(x):(e.enter("codeFlowValue"),v(x))}function v(x){return x===null||I(x)?(e.exit("codeFlowValue"),L(x)):(e.consume(x),v)}function j(x){return e.exit("codeFenced"),n(x)}function V(x,N,W){let R=0;return H;function H(D){return x.enter("lineEnding"),x.consume(D),x.exit("lineEnding"),E}function E(D){return x.enter("codeFencedFence"),z(D)?_(x,C,"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(D):C(D)}function C(D){return D===l?(x.enter("codeFencedFenceSequence"),U(D)):W(D)}function U(D){return D===l?(R++,x.consume(D),U):R>=o?(x.exit("codeFencedFenceSequence"),z(D)?_(x,q,"whitespace")(D):q(D)):W(D)}function q(D){return D===null||I(D)?(x.exit("codeFencedFence"),N(D)):W(D)}}}function ga(e,n,t){const r=this;return i;function i(o){return o===null?t(o):(e.enter("lineEnding"),e.consume(o),e.exit("lineEnding"),a)}function a(o){return r.parser.lazy[r.now().line]?t(o):n(o)}}const an={name:"codeIndented",tokenize:xa},ya={partial:!0,tokenize:ba};function xa(e,n,t){const r=this;return i;function i(c){return e.enter("codeIndented"),_(e,a,"linePrefix",4+1)(c)}function a(c){const u=r.events[r.events.length-1];return u&&u[1].type==="linePrefix"&&u[2].sliceSerialize(u[1],!0).length>=4?o(c):t(c)}function o(c){return c===null?s(c):I(c)?e.attempt(ya,o,s)(c):(e.enter("codeFlowValue"),l(c))}function l(c){return c===null||I(c)?(e.exit("codeFlowValue"),o(c)):(e.consume(c),l)}function s(c){return e.exit("codeIndented"),n(c)}}function ba(e,n,t){const r=this;return i;function i(o){return r.parser.lazy[r.now().line]?t(o):I(o)?(e.enter("lineEnding"),e.consume(o),e.exit("lineEnding"),i):_(e,a,"linePrefix",4+1)(o)}function a(o){const l=r.events[r.events.length-1];return l&&l[1].type==="linePrefix"&&l[2].sliceSerialize(l[1],!0).length>=4?n(o):I(o)?i(o):t(o)}}const wa={name:"codeText",previous:Sa,resolve:ka,tokenize:va};function ka(e){let n=e.length-4,t=3,r,i;if((e[t][1].type==="lineEnding"||e[t][1].type==="space")&&(e[n][1].type==="lineEnding"||e[n][1].type==="space")){for(r=t;++r<n;)if(e[r][1].type==="codeTextData"){e[t][1].type="codeTextPadding",e[n][1].type="codeTextPadding",t+=2,n-=2;break}}for(r=t-1,n++;++r<=n;)i===void 0?r!==n&&e[r][1].type!=="lineEnding"&&(i=r):(r===n||e[r][1].type==="lineEnding")&&(e[i][1].type="codeTextData",r!==i+2&&(e[i][1].end=e[r-1][1].end,e.splice(i+2,r-i-2),n-=r-i-2,r=i+2),i=void 0);return e}function Sa(e){return e!==96||this.events[this.events.length-1][1].type==="characterEscape"}function va(e,n,t){let r=0,i,a;return o;function o(h){return e.enter("codeText"),e.enter("codeTextSequence"),l(h)}function l(h){return h===96?(e.consume(h),r++,l):(e.exit("codeTextSequence"),s(h))}function s(h){return h===null?t(h):h===32?(e.enter("space"),e.consume(h),e.exit("space"),s):h===96?(a=e.enter("codeTextSequence"),i=0,u(h)):I(h)?(e.enter("lineEnding"),e.consume(h),e.exit("lineEnding"),s):(e.enter("codeTextData"),c(h))}function c(h){return h===null||h===32||h===96||I(h)?(e.exit("codeTextData"),s(h)):(e.consume(h),c)}function u(h){return h===96?(e.consume(h),i++,u):i===r?(e.exit("codeTextSequence"),e.exit("codeText"),n(h)):(a.type="codeTextData",c(h))}}class Ca{constructor(n){this.left=n?[...n]:[],this.right=[]}get(n){if(n<0||n>=this.left.length+this.right.length)throw new RangeError("Cannot access index `"+n+"` in a splice buffer of size `"+(this.left.length+this.right.length)+"`");return n<this.left.length?this.left[n]:this.right[this.right.length-n+this.left.length-1]}get length(){return this.left.length+this.right.length}shift(){return this.setCursor(0),this.right.pop()}slice(n,t){const r=t??Number.POSITIVE_INFINITY;return r<this.left.length?this.left.slice(n,r):n>this.left.length?this.right.slice(this.right.length-r+this.left.length,this.right.length-n+this.left.length).reverse():this.left.slice(n).concat(this.right.slice(this.right.length-r+this.left.length).reverse())}splice(n,t,r){const i=t||0;this.setCursor(Math.trunc(n));const a=this.right.splice(this.right.length-i,Number.POSITIVE_INFINITY);return r&&Be(this.left,r),a.reverse()}pop(){return this.setCursor(Number.POSITIVE_INFINITY),this.left.pop()}push(n){this.setCursor(Number.POSITIVE_INFINITY),this.left.push(n)}pushMany(n){this.setCursor(Number.POSITIVE_INFINITY),Be(this.left,n)}unshift(n){this.setCursor(0),this.right.push(n)}unshiftMany(n){this.setCursor(0),Be(this.right,n.reverse())}setCursor(n){if(!(n===this.left.length||n>this.left.length&&this.right.length===0||n<0&&this.left.length===0))if(n<this.left.length){const t=this.left.splice(n,Number.POSITIVE_INFINITY);Be(this.right,t.reverse())}else{const t=this.right.splice(this.left.length+this.right.length-n,Number.POSITIVE_INFINITY);Be(this.left,t.reverse())}}}function Be(e,n){let t=0;if(n.length<1e4)e.push(...n);else for(;t<n.length;)e.push(...n.slice(t,t+1e4)),t+=1e4}function nr(e){const n={};let t=-1,r,i,a,o,l,s,c;const u=new Ca(e);for(;++t<u.length;){for(;t in n;)t=n[t];if(r=u.get(t),t&&r[1].type==="chunkFlow"&&u.get(t-1)[1].type==="listItemPrefix"&&(s=r[1]._tokenizer.events,a=0,a<s.length&&s[a][1].type==="lineEndingBlank"&&(a+=2),a<s.length&&s[a][1].type==="content"))for(;++a<s.length&&s[a][1].type!=="content";)s[a][1].type==="chunkText"&&(s[a][1]._isInFirstContentOfListItem=!0,a++);if(r[0]==="enter")r[1].contentType&&(Object.assign(n,Ea(u,t)),t=n[t],c=!0);else if(r[1]._container){for(a=t,i=void 0;a--;)if(o=u.get(a),o[1].type==="lineEnding"||o[1].type==="lineEndingBlank")o[0]==="enter"&&(i&&(u.get(i)[1].type="lineEndingBlank"),o[1].type="lineEnding",i=a);else if(!(o[1].type==="linePrefix"||o[1].type==="listItemIndent"))break;i&&(r[1].end={...u.get(i)[1].start},l=u.slice(i,t),l.unshift(r),u.splice(i,t-i+1,l))}}return ce(e,0,Number.POSITIVE_INFINITY,u.slice(0)),!c}function Ea(e,n){const t=e.get(n)[1],r=e.get(n)[2];let i=n-1;const a=[];let o=t._tokenizer;o||(o=r.parser[t.contentType](t.start),t._contentTypeTextTrailing&&(o._contentTypeTextTrailing=!0));const l=o.events,s=[],c={};let u,h,m=-1,p=t,y=0,w=0;const A=[w];for(;p;){for(;e.get(++i)[1]!==p;);a.push(i),p._tokenizer||(u=r.sliceStream(p),p.next||u.push(null),h&&o.defineSkip(p.start),p._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=!0),o.write(u),p._isInFirstContentOfListItem&&(o._gfmTasklistFirstContentOfListItem=void 0)),h=p,p=p.next}for(p=t;++m<l.length;)l[m][0]==="exit"&&l[m-1][0]==="enter"&&l[m][1].type===l[m-1][1].type&&l[m][1].start.line!==l[m][1].end.line&&(w=m+1,A.push(w),p._tokenizer=void 0,p.previous=void 0,p=p.next);for(o.events=[],p?(p._tokenizer=void 0,p.previous=void 0):A.pop(),m=A.length;m--;){const k=l.slice(A[m],A[m+1]),L=a.pop();s.push([L,L+k.length-1]),e.splice(L,2,k)}for(s.reverse(),m=-1;++m<s.length;)c[y+s[m][0]]=y+s[m][1],y+=s[m][1]-s[m][0]-1;return c}const Aa={resolve:Ta,tokenize:Pa},Ia={partial:!0,tokenize:La};function Ta(e){return nr(e),e}function Pa(e,n){let t;return r;function r(l){return e.enter("content"),t=e.enter("chunkContent",{contentType:"content"}),i(l)}function i(l){return l===null?a(l):I(l)?e.check(Ia,o,a)(l):(e.consume(l),i)}function a(l){return e.exit("chunkContent"),e.exit("content"),n(l)}function o(l){return e.consume(l),e.exit("chunkContent"),t.next=e.enter("chunkContent",{contentType:"content",previous:t}),t=t.next,i}}function La(e,n,t){const r=this;return i;function i(o){return e.exit("chunkContent"),e.enter("lineEnding"),e.consume(o),e.exit("lineEnding"),_(e,a,"linePrefix")}function a(o){if(o===null||I(o))return t(o);const l=r.events[r.events.length-1];return!r.parser.constructs.disable.null.includes("codeIndented")&&l&&l[1].type==="linePrefix"&&l[2].sliceSerialize(l[1],!0).length>=4?n(o):e.interrupt(r.parser.constructs.flow,t,n)(o)}}function tr(e,n,t,r,i,a,o,l,s){const c=s||Number.POSITIVE_INFINITY;let u=0;return h;function h(k){return k===60?(e.enter(r),e.enter(i),e.enter(a),e.consume(k),e.exit(a),m):k===null||k===32||k===41||bn(k)?t(k):(e.enter(r),e.enter(o),e.enter(l),e.enter("chunkString",{contentType:"string"}),w(k))}function m(k){return k===62?(e.enter(a),e.consume(k),e.exit(a),e.exit(i),e.exit(r),n):(e.enter(l),e.enter("chunkString",{contentType:"string"}),p(k))}function p(k){return k===62?(e.exit("chunkString"),e.exit(l),m(k)):k===null||k===60||I(k)?t(k):(e.consume(k),k===92?y:p)}function y(k){return k===60||k===62||k===92?(e.consume(k),p):p(k)}function w(k){return!u&&(k===null||k===41||J(k))?(e.exit("chunkString"),e.exit(l),e.exit(o),e.exit(r),n(k)):u<c&&k===40?(e.consume(k),u++,w):k===41?(e.consume(k),u--,w):k===null||k===32||k===40||bn(k)?t(k):(e.consume(k),k===92?A:w)}function A(k){return k===40||k===41||k===92?(e.consume(k),w):w(k)}}function rr(e,n,t,r,i,a){const o=this;let l=0,s;return c;function c(p){return e.enter(r),e.enter(i),e.consume(p),e.exit(i),e.enter(a),u}function u(p){return l>999||p===null||p===91||p===93&&!s||p===94&&!l&&"_hiddenFootnoteSupport"in o.parser.constructs?t(p):p===93?(e.exit(a),e.enter(i),e.consume(p),e.exit(i),e.exit(r),n):I(p)?(e.enter("lineEnding"),e.consume(p),e.exit("lineEnding"),u):(e.enter("chunkString",{contentType:"string"}),h(p))}function h(p){return p===null||p===91||p===93||I(p)||l++>999?(e.exit("chunkString"),u(p)):(e.consume(p),s||(s=!z(p)),p===92?m:h)}function m(p){return p===91||p===92||p===93?(e.consume(p),l++,h):h(p)}}function ir(e,n,t,r,i,a){let o;return l;function l(m){return m===34||m===39||m===40?(e.enter(r),e.enter(i),e.consume(m),e.exit(i),o=m===40?41:m,s):t(m)}function s(m){return m===o?(e.enter(i),e.consume(m),e.exit(i),e.exit(r),n):(e.enter(a),c(m))}function c(m){return m===o?(e.exit(a),s(o)):m===null?t(m):I(m)?(e.enter("lineEnding"),e.consume(m),e.exit("lineEnding"),_(e,c,"linePrefix")):(e.enter("chunkString",{contentType:"string"}),u(m))}function u(m){return m===o||m===null||I(m)?(e.exit("chunkString"),c(m)):(e.consume(m),m===92?h:u)}function h(m){return m===o||m===92?(e.consume(m),u):u(m)}}function Oe(e,n){let t;return r;function r(i){return I(i)?(e.enter("lineEnding"),e.consume(i),e.exit("lineEnding"),t=!0,r):z(i)?_(e,r,t?"linePrefix":"lineSuffix")(i):n(i)}}const Ma={name:"definition",tokenize:za},Da={partial:!0,tokenize:Ba};function za(e,n,t){const r=this;let i;return a;function a(p){return e.enter("definition"),o(p)}function o(p){return rr.call(r,e,l,t,"definitionLabel","definitionLabelMarker","definitionLabelString")(p)}function l(p){return i=Ie(r.sliceSerialize(r.events[r.events.length-1][1]).slice(1,-1)),p===58?(e.enter("definitionMarker"),e.consume(p),e.exit("definitionMarker"),s):t(p)}function s(p){return J(p)?Oe(e,c)(p):c(p)}function c(p){return tr(e,u,t,"definitionDestination","definitionDestinationLiteral","definitionDestinationLiteralMarker","definitionDestinationRaw","definitionDestinationString")(p)}function u(p){return e.attempt(Da,h,h)(p)}function h(p){return z(p)?_(e,m,"whitespace")(p):m(p)}function m(p){return p===null||I(p)?(e.exit("definition"),r.parser.defined.push(i),n(p)):t(p)}}function Ba(e,n,t){return r;function r(l){return J(l)?Oe(e,i)(l):t(l)}function i(l){return ir(e,a,t,"definitionTitle","definitionTitleMarker","definitionTitleString")(l)}function a(l){return z(l)?_(e,o,"whitespace")(l):o(l)}function o(l){return l===null||I(l)?n(l):t(l)}}const Na={name:"hardBreakEscape",tokenize:Ra};function Ra(e,n,t){return r;function r(a){return e.enter("hardBreakEscape"),e.consume(a),i}function i(a){return I(a)?(e.exit("hardBreakEscape"),n(a)):t(a)}}const Oa={name:"headingAtx",resolve:Fa,tokenize:_a};function Fa(e,n){let t=e.length-2,r=3,i,a;return e[r][1].type==="whitespace"&&(r+=2),t-2>r&&e[t][1].type==="whitespace"&&(t-=2),e[t][1].type==="atxHeadingSequence"&&(r===t-1||t-4>r&&e[t-2][1].type==="whitespace")&&(t-=r+1===t?2:4),t>r&&(i={type:"atxHeadingText",start:e[r][1].start,end:e[t][1].end},a={type:"chunkText",start:e[r][1].start,end:e[t][1].end,contentType:"text"},ce(e,r,t-r+1,[["enter",i,n],["enter",a,n],["exit",a,n],["exit",i,n]])),e}function _a(e,n,t){let r=0;return i;function i(u){return e.enter("atxHeading"),a(u)}function a(u){return e.enter("atxHeadingSequence"),o(u)}function o(u){return u===35&&r++<6?(e.consume(u),o):u===null||J(u)?(e.exit("atxHeadingSequence"),l(u)):t(u)}function l(u){return u===35?(e.enter("atxHeadingSequence"),s(u)):u===null||I(u)?(e.exit("atxHeading"),n(u)):z(u)?_(e,l,"whitespace")(u):(e.enter("atxHeadingText"),c(u))}function s(u){return u===35?(e.consume(u),s):(e.exit("atxHeadingSequence"),l(u))}function c(u){return u===null||u===35||J(u)?(e.exit("atxHeadingText"),l(u)):(e.consume(u),c)}}const Ha=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],ct=["pre","script","style","textarea"],ja={concrete:!0,name:"htmlFlow",resolveTo:Wa,tokenize:qa},Ua={partial:!0,tokenize:Ka},Va={partial:!0,tokenize:Ga};function Wa(e){let n=e.length;for(;n--&&!(e[n][0]==="enter"&&e[n][1].type==="htmlFlow"););return n>1&&e[n-2][1].type==="linePrefix"&&(e[n][1].start=e[n-2][1].start,e[n+1][1].start=e[n-2][1].start,e.splice(n-2,2)),e}function qa(e,n,t){const r=this;let i,a,o,l,s;return c;function c(d){return u(d)}function u(d){return e.enter("htmlFlow"),e.enter("htmlFlowData"),e.consume(d),h}function h(d){return d===33?(e.consume(d),m):d===47?(e.consume(d),a=!0,w):d===63?(e.consume(d),i=3,r.interrupt?n:f):ue(d)?(e.consume(d),o=String.fromCharCode(d),A):t(d)}function m(d){return d===45?(e.consume(d),i=2,p):d===91?(e.consume(d),i=5,l=0,y):ue(d)?(e.consume(d),i=4,r.interrupt?n:f):t(d)}function p(d){return d===45?(e.consume(d),r.interrupt?n:f):t(d)}function y(d){const oe="CDATA[";return d===oe.charCodeAt(l++)?(e.consume(d),l===oe.length?r.interrupt?n:C:y):t(d)}function w(d){return ue(d)?(e.consume(d),o=String.fromCharCode(d),A):t(d)}function A(d){if(d===null||d===47||d===62||J(d)){const oe=d===47,xe=o.toLowerCase();return!oe&&!a&&ct.includes(xe)?(i=1,r.interrupt?n(d):C(d)):Ha.includes(o.toLowerCase())?(i=6,oe?(e.consume(d),k):r.interrupt?n(d):C(d)):(i=7,r.interrupt&&!r.parser.lazy[r.now().line]?t(d):a?L(d):v(d))}return d===45||te(d)?(e.consume(d),o+=String.fromCharCode(d),A):t(d)}function k(d){return d===62?(e.consume(d),r.interrupt?n:C):t(d)}function L(d){return z(d)?(e.consume(d),L):H(d)}function v(d){return d===47?(e.consume(d),H):d===58||d===95||ue(d)?(e.consume(d),j):z(d)?(e.consume(d),v):H(d)}function j(d){return d===45||d===46||d===58||d===95||te(d)?(e.consume(d),j):V(d)}function V(d){return d===61?(e.consume(d),x):z(d)?(e.consume(d),V):v(d)}function x(d){return d===null||d===60||d===61||d===62||d===96?t(d):d===34||d===39?(e.consume(d),s=d,N):z(d)?(e.consume(d),x):W(d)}function N(d){return d===s?(e.consume(d),s=null,R):d===null||I(d)?t(d):(e.consume(d),N)}function W(d){return d===null||d===34||d===39||d===47||d===60||d===61||d===62||d===96||J(d)?V(d):(e.consume(d),W)}function R(d){return d===47||d===62||z(d)?v(d):t(d)}function H(d){return d===62?(e.consume(d),E):t(d)}function E(d){return d===null||I(d)?C(d):z(d)?(e.consume(d),E):t(d)}function C(d){return d===45&&i===2?(e.consume(d),$):d===60&&i===1?(e.consume(d),K):d===62&&i===4?(e.consume(d),ae):d===63&&i===3?(e.consume(d),f):d===93&&i===5?(e.consume(d),pe):I(d)&&(i===6||i===7)?(e.exit("htmlFlowData"),e.check(Ua,he,U)(d)):d===null||I(d)?(e.exit("htmlFlowData"),U(d)):(e.consume(d),C)}function U(d){return e.check(Va,q,he)(d)}function q(d){return e.enter("lineEnding"),e.consume(d),e.exit("lineEnding"),D}function D(d){return d===null||I(d)?U(d):(e.enter("htmlFlowData"),C(d))}function $(d){return d===45?(e.consume(d),f):C(d)}function K(d){return d===47?(e.consume(d),o="",ie):C(d)}function ie(d){if(d===62){const oe=o.toLowerCase();return ct.includes(oe)?(e.consume(d),ae):C(d)}return ue(d)&&o.length<8?(e.consume(d),o+=String.fromCharCode(d),ie):C(d)}function pe(d){return d===93?(e.consume(d),f):C(d)}function f(d){return d===62?(e.consume(d),ae):d===45&&i===2?(e.consume(d),f):C(d)}function ae(d){return d===null||I(d)?(e.exit("htmlFlowData"),he(d)):(e.consume(d),ae)}function he(d){return e.exit("htmlFlow"),n(d)}}function Ga(e,n,t){const r=this;return i;function i(o){return I(o)?(e.enter("lineEnding"),e.consume(o),e.exit("lineEnding"),a):t(o)}function a(o){return r.parser.lazy[r.now().line]?t(o):n(o)}}function Ka(e,n,t){return r;function r(i){return e.enter("lineEnding"),e.consume(i),e.exit("lineEnding"),e.attempt(Ze,n,t)}}const Ya={name:"htmlText",tokenize:$a};function $a(e,n,t){const r=this;let i,a,o;return l;function l(f){return e.enter("htmlText"),e.enter("htmlTextData"),e.consume(f),s}function s(f){return f===33?(e.consume(f),c):f===47?(e.consume(f),V):f===63?(e.consume(f),v):ue(f)?(e.consume(f),W):t(f)}function c(f){return f===45?(e.consume(f),u):f===91?(e.consume(f),a=0,y):ue(f)?(e.consume(f),L):t(f)}function u(f){return f===45?(e.consume(f),p):t(f)}function h(f){return f===null?t(f):f===45?(e.consume(f),m):I(f)?(o=h,K(f)):(e.consume(f),h)}function m(f){return f===45?(e.consume(f),p):h(f)}function p(f){return f===62?$(f):f===45?m(f):h(f)}function y(f){const ae="CDATA[";return f===ae.charCodeAt(a++)?(e.consume(f),a===ae.length?w:y):t(f)}function w(f){return f===null?t(f):f===93?(e.consume(f),A):I(f)?(o=w,K(f)):(e.consume(f),w)}function A(f){return f===93?(e.consume(f),k):w(f)}function k(f){return f===62?$(f):f===93?(e.consume(f),k):w(f)}function L(f){return f===null||f===62?$(f):I(f)?(o=L,K(f)):(e.consume(f),L)}function v(f){return f===null?t(f):f===63?(e.consume(f),j):I(f)?(o=v,K(f)):(e.consume(f),v)}function j(f){return f===62?$(f):v(f)}function V(f){return ue(f)?(e.consume(f),x):t(f)}function x(f){return f===45||te(f)?(e.consume(f),x):N(f)}function N(f){return I(f)?(o=N,K(f)):z(f)?(e.consume(f),N):$(f)}function W(f){return f===45||te(f)?(e.consume(f),W):f===47||f===62||J(f)?R(f):t(f)}function R(f){return f===47?(e.consume(f),$):f===58||f===95||ue(f)?(e.consume(f),H):I(f)?(o=R,K(f)):z(f)?(e.consume(f),R):$(f)}function H(f){return f===45||f===46||f===58||f===95||te(f)?(e.consume(f),H):E(f)}function E(f){return f===61?(e.consume(f),C):I(f)?(o=E,K(f)):z(f)?(e.consume(f),E):R(f)}function C(f){return f===null||f===60||f===61||f===62||f===96?t(f):f===34||f===39?(e.consume(f),i=f,U):I(f)?(o=C,K(f)):z(f)?(e.consume(f),C):(e.consume(f),q)}function U(f){return f===i?(e.consume(f),i=void 0,D):f===null?t(f):I(f)?(o=U,K(f)):(e.consume(f),U)}function q(f){return f===null||f===34||f===39||f===60||f===61||f===96?t(f):f===47||f===62||J(f)?R(f):(e.consume(f),q)}function D(f){return f===47||f===62||J(f)?R(f):t(f)}function $(f){return f===62?(e.consume(f),e.exit("htmlTextData"),e.exit("htmlText"),n):t(f)}function K(f){return e.exit("htmlTextData"),e.enter("lineEnding"),e.consume(f),e.exit("lineEnding"),ie}function ie(f){return z(f)?_(e,pe,"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(f):pe(f)}function pe(f){return e.enter("htmlTextData"),o(f)}}const Bn={name:"labelEnd",resolveAll:Za,resolveTo:eo,tokenize:no},Xa={tokenize:to},Qa={tokenize:ro},Ja={tokenize:io};function Za(e){let n=-1;const t=[];for(;++n<e.length;){const r=e[n][1];if(t.push(e[n]),r.type==="labelImage"||r.type==="labelLink"||r.type==="labelEnd"){const i=r.type==="labelImage"?4:2;r.type="data",n+=i}}return e.length!==t.length&&ce(e,0,e.length,t),e}function eo(e,n){let t=e.length,r=0,i,a,o,l;for(;t--;)if(i=e[t][1],a){if(i.type==="link"||i.type==="labelLink"&&i._inactive)break;e[t][0]==="enter"&&i.type==="labelLink"&&(i._inactive=!0)}else if(o){if(e[t][0]==="enter"&&(i.type==="labelImage"||i.type==="labelLink")&&!i._balanced&&(a=t,i.type!=="labelLink")){r=2;break}}else i.type==="labelEnd"&&(o=t);const s={type:e[a][1].type==="labelLink"?"link":"image",start:{...e[a][1].start},end:{...e[e.length-1][1].end}},c={type:"label",start:{...e[a][1].start},end:{...e[o][1].end}},u={type:"labelText",start:{...e[a+r+2][1].end},end:{...e[o-2][1].start}};return l=[["enter",s,n],["enter",c,n]],l=re(l,e.slice(a+1,a+r+3)),l=re(l,[["enter",u,n]]),l=re(l,zn(n.parser.constructs.insideSpan.null,e.slice(a+r+4,o-3),n)),l=re(l,[["exit",u,n],e[o-2],e[o-1],["exit",c,n]]),l=re(l,e.slice(o+1)),l=re(l,[["exit",s,n]]),ce(e,a,e.length,l),e}function no(e,n,t){const r=this;let i=r.events.length,a,o;for(;i--;)if((r.events[i][1].type==="labelImage"||r.events[i][1].type==="labelLink")&&!r.events[i][1]._balanced){a=r.events[i][1];break}return l;function l(m){return a?a._inactive?h(m):(o=r.parser.defined.includes(Ie(r.sliceSerialize({start:a.end,end:r.now()}))),e.enter("labelEnd"),e.enter("labelMarker"),e.consume(m),e.exit("labelMarker"),e.exit("labelEnd"),s):t(m)}function s(m){return m===40?e.attempt(Xa,u,o?u:h)(m):m===91?e.attempt(Qa,u,o?c:h)(m):o?u(m):h(m)}function c(m){return e.attempt(Ja,u,h)(m)}function u(m){return n(m)}function h(m){return a._balanced=!0,t(m)}}function to(e,n,t){return r;function r(h){return e.enter("resource"),e.enter("resourceMarker"),e.consume(h),e.exit("resourceMarker"),i}function i(h){return J(h)?Oe(e,a)(h):a(h)}function a(h){return h===41?u(h):tr(e,o,l,"resourceDestination","resourceDestinationLiteral","resourceDestinationLiteralMarker","resourceDestinationRaw","resourceDestinationString",32)(h)}function o(h){return J(h)?Oe(e,s)(h):u(h)}function l(h){return t(h)}function s(h){return h===34||h===39||h===40?ir(e,c,t,"resourceTitle","resourceTitleMarker","resourceTitleString")(h):u(h)}function c(h){return J(h)?Oe(e,u)(h):u(h)}function u(h){return h===41?(e.enter("resourceMarker"),e.consume(h),e.exit("resourceMarker"),e.exit("resource"),n):t(h)}}function ro(e,n,t){const r=this;return i;function i(l){return rr.call(r,e,a,o,"reference","referenceMarker","referenceString")(l)}function a(l){return r.parser.defined.includes(Ie(r.sliceSerialize(r.events[r.events.length-1][1]).slice(1,-1)))?n(l):t(l)}function o(l){return t(l)}}function io(e,n,t){return r;function r(a){return e.enter("reference"),e.enter("referenceMarker"),e.consume(a),e.exit("referenceMarker"),i}function i(a){return a===93?(e.enter("referenceMarker"),e.consume(a),e.exit("referenceMarker"),e.exit("reference"),n):t(a)}}const ao={name:"labelStartImage",resolveAll:Bn.resolveAll,tokenize:oo};function oo(e,n,t){const r=this;return i;function i(l){return e.enter("labelImage"),e.enter("labelImageMarker"),e.consume(l),e.exit("labelImageMarker"),a}function a(l){return l===91?(e.enter("labelMarker"),e.consume(l),e.exit("labelMarker"),e.exit("labelImage"),o):t(l)}function o(l){return l===94&&"_hiddenFootnoteSupport"in r.parser.constructs?t(l):n(l)}}const lo={name:"labelStartLink",resolveAll:Bn.resolveAll,tokenize:so};function so(e,n,t){const r=this;return i;function i(o){return e.enter("labelLink"),e.enter("labelMarker"),e.consume(o),e.exit("labelMarker"),e.exit("labelLink"),a}function a(o){return o===94&&"_hiddenFootnoteSupport"in r.parser.constructs?t(o):n(o)}}const on={name:"lineEnding",tokenize:uo};function uo(e,n){return t;function t(r){return e.enter("lineEnding"),e.consume(r),e.exit("lineEnding"),_(e,n,"linePrefix")}}const Ge={name:"thematicBreak",tokenize:co};function co(e,n,t){let r=0,i;return a;function a(c){return e.enter("thematicBreak"),o(c)}function o(c){return i=c,l(c)}function l(c){return c===i?(e.enter("thematicBreakSequence"),s(c)):r>=3&&(c===null||I(c))?(e.exit("thematicBreak"),n(c)):t(c)}function s(c){return c===i?(e.consume(c),r++,s):(e.exit("thematicBreakSequence"),z(c)?_(e,l,"whitespace")(c):l(c))}}const Q={continuation:{tokenize:mo},exit:yo,name:"list",tokenize:fo},po={partial:!0,tokenize:xo},ho={partial:!0,tokenize:go};function fo(e,n,t){const r=this,i=r.events[r.events.length-1];let a=i&&i[1].type==="linePrefix"?i[2].sliceSerialize(i[1],!0).length:0,o=0;return l;function l(p){const y=r.containerState.type||(p===42||p===43||p===45?"listUnordered":"listOrdered");if(y==="listUnordered"?!r.containerState.marker||p===r.containerState.marker:wn(p)){if(r.containerState.type||(r.containerState.type=y,e.enter(y,{_container:!0})),y==="listUnordered")return e.enter("listItemPrefix"),p===42||p===45?e.check(Ge,t,c)(p):c(p);if(!r.interrupt||p===49)return e.enter("listItemPrefix"),e.enter("listItemValue"),s(p)}return t(p)}function s(p){return wn(p)&&++o<10?(e.consume(p),s):(!r.interrupt||o<2)&&(r.containerState.marker?p===r.containerState.marker:p===41||p===46)?(e.exit("listItemValue"),c(p)):t(p)}function c(p){return e.enter("listItemMarker"),e.consume(p),e.exit("listItemMarker"),r.containerState.marker=r.containerState.marker||p,e.check(Ze,r.interrupt?t:u,e.attempt(po,m,h))}function u(p){return r.containerState.initialBlankLine=!0,a++,m(p)}function h(p){return z(p)?(e.enter("listItemPrefixWhitespace"),e.consume(p),e.exit("listItemPrefixWhitespace"),m):t(p)}function m(p){return r.containerState.size=a+r.sliceSerialize(e.exit("listItemPrefix"),!0).length,n(p)}}function mo(e,n,t){const r=this;return r.containerState._closeFlow=void 0,e.check(Ze,i,a);function i(l){return r.containerState.furtherBlankLines=r.containerState.furtherBlankLines||r.containerState.initialBlankLine,_(e,n,"listItemIndent",r.containerState.size+1)(l)}function a(l){return r.containerState.furtherBlankLines||!z(l)?(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,o(l)):(r.containerState.furtherBlankLines=void 0,r.containerState.initialBlankLine=void 0,e.attempt(ho,n,o)(l))}function o(l){return r.containerState._closeFlow=!0,r.interrupt=void 0,_(e,e.attempt(Q,n,t),"linePrefix",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4)(l)}}function go(e,n,t){const r=this;return _(e,i,"listItemIndent",r.containerState.size+1);function i(a){const o=r.events[r.events.length-1];return o&&o[1].type==="listItemIndent"&&o[2].sliceSerialize(o[1],!0).length===r.containerState.size?n(a):t(a)}}function yo(e){e.exit(this.containerState.type)}function xo(e,n,t){const r=this;return _(e,i,"listItemPrefixWhitespace",r.parser.constructs.disable.null.includes("codeIndented")?void 0:4+1);function i(a){const o=r.events[r.events.length-1];return!z(a)&&o&&o[1].type==="listItemPrefixWhitespace"?n(a):t(a)}}const pt={name:"setextUnderline",resolveTo:bo,tokenize:wo};function bo(e,n){let t=e.length,r,i,a;for(;t--;)if(e[t][0]==="enter"){if(e[t][1].type==="content"){r=t;break}e[t][1].type==="paragraph"&&(i=t)}else e[t][1].type==="content"&&e.splice(t,1),!a&&e[t][1].type==="definition"&&(a=t);const o={type:"setextHeading",start:{...e[r][1].start},end:{...e[e.length-1][1].end}};return e[i][1].type="setextHeadingText",a?(e.splice(i,0,["enter",o,n]),e.splice(a+1,0,["exit",e[r][1],n]),e[r][1].end={...e[a][1].end}):e[r][1]=o,e.push(["exit",o,n]),e}function wo(e,n,t){const r=this;let i;return a;function a(c){let u=r.events.length,h;for(;u--;)if(r.events[u][1].type!=="lineEnding"&&r.events[u][1].type!=="linePrefix"&&r.events[u][1].type!=="content"){h=r.events[u][1].type==="paragraph";break}return!r.parser.lazy[r.now().line]&&(r.interrupt||h)?(e.enter("setextHeadingLine"),i=c,o(c)):t(c)}function o(c){return e.enter("setextHeadingLineSequence"),l(c)}function l(c){return c===i?(e.consume(c),l):(e.exit("setextHeadingLineSequence"),z(c)?_(e,s,"lineSuffix")(c):s(c))}function s(c){return c===null||I(c)?(e.exit("setextHeadingLine"),n(c)):t(c)}}const ko={tokenize:So};function So(e){const n=this,t=e.attempt(Ze,r,e.attempt(this.parser.constructs.flowInitial,i,_(e,e.attempt(this.parser.constructs.flow,i,e.attempt(Aa,i)),"linePrefix")));return t;function r(a){if(a===null){e.consume(a);return}return e.enter("lineEndingBlank"),e.consume(a),e.exit("lineEndingBlank"),n.currentConstruct=void 0,t}function i(a){if(a===null){e.consume(a);return}return e.enter("lineEnding"),e.consume(a),e.exit("lineEnding"),n.currentConstruct=void 0,t}}const vo={resolveAll:or()},Co=ar("string"),Eo=ar("text");function ar(e){return{resolveAll:or(e==="text"?Ao:void 0),tokenize:n};function n(t){const r=this,i=this.parser.constructs[e],a=t.attempt(i,o,l);return o;function o(u){return c(u)?a(u):l(u)}function l(u){if(u===null){t.consume(u);return}return t.enter("data"),t.consume(u),s}function s(u){return c(u)?(t.exit("data"),a(u)):(t.consume(u),s)}function c(u){if(u===null)return!0;const h=i[u];let m=-1;if(h)for(;++m<h.length;){const p=h[m];if(!p.previous||p.previous.call(r,r.previous))return!0}return!1}}}function or(e){return n;function n(t,r){let i=-1,a;for(;++i<=t.length;)a===void 0?t[i]&&t[i][1].type==="data"&&(a=i,i++):(!t[i]||t[i][1].type!=="data")&&(i!==a+2&&(t[a][1].end=t[i-1][1].end,t.splice(a+2,i-a-2),i=a+2),a=void 0);return e?e(t,r):t}}function Ao(e,n){let t=0;for(;++t<=e.length;)if((t===e.length||e[t][1].type==="lineEnding")&&e[t-1][1].type==="data"){const r=e[t-1][1],i=n.sliceStream(r);let a=i.length,o=-1,l=0,s;for(;a--;){const c=i[a];if(typeof c=="string"){for(o=c.length;c.charCodeAt(o-1)===32;)l++,o--;if(o)break;o=-1}else if(c===-2)s=!0,l++;else if(c!==-1){a++;break}}if(n._contentTypeTextTrailing&&t===e.length&&(l=0),l){const c={type:t===e.length||s||l<2?"lineSuffix":"hardBreakTrailing",start:{_bufferIndex:a?o:r.start._bufferIndex+o,_index:r.start._index+a,line:r.end.line,column:r.end.column-l,offset:r.end.offset-l},end:{...r.end}};r.end={...c.start},r.start.offset===r.end.offset?Object.assign(r,c):(e.splice(t,0,["enter",c,n],["exit",c,n]),t+=2)}t++}return e}const Io={42:Q,43:Q,45:Q,48:Q,49:Q,50:Q,51:Q,52:Q,53:Q,54:Q,55:Q,56:Q,57:Q,62:Jt},To={91:Ma},Po={[-2]:an,[-1]:an,32:an},Lo={35:Oa,42:Ge,45:[pt,Ge],60:ja,61:pt,95:Ge,96:ut,126:ut},Mo={38:er,92:Zt},Do={[-5]:on,[-4]:on,[-3]:on,33:ao,38:er,42:kn,60:[la,Ya],91:lo,92:[Na,Zt],93:Bn,95:kn,96:wa},zo={null:[kn,vo]},Bo={null:[42,95]},No={null:[]},Ro=Object.freeze(Object.defineProperty({__proto__:null,attentionMarkers:Bo,contentInitial:To,disable:No,document:Io,flow:Lo,flowInitial:Po,insideSpan:zo,string:Mo,text:Do},Symbol.toStringTag,{value:"Module"}));function Oo(e,n,t){let r={_bufferIndex:-1,_index:0,line:t&&t.line||1,column:t&&t.column||1,offset:t&&t.offset||0};const i={},a=[];let o=[],l=[];const s={attempt:N(V),check:N(x),consume:L,enter:v,exit:j,interrupt:N(x,{interrupt:!0})},c={code:null,containerState:{},defineSkip:w,events:[],now:y,parser:e,previous:null,sliceSerialize:m,sliceStream:p,write:h};let u=n.tokenize.call(c,s);return n.resolveAll&&a.push(n),c;function h(E){return o=re(o,E),A(),o[o.length-1]!==null?[]:(W(n,0),c.events=zn(a,c.events,c),c.events)}function m(E,C){return _o(p(E),C)}function p(E){return Fo(o,E)}function y(){const{_bufferIndex:E,_index:C,line:U,column:q,offset:D}=r;return{_bufferIndex:E,_index:C,line:U,column:q,offset:D}}function w(E){i[E.line]=E.column,H()}function A(){let E;for(;r._index<o.length;){const C=o[r._index];if(typeof C=="string")for(E=r._index,r._bufferIndex<0&&(r._bufferIndex=0);r._index===E&&r._bufferIndex<C.length;)k(C.charCodeAt(r._bufferIndex));else k(C)}}function k(E){u=u(E)}function L(E){I(E)?(r.line++,r.column=1,r.offset+=E===-3?2:1,H()):E!==-1&&(r.column++,r.offset++),r._bufferIndex<0?r._index++:(r._bufferIndex++,r._bufferIndex===o[r._index].length&&(r._bufferIndex=-1,r._index++)),c.previous=E}function v(E,C){const U=C||{};return U.type=E,U.start=y(),c.events.push(["enter",U,c]),l.push(U),U}function j(E){const C=l.pop();return C.end=y(),c.events.push(["exit",C,c]),C}function V(E,C){W(E,C.from)}function x(E,C){C.restore()}function N(E,C){return U;function U(q,D,$){let K,ie,pe,f;return Array.isArray(q)?he(q):"tokenize"in q?he([q]):ae(q);function ae(Y){return Le;function Le(me){const Se=me!==null&&Y[me],ve=me!==null&&Y.null,Ue=[...Array.isArray(Se)?Se:Se?[Se]:[],...Array.isArray(ve)?ve:ve?[ve]:[]];return he(Ue)(me)}}function he(Y){return K=Y,ie=0,Y.length===0?$:d(Y[ie])}function d(Y){return Le;function Le(me){return f=R(),pe=Y,Y.partial||(c.currentConstruct=Y),Y.name&&c.parser.constructs.disable.null.includes(Y.name)?xe():Y.tokenize.call(C?Object.assign(Object.create(c),C):c,s,oe,xe)(me)}}function oe(Y){return E(pe,f),D}function xe(Y){return f.restore(),++ie<K.length?d(K[ie]):$}}}function W(E,C){E.resolveAll&&!a.includes(E)&&a.push(E),E.resolve&&ce(c.events,C,c.events.length-C,E.resolve(c.events.slice(C),c)),E.resolveTo&&(c.events=E.resolveTo(c.events,c))}function R(){const E=y(),C=c.previous,U=c.currentConstruct,q=c.events.length,D=Array.from(l);return{from:q,restore:$};function $(){r=E,c.previous=C,c.currentConstruct=U,c.events.length=q,l=D,H()}}function H(){r.line in i&&r.column<2&&(r.column=i[r.line],r.offset+=i[r.line]-1)}}function Fo(e,n){const t=n.start._index,r=n.start._bufferIndex,i=n.end._index,a=n.end._bufferIndex;let o;if(t===i)o=[e[t].slice(r,a)];else{if(o=e.slice(t,i),r>-1){const l=o[0];typeof l=="string"?o[0]=l.slice(r):o.shift()}a>0&&o.push(e[i].slice(0,a))}return o}function _o(e,n){let t=-1;const r=[];let i;for(;++t<e.length;){const a=e[t];let o;if(typeof a=="string")o=a;else switch(a){case-5:{o="\r";break}case-4:{o=`
`;break}case-3:{o=`\r
`;break}case-2:{o=n?" ":"	";break}case-1:{if(!n&&i)continue;o=" ";break}default:o=String.fromCharCode(a)}i=a===-2,r.push(o)}return r.join("")}function Ho(e){const r={constructs:Gi([Ro,...(e||{}).extensions||[]]),content:i(ea),defined:[],document:i(ta),flow:i(ko),lazy:{},string:i(Co),text:i(Eo)};return r;function i(a){return o;function o(l){return Oo(r,a,l)}}}function jo(e){for(;!nr(e););return e}const ht=/[\0\t\n\r]/g;function Uo(){let e=1,n="",t=!0,r;return i;function i(a,o,l){const s=[];let c,u,h,m,p;for(a=n+(typeof a=="string"?a.toString():new TextDecoder(o||void 0).decode(a)),h=0,n="",t&&(a.charCodeAt(0)===65279&&h++,t=void 0);h<a.length;){if(ht.lastIndex=h,c=ht.exec(a),m=c&&c.index!==void 0?c.index:a.length,p=a.charCodeAt(m),!c){n=a.slice(h);break}if(p===10&&h===m&&r)s.push(-3),r=void 0;else switch(r&&(s.push(-5),r=void 0),h<m&&(s.push(a.slice(h,m)),e+=m-h),p){case 0:{s.push(65533),e++;break}case 9:{for(u=Math.ceil(e/4)*4,s.push(-2);e++<u;)s.push(-1);break}case 10:{s.push(-4),e=1;break}default:r=!0,e=1}h=m+1}return l&&(r&&s.push(-5),n&&s.push(n),s.push(null)),s}}const Vo=/\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;function Wo(e){return e.replace(Vo,qo)}function qo(e,n,t){if(n)return n;if(t.charCodeAt(0)===35){const i=t.charCodeAt(1),a=i===120||i===88;return Qt(t.slice(a?2:1),a?16:10)}return Dn(t)||e}const lr={}.hasOwnProperty;function Go(e,n,t){return typeof n!="string"&&(t=n,n=void 0),Ko(t)(jo(Ho(t).document().write(Uo()(e,n,!0))))}function Ko(e){const n={transforms:[],canContainEols:["emphasis","fragment","heading","paragraph","strong"],enter:{autolink:a(Vn),autolinkProtocol:R,autolinkEmail:R,atxHeading:a(Hn),blockQuote:a(ve),characterEscape:R,characterReference:R,codeFenced:a(Ue),codeFencedFenceInfo:o,codeFencedFenceMeta:o,codeIndented:a(Ue,o),codeText:a(br,o),codeTextData:R,data:R,codeFlowValue:R,definition:a(wr),definitionDestinationString:o,definitionLabelString:o,definitionTitleString:o,emphasis:a(kr),hardBreakEscape:a(jn),hardBreakTrailing:a(jn),htmlFlow:a(Un,o),htmlFlowData:R,htmlText:a(Un,o),htmlTextData:R,image:a(Sr),label:o,link:a(Vn),listItem:a(vr),listItemValue:m,listOrdered:a(Wn,h),listUnordered:a(Wn),paragraph:a(Cr),reference:d,referenceString:o,resourceDestinationString:o,resourceTitleString:o,setextHeading:a(Hn),strong:a(Er),thematicBreak:a(Ir)},exit:{atxHeading:s(),atxHeadingSequence:V,autolink:s(),autolinkEmail:Se,autolinkProtocol:me,blockQuote:s(),characterEscapeValue:H,characterReferenceMarkerHexadecimal:xe,characterReferenceMarkerNumeric:xe,characterReferenceValue:Y,characterReference:Le,codeFenced:s(A),codeFencedFence:w,codeFencedFenceInfo:p,codeFencedFenceMeta:y,codeFlowValue:H,codeIndented:s(k),codeText:s(D),codeTextData:H,data:H,definition:s(),definitionDestinationString:j,definitionLabelString:L,definitionTitleString:v,emphasis:s(),hardBreakEscape:s(C),hardBreakTrailing:s(C),htmlFlow:s(U),htmlFlowData:H,htmlText:s(q),htmlTextData:H,image:s(K),label:pe,labelText:ie,lineEnding:E,link:s($),listItem:s(),listOrdered:s(),listUnordered:s(),paragraph:s(),referenceString:oe,resourceDestinationString:f,resourceTitleString:ae,resource:he,setextHeading:s(W),setextHeadingLineSequence:N,setextHeadingText:x,strong:s(),thematicBreak:s()}};sr(n,(e||{}).mdastExtensions||[]);const t={};return r;function r(g){let S={type:"root",children:[]};const T={stack:[S],tokenStack:[],config:n,enter:l,exit:c,buffer:o,resume:u,data:t},M=[];let O=-1;for(;++O<g.length;)if(g[O][1].type==="listOrdered"||g[O][1].type==="listUnordered")if(g[O][0]==="enter")M.push(O);else{const le=M.pop();O=i(g,le,O)}for(O=-1;++O<g.length;){const le=n[g[O][0]];lr.call(le,g[O][1].type)&&le[g[O][1].type].call(Object.assign({sliceSerialize:g[O][2].sliceSerialize},T),g[O][1])}if(T.tokenStack.length>0){const le=T.tokenStack[T.tokenStack.length-1];(le[1]||ft).call(T,void 0,le[0])}for(S.position={start:ge(g.length>0?g[0][1].start:{line:1,column:1,offset:0}),end:ge(g.length>0?g[g.length-2][1].end:{line:1,column:1,offset:0})},O=-1;++O<n.transforms.length;)S=n.transforms[O](S)||S;return S}function i(g,S,T){let M=S-1,O=-1,le=!1,be,fe,Me,De;for(;++M<=T;){const ee=g[M];switch(ee[1].type){case"listUnordered":case"listOrdered":case"blockQuote":{ee[0]==="enter"?O++:O--,De=void 0;break}case"lineEndingBlank":{ee[0]==="enter"&&(be&&!De&&!O&&!Me&&(Me=M),De=void 0);break}case"linePrefix":case"listItemValue":case"listItemMarker":case"listItemPrefix":case"listItemPrefixWhitespace":break;default:De=void 0}if(!O&&ee[0]==="enter"&&ee[1].type==="listItemPrefix"||O===-1&&ee[0]==="exit"&&(ee[1].type==="listUnordered"||ee[1].type==="listOrdered")){if(be){let Ce=M;for(fe=void 0;Ce--;){const de=g[Ce];if(de[1].type==="lineEnding"||de[1].type==="lineEndingBlank"){if(de[0]==="exit")continue;fe&&(g[fe][1].type="lineEndingBlank",le=!0),de[1].type="lineEnding",fe=Ce}else if(!(de[1].type==="linePrefix"||de[1].type==="blockQuotePrefix"||de[1].type==="blockQuotePrefixWhitespace"||de[1].type==="blockQuoteMarker"||de[1].type==="listItemIndent"))break}Me&&(!fe||Me<fe)&&(be._spread=!0),be.end=Object.assign({},fe?g[fe][1].start:ee[1].end),g.splice(fe||M,0,["exit",be,ee[2]]),M++,T++}if(ee[1].type==="listItemPrefix"){const Ce={type:"listItem",_spread:!1,start:Object.assign({},ee[1].start),end:void 0};be=Ce,g.splice(M,0,["enter",Ce,ee[2]]),M++,T++,Me=void 0,De=!0}}}return g[S][1]._spread=le,T}function a(g,S){return T;function T(M){l.call(this,g(M),M),S&&S.call(this,M)}}function o(){this.stack.push({type:"fragment",children:[]})}function l(g,S,T){this.stack[this.stack.length-1].children.push(g),this.stack.push(g),this.tokenStack.push([S,T||void 0]),g.position={start:ge(S.start),end:void 0}}function s(g){return S;function S(T){g&&g.call(this,T),c.call(this,T)}}function c(g,S){const T=this.stack.pop(),M=this.tokenStack.pop();if(M)M[0].type!==g.type&&(S?S.call(this,g,M[0]):(M[1]||ft).call(this,g,M[0]));else throw new Error("Cannot close `"+g.type+"` ("+Re({start:g.start,end:g.end})+"): it’s not open");T.position.end=ge(g.end)}function u(){return Wi(this.stack.pop())}function h(){this.data.expectingFirstListItemValue=!0}function m(g){if(this.data.expectingFirstListItemValue){const S=this.stack[this.stack.length-2];S.start=Number.parseInt(this.sliceSerialize(g),10),this.data.expectingFirstListItemValue=void 0}}function p(){const g=this.resume(),S=this.stack[this.stack.length-1];S.lang=g}function y(){const g=this.resume(),S=this.stack[this.stack.length-1];S.meta=g}function w(){this.data.flowCodeInside||(this.buffer(),this.data.flowCodeInside=!0)}function A(){const g=this.resume(),S=this.stack[this.stack.length-1];S.value=g.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g,""),this.data.flowCodeInside=void 0}function k(){const g=this.resume(),S=this.stack[this.stack.length-1];S.value=g.replace(/(\r?\n|\r)$/g,"")}function L(g){const S=this.resume(),T=this.stack[this.stack.length-1];T.label=S,T.identifier=Ie(this.sliceSerialize(g)).toLowerCase()}function v(){const g=this.resume(),S=this.stack[this.stack.length-1];S.title=g}function j(){const g=this.resume(),S=this.stack[this.stack.length-1];S.url=g}function V(g){const S=this.stack[this.stack.length-1];if(!S.depth){const T=this.sliceSerialize(g).length;S.depth=T}}function x(){this.data.setextHeadingSlurpLineEnding=!0}function N(g){const S=this.stack[this.stack.length-1];S.depth=this.sliceSerialize(g).codePointAt(0)===61?1:2}function W(){this.data.setextHeadingSlurpLineEnding=void 0}function R(g){const T=this.stack[this.stack.length-1].children;let M=T[T.length-1];(!M||M.type!=="text")&&(M=Ar(),M.position={start:ge(g.start),end:void 0},T.push(M)),this.stack.push(M)}function H(g){const S=this.stack.pop();S.value+=this.sliceSerialize(g),S.position.end=ge(g.end)}function E(g){const S=this.stack[this.stack.length-1];if(this.data.atHardBreak){const T=S.children[S.children.length-1];T.position.end=ge(g.end),this.data.atHardBreak=void 0;return}!this.data.setextHeadingSlurpLineEnding&&n.canContainEols.includes(S.type)&&(R.call(this,g),H.call(this,g))}function C(){this.data.atHardBreak=!0}function U(){const g=this.resume(),S=this.stack[this.stack.length-1];S.value=g}function q(){const g=this.resume(),S=this.stack[this.stack.length-1];S.value=g}function D(){const g=this.resume(),S=this.stack[this.stack.length-1];S.value=g}function $(){const g=this.stack[this.stack.length-1];if(this.data.inReference){const S=this.data.referenceType||"shortcut";g.type+="Reference",g.referenceType=S,delete g.url,delete g.title}else delete g.identifier,delete g.label;this.data.referenceType=void 0}function K(){const g=this.stack[this.stack.length-1];if(this.data.inReference){const S=this.data.referenceType||"shortcut";g.type+="Reference",g.referenceType=S,delete g.url,delete g.title}else delete g.identifier,delete g.label;this.data.referenceType=void 0}function ie(g){const S=this.sliceSerialize(g),T=this.stack[this.stack.length-2];T.label=Wo(S),T.identifier=Ie(S).toLowerCase()}function pe(){const g=this.stack[this.stack.length-1],S=this.resume(),T=this.stack[this.stack.length-1];if(this.data.inReference=!0,T.type==="link"){const M=g.children;T.children=M}else T.alt=S}function f(){const g=this.resume(),S=this.stack[this.stack.length-1];S.url=g}function ae(){const g=this.resume(),S=this.stack[this.stack.length-1];S.title=g}function he(){this.data.inReference=void 0}function d(){this.data.referenceType="collapsed"}function oe(g){const S=this.resume(),T=this.stack[this.stack.length-1];T.label=S,T.identifier=Ie(this.sliceSerialize(g)).toLowerCase(),this.data.referenceType="full"}function xe(g){this.data.characterReferenceType=g.type}function Y(g){const S=this.sliceSerialize(g),T=this.data.characterReferenceType;let M;T?(M=Qt(S,T==="characterReferenceMarkerNumeric"?10:16),this.data.characterReferenceType=void 0):M=Dn(S);const O=this.stack[this.stack.length-1];O.value+=M}function Le(g){const S=this.stack.pop();S.position.end=ge(g.end)}function me(g){H.call(this,g);const S=this.stack[this.stack.length-1];S.url=this.sliceSerialize(g)}function Se(g){H.call(this,g);const S=this.stack[this.stack.length-1];S.url="mailto:"+this.sliceSerialize(g)}function ve(){return{type:"blockquote",children:[]}}function Ue(){return{type:"code",lang:null,meta:null,value:""}}function br(){return{type:"inlineCode",value:""}}function wr(){return{type:"definition",identifier:"",label:null,title:null,url:""}}function kr(){return{type:"emphasis",children:[]}}function Hn(){return{type:"heading",depth:0,children:[]}}function jn(){return{type:"break"}}function Un(){return{type:"html",value:""}}function Sr(){return{type:"image",title:null,url:"",alt:null}}function Vn(){return{type:"link",title:null,url:"",children:[]}}function Wn(g){return{type:"list",ordered:g.type==="listOrdered",start:null,spread:g._spread,children:[]}}function vr(g){return{type:"listItem",spread:g._spread,checked:null,children:[]}}function Cr(){return{type:"paragraph",children:[]}}function Er(){return{type:"strong",children:[]}}function Ar(){return{type:"text",value:""}}function Ir(){return{type:"thematicBreak"}}}function ge(e){return{line:e.line,column:e.column,offset:e.offset}}function sr(e,n){let t=-1;for(;++t<n.length;){const r=n[t];Array.isArray(r)?sr(e,r):Yo(e,r)}}function Yo(e,n){let t;for(t in n)if(lr.call(n,t))switch(t){case"canContainEols":{const r=n[t];r&&e[t].push(...r);break}case"transforms":{const r=n[t];r&&e[t].push(...r);break}case"enter":case"exit":{const r=n[t];r&&Object.assign(e[t],r);break}}}function ft(e,n){throw e?new Error("Cannot close `"+e.type+"` ("+Re({start:e.start,end:e.end})+"): a different token (`"+n.type+"`, "+Re({start:n.start,end:n.end})+") is open"):new Error("Cannot close document, a token (`"+n.type+"`, "+Re({start:n.start,end:n.end})+") is still open")}function $o(e){const n=this;n.parser=t;function t(r){return Go(r,{...n.data("settings"),...e,extensions:n.data("micromarkExtensions")||[],mdastExtensions:n.data("fromMarkdownExtensions")||[]})}}function Xo(e,n){const t={type:"element",tagName:"blockquote",properties:{},children:e.wrap(e.all(n),!0)};return e.patch(n,t),e.applyData(n,t)}function Qo(e,n){const t={type:"element",tagName:"br",properties:{},children:[]};return e.patch(n,t),[e.applyData(n,t),{type:"text",value:`
`}]}function Jo(e,n){const t=n.value?n.value+`
`:"",r={};n.lang&&(r.className=["language-"+n.lang]);let i={type:"element",tagName:"code",properties:r,children:[{type:"text",value:t}]};return n.meta&&(i.data={meta:n.meta}),e.patch(n,i),i=e.applyData(n,i),i={type:"element",tagName:"pre",properties:{},children:[i]},e.patch(n,i),i}function Zo(e,n){const t={type:"element",tagName:"del",properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}function el(e,n){const t={type:"element",tagName:"em",properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}function nl(e,n){const t=typeof e.options.clobberPrefix=="string"?e.options.clobberPrefix:"user-content-",r=String(n.identifier).toUpperCase(),i=Pe(r.toLowerCase()),a=e.footnoteOrder.indexOf(r);let o,l=e.footnoteCounts.get(r);l===void 0?(l=0,e.footnoteOrder.push(r),o=e.footnoteOrder.length):o=a+1,l+=1,e.footnoteCounts.set(r,l);const s={type:"element",tagName:"a",properties:{href:"#"+t+"fn-"+i,id:t+"fnref-"+i+(l>1?"-"+l:""),dataFootnoteRef:!0,ariaDescribedBy:["footnote-label"]},children:[{type:"text",value:String(o)}]};e.patch(n,s);const c={type:"element",tagName:"sup",properties:{},children:[s]};return e.patch(n,c),e.applyData(n,c)}function tl(e,n){const t={type:"element",tagName:"h"+n.depth,properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}function rl(e,n){if(e.options.allowDangerousHtml){const t={type:"raw",value:n.value};return e.patch(n,t),e.applyData(n,t)}}function ur(e,n){const t=n.referenceType;let r="]";if(t==="collapsed"?r+="[]":t==="full"&&(r+="["+(n.label||n.identifier)+"]"),n.type==="imageReference")return[{type:"text",value:"!["+n.alt+r}];const i=e.all(n),a=i[0];a&&a.type==="text"?a.value="["+a.value:i.unshift({type:"text",value:"["});const o=i[i.length-1];return o&&o.type==="text"?o.value+=r:i.push({type:"text",value:r}),i}function il(e,n){const t=String(n.identifier).toUpperCase(),r=e.definitionById.get(t);if(!r)return ur(e,n);const i={src:Pe(r.url||""),alt:n.alt};r.title!==null&&r.title!==void 0&&(i.title=r.title);const a={type:"element",tagName:"img",properties:i,children:[]};return e.patch(n,a),e.applyData(n,a)}function al(e,n){const t={src:Pe(n.url)};n.alt!==null&&n.alt!==void 0&&(t.alt=n.alt),n.title!==null&&n.title!==void 0&&(t.title=n.title);const r={type:"element",tagName:"img",properties:t,children:[]};return e.patch(n,r),e.applyData(n,r)}function ol(e,n){const t={type:"text",value:n.value.replace(/\r?\n|\r/g," ")};e.patch(n,t);const r={type:"element",tagName:"code",properties:{},children:[t]};return e.patch(n,r),e.applyData(n,r)}function ll(e,n){const t=String(n.identifier).toUpperCase(),r=e.definitionById.get(t);if(!r)return ur(e,n);const i={href:Pe(r.url||"")};r.title!==null&&r.title!==void 0&&(i.title=r.title);const a={type:"element",tagName:"a",properties:i,children:e.all(n)};return e.patch(n,a),e.applyData(n,a)}function sl(e,n){const t={href:Pe(n.url)};n.title!==null&&n.title!==void 0&&(t.title=n.title);const r={type:"element",tagName:"a",properties:t,children:e.all(n)};return e.patch(n,r),e.applyData(n,r)}function ul(e,n,t){const r=e.all(n),i=t?cl(t):cr(n),a={},o=[];if(typeof n.checked=="boolean"){const u=r[0];let h;u&&u.type==="element"&&u.tagName==="p"?h=u:(h={type:"element",tagName:"p",properties:{},children:[]},r.unshift(h)),h.children.length>0&&h.children.unshift({type:"text",value:" "}),h.children.unshift({type:"element",tagName:"input",properties:{type:"checkbox",checked:n.checked,disabled:!0},children:[]}),a.className=["task-list-item"]}let l=-1;for(;++l<r.length;){const u=r[l];(i||l!==0||u.type!=="element"||u.tagName!=="p")&&o.push({type:"text",value:`
`}),u.type==="element"&&u.tagName==="p"&&!i?o.push(...u.children):o.push(u)}const s=r[r.length-1];s&&(i||s.type!=="element"||s.tagName!=="p")&&o.push({type:"text",value:`
`});const c={type:"element",tagName:"li",properties:a,children:o};return e.patch(n,c),e.applyData(n,c)}function cl(e){let n=!1;if(e.type==="list"){n=e.spread||!1;const t=e.children;let r=-1;for(;!n&&++r<t.length;)n=cr(t[r])}return n}function cr(e){const n=e.spread;return n??e.children.length>1}function pl(e,n){const t={},r=e.all(n);let i=-1;for(typeof n.start=="number"&&n.start!==1&&(t.start=n.start);++i<r.length;){const o=r[i];if(o.type==="element"&&o.tagName==="li"&&o.properties&&Array.isArray(o.properties.className)&&o.properties.className.includes("task-list-item")){t.className=["contains-task-list"];break}}const a={type:"element",tagName:n.ordered?"ol":"ul",properties:t,children:e.wrap(r,!0)};return e.patch(n,a),e.applyData(n,a)}function hl(e,n){const t={type:"element",tagName:"p",properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}function fl(e,n){const t={type:"root",children:e.wrap(e.all(n))};return e.patch(n,t),e.applyData(n,t)}function dl(e,n){const t={type:"element",tagName:"strong",properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}function ml(e,n){const t=e.all(n),r=t.shift(),i=[];if(r){const o={type:"element",tagName:"thead",properties:{},children:e.wrap([r],!0)};e.patch(n.children[0],o),i.push(o)}if(t.length>0){const o={type:"element",tagName:"tbody",properties:{},children:e.wrap(t,!0)},l=Tn(n.children[1]),s=Wt(n.children[n.children.length-1]);l&&s&&(o.position={start:l,end:s}),i.push(o)}const a={type:"element",tagName:"table",properties:{},children:e.wrap(i,!0)};return e.patch(n,a),e.applyData(n,a)}function gl(e,n,t){const r=t?t.children:void 0,a=(r?r.indexOf(n):1)===0?"th":"td",o=t&&t.type==="table"?t.align:void 0,l=o?o.length:n.children.length;let s=-1;const c=[];for(;++s<l;){const h=n.children[s],m={},p=o?o[s]:void 0;p&&(m.align=p);let y={type:"element",tagName:a,properties:m,children:[]};h&&(y.children=e.all(h),e.patch(h,y),y=e.applyData(h,y)),c.push(y)}const u={type:"element",tagName:"tr",properties:{},children:e.wrap(c,!0)};return e.patch(n,u),e.applyData(n,u)}function yl(e,n){const t={type:"element",tagName:"td",properties:{},children:e.all(n)};return e.patch(n,t),e.applyData(n,t)}const dt=9,mt=32;function xl(e){const n=String(e),t=/\r?\n|\r/g;let r=t.exec(n),i=0;const a=[];for(;r;)a.push(gt(n.slice(i,r.index),i>0,!0),r[0]),i=r.index+r[0].length,r=t.exec(n);return a.push(gt(n.slice(i),i>0,!1)),a.join("")}function gt(e,n,t){let r=0,i=e.length;if(n){let a=e.codePointAt(r);for(;a===dt||a===mt;)r++,a=e.codePointAt(r)}if(t){let a=e.codePointAt(i-1);for(;a===dt||a===mt;)i--,a=e.codePointAt(i-1)}return i>r?e.slice(r,i):""}function bl(e,n){const t={type:"text",value:xl(String(n.value))};return e.patch(n,t),e.applyData(n,t)}function wl(e,n){const t={type:"element",tagName:"hr",properties:{},children:[]};return e.patch(n,t),e.applyData(n,t)}const kl={blockquote:Xo,break:Qo,code:Jo,delete:Zo,emphasis:el,footnoteReference:nl,heading:tl,html:rl,imageReference:il,image:al,inlineCode:ol,linkReference:ll,link:sl,listItem:ul,list:pl,paragraph:hl,root:fl,strong:dl,table:ml,tableCell:yl,tableRow:gl,text:bl,thematicBreak:wl,toml:Ve,yaml:Ve,definition:Ve,footnoteDefinition:Ve};function Ve(){}const pr=-1,en=0,Fe=1,Xe=2,Nn=3,Rn=4,On=5,Fn=6,hr=7,fr=8,yt=typeof self=="object"?self:globalThis,Sl=(e,n)=>{const t=(i,a)=>(e.set(a,i),i),r=i=>{if(e.has(i))return e.get(i);const[a,o]=n[i];switch(a){case en:case pr:return t(o,i);case Fe:{const l=t([],i);for(const s of o)l.push(r(s));return l}case Xe:{const l=t({},i);for(const[s,c]of o)l[r(s)]=r(c);return l}case Nn:return t(new Date(o),i);case Rn:{const{source:l,flags:s}=o;return t(new RegExp(l,s),i)}case On:{const l=t(new Map,i);for(const[s,c]of o)l.set(r(s),r(c));return l}case Fn:{const l=t(new Set,i);for(const s of o)l.add(r(s));return l}case hr:{const{name:l,message:s}=o;return t(new yt[l](s),i)}case fr:return t(BigInt(o),i);case"BigInt":return t(Object(BigInt(o)),i);case"ArrayBuffer":return t(new Uint8Array(o).buffer,o);case"DataView":{const{buffer:l}=new Uint8Array(o);return t(new DataView(l),o)}}return t(new yt[a](o),i)};return r},xt=e=>Sl(new Map,e)(0),Ee="",{toString:vl}={},{keys:Cl}=Object,Ne=e=>{const n=typeof e;if(n!=="object"||!e)return[en,n];const t=vl.call(e).slice(8,-1);switch(t){case"Array":return[Fe,Ee];case"Object":return[Xe,Ee];case"Date":return[Nn,Ee];case"RegExp":return[Rn,Ee];case"Map":return[On,Ee];case"Set":return[Fn,Ee];case"DataView":return[Fe,t]}return t.includes("Array")?[Fe,t]:t.includes("Error")?[hr,t]:[Xe,t]},We=([e,n])=>e===en&&(n==="function"||n==="symbol"),El=(e,n,t,r)=>{const i=(o,l)=>{const s=r.push(o)-1;return t.set(l,s),s},a=o=>{if(t.has(o))return t.get(o);let[l,s]=Ne(o);switch(l){case en:{let u=o;switch(s){case"bigint":l=fr,u=o.toString();break;case"function":case"symbol":if(e)throw new TypeError("unable to serialize "+s);u=null;break;case"undefined":return i([pr],o)}return i([l,u],o)}case Fe:{if(s){let m=o;return s==="DataView"?m=new Uint8Array(o.buffer):s==="ArrayBuffer"&&(m=new Uint8Array(o)),i([s,[...m]],o)}const u=[],h=i([l,u],o);for(const m of o)u.push(a(m));return h}case Xe:{if(s)switch(s){case"BigInt":return i([s,o.toString()],o);case"Boolean":case"Number":case"String":return i([s,o.valueOf()],o)}if(n&&"toJSON"in o)return a(o.toJSON());const u=[],h=i([l,u],o);for(const m of Cl(o))(e||!We(Ne(o[m])))&&u.push([a(m),a(o[m])]);return h}case Nn:return i([l,o.toISOString()],o);case Rn:{const{source:u,flags:h}=o;return i([l,{source:u,flags:h}],o)}case On:{const u=[],h=i([l,u],o);for(const[m,p]of o)(e||!(We(Ne(m))||We(Ne(p))))&&u.push([a(m),a(p)]);return h}case Fn:{const u=[],h=i([l,u],o);for(const m of o)(e||!We(Ne(m)))&&u.push(a(m));return h}}const{message:c}=o;return i([l,{name:s,message:c}],o)};return a},bt=(e,{json:n,lossy:t}={})=>{const r=[];return El(!(n||t),!!n,new Map,r)(e),r},Qe=typeof structuredClone=="function"?(e,n)=>n&&("json"in n||"lossy"in n)?xt(bt(e,n)):structuredClone(e):(e,n)=>xt(bt(e,n));function Al(e,n){const t=[{type:"text",value:"↩"}];return n>1&&t.push({type:"element",tagName:"sup",properties:{},children:[{type:"text",value:String(n)}]}),t}function Il(e,n){return"Back to reference "+(e+1)+(n>1?"-"+n:"")}function Tl(e){const n=typeof e.options.clobberPrefix=="string"?e.options.clobberPrefix:"user-content-",t=e.options.footnoteBackContent||Al,r=e.options.footnoteBackLabel||Il,i=e.options.footnoteLabel||"Footnotes",a=e.options.footnoteLabelTagName||"h2",o=e.options.footnoteLabelProperties||{className:["sr-only"]},l=[];let s=-1;for(;++s<e.footnoteOrder.length;){const c=e.footnoteById.get(e.footnoteOrder[s]);if(!c)continue;const u=e.all(c),h=String(c.identifier).toUpperCase(),m=Pe(h.toLowerCase());let p=0;const y=[],w=e.footnoteCounts.get(h);for(;w!==void 0&&++p<=w;){y.length>0&&y.push({type:"text",value:" "});let L=typeof t=="string"?t:t(s,p);typeof L=="string"&&(L={type:"text",value:L}),y.push({type:"element",tagName:"a",properties:{href:"#"+n+"fnref-"+m+(p>1?"-"+p:""),dataFootnoteBackref:"",ariaLabel:typeof r=="string"?r:r(s,p),className:["data-footnote-backref"]},children:Array.isArray(L)?L:[L]})}const A=u[u.length-1];if(A&&A.type==="element"&&A.tagName==="p"){const L=A.children[A.children.length-1];L&&L.type==="text"?L.value+=" ":A.children.push({type:"text",value:" "}),A.children.push(...y)}else u.push(...y);const k={type:"element",tagName:"li",properties:{id:n+"fn-"+m},children:e.wrap(u,!0)};e.patch(c,k),l.push(k)}if(l.length!==0)return{type:"element",tagName:"section",properties:{dataFootnotes:!0,className:["footnotes"]},children:[{type:"element",tagName:a,properties:{...Qe(o),id:"footnote-label"},children:[{type:"text",value:i}]},{type:"text",value:`
`},{type:"element",tagName:"ol",properties:{},children:e.wrap(l,!0)},{type:"text",value:`
`}]}}const dr=function(e){if(e==null)return Dl;if(typeof e=="function")return nn(e);if(typeof e=="object")return Array.isArray(e)?Pl(e):Ll(e);if(typeof e=="string")return Ml(e);throw new Error("Expected function, string, or object as test")};function Pl(e){const n=[];let t=-1;for(;++t<e.length;)n[t]=dr(e[t]);return nn(r);function r(...i){let a=-1;for(;++a<n.length;)if(n[a].apply(this,i))return!0;return!1}}function Ll(e){const n=e;return nn(t);function t(r){const i=r;let a;for(a in e)if(i[a]!==n[a])return!1;return!0}}function Ml(e){return nn(n);function n(t){return t&&t.type===e}}function nn(e){return n;function n(t,r,i){return!!(zl(t)&&e.call(this,t,typeof r=="number"?r:void 0,i||void 0))}}function Dl(){return!0}function zl(e){return e!==null&&typeof e=="object"&&"type"in e}const mr=[],Bl=!0,wt=!1,Nl="skip";function Rl(e,n,t,r){let i;typeof n=="function"&&typeof t!="function"?(r=t,t=n):i=n;const a=dr(i),o=r?-1:1;l(e,void 0,[])();function l(s,c,u){const h=s&&typeof s=="object"?s:{};if(typeof h.type=="string"){const p=typeof h.tagName=="string"?h.tagName:typeof h.name=="string"?h.name:void 0;Object.defineProperty(m,"name",{value:"node ("+(s.type+(p?"<"+p+">":""))+")"})}return m;function m(){let p=mr,y,w,A;if((!n||a(s,c,u[u.length-1]||void 0))&&(p=Ol(t(s,u)),p[0]===wt))return p;if("children"in s&&s.children){const k=s;if(k.children&&p[0]!==Nl)for(w=(r?k.children.length:-1)+o,A=u.concat(k);w>-1&&w<k.children.length;){const L=k.children[w];if(y=l(L,w,A)(),y[0]===wt)return y;w=typeof y[1]=="number"?y[1]:w+o}}return p}}}function Ol(e){return Array.isArray(e)?e:typeof e=="number"?[Bl,e]:e==null?mr:[e]}function gr(e,n,t,r){let i,a,o;typeof n=="function"&&typeof t!="function"?(a=void 0,o=n,i=t):(a=n,o=t,i=r),Rl(e,a,l,i);function l(s,c){const u=c[c.length-1],h=u?u.children.indexOf(s):void 0;return o(s,h,u)}}const Sn={}.hasOwnProperty,Fl={};function _l(e,n){const t=n||Fl,r=new Map,i=new Map,a=new Map,o={...kl,...t.handlers},l={all:c,applyData:jl,definitionById:r,footnoteById:i,footnoteCounts:a,footnoteOrder:[],handlers:o,one:s,options:t,patch:Hl,wrap:Vl};return gr(e,function(u){if(u.type==="definition"||u.type==="footnoteDefinition"){const h=u.type==="definition"?r:i,m=String(u.identifier).toUpperCase();h.has(m)||h.set(m,u)}}),l;function s(u,h){const m=u.type,p=l.handlers[m];if(Sn.call(l.handlers,m)&&p)return p(l,u,h);if(l.options.passThrough&&l.options.passThrough.includes(m)){if("children"in u){const{children:w,...A}=u,k=Qe(A);return k.children=l.all(u),k}return Qe(u)}return(l.options.unknownHandler||Ul)(l,u,h)}function c(u){const h=[];if("children"in u){const m=u.children;let p=-1;for(;++p<m.length;){const y=l.one(m[p],u);if(y){if(p&&m[p-1].type==="break"&&(!Array.isArray(y)&&y.type==="text"&&(y.value=kt(y.value)),!Array.isArray(y)&&y.type==="element")){const w=y.children[0];w&&w.type==="text"&&(w.value=kt(w.value))}Array.isArray(y)?h.push(...y):h.push(y)}}}return h}}function Hl(e,n){e.position&&(n.position=Si(e))}function jl(e,n){let t=n;if(e&&e.data){const r=e.data.hName,i=e.data.hChildren,a=e.data.hProperties;if(typeof r=="string")if(t.type==="element")t.tagName=r;else{const o="children"in t?t.children:[t];t={type:"element",tagName:r,properties:{},children:o}}t.type==="element"&&a&&Object.assign(t.properties,Qe(a)),"children"in t&&t.children&&i!==null&&i!==void 0&&(t.children=i)}return t}function Ul(e,n){const t=n.data||{},r="value"in n&&!(Sn.call(t,"hProperties")||Sn.call(t,"hChildren"))?{type:"text",value:n.value}:{type:"element",tagName:"div",properties:{},children:e.all(n)};return e.patch(n,r),e.applyData(n,r)}function Vl(e,n){const t=[];let r=-1;for(n&&t.push({type:"text",value:`
`});++r<e.length;)r&&t.push({type:"text",value:`
`}),t.push(e[r]);return n&&e.length>0&&t.push({type:"text",value:`
`}),t}function kt(e){let n=0,t=e.charCodeAt(n);for(;t===9||t===32;)n++,t=e.charCodeAt(n);return e.slice(n)}function St(e,n){const t=_l(e,n),r=t.one(e,void 0),i=Tl(t),a=Array.isArray(r)?{type:"root",children:r}:r||{type:"root",children:[]};return i&&a.children.push({type:"text",value:`
`},i),a}function Wl(e,n){return e&&"run"in e?async function(t,r){const i=St(t,{file:r,...n});await e.run(i,r)}:function(t,r){return St(t,{file:r,...e||n})}}function vt(e){if(e)throw e}var Ke=Object.prototype.hasOwnProperty,yr=Object.prototype.toString,Ct=Object.defineProperty,Et=Object.getOwnPropertyDescriptor,At=function(n){return typeof Array.isArray=="function"?Array.isArray(n):yr.call(n)==="[object Array]"},It=function(n){if(!n||yr.call(n)!=="[object Object]")return!1;var t=Ke.call(n,"constructor"),r=n.constructor&&n.constructor.prototype&&Ke.call(n.constructor.prototype,"isPrototypeOf");if(n.constructor&&!t&&!r)return!1;var i;for(i in n);return typeof i>"u"||Ke.call(n,i)},Tt=function(n,t){Ct&&t.name==="__proto__"?Ct(n,t.name,{enumerable:!0,configurable:!0,value:t.newValue,writable:!0}):n[t.name]=t.newValue},Pt=function(n,t){if(t==="__proto__")if(Ke.call(n,t)){if(Et)return Et(n,t).value}else return;return n[t]},ql=function e(){var n,t,r,i,a,o,l=arguments[0],s=1,c=arguments.length,u=!1;for(typeof l=="boolean"&&(u=l,l=arguments[1]||{},s=2),(l==null||typeof l!="object"&&typeof l!="function")&&(l={});s<c;++s)if(n=arguments[s],n!=null)for(t in n)r=Pt(l,t),i=Pt(n,t),l!==i&&(u&&i&&(It(i)||(a=At(i)))?(a?(a=!1,o=r&&At(r)?r:[]):o=r&&It(r)?r:{},Tt(l,{name:t,newValue:e(u,o,i)})):typeof i<"u"&&Tt(l,{name:t,newValue:i}));return l};const ln=Rt(ql);function vn(e){if(typeof e!="object"||e===null)return!1;const n=Object.getPrototypeOf(e);return(n===null||n===Object.prototype||Object.getPrototypeOf(n)===null)&&!(Symbol.toStringTag in e)&&!(Symbol.iterator in e)}function Gl(){const e=[],n={run:t,use:r};return n;function t(...i){let a=-1;const o=i.pop();if(typeof o!="function")throw new TypeError("Expected function as last argument, not "+o);l(null,...i);function l(s,...c){const u=e[++a];let h=-1;if(s){o(s);return}for(;++h<i.length;)(c[h]===null||c[h]===void 0)&&(c[h]=i[h]);i=c,u?Kl(u,l)(...c):o(null,...c)}}function r(i){if(typeof i!="function")throw new TypeError("Expected `middelware` to be a function, not "+i);return e.push(i),n}}function Kl(e,n){let t;return r;function r(...o){const l=e.length>o.length;let s;l&&o.push(i);try{s=e.apply(this,o)}catch(c){const u=c;if(l&&t)throw u;return i(u)}l||(s&&s.then&&typeof s.then=="function"?s.then(a,i):s instanceof Error?i(s):a(s))}function i(o,...l){t||(t=!0,n(o,...l))}function a(o){i(null,o)}}const se={basename:Yl,dirname:$l,extname:Xl,join:Ql,sep:"/"};function Yl(e,n){if(n!==void 0&&typeof n!="string")throw new TypeError('"ext" argument must be a string');je(e);let t=0,r=-1,i=e.length,a;if(n===void 0||n.length===0||n.length>e.length){for(;i--;)if(e.codePointAt(i)===47){if(a){t=i+1;break}}else r<0&&(a=!0,r=i+1);return r<0?"":e.slice(t,r)}if(n===e)return"";let o=-1,l=n.length-1;for(;i--;)if(e.codePointAt(i)===47){if(a){t=i+1;break}}else o<0&&(a=!0,o=i+1),l>-1&&(e.codePointAt(i)===n.codePointAt(l--)?l<0&&(r=i):(l=-1,r=o));return t===r?r=o:r<0&&(r=e.length),e.slice(t,r)}function $l(e){if(je(e),e.length===0)return".";let n=-1,t=e.length,r;for(;--t;)if(e.codePointAt(t)===47){if(r){n=t;break}}else r||(r=!0);return n<0?e.codePointAt(0)===47?"/":".":n===1&&e.codePointAt(0)===47?"//":e.slice(0,n)}function Xl(e){je(e);let n=e.length,t=-1,r=0,i=-1,a=0,o;for(;n--;){const l=e.codePointAt(n);if(l===47){if(o){r=n+1;break}continue}t<0&&(o=!0,t=n+1),l===46?i<0?i=n:a!==1&&(a=1):i>-1&&(a=-1)}return i<0||t<0||a===0||a===1&&i===t-1&&i===r+1?"":e.slice(i,t)}function Ql(...e){let n=-1,t;for(;++n<e.length;)je(e[n]),e[n]&&(t=t===void 0?e[n]:t+"/"+e[n]);return t===void 0?".":Jl(t)}function Jl(e){je(e);const n=e.codePointAt(0)===47;let t=Zl(e,!n);return t.length===0&&!n&&(t="."),t.length>0&&e.codePointAt(e.length-1)===47&&(t+="/"),n?"/"+t:t}function Zl(e,n){let t="",r=0,i=-1,a=0,o=-1,l,s;for(;++o<=e.length;){if(o<e.length)l=e.codePointAt(o);else{if(l===47)break;l=47}if(l===47){if(!(i===o-1||a===1))if(i!==o-1&&a===2){if(t.length<2||r!==2||t.codePointAt(t.length-1)!==46||t.codePointAt(t.length-2)!==46){if(t.length>2){if(s=t.lastIndexOf("/"),s!==t.length-1){s<0?(t="",r=0):(t=t.slice(0,s),r=t.length-1-t.lastIndexOf("/")),i=o,a=0;continue}}else if(t.length>0){t="",r=0,i=o,a=0;continue}}n&&(t=t.length>0?t+"/..":"..",r=2)}else t.length>0?t+="/"+e.slice(i+1,o):t=e.slice(i+1,o),r=o-i-1;i=o,a=0}else l===46&&a>-1?a++:a=-1}return t}function je(e){if(typeof e!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(e))}const es={cwd:ns};function ns(){return"/"}function Cn(e){return!!(e!==null&&typeof e=="object"&&"href"in e&&e.href&&"protocol"in e&&e.protocol&&e.auth===void 0)}function ts(e){if(typeof e=="string")e=new URL(e);else if(!Cn(e)){const n=new TypeError('The "path" argument must be of type string or an instance of URL. Received `'+e+"`");throw n.code="ERR_INVALID_ARG_TYPE",n}if(e.protocol!=="file:"){const n=new TypeError("The URL must be of scheme file");throw n.code="ERR_INVALID_URL_SCHEME",n}return rs(e)}function rs(e){if(e.hostname!==""){const r=new TypeError('File URL host must be "localhost" or empty on darwin');throw r.code="ERR_INVALID_FILE_URL_HOST",r}const n=e.pathname;let t=-1;for(;++t<n.length;)if(n.codePointAt(t)===37&&n.codePointAt(t+1)===50){const r=n.codePointAt(t+2);if(r===70||r===102){const i=new TypeError("File URL path must not include encoded / characters");throw i.code="ERR_INVALID_FILE_URL_PATH",i}}return decodeURIComponent(n)}const sn=["history","path","basename","stem","extname","dirname"];class xr{constructor(n){let t;n?Cn(n)?t={path:n}:typeof n=="string"||is(n)?t={value:n}:t=n:t={},this.cwd="cwd"in t?"":es.cwd(),this.data={},this.history=[],this.messages=[],this.value,this.map,this.result,this.stored;let r=-1;for(;++r<sn.length;){const a=sn[r];a in t&&t[a]!==void 0&&t[a]!==null&&(this[a]=a==="history"?[...t[a]]:t[a])}let i;for(i in t)sn.includes(i)||(this[i]=t[i])}get basename(){return typeof this.path=="string"?se.basename(this.path):void 0}set basename(n){cn(n,"basename"),un(n,"basename"),this.path=se.join(this.dirname||"",n)}get dirname(){return typeof this.path=="string"?se.dirname(this.path):void 0}set dirname(n){Lt(this.basename,"dirname"),this.path=se.join(n||"",this.basename)}get extname(){return typeof this.path=="string"?se.extname(this.path):void 0}set extname(n){if(un(n,"extname"),Lt(this.dirname,"extname"),n){if(n.codePointAt(0)!==46)throw new Error("`extname` must start with `.`");if(n.includes(".",1))throw new Error("`extname` cannot contain multiple dots")}this.path=se.join(this.dirname,this.stem+(n||""))}get path(){return this.history[this.history.length-1]}set path(n){Cn(n)&&(n=ts(n)),cn(n,"path"),this.path!==n&&this.history.push(n)}get stem(){return typeof this.path=="string"?se.basename(this.path,this.extname):void 0}set stem(n){cn(n,"stem"),un(n,"stem"),this.path=se.join(this.dirname||"",n+(this.extname||""))}fail(n,t,r){const i=this.message(n,t,r);throw i.fatal=!0,i}info(n,t,r){const i=this.message(n,t,r);return i.fatal=void 0,i}message(n,t,r){const i=new X(n,t,r);return this.path&&(i.name=this.path+":"+i.name,i.file=this.path),i.fatal=!1,this.messages.push(i),i}toString(n){return this.value===void 0?"":typeof this.value=="string"?this.value:new TextDecoder(n||void 0).decode(this.value)}}function un(e,n){if(e&&e.includes(se.sep))throw new Error("`"+n+"` cannot be a path: did not expect `"+se.sep+"`")}function cn(e,n){if(!e)throw new Error("`"+n+"` cannot be empty")}function Lt(e,n){if(!e)throw new Error("Setting `"+n+"` requires `path` to be set too")}function is(e){return!!(e&&typeof e=="object"&&"byteLength"in e&&"byteOffset"in e)}const as=function(e){const r=this.constructor.prototype,i=r[e],a=function(){return i.apply(a,arguments)};return Object.setPrototypeOf(a,r),a},os={}.hasOwnProperty;class _n extends as{constructor(){super("copy"),this.Compiler=void 0,this.Parser=void 0,this.attachers=[],this.compiler=void 0,this.freezeIndex=-1,this.frozen=void 0,this.namespace={},this.parser=void 0,this.transformers=Gl()}copy(){const n=new _n;let t=-1;for(;++t<this.attachers.length;){const r=this.attachers[t];n.use(...r)}return n.data(ln(!0,{},this.namespace)),n}data(n,t){return typeof n=="string"?arguments.length===2?(fn("data",this.frozen),this.namespace[n]=t,this):os.call(this.namespace,n)&&this.namespace[n]||void 0:n?(fn("data",this.frozen),this.namespace=n,this):this.namespace}freeze(){if(this.frozen)return this;const n=this;for(;++this.freezeIndex<this.attachers.length;){const[t,...r]=this.attachers[this.freezeIndex];if(r[0]===!1)continue;r[0]===!0&&(r[0]=void 0);const i=t.call(n,...r);typeof i=="function"&&this.transformers.use(i)}return this.frozen=!0,this.freezeIndex=Number.POSITIVE_INFINITY,this}parse(n){this.freeze();const t=qe(n),r=this.parser||this.Parser;return pn("parse",r),r(String(t),t)}process(n,t){const r=this;return this.freeze(),pn("process",this.parser||this.Parser),hn("process",this.compiler||this.Compiler),t?i(void 0,t):new Promise(i);function i(a,o){const l=qe(n),s=r.parse(l);r.run(s,l,function(u,h,m){if(u||!h||!m)return c(u);const p=h,y=r.stringify(p,m);us(y)?m.value=y:m.result=y,c(u,m)});function c(u,h){u||!h?o(u):a?a(h):t(void 0,h)}}}processSync(n){let t=!1,r;return this.freeze(),pn("processSync",this.parser||this.Parser),hn("processSync",this.compiler||this.Compiler),this.process(n,i),Dt("processSync","process",t),r;function i(a,o){t=!0,vt(a),r=o}}run(n,t,r){Mt(n),this.freeze();const i=this.transformers;return!r&&typeof t=="function"&&(r=t,t=void 0),r?a(void 0,r):new Promise(a);function a(o,l){const s=qe(t);i.run(n,s,c);function c(u,h,m){const p=h||n;u?l(u):o?o(p):r(void 0,p,m)}}}runSync(n,t){let r=!1,i;return this.run(n,t,a),Dt("runSync","run",r),i;function a(o,l){vt(o),i=l,r=!0}}stringify(n,t){this.freeze();const r=qe(t),i=this.compiler||this.Compiler;return hn("stringify",i),Mt(n),i(n,r)}use(n,...t){const r=this.attachers,i=this.namespace;if(fn("use",this.frozen),n!=null)if(typeof n=="function")s(n,t);else if(typeof n=="object")Array.isArray(n)?l(n):o(n);else throw new TypeError("Expected usable value, not `"+n+"`");return this;function a(c){if(typeof c=="function")s(c,[]);else if(typeof c=="object")if(Array.isArray(c)){const[u,...h]=c;s(u,h)}else o(c);else throw new TypeError("Expected usable value, not `"+c+"`")}function o(c){if(!("plugins"in c)&&!("settings"in c))throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");l(c.plugins),c.settings&&(i.settings=ln(!0,i.settings,c.settings))}function l(c){let u=-1;if(c!=null)if(Array.isArray(c))for(;++u<c.length;){const h=c[u];a(h)}else throw new TypeError("Expected a list of plugins, not `"+c+"`")}function s(c,u){let h=-1,m=-1;for(;++h<r.length;)if(r[h][0]===c){m=h;break}if(m===-1)r.push([c,...u]);else if(u.length>0){let[p,...y]=u;const w=r[m][1];vn(w)&&vn(p)&&(p=ln(!0,w,p)),r[m]=[c,p,...y]}}}}const ls=new _n().freeze();function pn(e,n){if(typeof n!="function")throw new TypeError("Cannot `"+e+"` without `parser`")}function hn(e,n){if(typeof n!="function")throw new TypeError("Cannot `"+e+"` without `compiler`")}function fn(e,n){if(n)throw new Error("Cannot call `"+e+"` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.")}function Mt(e){if(!vn(e)||typeof e.type!="string")throw new TypeError("Expected node, got `"+e+"`")}function Dt(e,n,t){if(!t)throw new Error("`"+e+"` finished async. Use `"+n+"` instead")}function qe(e){return ss(e)?e:new xr(e)}function ss(e){return!!(e&&typeof e=="object"&&"message"in e&&"messages"in e)}function us(e){return typeof e=="string"||cs(e)}function cs(e){return!!(e&&typeof e=="object"&&"byteLength"in e&&"byteOffset"in e)}const ps="https://github.com/remarkjs/react-markdown/blob/main/changelog.md",zt=[],Bt={allowDangerousHtml:!0},hs=/^(https?|ircs?|mailto|xmpp)$/i,fs=[{from:"astPlugins",id:"remove-buggy-html-in-markdown-parser"},{from:"allowDangerousHtml",id:"remove-buggy-html-in-markdown-parser"},{from:"allowNode",id:"replace-allownode-allowedtypes-and-disallowedtypes",to:"allowElement"},{from:"allowedTypes",id:"replace-allownode-allowedtypes-and-disallowedtypes",to:"allowedElements"},{from:"className",id:"remove-classname"},{from:"disallowedTypes",id:"replace-allownode-allowedtypes-and-disallowedtypes",to:"disallowedElements"},{from:"escapeHtml",id:"remove-buggy-html-in-markdown-parser"},{from:"includeElementIndex",id:"#remove-includeelementindex"},{from:"includeNodeIndex",id:"change-includenodeindex-to-includeelementindex"},{from:"linkTarget",id:"remove-linktarget"},{from:"plugins",id:"change-plugins-to-remarkplugins",to:"remarkPlugins"},{from:"rawSourcePos",id:"#remove-rawsourcepos"},{from:"renderers",id:"change-renderers-to-components",to:"components"},{from:"source",id:"change-source-to-children",to:"children"},{from:"sourcePos",id:"#remove-sourcepos"},{from:"transformImageUri",id:"#add-urltransform",to:"urlTransform"},{from:"transformLinkUri",id:"#add-urltransform",to:"urlTransform"}];function Nt(e){const n=ds(e),t=ms(e);return gs(n.runSync(n.parse(t),t),e)}function ds(e){const n=e.rehypePlugins||zt,t=e.remarkPlugins||zt,r=e.remarkRehypeOptions?{...e.remarkRehypeOptions,...Bt}:Bt;return ls().use($o).use(t).use(Wl,r).use(n)}function ms(e){const n=e.children||"",t=new xr;return typeof n=="string"&&(t.value=n),t}function gs(e,n){const t=n.allowedElements,r=n.allowElement,i=n.components,a=n.disallowedElements,o=n.skipHtml,l=n.unwrapDisallowed,s=n.urlTransform||ys;for(const u of fs)Object.hasOwn(n,u.from)&&(""+u.from+(u.to?"use `"+u.to+"` instead":"remove it")+ps+u.id,void 0);return gr(e,c),Ii(e,{Fragment:B.Fragment,components:i,ignoreInvalidStyle:!0,jsx:B.jsx,jsxs:B.jsxs,passKeys:!0,passNode:!0});function c(u,h,m){if(u.type==="raw"&&m&&typeof h=="number")return o?m.children.splice(h,1):m.children[h]={type:"text",value:u.value},h;if(u.type==="element"){let p;for(p in rn)if(Object.hasOwn(rn,p)&&Object.hasOwn(u.properties,p)){const y=u.properties[p],w=rn[p];(w===null||w.includes(u.tagName))&&(u.properties[p]=s(String(y||""),p,u))}}if(u.type==="element"){let p=t?!t.includes(u.tagName):a?a.includes(u.tagName):!1;if(!p&&r&&typeof h=="number"&&(p=!r(u,h,m)),p&&m&&typeof h=="number")return l&&u.children?m.children.splice(h,1,...u.children):m.children.splice(h,1),h}}}function ys(e){const n=e.indexOf(":"),t=e.indexOf("?"),r=e.indexOf("#"),i=e.indexOf("/");return n===-1||i!==-1&&n>i||t!==-1&&n>t||r!==-1&&n>r||hs.test(e.slice(0,n))?e:""}function xs({sections:e}){const[n,t]=ze.useState(0),[r,i]=ze.useState(!1);ze.useEffect(()=>{const o=()=>i(window.innerWidth<640);return o(),window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),ze.useEffect(()=>{const o=window.location.hash.slice(1),l=e.findIndex(s=>s.id===o);l>=0&&t(l)},[e]),ze.useEffect(()=>{var l;const o=(l=e[n])==null?void 0:l.id;o&&history.replaceState(null,"",`#${o}`)},[n,e]);const a=B.jsxs(Ye.article,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},transition:{duration:.3},id:e[n].id,className:"learn-section",children:[B.jsx("h2",{className:"learn-title",children:e[n].title}),B.jsx("div",{className:"prose learn-prose prose-lg max-w-[80ch]",children:B.jsx(Nt,{children:e[n].content})})]},e[n].id);return r?B.jsx("div",{className:"space-y-4",children:e.map((o,l)=>B.jsxs("details",{open:l===n,onClick:()=>t(l),className:"learn-section",id:o.id,children:[B.jsx("summary",{className:"cursor-pointer font-semibold",children:B.jsx("span",{className:"flex items-center gap-2 text-xl md:text-2xl",children:o.title})}),B.jsx(Ye.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.3},className:"mt-4",children:B.jsx(Nt,{className:"prose learn-prose prose-base max-w-[80ch]",children:o.content})})]},o.id))}):B.jsxs("div",{children:[B.jsx("div",{className:"mb-4 flex flex-wrap gap-2 border-b border-comet/30",children:e.map((o,l)=>B.jsx("button",{type:"button",onClick:()=>t(l),className:`px-3 py-2 text-sm transition-colors ${l===n?"border-b-2 border-psychedelic-purple text-psychedelic-purple shadow-glow":"text-sand hover:text-psychedelic-purple"}`,children:o.title},o.id))}),B.jsx(Tr,{mode:"wait",children:a})]})}const bs=[{id:"intro",title:"What Are Psychoactive Herbs?",content:`**Psychoactive herbs** are plants that affect the brain, nervous system, and consciousness. They can change how we feel, think, perceive reality, sleep, and dream. Some are calming, others energizing, and a few can even spark visionary or altered states.

---

### 🌿 What Makes a Herb “Psychoactive”?

To be considered psychoactive, an herb must **interact with the central nervous system** and **alter brain function**. This includes changes in:

- Mood (e.g., relaxation, euphoria, clarity)
- Cognition (e.g., focus, memory, mental energy)
- Perception (e.g., vivid dreams, sensory shifts)
- Consciousness (e.g., introspection, trance states)
- Sleep and dream cycles (e.g., REM enhancement, lucidity)

These effects are caused by **natural plant compounds** such as alkaloids, flavonoids, terpenes, and glycosides, which bind to **neurotransmitter receptors** in the brain.

---

### 🧪 Common Neurochemical Targets

| Neurotransmitter | Associated Effects | Example Herbs |
|------------------|--------------------|----------------|
| GABA | Calm, sedation, anti-anxiety | Valerian, Skullcap |
| Serotonin | Mood elevation, sleep, dreams | Passionflower, Blue Lotus |
| Dopamine | Focus, motivation, pleasure | Mucuna pruriens |
| Acetylcholine | Memory, dreams, clarity | Calea ternifolia, Huperzia |
| Glutamate (NMDA) | Visionary states, dissociation | Salvia divinorum, Heimia salicifolia |

---

### 🧭 Why Do People Use Psychoactive Herbs?

These herbs have been used for millennia — for both practical and spiritual reasons:

#### 🛏 Sleep & Relaxation
Support for insomnia, anxiety, nervous tension  
→ Chamomile, Passionflower, Kava

#### 🌙 Dreamwork
Enhancing recall, vividness, and lucidity  
→ Calea, Silene, Blue Lotus

#### 🧠 Mental Clarity & Focus
Boosting memory, learning, or productivity  
→ Celastrus, Rhodiola, Gotu Kola

#### 🌀 Spiritual or Visionary States
Used in ceremonial or introspective contexts  
→ Salvia, Ayahuasca, Iboga

#### ❤️ Mood & Emotional Support
To balance low mood, apathy, or stress  
→ Lemon Balm, Mucuna, Ashwagandha

---

### 🏺 Cultural & Historical Significance

Psychoactive plants appear in ancient texts, oral traditions, and sacred rituals across nearly every indigenous culture:

- **Blue Lotus (Egypt):** Symbol of the soul’s journey and awakening  
- **Ayahuasca (Amazon):** Vine of the soul, used in healing and spiritual rites  
- **Iboga (Africa):** Rite-of-passage plant of the Bwiti  
- **Cannabis (India):** Sacred to Shiva and used in yogic practices  
- **Psilocybin mushrooms (Mesoamerica):** Tools of communion with the divine

---

### ⚖️ Are They Legal? Are They Safe?

Many psychoactive herbs are **legal**, non-addictive, and sold in herbal shops. Others are **regulated or banned** depending on jurisdiction (e.g., Kratom, Salvia, DMT admixtures). Safety depends on:

- **Proper identification and dosage**
- **Understanding interactions (esp. with MAOIs or SSRIs)**
- **Individual health conditions**
- **Preparation method (e.g., smoked vs tinctured)**

---

### 🧘 Responsible Exploration

Like any mind-altering tool, psychoactive herbs are best approached with:
- **Intention** (why are you taking it?)
- **Education** (what does it do and how?)
- **Respect** (especially with sacred/traditional plants)

These herbs are not just chemicals — they’re **living teachers**. Used wisely, they can help reconnect us to dreams, emotions, and ancestral plant wisdom.`},{id:"tag-glossary",title:"Herb Tag Glossary",content:`Tags are a core part of The Hippie Scientist herb index — they help you quickly understand what an herb is known for, how it might feel, and what kind of context it might be used in. Here's a full glossary of all current tags with definitions, use cases, and example herbs.

---

### 🌙 Dream-enhancing
**What it means:** Promotes vivid dreams, better recall, or lucid dreaming.

- **Typical compounds:** Oneirogens, acetylcholine enhancers
- **Best used:** Before bed, with intention setting or dream journaling
- **Examples:** Calea ternifolia, Silene capensis, Mugwort, Blue Lotus

---

### 🧠 Nootropic
**What it means:** Enhances cognitive function — including memory, learning, clarity, or creativity.

- **Mechanisms:** Dopamine, acetylcholine, neuroprotective effects
- **Great for:** Students, creatives, neurodivergent users
- **Examples:** Celastrus paniculatus, Bacopa monnieri, Gotu Kola, Rhodiola rosea

---

### ⚖️ Adaptogen
**What it means:** Regulates stress response and restores balance over time.

- **Use cases:** Burnout recovery, adrenal fatigue, immune support
- **Timing:** Often taken daily, not for acute effects
- **Examples:** Ashwagandha, Eleuthero, Schisandra, Tulsi (Holy Basil)

---

### 😌 Sedative
**What it means:** Calms the nervous system, promotes sleep or physical relaxation.

- **Common effects:** Sleepiness, muscle relaxation, anti-anxiety
- **Good for:** Insomnia, overthinking, tension
- **Examples:** Valerian root, Skullcap, Passionflower, California Poppy

---

### 🔋 Stimulant
**What it means:** Increases energy, alertness, or stamina — often via dopamine or adrenaline pathways.

- **Risks:** May increase anxiety or jitteriness if overused
- **Cautions:** Avoid late-night use; can be habit-forming
- **Examples:** Guarana, Yerba Mate, Ephedra (Ma Huang), Kola Nut

---

### 💘 Aphrodisiac
**What it means:** Traditionally used to enhance libido, sensuality, or sexual vitality.

- **Mechanisms:** Increased circulation, dopamine, or relaxation
- **Cultural uses:** Tantra, love potions, libido blends
- **Examples:** Damiana, Maca, Tribulus terrestris, Yohimbe

---

### 🔮 Psychedelic
**What it means:** Can induce altered states of perception, introspection, or spiritual insight.

- **Range:** From subtle shifts to full visionary states
- **Usage:** Often ceremonial or introspective
- **Examples:** Salvia divinorum, Ayahuasca (DMT+MAOI), Iboga, Fly Agaric

---

### 🛡️ Immune-supportive
**What it means:** Strengthens or balances immune system responses.

- **Common uses:** Colds, chronic fatigue, seasonal transitions
- **Examples:** Astragalus, Echinacea, Reishi, Elderberry

---

### 🪷 Mood-boosting
**What it means:** Supports emotional regulation or lifts low mood.

- **Related systems:** Dopaminergic, serotonergic
- **Examples:** Mucuna pruriens, Lemon Balm, Kanna, St. John’s Wort

---

### 🌬️ Respiratory
**What it means:** Traditionally used to ease breathing or support lung function.

- **Use cases:** Cough blends, smoke cleansing, seasonal illness
- **Examples:** Mullein, Coltsfoot, Horehound

---

### ⚡ Energy-supporting
**What it means:** Increases stamina and reduces fatigue (not always stimulating).

- **Different from:** Nervous system stimulants — often adaptogenic
- **Examples:** Cordyceps, Schisandra, Maca

---

### 🌿 Detoxifying
**What it means:** Supports liver, lymphatic, or kidney function to aid natural detoxification.

- **Cultural examples:** Spring cleanses, liver tonics
- **Examples:** Dandelion, Burdock, Milk Thistle, Cleavers

---

### 🔥 Anti-inflammatory
**What it means:** Reduces systemic or localized inflammation.

- **Conditions supported:** Arthritis, gut health, chronic fatigue
- **Examples:** Turmeric, Ginger, Boswellia, Holy Basil

---

> Many herbs have multiple tags depending on dose, preparation, and tradition. These tags are starting points — always read full profiles before use.`},{id:"mechanisms",title:"Mechanisms of Action",content:`Every psychoactive herb works through one or more **biochemical pathways** in the body. These mechanisms — often involving neurotransmitters, hormones, or receptors — shape the herb’s effects on the brain and nervous system.

Understanding these pathways can help you:
- Predict how an herb might feel
- Choose herbs that complement (not conflict)
- Avoid harmful interactions (e.g. with medications)

---

### 🧘 GABAergic Pathway
- **Neurotransmitter:** GABA (Gamma-Aminobutyric Acid)
- **Function:** Inhibitory — slows down neural activity
- **Effects:** Calming, sedative, anti-anxiety, muscle relaxant
- **Herbs:** Valerian, Kava, Skullcap, Chamomile, Lemon Balm

**How it works:** These herbs either increase GABA production, inhibit its breakdown, or bind directly to GABA-A receptors — similar to how benzodiazepines work, but generally milder.

---

### 😌 Serotonergic Pathway
- **Neurotransmitter:** Serotonin (5-HT)
- **Function:** Regulates mood, sleep, appetite, and perception
- **Effects:** Mood elevation, dream vividness, relaxation, hallucinations (at high levels)
- **Herbs:** Passionflower, Blue Lotus, Ayahuasca (contains DMT), Syrian Rue (MAOI)

**Note:** Serotonin agonists (like DMT) and reuptake inhibitors (like St. John's Wort) can be powerful. Never mix multiple serotonergic herbs or combine with SSRIs.

---

### ⚡ Dopaminergic Pathway
- **Neurotransmitter:** Dopamine
- **Function:** Motivation, pleasure, focus, movement
- **Effects:** Increased mental energy, drive, reward sensation
- **Herbs:** Mucuna pruriens (L-Dopa), Rhodiola rosea, Maca, Celastrus paniculatus

**Risks:** Too much stimulation may lead to irritability or anxiety. Support dopamine with grounding herbs if needed.

---

### 🧠 Cholinergic Pathway
- **Neurotransmitter:** Acetylcholine
- **Function:** Memory formation, learning, dream lucidity
- **Effects:** Enhanced recall, focus, dream vividness, neuroprotection
- **Herbs:** Calea ternifolia, Huperzia serrata, Bacopa monnieri, Gotu Kola

**Best for:** Dreamers, students, neuro-hackers.

---

### 🌀 NMDA Antagonists (Glutamate Modulation)
- **Receptor System:** NMDA (glutamate receptor)
- **Function:** Memory, consciousness, sensory integration
- **Effects:** Dissociation, visual distortions, dreamlike states, neuroplasticity
- **Herbs:** Salvia divinorum, Heimia salicifolia, Ketamine (pharma analog)

**Caution:** These are potent and should only be used with deep respect and awareness of set/setting.

---

### 🛡️ Anti-inflammatory & Endocrine-Modulating Effects
Some herbs don’t act directly on the brain, but influence mood and cognition by:
- Reducing neuroinflammation (Turmeric, Boswellia)
- Regulating cortisol or adrenal hormones (Ashwagandha, Licorice)
- Modulating immune/neuroimmune interactions

---

### 🔬 Synergistic Actions
Many herbs affect **multiple pathways** at once:
- **Passionflower:** GABA + Serotonin
- **Celastrus:** Dopamine + Acetylcholine
- **Blue Lotus:** GABA + Serotonin + Dopamine

This synergy can be helpful — or overwhelming — depending on dosage and combination.

---

### 🧪 Summary Table

| Pathway | Primary Effect | Herb Examples |
|--------|----------------|----------------|
| GABAergic | Calm, sedation | Valerian, Skullcap |
| Serotonergic | Mood, dreams | Blue Lotus, Passionflower |
| Dopaminergic | Energy, drive | Mucuna, Rhodiola |
| Cholinergic | Memory, dreams | Calea, Gotu Kola |
| NMDA Antagonist | Visionary, dissociative | Salvia, Heimia |
| Endocrine/Anti-inflammatory | Hormonal balance | Ashwagandha, Turmeric |

---

Understanding the mechanism is just one part of the picture — tradition, dosage, and intention also matter deeply.`},{id:"effects",title:"Understanding Herbal Effects",content:`Herbs are not “one-size-fits-all.” Each psychoactive plant carries its own personality — a distinct fingerprint of physiological and emotional effects based on its chemistry, tradition, and preparation method.

Understanding these common effect categories helps you:
- Choose the right herb for your intention
- Understand what to expect
- Respect the potential power behind the plant

---

### 🌿 Sedative / Relaxant
- **Effect:** Calms the nervous system, reduces mental chatter, promotes sleep
- **Use for:** Anxiety, insomnia, restlessness, tension
- **Examples:** Skullcap, Valerian root, California poppy, Passionflower

**Preparation Tips:**
- Most effective as teas or tinctures taken 30–60 minutes before bed
- Synergizes well with adaptogens or dream herbs

---

### ⚡ Stimulant
- **Effect:** Enhances energy, alertness, motivation
- **Use for:** Fatigue, low mood, mental fog
- **Examples:** Guarana, Yerba Mate, Kola Nut, Ephedra (Ma Huang)

**Caution:**
- May increase anxiety or interfere with sleep
- Do not mix with other stimulants or pre-existing heart conditions

---

### 🛡️ Adaptogen
- **Effect:** Balances stress response over time, supports stamina, reduces burnout
- **Use for:** Chronic fatigue, stress recovery, immune resilience
- **Examples:** Ashwagandha, Rhodiola, Eleuthero, Schisandra

**Note:** Best used daily for 2–4 weeks, effects accumulate gradually

---

### 🧠 Nootropic
- **Effect:** Improves memory, learning, focus, verbal fluency, and/or creativity
- **Use for:** Mental performance, ADHD support, exam prep, long-term neuroprotection
- **Examples:** Celastrus, Gotu Kola, Bacopa, Lion’s Mane, Ginkgo

**Best combined with:** Cholinergics, adaptogens, and journaling to track effects

---

### 🌙 Dream-enhancing
- **Effect:** Increases dream recall, vividness, and lucidity
- **Use for:** Dream journaling, lucid training, subconscious exploration
- **Examples:** Calea ternifolia, Silene capensis, Mugwort, Blue Lotus

**Tips:**
- Set intention before sleep
- Avoid screen time for 30 min before bed
- Combine with sleep herbs for deeper integration

---

### 🔮 Psychedelic / Oneirogenic
- **Effect:** Alters sensory perception, deepens insight, induces visions or ego dissolution
- **Use for:** Introspection, ceremonial work, trauma integration
- **Examples:** Salvia divinorum, Ayahuasca (DMT+MAOI), Iboga, Fly Agaric

**Strong caution:** Dose, setting, and integration are vital. These are sacred medicines in many cultures and must be approached with reverence.

---

### 🪷 Euphoric / Mood-lifting
- **Effect:** Elevates mood, reduces emotional numbness, enhances pleasure
- **Use for:** Low motivation, stress, winter blues
- **Examples:** Mucuna pruriens, Kanna, Damiana, Blue Lotus

**May interact with:** Dopamine or serotonin-based medications

---

### 📊 Effect Type Matrix

| Effect Type | Energy Impact | Examples | Best Used For |
|-------------|----------------|----------|----------------|
| Sedative | ↓ Calms | Valerian, Skullcap | Sleep, anxiety |
| Stimulant | ↑ Energizes | Guarana, Yerba Mate | Focus, fatigue |
| Adaptogen | ⚖️ Balances | Ashwagandha, Rhodiola | Chronic stress |
| Nootropic | ↑ Mental focus | Celastrus, Gotu Kola | Study, work |
| Dream-enhancing | Alters sleep | Calea, Silene | Lucid dreams |
| Psychedelic | Alters perception | Salvia, Ayahuasca | Visionary states |
| Euphoric | Lifts mood | Kanna, Blue Lotus | Emotional release |

---

Some effects are dose-dependent — a low dose may be nootropic, while a high dose may be sedative or visionary. Always research, start low, and journal your experience.`},{id:"preparation",title:"Herb Preparation Methods",content:`The way you prepare an herb deeply affects its potency, onset, and even the type of effect it produces. Some herbs shine in teas, others require alcohol extraction or must be smoked or chewed. Preparation is not just about chemistry — it’s also about ritual, relationship, and respect.

---

### 🍵 Infusions & Teas
**Best for:** Leaves, flowers, some soft stems

- **How:** Steep herb in hot (not boiling) water, covered, 5–15 minutes.
- **Examples:** Chamomile, Blue Lotus, Mugwort
- **Benefits:** Gentle, soothing, great for sleep or dream herbs
- **Tips:** Always cover to trap volatile oils; drink slowly with intention

---

### 🔥 Decoctions
**Best for:** Hard roots, barks, dense herbs

- **How:** Simmer in water for 15–30 minutes to break down tough plant material.
- **Examples:** Ashwagandha, Valerian, Rhodiola
- **Benefits:** Deep extraction of alkaloids and starches
- **Tools:** Use stainless steel or clay — avoid aluminum

---

### 💧 Tinctures
**Best for:** Preserving and concentrating active compounds (especially alkaloids)

- **How:** Alcohol (40–70%) used to extract plant material over weeks
- **Examples:** Passionflower, Kava, Damiana
- **Dosage:** Usually 1–3 mL (20–60 drops), sublingual or in water
- **Benefits:** Long shelf life, fast onset, easy storage

---

### 💊 Capsules & Powders
**Best for:** Daily routines, standard dosing

- **How:** Dried, powdered herb placed in capsules or taken as loose powder
- **Examples:** Ashwagandha, Mucuna, Celastrus, Maca
- **Tips:** Combine with warm liquids or smoothies for better absorption

---

### 🌬️ Smoking & Vaping
**Best for:** Dream herbs, resins, aromatic plants

- **How:** Dried herbs or resin are smoked alone or in blends
- **Examples:** Mugwort, Blue Lotus, Damiana, Wild Dagga
- **Effects:** Rapid onset, often more uplifting or visionary than sedative
- **Cautions:** Not for frequent use; harsh on lungs over time

---

### 👅 Sublingual Use
**Best for:** Fast absorption without digestion

- **How:** Place tincture or extract under tongue for 30–60 seconds
- **Examples:** Kanna, Kava tinctures, Blue Lotus
- **Tips:** Don’t eat immediately after; keep dose low for new users

---

### 🧪 Cold Water Infusion
**Best for:** Enzymatic herbs that degrade with heat

- **How:** Soak in cold or room temperature water for 6–12 hours
- **Examples:** Silene capensis (dream root), Celastrus seeds
- **Used for:** Dream preparation, gentle awakening of roots
- **Ritual Tip:** Use spring or filtered water for best effect

---

### 🧴 Oil Infusion & Topicals
**Best for:** External use, spiritual anointing, muscle pain

- **How:** Infuse dried herbs in oil for 2–6 weeks in sun or low heat
- **Examples:** Cannabis salves, Damiana massage oil, Arnica
- **Benefits:** Non-psychoactive route; great for somatic work or energy body support

---

### 🦷 Chewing or Eating Whole
**Best for:** Traditional uses of roots, seeds, or fermented herbs

- **How:** Chew or swallow herb slowly to activate salivary enzymes
- **Examples:** Kava root, Celastrus seeds, Betel nut (arecoline), Guarana paste
- **Traditions:** Often ceremonial — chewing herbs brings slower, deeper onset

---

### 🔄 Choosing the Right Method

| Herb | Best Prep | Why |
|------|-----------|-----|
| Calea ternifolia | Tea or smoke | Water-soluble dream alkaloids + quick onset |
| Mucuna | Powder/capsule | L-Dopa preserved in raw powder |
| Passionflower | Tincture or tea | Flavonoids extracted in both forms |
| Valerian | Decoction or tincture | Needs heat/alcohol to extract valerenic acids |
| Damiana | Smoke or tincture | Aroma-rich; euphoric oils respond to heat & alcohol |

---

The herb’s power lives in its preparation. Choose with care, experiment with awareness, and consider the ritual as part of the medicine.`},{id:"safety",title:"Safety Guidelines & Responsible Use",content:`Psychoactive herbs are powerful allies — and like all potent tools, they carry risks as well as rewards. Respecting these plants means understanding both their gifts and their boundaries. Safe use begins with informed, intentional practice.

---

### 🧭 Core Principles of Safe Use

#### 1. **Start Low, Go Slow**
- Always begin with the smallest effective dose.
- Herbs may affect you more strongly than expected, especially when smoked or taken with other herbs.
- Everyone metabolizes differently — your “small” may be another’s “strong.”

#### 2. **Know the Herb**
- Learn its traditional use, known compounds, preparation method, and interactions.
- Read multiple sources before trying a new herb.
- Avoid TikTok/herb trend misinformation — trust botanical science + ancestral knowledge.

#### 3. **Don’t Stack Carelessly**
- Combining herbs with similar effects can overwhelm your system.
- Example: Mixing Kava (GABA) with Valerian (also GABA) can cause dizziness or sedation.
- Avoid mixing multiple stimulants, sedatives, or serotonergics without deep knowledge.

---

### 💊 Medication Interactions

| Drug Class | Risk with Herbs | Herbs to Watch |
|------------|------------------|----------------|
| SSRIs | Serotonin syndrome | Passionflower, Syrian Rue, St. John’s Wort |
| Benzodiazepines | Over-sedation | Kava, Valerian, Skullcap |
| Antipsychotics | Dopamine disruption | Mucuna, Celastrus |
| MAOIs | Dangerous hypertensive episodes | Syrian Rue + tryptamines |
| Stimulants | Hypertension, anxiety | Guarana, Ephedra, Yohimbe |

- Consult a medical professional if you're taking **any pharmaceuticals**.
- Even supplements like 5-HTP can dangerously combine with herbal MAOIs.

---

### ⚖️ Legal Awareness
- Some herbs are legal to possess but not legal to sell, import, or advertise.
- Herbs like **Kratom**, **Salvia**, or **Blue Lotus** may be restricted by region or country.
- Always check:
  - Federal/national laws
  - State/provincial laws
  - Customs/import restrictions

---

### 🧠 Psychological Readiness

Herbs that affect perception or mood may surface:
- Suppressed emotions
- Traumatic memories
- Internal conflict

Create a **safe mental and physical space** before use:
- Journal or meditate beforehand
- Set a clear intention (healing, insight, relaxation)
- Avoid use during emotional crisis without guidance

---

### 🏠 Setting, Space & Ritual

- Use herbs in a **clean, calm environment**
- Dim lighting, music, nature, or intentional design helps create safety
- Have **integration tools** ready: journal, grounding foods, a friend to talk to
- Respect cultural context and sacred traditions

---

### ❌ Avoid During Pregnancy/Nursing
- Many psychoactive herbs are contraindicated during pregnancy, even in low doses.
- This includes Blue Lotus, Kava, Passionflower, and most adaptogens.
- Use only with explicit professional guidance.

---

### 📚 Keep a Log

Create a dedicated **Herb Journal**:
- Name, date, dose, preparation method
- Mood before/after
- Dreams or insights
- Reactions (positive or adverse)

Helps refine future sessions and detect patterns.

---

### 🧬 Your Body is the Guide

Respect doesn’t mean fear — it means relationship. Listen to your body, trust your intuition, and let each herb introduce itself in its own time.`},{id:"legality",title:"Legal Overview of Psychoactive Herbs",content:`The legality of psychoactive herbs is a moving target — shaped by evolving drug laws, cultural stigma, traditional exemptions, and scientific research. Some herbs are freely available worldwide, while others are banned, regulated, or reside in legal gray areas.

Understanding these differences is essential for safe, responsible, and legal use.

---

### 🌍 Global Legal Landscape

| Herb | United States | Canada | UK/EU | Notes |
|------|----------------|--------|-------|-------|
| **Kava** | ⚠️ Legal (some states restrict) | ❌ Banned | ❌ Restricted | Liver toxicity concerns in EU/CA |
| **Salvia divinorum** | ⚠️ State bans apply | ❌ Controlled | ❌ Banned | Legal federally in US |
| **Kratom** | ⚠️ Legal (some state bans) | ❌ Controlled | ❌ Banned in several EU states | Ongoing regulation debate |
| **Blue Lotus** | ✅ Legal | ✅ Legal | ✅ Legal | Often labeled “not for human consumption” |
| **Ayahuasca** | ❌ Illegal (DMT) | ❌ Illegal | ❌ Illegal | Religious exceptions in Brazil, Peru |
| **Cannabis** | ⚠️ State-dependent legality | ✅ Legal | ⚠️ Varies | Psychoactivity varies by chemotype |

> Always check **local, state/province, and national law** before purchase or use.

---

### 📜 Controlled Substance Scheduling

Most countries use a **drug schedule system**:

- **Schedule I (USA):** No accepted medical use, high abuse potential (e.g. DMT, psilocybin)
- **Schedule III–V:** Accepted use with restrictions (e.g. ketamine, anabolic steroids)
- **Unscheduled:** Legal, unregulated, or herbal (unless banned by name)

> Note: Many herbs are **unscheduled but still restricted under analog laws or import bans**.

---

### ✈️ Importing and Shipping

#### ⚠️ Common Issues:
- Seizure at customs due to lack of labeling or import paperwork
- Herbs labeled “incense,” “aromatic use only,” or “not for consumption” to bypass regulation
- Laws may criminalize **intent to consume**, not possession

#### ✅ Safer Practices:
- Buy from vendors based in your country
- Check local restrictions (e.g., Louisiana bans kratom, Salvia, blue lotus)
- Save all invoices and COAs (Certificates of Analysis)

---

### 🏛️ Religious & Cultural Exemptions

Some psychoactive herbs are legally protected **within religious or indigenous contexts**:

- **Ayahuasca:** Legal in Brazil, Peru, and under some U.S. religious groups (UDV, Santo Daime)
- **Peyote:** Legal for Native American Church use in the US
- **Iboga:** Sometimes protected under Bwiti religious rights (varies by country)

Always respect the **cultural sovereignty** of sacred plants and avoid extractive or exploitative practices.

---

### 📚 Keeping Up with Law Changes

Regulations shift constantly. To stay informed:
- Follow botanical legal forums (e.g. r/kratom, Shroomery, MAPS)
- Monitor WHO, UNODC, and local herbal advocacy orgs
- Use legal databases like:
  - **Erowid.org** (user reports + legal data)
  - **PsychedelicAlpha.com** (regulatory updates)
  - **Psychedelic Legal Compass** (legal tools)

---

### 🔒 Summary: Know Before You Grow (or Buy)

| Check | Why it matters |
|-------|----------------|
| National schedule | May ban import, use, or possession |
| State/provincial law | Overrides federal legality in some places |
| Vendor source | International shipping risks seizure |
| Cultural/traditional protection | Respect is legal as well as ethical |

Stay aware, stay respectful, and support legal reform where it serves education, sovereignty, and access.`},{id:"getting-started",title:"How to Choose a Starting Herb",content:`If you're new to psychoactive herbs, it can be hard to know where to begin. Some plants offer gentle relaxation, others spark vivid dreams, and a few can radically shift your perception. This guide will help you choose a first herb that aligns with your goals, needs, and level of experience.

---

### 🎯 Step 1: Define Your Intention

Before touching a leaf or brewing a tea, ask yourself:
- Do I want to **relax**, **focus**, or **dream**?
- Am I curious about **altered states**, or simply looking for natural mood support?
- Am I drawn to a **specific tradition** or healing system?

Your **why** determines your **what.**

---

### 🧭 Step 2: Align Goals with Categories

| Goal | Herb Type | Beginner-Friendly Herbs |
|------|-----------|--------------------------|
| Stress relief | Sedative / Adaptogen | Lemon Balm, Skullcap, Ashwagandha |
| Better sleep | Sedative | Passionflower, California Poppy |
| Dreaming / Lucid states | Oneirogen | Blue Lotus, Mugwort |
| Mood boost | Euphoric / Dopaminergic | Mucuna, Damiana |
| Mental clarity | Nootropic / Cholinergic | Gotu Kola, Celastrus |
| Energy | Adaptogen / Stimulant | Rhodiola, Guarana (low dose) |

---

### ⚠️ Step 3: Avoid Intense Herbs (at first)

Steer clear of the following as a beginner:

| Herb | Reason |
|------|--------|
| Salvia divinorum | Intense dissociative, very short but powerful |
| Syrian Rue (MAOI) | Dangerous if combined incorrectly |
| Iboga | Visionary + potentially toxic in high doses |
| Kratom | Risk of dependence; stimulating at low doses, sedative at high |
| Fly Agaric | Unique pharmacology, often misunderstood |

These are better explored **later**, with education and intention.

---

### 🧪 Step 4: Choose a Gentle Entry Point

Here are 5 starter herbs to match common beginner goals:

#### 1. **Lemon Balm (Melissa officinalis)**
- 🌿 Category: Sedative, Nervine
- 😊 Feels like: Calm focus, anxiety relief
- ☕ Prep: Tea, tincture

#### 2. **Blue Lotus (Nymphaea caerulea)**
- 🌙 Category: Dream, Mood
- ✨ Feels like: Gentle euphoria, enhanced dreams
- 💧 Prep: Smoke, tea, or tincture

#### 3. **Gotu Kola (Centella asiatica)**
- 🧠 Category: Nootropic, Adaptogen
- 💡 Feels like: Quiet mental clarity, grounded cognition
- 🥗 Prep: Powder in smoothies or tea

#### 4. **Damiana (Turnera diffusa)**
- 💘 Category: Euphoric, Aphrodisiac
- 😊 Feels like: Uplifted mood, gentle sociability
- 💨 Prep: Tea, smoke, or tincture

#### 5. **Ashwagandha (Withania somnifera)**
- ⚖️ Category: Adaptogen
- 😌 Feels like: Long-term anxiety reduction, better sleep
- 💊 Prep: Capsules or powder with fat (like milk or ghee)

---

### 📝 Step 5: Track Your Experience

Use a **herb log** to build your own intuitive herbal language:

- Date, dose, method (tea, tincture, etc.)
- Setting (time of day, mood, environment)
- Perceived effects (mental, emotional, physical)
- Dream recall (if relevant)

Over time, this will become your **personal herbal map**.

---

### 🌿 Bonus: Beginner Combinations (Safe Blends)

| Blend | Components | Goal |
|-------|------------|------|
| Lucid Tea | Blue Lotus + Mugwort + Chamomile | Dream enhancement |
| Nerve Ease | Skullcap + Passionflower + Lemon Balm | Calming without sedation |
| Focus Flow | Gotu Kola + Celastrus + Rhodiola | Mental clarity & stamina |

---

Everyone's body is different. What relaxes one person may energize another. Start small, build a relationship with each herb, and let curiosity — not urgency — lead you.`},{id:"dosing",title:"Microdosing vs. Macrodosing: A Guide to Herbal Dosage",content:`The amount of herb you take can completely change how it affects your body and mind. With psychoactive plants, **dose defines experience**. Many herbs are bimodal — meaning low doses may be uplifting or nootropic, while high doses can sedate, overwhelm, or induce visions.

---

### ⚖️ Dosing Spectrum

| Term | Description | Common Use |
|------|-------------|-------------|
| **Microdose** | Sub-perceptual or subtle dose | Daily clarity, mood support, creativity |
| **Threshold dose** | First point of noticeable change | Light dreamwork, nootropic boost |
| **Macrodose** | Strong perceptual shift | Deep introspection, ceremonial work |
| **Heroic dose** | Overwhelming, ego-dissolving experience | Advanced spiritual exploration (not recommended for beginners) |

---

### 💧 What Is Microdosing?

Microdosing is the practice of taking **very small, sub-perceptual amounts** of a psychoactive substance to subtly improve mood, focus, or creative flow without intoxication.

- **Goal:** Subtle uplift, consistency, no altered state
- **Schedule:** 1 day on, 2 days off (or 4-on / 3-off) to avoid tolerance
- **Popular microdosed herbs:**
  - **Celastrus paniculatus:** 2–3 seeds for mental clarity
  - **Blue Lotus:** 5–10 drops of tincture
  - **Kanna:** 5–15 mg of extract for mood balance
  - **Rhodiola:** 50–100 mg for mental stamina

---

### 🌊 What Is Macrodosing?

Macrodosing involves taking a **standard or high dose** — enough to fully activate the herb’s psychoactive potential.

- **Goal:** Introspection, transformation, deep rest, vivid dreams
- **Onset:** May take 30 min to 2 hours depending on method
- **Popular macrodose herbs:**
  - **Calea ternifolia:** 1–2g smoked or tea (dream intensity)
  - **Salvia divinorum:** 10x extract (1 strong hit) for short, visionary episodes
  - **Passionflower:** 2–4g in tea for sedation and mood
  - **Blue Lotus:** 200mg resin or 5g dried petals in tea

---

### 📊 Micro vs. Macro: Comparison Chart

| Herb | Microdose | Macrodose | Notes |
|------|-----------|-----------|-------|
| Celastrus | 2–3 seeds | 10–15 seeds | Nootropic at low, mild euphoria at high |
| Calea | 300–500mg | 1–2g | Dreams scale with dose |
| Blue Lotus | 5–10 drops | 200mg+ resin or 5g tea | Euphoric vs. sedative states |
| Mucuna | 100mg | 500–1000mg | L-Dopa effects increase with dose |
| Kanna | 5–15mg | 50–100mg | Low = mood lift, High = stimulation or sedation |

---

### 🧪 Dosing Factors to Consider

- **Preparation method:** Tinctures absorb faster than teas
- **Body weight and sensitivity:** Start at lower end of range
- **Food intake:** Some herbs absorb better with fat (e.g. Ashwagandha)
- **Experience level:** New users should start with a half dose

---

### ❌ Dosing Mistakes to Avoid

- Re-dosing too early (“I don’t feel anything yet” → double dose = trouble)
- Mixing multiple high-dose herbs
- Forgetting to track dose, time, and response
- Assuming plant = safe (e.g. MAOI risk from Syrian Rue)

---

### 📝 Best Practice: Keep a Dose Log

| Field | Why it helps |
|-------|--------------|
| Herb & prep | To repeat what worked |
| Dose (mg, g, drops) | To dial in sweet spot |
| Time of day | Circadian effects vary |
| Physical/emotional state | Context is everything |
| Outcome / notes | Mood, dreams, physical symptoms |

---

Your optimal dose isn’t on a chart — it’s discovered through slow experimentation, reflection, and respect.`},{id:"history",title:"A Global History of Psychoactive Plants",content:`Psychoactive plants are among the oldest tools in human culture. They’ve been used for thousands of years — in medicine, divination, ceremony, warfare, birth, and death. Their stories stretch across every continent and civilization, reminding us that consciousness itself has always been a landscape we’ve explored.

---

### 🏺 Ancient Egypt
- **Blue Lotus (Nymphaea caerulea):** Considered a sacred flower of rebirth and divine ecstasy.
- Used in wine infusions during temple ceremonies.
- Depicted in tombs, papyri, and statues associated with the gods Nefertem and Ra.

---

### 🌀 Mesoamerica
- **Teonanácatl (“Flesh of the Gods”):** Refers to Psilocybin mushrooms used in Aztec and Mazatec rituals.
- **Ololiuqui:** A morning glory seed with LSA, used for divination.
- **Salvia divinorum:** Used by Mazatec curanderas (healers) for spiritual diagnosis.

> Plants here weren’t just pharmacological — they were spirit allies, teachers, and portals to divine knowledge.

---

### 🌳 Amazon Basin
- **Ayahuasca (Banisteriopsis caapi + admixtures):** Used for centuries (if not millennia) by Shipibo, Asháninka, and many others.
- Considered “La Medicina” — the medicine for healing body and spirit.
- Continues today in shamanic training, community diagnosis, and visionary art.

---

### 🦅 Sub-Saharan Africa
- **Iboga (Tabernanthe iboga):** Sacred to the Bwiti tradition in Gabon and Cameroon.
- Used in rites of passage, ancestor contact, and addiction recovery.
- Western clinics now explore its anti-addictive effects, especially with opioids.

- **Silene capensis (Dream Root):** Used by the Xhosa for dream incubation and receiving guidance.

---

### 🔥 European Folk Magic
- **Mandrake, Henbane, Belladonna:** Hallucinogenic “witch’s herbs” used in flying ointments, midwifery, and folk healing.
- Carried powerful archetypal and symbolic weight.
- Often feared and demonized during witch trials and church expansions.

- **Wormwood:** Used in absinthe, rituals, and to stimulate visions or drive away spirits.

---

### 🧘 South & East Asia
- **Cannabis:** Used in Ayurvedic, Taoist, and Tantric traditions.
- Sacred to Shiva, smoked by sadhus, or infused in bhang during Holi.
- Described in the Atharva Veda as one of the five sacred plants.

- **Tulsi (Holy Basil):** Used for focus, meditation, and harmonizing prana.

---

### ⛩ Shamanic Siberia & Arctic
- **Amanita muscaria (Fly Agaric):** Bright red mushroom with white spots.
- Used in indigenous Siberian traditions for altered states, weather magic, or hunting insight.
- Often consumed in ritual sequences (including recycling of active compounds through urine).

---

### ⏳ Colonial Suppression & Rediscovery
- 16th–20th centuries saw intense efforts to **ban**, **demonize**, and **erase** indigenous plant knowledge.
- Colonial powers outlawed ceremonial plants under "witchcraft" or "narcotics" frameworks.
- Yet even under pressure, plant wisdom persisted — encoded in songs, dreams, and resistance.

---

### 🔄 20th Century to Present
- 1960s–70s: Western psychonauts and ethnobotanists reintroduced plants like peyote, ayahuasca, and psilocybin to public discourse.
- 1990s–2000s: “Legal highs” wave — Salvia, Kratom, Blue Lotus sold online.
- 2020s: Scientific and clinical rebirth — psychedelic therapy, herbal nootropics, and global plant reawakening.

---

### 🌿 Summary Timeline

| Era | Key Herbs | Cultures |
|-----|-----------|----------|
| Ancient (3000 BCE+) | Blue Lotus, Cannabis, Ayahuasca | Egypt, Vedic India, Amazonia |
| Classical (~0–1000 CE) | Mandrake, Fly Agaric, Betel | Europe, Arctic, SE Asia |
| Colonial Suppression | Peyote, Salvia, Tobacco | Americas, Africa |
| Renaissance (~1960s–present) | Psilocybin, Ayahuasca, Kava | Global rediscovery |
| Future | ??? | You help write it |

---

To study these plants is to study humanity — our fears, dreams, and longing to know more. We don’t just use them — we walk with them.`}];function ks(){return B.jsxs("div",{className:"min-h-screen px-4 pt-20",children:[B.jsxs(Pr,{children:[B.jsx("title",{children:"Learn - The Hippie Scientist"}),B.jsx("meta",{name:"description",content:"Educational resources on psychoactive herbs and practices."})]}),B.jsxs(Ye.div,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.8},className:"mb-12 text-center",children:[B.jsx("h1",{className:"text-gradient mb-4 text-5xl font-bold md:text-6xl",children:"🌿 The Hippie Scientist Codex"}),B.jsx("p",{className:"mx-auto max-w-3xl text-xl text-sand",children:"Welcome! Explore each topic below to deepen your understanding."})]}),B.jsx(Mr,{children:B.jsx(xs,{sections:bs})})]})}export{ks as default};

(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["boards"],{"129f":function(t,e){t.exports=Object.is||function(t,e){return t===e?0!==t||1/t===1/e:t!=t&&e!=e}},2532:function(t,e,r){"use strict";var n=r("23e7"),a=r("5a34"),i=r("1d80"),o=r("ab13");n({target:"String",proto:!0,forced:!o("includes")},{includes:function(t){return!!~String(i(this)).indexOf(a(t),arguments.length>1?arguments[1]:void 0)}})},"44e7":function(t,e,r){var n=r("861d"),a=r("c6b6"),i=r("b622"),o=i("match");t.exports=function(t){var e;return n(t)&&(void 0!==(e=t[o])?!!e:"RegExp"==a(t))}},"4d63":function(t,e,r){var n=r("83ab"),a=r("da84"),i=r("94ca"),o=r("7156"),c=r("9bf2").f,s=r("241c").f,u=r("44e7"),d=r("ad6d"),l=r("9f7f"),f=r("6eeb"),v=r("d039"),p=r("69f3").set,h=r("2626"),m=r("b622"),b=m("match"),g=a.RegExp,x=g.prototype,_=/a/g,y=/a/g,B=new g(_)!==_,w=l.UNSUPPORTED_Y,O=n&&i("RegExp",!B||w||v((function(){return y[b]=!1,g(_)!=_||g(y)==y||"/a/i"!=g(_,"i")})));if(O){var V=function(t,e){var r,n=this instanceof V,a=u(t),i=void 0===e;if(!n&&a&&t.constructor===V&&i)return t;B?a&&!i&&(t=t.source):t instanceof V&&(i&&(e=d.call(t)),t=t.source),w&&(r=!!e&&e.indexOf("y")>-1,r&&(e=e.replace(/y/g,"")));var c=o(B?new g(t,e):g(t,e),n?this:x,V);return w&&r&&p(c,{sticky:r}),c},I=function(t){t in V||c(V,t,{configurable:!0,get:function(){return g[t]},set:function(e){g[t]=e}})},S=s(g),C=0;while(S.length>C)I(S[C++]);x.constructor=V,V.prototype=x,f(a,"RegExp",V)}h("RegExp")},"5a34":function(t,e,r){var n=r("44e7");t.exports=function(t){if(n(t))throw TypeError("The method doesn't accept regular expressions");return t}},"60a8":function(t,e,r){"use strict";r.r(e);var n=function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("v-row",{style:{maxHeight:"calc(100vh - 88px)"},attrs:{"no-gutters":""}},[r("v-col",{style:{maxHeight:"inherit",overflowY:"auto"},attrs:{cols:"6",lg:"4"}},[r("v-list",[r("v-list-item",[r("v-list-item-content",[r("v-list-item-title",{staticClass:"headline"},[r("b",[t._v("Select Your Board")])])],1)],1),r("v-list-item",[r("v-text-field",{attrs:{label:"Search","append-icon":"mdi-magnify"},model:{value:t.search,callback:function(e){t.search=e},expression:"search"}})],1),r("v-divider"),this.search.trim()&&!t.searchBoards.length?r("v-list-item",[r("v-list-item-content",[r("v-list-item-subtitle",[t._v("No boards found that match that search")])],1)],1):t._e(),t.cores.length?t._e():r("v-list-item",[r("v-list-item-content",[r("v-list-item-subtitle",[t._v(" No board data loaded, try "),r("router-link",{attrs:{to:"/tools/servers"}},[t._v("selecting a server")]),t._v(" to load it in. ")],1)],1)],1),t._l(t.searchBoards,(function(e){return r("v-list-item",{key:e.uuid,attrs:{"input-value":t.currentBoard&&t.currentBoard.uuid===e.uuid,"two-line":""},on:{click:function(r){return t.setCurrent(e)}}},[r("v-list-item-content",[r("v-tooltip",{attrs:{top:""},scopedSlots:t._u([{key:"activator",fn:function(n){var a=n.on;return[r("v-list-item-title",t._g({class:t.currentBoard&&t.currentBoard.uuid===e.uuid?"primary--text":void 0},a),[t._v(" "+t._s(e.name)+" ")])]}}],null,!0)},[r("span",[t._v(t._s(e.name))])]),r("v-list-item-subtitle",[t._v(" "+t._s((t.cores.find((function(t){return e.fqbn.includes(t.coreId+":")}))||{name:""}).name)+" ")])],1)],1)})),t._l(this.search.trim()?[]:t.cores,(function(e){return r("v-list-group",{directives:[{name:"show",rawName:"v-show",value:t.findBoards({query:{fqbn:new RegExp("^"+e.coreId+":")}}).total,expression:"findBoards({\n          query: { fqbn: new RegExp(`^${core.coreId}:`) },\n        }).total"}],key:e.uuid,attrs:{value:t.currentBoard&&t.currentBoard.fqbn.includes(e.coreId+":")},scopedSlots:t._u([{key:"activator",fn:function(){return[r("v-list-item-title",{class:t.currentBoard&&t.currentBoard.fqbn.includes(e.coreId+":")?"primary--text":void 0},[t._v(" "+t._s(e.name)+" ")])]},proxy:!0}],null,!0)},t._l(t.findBoards({query:{fqbn:new RegExp("^"+e.coreId+":")}}).data,(function(e){return r("v-list-item",{key:e.uuid,attrs:{"input-value":t.currentBoard&&t.currentBoard.uuid===e.uuid},on:{click:function(r){return t.setCurrent(e)}}},[r("v-tooltip",{attrs:{top:""},scopedSlots:t._u([{key:"activator",fn:function(n){var a=n.on;return[r("v-list-item-title",t._g({staticClass:"pl-4"},a),[t._v(t._s(e.name))])]}}],null,!0)},[r("span",[t._v(t._s(e.name))])])],1)})),1)}))],2)],1),r("v-col",{style:{maxHeight:"inherit",overflowY:"auto"},attrs:{cols:"6",lg:"8"}},[t.currentBoard?r("v-card",{attrs:{elevation:"0"}},[r("v-card-title",{staticClass:"display-1"},[t._v(" "+t._s(t.currentBoard.name)+" Settings ")]),t.currentBoard.config_options?r("v-card-text",[r("v-row",t._l(t.currentBoard.config_options,(function(e,n){return r("v-col",{key:n,attrs:{cols:"12",lg:"4"}},[r("v-select",{attrs:{items:e.values,value:(e.values.find((function(t){return t.selected}))||{}).value||null,label:e.option_label,"item-text":"value_label"},on:{input:function(e){return t.updateValue(n,e)}}})],1)})),1)],1):r("v-card-text",[t._v(" This board has no configuration options. ")])],1):t._e()],1)],1)},a=[],i=(r("99af"),r("4de4"),r("7db0"),r("caad"),r("d81d"),r("13d5"),r("d3b7"),r("4d63"),r("ac1f"),r("25f0"),r("2532"),r("5319"),r("841c"),r("498a"),r("ddb0"),r("2909")),o=r("5530"),c=r("2f62"),s={data:function(){return{featured:["arduino:avr","esp8266:esp8266"],search:""}},computed:Object(o["a"])(Object(o["a"])(Object(o["a"])({},Object(c["b"])("cores",{findCores:"find"})),Object(c["b"])("boards",{findBoards:"find"})),{},{cores:function(){var t=this,e=this.findCores({query:{$sort:{name:1}}}).data;return[].concat(Object(i["a"])(e.filter((function(e){return t.featured.includes(e.coreId)}))),Object(i["a"])(e.filter((function(e){return!t.featured.includes(e.coreId)}))))},searchBoards:function(){if(!this.search.trim())return[];var t=new RegExp("(".concat(this.search.trim().replace(/\s+/g,")|("),")"),"i");return this.findBoards({query:{$or:[{name:t},{fqbn:t}],$sort:{name:1}}}).data},currentBoard:function(){var t=this.$FeathersVuex.api.Board;return t.findInStore({query:{uuid:this.$store.getters.currentBoard}}).data[0]}}),methods:{updateValue:function(t,e){var r=this.currentBoard.config_options.map((function(r,n){return t!==n?r:Object(o["a"])(Object(o["a"])({},r),{},{values:r.values.map((function(t){return Object(o["a"])(Object(o["a"])({},t),{},{selected:t.value===e})}))})})),n=r.reduce((function(t,e){return t[e.option]=(e.values.find((function(t){return t.selected}))||{}).value,t}),{});new this.$FeathersVuex.api.Board(Object(o["a"])(Object(o["a"])({},this.currentBoard),{},{config_options:r,config:n})).save()},setCurrent:function(t){this.$store.commit("setCurrentBoard",t.uuid)}},mounted:function(){var t=this.$FeathersVuex.api.Board;t.find({query:{$limit:9999}})}},u=s,d=r("2877"),l=r("6544"),f=r.n(l),v=r("b0af"),p=r("99d9"),h=r("62ad"),m=r("ce7e"),b=r("8860"),g=r("56b0"),x=r("da13"),_=r("5d23"),y=r("0fd9"),B=r("b974"),w=r("8654"),O=r("3a2f"),V=Object(d["a"])(u,n,a,!1,null,null,null);e["default"]=V.exports;f()(V,{VCard:v["a"],VCardText:p["b"],VCardTitle:p["c"],VCol:h["a"],VDivider:m["a"],VList:b["a"],VListGroup:g["a"],VListItem:x["a"],VListItemContent:_["a"],VListItemSubtitle:_["b"],VListItemTitle:_["c"],VRow:y["a"],VSelect:B["a"],VTextField:w["a"],VTooltip:O["a"]})},"841c":function(t,e,r){"use strict";var n=r("d784"),a=r("825a"),i=r("1d80"),o=r("129f"),c=r("14c3");n("search",1,(function(t,e,r){return[function(e){var r=i(this),n=void 0==e?void 0:e[t];return void 0!==n?n.call(e,r):new RegExp(e)[t](String(r))},function(t){var n=r(e,t,this);if(n.done)return n.value;var i=a(t),s=String(this),u=i.lastIndex;o(u,0)||(i.lastIndex=0);var d=c(i,s);return o(i.lastIndex,u)||(i.lastIndex=u),null===d?-1:d.index}]}))},ab13:function(t,e,r){var n=r("b622"),a=n("match");t.exports=function(t){var e=/./;try{"/./"[t](e)}catch(r){try{return e[a]=!1,"/./"[t](e)}catch(n){}}return!1}},caad:function(t,e,r){"use strict";var n=r("23e7"),a=r("4d64").includes,i=r("44d2"),o=r("ae40"),c=o("indexOf",{ACCESSORS:!0,1:0});n({target:"Array",proto:!0,forced:!c},{includes:function(t){return a(this,t,arguments.length>1?arguments[1]:void 0)}}),i("includes")}}]);
//# sourceMappingURL=boards.ee736436.js.map
(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["code"],{"0f5c":function(e,t,i){var n=i("159a");function s(e,t,i){return null==e?e:n(e,t,i)}e.exports=s},1604:function(e,t,i){"use strict";i("17eb")},"17eb":function(e,t,i){},"3e81":function(e,t,i){"use strict";i.r(t);var n=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",[i("v-navigation-drawer",{attrs:{app:"",clipped:"",permanent:""},scopedSlots:e._u([{key:"append",fn:function(){return[i("project-sync-tools",{attrs:{project:e.currentProject}})]},proxy:!0}])},[i("v-menu",{attrs:{"offset-y":"",bottom:""},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-list-item",e._g({},n),[i("v-tooltip",{attrs:{top:""},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-list-item-title",e._g({},n),[i("v-icon",{attrs:{left:""}},[e._v("mdi-folder-multiple-outline")]),e._v(" "+e._s(e.currentProject?e.currentProject.name:"Select a Project")+" "),i("v-icon",{attrs:{right:""}},[e._v("mdi-chevron-down")])],1)]}}],null,!0)},[i("span",[e._v(" "+e._s(e.currentProject?e.currentProject.name:"Select a Project")+" ")])]),e.currentProject?i("v-list-item-action",[i("files-add-folder",{attrs:{project:e.currentProject},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-btn",e._g({attrs:{icon:""},on:{click:function(e){e.stopPropagation()}}},n),[i("v-icon",[e._v("mdi-folder-plus-outline")])],1)]}}],null,!0)})],1):e._e(),e.currentProject?i("v-list-item-action",[i("files-add-file",{attrs:{project:e.currentProject},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-btn",e._g({attrs:{icon:""},on:{click:function(e){e.stopPropagation()}}},n),[i("v-icon",[e._v("mdi-file-plus-outline")])],1)]}}],null,!0)})],1):e._e()],1)]}}])},[i("recent-list",{attrs:{"manage-label":"Project Manger...","manage-link":"/tools/projects",service:"projects"}})],1),i("v-divider"),i("files-tree")],1),i("v-main",{staticStyle:{"padding-left":"256px"}},[e.currentProject?i("files-editor"):i("project-manager")],1)],1)},s=[],r=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("div",{style:{height:"calc( 100% - 61px )"},attrs:{id:"tree-wrap"},on:{contextmenu:function(t){return e.showMenu(t)}}},[i("v-treeview",{attrs:{open:e.open,items:e.items,"item-key":"name",activatable:"","open-on-click":"",dense:"","return-object":"",active:e.active},on:{"update:active":[function(t){e.active=t},function(t){return e.updateActive(t[0])}]},scopedSlots:e._u([{key:"prepend",fn:function(t){var n=t.item,s=t.open;return[n.children?i("v-icon",[e._v(" "+e._s(s?"mdi-folder-open":"mdi-folder")+" ")]):i("v-icon",[e._v(" "+e._s(e.files[n.name.split(".").pop()]||e.files.txt)+" ")])]}},{key:"append",fn:function(t){var n=t.item;return[e.get(n,"editor.body")?i("v-icon",[e._v("mdi-circle-medium")]):e._e()]}},{key:"label",fn:function(t){var n=t.item;return[i("v-tooltip",{attrs:{top:""},scopedSlots:e._u([{key:"activator",fn:function(t){var s=t.on;return[i("div",e._g({on:{contextmenu:function(t){return t.stopPropagation(),function(t){return e.showMenu(t,n)}(t)}}},s),[e._v(" "+e._s(n.name.split("/").pop())+" ")])]}}],null,!0)},[i("span",[e._v(e._s(n.name.split("/").pop()))])])]}}]),model:{value:e.tree,callback:function(t){e.tree=t},expression:"tree"}}),i("v-menu",{attrs:{"position-x":e.menuX,"position-y":e.menuY,absolute:"","offset-y":"","close-on-click":""},model:{value:e.isMenu,callback:function(t){e.isMenu=t},expression:"isMenu"}},[i("v-list",{staticClass:"py-0",attrs:{dense:""}},[i("files-add-file",{attrs:{project:e.currentProject,path:e.menuItem.ref&&e.menuItem.ref.replace(/[^/]+$/,"")},on:{open:function(t){e.isMenu=!1}},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-list-item",e._g({},n),[i("v-list-item-title",[i("v-icon",{attrs:{left:""}},[e._v("mdi-file-plus-outline")]),e._v(" New File ")],1)],1)]}}])}),i("files-add-folder",{attrs:{project:e.currentProject,path:e.menuItem.ref&&e.menuItem.ref.replace(/[^/]+$/,"")},on:{open:function(t){e.isMenu=!1}},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-list-item",e._g({},n),[i("v-list-item-title",[i("v-icon",{attrs:{left:""}},[e._v("mdi-folder-plus-outline")]),e._v(" New Folder ")],1)],1)]}}])}),i("v-dialog",{attrs:{"max-width":"300"},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-list-item",e._g({directives:[{name:"show",rawName:"v-show",value:!e.menuItem.main&&!e.menuItem.root,expression:"!menuItem.main && !menuItem.root"}]},n),[i("v-list-item-title",[i("v-icon",{attrs:{left:""}},[e._v("mdi-trash-can-outline")]),e._v(" Delete ")],1)],1)]}}]),model:{value:e.removeDialog,callback:function(t){e.removeDialog=t},expression:"removeDialog"}},[i("v-card",[i("v-card-title",[e._v(" Delete "+e._s(e.menuItem._id?"File":"Folder")+"? ")]),i("v-card-text",[e._v(" Delete the following "+e._s(e.menuItem._id?"file?":"folder and all the sub-files/folders within it?")+" "),i("br"),i("code",[e._v(" "+e._s(e.menuItem.ref&&e.menuItem.ref.split(e.currentProject.ref+"/").pop())+" ")])]),i("v-card-actions",[i("v-spacer"),i("v-btn",{attrs:{text:""},on:{click:function(t){e.removeDialog=!1}}},[e._v(" Cancel ")]),i("v-btn",{attrs:{color:"primary"},on:{click:e.removeFile}},[e._v(" Confirm ")])],1)],1)],1)],1)],1)],1)},o=[],a=(i("99af"),i("4de4"),i("4160"),i("c975"),i("13d5"),i("b0c0"),i("b64b"),i("ac1f"),i("5319"),i("1276"),i("159b"),i("2909")),c=i("5530"),l=i("2f62"),d=i("0f5c"),u=i.n(d),h=i("9b02"),p=i.n(h),m=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("v-dialog",{attrs:{"max-width":"500px"},scopedSlots:e._u([{key:"activator",fn:function(t){var i=t.on;return[e._t("activator",null,{on:i})]}}],null,!0),model:{value:e.dialog,callback:function(t){e.dialog=t},expression:"dialog"}},[i("v-card",[i("v-card-title",[e._v(" Add File ")]),i("v-card-text",[i("v-row",[i("v-col",{attrs:{cols:"12"}},[i("v-select",{attrs:{items:e.items,label:"Location",outlined:""},model:{value:e.location,callback:function(t){e.location=t},expression:"location"}})],1),i("v-col",{attrs:{cols:"12",sm:"9"}},[i("v-text-field",{attrs:{"error-messages":e.nameError,label:"Name",outlined:""},model:{value:e.name,callback:function(t){e.name="string"===typeof t?t.trim():t},expression:"name"}})],1),i("v-col",{attrs:{cols:"12",sm:"3"}},[i("v-select",{attrs:{items:[".c",".cpp",".h",".ino",".md",".txt"],label:"Type",outlined:""},model:{value:e.ext,callback:function(t){e.ext=t},expression:"ext"}})],1),e.name?i("v-col",{staticClass:"text-caption",attrs:{cols:"12"}},[e._v(" "+e._s(e.project.ref)+"/"+e._s(e.location)+e._s(e.name)+e._s(e.ext)+" ")]):e._e()],1)],1),i("v-card-actions",[i("v-spacer"),i("v-btn",{attrs:{text:""},on:{click:function(t){e.dialog=!1}}},[e._v(" Cancel ")]),i("v-btn",{attrs:{disabled:!e.name||!!e.nameError,depressed:"",color:"primary"},on:{click:e.add}},[e._v(" Add File ")])],1)],1)],1)},v=[],f=(i("45fc"),i("96cf"),i("1da1")),g={props:{project:{type:Object,default:function(){return{}}},path:{type:String,default:""}},data:function(){return{dialog:!1,name:"",location:"",ext:".c"}},computed:Object(c["a"])(Object(c["a"])({},Object(l["b"])("files",{findFiles:"find"})),{},{nameError:function(){return/[^\w-.]/.test(this.name)?"File name can only contain a-z, A-Z, 0-9, ., - or _ characters.":""},items:function(){var e,t=this;if(null===(e=this.project)||void 0===e||!e.ref)return[];var i=this.findFiles({query:{projectId:this.project.uuid}}).data,n=i.reduce((function(e,t){return u()(e,t.name.replace(/\./g,"").replace(/\//g,"."),t)}),{}),s=function e(i,n){return Object.keys(i).reduce((function(s,r){if(i[r]._id)return s;var o="".concat(n).concat(r,"/");return[].concat(Object(a["a"])(s),[{text:o,value:o.replace("".concat(t.project.ref,"/"),"")}],Object(a["a"])(e(i[r],o)))}),[])},r=[{text:"".concat(this.project.ref,"/"),value:""}].concat(Object(a["a"])(s(n,"".concat(this.project.ref,"/"))));return r},fileType:function(){switch(this.ext){case".ino":return"text/x-arduino";case".c":case".cpp":case".h":return"text/x-c";case".md":return"text/markdown";default:return"text/plain"}}}),methods:{add:function(){var e=this;return Object(f["a"])(regeneratorRuntime.mark((function t(){var i,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(e.name&&!e.nameError){t.next=2;break}return t.abrupt("return");case 2:return i=e.$FeathersVuex.api.File,n=new i({name:"".concat(e.location).concat(e.name).concat(e.ext),ref:"".concat(e.project.ref,"/").concat(e.location).concat(e.name).concat(e.ext),body:"",contentType:e.fileType,main:!1,projectId:e.project.uuid}),t.next=6,n.save();case 6:e.$store.commit("setCurrentFile",n.uuid),e.name="",e.dialog=!1;case 9:case"end":return t.stop()}}),t)})))()}},mounted:function(){this.project.ref&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""))},watch:{"project.ref":{handler:function(e,t){var i=this;e&&e!==t&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""),this.items.some((function(e){return e.value===i.location}))||(this.location=""))}},path:function(e,t){var i=this;e&&e!==t&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""),this.items.some((function(e){return e.value===i.location}))||(this.location=""))},dialog:function(e,t){e!==t&&(e?this.$emit("open"):this.$emit("close"))}}},b=g,j=i("2877"),y=i("6544"),x=i.n(y),_=i("8336"),S=i("b0af"),C=i("99d9"),O=i("62ad"),w=i("169a"),I=i("0fd9"),k=i("b974"),V=i("2fa4"),$=i("8654"),F=Object(j["a"])(b,m,v,!1,null,null,null),P=F.exports;x()(F,{VBtn:_["a"],VCard:S["a"],VCardActions:C["a"],VCardText:C["b"],VCardTitle:C["c"],VCol:O["a"],VDialog:w["a"],VRow:I["a"],VSelect:k["a"],VSpacer:V["a"],VTextField:$["a"]});var T=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("v-dialog",{attrs:{"max-width":"500px"},scopedSlots:e._u([{key:"activator",fn:function(t){var i=t.on;return[e._t("activator",null,{on:i})]}}],null,!0),model:{value:e.dialog,callback:function(t){e.dialog=t},expression:"dialog"}},[i("v-card",[i("v-card-title",[e._v(" Add Folder ")]),i("v-card-text",[i("v-row",[i("v-col",{attrs:{cols:"12"}},[i("v-select",{attrs:{items:e.items,label:"Location",outlined:""},model:{value:e.location,callback:function(t){e.location=t},expression:"location"}})],1),i("v-col",{attrs:{cols:"12"}},[i("v-text-field",{attrs:{"error-messages":e.nameError,label:"Name",outlined:""},model:{value:e.name,callback:function(t){e.name="string"===typeof t?t.trim():t},expression:"name"}})],1),e.name?i("v-col",{staticClass:"text-caption",attrs:{cols:"12"}},[e._v(" "+e._s(e.project.ref)+"/"+e._s(e.location)+e._s(e.name)+"/ ")]):e._e()],1)],1),i("v-card-actions",[i("v-spacer"),i("v-btn",{attrs:{text:""},on:{click:function(t){e.dialog=!1}}},[e._v(" Cancel ")]),i("v-btn",{attrs:{disabled:!e.name||!!e.nameError,depressed:"",color:"primary"},on:{click:e.add}},[e._v(" Add Folder ")])],1)],1)],1)},A=[],L={props:{project:{type:Object,default:function(){return{}}},path:{type:String,default:""}},data:function(){return{dialog:!1,name:"",location:""}},computed:Object(c["a"])(Object(c["a"])({},Object(l["b"])("files",{findFiles:"find"})),{},{nameError:function(){return/[^\w-]/.test(this.name)?"Folder name can only contain a-z, A-Z, 0-9, - or _ characters.":""},items:function(){var e,t=this;if(null===(e=this.project)||void 0===e||!e.ref)return[];var i=this.findFiles({query:{projectId:this.project.uuid}}).data,n=i.reduce((function(e,t){return u()(e,t.name.replace(/\./g,"").replace(/\//g,"."),t)}),{}),s=function e(i,n){return Object.keys(i).reduce((function(s,r){if(i[r]._id)return s;var o="".concat(n).concat(r,"/");return[].concat(Object(a["a"])(s),[{text:o,value:o.replace("".concat(t.project.ref,"/"),"")}],Object(a["a"])(e(i[r],o)))}),[])},r=[{text:"".concat(this.project.ref,"/"),value:""}].concat(Object(a["a"])(s(n,"".concat(this.project.ref,"/"))));return r}}),methods:{add:function(){var e=this;return Object(f["a"])(regeneratorRuntime.mark((function t(){var i,n;return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:if(e.name&&!e.nameError){t.next=2;break}return t.abrupt("return");case 2:return i=e.$FeathersVuex.api.File,n=new i({name:"".concat(e.location).concat(e.name,"/.gitkeep"),ref:"".concat(e.project.ref,"/").concat(e.location).concat(e.name,"/.gitkeep"),body:"",contentType:"text/plain",main:!1,projectId:e.project.uuid}),t.next=6,n.save();case 6:e.name="",e.dialog=!1;case 8:case"end":return t.stop()}}),t)})))()}},mounted:function(){this.project.ref&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""))},watch:{"project.ref":{handler:function(e,t){var i=this;e&&e!==t&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""),this.items.some((function(e){return e.value===i.location}))||(this.location=""))}},path:function(e,t){var i=this;e&&e!==t&&(this.location=this.path.replace("".concat(this.project.ref,"/"),""),this.items.some((function(e){return e.value===i.location}))||(this.location=""))},dialog:function(e,t){e!==t&&(e?this.$emit("open"):this.$emit("close"))}}},E=L,D=Object(j["a"])(E,T,A,!1,null,null,null),N=D.exports;x()(D,{VBtn:_["a"],VCard:S["a"],VCardActions:C["a"],VCardText:C["b"],VCardTitle:C["c"],VCol:O["a"],VDialog:w["a"],VRow:I["a"],VSelect:k["a"],VSpacer:V["a"],VTextField:$["a"]});var K={components:{FilesAddFile:P,FilesAddFolder:N},data:function(){return{open:["public"],files:{html:"mdi-language-html5",js:"mdi-nodejs",json:"mdi-json",md:"mdi-language-markdown-outline",pdf:"mdi-file-pdf",png:"mdi-file-image",txt:"mdi-file-document-outline",ino:"mdi-file-code-outline",h:"mdi-file-code-outline",c:"mdi-file-code-outline",cpp:"mdi-file-code-outline",xls:"mdi-file-excel"},tree:[],active:[],menuItem:{},isMenu:!1,removeDialog:!1,menuX:0,menuY:0,get:p.a}},computed:Object(c["a"])(Object(c["a"])({},Object(l["b"])("files",{findFiles:"find"})),{},{currentFile:function(){var e=this.$FeathersVuex.api.File;return e.findInStore({query:{uuid:this.$store.getters.currentFile}}).data[0]||{}},currentProject:function(){var e=this.$FeathersVuex.api.Project;return e.findInStore({query:{uuid:this.$store.getters.currentProject}}).data[0]||{}},items:function(){if(!this.currentProject)return[];var e=this.findFiles({query:{projectId:this.currentProject.uuid}}).data,t=e.reduce((function(e,t){return u()(e,t.name.replace(/\./g,"").replace(/\//g,"."),t)}),{}),i=function e(t,i){return Object.keys(t).reduce((function(n,s){if(!t[s]._id)return[].concat(Object(a["a"])(n),[{name:s,ref:"".concat(i).concat(s,"/"),children:e(t[s],"".concat(i).concat(s,"/"))}]);var r=t[s].name.split("/").pop();return".gitkeep"===r?n:[].concat(Object(a["a"])(n),[t[s]])}),[])},n=i(t,"".concat(this.currentProject.ref,"/"));return n}}),methods:{updateActive:function(e){var t;e&&e.uuid&&e.uuid!==(null===(t=this.currentFile)||void 0===t?void 0:t.uuid)&&this.setCurrent(e)},setActive:function(){var e;null!==(e=this.currentFile)&&void 0!==e&&e.uuid&&(this.active=[this.currentFile])},setCurrent:function(e){this.$store.commit("setCurrentFile",e.uuid)},showMenu:function(e,t){var i=this;e.preventDefault(),(t||"tree-wrap"===e.target.id)&&this.currentProject.uuid&&(this.menuItem=t||{ref:"".concat(this.currentProject.ref,"/"),root:!0},this.isMenu=!1,this.menuX=e.clientX,this.menuY=e.clientY,this.$nextTick((function(){i.isMenu=!0})))},removeFile:function(){var e=this;if(this.menuItem)if(this.removeDialog=!1,this.menuItem._id)this.menuItem.remove();else{var t=this.findFiles({query:{projectId:this.currentProject.uuid}}),i=t.data;i.filter((function(t){return 0===t.ref.indexOf(e.menuItem.ref)})).forEach((function(e){return e.remove()}))}}},watch:{active:function(e,t){!e||e.length||t&&!t.length||this.setActive()},currentFile:function(e,t){e&&e.uuid&&e.uuid!==t.uuid&&this.setActive()},removeDialog:function(e,t){e&&e!==t&&(this.isMenu=!1)}},mounted:function(){this.setActive()}},B=K,M=i("132d"),q=i("8860"),R=i("da13"),W=i("5d23"),X=i("e449"),Y=i("3a2f"),z=(i("fa9e"),i("0789")),J=i("3206"),Z=i("a9ad"),G=i("58df"),H=i("80d2");const Q=Object(G["a"])(Z["a"],Object(J["a"])("treeview")),U={activatable:Boolean,activeClass:{type:String,default:"v-treeview-node--active"},color:{type:String,default:"primary"},expandIcon:{type:String,default:"$subgroup"},indeterminateIcon:{type:String,default:"$checkboxIndeterminate"},itemChildren:{type:String,default:"children"},itemDisabled:{type:String,default:"disabled"},itemKey:{type:String,default:"id"},itemText:{type:String,default:"name"},loadChildren:Function,loadingIcon:{type:String,default:"$loading"},offIcon:{type:String,default:"$checkboxOff"},onIcon:{type:String,default:"$checkboxOn"},openOnClick:Boolean,rounded:Boolean,selectable:Boolean,selectedColor:{type:String,default:"accent"},shaped:Boolean,transition:Boolean,selectionType:{type:String,default:"leaf",validator:e=>["leaf","independent"].includes(e)}},ee=Q.extend().extend({name:"v-treeview-node",inject:{treeview:{default:null}},props:{level:Number,item:{type:Object,default:()=>null},parentIsDisabled:Boolean,...U},data:()=>({hasLoaded:!1,isActive:!1,isIndeterminate:!1,isLoading:!1,isOpen:!1,isSelected:!1}),computed:{disabled(){return Object(H["p"])(this.item,this.itemDisabled)||this.parentIsDisabled&&"leaf"===this.selectionType},key(){return Object(H["p"])(this.item,this.itemKey)},children(){const e=Object(H["p"])(this.item,this.itemChildren);return e&&e.filter(e=>!this.treeview.isExcluded(Object(H["p"])(e,this.itemKey)))},text(){return Object(H["p"])(this.item,this.itemText)},scopedProps(){return{item:this.item,leaf:!this.children,selected:this.isSelected,indeterminate:this.isIndeterminate,active:this.isActive,open:this.isOpen}},computedIcon(){return this.isIndeterminate?this.indeterminateIcon:this.isSelected?this.onIcon:this.offIcon},hasChildren(){return!!this.children&&(!!this.children.length||!!this.loadChildren)}},created(){this.treeview.register(this)},beforeDestroy(){this.treeview.unregister(this)},methods:{checkChildren(){return new Promise(e=>{if(!this.children||this.children.length||!this.loadChildren||this.hasLoaded)return e();this.isLoading=!0,e(this.loadChildren(this.item))}).then(()=>{this.isLoading=!1,this.hasLoaded=!0})},open(){this.isOpen=!this.isOpen,this.treeview.updateOpen(this.key,this.isOpen),this.treeview.emitOpen()},genLabel(){const e=[];return this.$scopedSlots.label?e.push(this.$scopedSlots.label(this.scopedProps)):e.push(this.text),this.$createElement("div",{slot:"label",staticClass:"v-treeview-node__label"},e)},genPrependSlot(){return this.$scopedSlots.prepend?this.$createElement("div",{staticClass:"v-treeview-node__prepend"},this.$scopedSlots.prepend(this.scopedProps)):null},genAppendSlot(){return this.$scopedSlots.append?this.$createElement("div",{staticClass:"v-treeview-node__append"},this.$scopedSlots.append(this.scopedProps)):null},genContent(){const e=[this.genPrependSlot(),this.genLabel(),this.genAppendSlot()];return this.$createElement("div",{staticClass:"v-treeview-node__content"},e)},genToggle(){return this.$createElement(M["a"],{staticClass:"v-treeview-node__toggle",class:{"v-treeview-node__toggle--open":this.isOpen,"v-treeview-node__toggle--loading":this.isLoading},slot:"prepend",on:{click:e=>{e.stopPropagation(),this.isLoading||this.checkChildren().then(()=>this.open())}}},[this.isLoading?this.loadingIcon:this.expandIcon])},genCheckbox(){return this.$createElement(M["a"],{staticClass:"v-treeview-node__checkbox",props:{color:this.isSelected||this.isIndeterminate?this.selectedColor:void 0,disabled:this.disabled},on:{click:e=>{e.stopPropagation(),this.isLoading||this.checkChildren().then(()=>{this.$nextTick(()=>{this.isSelected=!this.isSelected,this.isIndeterminate=!1,this.treeview.updateSelected(this.key,this.isSelected),this.treeview.emitSelected()})})}}},[this.computedIcon])},genLevel(e){return Object(H["i"])(e).map(()=>this.$createElement("div",{staticClass:"v-treeview-node__level"}))},genNode(){const e=[this.genContent()];return this.selectable&&e.unshift(this.genCheckbox()),this.hasChildren?e.unshift(this.genToggle()):e.unshift(...this.genLevel(1)),e.unshift(...this.genLevel(this.level)),this.$createElement("div",this.setTextColor(this.isActive&&this.color,{staticClass:"v-treeview-node__root",class:{[this.activeClass]:this.isActive},on:{click:()=>{this.openOnClick&&this.hasChildren?this.checkChildren().then(this.open):this.activatable&&!this.disabled&&(this.isActive=!this.isActive,this.treeview.updateActive(this.key,this.isActive),this.treeview.emitActive())}}}),e)},genChild(e,t){return this.$createElement(ee,{key:Object(H["p"])(e,this.itemKey),props:{activatable:this.activatable,activeClass:this.activeClass,item:e,selectable:this.selectable,selectedColor:this.selectedColor,color:this.color,expandIcon:this.expandIcon,indeterminateIcon:this.indeterminateIcon,offIcon:this.offIcon,onIcon:this.onIcon,loadingIcon:this.loadingIcon,itemKey:this.itemKey,itemText:this.itemText,itemDisabled:this.itemDisabled,itemChildren:this.itemChildren,loadChildren:this.loadChildren,transition:this.transition,openOnClick:this.openOnClick,rounded:this.rounded,shaped:this.shaped,level:this.level+1,selectionType:this.selectionType,parentIsDisabled:t},scopedSlots:this.$scopedSlots})},genChildrenWrapper(){if(!this.isOpen||!this.children)return null;const e=[this.children.map(e=>this.genChild(e,this.disabled))];return this.$createElement("div",{staticClass:"v-treeview-node__children"},e)},genTransition(){return this.$createElement(z["a"],[this.genChildrenWrapper()])}},render(e){const t=[this.genNode()];return this.transition?t.push(this.genTransition()):t.push(this.genChildrenWrapper()),e("div",{staticClass:"v-treeview-node",class:{"v-treeview-node--leaf":!this.hasChildren,"v-treeview-node--click":this.openOnClick,"v-treeview-node--disabled":this.disabled,"v-treeview-node--rounded":this.rounded,"v-treeview-node--shaped":this.shaped,"v-treeview-node--selected":this.isSelected},attrs:{"aria-expanded":String(this.isOpen)}},t)}});var te=ee,ie=i("7560"),ne=i("d9bd");function se(e,t,i){const n=Object(H["p"])(e,i);return n.toLocaleLowerCase().indexOf(t.toLocaleLowerCase())>-1}function re(e,t,i,n,s,r,o){if(e(t,i,s))return!0;const a=Object(H["p"])(t,r);if(a){let t=!1;for(let c=0;c<a.length;c++)re(e,a[c],i,n,s,r,o)&&(t=!0);if(t)return!0}return o.add(Object(H["p"])(t,n)),!1}var oe=Object(G["a"])(Object(J["b"])("treeview"),ie["a"]).extend({name:"v-treeview",provide(){return{treeview:this}},props:{active:{type:Array,default:()=>[]},dense:Boolean,filter:Function,hoverable:Boolean,items:{type:Array,default:()=>[]},multipleActive:Boolean,open:{type:Array,default:()=>[]},openAll:Boolean,returnObject:{type:Boolean,default:!1},search:String,value:{type:Array,default:()=>[]},...U},data:()=>({level:-1,activeCache:new Set,nodes:{},openCache:new Set,selectedCache:new Set}),computed:{excludedItems(){const e=new Set;if(!this.search)return e;for(let t=0;t<this.items.length;t++)re(this.filter||se,this.items[t],this.search,this.itemKey,this.itemText,this.itemChildren,e);return e}},watch:{items:{handler(){const e=Object.keys(this.nodes).map(e=>Object(H["p"])(this.nodes[e].item,this.itemKey)),t=this.getKeys(this.items),i=Object(H["c"])(t,e);if(!i.length&&t.length<e.length)return;i.forEach(e=>delete this.nodes[e]);const n=[...this.selectedCache];this.selectedCache=new Set,this.activeCache=new Set,this.openCache=new Set,this.buildTree(this.items),Object(H["k"])(n,[...this.selectedCache])||this.emitSelected()},deep:!0},active(e){this.handleNodeCacheWatcher(e,this.activeCache,this.updateActive,this.emitActive)},value(e){this.handleNodeCacheWatcher(e,this.selectedCache,this.updateSelected,this.emitSelected)},open(e){this.handleNodeCacheWatcher(e,this.openCache,this.updateOpen,this.emitOpen)}},created(){const e=e=>this.returnObject?Object(H["p"])(e,this.itemKey):e;this.buildTree(this.items);for(const t of this.value.map(e))this.updateSelected(t,!0,!0);for(const t of this.active.map(e))this.updateActive(t,!0)},mounted(){(this.$slots.prepend||this.$slots.append)&&Object(ne["c"])("The prepend and append slots require a slot-scope attribute",this),this.openAll?this.updateAll(!0):(this.open.forEach(e=>this.updateOpen(this.returnObject?Object(H["p"])(e,this.itemKey):e,!0)),this.emitOpen())},methods:{updateAll(e){Object.keys(this.nodes).forEach(t=>this.updateOpen(Object(H["p"])(this.nodes[t].item,this.itemKey),e)),this.emitOpen()},getKeys(e,t=[]){for(let i=0;i<e.length;i++){const n=Object(H["p"])(e[i],this.itemKey);t.push(n);const s=Object(H["p"])(e[i],this.itemChildren);s&&t.push(...this.getKeys(s))}return t},buildTree(e,t=null){for(let i=0;i<e.length;i++){const n=e[i],s=Object(H["p"])(n,this.itemKey),r=Object(H["p"])(n,this.itemChildren,[]),o=this.nodes.hasOwnProperty(s)?this.nodes[s]:{isSelected:!1,isIndeterminate:!1,isActive:!1,isOpen:!1,vnode:null},a={vnode:o.vnode,parent:t,children:r.map(e=>Object(H["p"])(e,this.itemKey)),item:n};if(this.buildTree(r,s),!this.nodes.hasOwnProperty(s)&&null!==t&&this.nodes.hasOwnProperty(t)?a.isSelected=this.nodes[t].isSelected:(a.isSelected=o.isSelected,a.isIndeterminate=o.isIndeterminate),a.isActive=o.isActive,a.isOpen=o.isOpen,this.nodes[s]=a,r.length){const{isSelected:e,isIndeterminate:t}=this.calculateState(s,this.nodes);a.isSelected=e,a.isIndeterminate=t}!this.nodes[s].isSelected||"independent"!==this.selectionType&&0!==a.children.length||this.selectedCache.add(s),this.nodes[s].isActive&&this.activeCache.add(s),this.nodes[s].isOpen&&this.openCache.add(s),this.updateVnodeState(s)}},calculateState(e,t){const i=t[e].children,n=i.reduce((e,i)=>(e[0]+=+Boolean(t[i].isSelected),e[1]+=+Boolean(t[i].isIndeterminate),e),[0,0]),s=!!i.length&&n[0]===i.length,r=!s&&(n[0]>0||n[1]>0);return{isSelected:s,isIndeterminate:r}},emitOpen(){this.emitNodeCache("update:open",this.openCache)},emitSelected(){this.emitNodeCache("input",this.selectedCache)},emitActive(){this.emitNodeCache("update:active",this.activeCache)},emitNodeCache(e,t){this.$emit(e,this.returnObject?[...t].map(e=>this.nodes[e].item):[...t])},handleNodeCacheWatcher(e,t,i,n){e=this.returnObject?e.map(e=>Object(H["p"])(e,this.itemKey)):e;const s=[...t];Object(H["k"])(s,e)||(s.forEach(e=>i(e,!1)),e.forEach(e=>i(e,!0)),n())},getDescendants(e,t=[]){const i=this.nodes[e].children;t.push(...i);for(let n=0;n<i.length;n++)t=this.getDescendants(i[n],t);return t},getParents(e){let t=this.nodes[e].parent;const i=[];while(null!==t)i.push(t),t=this.nodes[t].parent;return i},register(e){const t=Object(H["p"])(e.item,this.itemKey);this.nodes[t].vnode=e,this.updateVnodeState(t)},unregister(e){const t=Object(H["p"])(e.item,this.itemKey);this.nodes[t]&&(this.nodes[t].vnode=null)},isParent(e){return this.nodes[e].children&&this.nodes[e].children.length},updateActive(e,t){if(!this.nodes.hasOwnProperty(e))return;this.multipleActive||this.activeCache.forEach(e=>{this.nodes[e].isActive=!1,this.updateVnodeState(e),this.activeCache.delete(e)});const i=this.nodes[e];i&&(t?this.activeCache.add(e):this.activeCache.delete(e),i.isActive=t,this.updateVnodeState(e))},updateSelected(e,t,i=!1){if(!this.nodes.hasOwnProperty(e))return;const n=new Map;if("independent"!==this.selectionType){for(const r of this.getDescendants(e))Object(H["p"])(this.nodes[r].item,this.itemDisabled)&&!i||(this.nodes[r].isSelected=t,this.nodes[r].isIndeterminate=!1,n.set(r,t));const s=this.calculateState(e,this.nodes);this.nodes[e].isSelected=t,this.nodes[e].isIndeterminate=s.isIndeterminate,n.set(e,t);for(const t of this.getParents(e)){const e=this.calculateState(t,this.nodes);this.nodes[t].isSelected=e.isSelected,this.nodes[t].isIndeterminate=e.isIndeterminate,n.set(t,e.isSelected)}}else this.nodes[e].isSelected=t,this.nodes[e].isIndeterminate=!1,n.set(e,t);for(const[s,r]of n.entries())this.updateVnodeState(s),"leaf"===this.selectionType&&this.isParent(s)||(!0===r?this.selectedCache.add(s):this.selectedCache.delete(s))},updateOpen(e,t){if(!this.nodes.hasOwnProperty(e))return;const i=this.nodes[e],n=Object(H["p"])(i.item,this.itemChildren);n&&!n.length&&i.vnode&&!i.vnode.hasLoaded?i.vnode.checkChildren().then(()=>this.updateOpen(e,t)):n&&n.length&&(i.isOpen=t,i.isOpen?this.openCache.add(e):this.openCache.delete(e),this.updateVnodeState(e))},updateVnodeState(e){const t=this.nodes[e];t&&t.vnode&&(t.vnode.isSelected=t.isSelected,t.vnode.isIndeterminate=t.isIndeterminate,t.vnode.isActive=t.isActive,t.vnode.isOpen=t.isOpen)},isExcluded(e){return!!this.search&&this.excludedItems.has(e)}},render(e){const t=this.items.length?this.items.filter(e=>!this.isExcluded(Object(H["p"])(e,this.itemKey))).map(e=>{const t=te.options.methods.genChild.bind(this);return t(e,Object(H["p"])(e,this.itemDisabled))}):this.$slots.default;return e("div",{staticClass:"v-treeview",class:{"v-treeview--hoverable":this.hoverable,"v-treeview--dense":this.dense,...this.themeClasses}},t)}}),ae=Object(j["a"])(B,r,o,!1,null,null,null),ce=ae.exports;x()(ae,{VBtn:_["a"],VCard:S["a"],VCardActions:C["a"],VCardText:C["b"],VCardTitle:C["c"],VDialog:w["a"],VIcon:M["a"],VList:q["a"],VListItem:R["a"],VListItemTitle:W["c"],VMenu:X["a"],VSpacer:V["a"],VTooltip:Y["a"],VTreeview:oe});var le=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("ide",{staticClass:"code-editor",attrs:{value:e.code,language:e.language},on:{input:function(t){return e.updateCode(t)}}})},de=[],ue=i("9f4c"),he={components:{Ide:ue["a"]},data:function(){return{autoSaveTimeout:null}},computed:{settings:function(){var e=this.$FeathersVuex.api.Setting,t=e.findInStore({query:{key:"editor"}}),i=t.data;if(i[0])return i[0].value;var n=new e({key:"editor"});return n.save(),n.value},currentFile:function(){var e=this.$FeathersVuex.api.File;return e.findInStore({query:{uuid:this.$store.getters.currentFile}}).data[0]||{}},code:function(){return p()(this.currentFile,"editor.body")||p()(this.currentFile,"body")||""},language:function(){switch(p()(this.currentFile,"contentType","text/plain")){case"text/x-arduino":case"text/x-c":return"cpp";case"text/markdown":return"markdown";default:return""}}},methods:{updateCode:function(e){u()(this.currentFile,"editor.body",e),this.currentFile.save()},save:function(e){var t,i=this.$FeathersVuex.api.File,n=e||i.findInStore({query:{uuid:this.$store.getters.currentFile}}).data[0]||{};"string"===typeof(null===n||void 0===n||null===(t=n.editor)||void 0===t?void 0:t.body)&&(u()(n,"body",p()(n,"editor.body")),u()(n,"editor.body",null),n.save())},autoSave:function(){var e=this,t=this.$FeathersVuex.api.File,i=t.findInStore({query:{projectId:this.$store.getters.currentProject}}).data;this.settings.autoSaveInterval&&i.forEach((function(t){return e.save(t)})),this.autoSaveTimeout=setTimeout((function(){return e.autoSave()}),1e3*(this.settings.autoSaveInterval||10))}},mounted:function(){this.autoSave()},beforeDestroy:function(){this.autoSaveTimeout&&clearTimeout(this.autoSaveTimeout)}},pe=he,me=(i("1604"),Object(j["a"])(pe,le,de,!1,null,null,null)),ve=me.exports,fe=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("v-list",{style:{padding:"0"},attrs:{dense:""}},[e.currentItem?i("v-list-item",{attrs:{color:"primary"}},[i("v-list-item-title",[e._v(e._s(e.get(e.currentItem,e.itemText)))])],1):e._e(),e._l(e.items,(function(t){return i("v-list-item",{key:t.uuid,on:{click:function(i){return e.setCurrent(t)}}},[i("v-list-item-title",[e._v(e._s(e.get(t,e.itemText)))])],1)})),e.currentItem||e.items.length?i("v-divider"):e._e(),i("v-list-item",{attrs:{to:e.manageLink}},[i("v-list-item-title",[e._v(e._s(e.manageLabel))])],1)],2)},ge=[],be=i("3835"),je={$sort:{"meta.currentAt":-1},$limit:5},ye={props:{service:{type:String,default:"boards"},manageLabel:{type:String,default:"Boards Manager..."},manageLink:{type:String,default:"/tools/boards"},itemText:{type:String,default:"name"}},data:function(){return{get:p.a}},computed:{modelName:function(){return this.$FeathersVuex.api.byServicePath[this.service].modelName},findItems:function(){return this.service?this.$store.getters["".concat(this.service,"/find")]:function(){return{data:[]}}},currentItem:function(){var e;if(this.service){var t=Object(be["a"])(this.$store.getters["".concat(this.service,"/find")]({query:{uuid:this.$store.getters["current".concat(this.modelName)]}}).data,1);e=t[0]}return e},items:function(){var e=this;return this.findItems({query:je}).data.filter((function(t){return!e.currentItem||t.uuid!==e.currentItem.uuid}))}},methods:{setCurrent:function(e){return this.$store.commit("setCurrent".concat(this.modelName),e.uuid)}},mounted:function(){this.service&&this.$store.dispatch("".concat(this.service,"/find"),{query:je})}},xe=ye,_e=i("ce7e"),Se=Object(j["a"])(xe,fe,ge,!1,null,null,null),Ce=Se.exports;x()(Se,{VDivider:_e["a"],VList:q["a"],VListItem:R["a"],VListItemTitle:W["c"]});var Oe=i("077d"),we=function(){var e=this,t=e.$createElement,i=e._self._c||t;return i("v-row",{staticClass:"px-3"},[i("v-col",{attrs:{cols:"auto"}},[i("v-tooltip",{attrs:{top:""},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-btn",e._g({directives:[{name:"show",rawName:"v-show",value:!!e.project.uuid,expression:"!!project.uuid"}],attrs:{icon:"",loading:e.exportLoading},on:{click:e.exportProject}},n),[i("v-icon",[e._v("mdi mdi-folder-download-outline")])],1)]}}])},[i("span",[e._v("Export Project (Save)")])])],1),i("v-col",{attrs:{cols:"auto"}},[i("save-project",{attrs:{"import-project":""},scopedSlots:e._u([{key:"activator",fn:function(t){var n=t.on;return[i("v-tooltip",{attrs:{top:""},scopedSlots:e._u([{key:"activator",fn:function(t){var s=t.on;return[i("v-btn",e._g({attrs:{icon:""}},Object.assign({},s,n)),[i("v-icon",[e._v("mdi mdi-folder-upload-outline")])],1)]}}],null,!0)},[i("span",[e._v("Import Project (Open)")])])]}}])})],1)],1)},Ie=[],ke=i("94d0"),Ve={components:{SaveProject:ke["a"]},props:{project:{type:Object,default:function(){return{}}}},data:function(){return{exportLoading:!1}},methods:{exportProject:function(){var e=this;return Object(f["a"])(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){while(1)switch(t.prev=t.next){case 0:return e.exportLoading=!0,t.next=3,e.$bundler.exportProject(e.project);case 3:e.exportLoading=!1;case 4:case"end":return t.stop()}}),t)})))()}}},$e=Ve,Fe=Object(j["a"])($e,we,Ie,!1,null,null,null),Pe=Fe.exports;x()(Fe,{VBtn:_["a"],VCol:O["a"],VIcon:M["a"],VRow:I["a"],VTooltip:Y["a"]});var Te={components:{FilesTree:ce,FilesEditor:ve,FilesAddFile:P,FilesAddFolder:N,RecentList:Ce,ProjectManager:Oe["a"],ProjectSyncTools:Pe},computed:{currentProject:function(){return this.$store.getters["projects/find"]({query:{uuid:this.$store.getters.currentProject}}).data[0]}}},Ae=Te,Le=i("1800"),Ee=i("f6c4"),De=i("f774"),Ne=Object(j["a"])(Ae,n,s,!1,null,null,null);t["default"]=Ne.exports;x()(Ne,{VBtn:_["a"],VDivider:_e["a"],VIcon:M["a"],VListItem:R["a"],VListItemAction:Le["a"],VListItemTitle:W["c"],VMain:Ee["a"],VMenu:X["a"],VNavigationDrawer:De["a"],VTooltip:Y["a"]})},fa9e:function(e,t,i){}}]);
//# sourceMappingURL=code.662ea52d.js.map
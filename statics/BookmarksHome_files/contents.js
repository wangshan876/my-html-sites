var draggedItem;

function mysleep(ms) {
  return new Promise((res)=>{setTimeout(res, ms);});
}

$(function() {
    var param = location.search.split("%3A");
    if (param[1] == "config") {
        location.href = "options.html";
        return;
    }
    else if (param[1] && param[1] != "home") {
        alert("unsupported: "+param[1]);
        return;
    }
    var prefs = {
        "columns": "3",
        "favicon": false,
        "targetblank": false,
        "breadcrumb": false,
        "sortable": false,
        "sortitems": false,
        "style_css": "",
        "style_mode": "css_whole",
        "inc_folder": false,
        "view_category": ["unfiled_____","toolbar_____","menu________","mobile______"],
        "checked_folders": []
    };
    var folderSet = new Array();

    browser.storage.local.get(prefs)
    .then( (vals) => {
        if (vals.columns) {
            prefs.columns = vals.columns;
        }
        if (vals.favicon) {
            prefs.favicon = vals.favicon;
        }
        if (vals.targetblank) {
            prefs.targetblank = vals.targetblank;
        }
        if (vals.breadcrumb) {
            prefs.breadcrumb = vals.breadcrumb;
        }
        if (vals.sortable) {
            prefs.sortable = vals.sortable;
        }
        if (vals.sortitems) {
            prefs.sortitems = vals.sortitems;
        }
        if (vals.style_css) {
            prefs.style_css = vals.style_css;
            prefs.style_mode = vals.style_mode;
        }
        if (vals.inc_folder) {
            prefs.inc_folder = (vals.inc_folder == "inc");
        }
        if (vals.view_category) {
            prefs.view_category = vals.view_category;
        }
        if (vals.checked_folders) {
            prefs.checked_folders = vals.checked_folders;
        }

        if (prefs.style_mode == "css_partial") {
            $("#partial_style").html(prefs.style_css);
        }
        else {
            $("#partial_style").html("");
            if (prefs.style_css) {
                $("#whole_style").html(prefs.style_css);
            }
            else {
                $.ajax({ url: "templ/css/default.css", mimeType: "text/css"})
                .done( function(data) {
                    document.getElementById("whole_style").textContent = data;
                });
            }
        }
        var bgcol = document.defaultView.getComputedStyle(document.body, null).backgroundColor;
        var acss = $("<style>#loader::after {background:"+bgcol+";}</style>");
        $("head").append(acss);

        console.time('bookmarkshome.getTree');
        return browser.bookmarks.getTree();
    })
    .then( (treeNodes) => {
        console.timeEnd('bookmarkshome.getTree');
        console.time('bookmarkshome.make_nodes');
        var nodes = treeNodes[0].children;
        for (var i=0; i < prefs.view_category.length; i++) {
            var node;
            for(var j=0; j < nodes.length; j++) {
                if (nodes[j].id == prefs.view_category[i]) {
                    node = nodes[j];
                    break;
                }
            }
            if (node) {
                digFolder(node, prefs, folderSet, "");
            }
        }
        console.timeEnd('bookmarkshome.make_nodes');

        var ncol = prefs.columns;
        var tds =new Array(ncol);
        var w = Math.floor(100/ncol);
        var tr = document.getElementById("container");
        for (let i=0; i < ncol ;i++) {
            var d = document.createElement("td");
            d.className = "column";
            d.id = "c_"+i;
            d.setAttribute("width", w+"%");
            tr.appendChild(d);
            tds[i] = tr.lastChild;
        }

        // setting layout
        browser.storage.local.get("folder_layout")
        .then( (v) => {
            if( v.folder_layout ) {
                var order = v.folder_layout.split(",");
                var col = order.shift();
                if (ncol == col) {
                    console.time('bookmarkshome.replaceProc');
                    var idmap = new Map();
                    for (let i=0; i < folderSet.length; ++i) {
                        idmap.set(folderSet[i].id, i);
                    }
                    order.forEach( function(item) {
                        var folders = item.split("#");
                        //var td = $("#"+folders[0]);
                        //var elm = $("#"+folders[1]);
                        var td = document.getElementById(folders[0]);
                        var id = idmap.get(folders[1]);
                        if( td && id !== undefined ) {
                            td.appendChild(folderSet[id]);
                            folderSet[id] = null;
                        }
                    });
                    console.timeEnd('bookmarkshome.replaceProc');
                }
                else {
                    browser.storage.local.remove("folder_layout")
                    console.log("folder_layout col != ncol");
                }
            }
            auto_layout(folderSet, tds, prefs.sortable, prefs.sortitems);
        },
        (e) => {
            auto_layout(folderSet, tds, prefs.sortable, prefs.sortitems);
        });
        $("#loader").css("animation-play-state","paused");
        $("#loader").hide();
    },
    (e) => {
        $("#loader").css("animation-play-state","paused");
    });
    
    browser.runtime.onMessage.addListener((req) => {
        if (req.mode == "save") {
            saveAsHtml();
        }
        else {
            if ((req.mode == "mod" || req.mode == "del") && req.id) {
                var elm = browser.menus.getTargetElement(req.id);
                if (elm) {
                    elm = elm.parentNode;
                    if (elm.tagName == "A")
                        elm = elm.parentNode;
                    var id = elm.id.substr(2);
                    browser.bookmarks.get(id)
                    .then(nodes => {
                        var id = "#a_"+nodes[0].id;
                        if (req.mode == "del") {
                            browser.bookmarks.remove(nodes[0].id);
                            $(id).remove();
                        }
                        else if (req.mode == "mod") {
                            modify_property(nodes[0]);
                        }
                    });
                    return;
                }
            }
            browser.bookmarks.search({url:req.url}) //, title:req.title})
            .then((nodes) => {
                var id = "#a_"+nodes[0].id;
                if (req.mode == "del") {
                    browser.bookmarks.remove(nodes[0].id);
                    $(id).remove();
                }
                else if (req.mode == "mod") {
                    modify_property(nodes[0]);
                }
            });
        }
    });

    $("#top_bar").click(function() {
        $("#search-bar").slideDown(200, function(){ $("#top_bar").css("display","none"); });
    });
    $("#search-bar").click(function() {
        $("#search-bar").slideUp(150, function(){ $("#top_bar").css("display","block"); });
    });
    $("#search-box").click(function(){return false;});
    $("#search-box").on("keyup", function () {
        var val =  $("#search-box").val().toLowerCase();
        $("a").each(function() {
            var text = $(this).text().toLowerCase();
            (text.indexOf(val) >= 0) ? $(this).show() : $(this).hide();  
        });
        $(".folder").each(function() {
            var wrap = $(this);
            if(wrap.find("a:visible").length == 0) {
                wrap.css({ 'visibility': 'hidden', 'height': '0' });
            } else {
                wrap.css({'visibility' :'visible', 'height': 'auto'});
            }
        });
    });
    $("#search-clr").click(function(){
        $("#search-box").val("");
        $("a").each(function() { $(this).show(); });
        $(".folder").each(function() {
            $(this).css({'visibility' :'visible', 'height': 'auto'});
        });
        return false;
    });
    $("#gear-icon").click(function(){
        openConfig();
        return false;
    });
});

async function auto_layout(folderSet, tds, sort_folders, sort_items) {
    var ncol = tds.length;
    var h = new Array(ncol);
    var preH = 0;
    for(let i=0; i < ncol ;i++) {
        if (tds[i].lastChild) {
            var item = tds[i].lastChild;
            h[i] = item.offsetTop + item.offsetHeight;
            if (preH < h[i]) preH = h[i];
        }
        else {
            h[i] = 0;
        }
    }

    console.time('bookmarkshome.layoutProc');
    console.time('bookmarkshome.layoutProcSub');
    var m = 0;
    var divH = document.documentElement.clientHeight*2;
    for (let i=0; i < folderSet.length; ++i) {
        var item = folderSet[i];
        if (item == null) continue;
        var hmin = h[0];
        m = 0;
        for(var k=1; k < ncol ;k++) {
            if (h[k] < hmin) {
                hmin = h[k];
                m = k;
            }
        }
        tds[m].appendChild(item);
        h[m] = item.offsetTop + item.offsetHeight;
        // progress rendering
        if ((hmin - preH) > divH) {
            await mysleep(5);
            if (preH == 0) {
                $("#loader").css("animation-play-state","paused");
                $("#loader").hide();
                divH *= 2;
                console.timeEnd('bookmarkshome.layoutProcSub');
            }
            preH = h[m];
        }
    }
    console.timeEnd('bookmarkshome.layoutProc');

    // jquery-ui sortable interface
    if (sort_folders) {
        $(".column").sortable({
            connectWith: ['.column']
            ,distance: 8
            ,handle: 'h2'
            ,stop: function(){
                var data=[ncol];
                $(".folder").each(function(i,v){
                    data.push($(v).parent()[0].id+"#"+v.id);
                });
                browser.storage.local.set({"folder_layout": data.toString()});
            }
        });
        //$(".folder").addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all");
    }
    if (sort_items) {
        $("ul").sortable({
            connectWith: ['ul']
            ,items: "li"
            ,distance: 8
            ,placeholder: 'ui-li-hover'
            ,helper: "clone"
            ,start: function(ev,ui) {
                setDraggingSrc(ui.item.get(0));
            }
            ,update: function(ev,ui) {
                moveBookmarkItem(ev.target);
            }
        });
    }
}

function openConfig() {
    var opt_url = browser.extension.getURL("/options.html");
    browser.tabs.query({currentWindow: true})
    .then((t) => {
        var id = undefined;
        for (var i=0; i < t.length; i++) {
            if (t[i].url == opt_url) {
                id = t[i].id;
                break;
            }
        }
        if (id) {
            return browser.tabs.update(id, { "url":opt_url, "active":true});
        }
        else {
            return browser.tabs.create({ "url": opt_url });
        }
    });
}

function digFolder(nodes, opts, folderSet, preTitle) {
    if (nodes.type != "folder") {
        return;
    }
    var id = "f_"+nodes.id;
    var flag = !opts.inc_folder;
    if( opts.checked_folders.length && opts.checked_folders.indexOf(id) >= 0 ) {
        flag = opts.inc_folder;
    }

    var title = "";
    if (opts.breadcrumb && preTitle != "" ) {
        title = preTitle + " > ";
    }
    title += nodes.title;
    if (flag) {
        var folder = document.createElement("div");
        folder.id = "f_"+nodes.id;
        folder.className = "folder";
        var h2 = document.createElement("h2");
        h2.appendChild(document.createTextNode(title));
        folder.appendChild(h2);

        var nodeUL = document.createElement("ul");
        nodeUL.id = "folder_"+nodes.id;
        var cnt = 0;
        for(var i=0; i < nodes.children.length; i++) {
            var child = nodes.children[i];
            if (child.type == "folder") {
                ;
            }
            else if (child.type == "separator") {
                if (nodeUL.childNodes.length > 0) {
                    var hr = document.createElement("hr");
                    hr.className = "separator";
                    hr.id = "a_"+child.id;
                    nodeUL.appendChild(hr);
                }
            }
            else if (!child.url.startsWith("place:")) {
                nodeUL.appendChild( makeBookmarkItem(child, opts) );
                cnt++;
            }
        }
        if (cnt > 0) {
            folder.appendChild(nodeUL);
            folderSet.push(folder);
        }
    }
    if (nodes.id == "menu________") {
        title = "";
    }
    for(var i=0; i < nodes.children.length; i++) {
        var child = nodes.children[i];
        if (child.type == "folder") {
            digFolder(child, opts, folderSet, title);
        }
    }
}

function makeBookmarkItem(node, opts) {
    var item = document.createElement("li");
    item.id = "a_"+node.id;
    var img = null;
    var uri = node.url;
    if( uri.match(/[^\\]"/) ) {
        uri = uri.replace(/"/g, "%22");
        uri = uri.replace(/'/g, "%27");
    }

    if( opts.favicon ) {
        /* In the Firefox version, to resolve favicons,
         * www.google.com/s2/favicons?domain_url= is used.
         * Firefox still does not support chrome://favicon/ at the moment.
         */
        var hostname;
        if (uri.indexOf("://") > -1) {
            hostname = uri.split('/')[2];
        }
        else {
            hostname = uri.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
        img = document.createElement("img");
        img.className = "favicon";
        img.src = 'https://s2.googleusercontent.com/s2/favicons?domain_url=' + hostname;
        item.className = "favnode";
    }
    else {
        item.className = "defnode";
    }
    var link = document.createElement("a");
    link.href = uri;
    if (opts.targetblank) {
        link.setAttribute("target", "_blank");
    }
    if (img) {
        link.appendChild(img);
    }
    if( node.title == "" ) {
        link.appendChild(document.createTextNode("(no title)"));
    }
    else {
        link.appendChild(document.createTextNode(node.title));
    }
    item.appendChild(link);
    
    return item;
}

function setDraggingSrc(obj) {
    var folder = obj.parentNode;
    var pos=-1;
    for(var i=0; i < folder.childNodes.length; i++) {
        if( folder.childNodes[i].id == obj.id ) {
            pos = i;
            break;
        }
    }
    draggedItem = obj.parentNode.id+":"+obj.id+":"+pos;
    //console.log("dragging... "+draggedItem);
}

function moveBookmarkItem(folder) {
    var ids = draggedItem.split(":");
    var id = ids[1].substr(2);
    var pos=-1;
    for(var i=0; i < folder.childNodes.length; i++) {
        if( folder.childNodes[i].id == ids[1] ) {
            pos = i;
            break;
        }
    }
    if (pos < 0) {
        return;
    }
    var f_id = folder.id.substr(7);
    var opt = { parentId: f_id };
    if (ids[0] == folder.id && pos > ids[2]) {
        pos--;
    }
    else if (pos == folder.childNodes.length-1) {
        browser.bookmarks.move(id, {parentId: f_id});
        return;
    }
    else {
        pos++;
    }
    var nid = folder.childNodes[pos].id.substr(2);
    /*
    browser.bookmarks.get(nid)
    .then((b) => {
        opt.index = b[0].index;
        browser.bookmarks.move(id, opt);
    });
    */
    browser.bookmarks.getChildren(f_id, function(nodes){
        for(var i=0; i < nodes.length; i++) {
            if (nodes[i].id == nid) {
                opt.index = i;
                break;
            }
        }
        //console.log(pos+": "+nid+"("+opt.index+")");
        browser.bookmarks.move(id, opt);
        /*
        browser.bookmarks.move(id, opt,
            function(){browser.bookmarks.getChildren(f_id,
                function(n){ console.log(n);
            });
        });
        */
    });
}

function modify_property(node) {
    $("#prop_title").val(node.title);
    $("#prop_url").val(node.url);
    $("#prop_modify").click(function() {
        var title = $("#prop_title").val();
        var url = $("#prop_url").val();
        browser.bookmarks.update(node.id, {"title": title, "url": url});
        var anode = document.getElementById("a_"+node.id).firstChild;
        anode.href = url;
        anode.lastChild.nodeValue = title;
        $("#prop_dialog").css("display","none");
    });
    $("#prop_cancel").click(function() {
        $("#prop_dialog").css("display","none");
    });
    $("#prop_dialog").css("display", "block");
}

function saveAsHtml() {
    var doc = $("html").clone();
    doc.find("script").remove();
    doc.find("#prop_dialog").remove();
    var txt = "<html>" + doc.html() + "</html>";
    var blob = new Blob([txt], {type:"text/plain;charset=utf-8"});
    var fileContent = URL.createObjectURL(blob);
    browser.downloads.download({
        filename: "mybookmarks.html",
        saveAs: true,
        url: fileContent
    });
}
